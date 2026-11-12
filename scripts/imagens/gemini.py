"""A chamada ao Gemini (API de Interactions, SDK oficial google-genai) e a leitura da resposta.

A resposta real (conferida em 2026-10-14) é assim:
    status: "completed"
    steps: [ {type: "thought", signature: …},
             {type: "model_output", content: [ {type: "image", mime_type: "image/jpeg", data: <base64>} ]} ]
    usage: {total_input_tokens, total_output_tokens, total_thought_tokens,
            output_tokens_by_modality: [{modality: "image", tokens: 1120}], …}
Então NÃO dá para supor `steps[-1]`: procura-se o último bloco de imagem em qualquer passo
"model_output". O SDK também preenche `output_image`, que serve de reserva.
"""

from __future__ import annotations

import base64
import binascii
import random
import time
from dataclasses import dataclass, field
from typing import Any, Callable

from .config import PRECOS

# códigos HTTP que valem nova tentativa; o resto (400, 401, 403, 404…) é permanente
TEMPORARIOS = {408, 429, 500, 502, 503, 504}


class ErroDeGeracao(Exception):
    temporario = False


class ErroTemporario(ErroDeGeracao):
    temporario = True


class ErroPermanente(ErroDeGeracao):
    pass


class SemImagem(ErroPermanente):
    """A API respondeu, mas sem imagem (recusa por segurança, só texto, interação incompleta)."""


@dataclass
class ImagemGerada:
    dados: bytes
    mime: str
    texto: str = ""
    interacao: str = ""
    uso: dict = field(default_factory=dict)


def _campo(obj: Any, nome: str, padrao: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(nome, padrao)
    return getattr(obj, nome, padrao)


def decodificar(dados: Any) -> bytes:
    if isinstance(dados, (bytes, bytearray)):
        return bytes(dados)
    if not isinstance(dados, str) or not dados:
        raise SemImagem("bloco de imagem sem dados")
    try:
        return base64.b64decode(dados, validate=True)
    except (binascii.Error, ValueError) as e:
        raise SemImagem(f"base64 inválido no bloco de imagem: {e}") from e


def extrair_imagem(interacao: Any) -> ImagemGerada:
    """Tira a imagem (bytes) da resposta. Aceita o objeto do SDK ou o dict equivalente."""
    status = _campo(interacao, "status")
    textos: list[str] = []
    imagem = None
    for passo in _campo(interacao, "steps") or []:
        if _campo(passo, "type") != "model_output":
            continue
        for bloco in _campo(passo, "content") or []:
            tipo = _campo(bloco, "type")
            if tipo == "image" and _campo(bloco, "data"):
                imagem = bloco  # fica a ÚLTIMA (se o modelo mandar rascunho e final)
            elif tipo == "text" and _campo(bloco, "text"):
                textos.append(_campo(bloco, "text"))
    if imagem is None:
        imagem = _campo(interacao, "output_image")
    texto = "".join(textos) or (_campo(interacao, "output_text") or "")
    if imagem is None or not _campo(imagem, "data"):
        detalhe = f"status={status}"
        erros = _campo(interacao, "errors")
        if erros:
            detalhe += f", erros={erros}"
        if texto:
            detalhe += f", texto={texto[:300]!r}"
        raise SemImagem(f"a resposta não trouxe imagem ({detalhe})")
    dados = decodificar(_campo(imagem, "data"))
    uso = _campo(interacao, "usage")
    if uso is not None and not isinstance(uso, dict):
        uso = uso.model_dump(mode="json", exclude_none=True)
    return ImagemGerada(
        dados=dados,
        mime=_campo(imagem, "mime_type") or "image/png",
        texto=texto,
        interacao=_campo(interacao, "id") or "",
        uso=uso or {},
    )


def custo_real(modelo: str, uso: dict) -> float | None:
    """US$ pela contagem de tokens que a API devolveu (None se o modelo não tem preço na tabela)."""
    p = PRECOS.get(modelo.removeprefix("models/"))
    if not p or not uso:
        return None
    por_modalidade = {m.get("modality"): m.get("tokens", 0) for m in uso.get("output_tokens_by_modality", [])}
    imagem = por_modalidade.get("image", 0)
    texto_saida = max(0, uso.get("total_output_tokens", 0) - imagem)  # inclui o raciocínio
    entrada = uso.get("total_input_tokens", 0)
    return round((entrada * p["entrada"] + imagem * p["saida_imagem"] + texto_saida * p["saida_texto"]) / 1e6, 5)


def codigo_http(e: BaseException) -> int | None:
    for nome in ("code", "status_code"):
        v = getattr(e, nome, None)
        if isinstance(v, int):
            return v
    resp = getattr(e, "raw_response", None) or getattr(e, "response", None)
    v = getattr(resp, "status_code", None)
    return v if isinstance(v, int) else None


def classificar(e: BaseException) -> ErroDeGeracao:
    if isinstance(e, ErroDeGeracao):
        return e
    codigo = codigo_http(e)
    nome = type(e).__name__
    msg = f"{nome}{f' {codigo}' if codigo else ''}: {str(e)[:400]}"
    if codigo in TEMPORARIOS:
        return ErroTemporario(msg)
    if codigo is None and any(t in nome for t in ("Timeout", "ConnectError", "RemoteProtocolError", "ReadError", "NoResponse")):
        return ErroTemporario(msg)
    return ErroPermanente(msg)


class GeradorGemini:
    """Uma imagem por chamada, com nova tentativa (espera crescente) só para erro temporário."""

    def __init__(
        self,
        cliente: Any = None,
        tentativas: int = 4,
        espera_inicial: float = 4.0,
        dormir: Callable[[float], None] = time.sleep,
        log: Callable[[str], None] = print,
    ):
        self._cliente = cliente
        self.tentativas = tentativas
        self.espera_inicial = espera_inicial
        self.dormir = dormir
        self.log = log

    @property
    def cliente(self) -> Any:
        if self._cliente is None:
            from google import genai

            from .config import TIMEOUT_S, ler_chave

            # as tentativas são daqui (com classificação do erro), não do SDK; timeout em ms
            self._cliente = genai.Client(api_key=ler_chave(), http_options={"retry_options": {"attempts": 1}, "timeout": TIMEOUT_S * 1000})
        return self._cliente

    def gerar(self, prompt: str, modelo: str, proporcao: str, tamanho: str, referencias: list[tuple[bytes, str]] = ()) -> ImagemGerada:
        if referencias:
            entrada: Any = [{"type": "text", "text": prompt}] + [
                {"type": "image", "data": base64.b64encode(b).decode("ascii"), "mime_type": m} for b, m in referencias
            ]
        else:
            entrada = prompt
        for tentativa in range(1, self.tentativas + 1):
            try:
                interacao = self.cliente.interactions.create(
                    model=modelo,
                    input=entrada,
                    response_format={"type": "image", "aspect_ratio": proporcao, "image_size": tamanho},
                )
                status = _campo(interacao, "status")
                if status in ("in_progress", "queued"):
                    raise ErroTemporario(f"interação ainda {status}")
                return extrair_imagem(interacao)
            except Exception as bruto:  # noqa: BLE001 — tudo vira temporário ou permanente
                erro = classificar(bruto)
                if not erro.temporario or tentativa == self.tentativas:
                    raise erro from bruto
                espera = self.espera_inicial * 2 ** (tentativa - 1) * (1 + 0.25 * random.random())
                self.log(f"  {erro} — tentativa {tentativa}/{self.tentativas}, esperando {espera:.0f}s")
                self.dormir(espera)
        raise AssertionError("inalcançável")
