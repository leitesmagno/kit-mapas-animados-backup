# Movimento do estilo Mapas Animados

Medido quadro a quadro nos originais (25 fps). As durações abaixo já estão convertidas
para **30 fps** (o motor do projeto); entre parênteses, o valor original a 25 fps.
`q("palavra")` é o quadro da palavra no `eventos.json` do vídeo.

O canal é feito em After Effects com um plugin de mapa (tipo GEOlayers): tudo é rápido,
seco e sem "fofura". **Nada de pop elástico exagerado, nada de flutuar**: as coisas
aparecem por digitação, piscada, corte ou borrão de movimento.

## 1. A batida (a unidade do vídeo)

Cada frase da narração (6–12 palavras, 1,5–3 s) é uma batida:

| Momento | O que acontece | Quando |
|---|---|---|
| Entrada | UMA novidade visual (região, rótulo, número, linha, ícone, imagem) | na palavra-chave, 2–4 quadros ANTES dela |
| Durante | a câmera deriva (zoom lento) e o texto termina de se digitar | até o fim da frase |
| Saída | o que não vai ser reusado some (apaga de trás para frente / borrão lateral / some no mergulho) | no começo da batida seguinte |

Densidade medida: uma mudança visual **a cada 1,0–2,0 s**, em média 1,4 s. Lacunas de
mais de 3 s sem novidade não existem nos originais, exceto durante vídeo de drone (que
traz o próprio movimento).

O que **acumula** e o que **troca**:
- Em ranking/comparação (ref. 07, ref. 08, ref. 01), os rótulos e as regiões **se acumulam** e a
  câmera recua no fim para mostrar tudo junto (o "quadro-resumo").
- Em ficha de país (ref. 02, ref. 03), cada dado **troca** o anterior (o idioma apaga e dá lugar
  à população; o número some quando entra a próxima informação).

## 2. As animações (com receita)

### 2.1 Câmera em deriva (sempre)
- Entre batidas a câmera **nunca para**: zoom-in contínuo de ~+3–6 % por segundo, às
  vezes com um leve deslocamento (pan de 1–2 % da tela por segundo) e nenhuma rotação.
- Receita: o `percurso` do kit com cada parada já tendo `zoom` inicial e final diferentes
  (ex.: chega em 5,0 e termina a parada em 5,15). O `<MapCamera>` já tem deriva; aumente
  a amplitude dela para este estilo.

### 2.2 Voo entre lugares — 12–18 quadros (10–15)
- Pan/zoom com aceleração forte e frenagem forte (`Easing.bezier(0.7, 0, 0.2, 1)`); no
  meio do voo, **borrão de movimento** na direção do deslocamento (o mapa fica "riscado").
- Receita: `percurso` com duração curta + `BorraoDeVoo` do kit com a velocidade da
  câmera (o borrão sobe com a velocidade, zera na chegada).

### 2.3 Mergulho de escala (país → cidade) — 18 quadros (15)
- A câmera **avança muito** (zoom ×6 a ×20) com **borrão radial** (zoom blur) ao redor do
  centro; o preenchimento da região grande desbota durante o mergulho, e o assunto novo
  já aparece no destino. No ref. 05 (Sakha → Yakutsk) e no ref. 01 (Pernambuco → Salgueiro).
- Ao mesmo tempo, o texto de impacto que estava na tela **voa para a câmera** (escala
  1 → 2,5 e sobe para fora da tela em 7–8 quadros).
- Efeito sonoro: whoosh grave.
- Receita: interpolar o zoom em escala log com `Easing.bezier(0.6, 0, 0.3, 1)` e
  aplicar um borrão radial. Peça a criar no kit: **`BorraoRadial`** — N cópias (8–12) do
  conteúdo da câmera empilhadas com escala 1 + k·i e opacidade 1/N, com k proporcional
  à velocidade do zoom (fica determinístico e não precisa de shader).

### 2.4 Recuo de escala (cidade → país/continente) — 12–18 quadros
- O inverso do mergulho: a câmera abre rápido (zoom ÷4 a ÷10), com borrão radial, até
  mostrar o contexto (Washington → EUA → continente; Minas → Brasil).
- Costuma vir junto do **texto de impacto** (2.8).

### 2.5 Chicote lateral (mapa ↔ drone) — 10–12 quadros (8–10)
- O quadro sai **arrastado na horizontal** com borrão forte (como um pan rápido de
  câmera); a imagem nova entra arrastada no mesmo sentido, com 2–3 quadros de borrão
  residual. Usado para ir do mapa a um vídeo de drone e voltar, e para entrar no cartão HUD.
- Receita: deslocar as duas camadas em x (−1080 → 0) com `Easing.bezier(0.8, 0, 0.2, 1)`
  e borrão horizontal (`filter: blur()` não é direcional — use 6–10 cópias deslocadas em
  x com opacidade decrescente, ou um `feGaussianBlur stdDeviation="40 0"` no SVG que
  envolve a camada). Peça a criar no kit: **`ChicoteLateral`**.

