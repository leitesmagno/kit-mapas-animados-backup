"""Configuração do motor de imagens: modelo, tamanhos aceitos, preços e a chave da API.

Conferido em 2026-10-14 na documentação oficial (ai.google.dev/gemini-api/docs/image-generation
e /pricing) e no SDK google-genai 2.31.0:
  - o modelo é "gemini-nano-banana-2.1" (a API devolve o nome canônico
    "models/gemini-nano-banana-2.1"; os dois são aceitos);
  - a API de Interactions recebe o formato em `response_format={"type": "image", ...}`;
    `generation_config.image_config` está marcado como DEPRECATED no SDK;
  - a imagem volta em base64, num passo "model_output" (antes dele vem um passo "thought").
"""

from __future__ import annotations

import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]

MODELO_PADRAO = "gemini-nano-banana-2.1"
# o modelo por TAREFA: o pedido pode dizer "padrao", "alta" ou o id do modelo
MODELOS = {
    "padrao": MODELO_PADRAO,  # Nano Banana 2.1: barato, bom para o grosso das imagens
    "alta": "gemini-3-pro-image",  # Nano Banana Pro: thumbnail e imagens de destaque (~2,7× o preço em 2K)
}
# a chamada inteira (o modelo "pensa" antes de desenhar: 20–60 s é normal)
TIMEOUT_S = 180

# o que o 2.1 e o Pro aceitam (nenhum dos dois aceita "512")
PROPORCOES = ("1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9")
TAMANHOS = ("1K", "2K", "4K")

# US$ por milhão de tokens, tarifa padrão (não batch), conferido em 2026-10-14.
# A imagem de 1K gasta 1120 tokens de saída (= US$ 0,0336). O raciocínio ("thought") é cobrado
# como texto de saída.
PRECOS = {
    "gemini-nano-banana-2.1": {"entrada": 1.50, "saida_imagem": 30.00, "saida_texto": 7.50},
    "gemini-3-pro-image": {"entrada": 2.00, "saida_imagem": 120.00, "saida_texto": 12.00},
}
# custo de tabela por imagem (antes de chamar a API: a estimativa da fila)
PRECO_POR_IMAGEM = {
    "gemini-nano-banana-2.1": {"1K": 0.0336, "2K": 0.0504, "4K": 0.113},
    "gemini-3-pro-image": {"1K": 0.134, "2K": 0.134, "4K": 0.24},
}


def resolver_modelo(nome: str) -> str:
    """"alta" → "gemini-3-pro-image"; "models/x" → "x"."""
    return MODELOS.get(nome, nome).removeprefix("models/")


def ler_chave() -> str:
    """A chave vem do ambiente ou do .env (nunca do código, nunca impressa)."""
    chave = os.environ.get("GEMINI_API_KEY", "").strip()
    if not chave:
        env = RAIZ / ".env"
        if env.exists():
            for linha in env.read_text(encoding="utf-8").splitlines():
                linha = linha.strip()
                if linha.startswith("GEMINI_API_KEY="):
                    chave = linha.split("=", 1)[1].strip().strip("\"'")
    if not chave:
        raise RuntimeError("falta GEMINI_API_KEY no ambiente ou no .env (veja .env.example)")
    return chave
