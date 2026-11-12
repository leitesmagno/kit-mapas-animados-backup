#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-itabuna" (usados dentro do vídeo 017 do Estúdio 3D: o orçamento
da Prefeitura de Itabuna).

    npm run dados -- orcamento-itabuna

  itabuna  o contorno do município de Itabuna (IBGE 2914802, malha máxima) → dados/itabuna.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-itabuna", "dados")


def itabuna():
    gravar_json(os.path.join(DADOS, "itabuna.json"), ibge.malha("municipios", "2914802", qualidade="maxima"))
    print("itabuna.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"itabuna": itabuna, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
