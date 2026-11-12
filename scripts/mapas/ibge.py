"""Malhas e população do IBGE — dado público, e a base de qualquer mapa do Brasil.

O que dá para calcular, calcule: é isso que separa um vídeo com dado de um vídeo com
"segundo reportagens". A população por bairro, por exemplo, não vem pronta em lugar nenhum;
sai de somar os setores censitários de 2010 e ler os agregados por bairro de 2022 — e é o
que `populacao_por_bairro` faz.

Fontes (todas abertas):
  malhas          https://servicodados.ibge.gov.br/api/v3/malhas/
  Censo 2022      https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/
  Censo 2010      https://ftp.ibge.gov.br/Censos/Censo_Demografico_2010/Resultados_do_Universo/Agregados_por_Setores_Censitarios/
"""
import csv
import io
import json
import re
import struct
import zipfile

import numpy as np

from .comum import arredondar, baixar, sem_acento

MALHAS = "https://servicodados.ibge.gov.br/api/v3/malhas"
C2022 = "https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios"
C2010 = "https://ftp.ibge.gov.br/Censos/Censo_Demografico_2010/Resultados_do_Universo/Agregados_por_Setores_Censitarios"


def ler_dbf(dados):
    n, cab, reg = struct.unpack("<IHH", dados[4:12])
    campos, p = [], 32
    while dados[p] != 0x0D:
        campos.append((dados[p:p + 11].split(b"\0")[0].decode(), dados[p + 16]))
        p += 32
    linhas = []
    for i in range(n):
        base = cab + i * reg + 1
        linha, o = {}, 0
        for nome, tam in campos:
            linha[nome] = dados[base + o: base + o + tam].decode("utf-8", "replace").strip()
            o += tam
        linhas.append(linha)
    return linhas


def ler_shp_poligonos(dados):
    """Shapefile tipo 5 (polígono) → lista de GeoJSON Polygon/MultiPolygon.

    No shapefile o anel externo é horário e o buraco anti-horário; cada anel externo abre
    um polígono novo. É a mesma convenção que o MapLibre entende, então não se inverte nada.
    (No sistema em SVG com d3-geo é o contrário: lá o anel tem que ser endireitado, senão o
    d3 lê cada polígono como o complemento dele. Veja scripts/mapa-dados.py.)
    """
    geoms, p = [], 100
    while p < len(dados):
        _, tam = struct.unpack(">ii", dados[p:p + 8])
        conteudo = dados[p + 8: p + 8 + tam * 2]
        p += 8 + tam * 2
        tipo = struct.unpack("<i", conteudo[:4])[0]
        if tipo == 0:
            geoms.append(None)
            continue
        npartes, npontos = struct.unpack("<ii", conteudo[36:44])
        partes = list(struct.unpack(f"<{npartes}i", conteudo[44:44 + 4 * npartes])) + [npontos]
        pts = np.frombuffer(conteudo[44 + 4 * npartes: 44 + 4 * npartes + 16 * npontos], "<f8").reshape(-1, 2)
        poligonos = []
        for a, b in zip(partes, partes[1:]):
            anel = pts[a:b]
            area = np.sum(anel[:-1, 0] * anel[1:, 1] - anel[1:, 0] * anel[:-1, 1]) / 2
            if area < 0 or not poligonos:  # horário = externo
                poligonos.append([anel.tolist()])
            else:
                poligonos[-1].append(anel.tolist())
        geoms.append({"type": "Polygon", "coordinates": poligonos[0]} if len(poligonos) == 1 else {"type": "MultiPolygon", "coordinates": poligonos})
    return geoms


def malha(nivel, codigo, qualidade="maxima", intrarregiao=None):
    """O contorno de um município, estado ou país. nivel: municipios | estados | paises."""
    url = f"{MALHAS}/{nivel}/{codigo}?formato=application/vnd.geo+json&qualidade={qualidade}"
    if intrarregiao:
        url += f"&intrarregiao={intrarregiao}"
    fc = json.loads(baixar(url, cabecalhos={"Accept": "application/json"}))
    for f in fc["features"]:
        f["geometry"]["coordinates"] = arredondar(f["geometry"]["coordinates"])
    return fc


