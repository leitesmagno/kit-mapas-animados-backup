import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";
import eventosJson from "./narracao/eventos.json";
import transcript from "./narracao/transcript.json";

// ---------------------------------------------------------------------------
// A decupagem, com a NARRAÇÃO como relógio (o mesmo esquema de "Sergipe", "Bahia", "Pará" e "Goiás"), no
// estilo "Mapas Animados": cada frase é uma BATIDA com uma novidade na tela, na palavra-chave.
//
// Todo quadro vem de narracao/eventos.json, gerado por `npm run sincronizar -- exemplo-vertical` a partir da voz
// (ElevenLabs → silêncios cortados → Whisper → início de cada palavra medido no áudio).
// `q("manaus", 0.2)` = 200 ms depois de a voz dizer "Manaus". Trocou a narração? Rode o sincronizar
// de novo e o vídeo inteiro se reajusta.
//
// 60 FPS (como o "Pará" e o "Goiás"): o vídeo sai a 60 quadros por segundo, mas TODA a
// decupagem continua contada em quadros de 30 (FPS), como o kit (useQuadro: a 60 fps o quadro 61 vale
// 30,5). Assim as durações medidas no canal (pop de 7 quadros, 1 letra por quadro…) continuam as
// mesmas, e cada animação ganha os quadros do meio. O Root registra FPS_DO_VIDEO e DURACAO_NO_VIDEO.
// ---------------------------------------------------------------------------

export const FPS = 30;
export const FPS_DO_VIDEO = 60;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/exemplo-vertical";
// o nível mais fundo dos tiles: 13 (o Sentinel-2 de 10 m, o EOxCloudless); mais perto que isso a
// imagem só amplia. Para ir mais fundo numa cidade, veja a skill (references/satelite.md).
export const ZOOM_MAX_TILES = 13;
// onde o satélite de perto (EOX) entra por cima da NASA: oeste, sul, leste, norte
export const AREA_DE_PERTO: [number, number, number, number] = [-74, -10, -56, 2.5];
// a deriva senoidal da câmera DESLIGADA, como em "Alagoas"/"Bahia"/"Pará" (ela balançava o mapa e
// tudo o que fica preso a ele "tremia"). A câmera continua sem parar pelo avanço LINEAR entre as chaves.
export const DERIVA = 0;

type Faixa = readonly [number, number];
type Evento = { t: number; fim: number; palavra: string };
const EVENTOS = eventosJson.eventos as Record<string, Evento>;

export const q = (nome: string, segundos = 0): number => {
  const e = EVENTOS[nome];
  if (!e) throw new Error(`evento "${nome}" não está em narracao/eventos.json — rode npm run sincronizar -- exemplo-vertical`);
  return Math.round((e.t + segundos) * FPS);
};
export const qFim = (nome: string, segundos = 0): number => Math.round((EVENTOS[nome].fim + segundos) * FPS);
const faixa = (a: number, b: number): Faixa => [a, b];
export const s = (segundos: number) => Math.round(segundos * FPS);

export const FIM_DA_FALA = Math.round(eventosJson.fimDaFala * FPS);

// a narração no vídeo (para a Mixagem do kit) e as palavras (para a legenda)
export const FALAS_NO_VIDEO = transcript.audios.map((a) => ({ arquivo: a.arquivo, inicio: a.inicio }));
export const PALAVRAS_NO_VIDEO = transcript.palavras.map((p) => ({ palavra: p.palavra, inicio: p.inicio, fim: p.fim }));

// A LEGENDA (pente fino do usuário, 2026-10-20: "mais embaixo, menorzinha, mais palavras, a palavra que
// estiver falando em amarelo"). Os pedaços ESCRITOS À MÃO abaixo são as unidades que nunca se cortam
// (nome próprio, locução); cada um é conferido palavra a palavra contra o Whisper (os números ficam como
// ele escreve: "7 milhões e meio") e a grafia é a do texto. A legenda junta pedaços seguidos numa LINHA de
// até 30 letras, fecha a linha no ponto final, e acende a palavra falada.
const BLOCOS_DA_LEGENDA = [
  "O maior rio | do mundo | atravessa | o Amazonas | inteiro. | E não existe | uma única ponte | sobre ele.",
  "E o maior estado | do Brasil | ainda guarda | um teatro | de ópera | no meio | da selva, | praias de rio | e cachoeiras | escondidas | na mata.",
  "Fica no Norte, | faz divisa | com Roraima, | Pará, | Mato Grosso, | Rondônia | e Acre, | e fronteira | com a Venezuela, | a Colômbia | e o Peru.",
  "São 62 municípios | e mais de | 4 milhões | de pessoas. | Metade vive | em Manaus, | a maior cidade | do Norte.",
  "E chegar lá | é uma aventura: | quase todo mundo | vai de avião | ou de barco. | Por terra, | a BR-319 | tem centenas | de quilômetros | de terra | no meio | da floresta.",
  "No auge | da borracha, | Manaus | era chamada | de Paris | dos Trópicos, | e ergueu | o Teatro Amazonas | com peças | trazidas | da Europa.",
  "Até que | um inglês | levou | 70 mil sementes | de seringueira, | que viraram | plantações | na Ásia. | E a riqueza | acabou.",
  "Décadas depois | veio | a Zona Franca. | Hoje, | quase toda a moto | fabricada | no Brasil | sai de Manaus.",
  "Na cidade, | ainda tem | o Mercado | Adolpho Lisboa | e a Praia | da Ponta Negra.",
  "Em frente, | o Negro, | escuro, | encontra | o Solimões, | barrento, | e eles correm | quilômetros | sem se misturar. | Juntos, | viram | o Rio Amazonas.",
  "Mas é saindo | de Manaus | que o Amazonas | impressiona.",
  "No Lago Janauari, | as vitórias-régias | passam | de dois metros.",
  "Em Novo Airão, | as Anavilhanas | formam | um labirinto | de 400 ilhas, | com botos-cor-de-rosa.",
  "Presidente Figueiredo | tem mais de | 100 cachoeiras | e grutas | no meio | da mata.",
  "Em Parintins, | uma ilha | no meio do rio, | o Festival | dos Bois | divide a cidade | entre Garantido | e Caprichoso.",
  "Em Maués | nasceu | o guaraná. | Para os Sateré-Mawé, | ele brotou | dos olhos | de um menino, | e, por isso, | parece um olho.",
  "O Amazonas | tem mais | indígenas | que qualquer estado: | mais de | 490 mil. | E no Vale | do Javari | vivem | povos isolados | até hoje.",
  "No extremo norte, | o Pico da Neblina | é o teto | do Brasil, | com quase | 3 mil metros.",
  "Do encontro | das águas | ao Pico | da Neblina, | o Amazonas | é cheio | de lugares | para descobrir.",
  "Qual desses lugares | você já conhecia?",
].flatMap((fala) => fala.split(" | "));

