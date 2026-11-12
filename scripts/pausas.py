#!/usr/bin/env python3
"""Encurta as pausas longas da narração e nivela o volume para as redes.

    python3 scripts/pausas.py <entrada.wav> <saida.wav> [pausa_maxima_s] [andamento]

Cada pausa acima do máximo perde só o MIOLO: ficam metade do máximo depois da palavra que
termina e metade antes da que começa (a respiração continua lá). Com andamento acima de 1,
a fala é acelerada sem mudar o tom, pelo atempo (WSOLA), que mantém as consoantes. O
rubberband embolava palavra: "mil vezes" virava "um milhão de vezes", "num canto" virava
"não canto". Sem andamento, a voz não é acelerada.
Depois, loudnorm em -16 LUFS (o padrão de TikTok, Reels e Shorts).
"""
import os, re, subprocess, sys

entrada, saida = sys.argv[1], sys.argv[2]
maxima = float(sys.argv[3]) if len(sys.argv) > 3 else 0.55
andamento = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
meia = maxima / 2

err = subprocess.run(
    ["ffmpeg", "-nostdin", "-hide_banner", "-i", entrada, "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
inicios = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", err)]
fins = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", err)]

cortes = [(a + meia, b - meia) for a, b in zip(inicios, fins) if b - a > maxima and a > 0.05]
filtro = "anull"
if cortes:
    tira = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in cortes)
    filtro = f"aselect='not({tira})',asetpts=N/SR/TB"
if andamento != 1.0:
    filtro += f",atempo={andamento}"
# Acabamento da voz (POLIR=0 desliga): tira o ronco grave, abre um pouco a presença, dá
# uma segurada nos picos e tira o chiado do "s". É o que separa "TTS cru" de "narração".
if os.environ.get("POLIR", "1") != "0":
    filtro += (
        ",highpass=f=85"
        ",equalizer=f=200:t=q:w=1.0:g=-2"
        ",equalizer=f=2600:t=q:w=1.4:g=2.5"
        ",equalizer=f=8000:t=h:g=1.5"
        ",deesser=i=0.35"
        ",acompressor=threshold=-20dB:ratio=3:attack=10:release=180:makeup=2"
    )
filtro += ",loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"

subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", entrada, "-af", filtro, "-c:a", "pcm_s16le", saida], check=True)
tirado = sum(b - a for a, b in cortes)
print(f"{len(cortes)} pausas encurtadas para {maxima:.2f}s (-{tirado:.1f}s) → {saida}")
