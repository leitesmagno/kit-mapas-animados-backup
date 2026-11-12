#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-salvador" (usados dentro do vídeo 023 do Estúdio 3D: o orçamento
da Prefeitura de Salvador).

    npm run dados -- orcamento-salvador

  municipio  o contorno do município de Salvador (IBGE 2927408, malha máxima) → dados/salvador.json
  estado     o contorno do estado da Bahia (IBGE 29, malha intermediária) → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-salvador", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "salvador.json"), ibge.malha("municipios", "2927408", qualidade="maxima"))
    print("salvador.json")


def estado():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "estado": estado}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
