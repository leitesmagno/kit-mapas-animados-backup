# Um vídeo VERTICAL novo, arquivo por arquivo

Molde: `src/videos/exemplo-vertical/` ("Amazonas", 20 falas, 18 cenas, 108 s, 60 fps). É a
estrutura que mais funcionou (gancho → o que guarda → divisas → números → capital → história →
lugares → virada → fecho → pergunta). Para outro estado/país/cidade, **copie e adapte**; não
comece do zero.

Nomes: pasta `src/videos/<tema>` em minúsculas com hífen (`para`, `chapada-diamantina`), prefixo
de 2 letras para as falas (`pa-01`, `pa-02`…), composição em PascalCase (`Para`).

## 1. Pesquisa → DATA_SOURCES.md

Antes do texto: cada número com fonte primária (IBGE/SIDRA para área, população, municípios;
órgão oficial do assunto; TSE para eleição — o CDN do TSE bloqueia curl: `npm run tse`). Anote
fonte, data da consulta e o que o vídeo escolheu NÃO afirmar. Número de índice não se arredonda
para cima (0,598 → "zero vírgula cinquenta e nove").

## 2. Roteiro → aprovação

Escreva as falas (uma ideia por fala, 1–2 frases) no formato de `roteiro.md` §2–3. Mostre à
pessoa como lista numerada e **espere o ok**. Depois de aprovado, o texto não muda sem ela pedir.

## 3. Copiar o molde

```bash
cp -r src/videos/exemplo-vertical src/videos/<tema>
```

e ajuste, nesta ordem:

| Arquivo | O que trocar |
|---|---|
| `projeto.ts` | `titulo`, `destino`, `pastaDoAudio: "audios/narracao/<tema>"`, a lista `cenas` (id + texto de cada fala; `<break time="0.45s" />` dá respiro para foto) |
| `sincronia.json` | `pastaDoAudio`, `falas` (os ids), `pausas`, `correcoes` (vazio no começo), `gatilhos` (ver §5) |
| `narracao/` | apague `eventos.json`, `transcript.json`, `cenas.json` — o sincronizar recria |
| `dados/` | os JSON do lugar (ver §4) e `dados/index.ts` (o que cada cena usa: contornos, pontos, caixas) |
| `estilo.ts` | as cores de papel do vídeo (`visual.md` §2): uma cor por papel, fixa até o fim |
| `roteiro.ts` | `PASTA_TILES = "satelite/<tema>"`, `AREA_DE_PERTO`, `BLOCOS_DA_LEGENDA` (o texto da legenda), cada `CENAxx` (os quadros pela fala) e as `CAMERA_xx` |
| `cenas/` | uma `SceneNN<Nome>.tsx` por cena (`…Textos` por cima, `…Fotos` fora da câmera), `Estado.tsx` (as camadas do mapa), `comum.tsx` (peças do vídeo: Pino, foto, etc.) |
| `sons.ts` | os efeitos ancorados nos quadros das cenas |
| `index.tsx` | os imports das cenas, os `VazamentoDeLuz` e o nome do componente |
| `DATA_SOURCES.md` | as fontes do §1 |

E registre no `src/Root.tsx` (logo abaixo de "os seus vídeos entram aqui"):

```tsx
import * as PA from "./videos/para";
…
<Composition id="Para" component={PA.Para} durationInFrames={PA.DURACAO_NO_VIDEO} fps={PA.FPS_DO_VIDEO} width={PA.LARGURA} height={PA.ALTURA} />
```

Para começar enxuto: deixe `CENAS_PRONTAS = 1` no `roteiro.ts` (o vídeo termina no fim da cena 1)
e suba o número a cada cena aprovada.

## 4. Dados do mapa

