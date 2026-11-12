"""A linha de comando do motor de imagens (etapa SEPARADA do render).

    npm run imagens -- gerar <doc> [ids…] [--forcar] [--limite-usd 1.00] [--sim]
    npm run imagens -- prompt <doc> <id>             mostra o prompt final (sem API)
    npm run imagens -- status <doc>                  o que falta, revisão, custo
    npm run imagens -- aprovar <doc> <id> [--versao V]
    npm run imagens -- reprovar <doc> <id> [--nota "…"]
    npm run imagens -- conferir <doc> [--final]      sai com erro se falta imagem obrigatória
    npm run imagens -- orfaos <doc>
    npm run imagens -- icones <doc>                  recorta os ícones (conjunto "icones") para o kit
    npm run imagens -- recortes <doc> [ids…]         recorta os "elemento" da capa → public/imagens-ia/<doc>-capa/recortes/
    npm run imagens -- recortar-foto <entrada> <saida.png>   tira o fundo de uma foto comum (rembg)

<doc> é a pasta do vídeo em src/videos/ (ex.: exemplo-horizontal). Com --conjunto capa, os
mesmos comandos valem para as thumbnails (src/videos/<doc>/capa/pedidos.json).
"""

from __future__ import annotations

import argparse
import sys

from .acervo import Acervo
from .config import PRECO_POR_IMAGEM
from .gemini import ErroDeGeracao, GeradorGemini
from .prompt import PedidoInvalido, montar_prompt, validar


def _escolher(pedidos, ids):
    if not ids:
        return pedidos
    por_id = {p.id: p for p in pedidos}
    faltam = [i for i in ids if i not in por_id]
    if faltam:
        raise SystemExit(f"ids não existem em pedidos.json: {', '.join(faltam)}")
    return [por_id[i] for i in ids]


def cmd_gerar(a) -> int:
    acervo = Acervo(a.doc, conjunto=a.conjunto)
    ficha, pedidos = acervo.carregar_pedidos()
    escolhidos = _escolher(pedidos, a.ids)
    for p in escolhidos:  # valida tudo antes de gastar
        validar(p, ficha, acervo.raiz)
    estimativa = sum(PRECO_POR_IMAGEM.get(p.modelo.removeprefix("models/"), {}).get(p.tamanho, 0) for p in escolhidos)
    print(f"{len(escolhidos)} imagem(ns); no máximo ~US$ {estimativa:.3f} se nenhuma estiver no cache")
    if a.limite_usd is not None and estimativa > a.limite_usd:
        print(f"passa do limite (US$ {a.limite_usd:.2f}): nada foi gerado")
        return 2
    if a.sim:
        for p in escolhidos:
            print(f"\n=== {p.id} (cena {p.cena}) ===\n{montar_prompt(p, ficha)}")
        return 0
    gerador = GeradorGemini()
    falhas = 0
    try:
        for p in escolhidos:
            try:
                acervo.gerar(p, ficha, gerador, forcar=a.forcar)
            except ErroDeGeracao as e:
                falhas += 1
                print(f"{p.id}: FALHOU — {e}", file=sys.stderr)
    except KeyboardInterrupt:  # o que já foi gerado fica salvo; o resto continua pendente
        print("\ninterrompido: as imagens restantes continuam pendentes", file=sys.stderr)
        return 130
    print(f"gasto registrado neste documentário: US$ {acervo.gasto_total():.4f}")
    return 1 if falhas else 0


def cmd_prompt(a) -> int:
    acervo = Acervo(a.doc, conjunto=a.conjunto)
    ficha, pedidos = acervo.carregar_pedidos()
    (p,) = _escolher(pedidos, [a.id])
    validar(p, ficha, acervo.raiz)
    print(montar_prompt(p, ficha))
    return 0


def cmd_status(a) -> int:
    acervo = Acervo(a.doc, conjunto=a.conjunto)
    linhas = acervo.situacao()
    for l in linhas:
        obrig = "" if l["obrigatoria"] else " (opcional)"
        extra = f"  ← {l['erro'][:120]}" if l["erro"] and l["estado"] == "falhou" else ""
        print(f"{l['id']:<32} cena {l['cena']:<10} {l['tipo']:<11} {l['estado']:<9} revisão: {l['revisao']:<10} versões: {l['versoes']}{obrig}{extra}")
    pendentes = [l for l in linhas if l["estado"] != "gerada"]
    falta = sum(l["estimativa_usd"] or 0 for l in pendentes)
    aprovadas = sum(1 for l in linhas if l["revisao"] == "aprovada")
    print(f"\n{len(linhas)} pedidas · {len(pendentes)} a gerar (~US$ {falta:.3f}) · {aprovadas} aprovadas · gasto até agora US$ {acervo.gasto_total():.4f}")
    return 0


def cmd_aprovar(a) -> int:
    v = Acervo(a.doc, conjunto=a.conjunto).aprovar(a.id, a.versao)
    print(f"{a.id}: versão {v} aprovada")
    return 0


def cmd_reprovar(a) -> int:
    Acervo(a.doc, conjunto=a.conjunto).reprovar(a.id, a.nota)
    print(f"{a.id}: reprovada (a versão aprovada anterior, se havia, continua guardada)")
    return 0


