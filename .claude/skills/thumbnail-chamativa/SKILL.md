---
name: thumbnail-chamativa
description: Cria thumbnails de YouTube que dão vontade de clicar, montadas por camadas como um editor profissional, neste projeto — conceito com lacuna de curiosidade, fundo e elementos gerados no Nano Banana (scripts/imagens), recorte do fundo (chroma key ou rembg), composição no Remotion (kit/thumb) com fonte de impacto, contorno grosso, letra 3D, brilho atrás do assunto, seta, círculo, selo e bandeira, e folha de conferência no tamanho do celular. Serve para o 16:9 (vídeo longo/documentário, 1280×720) e para a capa do Shorts/Reels (1080×1920). Use SEMPRE que a pessoa pedir thumbnail, thumb, capa do vídeo, miniatura, imagem de capa para o YouTube, "capa chamativa", "melhora essa thumb", variações A/B de capa, ou quiser trocar o título da capa de um vídeo deste projeto — mesmo que não diga "thumbnail".
---

# Thumbnail chamativa

A thumbnail é o anúncio do vídeo: compete com outras dez no feed, a ~360 px de largura (e 168 px
nos sugeridos), por menos de um segundo de atenção. Ela ganha o clique quando, de relance, a pessoa
entende **o assunto** e sente **uma pergunta** que só o vídeo responde. Tudo nesta skill serve a
isso: um foco só, contraste brutal, pouco texto e muito grande, e uma promessa verdadeira.

O jeito de fazer é o de um editor: **camadas**. O Nano Banana gera o cenário e cada peça isolada;
o recorte tira o fundo das peças; o Remotion monta tudo com fontes, contornos, brilhos e setas
**por código**. Separar as camadas é o que permite reposicionar, trocar o texto e testar variações
sem pagar imagem nova.

## Regras do projeto que valem aqui

- **A IA nunca faz texto, mapa, bandeira nem pessoa real.** Título, números, bandeiras
  (`bandeira` no recorte), ícones do kit e mapas entram por código, com dado conferido. A IA faz
  cenário, objetos, animais, veículos, construções genéricas, personagens genéricos.
- **Promessa verdadeira.** O número ou a afirmação da capa tem de estar no vídeo e na fonte do
  vídeo (`dados.ts`/`DATA_SOURCES.md`). Curiosidade, sim; mentira, não: capa que engana derruba a
  retenção e o canal.
- **Toda thumbnail (e toda imagem que a pessoa pedir) é feita no Remotion e aparece no Studio.**
  O Nano Banana só fornece camadas (fundo, elementos); a peça final é sempre uma composição. Cada
  receita `src/videos/<doc>/capa/thumb-*.json` vira sozinha um Still na pasta `Thumbs-<doc>` do
  Studio (`src/kit/thumb/registro.tsx`), id `Thumb-<doc>-<nome>`: é ali que a pessoa vê, ajusta e
  renderiza. Nunca entregue só um PNG solto ou só a imagem do Banana.
- O `npm run thumb` (PNG + folha) é a SUA conferência de qualidade antes de entregar; o render final
  é da pessoa, pelo Studio (ou `npm run thumb -- <doc>`).
- A chave do Gemini fica só no `.env`. Gerar imagem custa dinheiro: diga a estimativa (`--sim`)
  antes de lotes grandes.

## O fluxo

### 1. Conceito antes de pixel

Leia `references/conceito.md`. Descubra (no roteiro, nos dados, na narração do vídeo) **qual é a
pergunta** que prende. Pense em pelo menos 5 conceitos, de padrões diferentes (número gigante,
"o que é isso?", comparação A × B, escala absurda, antes × depois, revelação no mapa, proibido…),
e escolha os 2–3 mais fortes. Para cada um, defina em uma linha:

- **foco** (o único assunto que o olho acha primeiro);
- **texto** de 2 a 4 palavras que NÃO repete o título do vídeo (complementa: título conta, capa provoca);
- **paleta** de duas cores que brigam (laranja × azul, amarelo × roxo, vermelho × ciano);
- **elementos** (no máximo 3 além do texto: recorte, seta/círculo, selo).

Mostre os conceitos aa pessoa em poucas linhas e siga com o escolhido (ou com os 2–3 como
variações A/B se ele quiser testar).

### 2. Pedir as imagens ao Nano Banana

Leia `references/nano-banana.md`. Os pedidos vão no conjunto `capa` do vídeo
(`src/videos/<doc>/capa/pedidos.json`, crie se não existir):

- `"tipo": "fundo"`: só o cenário, com luz forte atrás do centro (o brilho que separa o assunto);
- `"tipo": "elemento"`: cada peça isolada no verde puro, para virar recorte;
- `"modelo": "alta"` (Nano Banana Pro) para o fundo e o elemento principal; `padrao` para peças menores.

