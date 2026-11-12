#!/usr/bin/env python3
"""Dados dos trechos de mapa "orcamento-una" (usados dentro do vídeo 021 do Estúdio 3D: o orçamento
da Prefeitura de Una).

    npm run dados -- orcamento-una

  una      o contorno do município de Una (IBGE 2932507, malha máxima) → dados/una.json
  bahia    o contorno da Bahia (IBGE, malha intermediária)               → dados/ba.json
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "orcamento-una", "dados")


def una():
    gravar_json(os.path.join(DADOS, "una.json"), ibge.malha("municipios", "2932507", qualidade="maxima"))
    print("una.json")


def bahia():
    gravar_json(os.path.join(DADOS, "ba.json"), ibge.malha("estados", "29", qualidade="intermediaria"))
    print("ba.json")


ETAPAS = {"una": una, "bahia": bahia}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
