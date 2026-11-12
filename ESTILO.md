# Guia de estilo: vídeos de mapa "virais"

Este é o padrão visual dos vídeos do projeto. Ele saiu da análise de cinco Shorts de mapa
de canais grandes de mapa (analisados quadro a quadro; os vídeos não vêm no kit), feitos em After Effects, e está
traduzido em componentes prontos em **`src/kit/`**. Todo vídeo novo usa este guia.

> **Resumo:** a câmera nunca para, entra uma novidade na tela a cada 1–2 s, e o destaque é
> **uma** cor chapada e forte sobre satélite escurecido. Título grande só no gancho, legenda
> pequena embaixo.

---

## 1. As 4 regras que valem para qualquer tema

1. **A câmera anda e para.** Ela voa até o assunto (≈0,6 s), para enquanto a narração fala
   dele e voa para o próximo. Quando está "parada", a deriva do `<MapCamera>` mantém o quadro
   vivo. Use `percurso([...])` do kit, com cada parada ancorada numa palavra da narração.
2. **Uma novidade a cada 1–2 s.** Cada frase da narração traz alguma mudança na tela:
   região acendendo, rótulo, ícone, número, zoom, bandeira. Se passar de 2,5 s sem nada
   novo, a cena está lenta.
3. **Uma paleta por vídeo** (`src/kit/paleta.ts`): o satélite fica escurecido e
   dessaturado, e o destaque vem numa cor saturada com contorno branco ou neon. Não misture
   paletas no mesmo vídeo.
4. **Hierarquia de texto:**
   - Gancho: `TituloGancho`, grande, inclinado, letra por letra, 2ª linha na cor de destaque.
   - Dado: `RotuloValor` ou `CartaoHud`, preso ao lugar.
   - Legenda: `LegendaPalavras`, pequena, na faixa de baixo.

   Sem créditos nem fontes na tela: tudo isso vai para a descrição (`CREDITOS*.md`).

---

## 2. Os 5 estilos de referência (e a receita de cada um)

### A. Ranking com dados (estilo Ranking: "As 10 cidades mais pobres da PB"). Paleta `roxo`
Estado inteiro chapado em roxo. Cada cidade acende em lilás com contorno branco e ganha
nome + valor em amarelo. **Os rótulos se acumulam**: a câmera visita 2–3 cidades e recua
para mostrar todas juntas.
```tsx
<RegiaoDestaque regiao={estado("PB")} entra={q("paraiba")} estilo="chapado" paleta="roxo" />
<RegiaoDestaque regiao={municipio} entra={q("amparo")} estilo="chapado" cor={PALETAS.roxo.realce} />
<RotuloValor ponto={centro} nome="Amparo" valor="R$37M" entra={q("amparo", 0.1)} zoomBase={9} />
<TituloGancho linhas={["Cidades mais", "pobres"]} entra={0} y={900} />
<FlashBokeh em={0} />               // clarão de abertura
```
Câmera: `percurso` com uma parada por cidade e uma parada `vistaDe(estado)` a cada 2–3.

### B. Região com personalidade (estilo Didático: "Conheça a região Sul"). Paleta `azul`
Região azul com contorno branco. Pessoas famosas **saltam de dentro do mapa**
(`FotoSaltando`), cada estado ganha a **própria bandeira recortada** com a sigla gigante
(`ImagemNaForma`), e os números sobem (`NumeroNoMapa` do Piauí). Transições com
**vazamento de luz** (`VazamentoDeLuz`) e fotos/drone da cidade em tela cheia
(`PainelFoto` do Piauí). O rio se desenha com brilho (`AnimatedRiver`).
```tsx
<ImagemNaForma regiao={estado("PR")} src={bandeira("pr")} sigla="PR" entra={q("parana")} />
<FotoSaltando regiao={regiao("Sul")} src="assets/sul/gisele.png" ancora={[-51, -29.5]} entra={q("gisele")} />
<VazamentoDeLuz em={q("tres", -0.1)} />   // o corte acontece escondido no pico da luz
```

