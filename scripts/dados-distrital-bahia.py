#!/usr/bin/env python3
"""Dados do trecho de mapa "distrital-bahia" (usado dentro do vídeo 011/013 do Estúdio 3D: o voto
distrital misto explicado com a Bahia).

    npm run dados -- distrital-bahia

  estado      a Bahia e o contorno do Brasil (IBGE, malha intermediária) → dados/ba.json, brasil.json
  municipios  os 417 municípios da Bahia com nome, população (estimativa IBGE) e um ponto de dentro
              → dados/municipios.json, dados/cidades.json
  distritos   ~20 DISTRITOS ILUSTRATIVOS: municípios vizinhos agrupados com população parecida
              (k-médias com peso de população e equilíbrio). O desenho real dos distritos não existe:
              o vídeo mostra isto com o selo "ILUSTRATIVO" → dados/distritos.json
"""
import json
import math
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "scripts"))
from mapas import ibge  # noqa: E402
from mapas.comum import baixar, gravar_json  # noqa: E402

DADOS = os.path.join(AQUI, "src", "videos", "distrital-bahia", "dados")
UF = "29"
N_DISTRITOS = 20


def estado():
    ba = ibge.malha("estados", UF, qualidade="intermediaria")
    br = ibge.malha("paises", "BR", qualidade="intermediaria")
    gravar_json(os.path.join(DADOS, "ba.json"), ba)
    gravar_json(os.path.join(DADOS, "brasil.json"), br)
    print("ba.json, brasil.json")


def municipios():
    from shapely.geometry import shape
    from shapely.ops import polylabel

    fc = ibge.malha("estados", UF, qualidade="intermediaria", intrarregiao="municipio")
    nomes = {str(m["id"]): m["nome"] for m in json.loads(baixar(f"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios"))}
    pops = {}
    for ano in ("2026", "2025", "2024"):
        try:
            url = f"https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/{ano}/variaveis/9324?localidades=N6%5BN3%5B{UF}%5D%5D"
            serie = json.loads(baixar(url, cache=f"pop-municipios-ba-{ano}.json"))[0]["resultados"][0]["series"]
            pops = {str(r["localidade"]["id"]): int(r["serie"][ano]) for r in serie}
            print(f"população: estimativa IBGE {ano}")
            break
        except Exception as e:  # noqa: BLE001
            print(f"população {ano}: {e}")
    cidades = []
    for f in fc["features"]:
        cod = str(f["properties"]["codarea"])
        f["properties"] = {"codigo": cod, "nome": nomes.get(cod, cod)}
        g = shape(f["geometry"]).buffer(0)
        maior = max(g.geoms, key=lambda p: p.area) if g.geom_type == "MultiPolygon" else g
        meio = polylabel(maior, tolerance=0.005)
        cidades.append({"cod": cod, "nome": nomes.get(cod, cod), "pop": pops.get(cod, 0), "meio": [round(meio.x, 4), round(meio.y, 4)]})
    gravar_json(os.path.join(DADOS, "municipios.json"), fc)
    cidades.sort(key=lambda c: -c["pop"])
    gravar_json(os.path.join(DADOS, "cidades.json"), cidades)
    print(f"municipios.json: {len(fc['features'])} · soma da população {sum(c['pop'] for c in cidades):,}")


