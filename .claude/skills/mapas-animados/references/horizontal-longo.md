# O estilo em vídeo HORIZONTAL e LONGO (16:9, YouTube, 8–20 min)

Os vídeos de referência são Shorts 9:16 de ~70 s, então **nada aqui foi medido em vídeo longo**: é a
tradução da linguagem medida (`visual.md`, `movimento.md`, `audio.md`) para o documentário
horizontal. O fluxo está implementado e tem um molde completo: `src/videos/exemplo-horizontal/`
(~6 min, 8 capítulos; o mesmo esquema serve para 8–20 min, com mais capítulos).

O que **não muda**: satélite claro e vivo, região translúcida com contorno branco, nome
digitado letra a letra, número digitado caractere a caractere, câmera que nunca para,
mergulho com borrão radial, legenda curta em corte seco, sem crédito na tela.
**Sem marca d'água de texto**: a `MarcaDagua` é só dos verticais; o horizontal leva a logo redonda
do `marca.json` (`LogoDoCanal`) pequena no canto inferior direito.
E o **motor é o mesmo**: `MapCamera`, `SatelliteLayer`, as peças do kit, a narração
(`projeto.ts` → `narracao/elevenlabs.ts` ou voz gravada → `silencios.py` → Whisper), `Mixagem`.
Não existe uma segunda implementação para o horizontal.

## 1. Formato e perfil

| | Short (o canal) | Horizontal longo |
|---|---|---|
| Quadro | 1080×1920 | **1920×1080** (`FORMATOS.horizontal` em `src/motor/formato.ts`) |
| FPS | 30 | 30 |
| Duração | 62–81 s | **8–20 min**, vinda da narração; nunca esticar nem cortar para caber |
| Estrutura | uma sequência | **capítulos** de 1–3 min (5–8; o YouTube só mostra capítulo com ≥ 10 s) |
| Loudness | −14 LUFS | −14 LUFS |

O **perfil de formato** decide os padrões das peças pela proporção da composição
(`useFormato()`): `LegendaPalavras`, `PainelNumero`, `TextoImpacto`, `TextoNoMar`,
`TextoDigitado` e `ParteDoTodo` já caem no lugar certo em 16:9 sem passar x/y.
No vertical, os padrões são exatamente os antigos.

## 2. Layout em 16:9

O lado curto é 1080 nos dois formatos: tamanho de fonte em px **vale igual**. Muda a composição.

| Elemento | Horizontal (valores do perfil) |
|---|---|
| Assunto no mapa | `areaDoAssunto` = os **2/3 direitos** acima da legenda (x 700–1824, y 64–860) quando há painel; `telaLivre` (x 96–1824) quando não há. Enquadre com `enquadrarNaArea(CAIXA.x, area, LARGURA, ALTURA, margem)` |
| Painel, pictograma | o **terço esquerdo** (centro x 470, y 400): `PainelNumero`, `ParteDoTodo` |
| Legenda | `y 905`, corpo 54, linha de até 1400 px (nunca abaixo de y 960: a barra do player) |
| Marca d'água | **nenhuma** (só os verticais levam). No lugar, a LOGO (`LogoDoCanal`): pequena, transparente, canto inferior direito, do primeiro ao último quadro |
| Texto de impacto | corpo 120, y 300 (ou mais alto se o assunto estiver no meio) |
| Imagem de apoio | `ImagemDeDrone` em tela cheia (`modo="tela"`), com a imagem de IA ou a foto real 16:9 |

**Rótulo longo de painel passa da borda**: o painel é centrado no x dele. Mantenha o rótulo em
até ~24 caracteres ("DO PETRÓLEO BRUTO (2024)", não a frase inteira). Nada importante no
canto inferior direito (marca do canal e tela final do YouTube).

## 2a. A IDENTIDADE do horizontal: o mapa editorial escuro

O horizontal NÃO usa o satélite claro e as regiões chapadas do "Mapas Animados". Usa o mapa
editorial escuro (contorno dourado, entorno escurecido) — o motor escolhe sozinho pelo formato:
- satélite como TEXTURA escura e pouco saturada (de perto, mais escuro ainda), grade de meridianos,
  divisas finas e claras, vinheta de lente, sem borrão nos voos (`cenas/Base.tsx` do exemplo-horizontal);