### C. Temático / desenho (estilo Didático: "O clima do Brasil"). Cores `TEMATICAS`
Regiões pintadas por tema (equatorial verde, semiárido amarelo que **esquenta** até
vermelho, subtropical ciano). Por cima, **ícones 3D** que dão "pop" e ficam boiando (sol
com brilho, nuvem com chuva, cactos espalhados, árvores), um balão de fala e um título
letra por letra. É o mais trabalhoso: planeje os ícones por cena.
```tsx
<RegiaoDestaque regiao={nordeste} entra={a} cor={interpolateColors(q, [b, b + 20], [TEMATICAS.semiarido, TEMATICAS.quente])} />
<Icone3D nome="sun" x={800} y={500} entra={a} tamanho={260} brilho="#FFC400" />
<Icone3D nome="cloud_with_rain" ponto={[-60, -3]} entra={a + 6} />
<Precipitacao ponto={[-60, -2.6]} entra={a + 10} />
<IconesEspalhados nome="cactus" pontos={pontosDoSertao} entra={a + 12} />
<BalaoDeFala texto={"Calor\nda Peste"} x={300} y={900} entra={c} />
```

### D. Geografia comparada (Mapas Animados: "4 países com Amazonas"). Paleta `neon`
País de contexto em roxo (`TEMATICAS.contexto`) e depois zoom na sub-região em **verde neon
com halo**. Bandeiras recortadas nos países. **Cartão HUD** com a silhueta e o número, que
sai inclinando. Pino com nome ("Leticia ▼"). Legenda **uma palavra por vez**.
```tsx
<RegiaoDestaque regiao={colombia} entra={a} estilo="chapado" cor={TEMATICAS.contexto} sai={b} />
<RegiaoDestaque regiao={amazonasCO} entra={b} estilo="neon" paleta="neon" />
<CartaoHud regiao={amazonasCO} entra={q("109")} sai={q("leticia")} x={540} y={900} numero="109.000" unidade="km²" />
<PinoRotulo ponto={leticia} nome="Leticia" entra={q("leticia")} />
<LegendaPalavras palavras={transcript.palavras} modo="palavra" />
```

### E. Documentário explicativo ("O bico do Mato Grosso"). Paleta `agua`
Satélite escuro, preenchimento verde-água translúcido **piscando** no assunto, rios se
desenhando até um alfinete e rótulos pequenos. Câmera lenta, com um recuo grande para
comparar (até os EUA). É o mais fácil: `RegiaoDestaque estilo="neon" paleta="agua"` +
`AnimatedRiver` + `PinoRotulo`.

> O estilo **D** completo (10 vídeos do canal analisados quadro a quadro: cores, tempos,
> transições, roteiro e áudio) está na skill `.claude/skills/mapas-animados/`. Ela
> difere do resumo acima em pontos importantes: satélite **claro** (não escurecido), uma
> cor por papel em vez de uma paleta só, texto digitado letra a letra e **sem música**.

---

## 3. Que estilo usar para cada tema

| Tema pedido | Estilo base | Complementos |
|---|---|---|
| ranking, "as N cidades mais…", eleição, PIB, população | **A** | cartão HUD (D) no número principal |
| "conheça o estado/região", turismo, cliente de cidade | **B** | rótulos acumulados (A), `PainelFoto` |
| clima, bioma, relevo, "por que o Nordeste é seco" | **C** | vazamento de luz (B) entre partes |
| curiosidade de fronteira, nomes, comparação entre países | **D** | bandeira na forma (B) |
| "por que o mapa é assim", história de divisa, rios | **E** | cartão HUD (D) |

Na dúvida, **A + D** (o ranking com cartão HUD) é o combo que mais combina com os vídeos de
cliente.

---

## 4. Catálogo do kit (`import { … } from "../../kit"`)