type Palavra = { palavra: string; inicio: number; fim: number };
const separar = (p: Palavra): Palavra[] => {
  const partes = p.palavra.split(" ");
  if (partes.length === 1) return [p];
  const total = partes.reduce((n, x) => n + x.length, 0);
  let t = p.inicio;
  return partes.map((x) => {
    const d = ((p.fim - p.inicio) * x.length) / total;
    const w = { palavra: x, inicio: t, fim: t + d };
    t += d;
    return w;
  });
};
const normal = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9º]/g, "");
// cada pedaço vira as palavras dele, com o tempo de cada uma medido pelo Whisper
const montarPedacos = (palavras: Palavra[]): Palavra[][] => {
  const lista = palavras.flatMap(separar);
  let i = 0;
  const saida = BLOCOS_DA_LEGENDA.map((bloco) => {
    const partes = bloco.split(" ");
    const doWhisper = lista.slice(i, i + partes.length);
    partes.forEach((x, k) => {
      if (normal(x) !== normal(doWhisper[k]?.palavra ?? "")) throw new Error(`legenda: "${x}" ≠ "${doWhisper[k]?.palavra}" (bloco "${bloco}")`);
    });
    i += partes.length;
    return partes.map((x, k) => ({ palavra: x, inicio: doWhisper[k].inicio, fim: doWhisper[k].fim }));
  });
  if (i !== lista.length) throw new Error(`legenda: sobraram ${lista.length - i} palavras do Whisper`);
  return saida;
};
const LETRAS_POR_LINHA = 30;
const texto = (ps: Palavra[]) => ps.map((p) => p.palavra).join(" ");
// uma FRASE (os pedaços até o ponto final) repartida no menor número de linhas de até 30 letras, com as
// linhas do tamanho mais parecido possível (sem sobrar um "do Brasil." sozinho no fim)
const repartir = (frase: Palavra[][]): Palavra[][] => {
  const n = frase.length;
  const tam = (i: number, j: number) => texto(frase.slice(i, j).flat()).length;
  for (let linhas = Math.max(1, Math.ceil(tam(0, n) / LETRAS_POR_LINHA)); linhas <= n; linhas++) {
    // pior[k][i]: o menor "maior comprimento" repartindo os pedaços i… em k linhas
    const memo = new Map<string, { pior: number; cortes: number[] }>();
    const melhor = (k: number, i: number): { pior: number; cortes: number[] } => {
      const chave = `${k},${i}`;
      if (memo.has(chave)) return memo.get(chave)!;
      let r = { pior: Infinity, cortes: [] as number[] };
      if (k === 1) r = tam(i, n) <= LETRAS_POR_LINHA ? { pior: tam(i, n), cortes: [] } : r;
      else
        for (let j = i + 1; j <= n - k + 1; j++) {
          const t = tam(i, j);
          if (t > LETRAS_POR_LINHA) break;
          const resto = melhor(k - 1, j);
          const pior = Math.max(t, resto.pior);
          if (pior < r.pior) r = { pior, cortes: [j, ...resto.cortes] };
        }
      memo.set(chave, r);
      return r;
    };
    const r = melhor(linhas, 0);
    if (r.pior < Infinity) {
      const limites = [0, ...r.cortes, n];
      return limites.slice(1).map((fim, k) => frase.slice(limites[k], fim).flat());
    }
  }
  return frase.map((p) => p);
};
const juntarEmLinhas = (pedacos: Palavra[][]): Palavra[][] => {
  const linhas: Palavra[][] = [];
  let frase: Palavra[][] = [];
  for (const pedaco of pedacos) {
    frase.push(pedaco);
    if (/[.?!]$/.test(pedaco[pedaco.length - 1].palavra)) {
      linhas.push(...repartir(frase));
      frase = [];
    }
  }
  if (frase.length) linhas.push(...repartir(frase));
  return linhas;
};
const PEDACOS = montarPedacos(PALAVRAS_NO_VIDEO);
// as LINHAS da legenda (cada uma, uma linha na tela) e as palavras soltas (para a Mixagem)
export const LINHAS_DA_LEGENDA = juntarEmLinhas(PEDACOS);
export const LEGENDA = LINHAS_DA_LEGENDA.flat();

// a curva dos voos e mergulhos (a mesma da "Bahia"/"Pará"): sai rápido e freia forte
export const VOO = Easing.bezier(0.6, 0, 0.25, 1);

