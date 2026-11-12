#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-caravelas" (usados dentro do vídeo 055 do Estúdio 3D: o orçamento
da Prefeitura de Caravelas).

    npm run dados -- orcamento-caravelas

  municipio o contorno do município de Caravelas (IBGE 2906907, malha máxima) → dados/caravelas.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-caravelas", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "caravelas.json"), ibge.malha("municipios", "2906907", qualidade="maxima"))
    print("caravelas.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
