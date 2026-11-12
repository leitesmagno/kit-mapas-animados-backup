"""OpenStreetMap pelo Overpass: lagoa, rio, ilha, parque, o que o IBGE não tem.

Licença: ODbL. Creditar "© OpenStreetMap contributors" — na tela ou na descrição do vídeo.

O Overpass devolve os trechos soltos de uma relação; quem fecha os anéis é a `costurar`.
"""
import json
import urllib.parse

from .comum import arredondar, baixar

OVERPASS = "https://overpass-api.de/api/interpreter"


def consulta(overpass_ql, cache=None):
    """Roda uma consulta Overpass QL e devolve o JSON."""
    return json.loads(baixar(OVERPASS, dados=urllib.parse.urlencode({"data": overpass_ql}).encode(), cache=cache))


def costurar(trechos):
    """Junta os trechos de uma relação multipolígono em anéis fechados."""
    trechos = [list(t) for t in trechos]
    aneis = []
    while trechos:
        anel = trechos.pop(0)
        while anel[0] != anel[-1]:
            for i, t in enumerate(trechos):
                if t[0] == anel[-1]:
                    anel += t[1:]
                elif t[-1] == anel[-1]:
                    anel += t[::-1][1:]
                elif t[-1] == anel[0]:
                    anel = t[:-1] + anel
                elif t[0] == anel[0]:
                    anel = t[::-1][:-1] + anel
                else:
                    continue
                trechos.pop(i)
                break
            else:
                raise RuntimeError("o anel não fecha — a relação pode estar incompleta no OSM")
        aneis.append(anel)
    return aneis


def _dentro(pt, anel):
    x, y, c = pt[0], pt[1], False
    for (x1, y1), (x2, y2) in zip(anel, anel[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def multipoligono(relacao, nome=None, cache=None):
    """Uma relação do OSM (lagoa, ilha, parque) como Feature de MultiPolygon."""
    d = consulta(f"[out:json][timeout:120];relation({relacao});out geom;", cache=cache or f"osm_{relacao}.json")
    rel = d["elements"][0]
    externos = costurar([[(p["lon"], p["lat"]) for p in m["geometry"]] for m in rel["members"] if m["type"] == "way" and m["role"] == "outer"])
    internos = costurar([[(p["lon"], p["lat"]) for p in m["geometry"]] for m in rel["members"] if m["type"] == "way" and m["role"] == "inner"])
    poligonos = [[e] for e in externos]
    for i in internos:  # cada ilha vai para o contorno que a contém
        for p in poligonos:
            if _dentro(i[0], p[0]):
                p.append(i)
                break
    propriedades = {"nome": nome or rel.get("tags", {}).get("name", str(relacao)), "fonte": "© OpenStreetMap contributors (ODbL)"}
    return {
        "type": "FeatureCollection",
        "features": [{"type": "Feature", "properties": propriedades, "geometry": {"type": "MultiPolygon", "coordinates": arredondar([[list(map(list, a)) for a in p] for p in poligonos])}}],
    }