// ===========================================================================
// CENA 01 — GANCHO
// "O maior rio do mundo atravessa o Amazonas inteiro. E não existe uma única ponte sobre ele. E o maior
// estado do Brasil ainda guarda um teatro de ópera no meio da selva, praias de rio e cachoeiras
// escondidas na mata."
// ===========================================================================
export const CENA01 = {
  inicio: 0,
  // o Brasil inteiro, já andando → "O maior rio…": o Rio Amazonas se desenha do Peru até a foz enquanto a
  // câmera mergulha até ele (chega em "o Amazonas"); o nome "RIO AMAZONAS" digita em cima
  rio: faixa(q("maiorRio", 0.0), q("amazonas", 0.2)),
  mergulho: faixa(q("maiorRio", 0.1), q("amazonas", 0.1)),
  nomeRio: q("atravessa", -0.1),
  // "…atravessa o Amazonas inteiro": o estado acende em verde em volta do rio (piscada) e o contorno
  // pulsa em "inteiro"
  amazonas: q("amazonas", -0.03),
  inteiro: q("inteiro", -0.05),
  // "E não existe uma única ponte…": o painel "0 PONTES" com o ícone de proibido; o rio pulsa
  ponte: q("ponte", -0.08),
  // "E o maior estado do Brasil…": a BANDEIRA abre dentro do estado e "AMAZONAS" digita no alto; a câmera
  // assenta no estado inteiro
  estado: q("maiorEstado", -0.05),
  assenta: faixa(q("maiorEstado", -0.2), q("maiorEstado", 0.8)),
  // "…um teatro de ópera…": as imagens reais em cortes secos (com a etiqueta do lugar); as pausas na fala
  // dão tempo de ver cada uma
  teatro: q("teatro", -0.1),
  praias: q("praias", -0.1),
  cachoeiras: q("cachoeiras", -0.1),
  // de volta ao mapa logo antes de "Fica no Norte"
  fotoSai: q("norte", -0.6),
};

// ===========================================================================
// CENA 02 — AS DIVISAS
// "Fica no Norte, faz divisa com Roraima, Pará, Mato Grosso, Rondônia e Acre, e fronteira com a
// Venezuela, a Colômbia e o Peru."
// ===========================================================================
export const CENA02 = {
  inicio: q("norte", -0.6),
  // "Fica no Norte…": a câmera recua até a REGIÃO NORTE inteira; os outros seis estados acendem em
  // branco em volta do Amazonas e "REGIÃO NORTE" digita sobre o Pará; sai quando as bandeiras entram
  norte: q("norte", -0.05),
  regiao: faixa(q("norte", -0.15), q("norte", 0.55)),
  // "…faz divisa…": o recuo até os vizinhos e os três países inteiros
  divisa: faixa(q("divisa", -0.08), q("divisa", 0.75)),
  // cada vizinho ganha a bandeira e a sigla NA PALAVRA
  roraima: q("roraima", -0.06),
  para: q("para", -0.06),
  mt: q("mt", -0.06),
  rondonia: q("rondonia", -0.06),
  acre: q("acre", -0.06),
  // "…e fronteira com…": cada país ganha a bandeira e o nome NA PALAVRA
  fronteira: q("fronteira", -0.05),
  venezuela: q("venezuela", -0.06),
  colombia: q("colombia", -0.06),
  peru: q("peru", -0.06),
};

// ===========================================================================
// CENA 03 — OS NÚMEROS E MANAUS
// "São sessenta e dois municípios e mais de quatro milhões de pessoas. Metade vive em Manaus, a maior
// cidade do Norte."
// ===========================================================================
export const CENA03 = {
  inicio: q("municipios", -1.0),
  // de volta ao estado (as bandeiras dos vizinhos e dos países apagam); a malha dos 62 municípios se
  // desenha de Manaus para fora, por cima da bandeira; o painel "62 MUNICÍPIOS"
  volta: faixa(q("municipios", -1.0), q("municipios", 0.0)),
  municipios: q("municipios", -0.05),
  malha: faixa(q("municipios", 0.0), q("municipios", 1.0)),
  // "…e mais de quatro milhões de pessoas": as sedes acendem em onda a partir de Manaus, do tamanho da
  // população; o painel "4.360.926 HABITANTES" (IBGE, 2026)
  milhoes: q("milhoes", -0.05),
  pontos: faixa(q("milhoes", -0.1), q("milhoes", 1.3)),
  // "Metade vive…": os pontos do interior apagam e o de Manaus cresce; o painel "53% EM MANAUS"
  metade: q("metade", -0.05),
  // "…em Manaus": o MERGULHO até Manaus, o município inteiro no meio da tela, o contorno acende e o pino
  // cai
  mergulho: faixa(q("manaus", -0.3), q("manaus", 0.7)),
  manaus: q("manaus", 0.0),
  // "…a maior cidade do Norte": a tag e a coroa
  maior: q("maiorCidade", -0.05),
};

// o início de cada fala (para as cenas que começam junto com a voz)
const fala = (n: number) => transcript.audios.find((a) => a.arquivo.endsWith(`am-${String(n).padStart(2, "0")}.mp3`))!.inicio;
const naFala = (n: number, segundos = 0) => Math.round((fala(n) + segundos) * FPS);

// ===========================================================================
// CENA 04 — COMO SE CHEGA
// "E chegar lá é uma aventura: quase todo mundo vai de avião ou de barco. Por terra, a BR trezentos e
// dezenove tem centenas de quilômetros de terra no meio da floresta."
// ===========================================================================
export const CENA04 = {
  inicio: naFala(5, -0.08),
  // "E chegar lá…": a câmera recua de Manaus até um quadro com Brasília e Belém (de onde vêm o avião e o
  // barco); a tag "UMA AVENTURA"
  recuo: faixa(naFala(5, -0.08), q("aventura", 0.25)),
  aventura: q("aventura", -0.05),
  // "…de avião…": o avião voa de Brasília a Manaus, deixando o rastro tracejado
  aviao: faixa(q("aviao", -0.12), q("aviao", 1.1)),
  // "…ou de barco": o barco sobe o Amazonas de Belém a Manaus
  barco: faixa(q("barco", -0.12), q("terra", 0.35)),
  // "Por terra…": o voo até a BR-319 inteira (o mapa embaixo, o cartão em cima)
  voo: faixa(q("terra", -0.1), q("terra", 0.85)),
  // "…a BR-319…": a estrada se desenha de Manaus a Porto Velho, com o escudo
  estrada: faixa(q("br319", -0.1), q("br319", 1.2)),
  br319: q("br319", -0.05),
  // "…tem centenas de quilômetros de terra…": o trecho do meio vira terra (tracejado) e a foto da estrada
  // entra no cartão de cima, presa ao trecho por um fio; a tag
  terra: q("centenas", -0.1),
  // "…no meio da floresta": a câmera segue derivando até a borracha
};

