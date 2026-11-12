"""O RECORTE dos ícones gerados sobre fundo verde (tipo "icone"): tira o fundo, limpa o verde que
vaza nas bordas, corta justo no objeto e salva um PNG quadrado e transparente.

O fundo é medido na própria imagem (a mediana da borda), não suposto: o modelo nem sempre entrega
o #00FF00 exato. A transparência é gradual (borda suave, sem serrilhado) e o "despill" puxa o verde
das bordas para o tom do objeto.
"""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def recortar_fundo(dados: bytes, lado: int | None = 512, margem: float = 0.06, maximo: int = 1600) -> Image.Image:
    """`lado` = PNG quadrado desse tamanho (os ícones); None = mantém a proporção do objeto, corte
    justo com `margem` e o lado maior limitado a `maximo` (os elementos das thumbnails)."""
    im = Image.open(io.BytesIO(dados)).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    borda = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    fundo = np.median(borda, axis=0)
    # distância de cor ao fundo e o "quanto é verde" (g acima de r e b)
    dist = np.sqrt(((a - fundo) ** 2).sum(axis=2))
    verde = a[..., 1] - np.maximum(a[..., 0], a[..., 2])
    alfa = np.clip((dist - 40) / 90, 0, 1)
    alfa = np.where(verde > 60, np.minimum(alfa, np.clip((110 - verde) / 50, 0, 1)), alfa)
    # despill: onde ainda sobra verde demais, o G desce até o maior de R e B
    g_lim = np.maximum(a[..., 0], a[..., 2])
    a[..., 1] = np.where(a[..., 1] > g_lim, g_lim + (a[..., 1] - g_lim) * 0.15, a[..., 1])
    rgba = np.dstack([np.clip(a, 0, 255), alfa * 255]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    # suaviza a borda do alfa (1 px) sem borrar a cor
    al = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    if lado is None:
        al = _sem_ilhas(al)
    out.putalpha(al)
    caixa = Image.fromarray((np.asarray(al) > 24).astype(np.uint8) * 255).getbbox()
    if not caixa:
        raise ValueError("o recorte apagou a imagem inteira (o fundo não era uniforme?)")
    obj = out.crop(caixa)
    if lado is None:
        m = int(max(obj.size) * margem)
        tela = Image.new("RGBA", (obj.width + 2 * m, obj.height + 2 * m), (0, 0, 0, 0))
        tela.paste(obj, (m, m), obj)
        f = min(1.0, maximo / max(tela.size))
        return tela if f == 1.0 else tela.resize((round(tela.width * f), round(tela.height * f)), Image.LANCZOS)
    s = max(obj.size)
    tela = Image.new("RGBA", (int(s * (1 + 2 * margem)),) * 2, (0, 0, 0, 0))
    tela.paste(obj, ((tela.width - obj.width) // 2, (tela.height - obj.height) // 2), obj)
    return tela.resize((lado, lado), Image.LANCZOS)


def _sem_ilhas(alfa: Image.Image, fracao: float = 0.2) -> Image.Image:
    """Apaga as ilhas soltas menores que `fracao` da maior: a IA às vezes repete um pedaço do objeto
    (uma "cópia fantasma") num canto do verde. Peças grandes separadas (dois objetos) ficam."""
    from scipy import ndimage

    a = np.asarray(alfa)
    rotulos, n = ndimage.label(a > 24)
    if n <= 1:
        return alfa
    areas = ndimage.sum(np.ones_like(a), rotulos, index=range(1, n + 1))
    manter = np.isin(rotulos, [i + 1 for i, ar in enumerate(areas) if ar >= fracao * areas.max()])
    # a borda suave em volta do que fica também fica
    manter = ndimage.binary_dilation(manter, iterations=3)
    return Image.fromarray(np.where(manter, a, 0).astype(np.uint8), "L")


def recortar_arquivo(origem: Path, destino: Path, lado: int | None = 512, margem: float = 0.06) -> tuple[int, int]:
    img = recortar_fundo(origem.read_bytes(), lado, margem)
    destino.parent.mkdir(parents=True, exist_ok=True)
    img.save(destino, optimize=True)
    return img.size


def recortar_foto(origem: Path, destino: Path, margem: float = 0.04, maximo: int = 1600) -> tuple[int, int]:
    """Tira o fundo de uma FOTO comum (sem verde) com o rembg (modelo isnet, baixado na 1ª vez).
    Para o que o Nano Banana gera, o verde (`recortar_fundo`) é melhor: borda limpa e sem modelo."""
    try:
        from rembg import new_session, remove
    except ImportError as e:  # pragma: no cover
        raise SystemExit("falta o rembg: node_modules/.cache/venv-imagens/bin/pip install 'rembg[cpu]==2.0.67'") from e
    im = remove(Image.open(origem).convert("RGB"), session=new_session("isnet-general-use"), post_process_mask=True)
    caixa = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    if not caixa:
        raise ValueError(f"{origem}: o recorte não achou nenhum objeto")
    obj = im.crop(caixa)
    m = int(max(obj.size) * margem)
    tela = Image.new("RGBA", (obj.width + 2 * m, obj.height + 2 * m), (0, 0, 0, 0))
    tela.paste(obj, (m, m), obj)
    f = min(1.0, maximo / max(tela.size))
    if f < 1.0:
        tela = tela.resize((round(tela.width * f), round(tela.height * f)), Image.LANCZOS)
    destino.parent.mkdir(parents=True, exist_ok=True)
    tela.save(destino, optimize=True)
    return tela.size
