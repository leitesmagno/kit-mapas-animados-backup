#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-cacule" (usados dentro do vídeo 115 do Estúdio 3D: o orçamento
da Prefeitura de Caculé).

    npm run dados -- orcamento-cacule

  municipio o contorno do município de Caculé (IBGE 2905008, malha máxima) → dados/cacule.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-cacule", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "cacule.json"), ibge.malha("municipios", "2905008", qualidade="maxima"))
    print("cacule.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
