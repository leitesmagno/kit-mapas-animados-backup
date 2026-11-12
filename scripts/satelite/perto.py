#!/usr/bin/env python3
"""Os tiles DE PERTO (nível > 8) de qualquer vídeo — a versão GENÉRICA do compositor do "Ilhéus"
(il-tiles-perto.py), chamada por scripts/satelite/tiles.ts com a lista dos tiles que faltam (JSON
no stdin: ["z/x/y", …]) e a configuração no ambiente:

    SATELITE_PASTA   a pasta em public/ (ex.: satelite-g01)
    SATELITE_CACHE   o cache dos downloads (node_modules/.cache/…)
    EOX_AREA         "oeste,sul,leste,norte": onde o EOX entra por cima da NASA

Cada tile é uma composição em duas camadas, para o mar ser o MESMO do longe ao perto:
  1. o Blue Marble com batimetria da NASA (GIBS, nível 8, domínio público) ampliado;
  2. o EOxCloudless 2016 (Sentinel-2, CC BY 4.0) onde ele tem imagem de verdade (costa, terra,
     mar raso); o azul chapado do EOX no mar aberto vira transparente, com a borda esfumada.
"""
import io
import json
import math
import os
import sys
import time
import urllib.request

import warnings

import numpy as np
from PIL import Image, ImageChops, ImageFilter

warnings.filterwarnings("ignore", category=UserWarning)  # PNG de paleta que o EOX manda às vezes
AQUI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAIZ = os.path.join(AQUI, "public", os.environ["SATELITE_PASTA"])
CACHE = os.environ.get("SATELITE_CACHE") or os.path.join(AQUI, "node_modules", ".cache", "satelite")
GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"
EOX = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"
# o azul chapado do EOX no mar aberto (medido)
EOX_CHAPADO = (24, 44, 77)
# bem maior que o assunto: a borda do EOX não pode cair na tela (e é esfumada em BORDA graus)
EOX_AREA = tuple(float(v) for v in os.environ["EOX_AREA"].split(","))  # oeste, sul, leste, norte
BORDA = 0.6
# abaixo disso (luminância 0–255, e mais azul que vermelho) o EOX é mar fundo: fica o da NASA
AGUA_FUNDA = float(os.environ.get("AGUA_FUNDA", "100"))
UA = {"User-Agent": "videos-de-mapas/1.0"}


def baixar(url, destino):
    if os.path.exists(destino):
        return Image.open(destino).convert("RGB")
    for tentativa in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                bruto = r.read()
            img = Image.open(io.BytesIO(bruto)).convert("RGB")
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            # grava e renomeia: vários processos compõem ao mesmo tempo e leem o mesmo cache
            tmp = f"{destino}.{os.getpid()}.tmp"
            img.save(tmp, "JPEG", quality=95)
            os.replace(tmp, destino)
            return img
        except Exception as e:  # noqa: BLE001
            if tentativa == 4:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(0.5 * (tentativa + 1))


def mundo(lon, lat):
    x = (lon + 180) / 360
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2
    return x, y


def lonlat(x, y):
    return x * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y))))


def fundo_nasa(z, x, y):
    """O Blue Marble ampliado: um mosaico 3×3 de tiles do nível 8 em volta (sem costura)."""
    k = 2 ** (z - 8)
    px, py = x // k, y // k
    mosaico = Image.new("RGB", (768, 768))
    for i in (-1, 0, 1):
        for j in (-1, 0, 1):
            t = baixar(GIBS.format(z=8, x=px + i, y=py + j), os.path.join(CACHE, "gibs", f"{px + i}_{py + j}.jpg"))
            mosaico.paste(t, ((i + 1) * 256, (j + 1) * 256))
    # a janela do tile dentro do mosaico (em px do nível 8)
    x0 = 256 + (x - px * k) * 256 / k
    y0 = 256 + (y - py * k) * 256 / k
    return mosaico.transform((256, 256), Image.EXTENT, (x0, y0, x0 + 256 / k, y0 + 256 / k), Image.BICUBIC)


def caixa_do_tile(z, x, y):
    n = 2 ** z
    o, nn = lonlat(x / n, y / n)
    l, s = lonlat((x + 1) / n, (y + 1) / n)
    return o, s, l, nn


def cruza(a, b):
    return a[0] < b[2] and a[2] > b[0] and a[1] < b[3] and a[3] > b[1]


def mascara_chapado(img):
    """Branco onde o EOX tem imagem de TERRA ou de água rasa; preto no azul chapado, no branco liso
    e na água FUNDA (escura e azulada: de perto o Sentinel-2 mostra o mar de verdade, mais escuro que
    o Blue Marble, e a mistura das duas virava uma colcha de retalhos). Assim o mar inteiro é o da
    NASA, do longe ao perto, e o EOX entra na terra e na costa. Borda esfumada."""
    r, g, b = EOX_CHAPADO
    dif = ImageChops.difference(img, Image.new("RGB", img.size, (r, g, b))).convert("L")
    m = dif.point(lambda v: 255 if v > 5 else 0)
    liso = img.convert("L").point(lambda v: 0 if v >= 250 else 255)
    m = ImageChops.multiply(m, liso)
    a = np.asarray(img, dtype=np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    funda = (lum < AGUA_FUNDA) & (a[..., 2] >= a[..., 0])
    m = ImageChops.multiply(m, Image.fromarray(np.where(funda, 0, 255).astype(np.uint8)))
    return m.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(6))


def compor(z, x, y):
    tile = fundo_nasa(z, x, y)
    caixa = caixa_do_tile(z, x, y)
    if cruza(caixa, EOX_AREA):
        e = baixar(EOX.format(z=z, x=x, y=y), os.path.join(CACHE, "eox", f"{z}_{x}_{y}.jpg"))
        m = mascara_chapado(e)
        # esfuma o EOX perto da borda da área (some em BORDA graus)
        o, su, l, n = caixa
        dist = min(o - EOX_AREA[0], EOX_AREA[2] - l, su - EOX_AREA[1], EOX_AREA[3] - n)
        if dist < BORDA:
            m = m.point(lambda v, k=max(0.0, dist / BORDA): int(v * k))
        tile.paste(e, (0, 0), m)
    destino = os.path.join(RAIZ, str(z), str(x), f"{y}.jpg")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    tmp = f"{destino}.{os.getpid()}.tmp"
    tile.save(tmp, "JPEG", quality=90)
    os.replace(tmp, destino)


if __name__ == "__main__":
    lista = json.load(sys.stdin)
    for i, k in enumerate(lista):
        z, x, y = map(int, k.split("/"))
        compor(z, x, y)
        if (i + 1) % 50 == 0:
            print(f"  perto: {i + 1}/{len(lista)}", flush=True)
    print(f"  perto: {len(lista)} tiles compostos")
