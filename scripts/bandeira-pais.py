#!/usr/bin/env python3
"""A bandeira do PERU para caber DENTRO do país (exemplo vertical, "Amazonas") — o MOLDE para pôr a bandeira de um país dentro dele: copie e troque o país.

A oficial esticada na caixa do Peru deixava o país quase todo branco (a faixa branca do meio cobre o
miolo; as vermelhas caem no mar e na Bolívia). Aqui as três faixas verticais (vermelha–branca–vermelha)
são cortadas nas longitudes que dividem o TERRITÓRIO em três partes iguais (amostra numa grade de
200 × 200): cada cor cobre um terço do Peru. A imagem cobre a caixa do país (geoBounds) e é exibida
esticada (preserveAspectRatio="none"); as faixas são verticais, então esticar não as deforma.

    node scripts/py.mjs venv-geo scripts/bandeira-pais.py
"""
import json
import os

from PIL import Image
from shapely import contains_xy
from shapely.geometry import shape

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAISES = os.path.join(AQUI, "src", "videos", "v02-sao-luis", "dados", "paises.json")
DESTINO = os.path.join(AQUI, "public", "assets", "exemplo-vertical", "bandeira-peru-faixas.png")
VERMELHO, BRANCO = (217, 16, 35), (255, 255, 255)

peru = next(shape(f["geometry"]) for f in json.load(open(PAISES))["features"] if f["properties"]["iso"] == "PER")
o, s, l, n = peru.bounds
N = 200
colunas = []
for i in range(N):
    lon = o + (i + 0.5) / N * (l - o)
    colunas.append(sum(contains_xy(peru, lon, s + (j + 0.5) / N * (n - s)) for j in range(N)))
total = sum(colunas)


def corte(fracao):
    soma = 0
    for i, c in enumerate(colunas):
        soma += c
        if soma >= fracao * total:
            return (i + 1) / N
    return 1.0


um, dois = corte(1 / 3), corte(2 / 3)
LARG, ALT = 1200, 1200
img = Image.new("RGB", (LARG, ALT), BRANCO)
img.paste(VERMELHO, (0, 0, round(um * LARG), ALT))
img.paste(VERMELHO, (round(dois * LARG), 0, LARG, ALT))
img.save(DESTINO)
print(f"{os.path.relpath(DESTINO, AQUI)}: cortes em {um:.3f} e {dois:.3f} da largura")
print(f"caixa (oeste, sul, leste, norte): [{o:.3f}, {s:.3f}], [{l:.3f}, {n:.3f}]")