### 2.6 Região acendendo com piscada — 6 quadros (5)
- O preenchimento **pisca**: liga 1 quadro, desliga 1, liga 1, desliga 1, liga e fica
  (o ref. 05 mostra exatamente isso no "República de Sakha"). O contorno branco liga junto.
- O que estava antes (região cinza com "?") some em **corte seco** no mesmo quadro.
- Alternativa usada nas regiões do Brasil (ref. 07, ref. 08): a região **cresce do centro**
  (escala 0,6 → 1 em 8–10 quadros, com a câmera indo junto), sem piscar.
- Receita: `RegiaoDestaque` com o preenchimento multiplicado por
  `[1,0,1,0,1][quadro - entra] ?? 1`. A saída: opacidade 1 → 0 em 8–10 quadros.

### 2.7 Digitação (rótulos e números) — 1 caractere a cada 0,8–1,2 quadro
- Nomes ("ENCRUZILHADA", "REPÚBLICA DE SAKHA", "Northwest Angle") e números
  ("158.000.000", "3.100.000km²", "1948") aparecem **caractere a caractere**, cada um com
  fade de 2 quadros. Começa 2–6 quadros depois da região aparecer.
- **Número não conta**, se digita: "1" → "15" → "158" → "158." → "158.0"… A unidade vem
  por último, menor.
- Saída: **apaga de trás para frente** no mesmo ritmo ("ESPA" → "ES" → nada), ou some
  com borrão horizontal (o rótulo "estica" para o lado em 3–4 quadros).
- Receita: componente **`TextoDigitado`** (a criar no kit, ou derivar do `RotuloValor`):
  `texto.slice(0, n)` com `n = floor((q - entra) / passo)`, último caractere com opacidade
  fracionária; para apagar, `n` decresce a partir de `sai`.

### 2.8 Texto de impacto ("OU SEJA", "MAS EXISTE UM DETALHE", "NÃO SURGIU POR ACASO", "O PONTO MAIS ALTO DO ESTADO", "1948") — entra em 4–5 quadros
- Entra **despencando da câmera**: começa enorme (escala 3–4, cortado pela tela, já
  opaco) e cai até o tamanho final em 4–5 quadros (`Easing.bezier(0.2, 0.9, 0.3, 1)`),
  junto com um recuo de câmera com borrão radial. Depois assenta e cresce de leve
  (+3 %/s) com a deriva.
- Sai **voando para a câmera** (escala ↑, sobe e sai pelo topo) no próximo mergulho, ou
  apaga em fade de 6 quadros.
- Variante do ano ("1948" no ref. 02, "1783" no ref. 04): número branco gigante (200–260 px) que
  cai do mesmo jeito sobre o mapa cinza; com o tempo encolhe e se apaga de trás para
  frente.
- No máximo 2–3 por vídeo. Peça a criar: **`TextoImpacto`** (tela).

### 2.9 Linhas que se desenham — 10–20 quadros
- Raios de distância, rodovias, rios, rotas: o traço cresce do ponto de origem
  (`strokeDashoffset`) com `Easing.bezier(0.3, 0, 0.2, 1)`. Raios múltiplos (ref. 01) saem
  **todos juntos** do centro com borrão de movimento, ou um por um quando a narração os
  lê ("João Pessoa, 430 km" → uma linha nova a cada cidade falada).
- Rota real (ref. 06): azul desenhando ao longo da estrada; depois um **fluxo ciano** corre
  por dentro dela em loop (dash animado).
- Receita: `AnimatedRoute`/`TracadoGeo`/`RotaGeo` do projeto.

### 2.10 Seta "em linha reta" — 12–15 quadros
- A seta grossa **dispara** de uma ponta à outra com borrão (ref. 06: Salto da Divisa →
  Carneirinho), a rota antiga desbota ao mesmo tempo, e o valor ("1209 km") se digita
  inclinado no ângulo da seta. Sai encolhendo de volta para a origem com borrão.
- Peça a criar: **`SetaReta`** (SVG: polígono com cauda larga e ponta, `pathLength`).

### 2.11 Círculo de destaque — 25 quadros (20)
- Anel amarelo grosso desenhado de 0 a 360° (começa no topo, sentido horário) enquanto
  **cresce** de 0,6 a 1,0 do raio final; depois fica. Pontilhado para "anel viário"
  (pontos aparecendo em sequência ao redor).
- Receita: `CirculoNoMapa` do kit com `strokeDasharray` animado e escala; ou SVG direto.

### 2.12 Ícones e bonecos — pop seco de 6–8 quadros, em sequência
- Bonecos de pessoas: aparecem **um a um** (2 quadros entre eles), cada um com escala
  0 → 1,1 → 1 em 6 quadros; ficam parados (sem boiar). O número se digita no meio.
- Ícones 3D (urna, medalha, soldadinhos): pop de 6–8 quadros; o X vermelho entra 6–10
  quadros depois por cima, com pop maior.
