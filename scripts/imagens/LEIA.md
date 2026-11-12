# Motor de imagens (Gemini Nano Banana 2.1)

Gera as imagens ilustrativas dos documentários horizontais (16:9) numa **etapa separada do
render**. O Remotion só lê o que já está no disco: nada de chamada à API durante o render.

## Preparar (uma vez)

```bash
npm run imagens:preparar          # venv em node_modules/.cache/venv-imagens (google-genai 2.31.0, pillow, pytest)
# no .env (nunca no código):  GEMINI_API_KEY=...
npm run imagens:testes            # testes com cliente falso, sem gastar
```

## Fluxo de um documentário

1. Escreva `src/videos/<doc>/imagens/pedidos.json`: a **ficha visual** (tema, contexto, paleta,
   luz, o que evitar, referências aprovadas) e um **pedido** por imagem (id, cena, tipo,
   descrição, trecho da narração, objetivo, proporção, tamanho). Exemplo:
   `src/videos/exemplo-horizontal/imagens/pedidos.json`.
2. `npm run imagens -- gerar <doc> --sim` mostra os prompts finais e a estimativa, sem chamar a API.
3. `npm run imagens -- gerar <doc> [ids…] [--limite-usd 0.50]` gera o que não está no cache.
4. Revise: `npm run imagens -- status <doc>`, depois `aprovar <doc> <id>` ou
   `reprovar <doc> <id> --nota "…"` e `gerar <doc> <id> --forcar` para outra versão.
5. Na cena: `imagemDoManifesto(manifesto, "<id>")` + `<ImagemIA … movimento={…} />` (src/kit).
6. `npm run imagens -- conferir <doc> [--final]` antes do render .

## Thumbnails (conjunto `capa`)

O fundo das thumbnails fica **à parte** dos assets do vídeo: `src/videos/<doc>/capa/pedidos.json`
→ `public/imagens-ia/<doc>-capa/`. Todos os comandos valem com `--conjunto capa`
(`gerar`, `status`, `aprovar`, `reprovar`, `conferir`). Para alternativas, ponha vários pedidos
(`capa-a`, `capa-b`…) e escolha pela prop `fundo` da composição da capa; o TÍTULO é código
(props `linhas`/`destaque`): trocar o texto não gera imagem nova.

**Thumbnail por camadas** (skill `thumbnail-chamativa`): no mesmo conjunto `capa`, pedidos
`"tipo": "fundo"` (só o cenário) e `"tipo": "elemento"` (peça isolada no verde); depois
`npm run imagens -- recortes <doc>` → `public/imagens-ia/<doc>-capa/recortes/<id>.png` (mantém a
proporção e apaga "cópias fantasma" soltas). Foto comum: `recortar-foto <entrada> <saida.png>` (rembg,
opcional). A montagem é a receita `capa/thumb-*.json` + `npm run thumb -- <doc>`.

## Ícones 3D (conjunto `icones`)

`src/videos/<doc>/icones/pedidos.json` com pedidos `"tipo": "icone"` (1:1, 1K; o id é o NOME do
ícone, com `_`). O prompt pede o ícone no estilo de emoji 3D sobre **verde puro**; depois:

    npm run imagens -- gerar <doc> --conjunto icones
    npm run imagens -- icones <doc>      recorta o fundo (chroma key, despill, corte justo, 512 px)
                                         → public/assets/icones-3d/<id>.png

Ponha o nome em `src/kit/assets.ts` (`ICONES`) e ele vale em `PainelNumero`, `IconeDestaque`,
`ParteDoTodo` e nas batidas `icone`/`proporcao`. O recorte está em `scripts/imagens/recortar.py`.

## Modelo por tarefa (`modelo` no pedido)

| valor | modelo | quando | preço de tabela (1K / 2K / 4K) |
|---|---|---|---|
| `padrao` (ou omitido) | `gemini-nano-banana-2.1` | o grosso das imagens do documentário | US$ 0,034 / 0,050 / 0,113 |
| `alta` | `gemini-3-pro-image` (Nano Banana Pro) | thumbnail e imagem de destaque | US$ 0,134 / 0,134 / 0,24 |

Os dois respondem pela mesma API de Interactions; ambos foram testados com chamada real em
2026-10-14. Trocar o modelo muda a chave do cache, então a imagem é gerada de novo. Cada chamada
tem timeout de 180 s, e o timeout conta como erro temporário.

## Tipos de imagem (`tipo`)

`historica` (ilustração, nunca "foto"), `conceitual`, `paisagem`, `apoio` (economia, indústria,
militar e política, sem insígnias), `transicao`, `thumbnail`, `movimento` (margem para zoom).

Toda imagem leva as regras fixas: **sem texto, mapa, bandeira, brasão, logotipo ou pessoa real**.
Nomes, números, rótulos e mapas entram por código, com dados verificados. Toda imagem gerada fica
marcada como `ilustrativa` no manifesto.

## Onde fica cada coisa

| arquivo | quem escreve | versionado |
|---|---|---|
| `src/videos/<doc>/imagens/pedidos.json` | o autor | sim |
| `src/videos/<doc>/imagens/manifesto.json` | o motor (o Remotion importa) | sim |
| `src/videos/<doc>/imagens/uso.jsonl` | o motor (custo e tokens por chamada) | sim |
| `public/imagens-ia/<doc>/<id>/<versao>.jpg` e `.json` | o motor (imagem e metadados completos) | não (como todo `public/`) |

**Cache:** a chave é o hash de prompt final, modelo, proporção, tamanho, conteúdo das
referências e forma de chamada. Com a mesma chave, a imagem não é paga de novo, inclusive entre
cenas. Se um parâmetro mudar, a imagem é gerada outra vez. Nenhuma versão é apagada, e a
**aprovada** continua em uso até outra ser aprovada. `orfaos <doc>` lista arquivos sem registro.

**Erros:** 408, 429 e 5xx têm até 4 tentativas, com espera crescente. 400, 401, 403, 404,
resposta sem imagem (recusa) e bytes inválidos falham na hora e ficam registrados no manifesto.

## A API (conferida em 2026-10-14)

- Modelo `gemini-nano-banana-2.1` (a API devolve o nome canônico `models/gemini-nano-banana-2.1`).
- `client.interactions.create(model=…, input=…, response_format={"type": "image", "aspect_ratio": "16:9", "image_size": "2K"})`.
  O `generation_config.image_config` do exemplo antigo está **deprecated** no SDK.
- A resposta traz um passo `thought` e depois um `model_output` com `{type: "image", mime_type, data: <base64>}`.
- 2K em 16:9 = 2752×1536 JPEG. Preço de tabela: US$ 0,0336 (1K), 0,0504 (2K) e 0,113 (4K). O
  custo real inclui os tokens de raciocínio: a primeira imagem 2K saiu a US$ 0,0543.