- a região do assunto: o CONTORNO DOURADO que se desenha em volta dela com halo de brilho, véu quente
  leve por dentro e, com `foco: true`, o resto do mapa escurecido (`RegiaoEditorial`). Sem bandeira;
- nomes em versalete Inter espaçado que "respira" ao entrar, água em itálico azul (`RotuloMapa`);
  lugar pequeno = ponto dourado + nome ao lado;
- um destaque quente só (dourado), azul só na água, vermelho contido para alerta;
- título do documentário (`titulo`) e cartela de cada capítulo (automática) no centro, com a linha
  de cima em dourado e o fio que abre (`CartelaDeTitulo`); o letreiro de lugar para as viradas;
- imagem de apoio entra e sai DISSOLVENDO (`ImagemEditorial`);
- ícone preso ao mapa NUNCA em cima de texto: o motor afasta o ícone (a haste fica no lugar exato).

## 2b. O que é SÓ do horizontal 

O horizontal tem identidade própria; **o vertical não muda**. Peças em `src/kit/horizontal/`:

| | Horizontal | (o vertical usa) |
|---|---|---|
| Legenda | `LegendaDoc`: SEM cartão, texto menor (40 px), baixa (y 990), a frase de até ~50 caracteres, **a palavra falada em dourado**, as que vêm apagadas, faixa de sombra leve no pé da tela; some na vinheta final | `LegendaPalavras` |
| Número / data | `Destaque`: tipografia grande no terço esquerdo, digitada, com filete dourado e rótulo espaçado, sombra vinda da esquerda (o estilo do título de abertura). **Nada de cartão de vidro translúcido** (não combina com o horizontal) | `PainelNumero` |
| Uma coisa por vez | no motor declarativo: um destaque de tela por vez e um ícone no mapa por vez; o anterior sai 10 quadros antes do próximo entrar | — |
| Bandeiras | dentro do país, centradas no MAIOR pedaço dele, sem zoom interno (o zoom interno + o borrão faziam a bandeira "tremer"); o borrão radial dos voos é mais calmo (máx. 0,35, 5 cópias) | — |
| País em foco | quando a fala trata de UM país, a câmera vai até ele (parada com a caixa do país, área "assunto") | — |
| Trilha | **com** trilha de fundo do começo ao fim (`Mixagem` com `musica`, baixa sob a voz: 0,06 / 0,12 nos respiros); música curta = emendar cópias com `acrossfade` (ffmpeg), nunca repetir em seco | sem trilha |
| Final | fala de CTA + `CartelaFinal` (batida `cartela`): logo, "SIGA O CANAL" + botão, sino / like / compartilhe / comente, cada um na palavra, e uma PERGUNTA que puxa comentário; trilha até o fim, 5–7 s de vinheta depois da última palavra. Nunca terminar em silêncio | sem CTA, loop |
| Marca | `LogoDoCanal` pequena e transparente no canto inferior direito, do 1º ao último quadro | `MarcaDagua` |

## 3. Ritmo de vídeo longo

O ritmo do Short (uma novidade a cada 1–2 s) cansa em 10 minutos. O vídeo longo **respira por capítulos**:

- **Gancho (0–30 s)**: o ritmo do Short. Afirmação-surpresa no mapa largo e a promessa do vídeo.
- **Dentro do capítulo**: uma novidade a cada **3–5 s** (região, nome, número, rota, imagem). A
  câmera não para (deriva linear entre chaves, `DERIVA = 0`, como nos verticais recentes).
- **Abertura de capítulo**: volta ao mapa largo com mergulho/recuo; um `TextoImpacto` curto.
- **Quebra de mapa a cada 20–40 s**: imagem de apoio, gráfico ou linha do tempo, de 3 a 8 s.
  Nunca dois minutos só de mapa, nem dois blocos de imagem seguidos sem voltar ao mapa.
- **Final**: a última frase de conteúdo fecha a pergunta do gancho; depois, a fala de CTA com a
  vinheta final (§2b) e uma pergunta para os comentários. Sem loop e sem silêncio no fim.

## 4. Mapa, foto, IA, gráfico ou texto? (decisão por frase)

Pergunte o que a frase **explica**:

1. **Onde, quão longe, por onde, de quem é** (lugar, fronteira, distância, rota, território) →
   **mapa animado**. É a identidade do estilo e o recurso principal.
2. **Algo que aconteceu de verdade, pessoa real, lugar específico reconhecível** → **foto real
   licenciada** (crédito no `CREDITOS*.md`, nunca na tela).