| Peça | Onde vai | O que faz |
|---|---|---|
| `RegiaoDestaque` | dentro do `<MapaSvg>` | região `chapado` / `neon` / `contorno`; o contorno se desenha e o preenchimento sobe com um flash |
| `ImagemNaForma` + `bandeira("pi")` | dentro do `<MapaSvg>` | bandeira/foto recortada no contorno, abre em onda, sigla gigante opcional |
| `FotoSaltando` | dentro do `<MapaSvg>` | PNG sem fundo que sai de dentro da região (a base fica presa no contorno, a cabeça escapa) |
| `RotuloValor` | dentro do `<MapCamera>` | NOME letra por letra + valor com pop; encolhe quando a câmera se afasta (acúmulo) |
| `PinoRotulo` | dentro do `<MapCamera>` | "Nome ▼" caindo sobre o ponto, com brilho |
| `Icone3D`, `IconesEspalhados` | dentro do `<MapCamera>` | adesivo 3D com pop + boia; `ponto` (preso ao mapa) ou `x/y` (tela) |
| `Precipitacao` | dentro do `<MapCamera>` | chuva ou neve caindo embaixo de uma nuvem |
| `JanelaFoto` | dentro do `<MapCamera>` | foto real que nasce do ponto do mapa, anda por dentro (zoom + pan) e volta para o ponto: mapa → imagem → mapa sem corte seco. **O card padrão do projeto** (retângulo, borda dourada). Acabamento opcional: `inclina` (nasce girado em 3D), `faisca` (luz correndo no fio), `brilho` (reflexo na foto) |
| `CartaoFoto` | dentro do `<MapCamera>` | cartão pequeno com foto e nome, para séries (vários lado a lado, um por nome falado), com fio até o lugar |
| `IconeDuna` | onde couber um ícone | ícone de duna de areia no acabamento 3D (não existe emoji de duna) |
| `MarcaDagua` | tela, por último (antes do preto) | a marca d'água do canal (texto ou logo do `marca.json`), semitransparente, fixa no meio do pé da tela (5% acima da borda), em Montserrat — **vai em todo vídeo vertical**. Vídeo de cliente: `imagem` (logo em public/) e `largura` no lugar do texto |
| `RelogioAndando` | dentro do `<MapCamera>` | relógio 3D com os ponteiros girando: o tempo de uma viagem ("algumas horas depois") |
| `CameraGlobo` + `Globo` | no lugar do `<MapCamera>` | o PLANETA em WebGL (câmera em perspectiva, satélite em mosaicos, Sol com dia/noite, atmosfera, nuvens, luzes das cidades): do espaço ao chão numa tacada só e viagens entre continentes (voo van Wijk sobre a esfera). As peças do kit funcionam dentro dele. `borrao` (0–1) faz o borrão radial dos mergulhos no próprio planeta (estilo Mapas Animados) |
| `Recorte`, `mosaico`, `faixaDeTiles` | imagens.ts do vídeo | os recortes de satélite do `CameraGlobo`: o vídeo lista caixa + zoom, o script de tiles costura e o globo sabe onde cada imagem cai |
| `trajeto`, `ritmoDoTrajeto` | roteiro | uma rota real em METROS (ponto e rumo a cada metro) e o ritmo dela: freia nas esquinas, solta nas retas, pousa na chegada — a linha e a câmera leem o mesmo ritmo |
| `RotaGeo` | dentro do `<MapaSvg>` | a rota pelas ruas se desenhando com ponta de luz e rastro, anel na partida |
| `chavesDeFuncao`, `viagemGlobo` | roteiro | câmera que acompanha uma rota (uma chave por quadro); viagem com escalas sem parar nelas (Brasil → Nordeste → Maranhão) |
| `MapaUrbano` | entre o `<Globo>` e o `<MapaSvg>` | a cidade desenhada onde o satélite acaba: ruas do OSM por classe, rios na largura real, cada endereço do CNEFE como luz (longe) ou lote (perto); acende num raio, destaca rua ou bairro |
| `NomeDaVia` | dentro da câmera | o nome da rua perto dela (ponto, fio, letras se apertando), sem sair da tela |
| `MarcadorGeo` | dentro da câmera | marcador próprio (sem pino): ponto → onda → disco que sobe com sombra → etiquetas ao longo do tempo; ícone por tipo (casa, hotel, restaurante…) |
| `DestinoGeo`, `FotoDoDestino`, `PainelFinal`, `recorteDoMapa` | dados / câmera / tela | o formato comercial: os dados do lugar num objeto; a foto nasce do marcador, assenta num cartão e volta; o painel final foto + mapa (a câmera recortada) |
| `PontoGeo` | dentro da câmera | o ponto de referência DISCRETO de um passeio pela cidade (praça, igreja, mercado, estação…): onda no chão, haste curta, disco com o ícone do tipo (`city`, `neighborhood`, `street`, `avenue`, `square`, `church`, `historic`, `business`, `tourist`, `station`) e o nome ao lado, do lado que tiver espaço |
| `cameraNaRota`, `desenrolarGiro` | roteiro | a câmera que anda pela rua junto com a `RotaGeo` (a ponta abaixo do meio, a tela virando com a rua sem rodopiar); `desenrolarGiro` tira os pulos de 360° de uma lista de chaves |
| `planejarJornada`, `JornadaDeBairros`, `destaqueDaJornada` | roteiro / câmera / MapaUrbano | o passeio BAIRRO POR BAIRRO sem código repetido: o plano dá as janelas e as chaves (o enquadramento sai da extensão de cada bairro), o componente põe o nome e o ponto de referência, o destaque acende os endereços do bairro da vez no `MapaUrbano` |
| `CirculoNoMapa` | dentro do `<MapaSvg>` | o círculo que marca o lugar EXATO no tamanho de verdade (`raioKm`, na superfície; curva com o globo), com mira e pulso; `tracejado` para hipótese |
| `RotaNoGlobo` | dentro do `<MapaSvg>` | rota pelo círculo máximo que se desenha com ponta de luz (viagens entre continentes, rotas convergindo) |
| `FotoIris` | dentro da câmera | foto real que abre como íris a partir do ponto do mapa (ou da tela), anda por dentro e fecha de volta para o ponto (ou dissolve). Com `raio` vira LENTE redonda (o mapa continua em volta) e com `destino` ela flutua do ponto até um espaço livre, presa por um fio |
| `Chamada` | dentro da câmera | nome sem caixa: ponto de luz no lugar + fio fino até um espaço livre (a do vídeo "Ceará", agora no kit) |
| `Selo3D` | tela, junto do card | o ícone 3D preso ao canto de um card ou número (pop girando, boia, sai com ele) — o "carimbo" do assunto |
| `Mixagem` (+ `blocosDeFala`, `falando`) | index do vídeo, por último | o "AudioMixer": narração (falas do sincronizar) > música com ducking pelas palavras do Whisper > efeitos (−4 dB em cima de fala). `ganhoSons` calibra todos os efeitos; `musica.forma` dá o arco da trilha (contida no gancho, crescendo) |
| `FotoNoMapa` | dentro da câmera (fora do `<MapaSvg>`) | **a linguagem sóbria (documentário)**: card retangular na proporção da foto (a paisagem não é cortada), preso ao lugar por um fio fino; entra com fade + escala 0,96 → 1, a foto anda bem devagar por dentro, troca para a foto do próximo lugar num fade curto (o fio e o marcador deslizam até lá) e sai com fade. Sem brilho, sem inclinação. Uma sequência de lugares num card só |
| `FotoNoMapaAnimada` | dentro da câmera (fora do `<MapaSvg>`) | **o cartão de foto animado (como os do Alagoas/Pernambuco)**: cartão grande em cima, preso ao lugar por um fio; entra com pop + desgiro + desembaço, cada foto nova DESLIZA da direita com clarão, brilho diagonal passa no vidro; o nome do lugar numa tarja digitada DENTRO do cartão e um ícone 3D em disco (IconeDestaque) no canto, um por foto; a altura vem da proporção da foto (sem corte) |
| `CartaoNoMapa` | dentro da câmera (fora do `<MapaSvg>`) | **o mosaico energético (Mapas Animados)**: foto com moldura branca que CAI sobre o mapa (1,35× desfocada → passa do ponto → assenta inclinada, com clarão), presa ao lugar por um fio que corre do ponto (onda de choque) até o cartão; selo de ícone 3D opcional no canto e `rotulo` (o nome do lugar numa tarja digitada no pé do cartão); sai por chicote lateral. Vários cartões, um por palavra, ficam juntos na tela ("ele reúne praias, rios, cidades…"). Proporção da foto, sem corte |
| `TextoNoMar` | dentro da câmera (fora do `<MapaSvg>`) ou na tela | **o nome do mar/oceano**: as letras SOBEM da água uma a uma (achatadas e desfocadas → passam do ponto → assentam), azul em degradê com contorno branco e brilho, uma ondinha abre embaixo de cada letra, reflexo espelhado na água, um brilho passa depois que todas chegam, balanço levíssimo; na saída afundam de trás para frente |
| `TracadoGeo` | dentro do `<MapaSvg>` | uma linha que anda da primeira à última coordenada: `estilo="rio"` (água, da nascente à foz, com o ponto de luz na frente) ou `"trilha"` (o caminho de uma viagem, pontilhado; `fluxo` faz o tracejado correr no sentido da linha). Sem filtro de brilho |
| `catalogoDeImagens` | assets.ts do vídeo | as imagens num catálogo só (chave → arquivo) e a pasta `substituicoes/` que ganha de tudo: o autor troca a foto pondo `substituicoes/<chave>.jpg`, sem mexer em código |
| `TituloCinema` | tela | título de documentário: letras espaçadas que entram do desfoque e se apertam devagar, com fio de luz (o oposto do `TituloGancho`) |
| `BalaoDeFala` | dentro do `<MapCamera>` | balão branco com pop e texto digitando |
| `TituloGancho` | tela | título letra por letra, inclinado, 2ª linha colorida |
| `TextoDigitado` | tela ou dentro do `<MapCamera>` (`ponto`) | **estilo "Mapas Animados"**: nome/número digitado caractere a caractere (número não conta: "1"→"1."→"1.167"), unidade menor no fim, apaga de trás para frente; brilho na cor do assunto, ▼ opcional |
| `BorraoRadial` | envolvendo as camadas do mapa | o zoom blur dos mergulhos/recuos: N cópias crescendo do centro; a intensidade vem da velocidade do zoom da câmera (zera parada). `rastro` [dx, dy] soma o borrão de movimento dos voos laterais (a velocidade do centro da câmera na tela) |
| `TextoImpacto` | tela | **estilo "Mapas Animados"**: "MAS EXISTE UM DETALHE" / "1895" despencando da câmera (escala 3,5 → 1 em 5 quadros); sai voando para a câmera ou em fade. No máximo 2–3 por vídeo |
| `SetaReta` | dentro do `<MapaSvg>` | a seta grossa "em linha reta" (cauda larga → ponta), translúcida, que dispara de um ponto a outro e sai encolhendo; o valor vai num `TextoDigitado` inclinado no ângulo dela |
| `ImagemDeDrone` | tela (fora do `<MapCamera>`, por baixo da legenda) | a imagem real do lugar (o "trecho de drone"), entrando e saindo por **chicote lateral** (10 quadros, borrão horizontal por cópias) e andando devagar por dentro (zoom + deslize). `modo="tela"` (foto em pé, tela cheia) ou `modo="cartao"` (a foto INTEIRA na proporção dela — passe a `proporcao` medida no arquivo; foto em pé vira cartão estreito com `alturaMaxima`, sem corte —, cantos arredondados e fio branco, sobre ela mesma desfocada e escurecida). Clarão ao assentar, reflexo que passa uma vez, giro 3D no chicote. `corteNaEntrada`/`corteNaSaida` = corte seco entre fotos |
| `IconeDestaque` | tela ou dentro do `<MapCamera>` (`ponto`) | o ícone 3D "de vitrine": pousa num disco de vidro na cor do assunto (aro branco, reflexo, halo), cai girando e amassa ao pousar, solta onda de choque e faíscas, flutua com sombra (`parado` = fica quieto depois de pousar: sem flutuar nem balançar — use quando o vídeo não pode "tremer"); com `ponto` + `haste`, fica acima do lugar preso por uma haste com ponto na ponta. `disco={false}` = só o ícone |
| `MapaDeLocalizacao` | tela (fora da câmera) | o "mapinha" de referência: cartão pequeno de vidro escuro no canto de baixo à direita com a silhueta do estado e um ponto pulsando no lugar da vez; o ponto desliza de uma parada para a próxima e o nome curto aparece embaixo. Reprovado nos vídeos testados: use só se a pessoa pedir. |
| `PainelNumero` | tela | o HUD de número: cartão de vidro escuro (desfoca o fundo, fio de luz na cor do assunto, brilho que passa uma vez) com ícone 3D, número digitado e rótulo; entra subindo com pop. Legível em cima de mapa ou foto |
| `EtiquetaDeLugar` | tela | a tag do lugar em cima de uma foto: pino na cor do assunto + nome digitado, num vidro que abre da esquerda |
| `TagNoMapa` | dentro do `<MapCamera>` (`ponto`) ou tela | a etiqueta CHAPADA do estilo "Mapas Animados": retângulo na cor do assunto, borda branca, texto branco digitado (a tag já nasce no tamanho final); pop seco de 7 quadros, sai apagando as letras de trás para a frente. Nome de partido em cima do estado, escudo de rodovia |
| `RetratoNoMapa` | dentro do `<MapCamera>` (com `ponto`) ou na tela (`x`/`y`, sem `ponto`) | a pessoa no lugar dela (governador no estado): disco com a foto, borda branca e aro na cor do assunto, pop seco; o nome digita embaixo e um `selo` ("REELEITO", "71,0%") entra como tag chapada. Fixo na tela serve para o duelo de candidatos e o placar |
| `CartaoHud` | tela | moldura neon com a silhueta da região e o número; sai inclinando |
| `LegendaPalavras` | tela | legenda sincronizada com o Whisper (`bloco` ou `palavra`); `seco` = corte seco, tudo branco, Montserrat 800 (estilo "Mapas Animados") |
| `VazamentoDeLuz`, `FlashBokeh`, `Clarao` | por último | transições de luz (procedurais, sem arquivo) |
| `percurso`, `vistaDe`, `vistaEm` | roteiro | câmera "anda e para" sobre o motor existente |
| `estado("PI")`, `regiao("Sul")`, `UFS` | dados | contornos IBGE das UFs (simplificados) |
| `PALETAS`, `TEMATICAS` | tudo | as cores dos estilos |
| `entra`, `sai`, `pulso`, `boia`, `CURVA.pop` | tudo | o relógio e as curvas do kit |
| `FORMATOS`, `useFormato`, `formatoDe` (`src/motor/formato.ts`) | tudo | o **perfil de formato**: vertical 9:16 ou horizontal 16:9. `LegendaPalavras`, `PainelNumero`, `TextoImpacto`, `TextoNoMar`, `TextoDigitado`, `ParteDoTodo` e `MarcaDagua` tiram dele as posições **padrão** (quem passa `x`/`y` continua mandando); no vertical os padrões são os de sempre. Molde horizontal: `g01` |
| `enquadrarNaArea` | roteiro | a câmera que encaixa uma caixa geográfica numa ÁREA da tela: `areaDoAssunto` (no horizontal, os 2/3 direitos; o terço esquerdo fica para os painéis) ou `telaLivre`. É o `naFaixa` dos verticais generalizado |
| `ParteDoTodo` | tela | o pictograma de proporção ("1 em cada 5 barris"): N **ícones 3D do banco** (`icone="barril_de_petroleo"`, `petroleiro`, `busts_in_silhouette`…) entrando com pop; os destacados acendem na palavra (cor + brilho), os outros apagam em cinza. Para proporção; valor absoluto vai no `PainelNumero` |
| `LegendaDoc`, `Destaque`, `CartelaFinal` (`src/kit/horizontal`) | tela | **só do documentário horizontal**: a legenda baixa e menor com a palavra falada em dourado (sem cartão); o número/data em tipografia grande com filete dourado no terço esquerdo (no lugar do cartão de vidro); a vinheta final com logo, "SIGA O CANAL", sino/like/compartilhe/comente e a pergunta |
| `RegiaoEditorial`, `RotuloMapa`, `CartelaDeTitulo`, `ImagemEditorial` (`src/kit/horizontal`) | mapa / tela | a **identidade horizontal** (o mapa escuro do São Luís/Piauí/Ceará): contorno dourado que se desenha com brilho e entorno escurecido; nome em versalete espaçado com ponto dourado; título e cartela de capítulo no centro; imagem que dissolve. O motor declarativo escolhe essas peças sozinho em 16:9 |
| `LogoDoCanal` | por último | o selo com a logo redonda do `marca.json` nos vídeos **horizontais**: pequeno, transparente, no canto de baixo à direita, do primeiro ao último quadro (posição no perfil de formato; no vertical não desenha nada — lá vai a `MarcaDagua`) |
| `montarDocumentario` + `MapaDasBatidas`/`TextosDasBatidas`/`ImagensDasBatidas` (`src/kit/documentario`) | roteiro + index | o **documentário declarativo**: cada cena é uma lista de batidas (`pais` com bandeira, `nome`, `mar`, `rota`, `circulo`, `painel`, `proporcao`, `icone`, `impacto`, `data`, `imagem`) presas às palavras da narração, e de paradas de câmera; o motor resolve os quadros, monta a câmera, confere contra o áudio e desenha com as peças do kit |
| `ImagemIA`, `imagemDoManifesto` | tela | a imagem **gerada por IA** (scripts/imagens) em tela cheia com zoom/deslocamento que nunca mostra borda; `imagemDoManifesto` pega a versão aprovada (ou a mais recente) e PARA o render se a imagem não existir. Imagem de apoio com chicote: passe o `src` dela ao `ImagemDeDrone` |
| `trocarPalavras` | roteiro | corrige a GRAFIA da legenda (o Whisper acerta o tempo e erra a escrita: "ao Omã" → "a Omã") sem mexer no áudio nem nos eventos |

