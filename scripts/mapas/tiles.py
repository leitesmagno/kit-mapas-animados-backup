"""Os tiles de satélite que a câmera vê — e só eles.

Baixar o mundo inteiro num nível alto é inviável; baixar "a região" no olho ou sobra em
disco ou falta no render. Aqui o percurso da câmera (o mesmo camera.json que o vídeo usa) é
simulado quadro a quadro, e cada tile que aparece na tela entra na conta. No fim, o que a
câmera não vê mais é apagado de public/.

LICENÇA, a parte que não dá para errar: o padrão é o EOxCloudless **2016**, que é CC BY 4.0
(uso comercial liberado, com crédito). As camadas de 2017 também são CC BY; **de 2018 em
diante são CC BY-NC-SA**, ou seja, NÃO servem para vídeo comercial sem licença da EOX. O
crédito exigido, onde a imagem aparecer ou na descrição:

    EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH
    (Contains modified Copernicus Sentinel data 2016), CC BY 4.0

Para imagem recente e comercial, use os recortes do sentinel.py (dado Copernicus bruto,
livre inclusive para uso comercial).
"""
import concurrent.futures as cf
import math
import os

import numpy as np

from .comum import PUBLICO, baixar

TAM = 512  # o mundo do MapLibre no zoom 0

# Provedores prontos. A chave é o que vai no crédito; mexer aqui muda a licença do vídeo.
EOX_2016 = {"url": "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg", "maxzoom": 13, "credito": "EOxCloudless 2016 (CC BY 4.0)"}
EOX_2017 = {"url": "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2017_3857/default/g/{z}/{y}/{x}.jpg", "maxzoom": 13, "credito": "EOxCloudless 2017 (CC BY 4.0)"}


def mundo(lon, lat, z):
    s = TAM * 2 ** z
    return (lon + 180) / 360 * s, (0.5 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / (2 * math.pi)) * s


def lonlat(x, y, z):
    s = TAM * 2 ** z
    return x / s * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / s))))


def misturar(a, b, t):
    """A MESMA interpolação de src/mapa/libre/mercator.ts (misturarCameras).

    Tem que ser a mesma, senão a simulação passa por onde a câmera não passa — e falta tile
    justo no meio do voo. O centro anda junto com a ESCALA (e não com o tempo): é isso que
    faz um zoom de 10 níveis parecer uma descida, e não um arrastão lateral.
    """
    ax, ay = mundo(*a["centro"], 0)
    bx, by = mundo(*b["centro"], 0)
    z = a["zoom"] + (b["zoom"] - a["zoom"]) * t
    sa, sb, s = 2 ** -a["zoom"], 2 ** -b["zoom"], 2 ** -z
    u = t if abs(sa - sb) < 1e-12 else (sa - s) / (sa - sb)
    return lonlat(ax + (bx - ax) * u, ay + (by - ay) * u, 0), z


def _plano(precisa, vistas, percurso, maxzoom, largura, altura, margem):
    """O que aparece com o mapa plano (Mercator).

    O MapLibre pede, para uma fonte raster de 256 px no zoom de mapa Z, os tiles do nível
    round(Z + 1) — então a conta pede floor e ceil, para cobrir o arredondamento.
    """
    for de, para in percurso:
        for i in range(241):
            (lon, lat), zm = misturar(vistas[de], vistas[para], i / 240)
            cx, cy = mundo(lon, lat, zm)
            for tz in {math.floor(zm + 1), math.ceil(zm + 1)}:
                tz = max(0, min(maxzoom, tz))
                k = 2 ** (tz - zm) / 2  # px de tela → px de tile de 256 no nível tz
                x0, x1 = (cx - largura / 2 - margem) * k / 256, (cx + largura / 2 + margem) * k / 256
                y0, y1 = (cy - altura / 2 - margem) * k / 256, (cy + altura / 2 + margem) * k / 256
                n = 2 ** tz
                for x in range(max(0, int(x0)), min(n, int(x1) + 1)):
                    for y in range(max(0, int(y0)), min(n, int(y1) + 1)):
                        precisa.add((tz, x, y))


