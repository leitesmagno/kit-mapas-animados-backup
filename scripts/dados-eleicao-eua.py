#!/usr/bin/env python3
"""Dados dos trechos de mapa "eleicao-eua" (usados dentro do vídeo 015 do Estúdio 3D: as midterms
de 03/11/2026 explicadas e comparadas com o Brasil).

    npm run dados -- eleicao-eua

  estados    os 50 estados dos EUA (Censo dos EUA, arquivo cartográfico 1:20 milhões, domínio
             público), marcando quem elege senador e quem elege governador em 2026 → dados/estados-eua.json
  distritos  os 435 distritos da Câmara (Censo dos EUA, 119º Congresso, 1:20 milhões) → dados/distritos-eua.json
  brasil     o Brasil e a Bahia, copiados do trecho distrital-bahia (IBGE) → dados/brasil.json, ba.json
"""
import io
import json
import os
import shutil
import struct
import sys
import zipfile

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas.comum import arredondar, baixar, gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "eleicao-eua", "dados")
CENSO = "https://www2.census.gov/geo/tiger/GENZ2024/shp/"

# 33 vagas regulares (classe 2) + as especiais da Flórida e de Ohio = 35 (Al Jazeera, 26/10/2026)
SENADO = {"AL", "AK", "AR", "CO", "DE", "GA", "ID", "IL", "IA", "KS", "KY", "LA", "ME", "MA", "MI", "MN", "MS", "MT", "NE", "NH", "NJ", "NM", "NC", "OK", "OR", "RI", "SC", "SD", "TN", "TX", "VA", "WV", "WY", "FL", "OH"}
# 36 estados com eleição para governador em 2026
GOVERNADOR = {"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "FL", "GA", "HI", "ID", "IL", "IA", "KS", "ME", "MD", "MA", "MI", "MN", "NE", "NV", "NH", "NM", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "VT", "WI", "WY"}


def ler_shapefile(nome_zip):
    """Leitor mínimo de shapefile de polígonos (.shp + .dbf), sem biblioteca extra."""
    z = zipfile.ZipFile(io.BytesIO(baixar(CENSO + nome_zip, cache=nome_zip)))
    base = nome_zip[:-4]
    shp = z.read(base + ".shp")
    dbf = z.read(base + ".dbf")
    # .dbf: cabeçalho, campos de 32 bytes, depois os registros de tamanho fixo
    n, tam_cab, tam_reg = struct.unpack("<IHH", dbf[4:12])
    campos, pos = [], 32
    while dbf[pos] != 0x0D:
        nome = dbf[pos:pos + 11].split(b"\0")[0].decode()
        campos.append((nome, dbf[pos + 16]))
        pos += 32
    attrs = []
    for i in range(n):
        r = dbf[tam_cab + i * tam_reg + 1: tam_cab + (i + 1) * tam_reg]
        a, p = {}, 0
        for nome, t in campos:
            a[nome] = r[p:p + t].decode("latin-1").strip()
            p += t
        attrs.append(a)
    # .shp: registros de polígono (tipo 5), anéis em sequência
    feats, pos, i = [], 100, 0
    while pos < len(shp):
        _, tam = struct.unpack(">II", shp[pos:pos + 8])
        rec = shp[pos + 8: pos + 8 + tam * 2]
        pos += 8 + tam * 2
        if struct.unpack("<i", rec[:4])[0] != 5:
            i += 1
            continue
        npartes, npontos = struct.unpack("<ii", rec[36:44])
        partes = list(struct.unpack(f"<{npartes}i", rec[44:44 + 4 * npartes])) + [npontos]
        pts = struct.unpack(f"<{2 * npontos}d", rec[44 + 4 * npartes: 44 + 4 * npartes + 16 * npontos])
        aneis = [[[pts[2 * k], pts[2 * k + 1]] for k in range(partes[j], partes[j + 1])] for j in range(npartes)]
        feats.append((attrs[i], aneis))
        i += 1
    return feats


def para_geojson(aneis):
    """Anéis do shapefile (externo no sentido horário, buracos no anti-horário) → MultiPolygon."""
    from shapely.geometry import MultiPolygon, Polygon, mapping
    from shapely.ops import unary_union

    externos, buracos = [], []
    for a in aneis:
        area = sum(a[k][0] * a[k + 1][1] - a[k + 1][0] * a[k][1] for k in range(len(a) - 1))
        (externos if area < 0 else buracos).append(Polygon(a))
    g = unary_union(externos)
    for b in buracos:
        g = g.difference(b)
    g = g.buffer(0)
    if g.geom_type == "Polygon":
        g = MultiPolygon([g])
    m = mapping(g)
    return {"type": m["type"], "coordinates": arredondar(json.loads(json.dumps(m["coordinates"])))}


FIPS_50 = None


def estados():
    global FIPS_50
    feats = ler_shapefile("cb_2024_us_state_20m.zip")
    saida = []
    for a, aneis in feats:
        uf = a["STUSPS"]
        if uf in {"DC", "PR"} or int(a["STATEFP"]) > 56:
            continue
        saida.append({"type": "Feature", "properties": {"uf": uf, "nome": a["NAME"], "fips": a["STATEFP"], "senado": uf in SENADO, "governador": uf in GOVERNADOR}, "geometry": para_geojson(aneis)})
    FIPS_50 = {f["properties"]["fips"] for f in saida}
    gravar_json(os.path.join(DADOS, "estados-eua.json"), {"type": "FeatureCollection", "features": saida})
    print(f"estados: {len(saida)} · senado {sum(f['properties']['senado'] for f in saida)} · governador {sum(f['properties']['governador'] for f in saida)}")


def distritos():
    if FIPS_50 is None:
        estados()
    feats = ler_shapefile("cb_2024_us_cd119_20m.zip")
    saida = []
    for a, aneis in feats:
        if a["STATEFP"] not in FIPS_50:
            continue
        saida.append({"type": "Feature", "properties": {"id": a["GEOID"], "fips": a["STATEFP"], "cd": a.get("CD119FP", "")}, "geometry": para_geojson(aneis)})
    gravar_json(os.path.join(DADOS, "distritos-eua.json"), {"type": "FeatureCollection", "features": saida})
    print(f"distritos: {len(saida)}")


def brasil():
    orig = os.path.join(AQUI, "src", "videos", "distrital-bahia", "dados")
    for nome in ("brasil.json", "ba.json"):
        shutil.copy(os.path.join(orig, nome), os.path.join(DADOS, nome))
    print("brasil.json, ba.json (do distrital-bahia)")


ETAPAS = {"estados": estados, "distritos": distritos, "brasil": brasil}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
