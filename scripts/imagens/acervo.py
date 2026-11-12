"""O ACERVO de imagens de um documentário: cache, versões, revisão e o manifesto do Remotion.

    src/videos/<doc>/imagens/pedidos.json    a ficha visual + o pedido de cada imagem (o autor escreve)
    src/videos/<doc>/imagens/manifesto.json  o que existe, a versão em uso e a revisão (o motor escreve,
                                             o Remotion importa)
    src/videos/<doc>/imagens/uso.jsonl       uma linha por chamada à API (custo, tokens, erro)
    src/videos/<doc>/capa/…                  o mesmo para as THUMBNAILS (conjunto "capa"), à parte
    public/imagens-ia/<doc>/<id>/<versao>.jpg + <versao>.json   os arquivos e os metadados de cada geração

O CACHE: a chave é o hash do prompt final + modelo + proporção + tamanho + o conteúdo de cada
referência + a versão da chamada. Mesma chave = mesma imagem, sem pagar de novo (inclusive entre
cenas: dois pedidos iguais dividem o arquivo). Mudou qualquer parâmetro = chave nova = geração nova.
Nenhuma geração apaga a anterior: a versão APROVADA continua em uso até outra ser aprovada.
"""

from __future__ import annotations

import hashlib
import io
import json
import os
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from .config import PRECO_POR_IMAGEM, RAIZ
from .gemini import ErroDeGeracao, GeradorGemini, SemImagem, custo_real
from .prompt import EXTENSOES_REF, FichaVisual, PedidoDeImagem, ficha_de_dict, montar_prompt, pedido_de_dict, todas_as_referencias, validar

VERSAO_DA_CHAMADA = "interactions/response_format/v1"  # muda se a forma de chamar a API mudar
EXTENSAO = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


def agora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def escrever_atomico(destino: Path, dados: bytes) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    tmp = destino.with_name(destino.name + ".parcial")
    tmp.write_bytes(dados)
    os.replace(tmp, destino)


def medir_imagem(dados: bytes) -> tuple[int, int]:
    """Abre a imagem de verdade (bytes corrompidos não entram no acervo)."""
    from PIL import Image

    try:
        with Image.open(io.BytesIO(dados)) as im:
            im.verify()
        with Image.open(io.BytesIO(dados)) as im:
            return im.size
    except Exception as e:  # noqa: BLE001
        raise SemImagem(f"os bytes recebidos não são uma imagem válida: {e}") from e


