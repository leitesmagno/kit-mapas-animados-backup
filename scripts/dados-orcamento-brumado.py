#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-brumado" (usados dentro do vídeo 026 do Estúdio 3D: o orçamento
da Prefeitura de Brumado).

    npm run dados -- orcamento-brumado

  municipio o contorno do município de Brumado (IBGE 2904605, malha máxima) → dados/brumado.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-brumado", "dados")


def municipio():
    gravar_json(os.path.join(DADOS, "brumado.json"), ibge.malha("municipios", "2904605", qualidade="maxima"))
    print("brumado.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"municipio": municipio, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
