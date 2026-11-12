#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-cabralia" (usados dentro do vídeo 039 do Estúdio 3D: o orçamento
da Prefeitura de Santa Cruz Cabrália).

    npm run dados -- orcamento-cabralia

  municipio  o contorno do município de Santa Cruz Cabrália (IBGE 2927705, malha máxima) → dados/cabralia.json
  bahia      o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-cabralia", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "cabralia.json"), ibge.malha("municipios", "2927705", qualidade="maxima"))
    print("cabralia.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