Peças da base do motor (em `src/base/`): `MapCamera`, `MapaSvg`, `useMapa` (a câmera e a projeção
dentro das cenas), `MapBackground` + `Vinheta`, `SatelliteLayer` (os tiles do `npm run tiles`),
`StateBoundary`, `Pontos`, `TituloDeLugar` (o nome que sobe de trás da máscara); em `src/base/geo/`,
`cameraDoVideo`/`Chave`/`EASE` (a câmera por chaves) e `enquadrar` (a caixa geográfica → câmera).

### Assets prontos

- **Ícones 3D gerados** (Gemini, recortados do fundo verde, no mesmo banco `public/assets/icones-3d`): `barril_de_petroleo`, `petroleiro`, `navio_de_gas`, `cavalo_de_petroleo`, `oleoduto`, `tanque_de_petroleo`, `navio_de_guerra`, `mina_naval`, `fortaleza`, `nau`, `cadeado_fechado`, `aviao_de_passageiros`. Ícone novo: pedido no conjunto `icones` + `npm run imagens -- icones <doc>` (scripts/imagens/LEIA.md).
- `public/assets/icones-3d/`: 80 ícones 3D (Microsoft Fluent Emoji, **licença MIT**, uso
  comercial liberado). A lista tipada está em `src/kit/assets.ts`. Para ícone novo, é só pôr
  o PNG na pasta e o nome na lista.
