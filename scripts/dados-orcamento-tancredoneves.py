#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-tancredoneves" (usados dentro do vídeo 107 do Estúdio 3D: o orçamento
da Prefeitura de Presidente Tancredo Neves).

    npm run dados -- orcamento-tancredoneves

  municipio o contorno do município de Presidente Tancredo Neves (IBGE 2925758, malha máxima) → dados/tancredoneves.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-tancredoneves", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "tancredoneves.json"), ibge.malha("municipios", "2925758", qualidade="maxima"))
    print("tancredoneves.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
