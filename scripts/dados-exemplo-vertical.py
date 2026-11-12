#!/usr/bin/env python3
"""Dados do vídeo de EXEMPLO vertical ("Amazonas", src/videos/exemplo-vertical) — o MOLDE do script de
dados de um vídeo novo: copie para scripts/dados-<pasta>.py e troque o que é do Amazonas.

    npm run dados -- exemplo-vertical                  # tudo
    npm run dados -- exemplo-vertical cidades          # só uma etapa

Só este script usa internet; o render lê os JSON locais.

  estado      o Amazonas e o contorno do Brasil (IBGE, malha intermediária) → dados/am.json, brasil.json
  municipios  os 62 municípios do AM, com o nome (IBGE) → dados/municipios.json
  cidades     a sede e a população (estimativa IBGE 2026) de cada município → dados/cidades.json
  areas       o Parque Nacional de Anavilhanas e a Terra Indígena Vale do Javari (OSM, pelo Nominatim)
  lugares     os contornos do Teatro, do Mercado, da Ponta Negra, do Bumbódromo e do Parque do Pico da
              Neblina (OSM) → dados/lugares.json
  br319       a BR-319, de Manaus a Porto Velho (OSM, pelo Overpass) → dados/br319.json
  rios        o Amazonas/Solimões (da Amazônia peruana à foz), o Negro, o Madeira, o Purus, o Juruá e o
              Japurá (Natural Earth) → dados/rios.json
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge, osm  # noqa: E402
from mapas.comum import baixar, gravar_json  # noqa: E402

# o servidor principal do Overpass vive dando 504: um espelho
osm.OVERPASS = os.environ.get("OVERPASS", "https://overpass-api.de/api/interpreter")
DADOS = os.path.join(AQUI, "src", "videos", "exemplo-vertical", "dados")
UF = "13"
NE = os.path.join(AQUI, "node_modules", ".cache", "natural-earth")


def _aneis(g):
    return [p[0] for p in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]])]


def _natural_earth(nome):
    os.makedirs(NE, exist_ok=True)
    caminho = os.path.join(NE, nome + ".geojson")
    if not os.path.exists(caminho):
        open(caminho, "wb").write(baixar("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/" + nome + ".geojson"))
    return json.load(open(caminho, encoding="utf-8"))


def _km2(geom):
    """Área em km²: o contorno projetado na azimutal de igual área de Lambert centrada nele (esfera de
    raio autálico, 6.371,007 km); para um estado ou um país o erro fica abaixo de 0,1%."""
    from math import cos, radians, sin, sqrt

    from shapely.ops import transform

    R = 6371.0072
    lon0, lat0 = radians(geom.centroid.x), radians(geom.centroid.y)

    def lambert(x, y, z=None):
        lo, la = [radians(v) for v in x], [radians(v) for v in y]
        xs, ys = [], []
        for a, b in zip(lo, la):
            k = sqrt(2 / (1 + sin(lat0) * sin(b) + cos(lat0) * cos(b) * cos(a - lon0)))
            xs.append(R * k * cos(b) * sin(a - lon0))
            ys.append(R * k * (cos(lat0) * sin(b) - sin(lat0) * cos(b) * cos(a - lon0)))
        return xs, ys

    return transform(lambert, geom).area


def estado():
    am = ibge.malha("estados", UF, qualidade="intermediaria")
    br = ibge.malha("paises", "BR", qualidade="intermediaria")
    gravar_json(os.path.join(DADOS, "am.json"), am)
    gravar_json(os.path.join(DADOS, "brasil.json"), br)
    from shapely.geometry import shape

    print(f"am.json ({_km2(shape(am['features'][0]['geometry'])):,.0f} km² pelo contorno), brasil.json")


def municipios():
    fc = ibge.malha("estados", UF, qualidade="intermediaria", intrarregiao="municipio")
    nomes = {m["id"]: m["nome"] for m in json.loads(baixar(f"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios"))}
    for f in fc["features"]:
        cod = f["properties"]["codarea"]
        f["properties"] = {"codigo": cod, "nome": nomes[int(cod)]}
    gravar_json(os.path.join(DADOS, "municipios.json"), fc)
    print(f"municipios.json: {len(fc['features'])}")


def _sem_acento(s):
    import unicodedata

    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def cidades():
    mun = json.load(open(os.path.join(DADOS, "municipios.json"), encoding="utf-8"))["features"]
    url = f"https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2026/variaveis/9324?localidades=N6%5BN3%5B{UF}%5D%5D"
    pops = {r["localidade"]["id"]: int(r["serie"]["2026"]) for r in json.loads(baixar(url, cache="pop-municipios-am-2026.json"))[0]["resultados"][0]["series"]}
    lugares = osm.consulta('[out:json][timeout:180];area["ISO3166-2"="BR-AM"]->.a;node["place"~"^(city|town|village)$"](area.a);out;', cache="lugares-am.json")["elements"]
    saida, casadas = [], 0
    for f in mun:
        cod, nome = f["properties"]["codigo"], f["properties"]["nome"]
        cand = [e for e in lugares if _sem_acento(e.get("tags", {}).get("name", "")) == _sem_acento(nome) and any(osm._dentro((e["lon"], e["lat"]), a) for a in _aneis(f["geometry"]))]
        if cand:
            casadas += 1
            lon, lat = cand[0]["lon"], cand[0]["lat"]
        else:
            anel = max(_aneis(f["geometry"]), key=len)
            xs, ys = [c[0] for c in anel], [c[1] for c in anel]
            lon, lat = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        # o "meio" do município (o ponto de dentro mais longe da divisa)
        from shapely.geometry import shape
        from shapely.ops import polylabel

        g = shape(f["geometry"]).buffer(0)
        g = max(g.geoms, key=lambda p: p.area) if g.geom_type == "MultiPolygon" else g
        meio = polylabel(g, tolerance=0.01)
        # e mais pontos espalhados pela área do município (grade de 0,6°: os municípios do
        # Amazonas são enormes), para o interior não ficar vazio
        from shapely.geometry import Point
        from shapely.prepared import prep

        dentro = prep(g)
        x0, y0, x1, y1 = g.bounds
        passo = 0.6
        extras = []
        yy = y0 + passo / 2
        while yy < y1:
            xx = x0 + passo / 2 + (passo / 2 if int((yy - y0) / passo) % 2 else 0)
            while xx < x1:
                if dentro.contains(Point(xx, yy)) and Point(xx, yy).distance(meio) > passo * 0.6:
                    extras.append([round(xx, 3), round(yy, 3)])
                xx += passo
            yy += passo
        saida.append({"cod": cod, "nome": nome, "pop": pops[cod], "em": [round(lon, 4), round(lat, 4)], "meio": [round(meio.x, 4), round(meio.y, 4)], "extras": extras})
    saida.sort(key=lambda c: -c["pop"])
    gravar_json(os.path.join(DADOS, "cidades.json"), saida)
    print(f"pontos espalhados: {sum(len(c['extras']) for c in saida)}")
    print(f"cidades.json: {len(saida)} sedes ({casadas} do OSM), soma {sum(c['pop'] for c in saida):,}; maiores {[(c['nome'], c['pop']) for c in saida[:4]]}")


def _emendar(trechos):
    """Emenda os trechos de um rio pelas pontas mais próximas (o Natural Earth corta o rio em pedaços)."""
    trechos = [list(t) for t in trechos]
    trechos.sort(key=len, reverse=True)
    linha = trechos.pop(0)
    d = lambda a, b: ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
    while trechos:
        i, t = min(enumerate(trechos), key=lambda it: min(d(it[1][0], linha[-1]), d(it[1][-1], linha[-1]), d(it[1][0], linha[0]), d(it[1][-1], linha[0])))
        opcoes = [(d(t[0], linha[-1]), "fim", t), (d(t[-1], linha[-1]), "fim", t[::-1]), (d(t[-1], linha[0]), "ini", t), (d(t[0], linha[0]), "ini", t[::-1])]
        dist, lado, tt = min(opcoes, key=lambda o: o[0])
        if dist > 0.6:
            break
        linha = linha + tt if lado == "fim" else tt + linha
        trechos.pop(i)
    return linha


def rios():
    """Do Natural Earth 10m (domínio público), da nascente para a foz. O Amazonas vai inteiro (do Peru à
    foz): é o gancho ("atravessa o Amazonas inteiro"); os afluentes, só o trecho perto do estado."""
    from shapely.geometry import LineString

    dados = _natural_earth("ne_10m_rivers_lake_centerlines")

    def trechos(nome):
        saida = []
        for f in dados["features"]:
            if (f["properties"].get("name") or "") == nome:
                g = f["geometry"]
                saida += g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        return saida

    def montar(nome, rio_acima, corte=None):
        linha = _emendar(trechos(nome))
        if rio_acima(linha[0]) < rio_acima(linha[-1]):
            linha = linha[::-1]
        if corte:
            linha = [p for p in linha if corte(p)]
        g = LineString(linha).simplify(0.01)
        return [[round(x, 4), round(y, 4)] for x, y in g.coords]

    saida = {
        # o Amazonas corre de oeste para leste
        "amazonas": montar("Amazonas", lambda p: -p[0]),
        "negro": montar("Negro", lambda p: -p[0]),
        "madeira": montar("Madeira", lambda p: -p[1]),
        "purus": montar("Purús", lambda p: -p[1]),
        "jurua": montar("Juruá", lambda p: -p[1]),
        "japura": montar("Japurá", lambda p: -p[0]),
    }
    for k, v in saida.items():
        print(f"  {k}: {len(v)} pts, {v[0]} → {v[-1]}" if v else f"  {k}: VAZIO")
    gravar_json(os.path.join(DADOS, "rios.json"), saida)


def areas():
    """As áreas do OSM (ODbL), pelo Nominatim (o Overpass vive dando 502/504), simplificadas."""
    from shapely.geometry import mapping, shape

    RELACOES = {"anavilhanas": 3425635, "javari": 3816970}
    feats = []
    for chave, rel in RELACOES.items():
        caminho = os.path.join(AQUI, "node_modules", ".cache", "amazonas", f"{chave}-nominatim.json")
        if not os.path.exists(caminho):
            os.makedirs(os.path.dirname(caminho), exist_ok=True)
            open(caminho, "wb").write(baixar(f"https://nominatim.openstreetmap.org/lookup?osm_ids=R{rel}&format=json&polygon_geojson=1&polygon_threshold=0.001"))
        g = shape(json.load(open(caminho, encoding="utf-8"))[0]["geojson"]).buffer(0).simplify(0.003)
        feats.append({"type": "Feature", "properties": {"chave": chave, "km2": round(_km2(g)), "fonte": "© OpenStreetMap contributors (ODbL)"}, "geometry": mapping(g)})
        print(f"  {chave}: {_km2(g):,.0f} km², {g.geom_type}")
    gravar_json(os.path.join(DADOS, "areas.json"), {"type": "FeatureCollection", "features": feats})


def br319():
    """A BR-319 (Manaus → Porto Velho), pelo Overpass: os trechos da rodovia costurados numa linha só, de
    Manaus para o sul, simplificada."""
    from shapely.geometry import LineString

    r = osm.consulta('[out:json][timeout:180];way["highway"]["ref"~"BR-319"](-9.2,-64.5,-3.0,-59.5);out geom;', cache="br319-ways.json")
    trechos = [[(p["lon"], p["lat"]) for p in w["geometry"]] for w in r["elements"] if w.get("geometry")]
    linha = _emendar(trechos)
    # de Manaus (norte) para Porto Velho (sul)
    if linha[0][1] < linha[-1][1]:
        linha = linha[::-1]
    g = LineString(linha).simplify(0.005)
    pts = [[round(x, 4), round(y, 4)] for x, y in g.coords]
    print(f"  br319: {len(r['elements'])} trechos, {len(pts)} pts, {pts[0]} → {pts[-1]}, {g.length:.1f}°")
    gravar_json(os.path.join(DADOS, "br319.json"), pts)


def lugares():
    """Os CONTORNOS dos lugares que a narração aponta (o "marcar o lugar certinho" do usuário), do OSM (ODbL):
    o prédio do Teatro Amazonas e o do Mercado Adolpho Lisboa, a areia da Ponta Negra e o
    Parque Nacional do Pico da Neblina. Os prédios e a praia pela API do OSM (recortes pequenos; o Overpass
    vive fora do ar), os outros pelo Nominatim."""
    import xml.etree.ElementTree as ET

    from shapely.geometry import Polygon, mapping, shape

    def da_api(bbox, way, nome):
        caminho = os.path.join(AQUI, "node_modules", ".cache", "amazonas", f"osm-{nome}.xml")
        if not os.path.exists(caminho):
            os.makedirs(os.path.dirname(caminho), exist_ok=True)
            open(caminho, "wb").write(baixar("https://api.openstreetmap.org/api/0.6/map?bbox=" + ",".join(map(str, bbox))))
        r = ET.parse(caminho).getroot()
        nos = {n.get("id"): (float(n.get("lon")), float(n.get("lat"))) for n in r.findall("node")}
        w = next(w for w in r.findall("way") if w.get("id") == str(way))
        return Polygon([nos[nd.get("ref")] for nd in w.findall("nd")])

    def do_nominatim(ids):
        caminho = os.path.join(AQUI, "node_modules", ".cache", "amazonas", "lugares-nominatim.json")
        if not os.path.exists(caminho):
            open(caminho, "wb").write(baixar(f"https://nominatim.openstreetmap.org/lookup?osm_ids={ids}&format=json&polygon_geojson=1&polygon_threshold=0.00001"))
        return {f"{x['osm_type'][0].upper()}{x['osm_id']}": shape(x["geojson"]) for x in json.load(open(caminho, encoding="utf-8"))}

    nom = do_nominatim("W794449274,R19431996,R3424547")
    geoms = {
        "teatro": nom["W794449274"],
        "mercado": da_api((-60.0255, -3.1415, -60.0215, -3.1385), 1201529225, "mercado"),
        "pontaNegra": da_api((-60.112, -3.080, -60.092, -3.058), 229361393, "ponta-negra"),
        "picoDaNeblina": nom["R3424547"].simplify(0.003),
    }
    feats = [{"type": "Feature", "properties": {"chave": k, "km2": round(_km2(g), 4), "fonte": "© OpenStreetMap contributors (ODbL)"}, "geometry": mapping(g.buffer(0))} for k, g in geoms.items()]
    for f in feats:
        print(f"  {f['properties']['chave']}: {f['properties']['km2']} km²")
    gravar_json(os.path.join(DADOS, "lugares.json"), {"type": "FeatureCollection", "features": feats})


ETAPAS = {"lugares": lugares, "estado": estado, "municipios": municipios, "cidades": cidades, "rios": rios, "areas": areas, "br319": br319}
if __name__ == "__main__":
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
