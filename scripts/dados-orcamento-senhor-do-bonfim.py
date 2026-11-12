#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-senhor-do-bonfim" (usados dentro do vídeo 122 do Estúdio 3D: o orçamento
da Prefeitura de Senhor do Bonfim).

    npm run dados -- orcamento-senhor-do-bonfim

  municipio o contorno do município de Senhor do Bonfim (IBGE 2930105, malha máxima) → dados/senhordobonfim.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-senhor-do-bonfim", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "senhordobonfim.json"), ibge.malha("municipios", "2930105", qualidade="maxima"))
    print("senhordobonfim.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