`cp scripts/dados-exemplo-vertical.py scripts/dados-<tema>.py`, troque códigos IBGE, nomes e
lugares, e rode `npm run dados -- <tema>`. A biblioteca `scripts/mapas/` já resolve: `ibge`
(malhas de estado/município, população, sedes), `osm` (Nominatim/Overpass: parques, ruas, rodovias,
contornos de lugares) e Natural Earth (países, rios). Bandeiras de UF e de vários países já estão em
`public/assets/bandeiras/`; a bandeira **centrada no contorno** do estado é feita por script (molde:
`scripts/bandeira-estado.py`; para país, `scripts/bandeira-pais.py`).

## 5. Voz e sincronia

**Áudio pronto** (Google AI Studio, outra voz de IA ou uma narração que a pessoa já tem): ela joga o arquivo na pasta **`minha-voz/`** da raiz: UMA gravação lendo o roteiro
inteiro (o mais fácil: ler fala por fala com uma respiração entre elas) ou UM arquivo por fala (a
ordem é a do nome). Qualquer formato (mp3, wav, m4a, ogg). Você roda
`npm run voz -- <tema>`: ele divide pelo Whisper, encurta as pausas longas, põe cada fala em
`public/<pastaDoAudio>/<id>.mp3` (criando a pasta), move os originais para `minha-voz/usadas/` e
já roda a sincronia. Se ele disser que não achou uma fala, a pessoa leu diferente do roteiro:
ajuste o texto da fala no `projeto.ts` para o que foi dito.

**ElevenLabs**: `npm run narrar -- <tema>` (gera só as que faltam; `REFAZER=1` para refazer uma) e
depois `npm run sincronizar -- <tema>`. Os **gatilhos** (`sincronia.json`) dizem onde
cada animação acontece: por fala, uma lista `["nome", "frase como é falada"]`, em ordem:

```json
"pa-03": [["norte", "fica no norte"], ["amazonas", "amazonas"], ["tocantins", "tocantins"]]
```

No `roteiro.ts`, `q("tocantins")` é o quadro em que a voz diz "Tocantins"; `q("tocantins", -0.1)`,
100 ms antes. Se um gatilho não for achado, o script para e mostra como o Whisper escreveu: ajuste a
frase do gatilho ou ponha uma `correcao`. Em listas rápidas de nomes o Whisper adianta até 0,2 s — o
sincronizar mede o início real na energia do áudio; se ainda ficar fora, ponha um `ajuste` manual
(`"tocantins": ["pa-03", 2.41]`, segundos dentro do arquivo da fala).

## 6. Cenas (uma por vez)

Para cada cena: os quadros no `CENAxx` (sempre a partir de `q(...)`), a câmera no `CAMERA_xx`
(chaves com `em`, o enquadramento por `enquadrar(caixa)` e a curva `VOO` só nos voos; entre voos,
deriva linear), o que o mapa desenha em `Estado.tsx` e o que vai por cima na `SceneNN…Textos`.
Use as peças do kit (catálogo no `ESTILO.md` §4); peça nova e reutilizável vai para `src/kit/` e
entra no catálogo. Depois de cada cena: `npm run typecheck`, abra o Studio na composição e mostre
à pessoa o trecho (diga o segundo). Espere o ok antes da próxima, salvo se ela pediu "faz tudo".

## 7. Fotos, satélite e conferência

- Fotos: `references/trocar-imagens.md`; depois `npm run fotos -- <tema>`.
- Satélite: `npm run tiles -- <tema>` (de novo a cada mudança de câmera). Mais perto que o nível 13
  só com imagem de alta resolução de licença aberta (CBERS-4A do INPE, 2 m, CC BY) — Esri/Google
  não servem (licença).
- Conferência: `npm run typecheck`; `npm run folha -- <Composicao>` gera uma folha com um quadro por
  segundo (olhe a imagem antes de mostrar).

## 8. Final

- `CREDITOS-<tema>.md` na raiz: fontes dos dados, das fotos (autor + licença), do satélite (NASA,
  EOxCloudless 2016 CC BY 4.0), da música/efeitos (Mixkit) — é o texto da descrição do post.
- Render quando a pessoa pedir: `npm run render -- <Composicao>` → `out/<Composicao>.mp4`.
- Thumbnail: skill `thumbnail-chamativa`.
