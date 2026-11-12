#!/usr/bin/env python3
"""Whisper LOCAL (faster-whisper, modelo "small", o mesmo tamanho do ggml-small do container) com a
saída no formato do whisper.cpp que os scripts *-sincronizar.py leem: {"transcription": [{"offsets":
{"from": ms, "to": ms}, "text": " palavra"}, …]}, uma palavra por item (como o `-ml 1 -sow`).

    node scripts/py.mjs venv-whisper scripts/narracao/whisper-local.py entrada.wav saida.json

Usado pelo scripts/sincronizar.py.
Instalar uma vez: python3 -m venv node_modules/.cache/venv-whisper && …/pip install faster-whisper
"""
import json
import sys
import wave

import numpy as np

from faster_whisper import WhisperModel

entrada, saida = sys.argv[1:3]
modelo = WhisperModel("small", device="cpu", compute_type="int8")
# o wav de 16 kHz mono que o sincronizar prepara, lido direto (sem o PyAV)
with wave.open(entrada) as w:
    assert w.getframerate() == 16000 and w.getnchannels() == 1
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
segmentos, _ = modelo.transcribe(audio, language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
itens = []
for s in segmentos:
    for w in s.words:
        itens.append({"offsets": {"from": round(w.start * 1000), "to": round(w.end * 1000)}, "text": " " + w.word.strip()})
json.dump({"model": "faster-whisper small", "transcription": itens}, open(saida, "w", encoding="utf-8"), ensure_ascii=False)
