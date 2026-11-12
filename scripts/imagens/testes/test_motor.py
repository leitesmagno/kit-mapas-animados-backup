"""Testes do motor de imagens — TODOS com cliente falso (nenhuma chamada real à API).

    npm run imagens:testes
"""

from __future__ import annotations

import base64
import io
import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from PIL import Image

from scripts.imagens import cli
from scripts.imagens.acervo import Acervo
from scripts.imagens.gemini import ErroPermanente, ErroTemporario, GeradorGemini, SemImagem, classificar, custo_real, decodificar, extrair_imagem
from scripts.imagens.prompt import FichaVisual, PedidoDeImagem, PedidoInvalido, montar_prompt, validar


# ---- apoio ---------------------------------------------------------------------------------
def jpeg(w=64, h=36, cor=(10, 80, 90)) -> bytes:
    b = io.BytesIO()
    Image.new("RGB", (w, h), cor).save(b, "JPEG")
    return b.getvalue()


def resposta(dados: bytes | None = None, texto: str = "", status: str = "completed") -> dict:
    """O formato real da API (conferido em 2026-10-14): passo de raciocínio antes da imagem."""
    conteudo = []
    if texto:
        conteudo.append({"type": "text", "text": texto})
    if dados is not None:
        conteudo.append({"type": "image", "mime_type": "image/jpeg", "data": base64.b64encode(dados).decode()})
    return {
        "id": "v1_teste",
        "status": status,
        "steps": [{"type": "thought", "signature": "xyz"}, {"type": "model_output", "content": conteudo}],
        "usage": {"total_input_tokens": 100, "total_output_tokens": 1650, "total_thought_tokens": 0, "output_tokens_by_modality": [{"modality": "image", "tokens": 1120}]},
    }


class ErroHttp(Exception):
    def __init__(self, code):
        super().__init__(f"HTTP {code}")
        self.code = code


class ClienteFalso:
    def __init__(self, respostas):
        self.respostas = list(respostas)
        self.chamadas = []
        self.interactions = SimpleNamespace(create=self._create)

    def _create(self, **kw):
        self.chamadas.append(kw)
        r = self.respostas.pop(0)
        if isinstance(r, Exception):
            raise r
        return r


def gerador(respostas):
    cliente = ClienteFalso(respostas)
    return GeradorGemini(cliente=cliente, dormir=lambda s: None, log=lambda m: None), cliente


FICHA = FichaVisual(tema="Estreito de Ormuz", contexto="entre Irã e Omã", paleta=["teal", "ochre"], iluminacao="dawn", evitar=["warships"])


def pedido(**kw) -> PedidoDeImagem:
    base = dict(id="petroleiros", cena="cena-01", tipo="paisagem", descricao="two tankers at dawn", narracao="Por aqui passa o petróleo.")
    return PedidoDeImagem(**{**base, **kw})


@pytest.fixture
def projeto(tmp_path: Path) -> Path:
    pasta = tmp_path / "src" / "videos" / "g99-teste" / "imagens"
    pasta.mkdir(parents=True)
    (pasta / "pedidos.json").write_text(
        json.dumps(
            {
                "ficha": {"tema": "Estreito de Ormuz"},
                "imagens": [
                    {"id": "a", "cena": "cena-01", "tipo": "paisagem", "descricao": "tankers"},
                    {"id": "b", "cena": "cena-02", "tipo": "paisagem", "descricao": "tankers"},  # igual à "a"
                    {"id": "c", "cena": "cena-03", "tipo": "transicao", "descricao": "haze", "obrigatoria": False},
                ],
            }
        )
    )
    (tmp_path / "public").mkdir()
    return tmp_path


# ---- prompt ---------------------------------------------------------------------------------
def test_prompt_tem_tema_descricao_narracao_paleta_e_regras():
    p = montar_prompt(pedido(espaco_para_texto="esquerda"), FICHA)
    for trecho in ["Estreito de Ormuz", "two tankers at dawn", "Por aqui passa o petróleo.", "teal, ochre", "Lighting: dawn", "left third", "16:9 horizontal"]:
        assert trecho in p
    assert "no text, letters, numbers" in p and "no maps" in p and "no flags" in p and "warships" in p


def test_prompt_muda_por_tipo():
    assert "ILLUSTRATION" in montar_prompt(pedido(tipo="historica"), FICHA)
    assert "thumbnail" in montar_prompt(pedido(tipo="thumbnail"), FICHA).lower()
    assert montar_prompt(pedido(tipo="paisagem"), FICHA) != montar_prompt(pedido(tipo="apoio"), FICHA)