// ===========================================================================
// CENA 05 — A BORRACHA (a história: o satélite fica cinza até a Zona Franca)
// "No auge da borracha, Manaus era chamada de Paris dos Trópicos, e ergueu o Teatro Amazonas com peças
// trazidas da Europa."
// ===========================================================================
export const CENA05 = {
  inicio: naFala(6, -0.25),
  // "No auge da borracha…": o cartão sai, o satélite perde a cor e a câmera voa de volta ao centro de Manaus
  // (o mapa embaixo); o seringueiro (foto antiga) no cartão de cima
  cinza: faixa(naFala(6, -0.25), q("borracha", 0.5)),
  voo: faixa(naFala(6, -0.25), q("borracha", 0.55)),
  borracha: q("borracha", -0.05),
  // "…Paris dos Trópicos": a tag
  paris: q("paris", -0.05),
  // "…e ergueu o Teatro Amazonas…": o pino no Teatro e a foto dele à noite; "…da Europa": a tag troca
  // (a foto de dentro ficaria menos de 1 s: o Teatro fica até o recuo)
  teatro: q("teatroAm", -0.1),
  europa: q("europa", -0.1),
};

// ===========================================================================
// CENA 06 — AS SEMENTES
// "Até que um inglês levou setenta mil sementes de seringueira, que viraram plantações na Ásia. E a riqueza
// acabou."
// ===========================================================================
export const CENA06 = {
  inicio: naFala(7, -0.7),
  // "Até que um inglês…": o cartão sai e a câmera RECUA até o mundo (Manaus, Londres e a Ásia); o selo da
  // bandeira inglesa em Londres
  // (do prédio do Teatro ao mundo: 14 níveis de zoom, o recuo mais longo do vídeo)
  recuo: faixa(naFala(7, -0.7), q("ingles", 0.95)),
  // (Londres marca quando a câmera já abriu o mundo)
  ingles: q("ingles", 0.45),
  // "…levou setenta mil sementes…": a rota de Manaus a Londres se desenha, com a semente na ponta; o painel
  // "70.000 SEMENTES"
  sementes: q("sementes", -0.08),
  rota1: faixa(q("sementes", -0.05), q("seringueira", 0.55)),
  // "…que viraram plantações na Ásia": a rota de Londres à Ásia; as árvores pousam na Malásia
  rota2: faixa(q("asia", -0.6), q("asia", 0.35)),
  asia: q("asia", 0.0),
  // "E a riqueza acabou": o texto de impacto despenca
  acabou: q("acabou", -0.3),
};

// ===========================================================================
// CENA 07 — A ZONA FRANCA (a cor volta)
// "Décadas depois veio a Zona Franca. Hoje, quase toda moto fabricada no Brasil sai de Manaus."
// ===========================================================================
export const CENA07 = {
  inicio: naFala(8, -0.4),
  // "Décadas depois…": a cor volta e a câmera MERGULHA de novo em Manaus (a cidade embaixo; o mergulho mais
  // longo do vídeo, do mundo à cidade, com ~1,5 s para não "pular")
  cor: faixa(naFala(8, -0.4), q("zonaFranca", 0.1)),
  mergulho: faixa(naFala(8, -0.4), q("zonaFranca", 0.15)),
  // "…veio a Zona Franca": o Distrito Industrial pisca e a tag; a fábrica de motos no cartão de cima
  zonaFranca: q("zonaFranca", -0.05),
  // "…quase toda moto…": a tag troca
  moto: q("moto", -0.1),
};

// ===========================================================================
// CENA 08 — O MERCADO E A PONTA NEGRA
// "Na cidade, ainda tem o Mercado Adolpho Lisboa e a Praia da Ponta Negra."
// ===========================================================================
export const CENA08 = {
  inicio: naFala(9, -0.1),
  // cada lugar NA PALAVRA no mesmo cartão (a foto troca e o fio corre para o lugar novo), um pino por vez; a
  // câmera VOA até cada um, bem perto (o prédio do Mercado, a areia da Ponta Negra), e o contorno se desenha
  paraMercado: faixa(q("mercado", -0.6), q("mercado", 0.15)),
  mercado: q("mercado", -0.12),
  paraPontaNegra: faixa(q("pontaNegra", -0.6), q("pontaNegra", 0.15)),
  pontaNegra: q("pontaNegra", -0.12),
};

// ===========================================================================
// CENA 09 — O ENCONTRO DAS ÁGUAS
// "Em frente, o Negro, escuro, encontra o Solimões, barrento, e eles correm quilômetros sem se misturar.
// Juntos, viram o Rio Amazonas."
// ===========================================================================
export const CENA09 = {
  inicio: q("negro", -0.65),
  // "Em frente…": o cartão sai e a câmera voa até o Encontro das Águas, BEM perto (o satélite mostra as duas
  // cores lado a lado)
  // (o voo começa já na fala, para a Ponta Negra ficar mais de 1 s no cartão)
  voo: faixa(q("negro", -0.65), q("negro", 0.35)),
  // "…o Negro, escuro…": o nome digita sobre a água preta; "…o Solimões, barrento…": sobre a barrenta
  negro: q("negro", -0.05),
  solimoes: q("solimoes", 0.0),
  // "…barrento, e eles correm…": a foto do alto entra no cartão (o mapa desce para a faixa de baixo);
  // "…sem se misturar": a tag
  foto: q("barrento", 0.45),
  misturar: q("misturar", -0.05),
  // "Juntos, viram o Rio Amazonas": o cartão sai, a câmera recua e o Amazonas acende de Manaus para o leste
  recuo: faixa(q("juntos", -0.15), q("rioAmazonas", 0.35)),
  rioAmazonas: q("rioAmazonas", -0.05),
};

