#!/usr/bin/env python3
"""Os dados geográficos do documentário "Estreito de Ormuz" (g01, 16:9).

    npm run dados -- exemplo-horizontal

1. Os PAÍSES: Natural Earth 1:10m (domínio público). A escala 1:10m é necessária porque a
   península de Musandam, o enclave de Omã no estreito, some nas escalas menores. Os países
   que tocam a caixa do vídeo (Golfo, Oriente Médio, sul e leste da Ásia) entram inteiros,
   simplificados a ~1 km; Irã, Omã e Emirados (vistos de perto) a ~100 m.
2. A ROTA até a Ásia: uma linha ESQUEMÁTICA pelo mar (Golfo de Omã → Mar Arábico → sul do Sri
   Lanka → Estreito de Malaca → Mar da China Meridional), com pontos escolhidos em mar aberto.
   Ela mostra o SENTIDO do fluxo, não as rotas exatas dos navios (registrado no DATA_SOURCES.md).

Grava src/videos/exemplo-horizontal/dados/{paises,rotas}.json.
"""
import json
import os
import urllib.request

from shapely.geometry import box, mapping, shape

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(AQUI, "node_modules", ".cache", "natural-earth")
SAIDA = os.path.join(AQUI, "src", "videos", "exemplo-horizontal", "dados")
os.makedirs(CACHE, exist_ok=True)
os.makedirs(SAIDA, exist_ok=True)

URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"
CAIXA = (25.0, -12.0, 150.0, 48.0)  # oeste, sul, leste, norte: do Mar Vermelho ao Japão (quem toca entra)
PERTO = {"IRN", "OMN", "ARE"}  # os países que a câmera vê de perto
EXTRA = {"BRA"}  # fora da caixa, mas no vídeo (o fecho: "e também aqui no Brasil")

# ISO → nome em português (só os que o vídeo destaca ou rotula; o resto vem sem nome)
NOMES = {
    "IRN": "Irã", "OMN": "Omã", "ARE": "Emirados Árabes Unidos", "SAU": "Arábia Saudita", "QAT": "Catar",
    "KWT": "Kuwait", "IRQ": "Iraque", "BHR": "Bahrein", "CHN": "China", "IND": "Índia", "JPN": "Japão",
    "KOR": "Coreia do Sul", "BRA": "Brasil",
}

# A rota esquemática (lon, lat), em mar aberto
ROTA_ASIA = [
    (56.45, 26.45),  # o estreito
    (57.8, 25.2),  # Golfo de Omã
    (61.5, 22.0),  # Mar Arábico
    (68.0, 15.0),
    (76.0, 6.5),  # sul da Índia
    (81.0, 5.2),  # sul do Sri Lanka
    (91.0, 6.0),
    (96.5, 5.8),  # entrada do Estreito de Malaca
    (100.6, 2.8),
    (103.9, 1.25),  # Singapura
    (107.5, 6.0),  # Mar da China Meridional
    (112.5, 14.0),
    (117.5, 21.0),
    (121.5, 26.0),  # Estreito de Taiwan → leste da Ásia
]
ROTA_INDIA = [(61.5, 22.0), (66.5, 21.6), (69.4, 22.2)]  # o ramo para a costa oeste da Índia (Golfo de Kutch)

# Os OLEODUTOS que contornam o estreito: ESQUEMÁTICOS (os pontos de partida e de chegada são os
# reais; o traçado entre eles é uma linha suave, não o percurso exato do duto).
#   East-West (Petroline), Arábia Saudita: Abqaiq → Yanbu, no Mar Vermelho
#   Habshan–Fujairah (ADCOP), Emirados: Habshan → Fujairah, no Golfo de Omã
OLEODUTO_SAUDITA = [(49.68, 25.93), (47.2, 25.2), (44.5, 24.7), (41.6, 24.3), (39.4, 24.1), (38.06, 24.09)]
OLEODUTO_EMIRADOS = [(53.67, 23.83), (54.6, 24.15), (55.5, 24.6), (56.33, 25.12)]

# O comércio da Ormuz medieval: ESQUEMÁTICO (o sentido das trocas, não rotas documentadas)
COMERCIO_INDIA = [(56.46, 27.07), (58.5, 25.2), (63.0, 23.6), (68.0, 22.4), (72.6, 21.9)]  # → Guzerate
COMERCIO_ARABIA = [(56.46, 27.07), (57.0, 25.6), (58.8, 23.6)]  # → a costa de Omã
COMERCIO_PERSIA = [(56.46, 27.07), (56.28, 27.25), (55.0, 28.4), (52.6, 29.6)]  # → o interior (Shiraz)


def baixar(url, nome):
    destino = os.path.join(CACHE, nome)
    if not os.path.exists(destino):
        req = urllib.request.Request(url, headers={"User-Agent": "videos-de-mapas/1.0"})
        with urllib.request.urlopen(req, timeout=300) as r, open(destino, "wb") as f:
            f.write(r.read())
    return destino


def arredondar(g, casas=3):
    if isinstance(g, (list, tuple)):
        if g and isinstance(g[0], (int, float)):
            return [round(g[0], casas), round(g[1], casas)]
        return [arredondar(x, casas) for x in g]
    return g


def main():
    paises = json.load(open(baixar(URL, "ne_10m_admin_0_countries.geojson"), encoding="utf-8"))
    recorte = box(*CAIXA)
    feats = []
    for f in paises["features"]:
        p = f["properties"]
        iso = p.get("ADM0_A3") or p.get("ISO_A3")
        g = shape(f["geometry"])
        if not g.intersects(recorte) and iso not in EXTRA:
            continue
        # sem recortar (o recorte virava uma "fronteira" reta na tela): só simplifica. O Golfo, de
        # perto, a ~100 m; o resto a ~1 km
        g = g.simplify(0.001 if iso in PERTO else 0.01, preserve_topology=True)
        if g.is_empty:
            continue
        geo = mapping(g)
        feats.append({"type": "Feature", "properties": {"iso": iso, "nome": NOMES.get(iso, p.get("NAME_PT") or p.get("NAME"))}, "geometry": {"type": geo["type"], "coordinates": arredondar(geo["coordinates"])}})
    json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(SAIDA, "paises.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    rotas = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "properties": {"id": "asia", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": ROTA_ASIA}},
            {"type": "Feature", "properties": {"id": "india", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": ROTA_INDIA}},
            {"type": "Feature", "properties": {"id": "oleoduto-saudita", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": OLEODUTO_SAUDITA}},
            {"type": "Feature", "properties": {"id": "oleoduto-emirados", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": OLEODUTO_EMIRADOS}},
            {"type": "Feature", "properties": {"id": "comercio-india", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": COMERCIO_INDIA}},
            {"type": "Feature", "properties": {"id": "comercio-arabia", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": COMERCIO_ARABIA}},
            {"type": "Feature", "properties": {"id": "comercio-persia", "esquematica": True}, "geometry": {"type": "LineString", "coordinates": COMERCIO_PERSIA}},
        ],
    }
    json.dump(rotas, open(os.path.join(SAIDA, "rotas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    achados = sorted(f["properties"]["iso"] for f in feats if f["properties"]["iso"] in NOMES)
    print(f"paises.json: {len(feats)} países ({', '.join(achados)}) · rotas.json: {len(rotas["features"])} linhas esquemáticas")
    faltam = set(NOMES) - set(achados)
    if faltam:
        raise SystemExit(f"faltam países: {sorted(faltam)}")


if __name__ == "__main__":
    main()