- `public/assets/bandeiras/`: as 27 UFs + DF (siglas em minúsculo), `br` e os vizinhos
  (`ar py uy bo peru co ve gy sr franca cl ec`). Wikimedia Commons, símbolos oficiais em
  domínio público.
- Fotos de pessoas para `FotoSaltando`: precisam estar **sem fundo**
  (`pip install rembg` → `rembg i foto.jpg foto.png`) e ter licença de uso. Foto de
  famoso tem direito de imagem: em vídeo de cliente, prefira foto própria ou de banco
  licenciado.

---

## 5. Ritmo (a "cadência" dos originais)

| Momento | Duração típica |
|---|---|
| voo da câmera entre assuntos | 15–22 quadros (0,5–0,7 s) a 30 fps |
| região acendendo (traço + preenchimento) | 16 quadros |
| rótulo (nome + valor) | ~1 s até o valor fechar |
| ícone pop | 14 quadros, depois boia até sair |
| cartão HUD na tela | 2–3 s |
| vazamento de luz | 12–16 quadros, com o corte no pico |
| gancho (título + primeira imagem forte) | até 2 s: o espectador decide aqui |

A animação começa **0,1–0,3 s ANTES** da palavra (`q("palavra", -0.2)`), como numa edição
feita à mão.

## 6. O que NÃO fazer
- Duas paletas no mesmo vídeo, ou destaque em cor pastel (some sobre o satélite).
- Texto grande no meio do vídeo inteiro (só no gancho).
- Câmera totalmente parada por mais de ~2 s sem nada entrando.
- Grão de filme sobre satélite (lê como tremor).
- Crédito/fonte na tela.