// ===========================================================================
// CENA 10 — A VIRADA
// "Mas é saindo de Manaus que o Amazonas impressiona."
// ===========================================================================
export const CENA10 = {
  inicio: q("mas", -0.4),
  // o recuo até o estado inteiro e o texto de impacto despenca
  recuo: faixa(q("mas", -0.4), q("mas", 0.6)),
  impacto: q("mas", -0.05),
  // "…impressiona": o contorno do estado pulsa
  impressiona: q("impressiona", -0.05),
};

// ===========================================================================
// CENA 11 — O LAGO JANAUARI
// "No Lago Janauari, as vitórias-régias passam de dois metros."
// ===========================================================================
export const CENA11 = {
  inicio: naFala(12, -0.65),
  // "No Lago Janauari…": o voo até o lago (o mapa embaixo); o pino e as vitórias-régias no cartão
  voo: faixa(naFala(12, -0.65), q("janauari", 0.35)),
  janauari: q("janauari", 0.2),
  // "…passam de dois metros": a tag
  metros: q("doisMetros", -0.05),
};

// ===========================================================================
// CENA 12 — ANAVILHANAS
// "Em Novo Airão, as Anavilhanas formam um labirinto de quatrocentas ilhas, com botos-cor-de-rosa."
// ===========================================================================
export const CENA12 = {
  inicio: naFala(13, -0.35),
  // "Em Novo Airão…": o voo até o arquipélago (o mapa embaixo); o pino na cidade
  voo: faixa(naFala(13, -0.35), q("novoAirao", 0.45)),
  novoAirao: q("novoAirao", 0.35),
  // "…as Anavilhanas…": o parque acende em verde e a foto entra no cartão
  anavilhanas: q("anavilhanas", -0.05),
  // "…quatrocentas ilhas": a tag; "…com botos-cor-de-rosa": a foto do boto
  ilhas: q("ilhas", -0.25),
  botos: q("botos", -0.12),
};

// ===========================================================================
// CENA 13 — PRESIDENTE FIGUEIREDO
// "Presidente Figueiredo tem mais de cem cachoeiras e grutas no meio da mata."
// ===========================================================================
export const CENA13 = {
  inicio: naFala(14, -0.35),
  // o voo até lá (o mapa embaixo); o pino e a Cachoeira do Santuário no cartão
  voo: faixa(naFala(14, -0.35), q("figueiredo", 0.4)),
  figueiredo: q("figueiredo", 0.3),
  // "…mais de cem cachoeiras": a tag; "…e grutas": a Caverna do Maroaga
  cem: q("cem", -0.05),
  grutas: q("grutas", -0.12),
};

// ===========================================================================
// CENA 14 — PARINTINS
// "Em Parintins, uma ilha no meio do rio, o Festival dos Bois divide a cidade entre Garantido e
// Caprichoso."
// ===========================================================================
export const CENA14 = {
  inicio: naFala(15, -0.55),
  // o voo longo até Parintins (o mapa embaixo); o pino e o município (a ilha) acende
  voo: faixa(naFala(15, -0.55), q("parintins", 0.4)),
  parintins: q("parintins", 0.3),
  // "…uma ilha no meio do rio": a tag
  ilha: q("ilha", -0.05),
  // "…o Festival dos Bois…": o Garantido no cartão; a foto troca para o Caprichoso logo depois de
  // "Garantido" (na palavra ele ficaria menos de 1 s) e o cartão fica até o voo seguinte andar um pouco
  festival: q("festival", -0.1),
  garantido: q("garantido", -0.05),
  fotoCaprichoso: q("garantido", 0.3),
  caprichoso: q("caprichoso", -0.1),
  fim: naFala(16, -0.35) + 12,
};

// ===========================================================================
// CENA 15 — MAUÉS E O GUARANÁ
// "Em Maués nasceu o guaraná. Para os Sateré-Mawé, ele brotou dos olhos de um menino, e por isso parece um
// olho."
// ===========================================================================
export const CENA15 = {
  inicio: naFala(16, -0.35),
  // o voo até Maués (o mapa embaixo); o pino
  voo: faixa(naFala(16, -0.35), q("maues", 0.35)),
  maues: q("maues", 0.25),
  // "…nasceu o guaraná": a foto no cartão; "…os Sateré-Mawé": a tag; "…parece um olho": a tag troca
  guarana: q("guarana", -0.1),
  satere: q("satere", -0.05),
  olho: q("olho", 0.25),
};

// ===========================================================================
// CENA 16 — OS POVOS
// "O Amazonas tem mais indígenas que qualquer estado: mais de quatrocentos e noventa mil. E no Vale do
// Javari vivem povos isolados até hoje."
// ===========================================================================
export const CENA16 = {
  inicio: naFala(17, -0.3),
  // o cartão sai e a câmera recua até o estado inteiro
  recuo: faixa(naFala(17, -0.3), q("indigenas", 0.2)),
  // "…mais indígenas que qualquer estado": a tag; "…mais de quatrocentos e noventa mil": o painel
  indigenas: q("indigenas", -0.05),
  numero: q("quatrocentos", -0.05),
  // "E no Vale do Javari…": o voo até a terra indígena, que acende; "…povos isolados": a tag
  voo: faixa(q("javari", -0.75), q("javari", 0.3)),
  javari: q("javari", -0.05),
  isolados: q("isolados", -0.05),
};