def test_prompt_deterministico():
    assert montar_prompt(pedido(), FICHA) == montar_prompt(pedido(), FICHA)


# ---- validação -------------------------------------------------------------------------------
@pytest.mark.parametrize(
    "kw,trecho",
    [
        ({"proporcao": "7:3"}, "proporção"),
        ({"tamanho": "512"}, "tamanho"),
        ({"tipo": "foto"}, "tipo"),
        ({"id": "Com Espaço"}, "id inválido"),
        ({"descricao": "  "}, "descrição"),
        ({"espaco_para_texto": "meio"}, "espaco_para_texto"),
        ({"referencias": ["nao/existe.png"]}, "não existe"),
    ],
)
def test_validacao_recusa(kw, trecho, tmp_path):
    with pytest.raises(PedidoInvalido, match=trecho):
        validar(pedido(**kw), FICHA, tmp_path)


def test_validacao_aceita_pedido_bom(tmp_path):
    validar(pedido(), FICHA, tmp_path)


# ---- extração da resposta -------------------------------------------------------------------
def test_extrai_imagem_depois_do_passo_de_raciocinio():
    dados = jpeg()
    r = extrair_imagem(resposta(dados))
    assert r.dados == dados and r.mime == "image/jpeg" and r.interacao == "v1_teste"


def test_extrai_de_objeto_do_sdk():
    dados = jpeg()
    bruto = resposta(dados)
    obj = SimpleNamespace(
        id="x",
        status="completed",
        steps=[SimpleNamespace(type="thought"), SimpleNamespace(type="model_output", content=[SimpleNamespace(type="image", data=bruto["steps"][1]["content"][0]["data"], mime_type="image/jpeg")])],
        output_image=None,
        output_text="",
        usage=None,
        errors=None,
    )
    assert extrair_imagem(obj).dados == dados


def test_resposta_sem_imagem_e_erro_permanente_com_o_texto():
    with pytest.raises(SemImagem, match="não posso"):
        extrair_imagem(resposta(None, texto="não posso gerar isso"))


def test_base64_invalido():
    with pytest.raises(SemImagem, match="base64"):
        decodificar("@@@não é base64@@@")


def test_custo_pelos_tokens():
    # 100 de entrada a 1,50 + 1120 de imagem a 30 + 530 de texto/raciocínio a 7,50 (por milhão)
    assert custo_real("models/gemini-nano-banana-2.1", resposta(b"")["usage"]) == pytest.approx((100 * 1.5 + 1120 * 30 + 530 * 7.5) / 1e6, abs=1e-5)


# ---- erros e novas tentativas ---------------------------------------------------------------
def test_classificacao():
    assert isinstance(classificar(ErroHttp(429)), ErroTemporario)
    assert isinstance(classificar(ErroHttp(503)), ErroTemporario)
    assert isinstance(classificar(ErroHttp(400)), ErroPermanente)
    assert isinstance(classificar(ErroHttp(403)), ErroPermanente)


def test_repete_erro_temporario_e_depois_gera():
    g, c = gerador([ErroHttp(429), ErroHttp(503), resposta(jpeg())])
    assert g.gerar("p", "gemini-nano-banana-2.1", "16:9", "2K").dados
    assert len(c.chamadas) == 3
    assert c.chamadas[0]["response_format"] == {"type": "image", "aspect_ratio": "16:9", "image_size": "2K"}


def test_nao_repete_erro_permanente():
    g, c = gerador([ErroHttp(400), resposta(jpeg())])
    with pytest.raises(ErroPermanente):
        g.gerar("p", "m", "16:9", "2K")
    assert len(c.chamadas) == 1


def test_desiste_depois_das_tentativas():
    g, c = gerador([ErroHttp(500)] * 10)
    with pytest.raises(ErroTemporario):
        g.gerar("p", "m", "16:9", "2K")
    assert len(c.chamadas) == g.tentativas


def test_referencias_vao_como_blocos_de_imagem():
    g, c = gerador([resposta(jpeg())])
    g.gerar("p", "m", "16:9", "1K", [(b"\x89PNG", "image/png")])
    entrada = c.chamadas[0]["input"]
    assert entrada[0] == {"type": "text", "text": "p"} and entrada[1]["type"] == "image" and entrada[1]["mime_type"] == "image/png"