def cmd_conferir(a) -> int:
    problemas = Acervo(a.doc, conjunto=a.conjunto).conferir(final=a.final)
    if problemas:
        print("NÃO renderize — imagens com problema:", *problemas, sep="\n  ", file=sys.stderr)
        return 1
    print("imagens ok para o render")
    return 0


def cmd_orfaos(a) -> int:
    soltos = Acervo(a.doc, conjunto=a.conjunto).orfaos()
    print("\n".join(soltos) if soltos else "nenhum órfão")
    return 0


def cmd_icones(a) -> int:
    """Recorta o fundo verde dos ícones gerados (conjunto "icones") e grava o PNG transparente no
    banco do kit (public/assets/icones-3d/<id>.png), onde PainelNumero/Icone3D os acham pelo nome."""
    from .recortar import recortar_arquivo

    acervo = Acervo(a.doc, conjunto="icones")
    m = acervo.manifesto()
    destino = acervo.raiz / "public" / "assets" / "icones-3d"
    feitos = 0
    for id_, img in sorted(m["imagens"].items()):
        nome = img.get("aprovada") or img.get("atual")
        if not nome:
            continue
        v = img["versoes"][nome]
        w, h = recortar_arquivo(acervo.raiz / "public" / v["arquivo"], destino / f"{id_}.png")
        feitos += 1
        print(f"{id_}: {w}×{h} → public/assets/icones-3d/{id_}.png")
    print(f"{feitos} ícone(s) recortado(s). Ponha os nomes em src/kit/assets.ts (ICONES).")
    return 0


def cmd_recortes(a) -> int:
    """Recorta o fundo verde dos pedidos "elemento" do conjunto capa (as peças da thumbnail),
    mantendo a proporção: public/imagens-ia/<doc>-capa/recortes/<id>.png, que a composição Thumb lê."""
    from .recortar import recortar_arquivo

    acervo = Acervo(a.doc, conjunto="capa")
    m = acervo.manifesto()
    destino = acervo.publico / "recortes"
    feitos = 0
    for id_, img in sorted(m["imagens"].items()):
        if img.get("tipo") != "elemento" or (a.ids and id_ not in a.ids):
            continue
        nome = img.get("aprovada") or img.get("atual")
        if not nome:
            continue
        v = img["versoes"][nome]
        w, h = recortar_arquivo(acervo.raiz / "public" / v["arquivo"], destino / f"{id_}.png", lado=None, margem=0.03)
        feitos += 1
        print(f"{id_}: {w}×{h} → {(destino / f'{id_}.png').relative_to(acervo.raiz / 'public')}")
    print(f"{feitos} elemento(s) recortado(s).")
    return 0


def cmd_recortar_foto(a) -> int:
    from pathlib import Path

    from .recortar import recortar_foto

    w, h = recortar_foto(Path(a.entrada), Path(a.saida))
    print(f"{a.saida}: {w}×{h}")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="imagens", description="motor de imagens (Gemini) dos documentários")
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("gerar")
    g.add_argument("doc")
    g.add_argument("ids", nargs="*")
    g.add_argument("--forcar", action="store_true", help="gera de novo mesmo com cache (guarda a anterior)")
    g.add_argument("--limite-usd", type=float, default=None)
    g.add_argument("--sim", action="store_true", help="simulação: mostra os prompts, não chama a API")
    g.set_defaults(f=cmd_gerar)
    p = sub.add_parser("prompt")
    p.add_argument("doc")
    p.add_argument("id")
    p.set_defaults(f=cmd_prompt)
    s = sub.add_parser("status")
    s.add_argument("doc")
    s.set_defaults(f=cmd_status)
    ap_ = sub.add_parser("aprovar")
    ap_.add_argument("doc")
    ap_.add_argument("id")
    ap_.add_argument("--versao")
    ap_.set_defaults(f=cmd_aprovar)
    r = sub.add_parser("reprovar")
    r.add_argument("doc")
    r.add_argument("id")
    r.add_argument("--nota", default="")
    r.set_defaults(f=cmd_reprovar)
    c = sub.add_parser("conferir")
    c.add_argument("doc")
    c.add_argument("--final", action="store_true", help="exige revisão aprovada")
    c.set_defaults(f=cmd_conferir)
    o = sub.add_parser("orfaos")
    o.add_argument("doc")
    o.set_defaults(f=cmd_orfaos)
    ic = sub.add_parser("icones", help="recorta o fundo dos ícones e grava em public/assets/icones-3d")
    ic.add_argument("doc")
    ic.set_defaults(f=cmd_icones)
    rc = sub.add_parser("recortes", help="recorta os elementos da thumbnail (conjunto capa, tipo elemento)")
    rc.add_argument("doc")
    rc.add_argument("ids", nargs="*")
    rc.set_defaults(f=cmd_recortes)
    rf = sub.add_parser("recortar-foto", help="tira o fundo de uma foto comum com o rembg")
    rf.add_argument("entrada")
    rf.add_argument("saida")
    rf.set_defaults(f=cmd_recortar_foto)
    for sp in (g, p, s, ap_, r, c, o):
        sp.add_argument("--conjunto", default="imagens", choices=["imagens", "capa", "icones"], help="capa = as thumbnails; icones = os ícones 3D (guardados à parte)")
    a = ap.parse_args(argv)
    try:
        return a.f(a)
    except (PedidoInvalido, KeyError, FileNotFoundError, ValueError) as e:
        print(f"erro: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