3. **Um conceito, um ambiente, uma escala que o mapa não mostra** (petroleiros num estreito,
   um oleoduto no deserto, um porto) → **imagem de IA**, sempre ilustrativa, nunca no lugar de
   foto de acontecimento, sem texto, mapa, bandeira ou pessoa real.
4. **Número que compara, proporção, cronologia** → **gráfico** (`PainelNumero` para valor,
   `ParteDoTodo` para proporção) ou linha do tempo.
5. **Ênfase, virada** → **tipografia** (`TextoImpacto`), sem gerar imagem.

A troca de recurso é **decisão editorial**: uma imagem entra quando a fala deixa o "onde" e
passa ao "como é" ou ao "o que é"; e sai quando a fala volta à geografia. Um vídeo de 10 min
costuma ter **6–15 imagens de IA**, não uma por frase. Reaproveite a mesma imagem com outro
enquadramento (`ImagemIA` com outro `foco`).

## 5. A continuidade mapa → imagem → mapa (o truque)

Enquanto a imagem cobre a tela, **a câmera do mapa voa por baixo dela** até o enquadramento
da fala seguinte. Quando a imagem sai pelo chicote, o mapa já está no lugar certo: sem corte
para "lugar nenhum", sem voo começando do zero.

```ts
// a imagem cobre inicioDa("cena-04") … fimDa("cena-04"); a câmera:
{ quadro: inicioDa("cena-04") + 12, camera: deriva(estreitoPerto, 0.1), easing: LINEAR },   // segue enquanto a imagem entra
{ quadro: fimDa("cena-04") - 12,   camera: deriva(estreitoComPainel, -0.06), easing: suave }, // por baixo, vai para a próxima vista
```

A volta é para **onde a explicação estava** (no exemplo-horizontal: dos petroleiros de volta ao estreito, do
oleoduto de volta ao estreito para o fecho), não para um enquadramento novo.

## 6. Passo a passo de um documentário novo

Molde completo: `src/videos/exemplo-horizontal/` (32 falas, 8 capítulos, 5 min 46 s).

1. **Pesquisa e roteiro.** Fonte primária para cada número (EIA, IEA, IBGE, órgão oficial), data da
   consulta anotada; assunto em andamento = diga a data na fala ("até a data desta pesquisa…").
   Separe **fato** (com fonte), **interpretação** e **hipótese**. Estrutura de §3, tom de
   `roteiro.md`. Até 12 min; o que manda é o roteiro, não o relógio.
2. **`falas.json`** (o texto, uma vez só): `{id, capitulo, texto, pausaDepois?}` por fala, com as
   PALAVRAS-GATILHO entre [colchetes] — "De um lado, o [Irã]." vira o evento `04.ira`. Gatilho é
   palavra (não número: o Whisper escreve número em algarismo). O `projeto.ts` lê esse arquivo e tira
   os colchetes antes da voz.
3. **Voz** (a do `marca.json`: gravada × ElevenLabs): gravada = um mp3 por fala em
   `public/<pastaDoAudio>/<id>.mp3`; ElevenLabs = `npm run narrar -- <pasta>`.
4. **Sincronia**: `sincronia.json` na pasta (copie o do exemplo) → `npm run sincronizar -- <pasta>`. Ele procura cada gatilho DENTRO da
   fala dele, com tolerância de grafia (`scripts/narracao/falas.py`), e grava `eventos.json` e
   `legenda.json` (o tempo do Whisper com a GRAFIA do roteiro; número fica em algarismo). Gatilho
   não achado: veja como o Whisper escreveu e ponha em `"apelidos"` do sincronia.json ({"brent": "brand"}).
5. **Dados** (`scripts/dados-<pasta>.py`, molde `scripts/dados-exemplo-horizontal.py`): Natural Earth 1:10m (países inteiros, sem recorte; ~100 m para o
   que a câmera vê de perto); linhas sem dado exato = esquemáticas (`DATA_SOURCES.md`).
6. **Cenas declaradas** (`cenas.ts`): por fala (ou grupo de falas), `camera` (paradas: `{ em: e(4, "ira"),
   vista: { caixa, area: "assunto" | "livre" } }`) e `batidas`: `pais` (com `bandeira` dentro — o
   padrão para país em foco), `nome`, `mar`, `rota`, `circulo`, `painel`, `proporcao`, `icone`,
   `impacto`, `data` (o ano grande no terço esquerdo) e `imagem`. `e(n, "palavra", s)` = a palavra da
   fala n (± s); `fala(n, s)` = o começo da fala n. Uma cena sem `camera` herda a vista da anterior.
   Coloque as `afirmacoes` de cada cena (com fonte): elas viram a lista de revisão.