# ---- gravação, cache, versões, revisão ------------------------------------------------------
def test_grava_arquivo_metadados_manifesto_e_uso(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, pedidos = ac.carregar_pedidos()
    g, _ = gerador([resposta(jpeg(64, 36))])
    img = ac.gerar(pedidos[0], ficha, g, log=lambda m: None)
    v = img["versoes"][img["atual"]]
    arquivo = projeto / "public" / v["arquivo"]
    assert arquivo.exists() and arquivo.read_bytes()[:2] == b"\xff\xd8"
    assert (v["largura"], v["altura"]) == (64, 36)
    assert json.loads(arquivo.with_suffix(".json").read_text())["pedido"]["cena"] == "cena-01"
    assert not list(arquivo.parent.glob("*.parcial"))
    man = json.loads((ac.pasta / "manifesto.json").read_text())
    assert man["imagens"]["a"]["estado"] == "gerada" and man["imagens"]["a"]["revisao"] == "pendente"
    assert (ac.pasta / "uso.jsonl").read_text().count('"ok"') == 1


def test_cache_nao_paga_de_novo_e_reaproveita_entre_cenas(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, b, _) = ac.carregar_pedidos()
    g, c = gerador([resposta(jpeg())])
    ac.gerar(a, ficha, g, log=lambda m: None)
    ac.gerar(a, ficha, g, log=lambda m: None)  # mesmo pedido
    img_b = ac.gerar(b, ficha, g, log=lambda m: None)  # outro id, mesmo prompt
    assert len(c.chamadas) == 1
    assert img_b["versoes"][img_b["atual"]]["arquivo"] == ac.manifesto()["imagens"]["a"]["versoes"][ac.manifesto()["imagens"]["a"]["atual"]]["arquivo"]


def test_parametro_diferente_invalida_cache(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, _, _) = ac.carregar_pedidos()
    g, c = gerador([resposta(jpeg()), resposta(jpeg(cor=(200, 0, 0)))])
    ac.gerar(a, ficha, g, log=lambda m: None)
    a.tamanho = "4K"
    ac.gerar(a, ficha, g, log=lambda m: None)
    assert len(c.chamadas) == 2 and len(ac.manifesto()["imagens"]["a"]["versoes"]) == 2


def test_regenerar_preserva_a_aprovada(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, _, _) = ac.carregar_pedidos()
    g, _ = gerador([resposta(jpeg()), resposta(jpeg(cor=(0, 0, 200)))])
    ac.gerar(a, ficha, g, log=lambda m: None)
    aprovada = ac.aprovar("a")
    img = ac.gerar(a, ficha, g, forcar=True, log=lambda m: None)
    assert img["aprovada"] == aprovada and img["atual"] != aprovada and img["atual"].endswith("-r2")
    for v in img["versoes"].values():
        assert (projeto / "public" / v["arquivo"]).exists()


def test_falha_registrada_no_manifesto(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, _, _) = ac.carregar_pedidos()
    g, _ = gerador([resposta(None, texto="recusado")])
    with pytest.raises(SemImagem):
        ac.gerar(a, ficha, g, log=lambda m: None)
    assert ac.manifesto()["imagens"]["a"]["estado"] == "falhou"
    assert '"erro"' in (ac.pasta / "uso.jsonl").read_text()


def test_bytes_que_nao_sao_imagem_nao_entram(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, _, _) = ac.carregar_pedidos()
    g, _ = gerador([resposta(b"isto nao e imagem")])
    with pytest.raises(SemImagem):
        ac.gerar(a, ficha, g, log=lambda m: None)
    assert not (projeto / "public" / "imagens-ia").exists() or not list((projeto / "public" / "imagens-ia").rglob("*.jpg"))


# ---- cena ↔ asset e disponibilidade no render ----------------------------------------------
def test_associacao_cena_asset_e_conferencia_do_render(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, b, _) = ac.carregar_pedidos()
    assert any("a (cena cena-01): não gerada" in p for p in ac.conferir())
    g, _ = gerador([resposta(jpeg())])
    ac.gerar(a, ficha, g, log=lambda m: None)
    ac.gerar(b, ficha, g, log=lambda m: None)
    assert ac.conferir() == []  # "c" é opcional
    assert {l["id"]: l["cena"] for l in ac.situacao()}["b"] == "cena-02"
    assert len(ac.conferir(final=True)) == 2  # ninguém aprovado ainda
    # o arquivo some antes do render → conferir acusa
    v = ac.manifesto()["imagens"]["a"]
    (projeto / "public" / v["versoes"][v["atual"]]["arquivo"]).unlink()
    assert any("arquivo sumiu" in p for p in ac.conferir())


def test_orfaos(projeto):
    ac = Acervo("g99-teste", projeto)
    solto = projeto / "public" / "imagens-ia" / "g99-teste" / "x" / "velho.jpg"
    solto.parent.mkdir(parents=True)
    solto.write_bytes(jpeg())
    assert any("velho.jpg" in o for o in ac.orfaos())


def test_cli_conferir_sai_com_erro(projeto, monkeypatch):
    monkeypatch.setattr("scripts.imagens.acervo.RAIZ", projeto)
    monkeypatch.setattr(Acervo.__init__, "__defaults__", (projeto, "imagens"))
    assert cli.main(["conferir", "g99-teste"]) == 1
    assert cli.main(["gerar", "g99-teste", "--sim"]) == 0  # simulação: nenhuma chamada


# ---- modelo por tarefa ----------------------------------------------------------------------
def test_apelidos_de_modelo():
    assert pedido(modelo="alta").modelo == "gemini-3-pro-image"
    assert pedido(modelo="padrao").modelo == "gemini-nano-banana-2.1"
    assert pedido(modelo="models/gemini-3-pro-image").modelo == "gemini-3-pro-image"
    assert pedido().modelo == "gemini-nano-banana-2.1"


def test_modelo_desconhecido_recusado(tmp_path):
    with pytest.raises(PedidoInvalido, match="modelo"):
        validar(pedido(modelo="gemini-inventado"), FICHA, tmp_path)


def test_custo_do_pro_pelos_tokens():
    uso = {"total_input_tokens": 18, "total_output_tokens": 1224, "output_tokens_by_modality": [{"modality": "image", "tokens": 1120}]}
    assert custo_real("gemini-3-pro-image", uso) == pytest.approx((18 * 2 + 1120 * 120 + 104 * 12) / 1e6, abs=1e-5)


def test_trocar_de_modelo_gera_de_novo(projeto):
    ac = Acervo("g99-teste", projeto)
    ficha, (a, _, _) = ac.carregar_pedidos()
    g, c = gerador([resposta(jpeg()), resposta(jpeg(cor=(9, 9, 9)))])
    ac.gerar(a, ficha, g, log=lambda m: None)
    a.modelo = "gemini-3-pro-image"
    ac.gerar(a, ficha, g, log=lambda m: None)
    assert [k["model"] for k in c.chamadas] == ["gemini-nano-banana-2.1", "gemini-3-pro-image"]


# ---- thumbnails à parte ---------------------------------------------------------------------
def test_capa_fica_separada_dos_assets_do_video(projeto):
    capa = projeto / "src" / "videos" / "g99-teste" / "capa"
    capa.mkdir()
    (capa / "pedidos.json").write_text(json.dumps({"ficha": {"tema": "Ormuz"}, "imagens": [{"id": "fundo-a", "cena": "capa", "tipo": "thumbnail", "descricao": "tanker", "modelo": "alta"}]}))
    ac = Acervo("g99-teste", projeto, conjunto="capa")
    ficha, (p,) = ac.carregar_pedidos()
    g, c = gerador([resposta(jpeg())])
    img = ac.gerar(p, ficha, g, log=lambda m: None)
    assert img["versoes"][img["atual"]]["arquivo"].startswith("imagens-ia/g99-teste-capa/")
    assert c.chamadas[0]["model"] == "gemini-3-pro-image"
    assert (capa / "manifesto.json").exists() and not (projeto / "src" / "videos" / "g99-teste" / "imagens" / "manifesto.json").exists()


# ---- ícones: o prompt e o recorte do fundo verde -------------------------------------------
def test_prompt_de_icone_pede_fundo_verde_e_aceita_centrado():
    p = montar_prompt(pedido(tipo="icone", proporcao="1:1", tamanho="1K", id="barril_de_petroleo"), FICHA)
    assert "#00FF00" in p and "square icon" in p
    assert "centered symmetrical" not in p  # a regra do "centrado" não vale para ícone


def test_id_com_underline_vale():
    validar(pedido(id="barril_de_petroleo"), FICHA, Path("."))


def test_recorte_tira_o_fundo_verde():
    from scripts.imagens.recortar import recortar_fundo

    im = Image.new("RGB", (200, 200), (0, 250, 10))
    for x in range(70, 130):
        for y in range(60, 140):
            im.putpixel((x, y), (30, 40, 120))
    b = io.BytesIO()
    im.save(b, "PNG")
    out = recortar_fundo(b.getvalue(), lado=128)
    assert out.mode == "RGBA" and out.size == (128, 128)
    assert out.getpixel((2, 2))[3] == 0  # o canto (fundo) ficou transparente
    r, g, bl, a = out.getpixel((64, 64))
    assert a == 255 and bl > g  # o objeto continua opaco e azul
