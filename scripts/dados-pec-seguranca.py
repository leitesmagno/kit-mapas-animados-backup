#!/usr/bin/env python3
"""Dados dos trechos de mapa "pec-seguranca" (usados dentro do vídeo 018 do Estúdio 3D: a PEC da
Segurança Pública, aprovada no Senado em 03/11/2026).

    npm run dados -- pec-seguranca

  municipios  os 5.570 municípios do Brasil (IBGE, API de malhas, qualidade mínima) → dados/municipios.json
Os estados vêm de src/mapa/dados/brasil-uf.json (IBGE), que o kit já traz.
"""
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas.comum import gravar_json  # noqa: E402
from mapas.ibge import malha  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "pec-seguranca", "dados")


def municipios():
    fc = malha("paises", "BR", qualidade="minima", intrarregiao="municipio")
    for f in fc["features"]:
        f["properties"] = {"id": f["properties"].get("codarea", "")}
    gravar_json(os.path.join(DADOS, "municipios.json"), fc)
    print(f"municipios.json: {len(fc['features'])} municípios")


ETAPAS = {"municipios": municipios}

if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or ETAPAS:
        ETAPAS[nome]()