// ===========================================================================
// CENA 17 — O PICO DA NEBLINA
// "No extremo norte, o Pico da Neblina é o teto do Brasil, com quase três mil metros."
// ===========================================================================
export const CENA17 = {
  inicio: naFala(18, -0.3),
  // "No extremo norte…": o voo até o pico (o mapa embaixo)
  voo: faixa(naFala(18, -0.3), q("neblina", 0.15)),
  // "…o Pico da Neblina": o pino e a foto no cartão; "…o teto do Brasil": a tag; "…quase três mil
  // metros": a tag troca para a altitude
  neblina: q("neblina", 0.0),
  teto: q("teto", -0.05),
  metros: q("tresMil", -0.05),
};

// ===========================================================================
// CENA 18 — O FECHO (e o loop)
// "Do encontro das águas ao Pico da Neblina, o Amazonas é cheio de lugares para descobrir. Qual desses
// lugares você já conhecia?"
// ===========================================================================
export const CENA18 = {
  inicio: naFala(19, -0.45),
  // "Do encontro das águas…": o cartão sai e a câmera assenta no estado; cada lugar pousa fora dele, numa
  // janelinha presa ao lugar por um fio
  recuo: faixa(naFala(19, -0.45), q("encontroFim", 0.3)),
  encontro: q("encontroFim", 0.2),
  neblina: q("neblinaFim", 0.0),
  // "…o Amazonas é cheio de lugares…": a bandeira fica mais forte e o teatro pousa
  cheio: q("cheio", -0.3),
  // "…para descobrir": tudo sai e a câmera recua até o Brasil (o quadro do começo)
  saem: q("descobrir", 0.0),
  volta: faixa(q("descobrir", -0.05), q("qual", 0.4)),
  // "Qual desses lugares você já conhecia?": a pergunta; o último quadro é o primeiro
  qual: q("qual", -0.05),
  fim: FIM_DA_FALA + s(0.45),
};

// As cenas já entregues: o vídeo termina no começo da cena seguinte (o Studio mostra só o que está
// pronto). Com todas prontas, termina 0,45 s depois da última palavra (o canal fecha na última palavra e o
// vídeo emenda em loop).
export const CENAS_PRONTAS = 18;
const FIM_DAS_CENAS = [CENA02, CENA03, CENA04, CENA05, CENA06, CENA07, CENA08, CENA09, CENA10, CENA11, CENA12, CENA13, CENA14, CENA15, CENA16, CENA17, CENA18].map((c) => c.inicio);
export const DURACAO = CENAS_PRONTAS > FIM_DAS_CENAS.length ? FIM_DA_FALA + s(0.45) : FIM_DAS_CENAS[CENAS_PRONTAS - 1];
// a duração no vídeo de 60 fps (o Root registra esta)
export const DURACAO_NO_VIDEO = Math.round((DURACAO * FPS_DO_VIDEO) / FPS);