class Acervo:
    # `conjunto`: "imagens" (as do vídeo) ou "capa" (as thumbnails, guardadas À PARTE: outra pasta de
    # pedidos/manifesto e outra pasta em public/, para nunca se misturarem com os assets do vídeo)
    def __init__(self, documentario: str, raiz: Path = RAIZ, conjunto: str = "imagens"):
        self.doc = documentario
        self.raiz = raiz
        self.conjunto = conjunto
        self.pasta = raiz / "src" / "videos" / documentario / conjunto
        self.publico = raiz / "public" / "imagens-ia" / (documentario if conjunto == "imagens" else f"{documentario}-{conjunto}")
        if not (self.pasta / "pedidos.json").exists():
            raise FileNotFoundError(f"não achei {self.pasta / 'pedidos.json'}")

    # ---- leitura ---------------------------------------------------------------------------
    def carregar_pedidos(self) -> tuple[FichaVisual, list[PedidoDeImagem]]:
        bruto = json.loads((self.pasta / "pedidos.json").read_text(encoding="utf-8"))
        ficha = ficha_de_dict(bruto["ficha"])
        pedidos = [pedido_de_dict(p) for p in bruto.get("imagens", [])]
        ids = [p.id for p in pedidos]
        repetidos = {i for i in ids if ids.count(i) > 1}
        if repetidos:
            raise ValueError(f"ids repetidos em pedidos.json: {sorted(repetidos)}")
        return ficha, pedidos

    def manifesto(self) -> dict:
        arq = self.pasta / "manifesto.json"
        if arq.exists():
            return json.loads(arq.read_text(encoding="utf-8"))
        return {"documentario": self.doc, "imagens": {}}

    def salvar_manifesto(self, m: dict) -> None:
        escrever_atomico(self.pasta / "manifesto.json", (json.dumps(m, ensure_ascii=False, indent=1, sort_keys=True) + "\n").encode("utf-8"))

    def registrar_uso(self, linha: dict) -> None:
        with open(self.pasta / "uso.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps({"quando": agora(), **linha}, ensure_ascii=False) + "\n")

    # ---- cache -----------------------------------------------------------------------------
    def chave(self, pedido: PedidoDeImagem, ficha: FichaVisual, prompt: str) -> str:
        refs = [hashlib.sha256((self.raiz / r).read_bytes()).hexdigest() for r in todas_as_referencias(pedido, ficha)]
        base = {
            "prompt": prompt,
            "modelo": pedido.modelo.removeprefix("models/"),
            "proporcao": pedido.proporcao,
            "tamanho": pedido.tamanho,
            "referencias": refs,
            "chamada": VERSAO_DA_CHAMADA,
        }
        return hashlib.sha256(json.dumps(base, sort_keys=True).encode()).hexdigest()[:16]

    def achar_no_cache(self, m: dict, chave: str) -> dict | None:
        """A versão mais recente com esta chave, em QUALQUER imagem do documentário, com o arquivo no disco."""
        achadas = [
            v
            for img in m["imagens"].values()
            for v in img.get("versoes", {}).values()
            if v.get("chave") == chave and (self.raiz / "public" / v["arquivo"]).exists()
        ]
        return max(achadas, key=lambda v: v["gerada_em"]) if achadas else None

    # ---- geração ---------------------------------------------------------------------------
    def gerar(self, pedido: PedidoDeImagem, ficha: FichaVisual, gerador: GeradorGemini, forcar: bool = False, log=print) -> dict:
        validar(pedido, ficha, self.raiz)
        prompt = montar_prompt(pedido, ficha)
        chave = self.chave(pedido, ficha, prompt)
        m = self.manifesto()
        img = m["imagens"].setdefault(pedido.id, {"versoes": {}, "aprovada": None, "revisao": "pendente"})
        img.update(cena=pedido.cena, tipo=pedido.tipo, obrigatoria=pedido.obrigatoria, ilustrativa=pedido.ilustrativa)

        no_cache = None if forcar else self.achar_no_cache(m, chave)
        if no_cache:
            nome = no_cache["versao"]
            if nome not in img["versoes"]:  # vem de outra imagem: reaproveita o arquivo
                img["versoes"][nome] = {**no_cache, "reaproveitada_de": no_cache.get("id")}
                img["versoes"][nome]["id"] = pedido.id
            if img.get("atual") != nome:
                img["atual"] = nome
                img["revisao"] = "aprovada" if img.get("aprovada") == nome else "pendente"
            img["estado"] = "gerada"
            img.pop("erro", None)
            self.salvar_manifesto(m)
            log(f"{pedido.id}: no cache ({nome}) — nada pago")
            return img

        refs = []
        for r in todas_as_referencias(pedido, ficha):
            p = self.raiz / r
            refs.append((p.read_bytes(), EXTENSOES_REF[p.suffix.lower()]))
        log(f"{pedido.id}: gerando ({pedido.modelo}, {pedido.proporcao}, {pedido.tamanho}, {len(refs)} referência(s))…")
        try:
            r = gerador.gerar(prompt, pedido.modelo, pedido.proporcao, pedido.tamanho, refs)
            largura, altura = medir_imagem(r.dados)
        except ErroDeGeracao as e:
            img["estado"] = "falhou"
            img["erro"] = str(e)[:500]
            self.salvar_manifesto(m)
            self.registrar_uso({"id": pedido.id, "modelo": pedido.modelo, "tamanho": pedido.tamanho, "resultado": "erro", "erro": str(e)[:300]})
            raise

        repeticoes = sum(1 for v in img["versoes"].values() if v.get("chave") == chave)
        nome = chave if not repeticoes else f"{chave}-r{repeticoes + 1}"
        destino = self.publico / pedido.id / f"{nome}{EXTENSAO.get(r.mime, '.png')}"
        escrever_atomico(destino, r.dados)
        custo = custo_real(pedido.modelo, r.uso)
        versao = {
            "id": pedido.id,
            "versao": nome,
            "chave": chave,
            "arquivo": destino.relative_to(self.raiz / "public").as_posix(),
            "largura": largura,
            "altura": altura,
            "mime": r.mime,
            "modelo": pedido.modelo,
            "config": {"proporcao": pedido.proporcao, "tamanho": pedido.tamanho, "referencias": todas_as_referencias(pedido, ficha)},
            "prompt": prompt,
            "gerada_em": agora(),
            "interacao": r.interacao,
            "custo_usd": custo,
        }
        meta = {**versao, "pedido": asdict(pedido), "uso": r.uso, "texto_do_modelo": r.texto}
        escrever_atomico(destino.with_suffix(".json"), (json.dumps(meta, ensure_ascii=False, indent=1) + "\n").encode())
        img["versoes"][nome] = versao
        img["atual"] = nome
        img["estado"] = "gerada"
        img["revisao"] = "pendente"
        img.pop("erro", None)
        self.salvar_manifesto(m)
        self.registrar_uso({"id": pedido.id, "versao": nome, "modelo": pedido.modelo, "tamanho": pedido.tamanho, "resultado": "ok", "custo_usd": custo, "uso": r.uso})
        log(f"{pedido.id}: {largura}×{altura} → public/{versao['arquivo']}" + (f" (US$ {custo:.4f})" if custo is not None else ""))
        return img

    # ---- revisão ---------------------------------------------------------------------------
    def aprovar(self, id_: str, versao: str | None = None) -> str:
        m = self.manifesto()
        img = m["imagens"].get(id_)
        if not img or not img.get("versoes"):
            raise KeyError(f"{id_}: nenhuma versão gerada")
        versao = versao or img["atual"]
        if versao not in img["versoes"]:
            raise KeyError(f"{id_}: versão {versao} não existe ({', '.join(img['versoes'])})")
        img["aprovada"] = versao
        img["atual"] = versao
        img["revisao"] = "aprovada"
        img.pop("nota", None)
        self.salvar_manifesto(m)
        return versao

    def reprovar(self, id_: str, nota: str = "") -> None:
        m = self.manifesto()
        img = m["imagens"].get(id_)
        if not img or not img.get("atual"):
            raise KeyError(f"{id_}: nenhuma versão gerada")
        if img.get("aprovada") == img["atual"]:
            img["aprovada"] = None
        img["revisao"] = "reprovada"
        img["nota"] = nota
        self.salvar_manifesto(m)

    # ---- situação --------------------------------------------------------------------------
    def situacao(self) -> list[dict]:
        _, pedidos = self.carregar_pedidos()
        m = self.manifesto()
        linhas = []
        for p in pedidos:
            img = m["imagens"].get(p.id, {})
            em_uso = img.get("aprovada") or img.get("atual")
            v = img.get("versoes", {}).get(em_uso) if em_uso else None
            existe = bool(v and (self.raiz / "public" / v["arquivo"]).exists())
            linhas.append(
                {
                    "id": p.id,
                    "cena": p.cena,
                    "tipo": p.tipo,
                    "obrigatoria": p.obrigatoria,
                    "estado": img.get("estado", "pendente") if existe or img.get("estado") == "falhou" else "pendente",
                    "revisao": img.get("revisao", "pendente") if existe else "—",
                    "versoes": len(img.get("versoes", {})),
                    "arquivo": v["arquivo"] if existe else None,
                    "estimativa_usd": PRECO_POR_IMAGEM.get(p.modelo.removeprefix("models/"), {}).get(p.tamanho),
                    "erro": img.get("erro"),
                }
            )
        return linhas

    def gasto_total(self) -> float:
        arq = self.pasta / "uso.jsonl"
        if not arq.exists():
            return 0.0
        return round(sum((json.loads(l).get("custo_usd") or 0) for l in arq.read_text(encoding="utf-8").splitlines() if l.strip()), 4)

    def conferir(self, final: bool = False) -> list[str]:
        """Problemas que impedem o render (lista vazia = pode renderizar)."""
        problemas = []
        _, pedidos = self.carregar_pedidos()
        m = self.manifesto()
        for p in pedidos:
            if not p.obrigatoria:
                continue
            img = m["imagens"].get(p.id)
            em_uso = img and (img.get("aprovada") or img.get("atual"))
            if not em_uso:
                problemas.append(f"{p.id} (cena {p.cena}): não gerada" + (f" — último erro: {img['erro']}" if img and img.get("erro") else ""))
                continue
            v = img["versoes"][em_uso]
            if not (self.raiz / "public" / v["arquivo"]).exists():
                problemas.append(f"{p.id}: arquivo sumiu (public/{v['arquivo']})")
            elif final and not img.get("aprovada"):
                problemas.append(f"{p.id}: ainda não aprovada na revisão")
        return problemas

    def orfaos(self) -> list[str]:
        """Arquivos no disco que nenhuma versão do manifesto cita, e imagens sem pedido."""
        m = self.manifesto()
        citados = {v["arquivo"] for img in m["imagens"].values() for v in img.get("versoes", {}).values()}
        soltos = []
        if self.publico.exists():
            for f in sorted(self.publico.rglob("*")):
                if f.is_file() and f.suffix != ".json":
                    rel = f.relative_to(self.raiz / "public").as_posix()
                    if rel not in citados:
                        soltos.append(f"arquivo sem registro: public/{rel}")
        _, pedidos = self.carregar_pedidos()
        ids = {p.id for p in pedidos}
        soltos += [f"imagem sem pedido: {i}" for i in m["imagens"] if i not in ids]
        return soltos
