#!/usr/bin/env python3
"""O TRATAMENTO DOS SILÊNCIOS de uma fala gerada (o "SilenceTrimmer" do projeto).

    python3 scripts/silencios.py <bruto> <final.mp3|.wav> ['{"limiarDb":-42,...}']

    bruto → detecta os silêncios → encurta só os longos → acabamento de voz → nível final

O TTS deixa pausas grandes entre as frases. Cortar todas deixa a fala atropelada; aqui cada
pausa é tratada pelo tamanho dela (os parâmetros vêm do `tratamento` do projeto.ts):

  - abaixo de `limiarDb` é silêncio. A respiração da voz fica ACIMA do limiar: não é tocada;
  - pausa até `pausaCurta` (vírgula, respiração, a pausa natural): fica inteira;
  - pausa maior: o que passa da curta é comprimido (`compressao`: 0,35 = cada segundo a mais
    vira 0,35 s), e nenhuma passa de `pausaMaxima`. Uma pausa de 1,2 s vira ~0,67 s; uma de
    0,5 s vira ~0,42 s — a hierarquia (vírgula < ponto < fim de bloco) continua lá;
  - do miolo da pausa é que se tira: fica um pouco mais depois da palavra que termina (o
    decaimento da voz) do que antes da que começa;
  - começo e fim do arquivo: sobram `pontas` segundos (o respiro ENTRE cenas é decidido na
    sincronia, não aqui).

Depois, o mesmo acabamento de voz do scripts/pausas.py (grave, presença, "s", compressão
leve), o `andamento` (atempo: a fala mais rápida sem mudar o tom; 1 = como veio) e loudnorm no
`lufs` do projeto.
O relatório (cada pausa, antes → depois) vai para <bruto>.silencios.json.
"""
import json
import os
import re
import subprocess
import sys

PADRAO = {"limiarDb": -42, "pausaCurta": 0.38, "compressao": 0.35, "pausaMaxima": 0.7, "pontas": 0.06, "lufs": -16, "andamento": 1}


def duracao(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


def silencios(f, limiar, minimo=0.12):
    err = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-i", f, "-af", f"silencedetect=noise={limiar}dB:d={minimo}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    inicios = [float(x) for x in re.findall(r"silence_start: (-?[0-9.]+)", err)]
    fins = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", err)]
    total = duracao(f)
    if len(fins) < len(inicios):  # silêncio até o fim do arquivo
        fins.append(total)
    return [(max(0.0, a), b) for a, b in zip(inicios, fins)], total


def alvo_da_pausa(d, c):
    if d <= c["pausaCurta"]:
        return d
    return min(c["pausaMaxima"], c["pausaCurta"] + (d - c["pausaCurta"]) * c["compressao"])


def main():
    entrada, saida = sys.argv[1], sys.argv[2]
    c = {**PADRAO, **(json.loads(sys.argv[3]) if len(sys.argv) > 3 else {})}
    pausas, total = silencios(entrada, c["limiarDb"])

    cortes, relatorio = [], []
    for a, b in pausas:
        d = b - a
        # o silencedetect fecha o último silêncio um pouco antes do fim do arquivo: folga de 80 ms
        if a <= 0.05:  # o silêncio da frente
            if b - c["pontas"] > 0.005:
                cortes.append((0.0, b - c["pontas"]))
            relatorio.append({"tipo": "inicio", "de": round(d, 3), "para": round(min(d, c["pontas"]), 3)})
        elif b >= total - 0.08:  # o do fim
            if a + c["pontas"] < total - 0.005:
                cortes.append((a + c["pontas"], total))
            relatorio.append({"tipo": "fim", "de": round(d, 3), "para": round(min(d, c["pontas"]), 3)})
        else:
            alvo = alvo_da_pausa(d, c)
            if d - alvo > 0.01:
                cortes.append((a + alvo * 0.55, b - alvo * 0.45))
            relatorio.append({"tipo": "pausa", "em": round(a, 3), "de": round(d, 3), "para": round(alvo, 3)})

    filtro = "anull"
    if cortes:
        tira = "+".join(f"between(t,{x:.4f},{y:.4f})" for x, y in cortes)
        filtro = f"aselect='not({tira})',asetpts=N/SR/TB"
    if os.environ.get("POLIR", "1") != "0":
        filtro += (
            ",highpass=f=80"
            ",equalizer=f=200:t=q:w=1.0:g=-1.5"
            ",equalizer=f=2600:t=q:w=1.4:g=2"
            ",equalizer=f=8000:t=h:g=1.2"
            ",deesser=i=0.3"
            ",acompressor=threshold=-20dB:ratio=2.5:attack=10:release=180:makeup=2"
        )
    if abs(c["andamento"] - 1) > 1e-3:
        filtro += f",atempo={c['andamento']}"
    filtro += f",loudnorm=I={c['lufs']}:TP=-1.5:LRA=11,aresample=44100"
    codec = ["-c:a", "libmp3lame", "-b:a", "192k"] if saida.endswith(".mp3") else ["-c:a", "pcm_s16le"]
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", entrada, "-af", filtro, "-ac", "1", *codec, saida], check=True)

    tirado = sum(y - x for x, y in cortes)
    meio = [p for p in relatorio if p["tipo"] == "pausa"]
    with open(os.path.splitext(entrada)[0] + ".silencios.json", "w", encoding="utf-8") as f:
        json.dump({"parametros": c, "bruto": round(total, 3), "final": round(duracao(saida), 3), "pausas": relatorio}, f, ensure_ascii=False, indent=1)
    encurtadas = sum(1 for p in meio if p["para"] < p["de"] - 0.01)
    print(f"  {len(meio)} pausas no meio ({encurtadas} encurtadas), −{tirado:.2f} s → {saida}")


if __name__ == "__main__":
    main()
