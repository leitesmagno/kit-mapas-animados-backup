"""A FOLHA DE CONFERÊNCIA das thumbnails: cada thumbnail numa linha, do jeito que o público a vê.

    conferir.py <folha.jpg> <thumb.png> [<thumb.png> …]

Por linha: a thumbnail com as áreas que o YouTube cobre (se existir o .guias.png), o cartão do
feed no celular (escuro e claro, com o selo de duração), o tamanho da busca/sugeridos (168 px) e a
versão em preto e branco (se o título some no cinza, falta contraste de luz, não de cor).
Também garante o limite de 2 MB do YouTube: se o PNG passar, grava um .jpg ao lado.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

LIMITE = 2 * 1024 * 1024
ALTO = 360  # altura de cada linha da folha
ESCURO, CLARO = (15, 15, 15), (249, 249, 249)


def cartao(im: Image.Image, largura: int, fundo: tuple[int, int, int]) -> Image.Image:
    """A thumbnail no feed: cantos arredondados, selo de duração e as barras do título/canal."""
    vertical = im.height > im.width
    t = im.resize((largura, round(largura * im.height / im.width)), Image.LANCZOS).convert("RGB")
    mascara = Image.new("L", t.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, t.width - 1, t.height - 1], radius=max(6, largura // 30), fill=255)
    tela = Image.new("RGB", (largura + 24, t.height + (24 if vertical else 70)), fundo)
    tela.paste(t, (12, 12), mascara)
    d = ImageDraw.Draw(tela)
    if not vertical:
        w, h = max(28, largura // 9), max(14, largura // 22)
        x, y = 12 + t.width - w - 6, 12 + t.height - h - 6
        d.rounded_rectangle([x, y, x + w, y + h], radius=3, fill=(0, 0, 0))
        cinza = (60, 60, 60) if fundo == ESCURO else (210, 210, 210)
        d.ellipse([12, t.height + 22, 40, t.height + 50], fill=cinza)
        d.rounded_rectangle([48, t.height + 22, 12 + t.width * 0.9, t.height + 32], radius=4, fill=cinza)
        d.rounded_rectangle([48, t.height + 40, 12 + t.width * 0.6, t.height + 48], radius=4, fill=cinza)
    return tela


def linha(caminho: Path) -> Image.Image:
    im = Image.open(caminho).convert("RGB")
    guias = caminho.with_suffix(".guias.png")
    base = Image.open(guias).convert("RGB") if guias.exists() else im
    vertical = im.height > im.width
    pecas = [
        base.resize((round(ALTO * im.width / im.height), ALTO), Image.LANCZOS),
        cartao(im, 160 if vertical else 360, ESCURO),
        cartao(im, 160 if vertical else 360, CLARO),
        cartao(im, 90 if vertical else 168, ESCURO),
        ImageOps.grayscale(im).convert("RGB").resize((round(200 * im.width / im.height), 200), Image.LANCZOS),
    ]
    larg = sum(p.width for p in pecas) + 20 * (len(pecas) + 1)
    alt = max(p.height for p in pecas) + 60
    tela = Image.new("RGB", (larg, alt), (32, 32, 36))
    d = ImageDraw.Draw(tela)
    d.text((20, 12), caminho.stem, fill=(230, 230, 230))
    x = 20
    for p in pecas:
        tela.paste(p, (x, 40))
        x += p.width + 20
    return tela


def garantir_limite(caminho: Path) -> None:
    if caminho.stat().st_size <= LIMITE:
        return
    jpg = caminho.with_suffix(".jpg")
    for q in (95, 92, 88, 84, 80):
        Image.open(caminho).convert("RGB").save(jpg, quality=q, optimize=True, progressive=True)
        if jpg.stat().st_size <= LIMITE:
            break
    print(f"{caminho.name} passa de 2 MB (limite do YouTube): suba o {jpg.name} ({jpg.stat().st_size // 1024} KB)")


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 1
    destino, thumbs = Path(argv[0]), [Path(a) for a in argv[1:]]
    linhas = [linha(t) for t in thumbs]
    for t in thumbs:
        garantir_limite(t)
    folha = Image.new("RGB", (max(l.width for l in linhas), sum(l.height for l in linhas)), (32, 32, 36))
    y = 0
    for l in linhas:
        folha.paste(l, (0, y))
        y += l.height
    folha.save(destino, quality=88)
    print(f"folha: {destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