// ===========================================================================
// A CÂMERA. Enquadramentos para 9:16, bearing 0. A câmera NUNCA para: entre um voo e outro ela
// segue em DERIVA LINEAR (zoom +3–5%/s); só os voos e mergulhos têm curva (VOO).
// ===========================================================================
const W = LARGURA;
const H = ALTURA;
const LINEAR = (t: number) => t;
type Caixa = (typeof CAIXA)[keyof typeof CAIXA];
// a caixa encaixada numa FAIXA da tela (de `topo` a `base`, em px): o zoom vem da faixa e o
// centro da caixa cai no meio dela (o resto da tela fica para os painéis, o cartão e a legenda)
const naFaixa = (caixa: Caixa, topo: number, base: number, margem = 60) => enquadrar(caixa, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const deriva = (c: Cam, dz: number, dlon = 0, dlat = 0): Cam => ({ ...c, zoom: c.zoom + dz, lon: c.lon + dlon, lat: c.lat + dlat });
// o quadro do primeiro quadro do vídeo (o loop termina nele): o Brasil inteiro
export const COMECO = enquadrar(CAIXA.brasil, W, H, { margem: 30, deslocar: [0, -90] });
// o Rio Amazonas inteiro, do Peru à foz, com o estado (o gancho), abaixo do painel
const rio = naFaixa(CAIXA.rio, 470, 1400, 20);
// o Amazonas inteiro na faixa do meio, com o título e os painéis em cima
const am = naFaixa(CAIXA.am, 520, 1400, 30);
// a Região Norte inteira (cena 2, "Fica no Norte")
const norte = naFaixa(CAIXA.norte, 470, 1400, 20);
// o Amazonas com os cinco vizinhos e os três países (cena 2)
const vizinhos = naFaixa(CAIXA.vizinhos, 380, 1420, 10);
// Manaus no meio da tela (o formato da "Belém"/"Goiânia": a tag em cima, o painel embaixo)
const manaus = naFaixa(CAIXA.manaus, 560, 1380, 40);
// os lugares com o cartão de fotos em cima (até y ~1060): o mapa na faixa de baixo, de y 1090 a 1590,
// acima da legenda
const embaixo = (c: Caixa, margem = 30) => naFaixa(c, 1090, 1590, margem);
const acesso = naFaixa(CAIXA.acesso, 470, 1400, 20);
const br319 = embaixo(CAIXA.br319, 10);
const teatro = embaixo(CAIXA.teatro, 60);
const distrito = embaixo(CAIXA.distrito);
const mercado = embaixo(CAIXA.mercado, 60);
const pontaNegra = embaixo(CAIXA.pontaNegra, 40);
// o mundo: um enquadramento MONTADO (não da caixa) — o zoom alto o bastante para o mapa encher a tela de cima a
// baixo (no zoom da caixa apareciam a borda do mapa, preta, em cima e o branco embaixo; pente fino do
// usuário: "tá cortado"): no zoom 2,95 o mundo tem 1.980 px de altura, centrado no equador cobre a tela inteira;
// Manaus (x ~155), Londres e o Ceilão (x ~925) dentro da largura
const mundo: Cam = { lon: 10, lat: 0, zoom: 2.95, bearing: 0 };
const encontro = naFaixa(CAIXA.encontro, 470, 1400, 30);
const encontroEmbaixo = embaixo(CAIXA.encontro);
const amazonasLeste = naFaixa(CAIXA.amazonasLeste, 520, 1400, 20);
const janauari = embaixo(CAIXA.janauari);
const anavilhanas = embaixo(CAIXA.anavilhanas);
const presidenteFigueiredo = embaixo(CAIXA.presidenteFigueiredo);
const parintins = embaixo(CAIXA.parintins);
const maues = embaixo(CAIXA.maues);
const javari = naFaixa(CAIXA.javari, 560, 1400, 30);
const picoDaNeblina = embaixo(CAIXA.picoDaNeblina);

export const CAMERA_01: Chave[] = [
  // o Brasil inteiro, já andando…
  { quadro: 0, camera: COMECO },
  // …"O maior rio…": o mergulho até o rio inteiro (chega em "o Amazonas")
  { quadro: CENA01.mergulho[0] + 1, camera: deriva(COMECO, 0.02), easing: LINEAR },
  { quadro: CENA01.mergulho[1], camera: deriva(rio, -0.06), easing: VOO, rho: 1.3 },
  // segue chegando enquanto o estado acende e o painel da ponte entra
  { quadro: CENA01.assenta[0], camera: deriva(rio, 0.08), easing: LINEAR },
  // "E o maior estado…": assenta no estado inteiro
  { quadro: CENA01.assenta[1], camera: deriva(am, -0.05), easing: VOO, rho: 1.1 },
  // segue chegando (+3–4%/s, sem parar) enquanto as imagens passam
  { quadro: CENA02.regiao[0], camera: deriva(am, 0.2), easing: LINEAR },
  // "Fica no Norte": recua até a região inteira
  { quadro: CENA02.regiao[1], camera: deriva(norte, -0.04), easing: VOO, rho: 1.2 },
  { quadro: CENA02.divisa[0], camera: deriva(norte, 0.02), easing: LINEAR },
];

export const CAMERA_02: Chave[] = [
  // "…faz divisa…": recua até os vizinhos e os países inteiros
  { quadro: CENA02.divisa[1], camera: deriva(vizinhos, -0.04), easing: VOO, rho: 1.2 },
  { quadro: CENA03.volta[0], camera: deriva(vizinhos, 0.12), easing: LINEAR },
];

export const CAMERA_03: Chave[] = [
  // "São sessenta e dois municípios": de volta ao estado inteiro
  { quadro: CENA03.volta[1], camera: deriva(am, -0.06), easing: VOO, rho: 1.2 },
  { quadro: CENA03.mergulho[0], camera: deriva(am, 0.1), easing: LINEAR },
  // "…em Manaus": o mergulho em Manaus
  { quadro: CENA03.mergulho[1], camera: deriva(manaus, -0.1), easing: VOO, rho: 1.5 },
  { quadro: CENA04.recuo[0], camera: deriva(manaus, 0.05), easing: LINEAR },
];

export const CAMERA_04: Chave[] = [
  // "E chegar lá…": recua até Brasília e Belém
  { quadro: CENA04.recuo[1], camera: deriva(acesso, -0.05), easing: VOO, rho: 1.4 },
  { quadro: CENA04.voo[0], camera: deriva(acesso, 0.09), easing: LINEAR },
  // "Por terra…": o voo até a BR-319 (o mapa embaixo)
  { quadro: CENA04.voo[1], camera: deriva(br319, -0.05), easing: VOO, rho: 1.3 },
  { quadro: CENA05.voo[0], camera: deriva(br319, 0.12), easing: LINEAR },
];

export const CAMERA_05: Chave[] = [
  // "No auge da borracha…": o voo até o Teatro, BEM perto (o prédio no satélite de 2 m)
  { quadro: CENA05.voo[1], camera: deriva(teatro, -0.35), easing: VOO, rho: 1.5 },
  { quadro: CENA06.recuo[0], camera: deriva(teatro, 0.05), easing: LINEAR },
];

export const CAMERA_06: Chave[] = [
  // "Até que um inglês…": o recuo até o mundo
  // (o zoom nunca abaixo de 2,95: abaixo disso a borda do mapa apareceria em cima e embaixo)
  { quadro: CENA06.recuo[1], camera: deriva(mundo, 0.0), easing: VOO, rho: 1.6 },
  { quadro: CENA07.mergulho[0], camera: deriva(mundo, 0.07), easing: LINEAR },
];

export const CAMERA_07: Chave[] = [
  // "Décadas depois…": o mergulho de volta a Manaus, no Distrito Industrial
  { quadro: CENA07.mergulho[1], camera: deriva(distrito, -0.1), easing: VOO, rho: 1.7 },
  { quadro: CENA08.paraMercado[0], camera: deriva(distrito, 0.15), easing: LINEAR },
  // "…o Mercado Adolpho Lisboa": voa até o prédio
  { quadro: CENA08.paraMercado[1], camera: deriva(mercado, -0.3), easing: VOO, rho: 1.3 },
  { quadro: CENA08.paraPontaNegra[0], camera: deriva(mercado, -0.2), easing: LINEAR },
  // "…e a Praia da Ponta Negra": voa até a areia
  { quadro: CENA08.paraPontaNegra[1], camera: deriva(pontaNegra, -0.12), easing: VOO, rho: 1.3 },
  { quadro: CENA09.voo[0], camera: deriva(pontaNegra, -0.05), easing: LINEAR },
];

export const CAMERA_09: Chave[] = [
  // "Em frente…": o voo até o Encontro das Águas, bem perto, no meio da tela
  { quadro: CENA09.voo[1], camera: deriva(encontro, -0.08), easing: VOO, rho: 1.3 },
  { quadro: CENA09.foto - 2, camera: deriva(encontro, 0.06), easing: LINEAR },
  // "…e eles correm…": desce para a faixa de baixo (a foto do alto em cima)
  { quadro: CENA09.foto + 14, camera: deriva(encontroEmbaixo, -0.02), easing: VOO, rho: 1.1 },
  { quadro: CENA09.recuo[0], camera: deriva(encontroEmbaixo, 0.03), easing: LINEAR },
  // "Juntos, viram o Rio Amazonas": recua até o rio de Manaus para o leste
  { quadro: CENA09.recuo[1], camera: deriva(amazonasLeste, -0.05), easing: VOO, rho: 1.5 },
  { quadro: CENA10.recuo[0], camera: deriva(amazonasLeste, 0.05), easing: LINEAR },
];

export const CAMERA_10: Chave[] = [
  // "Mas é saindo de Manaus…": recua até o estado inteiro
  { quadro: CENA10.recuo[1], camera: deriva(am, -0.06), easing: VOO, rho: 1.2 },
  { quadro: CENA11.voo[0], camera: deriva(am, 0.06), easing: LINEAR },
];

export const CAMERA_11: Chave[] = [
  // "No Lago Janauari…": o mergulho até o lago
  { quadro: CENA11.voo[1], camera: deriva(janauari, -0.08), easing: VOO, rho: 1.6 },
  { quadro: CENA12.voo[0], camera: deriva(janauari, 0.1), easing: LINEAR },
];

export const CAMERA_12: Chave[] = [
  // "Em Novo Airão…": o voo até as Anavilhanas
  { quadro: CENA12.voo[1], camera: deriva(anavilhanas, -0.08), easing: VOO, rho: 1.4 },
  { quadro: CENA13.voo[0], camera: deriva(anavilhanas, 0.12), easing: LINEAR },
];

export const CAMERA_13: Chave[] = [
  // "Presidente Figueiredo…": o voo até as cachoeiras
  { quadro: CENA13.voo[1], camera: deriva(presidenteFigueiredo, -0.08), easing: VOO, rho: 1.4 },
  { quadro: CENA14.voo[0], camera: deriva(presidenteFigueiredo, 0.1), easing: LINEAR },
];

export const CAMERA_14: Chave[] = [
  // "Em Parintins…": o voo longo para o leste
  { quadro: CENA14.voo[1], camera: deriva(parintins, -0.08), easing: VOO, rho: 1.6 },
  { quadro: CENA15.voo[0], camera: deriva(parintins, 0.12), easing: LINEAR },
];

export const CAMERA_15: Chave[] = [
  // "Em Maués…": o voo curto até Maués
  { quadro: CENA15.voo[1], camera: deriva(maues, -0.08), easing: VOO, rho: 1.3 },
  { quadro: CENA16.recuo[0], camera: deriva(maues, 0.12), easing: LINEAR },
];

export const CAMERA_16: Chave[] = [
  // "O Amazonas tem mais indígenas…": recua até o estado inteiro
  { quadro: CENA16.recuo[1], camera: deriva(am, -0.06), easing: VOO, rho: 1.4 },
  { quadro: CENA16.voo[0], camera: deriva(am, 0.08), easing: LINEAR },
  // "E no Vale do Javari…": o voo até a terra indígena
  { quadro: CENA16.voo[1], camera: deriva(javari, -0.06), easing: VOO, rho: 1.3 },
  { quadro: CENA17.voo[0], camera: deriva(javari, 0.12), easing: LINEAR },
];

export const CAMERA_17: Chave[] = [
  // "No extremo norte…": o voo até o Pico da Neblina
  { quadro: CENA17.voo[1], camera: deriva(picoDaNeblina, -0.08), easing: VOO, rho: 1.6 },
  { quadro: CENA18.recuo[0], camera: deriva(picoDaNeblina, 0.12), easing: LINEAR },
];

export const CAMERA_18: Chave[] = [
  // "Do encontro das águas…": de volta ao estado inteiro
  { quadro: CENA18.recuo[1], camera: deriva(am, -0.06), easing: VOO, rho: 1.4 },
  { quadro: CENA18.volta[0], camera: deriva(am, 0.08), easing: LINEAR },
  // "…para descobrir": recua até o Brasil e chega devagar ao quadro do começo
  { quadro: CENA18.volta[1], camera: deriva(COMECO, -0.06), easing: VOO, rho: 1.3 },
  { quadro: CENA18.fim, camera: COMECO, easing: LINEAR },
];

export const CHAVES: Chave[] = [
  ...CAMERA_01,
  ...CAMERA_02,
  ...CAMERA_03,
  ...CAMERA_04,
  ...CAMERA_05,
  ...CAMERA_06,
  ...CAMERA_07,
  ...CAMERA_09,
  ...CAMERA_10,
  ...CAMERA_11,
  ...CAMERA_12,
  ...CAMERA_13,
  ...CAMERA_14,
  ...CAMERA_15,
  ...CAMERA_16,
  ...CAMERA_17,
  ...CAMERA_18,
];

// para a folha de contato e o Studio: o início de cada cena, em quadros (de 30)
export const CENAS = [
  ["01 Gancho", CENA01.inicio],
  ["02 As divisas", CENA02.inicio],
  ["03 Os números e Manaus", CENA03.inicio],
  ["04 Como se chega", CENA04.inicio],
  ["05 A borracha", CENA05.inicio],
  ["06 As sementes", CENA06.inicio],
  ["07 A Zona Franca", CENA07.inicio],
  ["08 O Mercado e a Ponta Negra", CENA08.inicio],
  ["09 O Encontro das Águas", CENA09.inicio],
  ["10 A virada", CENA10.inicio],
  ["11 O Lago Janauari", CENA11.inicio],
  ["12 Anavilhanas", CENA12.inicio],
  ["13 Presidente Figueiredo", CENA13.inicio],
  ["14 Parintins", CENA14.inicio],
  ["15 Maués e o guaraná", CENA15.inicio],
  ["16 Os povos", CENA16.inicio],
  ["17 O Pico da Neblina", CENA17.inicio],
  ["18 O fecho", CENA18.inicio],
] as const;