```bash
npm run imagens -- gerar <doc> --conjunto capa --sim     # prompts + custo, sem gastar
npm run imagens -- gerar <doc> --conjunto capa            # gera o que falta
npm run imagens -- recortes <doc>                          # tira o verde → public/imagens-ia/<doc>-capa/recortes/<id>.png
npm run imagens -- recortar-foto <foto.jpg> public/…/x.png # foto comum (sem verde): rembg
```

Olhe cada imagem gerada (Read no arquivo) antes de montar: se o elemento veio cortado na borda,
com verde no objeto ou com texto inventado, `reprovar … --nota` e gere de novo.

Antes de gerar, veja o que já existe e é de graça: um **quadro do próprio vídeo** (mapa, satélite)
como fundo dá identidade e não custa nada (`npx remotion still <Composicao> public/… --frame=N`);
os ícones 3D de `public/assets/icones-3d/` e as bandeiras de `public/assets/bandeiras/` entram
direto como recorte.

### 3. Montar a receita

Leia `references/receitas.md` (o catálogo das camadas e layouts prontos). Cada variação é um JSON
`src/videos/<doc>/capa/thumb-<nome>.json` desenhado pela composição `Thumb` (`src/kit/thumb`):
fundo (ou dois, com divisão) → brilho/raios → recortes → seta/círculo → texto → selo.

O que faz parecer trabalho de editor, e não montagem:
- o assunto **grande** (ocupa 40–60% da altura) e cortado com coragem, perto da câmera;
- **brilho colorido atrás** do recorte + contorno branco de adesivo: separa do fundo no tamanho pequeno;
- título com **contorno preto grosso e bloco 3D**, uma palavra em cor de destaque ou num marcador;
- no máximo **duas fontes** (a manchete e, se preciso, a do selo);
- **leve inclinação** (−3° a −8°) no texto ou no selo dá energia; tudo reto parece slide;
- vinheta e o `tom` do acabamento unificam fundo e recortes (parecem da mesma foto).

### 4. Renderizar e conferir

```bash
npm run thumb -- <doc>               # todas as thumb-*.json → out/thumbs/<doc>/ + folha.jpg
npm run thumb -- <doc> thumb-a       # só uma
```

Abra `out/thumbs/<doc>/folha.jpg` (Read) e confira de verdade, como o público vê:

1. **No cartão de 168 px** dá para dizer o assunto e ler o texto? Se não: menos palavras, letra maior, assunto maior.
2. **No preto e branco** o título ainda salta? Se some, falta contraste de luz (clareie o texto ou escureça atrás).
3. **Nada importante** embaixo da duração (16:9, canto inferior direito) nem no pé/lateral direita do Shorts (as áreas rosa).
4. **Um foco só**: o olho vai primeiro aonde você quer? Se pula entre três coisas, tire uma.
5. Feed claro e feed escuro: a borda da thumb não some em nenhum dos dois.

Ajuste a receita (posição, tamanho, cor: de graça) e renderize de novo até passar. Só gere imagem
nova quando o problema for da imagem. Na entrega, diga aa pessoa onde achar cada uma no Studio
(`npm run dev` → pasta `Thumbs-<doc>` → `Thumb-<doc>-<nome>`) e mostre a folha. Para renderizar pelo
terminal: `npx remotion still Thumb-<doc>-<nome> out/<nome>.png` (o YouTube aceita até 2 MB; se
passar, `--image-format=jpeg`).

## Onde fica cada coisa

| o quê | onde |
|---|---|
| peças e composição | `src/kit/thumb/` (`Thumb`, `TextoThumb`, `Recorte`, `Seta`, `Circulo`, `Selo`, `Brilho`, `Raios`, `Logo`; tipos em `tipos.ts`) |
| composições | uma por receita, automática: pasta `Thumbs-<doc>` no Studio (`src/kit/thumb/registro.tsx`); `ThumbYouTube`/`ThumbShorts` = o exemplo |
| fontes de impacto | `src/fontes.ts`: Anton, Bebas Neue, Archivo Black, Montserrat 900, Bangers, Luckiest Guy |
| pedidos de imagem | `src/videos/<doc>/capa/pedidos.json` (tipos `fundo`, `elemento`, `thumbnail`) |
| recortes | `public/imagens-ia/<doc>-capa/recortes/<id>.png` |
| receitas | `src/videos/<doc>/capa/thumb-*.json` |
| render + folha | `scripts/thumb/thumb.mjs`, `scripts/thumb/conferir.py` → `out/thumbs/<doc>/` |

Se precisar de um efeito que o kit não tem (ex.: moldura de "foto antiga", divisão em três), faça
a peça nova em `src/kit/thumb/`, ponha no `Desenhar` do `Thumb.tsx`, no `tipos.ts` e no catálogo
`references/receitas.md`: a próxima thumb já nasce com ela.
