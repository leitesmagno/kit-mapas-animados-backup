"""Recortes de satélite Copernicus Sentinel-2, direto do COG na AWS — sem GDAL.

Por que não usar só tiles prontos: os mosaicos com licença comercial aberta são de 2016/2017.
Para imagem recente (ou para uma série de anos, o "antes e depois"), a saída é o dado
Copernicus bruto, que é livre inclusive para uso comercial, com o crédito:

    Contém dados Copernicus Sentinel modificados (ANO)

Como funciona: o Earth Search (AWS Open Data) tem as cenas L2A em COG. Aqui a leitura é por
faixa de bytes — cabeçalho TIFF, só os blocos de 1024 px que a janela toca, deflate mais
preditor horizontal — e a reamostragem sai num grid regular em Web Mercator, que é o que uma
image source do MapLibre espera (os quatro cantos em lon/lat).

E o CORREGISTRO, que é o detalhe que separa um "antes e depois" bonito de um que treme: cada
passagem do satélite cai até ~1 px fora do lugar em relação às outras. No zoom do vídeo isso
vira um pulo de vários pixels a cada dissolve. `recortes()` alinha todas as cenas contra uma
de referência, por correlação de fase, e confere o que sobrou.
"""
import json
import math
import os
import struct
import subprocess
import urllib.error
import urllib.request
import zlib

import numpy as np

from .comum import PUBLICO, UA, baixar

BUSCA = "https://earth-search.aws.element84.com/v1"

A_WGS = 6378137.0
F_WGS = 1 / 298.257223563
E2 = F_WGS * (2 - F_WGS)
EP2 = E2 / (1 - E2)


