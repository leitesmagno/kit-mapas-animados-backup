"""O ROTEIRO FALADO (falas.json) casado com o Whisper — genérico, para qualquer vídeo cujo texto
esteja num falas.json com as palavras-gatilho entre [colchetes] (molde: o documentário g01).

    eventos_por_fala(falas, transcript)  → {"04.ira": {t, fim, palavra}, …}
        Cada [palavra] é procurada SÓ dentro da fala dela (uma palavra que o Whisper escreve
        diferente não derruba as seguintes), em ordem, com tolerância de grafia ("Qatar" acha
        [Catar], "Larac" acha [Larak], "tumbes" acha [Tunb]).

    legenda_pelo_roteiro(falas, transcript) → [{palavra, inicio, fim}, …]
        A LEGENDA com o tempo do Whisper e a GRAFIA do roteiro: as palavras que o Whisper
        escreveu diferente voltam a ser as do texto ("Qatar" → "Catar", "a ilhas" → "há ilhas").
        Onde o Whisper escreveu número em algarismo ("33", "1971"), fica o algarismo (lê melhor).
"""

from __future__ import annotations

import difflib
import re
import unicodedata

MARCA = re.compile(r"\[([^\]]+)\]")


def sem_acento(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")


def norm(t: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", sem_acento(t))


def nome_do_evento(n: int, marca: str) -> str:
    return f"{n:02d}." + re.sub(r"[^a-z0-9]+", "-", sem_acento(marca)).strip("-")


def parecido(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    if len(a) >= 4 and len(b) >= 4 and (a.startswith(b[:4]) or b.startswith(a[:4])):
        return 0.9
    return difflib.SequenceMatcher(None, a, b).ratio()


def palavras_da_fala(transcript: dict, k: int) -> list[dict]:
    return [p for p in transcript["palavras"] if p["parte"] == k]


# `apelidos`: a palavra do roteiro → como o Whisper escreve ({"brent": "brand", "kharg": "carga"})
def eventos_por_fala(falas: list[dict], transcript: dict, minimo: float = 0.72, apelidos: dict | None = None) -> tuple[dict, list[str]]:
    apelidos = {norm(k): norm(v) for k, v in (apelidos or {}).items()}
    eventos, faltou = {}, []
    for k, fala in enumerate(falas, start=1):
        ditas = palavras_da_fala(transcript, k)
        chaves = [norm(p["palavra"]) for p in ditas]
        cursor = 0
        for marca in MARCA.findall(fala["texto"]):
            nome = nome_do_evento(k, marca)
            alvo = norm(marca.split()[0].split("-")[0])
            alvo = apelidos.get(alvo, alvo)
            melhor, onde = 0.0, None
            for i in range(cursor, len(chaves)):
                s = parecido(chaves[i], alvo)
                # a palavra colada ("Abumusa") também vale
                if s < minimo and alvo and chaves[i].startswith(alvo):
                    s = 0.9
                if s > melhor:
                    melhor, onde = s, i
                if s == 1.0:
                    break
            if onde is None or melhor < minimo:
                faltou.append(nome)
                continue
            p = ditas[onde]
            eventos[nome] = {"t": p["inicio"], "fim": p["fim"], "palavra": p["palavra"], "acao": ""}
            cursor = onde + 1
    return eventos, faltou


def _tokens_do_roteiro(texto: str) -> list[str]:
    return MARCA.sub(r"\1", texto).split()


def legenda_pelo_roteiro(falas: list[dict], transcript: dict) -> list[dict]:
    saida = []
    for k, fala in enumerate(falas, start=1):
        ditas = palavras_da_fala(transcript, k)
        roteiro = _tokens_do_roteiro(fala["texto"])
        a = [norm(p["palavra"]) for p in ditas]
        b = [norm(t) for t in roteiro]
        for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
            trecho = ditas[i1:i2]
            if op == "equal":
                saida += [{"palavra": roteiro[j1 + n], "inicio": p["inicio"], "fim": p["fim"]} for n, p in enumerate(trecho)]
            elif op == "delete":
                saida += [{"palavra": p["palavra"], "inicio": p["inicio"], "fim": p["fim"]} for p in trecho]
            elif op == "insert":
                continue  # palavra do roteiro que o Whisper não marcou: sem tempo, fica de fora
            else:  # replace
                if any(re.search(r"\d", p["palavra"]) for p in trecho):
                    # número em algarismo ("33", "1971", "70%."): fica como o Whisper escreveu
                    saida += [{"palavra": p["palavra"], "inicio": p["inicio"], "fim": p["fim"]} for p in trecho]
                    continue
                ini, fim = trecho[0]["inicio"], trecho[-1]["fim"]
                passo = (fim - ini) / max(1, j2 - j1)
                saida += [{"palavra": roteiro[j1 + n], "inicio": round(ini + n * passo, 3), "fim": round(ini + (n + 1) * passo, 3)} for n in range(j2 - j1)]
    return saida
