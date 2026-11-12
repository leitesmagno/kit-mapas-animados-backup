"""Utilidades da pipeline de dados de mapa: baixar com cache, gravar, arredondar.

Toda a pipeline roda NA MÃO, antes do render. O render nunca busca nada: ele lê os JSON de
src/videos/<video>/ e os arquivos de public/. É essa separação que deixa o render offline e
repetível — e é ela que impede o vídeo de mudar sozinho quando uma API muda.
"""
import gzip
import json
import os
import unicodedata
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLICO = os.path.join(RAIZ, "public")
CACHE = os.path.join(RAIZ, "node_modules", ".cache", "mapas")
UA = {"User-Agent": "videos-de-mapas/1.0"}
CASAS = 6  # ~0,1 m: sobra precisão para qualquer zoom que um vídeo use


def baixar(url, dados=None, cabecalhos=None, cache=None):
    """Baixa com cache em node_modules/.cache/mapas (rodar de novo não rebaixa 50 MB)."""
    if cache:
        caminho = os.path.join(CACHE, cache)
        if os.path.exists(caminho):
            return open(caminho, "rb").read()
    req = urllib.request.Request(url, data=dados, headers={**UA, **(cabecalhos or {})})
    with urllib.request.urlopen(req, timeout=300) as r:
        bruto = r.read()
    if bruto[:2] == b"\x1f\x8b":
        bruto = gzip.decompress(bruto)
    if cache:
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        open(caminho, "wb").write(bruto)
    return bruto


def gravar_json(caminho, obj):
    """Grava um JSON compacto (eles entram no bundle do Remotion; espaço em branco pesa)."""
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  → {os.path.relpath(caminho, RAIZ)} ({os.path.getsize(caminho) // 1024} KB)")


def arredondar(c):
    if isinstance(c[0], (int, float)):
        return [round(c[0], CASAS), round(c[1], CASAS)]
    return [arredondar(x) for x in c]

def sem_acento(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s) if unicodedata.category(ch) != "Mn").lower().strip()