def buscar_cenas(caixa, de, ate, nuvem_max=20, limite=60):
    """As cenas Sentinel-2 L2A que cobrem a caixa, da menos nublada para a mais.

    `nuvem` é a nuvem do LADRILHO inteiro (100 km), não a do seu recorte: use como filtro
    grosso e depois OLHE cada recorte antes de escolher. Em cidade litorânea, metade das
    cenas com 15% de nuvem tem nuvem bem em cima do assunto.
    """
    corpo = {
        "collections": ["sentinel-2-l2a"],
        "bbox": [caixa["oeste"], caixa["sul"], caixa["leste"], caixa["norte"]],
        "datetime": f"{de}T00:00:00Z/{ate}T23:59:59Z",
        "limit": limite,
        "query": {"eo:cloud_cover": {"lt": nuvem_max}},
        "sortby": [{"field": "properties.eo:cloud_cover", "direction": "asc"}],
    }
    req = urllib.request.Request(f"{BUSCA}/search", data=json.dumps(corpo).encode(), headers={**UA, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        achadas = json.load(r)["features"]
    return [
        {
            "id": f["id"],
            "data": f["properties"]["datetime"][:10],
            "nuvem": round(f["properties"]["eo:cloud_cover"], 1),
            "zona": int(f["properties"]["mgrs:utm_zone"]),
            "visual": f["assets"]["visual"]["href"],
        }
        for f in achadas
    ]


def cena(id_da_cena):
    """Os dados de uma cena pelo id (fica em cache: o render não depende disto)."""
    item = json.loads(baixar(f"{BUSCA}/collections/sentinel-2-l2a/items/{id_da_cena}", cache=f"stac_{id_da_cena}.json"))
    return {
        "id": item["id"],
        "data": item["properties"]["datetime"][:10],
        "nuvem": round(item["properties"]["eo:cloud_cover"], 1),
        "zona": int(item["properties"]["mgrs:utm_zone"]),
        "visual": item["assets"]["visual"]["href"],
    }


def utm(lon, lat, zona):
    lon0 = math.radians(-183 + 6 * zona)
    phi, lam = np.radians(lat), np.radians(lon)
    n = A_WGS / np.sqrt(1 - E2 * np.sin(phi) ** 2)
    t, c, a = np.tan(phi) ** 2, EP2 * np.cos(phi) ** 2, np.cos(phi) * (lam - lon0)
    m = A_WGS * ((1 - E2 / 4 - 3 * E2**2 / 64 - 5 * E2**3 / 256) * phi - (3 * E2 / 8 + 3 * E2**2 / 32 + 45 * E2**3 / 1024) * np.sin(2 * phi) + (15 * E2**2 / 256 + 45 * E2**3 / 1024) * np.sin(4 * phi) - (35 * E2**3 / 3072) * np.sin(6 * phi))
    x = 0.9996 * n * (a + (1 - t + c) * a**3 / 6 + (5 - 18 * t + t**2 + 72 * c - 58 * EP2) * a**5 / 120) + 500000
    y = 0.9996 * (m + n * np.tan(phi) * (a**2 / 2 + (5 - t + 9 * c + 4 * c**2) * a**4 / 24 + (61 - 58 * t + t**2 + 600 * c - 330 * EP2) * a**6 / 720))
    return x, y + 10000000  # hemisfério sul

class Cog:
    def __init__(self, url):
        self.url = url
        h = self.faixa(0, 16383)
        e = "<" if h[:2] == b"II" else ">"
        off = struct.unpack(e + "I", h[4:8])[0]
        tags = {}
        for i in range(struct.unpack(e + "H", h[off:off + 2])[0]):
            ent = h[off + 2 + i * 12: off + 14 + i * 12]
            tag, tipo, c = struct.unpack(e + "HHI", ent[:8])
            fmt = {3: "H", 4: "I", 12: "d"}.get(tipo)
            if fmt is None:
                continue
            tam = struct.calcsize(fmt) * c
            p = 8 if tam <= 4 else None
            bruto = ent[8:8 + tam] if p else h[struct.unpack(e + "I", ent[8:12])[0]:][:tam]
            tags[tag] = struct.unpack(e + fmt * c, bruto)
        assert tags[259][0] == 8 and tags.get(317, (1,))[0] == 2, "esperava deflate + preditor horizontal"
        self.tw, self.th, self.spp = tags[322][0], tags[323][0], tags[277][0]
        self.cols = math.ceil(tags[256][0] / self.tw)
        self.ofs, self.tams = tags[324], tags[325]
        self.x0, self.y0, self.px = tags[33922][3], tags[33922][4], tags[33550][0]
        self.memo = {}

    def faixa(self, a, b):
        # O S3 devolve 503 quando se pede rápido demais; espera e tenta de novo.
        import time
        for tentativa in range(6):
            try:
                req = urllib.request.Request(self.url, headers={**UA, "Range": f"bytes={a}-{b}"})
                with urllib.request.urlopen(req, timeout=300) as r:
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code not in (500, 502, 503, 504) or tentativa == 5:
                    raise
                time.sleep(2 * 2 ** tentativa)

    def tile(self, tx, ty):
        if (tx, ty) not in self.memo:
            i = ty * self.cols + tx
            bruto = zlib.decompress(self.faixa(self.ofs[i], self.ofs[i] + self.tams[i] - 1))
            a = np.frombuffer(bruto, np.uint8).reshape(self.th, self.tw, self.spp)
            self.memo[(tx, ty)] = np.cumsum(a, axis=1, dtype=np.uint8)
        return self.memo[(tx, ty)]

    def janela(self, c0, r0, c1, r1):
        out = np.zeros((r1 - r0, c1 - c0, self.spp), np.uint8)
        for ty in range(r0 // self.th, (r1 - 1) // self.th + 1):
            for tx in range(c0 // self.tw, (c1 - 1) // self.tw + 1):
                t = self.tile(tx, ty)
                a0, b0 = max(c0, tx * self.tw), max(r0, ty * self.th)
                a1, b1 = min(c1, (tx + 1) * self.tw), min(r1, (ty + 1) * self.th)
                out[b0 - r0:b1 - r0, a0 - c0:a1 - c0] = t[b0 - ty * self.th:b1 - ty * self.th, a0 - tx * self.tw:a1 - tx * self.tw]
        return out

def recortar(cog, zona, caixa, metros=10.0, desloc=(0.0, 0.0)):
    """Reamostra a cena num grid regular em Web Mercator — é o que uma image source do
    MapLibre espera (os quatro cantos em lon/lat, interpolados linearmente em Mercator).

    `desloc` (dx, dy, em pixels da cena) corrige o erro de posição da passagem: cada cena
    Sentinel-2 cai até ~1 px fora do lugar em relação às outras, e no zoom do vídeo isso
    vira um pulo de vários pixels a cada dissolve da série temporal."""
    o, s, l, n = caixa["oeste"], caixa["sul"], caixa["leste"], caixa["norte"]
    yn = math.log(math.tan(math.pi / 4 + math.radians(n) / 2))
    ys = math.log(math.tan(math.pi / 4 + math.radians(s) / 2))
    larg = round((l - o) * 111320 * math.cos(math.radians((n + s) / 2)) / metros)
    alt = round(larg * (yn - ys) / math.radians(l - o))
    lons = o + (np.arange(larg) + 0.5) / larg * (l - o)
    my = yn - (np.arange(alt) + 0.5) / alt * (yn - ys)
    LON, LAT = np.meshgrid(lons, np.degrees(2 * np.arctan(np.exp(my)) - np.pi / 2))
    x, y = utm(LON, LAT, zona)
    col, lin = (x - cog.x0) / cog.px - 0.5 + desloc[0], (cog.y0 - y) / cog.px - 0.5 + desloc[1]
    c0, r0 = int(np.floor(col.min())) - 1, int(np.floor(lin.min())) - 1
    c1, r1 = int(np.ceil(col.max())) + 2, int(np.ceil(lin.max())) + 2
    fonte = cog.janela(c0, r0, c1, r1).astype(np.float32)
    cx, ry = col - c0, lin - r0
    i0, j0 = np.floor(cx).astype(int), np.floor(ry).astype(int)
    fx, fy = (cx - i0)[..., None], (ry - j0)[..., None]
    v = fonte[j0, i0] * (1 - fx) * (1 - fy) + fonte[j0, i0 + 1] * fx * (1 - fy) + fonte[j0 + 1, i0] * (1 - fx) * fy + fonte[j0 + 1, i0 + 1] * fx * fy
    return np.clip(v + 0.5, 0, 255).astype(np.uint8)

def gravar_jpg(caminho, img, qualidade=3):
    h, w, _ = img.shape
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-", "-q:v", str(qualidade), caminho], input=img.tobytes(), check=True)


# Escolher cena é trabalho de olho, não de filtro: `buscar_cenas` devolve as candidatas
# ordenadas por nuvem do LADRILHO inteiro (100 km), o que não garante céu limpo sobre o
# assunto. A lista de cenas de cada vídeo — id, recorte e o motivo da escolha — mora no
# scripts/dados.py dele, conferida recorte por recorte, e não aqui.


def deslocamento(ref, img):
    """Quanto `img` está deslocada em relação a `ref`, em pixels (dx para leste, dy para
    sul), por correlação de fase com janela de Hann e pico refinado por parábola. Funciona
    porque o que está em volta do assunto não muda entre os anos (ruas, orla, quadras) e
    domina a correlação — mesmo que o assunto no meio do recorte mude por completo."""
    a = ref.mean(axis=2)
    b = img.mean(axis=2)
    janela = np.outer(np.hanning(a.shape[0]), np.hanning(a.shape[1]))
    fa = np.fft.fft2((a - a.mean()) * janela)
    fb = np.fft.fft2((b - b.mean()) * janela)
    cruz = fa * np.conj(fb)
    r = np.fft.ifft2(cruz / (np.abs(cruz) + 1e-9)).real
    h, w = r.shape
    y, x = np.unravel_index(np.argmax(r), r.shape)
    def fino(m, c, p):
        d = m - 2 * c + p
        return 0.0 if d == 0 else (m - p) / (2 * d)
    dy = y + fino(r[(y - 1) % h, x], r[y, x], r[(y + 1) % h, x])
    dx = x + fino(r[y, (x - 1) % w], r[y, x], r[y, (x + 1) % w])
    dx = dx - w if dx > w / 2 else dx
    dy = dy - h if dy > h / 2 else dy
    # o pico de r está em -d quando img = ref deslocada de +d
    return -dx, -dy, float(r.max())


def recortes(cenas, caixa, pasta="s2", referencia=None, metros=10.0, prefixo=""):
    """Recorta a mesma caixa em várias cenas, ALINHADAS entre si, e devolve o manifesto.

    `cenas` é uma lista de ids (ou de dicionários vindos de `buscar_cenas`). A primeira —
    ou `referencia` — é o padrão: todas as outras são medidas contra ela e reamostradas já
    corrigidas. Sobrando mais de 0,15 px, o script quebra em vez de entregar série tremida.
    """
    escolhidas = [c if isinstance(c, dict) else cena(c) for c in cenas]
    ref_id = referencia or escolhidas[0]["id"]
    escolhidas.sort(key=lambda c: c["id"] != ref_id)  # a referência primeiro
    base = None
    manifesto = []
    for c in escolhidas:
        arquivo = f"{pasta}/{prefixo}{c['data']}.jpg"
        cog = Cog(c["visual"])
        img = recortar(cog, c["zona"], caixa, metros=metros)
        if c["id"] == ref_id:
            base, dx, dy, pico = img, 0.0, 0.0, 1.0
        else:
            dx, dy, pico = deslocamento(base, img)
            img = recortar(cog, c["zona"], caixa, metros=metros, desloc=(dx, dy))
            rx, ry, _ = deslocamento(base, img)
            assert abs(rx) < 0.15 and abs(ry) < 0.15, f"{arquivo}: sobrou {rx:+.2f}/{ry:+.2f} px depois do corregistro"
        gravar_jpg(os.path.join(PUBLICO, arquivo), img)
        print(f"  {arquivo} {img.shape[1]}×{img.shape[0]} · corrigido {dx:+.2f} / {dy:+.2f} px (pico {pico:.2f})")
        manifesto.append({"arquivo": arquivo, "data": c["data"], "cena": c["id"], "nuvemNoLadrilho": c["nuvem"], "caixa": caixa, "corregistro": {"dx": round(dx, 3), "dy": round(dy, 3), "referencia": ref_id}})
    manifesto.sort(key=lambda m: m["data"])
    return manifesto
