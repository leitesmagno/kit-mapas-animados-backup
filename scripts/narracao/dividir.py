#!/usr/bin/env python3
"""DIVIDE uma gravação inteira (o roteiro todo lido de uma vez) em um arquivo por fala.

    node scripts/py.mjs venv-whisper scripts/narracao/dividir.py <gravacao> <falas.json> <pasta de saída>

<falas.json>: [{"id": "am-01", "texto": "…"}, …] (o texto como a voz leu). O Whisper marca cada
palavra da gravação; o roteiro e o que foi dito são alinhados palavra a palavra (difflib), e o corte
entre uma fala e a seguinte cai no MEIO do silêncio entre a última palavra de uma e a primeira da
outra. Grava <pasta>/<id>.wav (sem tratamento: quem trata é o scripts/voz.ts).
"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))


def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return re.sub(r"[^a-z0-9]+", "", "".join(c for c in t if unicodedata.category(c) != "Mn"))


def tokens(texto):
    texto = re.sub(r"<[^>]+>", " ", texto)  # <break …/>
    texto = re.sub(r"\[([^\]]+)\]", r"\1", texto)  # [gatilho]
    return [n for n in (norm(w) for w in texto.split()) if n]


def main():
    gravacao, arq_falas, saida = sys.argv[1:4]
    falas = json.load(open(arq_falas, encoding="utf-8"))
    os.makedirs(saida, exist_ok=True)
    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, "a.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", gravacao, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], check=True)
    print("  ouvindo a gravação (Whisper)…")
    subprocess.run([sys.executable, os.path.join(AQUI, "whisper-local.py"), wav, os.path.join(tmp, "a.json")], check=True)
    ditas = [{"t": w["text"].strip(), "ini": w["offsets"]["from"] / 1000, "fim": w["offsets"]["to"] / 1000}
             for w in json.load(open(os.path.join(tmp, "a.json"), encoding="utf-8"))["transcription"] if norm(w["text"])]
    if not ditas:
        sys.exit("✗ não encontrei fala na gravação")
    duracao = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", gravacao]).decode())

    # o roteiro em tokens, lembrando onde cada fala começa
    roteiro, comeco = [], []
    for f in falas:
        comeco.append(len(roteiro))
        roteiro += tokens(f["texto"])
    a = roteiro
    b = [norm(w["t"]) for w in ditas]
    # para cada token do roteiro, o token dito correspondente (quando bate)
    par = {}
    for bloco in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(bloco.size):
            par[bloco.a + k] = bloco.b + k

    def dito_em(i):
        """o índice da palavra dita que corresponde ao token i do roteiro (ou à próxima que bate)."""
        for j in range(i, min(i + 12, len(a))):
            if j in par:
                return par[j] - (j - i) if par[j] - (j - i) >= 0 else par[j]
        return None

    cortes = [0.0]
    for n in range(1, len(falas)):
        j = dito_em(comeco[n])
        if j is None or j == 0:
            sys.exit(f"✗ não achei o começo da fala {falas[n]['id']} na gravação. Confira se o texto lido é o do roteiro.")
        fim_anterior, ini_seguinte = ditas[j - 1]["fim"], ditas[j]["ini"]
        cortes.append(round((fim_anterior + ini_seguinte) / 2, 3) if ini_seguinte > fim_anterior else round(ini_seguinte - 0.02, 3))
    cortes.append(duracao)

    for n, f in enumerate(falas):
        ini, fim = cortes[n], cortes[n + 1]
        if fim - ini < 0.3:
            sys.exit(f"✗ a fala {f['id']} ficou curta demais ({fim - ini:.2f} s): confira a gravação")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", gravacao, "-ss", f"{ini:.3f}", "-to", f"{fim:.3f}",
                        "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", os.path.join(saida, f"{f['id']}.wav")], check=True)
        print(f"  {f['id']}  {ini:7.2f}–{fim:7.2f} s")


if __name__ == "__main__":
    main()
