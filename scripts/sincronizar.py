#!/usr/bin/env python3
"""A SINCRONIA de um vídeo com a narração: a voz é o RELÓGIO do vídeo inteiro.

    npm run sincronizar -- exemplo-vertical

Lê as falas em public/<pastaDoAudio>/<id>.mp3 (uma fala por arquivo, gravada por você ou gerada pela
ElevenLabs), transcreve cada uma com o Whisper local (faster-whisper, timestamp por palavra) e grava em
src/videos/<pasta>/narracao/:

    transcript.json   as frases e as palavras, em segundos do VÍDEO
    eventos.json      o instante de cada PALAVRA-GATILHO (é dele que o roteiro.ts tira os quadros)
    cenas.json        o mesmo, por fala
    legenda.json      (só no modo [colchetes]) a legenda com a grafia do roteiro

e public/<pastaDoAudio>/full.mp3 (a narração inteira, para ouvir de uma vez).

A configuração fica em src/videos/<pasta>/sincronia.json:

    {
      "pastaDoAudio": "audios/narracao/meu-video",   // em public/
      "falas": ["mv-01", "mv-02", …],                 // a ordem (sem falas.json)
      "inicio": 0.05,                                 // respiro antes da 1ª palavra (s)
      "pausa": 0.16,                                  // entre uma fala e a seguinte (s)
      "pausas": {"mv-03": 0.4},                       // respiro maior ANTES dessa fala
      "correcoes": [[["deca", "das"], "Décadas"]],    // o que o Whisper escreve errado (só na legenda)
      "gatilhos": {"mv-01": [["maiorRio", "o maior rio"], …]},   // nome do evento → frase, EM ORDEM
      "apelidos": {"kharg": "carga"},                 // (modo [colchetes]) como o Whisper escreve a palavra
      "ajustes": {"maiorRio": ["mv-01", 1.23]}        // o início medido à mão (fala, segundos no arquivo)
    }

Dois modos de dizer onde cada animação acontece:
  * GATILHOS nomeados (o exemplo vertical): cada fala lista (nome, frase); o roteiro usa q("nome").
  * [COLCHETES] (o exemplo horizontal): o texto fica em falas.json com as palavras-gatilho entre
    colchetes ("um [corredor] de água"); o evento vira "NN.palavra" ("01.corredor").

Se um gatilho não for encontrado na fala, o script PARA: melhor quebrar aqui do que o vídeo mostrar
uma coisa enquanto a voz fala de outra. Depois do Whisper, o início de cada palavra-gatilho é medido na
energia do áudio (o Whisper erra até ~0,2 s em sequência de nomes).
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "scripts", "narracao"))
import falas as roteiro_falado  # noqa: E402

VENV_WHISPER = os.path.join(RAIZ, "node_modules", ".cache", "venv-whisper", *(("Scripts", "python.exe") if os.name == "nt" else ("bin", "python")))


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9-]", "", s)


def ler_json(caminho, padrao=None):
    if not os.path.exists(caminho):
        return padrao
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def gravar_json(caminho, dado):
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dado, f, ensure_ascii=False, indent=1)


def transcrever(arquivo, cache_dir):
    """O Whisper de uma fala (com cache pelo conteúdo do arquivo): {"transcription": [{offsets, text}, …]}."""
    caminho = os.path.join(RAIZ, "public", arquivo)
    h = hashlib.sha1(open(caminho, "rb").read()).hexdigest()[:12]
    cache = os.path.join(cache_dir, f"whisper-{os.path.basename(arquivo)}-{h}.json")
    if os.path.exists(cache):
        return ler_json(cache)
    if not os.path.exists(VENV_WHISPER):
        sys.exit("✗ o Whisper não está instalado: rode  npm run instalar")
    os.makedirs(cache_dir, exist_ok=True)
    tmp = tempfile.mkdtemp()
    try:
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", caminho, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", f"{tmp}/a.wav"], check=True)
        subprocess.run([VENV_WHISPER, os.path.join(RAIZ, "scripts", "narracao", "whisper-local.py"), f"{tmp}/a.wav", f"{tmp}/a.json"], check=True)
        shutil.copy(f"{tmp}/a.json", cache)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return ler_json(cache)


def duracao(arquivo):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                          os.path.join(RAIZ, "public", arquivo)]).decode())


def corrigir(palavras, correcoes):
    """Troca na METADATA (a legenda) o que o Whisper escreveu errado; a voz fica como está."""
    saida, i = [], 0
    while i < len(palavras):
        for de, para in correcoes:
            de = [norm(x) for x in de]
            trecho = [norm(p["palavra"]) for p in palavras[i:i + len(de)]]
            if trecho == de:
                pont = re.findall(r"[,.?!;:]+$", palavras[i + len(de) - 1]["palavra"])
                saida.append({**palavras[i], "palavra": para + (pont[0] if pont else ""), "fim": palavras[i + len(de) - 1]["fim"],
                              "whisper": " ".join(p["palavra"] for p in palavras[i:i + len(de)])})
                i += len(de)
                break
        else:
            saida.append(palavras[i])
            i += 1
    return saida


def linha_do_tempo(arquivos, cfg, pausas, cache_dir):
    audios, palavras, relogio = [], [], cfg.get("inicio", 0.05)
    for k, (fala, arquivo) in enumerate(arquivos):
        if k:
            relogio += pausas.get(fala, cfg.get("pausa", 0.16))
        d = transcrever(arquivo, cache_dir)
        dur = duracao(arquivo)
        for s in d["transcription"]:
            t = s["text"].strip()
            if not t:
                continue
            fim = min(s["offsets"]["to"] / 1000, dur)
            palavras.append({"palavra": t, "inicio": round(relogio + min(s["offsets"]["from"] / 1000, dur - 0.05), 3),
                             "fim": round(relogio + fim, 3), "parte": k + 1})
        audios.append({"arquivo": arquivo, "inicio": round(relogio, 3), "duracao": round(dur, 3)})
        relogio += dur
    return audios, corrigir(palavras, cfg.get("correcoes", [])), round(relogio, 3)


def segmentos_de(palavras):
    frases, atual = [], []
    for p in palavras:
        atual.append(p)
        if re.search(r"[.?!]$", p["palavra"]):
            frases.append(atual)
            atual = []
    if atual:
        frases.append(atual)
    return [{"id": i, "inicio": f[0]["inicio"], "fim": f[-1]["fim"], "texto": " ".join(p["palavra"] for p in f)} for i, f in enumerate(frases)]


NUMEROS = {"um": "1", "uma": "1", "dois": "2", "duas": "2", "tres": "3", "quatro": "4", "cinco": "5", "seis": "6", "sete": "7",
           "oito": "8", "nove": "9", "dez": "10", "cem": "100", "mil": "1000"}


def parecida(chaves, alvo, cursor):
    """O início do trecho (do tamanho do alvo) mais parecido com a frase, a partir do cursor."""
    alvo = [NUMEROS.get(w, w) for w in alvo]
    melhor, onde = 0.0, None
    for i in range(cursor, len(chaves) - len(alvo) + 1):
        trecho = [NUMEROS.get(w, w) for w in chaves[i:i + len(alvo)]]
        nota = sum(roteiro_falado.parecido(x, y) for x, y in zip(trecho, alvo)) / len(alvo)
        if nota > melhor:
            melhor, onde = nota, i
    return onde if melhor >= 0.6 else None


def eventos_nomeados(palavras, ids, gatilhos):
    """Cada (nome, frase) procurada DENTRO da fala dela, em ordem, cada uma depois da anterior."""
    nomes = [n for i in ids for n, *_ in gatilhos.get(i, [])]
    repetidos = sorted({n for n in nomes if nomes.count(n) > 1})
    if repetidos:
        sys.exit(f"✗ nomes de evento repetidos: {', '.join(repetidos)}")
    eventos, faltou, aproximados = {}, [], []
    for k, fala in enumerate(ids, start=1):
        ditas = [p for p in palavras if p["parte"] == k]
        chaves = [norm(p["palavra"]) for p in ditas]
        cursor = 0
        for item in gatilhos.get(fala, []):
            nome, frase = item[0], item[1]
            acao = item[2] if len(item) > 2 else ""
            alvo = [norm(w) for w in frase.split()]
            achou = next((i for i in range(cursor, len(chaves) - len(alvo) + 1) if chaves[i:i + len(alvo)] == alvo), None)
            if achou is None:
                # sem a frase exata: a mais PARECIDA dentro da fala (o Whisper escreve "parentins",
                # "2 metros", "Malhé"…); vale se a média de semelhança das palavras passar de 0,6
                achou = parecida(chaves, alvo, cursor)
                if achou is None:
                    faltou.append(f"{nome} (\"{frase}\" na fala {fala})")
                    continue
                aproximados.append(f"{nome}: \"{frase}\" ≈ \"{' '.join(p['palavra'] for p in ditas[achou:achou + len(alvo)])}\"")
            ultima = ditas[achou + len(alvo) - 1]
            eventos[nome] = {"t": ditas[achou]["inicio"], "fim": ultima["fim"],
                             "palavra": " ".join(p["palavra"] for p in ditas[achou:achou + len(alvo)]), "acao": acao}
            cursor = achou + len(alvo)
    if aproximados:
        print("\ngatilhos achados por semelhança (confira): " + " · ".join(aproximados))
    return eventos, faltou


def refinar_inicios(eventos, transcript):
    """O INÍCIO REAL de cada palavra-gatilho, medido no áudio: o vale de energia antes da palavra e o
    instante em que a voz passa de 18% do pico local. Só corrige se o vale for claro e a diferença
    ≤ 0,25 s. O tempo do Whisper fica guardado em "whisper"."""
    import numpy as np
    sr, k = 16000, 160
    envs = {}
    for a in transcript["audios"]:
        bruto = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAIZ, "public", a["arquivo"]), "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True).stdout
        x = np.frombuffer(bruto, np.int16).astype(float)
        envs[a["arquivo"]] = (a["inicio"], np.sqrt(np.convolve(x ** 2, np.ones(k) / k, "same")))
    mudou = []
    for nome, e in eventos.items():
        if e.get("medido"):
            continue
        tw = e.get("whisper", e["t"])
        a = next((a for a in transcript["audios"] if a["inicio"] <= tw < a["inicio"] + a["duracao"] + 0.05), None)
        if a is None:
            continue
        ini, env = envs[a["arquivo"]]
        rel = tw - ini
        # o vale tem que ficar DEPOIS do fim da palavra anterior (senão pega o vale antes de um "de")
        idx = next((i for i, p in enumerate(transcript["palavras"]) if abs(p["inicio"] - tw) < 1e-3), None)
        antes = transcript["palavras"][idx - 1]["fim"] - ini if idx else rel - 0.3
        i0, i1 = max(0, int(max(rel - 0.3, antes - 0.03) * sr)), min(len(env) - 1, int((rel + 0.35) * sr))
        if i1 - i0 < k * 4:
            continue
        janela = env[i0:i1]
        lim = 0.18 * (janela.max() or 1.0)
        v1 = int((rel + 0.05) * sr) - i0
        vale = int(np.argmin(janela[: max(1, v1)]))
        if janela[vale] > 0.5 * lim:  # sem vale claro (fala colada): fica o Whisper
            continue
        acima = np.nonzero(janela[vale:] > lim)[0]
        if not len(acima):
            continue
        novo = round(ini + (i0 + vale + acima[0]) / sr, 3)
        if abs(novo - tw) <= 0.25:
            e["whisper"], e["t"] = tw, novo
            if abs(novo - tw) >= 0.04:
                mudou.append(f"{nome} {tw:.2f}→{novo:.2f}")
    print(f"\ninícios medidos no áudio: {len(mudou)} eventos corrigidos (≥ 40 ms)" + (": " + " · ".join(mudou) if mudou else ""))


def ajustar(eventos, transcript, ajustes):
    """Os inícios medidos à mão: evento → (fala, segundos dentro do arquivo dela)."""
    for nome, (fala, rel) in ajustes.items():
        a = next(a for a in transcript["audios"] if a["arquivo"].endswith(f"{fala}.mp3"))
        e = eventos[nome]
        e["whisper"], e["t"], e["medido"] = e.get("whisper", e["t"]), round(a["inicio"] + rel, 3), True
    if ajustes:
        print(f"ajustados à mão: {', '.join(ajustes)}")


def por_cena(ids, transcript, pasta_video, pasta_audio):
    saida = []
    for k, (cena, a) in enumerate(zip(ids, transcript["audios"])):
        palavras = [p for p in transcript["palavras"] if p["parte"] == k + 1]
        frases = [s for s in transcript["segmentos"] if a["inicio"] - 0.01 <= s["inicio"] < a["inicio"] + a["duracao"]]
        saida.append({
            "scene": cena, "arquivo": a["arquivo"], "start": a["inicio"], "end": round(a["inicio"] + a["duracao"], 3),
            "texto": " ".join(p["palavra"] for p in palavras),
            "segments": [{"start": s["inicio"], "end": s["fim"], "text": s["texto"]} for s in frases],
            "words": [{"word": re.sub(r"[,.?!;:…]+$", "", p["palavra"]), "start": p["inicio"], "end": p["fim"]} for p in palavras],
        })
    gravar_json(os.path.join(pasta_video, "cenas.json"), saida)
    # full.mp3: cada fala no instante dela, com os respiros
    entradas, filtros = [], []
    for i, a in enumerate(transcript["audios"]):
        entradas += ["-i", os.path.join(RAIZ, "public", a["arquivo"])]
        ms = round(a["inicio"] * 1000)
        filtros.append(f"[{i}]adelay={ms}|{ms}[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(transcript["audios"])))
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *entradas, "-filter_complex",
                    ";".join(filtros) + f";{mix}amix=inputs={len(transcript['audios'])}:normalize=0:duration=longest",
                    "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(RAIZ, "public", pasta_audio, "full.mp3")], check=True)
    print(f"cenas.json: {len(saida)} falas · full.mp3: {transcript['duracao']:.2f} s")


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: npm run sincronizar -- <pasta do vídeo em src/videos/>")
    pasta = sys.argv[1].strip("/")
    dir_video = os.path.join(RAIZ, "src", "videos", pasta)
    pasta_video = os.path.join(dir_video, "narracao")
    cfg = ler_json(os.path.join(dir_video, "sincronia.json"))
    if cfg is None:
        sys.exit(f"✗ falta src/videos/{pasta}/sincronia.json (veja o do exemplo-vertical)")
    falas = ler_json(os.path.join(dir_video, "falas.json"))
    pasta_audio = cfg["pastaDoAudio"]
    ids = [f["id"] for f in falas] if falas else cfg["falas"]
    pausas = dict(cfg.get("pausas", {}))
    if falas:  # o "pausaDepois" de uma fala vira o respiro ANTES da seguinte
        for i, f in enumerate(falas[:-1]):
            if f.get("pausaDepois"):
                pausas.setdefault(falas[i + 1]["id"], f["pausaDepois"])
    existem = [i for i in ids if os.path.exists(os.path.join(RAIZ, "public", pasta_audio, f"{i}.mp3"))]
    if not existem:
        sys.exit(f"✗ nenhuma fala em public/{pasta_audio}/ (esperava {ids[0]}.mp3, {ids[1] if len(ids) > 1 else ''}…)")
    faltam = [i for i in ids if i not in existem]
    if faltam:
        print(f"(ainda sem áudio: {', '.join(faltam)} — o vídeo vai até a última fala pronta)")
    # só as falas seguidas desde a primeira (um buraco no meio desalinharia a numeração das falas)
    prontas = []
    for i in ids:
        if i not in existem:
            break
        prontas.append(i)

    cache_dir = os.path.join(RAIZ, "node_modules", ".cache", "whisper", pasta)
    arquivos = [(i, f"{pasta_audio}/{i}.mp3") for i in prontas]
    audios, palavras, total = linha_do_tempo(arquivos, cfg, pausas, cache_dir)
    segmentos = segmentos_de(palavras)
    transcript = {"audios": audios, "duracao": total, "segmentos": segmentos, "palavras": palavras}
    os.makedirs(pasta_video, exist_ok=True)
    gravar_json(os.path.join(pasta_video, "transcript.json"), transcript)

    if falas:
        eventos, faltou = roteiro_falado.eventos_por_fala(falas[:len(prontas)], transcript, apelidos=cfg.get("apelidos"))
        legenda = roteiro_falado.legenda_pelo_roteiro(falas[:len(prontas)], transcript)
        gravar_json(os.path.join(pasta_video, "legenda.json"), legenda)
    else:
        eventos, faltou = eventos_nomeados(palavras, prontas, cfg.get("gatilhos", {}))

    print(f"narração: {len(audios)} falas, {total:.2f} s (a fala termina em {palavras[-1]['fim']:.2f} s)\n")
    for s in segmentos:
        print(f"  {s['inicio']:6.2f}–{s['fim']:6.2f}  {s['texto']}")
    for p in (p for p in palavras if "whisper" in p):
        print(f"  correção {p['inicio']:6.2f}  \"{p['whisper']}\" → \"{p['palavra']}\"")
    if faltou:
        print(f"\n✗ gatilhos NÃO encontrados na fala: {', '.join(faltou)}")
        print("  Confira como o Whisper escreveu a palavra (acima) e ajuste a frase do gatilho, ou ponha uma correção/apelido no sincronia.json.")
        sys.exit(1)

    refinar_inicios(eventos, transcript)
    ajustar(eventos, transcript, cfg.get("ajustes", {}))
    gravar_json(os.path.join(pasta_video, "eventos.json"), {"duracao": total, "fimDaFala": palavras[-1]["fim"], "eventos": eventos})
    print("\neventos:")
    for nome, e in eventos.items():
        print(f"  {e['t']:6.2f}s  {nome:<16} \"{e['palavra']}\"")
    por_cena(prontas, transcript, pasta_video, pasta_audio)


if __name__ == "__main__":
    main()
