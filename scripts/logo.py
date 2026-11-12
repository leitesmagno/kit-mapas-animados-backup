#!/usr/bin/env python3
"""A LOGO REDONDA (o selo do horizontal e das thumbnails), a partir da logo que a pessoa pôs em
public/marca/: 512×512, recortada em círculo, fundo transparente → public/marca/logo-redonda.png.

    node scripts/py.mjs venv-geo scripts/logo.py public/marca/minha-logo.png

(Se a logo já é redonda ou é um símbolo que não pode ser cortado, use o arquivo como está.)
"""
import sys

from PIL import Image, ImageDraw, ImageOps

if len(sys.argv) < 2:
    sys.exit("uso: node scripts/py.mjs venv-geo scripts/logo.py public/marca/<arquivo>")
img = ImageOps.fit(Image.open(sys.argv[1]).convert("RGBA"), (512, 512), Image.LANCZOS)
mascara = Image.new("L", (512, 512), 0)
ImageDraw.Draw(mascara).ellipse((0, 0, 511, 511), fill=255)
img.putalpha(Image.composite(img.getchannel("A"), mascara, mascara))
img.save("public/marca/logo-redonda.png")
print("→ public/marca/logo-redonda.png")
