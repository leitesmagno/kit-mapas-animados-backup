#!/usr/bin/env python3
"""Mede as FOTOS de um vídeo depois de trocar: grava a proporção (largura ÷ altura) de cada arquivo de
public/assets/<pasta>/ em src/videos/<pasta>/dados/fotos.json — os cartões de foto usam essa medida
para mostrar a foto INTEIRA, sem cortar (foto em pé = cartão estreito).

    npm run fotos -- exemplo-vertical

Troque a foto pondo o seu arquivo com o MESMO nome na pasta (ex.: manaus.jpg) e rode isto. Uma foto
nova (nome novo) também entra na lista; o código da cena é que diz onde ela aparece.
"""
import json
import os
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if len(sys.argv) < 2:
    sys.exit("uso: npm run fotos -- <pasta do vídeo em src/videos/>")
pasta = sys.argv[1].strip("/")
fotos = os.path.join(RAIZ, "public", "assets", pasta)
destino = os.path.join(RAIZ, "src", "videos", pasta, "dados", "fotos.json")
if not os.path.isdir(fotos):
    sys.exit(f"✗ não existe public/assets/{pasta}/")
medidas = {}
for nome in sorted(os.listdir(fotos)):
    if not nome.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    with Image.open(os.path.join(fotos, nome)) as img:
        w, h = img.size
    medidas[nome] = round(w / h, 4)
    if max(w, h) < 900:
        print(f"  ! {nome}: só {w}×{h} px — pequena, vai ficar borrada no vídeo (o ideal é ≥ 1500 px)")
os.makedirs(os.path.dirname(destino), exist_ok=True)
with open(destino, "w", encoding="utf-8") as f:
    json.dump(medidas, f, ensure_ascii=False, indent=1)
print(f"{len(medidas)} fotos medidas → src/videos/{pasta}/dados/fotos.json")
