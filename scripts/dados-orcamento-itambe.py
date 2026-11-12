#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-itambe" (usados dentro do vídeo 083 do Estúdio 3D: o orçamento
da Prefeitura de Itambé).

    npm run dados -- orcamento-itambe

  municipio o contorno do município de Itambé (IBGE 2915809, malha máxima) → dados/itambe.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-itambe", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "itambe.json"), ibge.malha("municipios", "2915809", qualidade="maxima"))
    print("itambe.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