7. **`roteiro.ts`** (`montarDocumentario`) e **`index.tsx`** (`MapaDasBatidas`, `TextosDasBatidas`,
   `ImagensDasBatidas`, `LegendaPalavras`, `LogoDoCanal`, `Mixagem`): copie os do exemplo-horizontal. `PROBLEMAS`
   lista evento que falta, frase cortada, batida que sai antes de entrar; o index para se houver.
8. **Imagens de apoio** (`imagens/pedidos.json`): `--sim` → `gerar` → revisar → `aprovar`. Mudar o
   texto da fala de um pedido gera outra imagem (o cache é pelo prompt): acerte antes.
9. **Ícones 3D** que o banco não tem (`icones/pedidos.json`, tipo `icone`): `gerar --conjunto icones`,
   `npm run imagens -- icones <pasta>` (recorta o verde) e o nome em `ICONES` (src/kit/assets.ts).
   Nunca desenhe ícone em SVG à mão (fica amador ao lado dos 3D).
10. **Bandeiras**: as oficiais (flagcdn.com, desenho oficial) em `public/assets/bandeiras/` e o nome
    em `BANDEIRAS`. Nunca bandeira gerada por IA.
11. **Satélite**: `npm run tiles -- <pasta>` (o `AREA_DE_PERTO` do roteiro.ts cobre o que a câmera vê
    de perto). Rode de novo a cada mudança de câmera; reempacote antes de conferir quadros.
12. **Thumbnail** (`capa/`, modelo `alta`) e **publicação** (`npm run publicacao -- <pasta>`: descrição,
    capítulos com tempo real, fontes, aviso de IA, revisão editorial, `.srt`).
13. **Validar sem render**: `npm run typecheck`, `npm run imagens:testes`, `npm run imagens --
    conferir <pasta>`, `PROBLEMAS` vazio. Folha de contato: `npm run folha -- <Composicao>`. O render
    final: `npm run render -- <Composicao>`; thumbnail: `npm run thumb -- <pasta>`.

## 7. Áudio

- A mesma cadeia dos verticais. **Pergunte qual voz** (gravada × ElevenLabs).
- Andamento um pouco mais calmo que o do Short (speed ~1,0); pausas entre frases de 0,3–0,45 s,
  entre capítulos 0,6–1,2 s (`pausaDepois` no `projeto.ts` e `ces.PAUSAS` no sincronizar).
- Trilha: **sim, no horizontal** : `Mixagem` com `musica`, baixa sob a voz, do
  começo ao fim (§2b). Sem tiques em sequência.

## 8. Problemas já vistos (e a correção)

| Sintoma | Causa | Correção |
|---|---|---|
| Retângulo branco no mapa largo | países recortados numa caixa | não recortar; só simplificar |
| "Colcha de retalhos" escura no mar de perto | o Sentinel-2 mostra a água funda real, mais escura que o Blue Marble | `scripts/satelite/perto.py` tira a água funda do EOX (`AGUA_FUNDA`) |
| Fronteira "quadrada" de perto | simplificação de ~1 km | ~100 m para os países vistos de perto |
| Nome do mar cortado na borda | ponto fora do enquadramento seguinte | o ponto dentro da caixa da cena em que ele aparece |
| Painel cortado à esquerda | rótulo longo (painel centrado no x) | rótulo de até ~24 caracteres |
| Nomes vizinhos se sobrepõem (Coreia/Japão) | pontos na mesma latitude | um dos nomes no mar, ao lado |
| Evento "não encontrado" depois de corrigir a grafia | correção de várias palavras vira um token só | correções de UMA palavra; o resto com `trocarPalavras` |
| País com cor chapada "solta" | — | país em foco leva a BANDEIRA dentro (`bandeira` na batida `pais`) |
| Ícone desenhado à mão (barril em SVG) | fica amador | ícone 3D gerado no Gemini e recortado (§6.9) |
| Gatilho não achado no Whisper ("Brand", "carga", "tumbes") | o Whisper escreve diferente | `APELIDOS` no sincronizar |