- Receita: `Icone3D` com a curva `CURVA.pop` e **sem** `boia` (o canal não usa flutuação).

### 2.13 Pino — 6 quadros
- O pino vermelho cai 30 px e assenta (4 quadros); o nome entra deslizando da direita
  com borrão horizontal (4 quadros). Vários pinos: um por cidade falada, acumulando.

### 2.14 Cartão HUD — entra por chicote, sai inclinando
- Entra pela lateral com borrão (2.5) já inteiro; a silhueta está pronta; as linhas de
  dado **se digitam** uma por frase ("área de 109.000km²" → "idioma oficial: espanhol"
  → "18.000.000 habitantes").
- Durante a comparação, o cartão **encolhe e desce** para o lado e a silhueta de
  comparação (Ceará, branca) cai por cima (escala 1,3 → 1 em 6 quadros).
- Saída: **gira em 3D** (rotateZ −10° → +10°, rotateY leve) e encolhe para o centro em
  10–12 quadros, e a câmera mergulha no mapa.
- Receita: `CartaoHud` do kit (já tem a saída inclinando) + digitação nas linhas.

### 2.15 Silhueta de comparação — 6–8 quadros
- O lugar conhecido (Argentina, Espírito Santo, Ceará) aparece **branco translúcido**
  por cima do assunto, com o nome se digitando; troca por corte seco para a próxima
  silhueta ("Argentina" → "Cazaquistão" → "Argélia" a cada nome falado).
- Receita: `RegiaoDestaque` com cor branca 60 %, centralizada no assunto (transladar o
  contorno para o centróide do assunto, mantendo a escala real — usar a mesma projeção).

### 2.16 Letreiro deitado no mapa
- O nome do país em letras enormes, extrudadas (3D), **deitado no plano do mapa** em
  perspectiva (ref. 04, ref. 09 "ESTADOS UNIDOS"); desliza com a câmera e sai cortado pela borda
  da tela. Dá a sensação de câmera 3D sobre um mapa.
- Receita: `div` com `transform: perspective(1200px) rotateX(55deg)` e `text-shadow`
  empilhado (6–10 camadas de 1 px na cor escura) para a extrusão; amarrar à câmera.

### 2.17 Mudança de "clima" do mapa
- **Cinza → cor**: o satélite inteiro desatura (passado, proibição) e volta à cor no
  próximo assunto, em 8–10 quadros ou dentro de um mergulho.
- **Região que "congela"**: lago azul → branco-gelo em 15 quadros (ref. 04).

### 2.18 Imagem de drone
- Entra por chicote (2.5) ou mergulho (2.3); dentro, o próprio vídeo se move. Entre dois
  vídeos de drone, corte seco na troca de frase. Volta ao mapa por chicote ou por um
  "mergulho invertido" (a imagem afasta com borrão radial e o mapa aparece).
- Receita: `<OffthreadVideo>` em tela cheia dentro de uma `<Sequence>`, com
  `ChicoteLateral` na entrada e na saída.

### 2.19 Legenda
- Troca em **corte seco** a cada grupo de 2–4 palavras (o grupo é a "frase falada" do
  Whisper, quebrada nas vírgulas e a cada ~22 caracteres). Sem pop, sem cor por palavra,
  sem karaokê.
- Receita: `LegendaPalavras` em modo `bloco`, ajustado para corte seco (entrada e saída
  de 0 quadros) e para o corpo/posição de `visual.md` §3.

## 3. Curvas (para não reinventar)

| Uso | Curva |
|---|---|
| Voo/mergulho/chicote | `Easing.bezier(0.7, 0, 0.2, 1)` (sai rápido, freia forte) |
| Texto de impacto caindo | `Easing.bezier(0.2, 0.9, 0.3, 1)` |
| Linha se desenhando | `Easing.bezier(0.3, 0, 0.2, 1)` |
| Pop de ícone/boneco | `CURVA.pop` do kit, mas curto (6–8 quadros) |
| Saídas | `CURVA.saida` (8–10 quadros) |

## 4. O que o canal NÃO faz (e esta skill também não)

- Boiar/flutuar ícones, sacudir a tela, glitch, grão, vinheta pesada.
- Vazamento de luz, bokeh, flash branco (são do estilo B do `ESTILO.md`, não deste).
- Legenda palavra por palavra colorida.
- Câmera parada, mesmo em close.
- Música de fundo.

## 5. O que os melhores trechos têm em comum

1. **O gancho já é a resposta visual** (abrir com os raios prontos, a rota pronta, o número de 42% na tela). O resto do vídeo explica o que se viu no primeiro segundo.
2. **Listas viram coreografia**: cada nome falado ganha um elemento (raio, pino,
   silhueta, sigla), e a câmera acompanha o novo elemento.
3. **Mudança de escala sempre com borrão**: o espectador sente o salto.
4. **Uma cor por papel**, mantida até o fim.
5. **O fim reencontra o começo**, o que faz o Short emendar em loop.
