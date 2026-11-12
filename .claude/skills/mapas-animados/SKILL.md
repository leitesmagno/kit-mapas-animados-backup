---
name: mapas-animados
description: Kit Mapas Animados — cria vídeos de MAPA animados prontos para postar (Shorts/Reels/TikTok 9:16 de ~1:30 e documentário 16:9 para o YouTube) neste projeto Remotion, do tema ao MP4 — satélite claro e vivo, estado com a bandeira dentro, regiões translúcidas com contorno branco, nomes e números digitados, mergulhos de câmera com borrão, fotos em cartão, legenda karaokê e narração sincronizada palavra a palavra. Também instala o kit, configura a marca (logo, marca d'água, cores, voz) na primeira conversa e ensina a trocar fotos e imagens. Use SEMPRE que a pessoa pedir "faz um vídeo sobre X", "vídeo de mapa", "vídeo do estado/cidade/país X", curiosidade geográfica, ranking por estado, documentário de geografia/geopolítica, ou disser "configura o kit", "instala", "primeira vez", "troca a foto", "trocar imagem", "minha logo", "minha voz", "renderiza", mesmo sem citar o nome do kit.
---

# Kit Mapas Animados

O kit é um estúdio de vídeos de mapa operado por conversa: a pessoa dá o tema, você pesquisa,
escreve, monta e mostra; ela aprova, troca as fotos e renderiza. **A pessoa geralmente não é
programadora**: fale simples, rode você mesmo os comandos, diga onde pôr cada arquivo e mostre o
resultado no Studio (`npm run dev`, abre no navegador). Nunca peça para ela editar código.

Arquivos de referência do projeto: `CLAUDE.md` (regras), `ESTILO.md` (o catálogo de peças do
`src/kit/`), `marca.json` (a marca da pessoa) e os dois moldes: `src/videos/exemplo-vertical/`
(Short, "Amazonas") e `src/videos/exemplo-horizontal/` (documentário, "Estreito de Ormuz").

## 0. Antes de tudo (toda conversa nova)

1. **Instalado?** Rode `npm run verificar` (sem Node ainda: confira com `node -v`). Faltou algo →
   `references/instalacao.md`: **você instala tudo**, inclusive Node, Python e FFmpeg (winget no
   Windows, brew no Mac, apt no Linux) e as skills do Remotion. A pessoa só digita senha ou clica
   "Sim". "Instala tudo" / "instala o kit" = instalação completa + configuração, sem mais perguntas.
2. **Configurado?** Se `marca.json` tem `"configurado": false` → faça a configuração de
   `references/configuracao.md` ANTES do primeiro vídeo (perguntas curtas com o AskUserQuestion:
   nome do canal, @, marca d'água, logo, cor da legenda, voz, trilha). Depois disso, nunca mais
   pergunte o que já está no `marca.json`.
3. Diga em uma linha o que vai fazer e siga.

## 1. A fórmula (o que faz esses vídeos prenderem)

**Um assunto por frase, uma mudança na tela por frase, a câmera sempre se mexendo.** O satélite
fica claro e bonito, o assunto ganha cor translúcida com contorno branco (ou a bandeira dentro),
o nome se digita em cima, a narração dita o corte, e a cada 10–20 s uma foto real quebra o mapa.

| | O padrão do kit |
|---|---|
| Formato | vertical 1080×1920 a **60 fps** (decupagem em quadros de 30, `useQuadro`), 80–115 s; horizontal 1920×1080, 30 fps, 6–20 min em capítulos (`references/horizontal-longo.md`) |
| Fundo | satélite **claro e saturado**; cinza/P&B só quando a frase fala de passado ou de algo ruim |
| Lugar em foco | estado/cidade com a **bandeira centrada dentro do contorno** (nunca cor chapada sozinha); os vizinhos ganham a bandeira só quando são citados |
| Lugar pequeno | **pino vermelho de localização**, câmera bem perto e centrada, município com o contorno aceso; **um pino por vez** (o anterior sai antes do próximo cair); com cartão de foto, o pino vai **sem nome** |
| Texto no mapa | Montserrat 800–900, MAIÚSCULAS, **digitado letra a letra**; números digitados caractere a caractere |
| Fotos | em **cartão na proporção da foto, sem cortar** (foto em pé = cartão estreito), com etiqueta do lugar e ícone 3D no canto; entram por chicote lateral |
| Legenda | **karaokê**: uma linha de até 30 letras embaixo (y 1748), Poppins 800 com contorno preto, a palavra falada na cor do `marca.json` |
| Marca | a `MarcaDagua` do `marca.json` no pé (vertical); a logo redonda no canto inferior direito (horizontal) |
| Câmera | nunca para: entre os voos, deriva linear (+3–5 %/s); voos e mergulhos de 0,4–0,8 s com **borrão radial** |
| Áudio | a voz manda; trilha **bem baixa** por baixo (desliga no `marca.json`); whoosh só nos voos/mergulhos; **nada de "tique" em sequência** |
| Final | a última frase fecha a ideia + uma **pergunta** ("Qual desses lugares você já conhecia?"); o último quadro volta ao enquadramento do começo (loop) |

O detalhe de tudo isso (e o porquê de cada regra) está em `references/o-que-deu-certo.md`.

## 2. Um vídeo novo, do tema ao MP4

O passo a passo com cada arquivo e comando está em `references/novo-video.md`. Em resumo:

1. **Formato**: vertical (padrão do `marca.json`) ou horizontal. Se a pessoa não disser, use o padrão.
2. **Pesquisa e dados primeiro**: cada número com fonte oficial (IBGE, TSE, órgão do assunto),
   anotado no `DATA_SOURCES.md` do vídeo. Número não se arredonda para cima.
3. **Roteiro** no formato que funciona (`references/roteiro.md` §2 e o molde do Amazonas): gancho
   com superlativo/surpresa → o que ele guarda → divisas → números → capital → história → lugares
   (um por frase) → virada → fecho → pergunta. Frases de 6–12 palavras, números por extenso.
   **Mostre o texto e espere a aprovação** antes da voz.
4. **Voz**: gravada → a pessoa joga a gravação na pasta **`minha-voz/`** (uma com o roteiro inteiro
   ou uma por fala, qualquer formato) e você roda `npm run voz -- <pasta>`: corta por fala, trata,
   põe em `public/…` e já sincroniza. ElevenLabs → `npm run narrar -- <pasta>` e depois
   `npm run sincronizar -- <pasta>`. Nunca gere voz sem a pessoa aprovar o texto.
5. **Sincronia**: cada animação fica presa a uma palavra da fala; trocou a voz, rode de novo e o
   vídeo inteiro se reajusta. Gatilho achado "por semelhança" aparece na saída: confira.
6. **Cenas**: copie a pasta do exemplo e adapte cena a cena (`roteiro.ts` → quadros pela fala,
   `cenas/` → o que aparece). Por padrão, **uma cena por vez**, mostrando no Studio e esperando o
   "ok"; se a pessoa disser "faz tudo", faça todas e ela revisa depois.
7. **Fotos**: baixe de fontes livres (Wikimedia Commons) com o crédito, ou use as que a pessoa
   mandar (`references/trocar-imagens.md`); `npm run fotos -- <pasta>` mede as proporções.
8. **Satélite**: `npm run tiles -- <pasta>` depois de fechar a câmera.
9. **Revisão**: `npm run typecheck`; a pessoa olha no Studio; folha de contato
   (`npm run folha -- <Composicao>`) quando ajudar.
10. **Render**: só quando a pessoa pedir — `npm run render -- <Composicao>` → `out/<Composicao>.mp4`.
    Créditos e fontes vão no `CREDITOS-<pasta>.md` (para a descrição do post), **nunca na tela**.

## 3. Pedidos comuns

- **"Troca a foto X" / "pus minhas fotos na pasta"** → `references/trocar-imagens.md`.
- **"Muda a cor / a logo / a marca d'água / a voz"** → edite o `marca.json` (`references/configuracao.md`).
- **"Thumbnail / capa"** → skill `thumbnail-chamativa`.
- **"Documentário / vídeo longo / horizontal"** → `references/horizontal-longo.md` e `scripts/imagens/LEIA.md`.
- **"Tá travando / tá borrado / a bandeira tremendo"** → `references/o-que-deu-certo.md` §8 (problemas já resolvidos).

## 4. Checklist (antes de mostrar cada cena)

- [ ] Satélite claro; cada cor tem um papel e não muda no meio do vídeo.
- [ ] Estado/cidade em foco com a bandeira centrada dentro; vizinhos com bandeira só quando citados.
- [ ] Cada frase trouxe UMA novidade, entrando junto com a palavra (nunca antes da voz).
- [ ] Um pino por vez; pino sem nome quando há cartão de foto; nada encavalado.
- [ ] Fotos inteiras, na proporção delas, sem cobrir a legenda.
- [ ] Câmera nunca parada; mergulhos com borrão radial; nada "travando".
- [ ] No máximo 2–3 textos de impacto grandes no vídeo inteiro.
- [ ] Legenda karaokê sem cortar nome ("de São / Paulo" nunca); marca d'água no pé.
- [ ] Nenhum crédito/fonte na tela; tudo no `CREDITOS-<pasta>.md`.
- [ ] `npm run typecheck` sem erro.

## Referências (leia a de cada etapa quando chegar nela)

- `references/instalacao.md` — instalar o kit numa máquina nova (Node, FFmpeg, Python, Whisper, sons, satélite) e resolver erros de instalação.
- `references/configuracao.md` — a primeira conversa: as perguntas, o `marca.json`, a logo, as chaves (.env).
- `references/novo-video.md` — o passo a passo de um vertical novo, arquivo por arquivo e comando por comando.
- `references/o-que-deu-certo.md` — as regras aprendidas em dezenas de vídeos publicados (e os problemas já resolvidos).
- `references/trocar-imagens.md` — fotos, bandeiras, ícones, logo e imagens de IA: onde pôr e como trocar.
- `references/roteiro.md` — os 5 formatos de roteiro, a estrutura em blocos, as regras de redação.
- `references/visual.md` — cores medidas, tipografia, posições e o desenho de cada elemento.
- `references/movimento.md` — a batida, cada animação com duração e curva, e a receita no kit.
- `references/audio.md` — voz, velocidade, pausas, loudness, efeitos.
- `references/horizontal-longo.md` — o documentário 16:9 de 6–20 min (capítulos, imagens de IA, thumbnail, publicação).