def _globo(precisa, vistas, percurso, maxzoom, largura, altura, ate_zoom):
    """O que aparece com a projeção de globo — que é outra coisa.

    Na abertura em globo, a tela mostra a calota da esfera até a BORDA, e perto do polo a
    borda junta tiles de todas as longitudes. A conta de mapa plano não enxerga isso: num
    render de verdade faltaram 12 tiles (nível 4 junto ao Polo Sul, nível 5 no Pacífico Sul)
    e o mapa desenhou o nível de baixo no lugar — 404 no log e borrão na tela.

    Aqui cada câmera vira uma projeção ortográfica da esfera com raio 40% menor que o de
    verdade: mostra MAIS globo que o MapLibre, então cobre com folga, inclusive a folga que
    um giro de câmera (bearing) pede.
    """
    lat_g, lon_g = np.meshgrid(np.radians(np.arange(-89.5, 90, 0.5)), np.radians(np.arange(-180, 180, 0.5)), indexing="ij")
    pontos = np.stack([np.cos(lat_g) * np.cos(lon_g), np.cos(lat_g) * np.sin(lon_g), np.sin(lat_g)], axis=-1)
    for de, para in percurso:
        for i in range(241):
            (lon, lat), zm = misturar(vistas[de], vistas[para], i / 240)
            if zm >= ate_zoom:
                continue
            f0, l0 = math.radians(lat), math.radians(lon)
            centro = np.array([math.cos(f0) * math.cos(l0), math.cos(f0) * math.sin(l0), math.sin(f0)])
            leste = np.array([-math.sin(l0), math.cos(l0), 0.0])
            norte = np.cross(centro, leste)
            raio = 0.6 * TAM * 2 ** zm / (2 * math.pi)
            u = (pontos @ leste) * raio
            v = (pontos @ norte) * raio
            na_tela = ((pontos @ centro) > 0) & (np.abs(u) < largura * 0.83) & (np.abs(v) < altura * 0.68)
            la, lo = np.degrees(lat_g[na_tela]), np.degrees(lon_g[na_tela])
            for tz in {math.floor(zm + 1), math.ceil(zm + 1)}:
                tz = max(0, min(maxzoom, tz))
                n = 2 ** tz
                xs = np.floor((lo + 180) / 360 * n).astype(int)
                ys = np.floor((1 - np.log(np.tan(np.pi / 4 + np.radians(np.clip(la, -85.05, 85.05)) / 2)) / np.pi) / 2 * n).astype(int)
                for x, y in set(zip(xs.tolist(), ys.tolist())):
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            if 0 <= y + dy < n:
                                precisa.add((tz, (x + dx) % n, y + dy))


def tiles_do_percurso(camera, pasta="satelite", provedor=EOX_2016, largura=1080, altura=1920, margem=384, globo_ate=5.5, podar=True):
    """Baixa para public/<pasta>/{z}/{x}/{y}.jpg o que o percurso de `camera` mostra.

    `camera` é o camera.json do vídeo: {"vistas": {...}, "percurso": [[de, para], ...]}.
    `globo_ate` é o zoom em que o vídeo deixa de usar projeção de globo (0 desliga).
    """
    maxzoom = provedor["maxzoom"]
    print(f"satélite · tiles do percurso ({provedor['credito']})")
    precisa = set()
    for z in range(0, 4):  # com o globo na tela, os níveis baixos aparecem inteiros
        for x in range(2 ** z):
            for y in range(2 ** z):
                precisa.add((z, x, y))
    vistas, percurso = camera["vistas"], camera["percurso"]
    _plano(precisa, vistas, percurso, maxzoom, largura, altura, margem)
    if globo_ate:
        _globo(precisa, vistas, percurso, maxzoom, largura, altura, globo_ate)

    raiz = os.path.join(PUBLICO, pasta)
    faltam = [t for t in sorted(precisa) if not os.path.exists(os.path.join(raiz, str(t[0]), str(t[1]), f"{t[2]}.jpg"))]
    print(f"  {len(precisa)} tiles · faltando {len(faltam)}")

    def um(t):
        z, x, y = t
        destino = os.path.join(raiz, str(z), str(x), f"{y}.jpg")
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        erro = None
        for _ in range(5):
            try:
                open(destino, "wb").write(baixar(provedor["url"].format(z=z, x=x, y=y)))
                return None
            except Exception as e:  # servidor de tiles derruba conexão de vez em quando
                erro = e
        return f"{t}: {erro}"

    with cf.ThreadPoolExecutor(6) as ex:
        erros = [e for e in ex.map(um, faltam) if e]
    if erros:
        raise RuntimeError(f"{len(erros)} tiles falharam, ex.: {erros[:3]}")

    orfaos = 0
    if podar and os.path.isdir(raiz):
        for z in os.listdir(raiz):
            for x in os.listdir(os.path.join(raiz, z)):
                for nome in os.listdir(os.path.join(raiz, z, x)):
                    if (int(z), int(x), int(nome[:-4])) not in precisa:
                        os.remove(os.path.join(raiz, z, x, nome))
                        orfaos += 1
    print(f"  baixados agora: {len(faltam)} · removidos (fora do percurso): {orfaos}")
    return sorted(precisa)
