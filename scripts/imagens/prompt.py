"""A FICHA VISUAL do documentário, o PEDIDO de cada imagem e o PROMPT que sai dos dois.

O prompt para o modelo vai em inglês (o modelo segue melhor as regras de composição e de
"sem texto"); o conteúdo do pedido (descrição, narração) pode vir em português.

Nada aqui chama a API: é texto puro, testável sem chave.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from .config import MODELO_PADRAO, PRECOS, PROPORCOES, RAIZ, TAMANHOS, resolver_modelo

# ---------------------------------------------------------------------------
# A direção de arte por TIPO de imagem. O estilo serve à narrativa: só a thumbnail e a cena
# conceitual pedem drama; o resto é sóbrio, de documentário.
# ---------------------------------------------------------------------------
TIPOS: dict[str, str] = {
    "historica": (
        "Editorial historical ILLUSTRATION (clearly a painted/illustrated reconstruction, not a photograph): "
        "muted painterly rendering, period-plausible architecture, clothing and objects, natural light, "
        "documentary restraint. Generic figures only, seen from a distance or from behind; no recognizable real person."
    ),
    "conceitual": (
        "Conceptual geopolitical scene: one clear visual metaphor, minimal elements, strong negative space, "
        "symbolic rather than literal, cinematic lighting with restraint. Generic objects, no real emblems."
    ),
    "paisagem": (
        "Illustrative documentary photograph of a landscape or environment: realistic textures, natural light, "
        "believable real-camera lens, honest color, atmospheric depth. Looks like a careful location photograph, "
        "not a stock image."
    ),
    "apoio": (
        "Illustrative documentary image supporting an economic, military, political or industrial explanation: "
        "ports, ships, pipelines, factories, cargo, infrastructure or generic equipment shown realistically. "
        "No identifiable insignia, hull numbers, company names or national markings."
    ),
    "transicao": (
        "Calm transitional image between explanations: wide, low detail, soft gradients and texture, slow mood, "
        "large uncluttered areas. Works as a background for on-screen text added later."
    ),
    "thumbnail": (
        "YouTube thumbnail background: ONE evident focal subject, bold simple shapes, strong contrast and "
        "separation from the background, saturated but controlled color, readable at small size. "
        "Leave a clean area for a headline that will be added later in post."
    ),
    "icone": (
        "A single 3D ICON in the style of glossy 3D emoji (soft clay-like render, smooth rounded shapes, gentle "
        "studio lighting from the top left, subtle gradients, crisp edges), the whole object visible and centered "
        "with generous margin, isolated on a perfectly flat, uniform pure green background (#00FF00, chroma key), "
        "no shadow or reflection on the background, no ground plane, no green tones on the object itself."
    ),
    # thumbnail montada por camadas (skill thumbnail-chamativa): o FUNDO é só o cenário, e cada
    # ELEMENTO vem isolado no verde para virar recorte (`npm run imagens -- recortes <doc>`)
    "fundo": (
        "Background plate for a high-click-through YouTube thumbnail: ONLY the environment, no main subject "
        "(the subjects are composited on top later). Dramatic depth, a strong light source behind the center "
        "(backlight / glow) that will separate the subjects, bold complementary colors (e.g. teal against orange), "
        "high contrast, details soft toward the edges, simple shapes that read at small size."
    ),
    "elemento": (
        "A single subject for a YouTube thumbnail cut-out: hyper-detailed, punchy and dramatic, crisp silhouette, "
        "strong rim light and saturated but believable color, the WHOLE subject visible with generous margin, "
        "isolated on a perfectly flat, uniform pure green background (#00FF00, chroma key), no shadow or "
        "reflection on the background, no ground plane, no green tones on the subject itself."
    ),
    "movimento": (
        "Image designed to receive slow camera moves (zoom and pan) in the edit: rich detail that survives "
        "a 20% crop, main subject away from the frame edges, extra breathing room on all sides, "
        "no important element touching the border."
    ),
}

# Valem para TODA imagem: texto, mapa, bandeira e gente real entram por código, com dados verificados.
REGRAS_FIXAS = [
    "no text, letters, numbers, captions, signs or watermarks anywhere in the image",
    "no maps, borders, country outlines or cartographic elements",
    "no flags, coats of arms, logos or national/military insignia",
    "no recognizable real people, politicians or public figures",
    "no generic AI look: no plastic skin, no oversaturated HDR, no lens-flare spam, no centered symmetrical cliché",
]

ESPACOS_PARA_TEXTO = {
    "esquerda": "keep the left third of the frame calm and uncluttered for a title",
    "direita": "keep the right third of the frame calm and uncluttered for a title",
    "topo": "keep the top quarter of the frame calm and uncluttered for a title",
    "baixo": "keep the bottom quarter of the frame calm and uncluttered for subtitles",
}

ID_VALIDO = re.compile(r"^[a-z0-9][a-z0-9_-]{0,60}$")
MAX_REFERENCIAS = 14  # o limite total da API (10 de objeto + 4 de personagem no 2.1)
EXTENSOES_REF = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}


class PedidoInvalido(ValueError):
    pass


@dataclass
class FichaVisual:
    """A identidade visual de UM documentário (vale para todas as imagens dele)."""

    tema: str
    contexto: str = ""  # histórico e geográfico
    estilo: str = "cinematic editorial documentary, professional, restrained"
    paleta: list[str] = field(default_factory=list)  # "deep teal", "oil black", "#C8A25A"
    iluminacao: str = ""
    epoca: str = ""
    regiao: str = ""
    personagens: str = ""  # traços recorrentes, quando houver (sempre genéricos)
    evitar: list[str] = field(default_factory=list)
    referencias: list[str] = field(default_factory=list)  # imagens aprovadas (relativas à raiz)


@dataclass
class PedidoDeImagem:
    id: str
    cena: str
    tipo: str
    descricao: str  # o que a imagem mostra
    narracao: str = ""  # o trecho da fala associado
    objetivo: str = ""  # o que a imagem faz pela narrativa
    proporcao: str = "16:9"
    tamanho: str = "2K"
    modelo: str = MODELO_PADRAO
    referencias: list[str] = field(default_factory=list)
    restricoes: list[str] = field(default_factory=list)
    continuidade: str = ""  # o que vem antes na sequência, para manter a continuidade
    espaco_para_texto: str | None = None
    obrigatoria: bool = True
    ilustrativa: bool = True  # toda imagem gerada é ilustração/reconstrução, nunca registro real

    def __post_init__(self):
        self.modelo = resolver_modelo(self.modelo)


def validar(pedido: PedidoDeImagem, ficha: FichaVisual, raiz: Path = RAIZ) -> None:
    erros = []
    if not ID_VALIDO.match(pedido.id):
        erros.append(f"id inválido {pedido.id!r} (use minúsculas, números, hífen e _)")
    if not pedido.cena:
        erros.append("falta a cena")
    if pedido.tipo not in TIPOS:
        erros.append(f"tipo {pedido.tipo!r} não existe (use {', '.join(TIPOS)})")
    if not pedido.descricao.strip():
        erros.append("falta a descrição")
    if pedido.modelo not in PRECOS:
        erros.append(f"modelo {pedido.modelo!r} desconhecido (use padrao, alta ou {', '.join(PRECOS)})")
    if pedido.proporcao not in PROPORCOES:
        erros.append(f"proporção {pedido.proporcao!r} não aceita (use {', '.join(PROPORCOES)})")
    if pedido.tamanho not in TAMANHOS:
        erros.append(f"tamanho {pedido.tamanho!r} não aceito (use {', '.join(TAMANHOS)})")
    if pedido.espaco_para_texto and pedido.espaco_para_texto not in ESPACOS_PARA_TEXTO:
        erros.append(f"espaco_para_texto {pedido.espaco_para_texto!r} (use {', '.join(ESPACOS_PARA_TEXTO)})")
    if not ficha.tema.strip():
        erros.append("a ficha visual não tem tema")
    refs = todas_as_referencias(pedido, ficha)
    if len(refs) > MAX_REFERENCIAS:
        erros.append(f"{len(refs)} referências (máximo {MAX_REFERENCIAS})")
    for r in refs:
        p = raiz / r
        if p.suffix.lower() not in EXTENSOES_REF:
            erros.append(f"referência {r}: formato não aceito")
        elif not p.exists():
            erros.append(f"referência {r}: arquivo não existe")
    if erros:
        raise PedidoInvalido(f"{pedido.id}: " + "; ".join(erros))


def todas_as_referencias(pedido: PedidoDeImagem, ficha: FichaVisual) -> list[str]:
    # as da ficha primeiro (a identidade do documentário), depois as do pedido, sem repetir
    return list(dict.fromkeys([*ficha.referencias, *pedido.referencias]))


def montar_prompt(pedido: PedidoDeImagem, ficha: FichaVisual) -> str:
    linhas = [TIPOS[pedido.tipo], ""]
    linhas.append(f"Documentary subject: {ficha.tema}.")
    if ficha.contexto:
        linhas.append(f"Historical and geographic context: {ficha.contexto}")
    if ficha.regiao:
        linhas.append(f"Place: {ficha.regiao}.")
    if ficha.epoca:
        linhas.append(f"Period: {ficha.epoca}.")
    linhas.append("")
    linhas.append(f"What the image shows: {pedido.descricao.strip()}")
    if pedido.objetivo:
        linhas.append(f"Narrative purpose of this shot: {pedido.objetivo}")
    if pedido.narracao:
        linhas.append(f'Voice-over during this shot (for mood and meaning; do not write it in the image): "{pedido.narracao}"')
    if pedido.continuidade:
        linhas.append(f"Continuity with the previous shots: {pedido.continuidade}")
    linhas.append("")
    linhas.append(f"Visual identity of the whole documentary: {ficha.estilo}.")
    if ficha.paleta:
        linhas.append(f"Color palette: {', '.join(ficha.paleta)}.")
    if ficha.iluminacao:
        linhas.append(f"Lighting: {ficha.iluminacao}.")
    if ficha.personagens:
        linhas.append(f"Recurring characters (generic, fictional): {ficha.personagens}.")
    if todas_as_referencias(pedido, ficha):
        linhas.append("Match the look, palette and lighting of the attached reference images.")
    horizontal = pedido.proporcao in ("16:9", "21:9", "3:2", "4:3", "5:4")
    formato = "horizontal" if horizontal else "vertical" if pedido.proporcao in ("9:16", "2:3", "3:4", "4:5") else "square"
    if pedido.tipo == "icone":
        linhas.append("Composition: square icon, the object fills about 75% of the frame, readable at 100 px.")
    elif pedido.tipo == "elemento":
        linhas.append(f"Composition: {pedido.proporcao} {formato} frame, the subject fills about 80% of it, readable at 150 px.")
    else:
        linhas.append(
            f"Composition: {pedido.proporcao} {formato} frame for video, one clear focal point, "
            "readable on a phone screen, clean depth separation."
        )
    if pedido.espaco_para_texto:
        linhas.append(f"Layout: {ESPACOS_PARA_TEXTO[pedido.espaco_para_texto]}.")
    # o ícone e o elemento são centrados de propósito (a regra do "centrado simétrico" não vale)
    fixas = REGRAS_FIXAS[:-1] if pedido.tipo in ("icone", "elemento") else REGRAS_FIXAS
    evitar = [*fixas, *ficha.evitar, *pedido.restricoes]
    linhas.append("")
    linhas.append("Strictly avoid: " + "; ".join(dict.fromkeys(evitar)) + ".")
    return "\n".join(linhas).strip() + "\n"


def ficha_de_dict(d: dict) -> FichaVisual:
    return FichaVisual(**{k: v for k, v in d.items() if k in FichaVisual.__dataclass_fields__})


def pedido_de_dict(d: dict) -> PedidoDeImagem:
    desconhecidos = set(d) - set(PedidoDeImagem.__dataclass_fields__)
    if desconhecidos:
        raise PedidoInvalido(f"{d.get('id', '?')}: campos desconhecidos {sorted(desconhecidos)}")
    return PedidoDeImagem(**d)
