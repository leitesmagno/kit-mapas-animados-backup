#!/usr/bin/env python3
"""A bandeira do Amazonas "centrada" para caber DENTRO do estado (exemplo vertical) — o MOLDE da bandeira centrada de qualquer estado: copie e troque o desenho;
(scripts/go-bandeira.py) e a do Pará.

A oficial esticada na caixa do estado deixaria o retângulo azul das estrelas lá no canto de cima, fora
do Amazonas. Aqui a bandeira é recomposta numa imagem que cobre a caixa CAIXA_AM do Estado.tsx (projeção
de Mercator, exibida com preserveAspectRatio="none"): as listras branca–vermelha–branca na largura toda e
o retângulo azul com as estrelas (recortado da oficial, na proporção dela) no CENTRO do estado, na altura
de uma listra branca, como na oficial; as listras se repetem para cima e para baixo (branca, vermelha…).

    node scripts/py.mjs venv-geo scripts/bandeira-estado.py
"""
import math
import os

from PIL import Image

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGINAL = os.path.join(AQUI, "public", "assets", "bandeiras", "am.png")
DESTINO = os.path.join(AQUI, "public", "assets", "exemplo-vertical", "bandeira-am-centrada.png")

# a mesma caixa do Estado.tsx (CAIXA_AM): [oeste, sul] → [leste, norte]
O, S, L, N = -74.3, -10.3, -55.6, 2.7
# o meio do estado (o ponto de dentro mais longe da divisa, um pouco a leste) e a largura do retângulo azul
# em graus
CENTRO = (-64.9, -4.1)
CANTAO = 6.4

merc = lambda lat: math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))
LARG = 1800
escala = LARG / (L - O)
ALT = round((merc(N) - merc(S)) * escala)
px = lambda lon: (lon - O) * escala
py = lambda lat: (merc(N) - merc(lat)) * escala

orig = Image.open(ORIGINAL).convert("RGB")
W0, H0 = orig.size  # 1280 × 915: três listras de ~305 px; o cantão azul 547 × 304 (a listra de cima)
BRANCO, VERMELHO = orig.getpixel((W0 - 5, 5)), orig.getpixel((W0 - 5, H0 // 2))
cantao = orig.crop((0, 0, 547, 304))

cw = round(CANTAO * escala)
ch = round(cw * 304 / 547)
listra = ch
cx, cy = px(CENTRO[0]), py(CENTRO[1])
x0, y0 = round(cx - cw / 2), round(cy - ch / 2)

img = Image.new("RGB", (LARG, ALT), BRANCO)
# a listra do cantão é branca; as vizinhas, vermelhas; e assim alternando para os dois lados
k0 = math.floor(-y0 / listra) - 1
for k in range(k0, k0 + int(ALT / listra) + 4):
    topo = y0 + k * listra
    if k % 2:
        img.paste(VERMELHO, (0, max(0, round(topo)), LARG, min(ALT, round(topo + listra))))
img.paste(cantao.resize((cw, ch), Image.LANCZOS), (x0, y0))
img.save(DESTINO)
print(f"{os.path.relpath(DESTINO, AQUI)}: {LARG}×{ALT}, cantão {cw}×{ch} px em ({x0}, {y0})")
