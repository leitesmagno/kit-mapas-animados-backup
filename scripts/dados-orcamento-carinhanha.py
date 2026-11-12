#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-carinhanha" (usados dentro do vídeo 118 do Estúdio 3D: o orçamento
da Prefeitura de Carinhanha).

    npm run dados -- orcamento-carinhanha

  municipio o contorno do município de Carinhanha (IBGE 2907103, malha máxima) → dados/carinhanha.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-carinhanha", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "carinhanha.json"), ibge.malha("municipios", "2907103", qualidade="maxima"))
    print("carinhanha.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
