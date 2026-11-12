#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-ubata" (usados dentro do vídeo 108 do Estúdio 3D: o orçamento
da Prefeitura de Ubatã).

    npm run dados -- orcamento-ubata

  municipio o contorno do município de Ubatã (IBGE 2932309, malha máxima) → dados/ubata.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-ubata", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "ubata.json"), ibge.malha("municipios", "2932309", qualidade="maxima"))
    print("ubata.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