def distritos():
    from shapely.geometry import mapping, shape
    from shapely.ops import unary_union

    fc = json.load(open(os.path.join(DADOS, "municipios.json"), encoding="utf-8"))
    cid = {c["cod"]: c for c in json.load(open(os.path.join(DADOS, "cidades.json"), encoding="utf-8"))}
    itens = []
    for f in fc["features"]:
        c = cid[f["properties"]["codigo"]]
        lon, lat = c["meio"]
        # coordenadas em km (aproximação local: 1° de longitude encolhe com o cosseno da latitude)
        itens.append({"cod": c["cod"], "nome": c["nome"], "pop": max(1, c["pop"]), "x": lon * 111 * math.cos(math.radians(13)), "y": lat * 111, "g": shape(f["geometry"]).buffer(0)})
    total = sum(i["pop"] for i in itens)
    alvo = total / N_DISTRITOS
    # vizinhança: municípios que encostam um no outro
    from shapely.strtree import STRtree

    arvore = STRtree([i["g"] for i in itens])
    viz = {i["cod"]: set() for i in itens}
    for a_, i in enumerate(itens):
        for b_ in arvore.query(i["g"].buffer(0.003)):
            if b_ != a_ and i["g"].buffer(0.003).intersects(itens[b_]["g"]):
                viz[i["cod"]].add(itens[b_]["cod"])
    por_cod = {i["cod"]: i for i in itens}
    # sementes: a maior cidade e, depois, sempre a mais longe das já escolhidas (com peso de população)
    sementes = [max(itens, key=lambda i: i["pop"])]
    while len(sementes) < N_DISTRITOS:
        sementes.append(max(itens, key=lambda i: min(math.hypot(i["x"] - s_["x"], i["y"] - s_["y"]) for s_ in sementes) * i["pop"] ** 0.35))
    grupo = {s_["cod"]: k for k, s_ in enumerate(sementes)}
    somas = [s_["pop"] for s_ in sementes]
    cx = [[s_["x"], s_["y"]] for s_ in sementes]
    # crescimento: o distrito com menos gente pega o vizinho livre mais perto do seu centro
    while len(grupo) < len(itens):
        candidatos = []
        for k in range(N_DISTRITOS):
            livres = {v for c, g in grupo.items() if g == k for v in viz[c] if v not in grupo}
            if livres:
                v = min(livres, key=lambda v: math.hypot(por_cod[v]["x"] - cx[k][0], por_cod[v]["y"] - cx[k][1]))
                candidatos.append((somas[k], k, v))
        if not candidatos:
            # ilha sem vizinho (raro): vai para o distrito mais perto
            for i in itens:
                if i["cod"] not in grupo:
                    k = min(range(N_DISTRITOS), key=lambda k: math.hypot(i["x"] - cx[k][0], i["y"] - cx[k][1]))
                    grupo[i["cod"]] = k
                    somas[k] += i["pop"]
            break
        _, k, v = min(candidatos)
        grupo[v] = k
        p_ = somas[k] + por_cod[v]["pop"]
        cx[k] = [(cx[k][0] * somas[k] + por_cod[v]["x"] * por_cod[v]["pop"]) / p_, (cx[k][1] * somas[k] + por_cod[v]["y"] * por_cod[v]["pop"]) / p_]
        somas[k] = p_
    saida = []
    for k in range(N_DISTRITOS):
        membros = [i for i in itens if grupo[i["cod"]] == k]
        if not membros:
            continue
        geo = unary_union([m["g"] for m in membros]).buffer(0.002).buffer(-0.002)
        nomes = [m["nome"] for m in sorted(membros, key=lambda m: -m["pop"])]
        saida.append({"type": "Feature", "properties": {"id": len(saida) + 1, "pop": sum(m["pop"] for m in membros), "maior": nomes[0], "municipios": len(membros), "temIlheus": "Ilhéus" in nomes}, "geometry": mapping(geo.simplify(0.004, preserve_topology=True))})
    gravar_json(os.path.join(DADOS, "distritos.json"), {"type": "FeatureCollection", "features": saida})
    pops = sorted(d["properties"]["pop"] for d in saida)
    il = next(d for d in saida if d["properties"]["temIlheus"])
    print(f"distritos.json: {len(saida)} distritos · população de {pops[0]:,} a {pops[-1]:,} (alvo {alvo:,.0f}) · Ilhéus no distrito {il['properties']['id']} ({il['properties']['maior']}, {il['properties']['municipios']} municípios)")


ETAPAS = {"estado": estado, "municipios": municipios, "distritos": distritos}
if __name__ == "__main__":
    os.makedirs(DADOS, exist_ok=True)
    for nome in sys.argv[1:] or list(ETAPAS):
        ETAPAS[nome]()
