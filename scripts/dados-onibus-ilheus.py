#!/usr/bin/env python3
"""Dados dos trechos de mapa "onibus-ilheus" (usados dentro do vídeo 016 do Estúdio 3D: o ônibus de Ilhéus).

    npm run dados -- onibus-ilheus

  ilheus     o contorno do município de Ilhéus (IBGE 2913606, malha máxima) → dados/ilheus.json
  distritos  as sedes dos distritos (nomes da lista oficial do IBGE, posições do OpenStreetMap, ODbL)
             → dados/distritos.json
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge, osm  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "onibus-ilheus", "dados")
# distritos de Ilhéus (IBGE, municípios/2913606/distritos), menos a sede
NOMES = ["Aritaguá", "Banco Central", "Castelo Novo", "Coutos", "Inema", "Japu", "Olivença", "Pimenteira", "Banco do Pedro", "Sambaituba"]


def ilheus():
    gravar_json(os.path.join(DADOS, "ilheus.json"), ibge.malha("municipios", "2913606", qualidade="maxima"))
    print("ilheus.json")


def distritos():
    q = '[out:json][timeout:60];node(-15.3,-39.45,-14.35,-38.85)["place"]["name"~"^(' + "|".join(NOMES) + ')$"];out;'
    d = osm.consulta(q)
    achou = {}
    for e in d["elements"]:
        n = e["tags"]["name"]
        rank = {"town": 0, "village": 1, "suburb": 2, "hamlet": 3}.get(e["tags"].get("place"), 4)
        if n not in achou or rank < achou[n][0]:
            achou[n] = (rank, round(e["lon"], 4), round(e["lat"], 4), e["tags"].get("place"))
    out = [{"nome": n, "lon": v[1], "lat": v[2], "tipo": v[3]} for n, v in achou.items()]
    for o in out:
        print(o)
    print("faltaram:", [n for n in NOMES if n not in achou])
    with open(os.path.join(DADOS, "distritos.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


ETAPAS = {"ilheus": ilheus, "distritos": distritos}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
