#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-sp" (usados dentro do vídeo 020 do Estúdio 3D: o orçamento
da Prefeitura de São Paulo).

    npm run dados -- orcamento-sp

  municipio  o contorno do município de São Paulo (IBGE 3550308, malha máxima) → dados/sp-municipio.json
  estado     o contorno do estado de São Paulo (IBGE 35, malha intermediária) → dados/sp-estado.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-sp", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "sp-municipio.json"), ibge.malha("municipios", "3550308", qualidade="maxima"))
    print("sp-municipio.json")


def estado():
    gravar_json(os.path.join(DADOS, "sp-estado.json"), ibge.malha("estados", "35", qualidade="intermediaria"))
    print("sp-estado.json")


ETAPAS = {"municipio": municipio, "estado": estado}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
