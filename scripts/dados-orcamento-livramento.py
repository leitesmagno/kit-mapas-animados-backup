#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-livramento" (usados dentro do vídeo 047 do Estúdio 3D: o orçamento
da Prefeitura de Livramento de Nossa Senhora).

    npm run dados -- orcamento-livramento

  municipio o contorno do município de Livramento de Nossa Senhora (IBGE 2919504, malha máxima) → dados/livramento.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-livramento", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "livramento.json"), ibge.malha("municipios", "2919504", qualidade="maxima"))
    print("livramento.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
