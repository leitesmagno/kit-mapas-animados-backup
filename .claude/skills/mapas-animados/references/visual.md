# Visual do estilo Mapas Animados

Medido quadro a quadro em 10 Shorts virais de mapa (1080×1920), os "ref. 01–10" deste guia. As
posições estão em pixels de tela; as cores "na tela" são o resultado já composto sobre o
satélite (o que o olho vê), e as de "preenchimento" são o que se põe no SVG para chegar
nelas.

## 1. O mapa de fundo

- **Satélite claro e saturado**, do tipo "Blue Marble/Esri World Imagery com relevo
  submarino": oceano azul-petróleo (`#003A4B` no fundo, `#0B5E78` na plataforma), terra
  verde/ocre natural, nuvens às vezes visíveis no zoom de perto. **Não escurecer** nem
  dessaturar (é o contrário dos estilos A/E do `ESTILO.md`).
- Divisas internas (estados/países) **brancas finas** (1,5–2 px, 70–90 % de opacidade),
  sempre visíveis quando o assunto é uma região dentro de outra.
- Litoral: em vários vídeos o contorno costeiro ganha um **fio branco grosso** (3–4 px)
  quando o país/continente está em destaque (ex.: Sul-América no ref. 07, EUA no ref. 09).
- **Modo P&B**: satélite em cinza (`filter: grayscale(1) brightness(.75)`) quando a frase
  é sobre passado/perda/proibição (gancho da Costa Rica "o país sem exército", "Em 1948…
  aboliu as forças armadas"). A cor volta com o próximo assunto, num fade de ~10 quadros
  ou dentro de um mergulho.
- O mapa de contexto usa **escuro sobre os vizinhos** quando precisa isolar o assunto
  (ref. 06: SP/MS/GO em preto 75 % com a sigla branca gigante; Rússia escurecida em volta de
  Sakha). É um "holofote ao contrário": em vez de escurecer tudo, escurece só quem está
  sendo citado como contraste.

## 2. As cores de papel (uma cor = um papel no vídeo)

| Papel | Na tela | Preenchimento sugerido | Onde aparece |
|---|---|---|---|
| Assunto principal "quente" | âmbar `#C68C2B` | `#F0A12A` a 75 % | Salgueiro, Feira de Santana, Yakutsk |
| Território grande / contexto quente | vermelho-tijolo `#7B2A1C` | `#B3261E` a 70 % | Sakha, Bahia, Canadá |
| País/estado em foco "frio" | azul-royal `#1A215C` / `#4D62A0` | `#1B2A9E` a 80 % (CR) ou `#3B5BDB` a 60 % (EUA) | Costa Rica, EUA, Europa |
| Destaque "positivo"/pequeno | verde vivo `#288D51` | `#1FA54A` a 80 % | Washington, Northwest Angle |
| Estado/região grande | amarelo-oliva `#899119` | `#C9CC1E` a 65 % | Minas Gerais, Sudeste |
| Região 2 | roxo `#443C7E` | `#4B3BA8` a 75 % | Nordeste |
| Região 3 | turquesa `#2DAE8A` | `#3FE0B0` a 70 % | Sul |
| Região 4 | laranja `#B26825` | `#E07A1F` a 75 % | Centro-Oeste |
| Região 5 | verde-musgo `#316613` | `#3E8E1A` a 70 % | Norte |
| Vizinhos citados | laranja `#D2752B` | `#E8822E` a 80 % | México, Belize, Honduras (ref. 03) |
| Contraste / comparação | branco translúcido | `#FFFFFF` a 55–70 % | Espírito Santo, Ceará, Argentina dentro de Sakha, Alagoas/Piauí |
| HUD/medida | ciano `#3FF0E0` | traço/brilho | cartão da Guatemala, barra de altitude, círculo polar |

Regras:
- **Contorno branco** em toda região chapada (2–3 px), com brilho sutil do lado de fora
  (`drop-shadow(0 0 6px rgba(255,255,255,.35))`).
- A **mesma cor fica com o mesmo papel** até o fim. Nos rankings por região, cada região
  tem sua cor fixa (Norte verde, NE roxo, CO laranja, SE amarelo, Sul turquesa — ou a
  variante do ref. 08: Sul azul, SE laranja, CO amarelo).
- Comparação de tamanho = **silhueta branca translúcida** do lugar conhecido por cima do
  assunto (Argentina/Cazaquistão/Argélia dentro de Sakha; Espírito Santo ao lado da Costa
  Rica; Ceará branco sólido sobre o cartão).

## 3. Tipografia

Fonte única do canal: **Montserrat** (ExtraBold/Black). Os títulos de cartão parecem
Poppins SemiBold; Montserrat 700 resolve. No projeto: `@fontsource/montserrat` já está
instalado — registrar os pesos **700 e 800** em `src/fontes.ts` (hoje só há 600 e 900).

| Elemento | Fonte | Corpo (px) | Cor | Posição |
|---|---|---|---|---|
| Legenda | Montserrat 800 | 44–48 | branca; sombra `0 3px 6px rgba(0,0,0,.65)` + contorno escuro leve | centro x, linha de base **y≈1440**, uma linha só |
| Assinatura do canal (no projeto: a `MarcaDagua` do usuário) | Montserrat 700 | 40 | branca 75 % com a mesma sombra | centro x, **y≈1596** |
| Nome de lugar no mapa | Montserrat 800, MAIÚSC., espaçamento +0,03 em | 28–40 | branco, contorno/brilho da cor do assunto (azul `#2D4BFF` nos raios do ref. 01, âmbar nos rótulos âmbar) | logo acima do lugar, com **▼ branco** apontando |
| Nome sobre a região (grande) | Montserrat 900, MAIÚSC. | 40–70 | **tom claro da própria cor** (NORDESTE em lilás, SUDESTE em amarelo-claro, SUL em verde-água) com sombra escura | centro da região |
| Valor (%/km²/hab.) | Montserrat 800 | 44–60 | branco (ou cor viva da região no ref. 08) | acima do nome da região |
| Unidade | Montserrat 800 | 45–55 % do valor | branca | colada ao valor, na linha de base ("3.100.000km²", "4.220m") |
| Texto de impacto | Montserrat 900, MAIÚSC., 2 linhas | 80–110 assentado | branco puro, sombra forte (`0 6px 18px rgba(0,0,0,.6)`) | terço de cima (y 150–420) |
| Letreiro de país "deitado" | Montserrat 900, MAIÚSC. | 120–200 | cor clara da região (azul-gelo `#9FC4FF` sobre os EUA), extrudado, em perspectiva sobre o mapa | dentro do território, cortado pela borda da tela |
| Pergunta no mapa | Montserrat 900, MAIÚSC., 2 linhas | 34–40 | branca com **brilho ciano** forte | centro, sobre a região |
| Tag de cidade (retângulo) | Montserrat 800, MAIÚSC. | 22–26 | branco sobre azul `#1F4FE0`, borda azul-claro 3 px | presa ao ponto com um "pé" ▼ |
| Rótulo de pino | Montserrat 800, MAIÚSC. | 30 | branco | à direita de um pino vermelho `#E53935` |

**Área segura:** tudo o que importa fica entre y 180 e y 1380 (legenda e assinatura
ocupam a faixa 1400–1620; a interface do Shorts fica abaixo disso).

## 4. Elementos desenhados

- **Marcador de lugar**: triângulo branco ▼ (14–18 px) sob o nome. Para capital: um
  círculo branco com brilho amarelo-verde (o "sol" de Washington/Olympia) ou um disco
  azul com anel (Feira de Santana no fim).
- **Pino**: gota vermelha `#E53935` com miolo branco (estilo Google Maps), 40–50 px,
  com o nome em branco à direita (ref. 03 vizinhos, ref. 06 capitais europeias).
- **Linhas de distância (raios)**: azul elétrico `#2F5BFF`, 6–8 px, ponta arredondada,
  saindo de um centro para cada capital (ref. 01). Em close, ganham brilho.
- **Rodovias**: amarelo `#F5E03A` sólido 5–6 px com brilho (ref. 01) ou **tracejado amarelo**
  (ref. 10, "passam por sua região"); o nome ("BR-116") em branco, rotacionado no sentido da
  linha, ou num rótulo branco com ▼.
- **Rota rodoviária real**: azul `#2F6BFF` 6 px desenhando ao longo do trajeto, com um
  rastro ciano mais claro correndo por dentro dela (o "fluxo", ref. 06 final).
- **Seta "em linha reta"**: seta azul grossa (60–80 px de largura na cauda, afinando),
  translúcida 85 %, com o valor em branco **inclinado no ângulo da seta** ("1209 km").
- **Setas de "irradia"**: setas brancas grossas curvas saindo da região em 4–6 direções
  (ref. 10 "corredores rodoviários"), ou uma seta branca curva entre dois pontos
  ("litoral ↔ interior").
- **Rio**: azul-ciano `#46B8FF` 6–8 px com brilho forte (o Mississippi do ref. 04), desenhando
  da nascente.
- **Lago/área de água**: azul-ciano chapado `#13A4F0` 90 % (Lago dos Bosques); quando
  "congela", vira branco-gelo `#DDEBF2`.
- **Círculo de destaque**: anel amarelo `#F5E62A` grosso (10–12 px) com leve brilho,
  desenhado em arco de 0 a 360° (ref. 04); versão **pontilhada** amarela para "anel viário"
  (ref. 10).
- **Contorno tracejado** laranja `#FF6A2B` (traço 10, vão 8) ao redor da região, maior que
  ela, para "a área é de X km²" (ref. 05).
- **Barra de altura**: barra vertical ciano `#2FE6F0` (ou vermelha `#E01E1E`) de 18–24 px
  de largura saindo do pico, com o número + "m"/"METROS" no topo (ref. 03, ref. 09).
- **Ícones de pessoas**: bonequinhos brancos com sombra (estilo pictograma 3D), 6–12
  espalhados dentro da região, com o número + "HABITANTES" no meio (ref. 02, ref. 05). Variante
  de proporção: fila de bonecos verdes com 1 vermelho ("um em cada nove", ref. 08).
- **Ícones 3D**: urna com bandeira (eleitorado), medalha "2" (segunda maior cidade),
  soldadinhos com X vermelho (sem exército), ponto de interrogação 3D bege (mistério). Use
  `Icone3D` com os Fluent Emoji do projeto; o X vermelho é `prohibited`.
- **Bandeira na forma**: bandeira do país recortada no contorno (Costa Rica, Guatemala),
  translúcida ~70 % sobre o mapa.
- **Retrato em medalhão**: foto oval com borda branca grossa, acima da região (George
  Washington, ref. 09).
- **Cartão HUD**: retângulo escuro `#07100F` a 85 %, cantos 16 px, borda ciano `#3FF0E0`
  4 px com brilho externo; título branco com brilho ciano; silhueta do país chapada em
  teal `#1FB59C`; linhas de dado em branco, Montserrat 700 ~30 px, embaixo da silhueta
  ("área de 109.000km²", "idioma oficial: espanhol", "18.000.000 habitantes").
- **Pergunta 3D**: interrogação bege 3D sobre a região cinza (`red_question_mark`
  dessaturado ou `thinking_face`), com o título em 2 linhas abaixo.

## 5. Imagem real (drone)

- Vídeo vertical de drone ou time-lapse, **tela cheia**, sem moldura, cor natural.
- Entra e sai por **chicote lateral** (borrão horizontal forte) ou por mergulho com borrão
  radial; entre dois vídeos de drone, corte seco.
- Cada trecho tem 2–5 s e um movimento de câmera próprio (drone avançando/girando).
- A legenda e a assinatura continuam por cima, iguais.
- No projeto: vídeos livres (Pexels/Pixabay) ou do usuário em `public/assets/<video>/`,
  creditados no `CREDITOS*.md`.