def bairros(codigo_municipio):
    """Os bairros de um município (malha do Censo 2022), como FeatureCollection."""
    z = zipfile.ZipFile(io.BytesIO(baixar(f"{C2022}/malha_com_atributos/bairros/shp/BR/BR_bairros_CD2022.zip", cache="BR_bairros_CD2022.zip")))
    dbf = ler_dbf(z.read("BR_bairros_CD2022.dbf"))
    geoms = ler_shp_poligonos(z.read("BR_bairros_CD2022.shp"))
    assert len(geoms) == len(dbf), "shp e dbf com contagens diferentes"
    feicoes = [
        {"type": "Feature", "properties": {"id": a["CD_BAIRRO"], "nome": a["NM_BAIRRO"], "areaKm2": round(float(a["AREA_KM2"]), 4)}, "geometry": {"type": g["type"], "coordinates": arredondar(g["coordinates"])}}
        for g, a in zip(geoms, dbf)
        if a["CD_MUN"] == str(codigo_municipio) and g is not None
    ]
    return {"type": "FeatureCollection", "features": feicoes}


def _arquivo_uf_2010(uf):
    """O zip de 2010 daquela UF (o nome tem um carimbo de data que muda de tempos em tempos)."""
    pagina = baixar(f"{C2010}/").decode("utf-8", "replace")
    achados = re.findall(rf'href="({uf}_\d+\.zip)"', pagina)
    if not achados:
        raise RuntimeError(f"não achei o arquivo de {uf} em {C2010}/")
    return achados[0]


def populacao_por_bairro(codigo_municipio, uf):
    """População residente por bairro em 2010 e 2022, CALCULADA dos arquivos do IBGE.

    2010: soma os setores censitários pelo nome do bairro do setor (Pessoa13, V001 = pessoas
    residentes). 2022: lê os agregados por bairro (básico, v0001 = total de pessoas), onde
    "." quer dizer bairro sem morador recenseado — é assim que aparece um aeroporto, um
    campus… ou um bairro que foi esvaziado.

    Devolve (tabela, total2010, total2022). Confira o total de 2010 contra a população
    oficial do município: se bater, o recorte dos setores está certo.
    """
    z22 = zipfile.ZipFile(io.BytesIO(baixar(f"{C2022}/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip", cache="bairros_basico_2022.zip")))
    nome22 = [n for n in z22.namelist() if n.endswith(".csv")][0]
    pop22, nomes = {}, {}
    for linha in csv.DictReader(io.StringIO(z22.read(nome22).decode("latin1")), delimiter=";"):
        if linha["CD_MUN"] == str(codigo_municipio):
            v = linha["v0001"]
            pop22[linha["CD_BAIRRO"]] = int(v) if v.isdigit() else 0
            nomes[linha["CD_BAIRRO"]] = linha["NM_BAIRRO"]

    arquivo = _arquivo_uf_2010(uf)
    z10 = zipfile.ZipFile(io.BytesIO(baixar(f"{C2010}/{arquivo}", cache=f"{uf}_2010.zip")))
    basico = [n for n in z10.namelist() if n.endswith("CSV/Basico_" + uf + ".csv")][0]
    pessoa = [n for n in z10.namelist() if n.endswith("CSV/Pessoa13_" + uf + ".csv")][0]
    setor_bairro = {}
    for linha in csv.DictReader(io.StringIO(z10.read(basico).decode("latin1")), delimiter=";"):
        if linha["Cod_municipio"] == str(codigo_municipio):
            setor_bairro[linha["Cod_setor"]] = linha["Nome_do_bairro"]
    pop10 = {}
    for linha in csv.DictReader(io.StringIO(z10.read(pessoa).decode("latin1")), delimiter=";"):
        b = setor_bairro.get(linha["Cod_setor"])
        if b is not None:
            v = linha["V001"]
            pop10[sem_acento(b)] = pop10.get(sem_acento(b), 0) + (int(v) if v.isdigit() else 0)

    tabela = [{"id": cd, "nome": nomes[cd], "pop2010": pop10.get(sem_acento(nomes[cd])), "pop2022": p22} for cd, p22 in sorted(pop22.items())]
    return tabela, sum(pop10.values()), sum(pop22.values())
