#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-brotas" (usados dentro do vídeo 133 do Estúdio 3D: o orçamento
da Prefeitura de Brotas de Macaúbas).

    npm run dados -- orcamento-brotas

  municipio o contorno do município de Brotas de Macaúbas (IBGE 2904506, malha máxima) → dados/brotas.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-brotas", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "brotas.json"), ibge.malha("municipios", "2904506", qualidade="maxima"))
    print("brotas.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
