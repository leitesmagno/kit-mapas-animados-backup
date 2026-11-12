#!/usr/bin/env python3
"""Compara palavra por palavra o que a voz disse (whisper) com o roteiro das cenas.

    python3 scripts/comparar.py <whisper.json> <cenas.json>

Mostra só o que difere: palavra trocada, pulada ou inventada. O whisper escreve número
em algarismo e às vezes erra uma letra; isso aparece aqui e se julga no olho."""
import difflib
import json
import re
import sys
import unicodedata


def norm(p):
    p = unicodedata.normalize("NFD", p.lower())
    p = "".join(c for c in p if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", p)


def main():
    w = json.load(open(sys.argv[1]))["transcription"]
    ditas = [norm(s["text"]) for s in w]
    ditas = [p for p in ditas if p]
    cenas = json.load(open(sys.argv[2]))
    roteiro = [norm(p) for c in cenas for p in c["texto"].split()]
    roteiro = [p for p in roteiro if p]
    m = difflib.SequenceMatcher(a=roteiro, b=ditas, autojunk=False)
    difere = [(op, " ".join(roteiro[a1:a2]), " ".join(ditas[b1:b2])) for op, a1, a2, b1, b2 in m.get_opcodes() if op != "equal"]
    if not difere:
        print("transcrição igual ao roteiro")
        return
    print(f"{len(difere)} diferença(s) entre roteiro e fala:")
    for op, esperado, dito in difere:
        print(f"  roteiro: {esperado or '—':40}  fala: {dito or '—'}")


main()
