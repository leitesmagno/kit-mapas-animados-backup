#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-ilheus" (usados dentro do vídeo 014 do Estúdio 3D: o orçamento
da Prefeitura de Ilhéus).

    npm run dados -- orcamento-ilheus

  ilheus   o contorno do município de Ilhéus (IBGE 2913606, malha máxima) → dados/ilheus.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-ilheus", "dados")


def ilheus():
    gravar_json(os.path.join(DADOS, "ilheus.json"), ibge.malha("municipios", "2913606", qualidade="maxima"))
    print("ilheus.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"ilheus": ilheus, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
