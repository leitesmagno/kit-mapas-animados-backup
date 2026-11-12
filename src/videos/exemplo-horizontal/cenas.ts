import type { Afirmacao, Capitulo, Fonte, Publicacao } from "../../motor/documentario";
import type { CenaVisual, Momento } from "../../kit/documentario";
import { CAIXA, PONTO, rota } from "./dados";

// ---------------------------------------------------------------------------
// O ROTEIRO VISUAL do "Estreito de Ormuz": cada fala do falas.json vira uma cena DECLARADA (motor em
// src/kit/documentario). A câmera para onde a explicação está; o resto são batidas presas às
// palavras entre [colchetes] da fala: e(4, "ira") = o instante em que a voz diz "Irã" na fala 4.
//
// A lógica editorial (skill mapas-animados, references/horizontal-longo.md):
//   - mapa sempre que a fala diz ONDE (países com a bandeira dentro, nomes digitados, rotas);
//   - imagem de apoio (IA, ilustrativa) quando a fala sai do "onde" para o "como era/como é";
//     enquanto ela cobre a tela, a câmera voa por baixo até a vista da fala seguinte;
//   - painel/proporção para número; texto de impacto só nas viradas.
// ---------------------------------------------------------------------------

export const e = (fala: number, palavra: string, segundos = 0): Momento => [`${String(fala).padStart(2, "0")}.${palavra}`, segundos];
const fala = (n: number, segundos = 0): Momento => [`@orm-${String(n).padStart(2, "0")}`, segundos];
const band = (nome: string) => `assets/bandeiras/${nome}.png`;

// as cores da IDENTIDADE HORIZONTAL (a dos vídeos São Luís / Piauí / Ceará): UM destaque quente
// (o dourado: as regiões, as rotas, os números), o azul-claro só na água e um vermelho contido para
// ataque, disputa e fechamento
export const COR = {
  ira: "#F2B45A",
  golfo: "#F2B45A",
  destino: "#F2B45A",
  petroleo: "#F2B45A",
  estreito: "#6FD3FF", // a água do estreito
  alerta: "#E8664F",
  historia: "#E3C08F",
};

// a rota do petróleo dentro do Golfo, de Kharg ao estreito (ESQUEMÁTICA, pelo meio do mar)
const ROTA_GOLFO: [number, number][] = [[50.3, 29.1], [51.4, 27.9], [53.0, 27.0], [54.8, 26.55], [56.45, 26.45], [57.6, 25.6]];

export const CAPITULOS: Capitulo[] = [
  { id: "gancho", titulo: "O corredor que parou o petróleo" },
  { id: "geografia", titulo: "Um mar quase fechado" },
  { id: "historia", titulo: "Cinco séculos de disputa" },
  { id: "petroleo", titulo: "O século do petróleo" },
  { id: "dependencia", titulo: "Quem depende de Ormuz" },
  { id: "ameaca", titulo: "A ameaça de sempre" },
  { id: "crise", titulo: "2026: o estreito fechado" },
  { id: "conclusao", titulo: "O poder de uma passagem" },
];

export const FONTES: Fonte[] = [
  { id: "eia-2025", titulo: "Amid regional conflict, the Strait of Hormuz remains critical oil chokepoint", editor: "U.S. Energy Information Administration (EIA)", url: "https://www.eia.gov/todayinenergy/detail.php?id=65504", publicadoEm: "2025-06-16", consultadoEm: "2026-10-14" },
  { id: "brookings-2026", titulo: "From chokepoint to crisis: The Strait of Hormuz and global oil markets", editor: "Brookings Institution (Samantha Gross e Ryan Beane)", url: "https://www.brookings.edu/articles/from-chokepoint-to-crisis-the-strait-of-hormuz-and-global-oil-markets/", publicadoEm: "2026-06-08", consultadoEm: "2026-10-16" },
  { id: "iea-2026-03", titulo: "IEA: liberação coordenada recorde de 400 milhões de barris (março de 2026)", editor: "Agência Internacional de Energia (via PGJ, Al-Monitor)", url: "https://pgjonline.com/news/2026/march/iea-approves-record-400-million-barrel-emergency-oil-release", publicadoEm: "2026-03", consultadoEm: "2026-10-16" },
  { id: "iea-2026-10", titulo: "IEA Moves to Accelerate Oil Reserve Releases as Hormuz Crisis Drags On (fluxo de setembro: 10,9 milhões b/d)", editor: "gCaptain, com dados da IEA", url: "https://gcaptain.com/iea-moves-to-accelerate-oil-reserve-releases-as-hormuz-crisis-drags-on/", publicadoEm: "2026-10-16", consultadoEm: "2026-10-16" },
  { id: "wiki-crise-2026", titulo: "2026 Strait of Hormuz crisis (linha do tempo; cada item cita Reuters, Guardian etc.)", editor: "Wikipedia (fonte secundária)", url: "https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis", consultadoEm: "2026-10-16" },
  { id: "wiki-parlamento-2025", titulo: "Iran parliament approves closure of Strait of Hormuz (22/06/2025)", editor: "Gulf News", url: "https://gulfnews.com/world/mena/iran-parliament-approves-closure-of-strait-of-hormuz-amid-regional-tensions-1.500172722", publicadoEm: "2025-06-22", consultadoEm: "2026-10-16" },
  { id: "sciam-hormuz", titulo: "How deep is the Strait of Hormuz? (cita a EIA: 21 milhas no ponto mais estreito, faixas de 2 milhas)", editor: "Scientific American", url: "https://www.scientificamerican.com/blog/plugged-in/how-deep-is-the-strait-of-hormuz", consultadoEm: "2026-10-14" },
  { id: "usip-hormuz", titulo: "Part 1: Key Facts on Strait of Hormuz (The Iran Primer)", editor: "United States Institute of Peace", url: "https://iranprimer.usip.org/node/302", consultadoEm: "2026-10-14" },
  { id: "ilhas-1971", titulo: "Abu Musa, Greater Tunb and Lesser Tunb: three disputed islands between Iran and UAE", editor: "Middle East Institute / RAUIAS", url: "https://www.mei.edu/publications/uae-official-calls-international-action-end-iranian-occupation-disputed-islands", consultadoEm: "2026-10-16" },
  { id: "wiki-ormuz", titulo: "Kingdom of Ormus / Capture of Ormuz (1622) / Bandar Abbas", editor: "Wikipedia (fonte secundária)", url: "https://en.wikipedia.org/wiki/Kingdom_of_Ormus", consultadoEm: "2026-10-16" },
  { id: "wiki-1988", titulo: "Operation Praying Mantis; Iran Air Flight 655", editor: "Wikipedia (fonte secundária)", url: "https://en.wikipedia.org/wiki/Iran_Air_Flight_655", consultadoEm: "2026-10-16" },
  { id: "kharg-2026", titulo: "Kharg Island: Iran's vital oil hub (JP Morgan: ~90% das exportações; Kpler: ~94%)", editor: "Al-Monitor / Kpler", url: "https://www.al-monitor.com/originals/2026/03/kharg-island-irans-vital-oil-hub-crosshairs", publicadoEm: "2026-03", consultadoEm: "2026-10-16" },
  { id: "natural-earth", titulo: "Admin 0 – Countries, 1:10m (fronteiras do mapa)", editor: "Natural Earth (domínio público)", url: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/", consultadoEm: "2026-10-14" },
];

export const PUBLICACAO: Publicacao = {
  titulos: [
    "Estreito de Ormuz: o corredor de água que parou o petróleo do mundo",
    "Por que 1 em cada 5 barris de petróleo passava por este estreito",
    "33 km que mexem no preço do combustível: a geopolítica do Estreito de Ormuz",
  ],
  resumo:
    "Entre o Irã e a península de Musandam, em Omã, fica a única saída do Golfo Pérsico para o oceano. Antes da guerra de 2026, cerca de 20 milhões de barris de petróleo passavam por ali todos os dias. Neste vídeo, o mapa conta a história do Estreito de Ormuz: a geografia, os portugueses, a guerra dos petroleiros, quem depende dele e a crise que começou em fevereiro de 2026 (pesquisa até meados de outubro de 2026).",
  tags: ["Estreito de Ormuz", "geopolítica", "petróleo", "Golfo Pérsico", "Irã", "Arábia Saudita", "Omã", "crise do petróleo 2026", "mapa"],
  textoDaCapa: ["O CORREDOR", "DO PETRÓLEO"],
};

const fato = (texto: string, fontes: string[], nota?: string): Afirmacao => ({ texto, tipo: "fato", fontes, nota });
const interpretacao = (texto: string, fontes: string[] = [], nota?: string): Afirmacao => ({ texto, tipo: "interpretacao", fontes, nota });

export const CENAS: CenaVisual[] = [
  // ===================================================== 1. O GANCHO
  {
    id: "orm-01",
    capitulo: "gancho",
    falas: ["orm-01"],
    camera: [
      { em: e(1, "corredor", -0.2), vista: { caixa: CAIXA.asia, area: "livre", margem: 10 } },
      { em: e(1, "petroleo", 0.4), vista: { caixa: CAIXA.estreito, area: "livre" }, voo: 1.6, rho: 1.6 },
    ],
    batidas: [
      // o gancho já no 1º segundo: a data, e o estreito marcado em "corredor"
      { tipo: "data", texto: "FEVEREIRO DE 2026", rotulo: "O ESTREITO DE ORMUZ", cor: COR.alerta, entra: fala(1, 0.1) },
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 40, cor: COR.estreito, entra: e(1, "corredor", -0.1), sai: e(2, "guerra") },
      { tipo: "impacto", linhas: ["A MAIOR INTERRUPÇÃO", "DO PETRÓLEO"], corpo: 92, y: 230, entra: e(1, "petroleo", 0.5), sai: e(1, "agencia", 1.6) },
    ],
    afirmacoes: [fato("A IEA chamou a crise de a maior interrupção de oferta da história do mercado de petróleo", ["brookings-2026"], "Brookings cita a estimativa da IEA (queda de mais de 14 milhões b/d)")],
  },
  {
    id: "orm-02",
    capitulo: "gancho",
    falas: ["orm-02"],
    camera: [{ em: e(2, "guerra", 0.2), vista: { caixa: CAIXA.asia, area: "assunto", margem: 10 }, voo: 1.2 }],
    batidas: [
      { tipo: "painel", numero: "20 milhões", rotulo: "DE BARRIS POR DIA (2024)", icone: "petroleiro", cor: COR.petroleo, corpo: 92, y: 300, entra: e(2, "barris", -0.6) },
      { tipo: "proporcao", total: 5, destaque: 1, icone: "barril_de_petroleo", tamanho: 118, y: 540, cor: COR.petroleo, entra: e(2, "planeta", -1.4), acende: e(2, "planeta") },
    ],
    afirmacoes: [fato("Cerca de 20 milhões de barris por dia em 2024, ~20% do consumo mundial de líquidos de petróleo", ["eia-2025"])],
  },
  {
    id: "orm-03",
    capitulo: "gancho",
    falas: ["orm-03"],
    camera: [
      { em: e(3, "estreito", 0.5), vista: { caixa: CAIXA.estreito, area: "livre" }, voo: 1.3, rho: 1.5 },
      { em: e(3, "mapa", 0.8), vista: { caixa: CAIXA.golfoAmplo, area: "livre" }, voo: 1.4 },
    ],
    batidas: [
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 30, cor: COR.estreito, entra: e(3, "estreito", -0.4), sai: e(3, "estreito", 0.1) },
      // o TÍTULO do documentário, quando a voz diz o nome
      { tipo: "titulo", titulo: "Estreito de Ormuz", abaixo: "O corredor que move o petróleo do mundo", entra: e(3, "estreito", 0.2), sai: e(3, "mapa", -0.1) },
    ],
  },

  // ===================================================== 2. A GEOGRAFIA
  {
    id: "orm-04",
    capitulo: "geografia",
    falas: ["orm-04"],
    batidas: [
      { tipo: "mar", linhas: ["GOLFO", "PÉRSICO"], ponto: PONTO.golfoPersicoAmplo, corpo: 40, entra: e(4, "fechado", -0.4) },
      { tipo: "pais", iso: "IRN", cor: COR.ira, bandeira: band("ira"), entra: e(4, "ira", -0.1), sai: e(6, "estreito") },
      { tipo: "nome", texto: "IRÃ", ponto: PONTO.ira, corpo: 56, cor: COR.ira, entra: e(4, "ira") },
      { tipo: "pais", iso: "SAU", cor: COR.golfo, bandeira: band("arabia-saudita"), entra: e(4, "arabia", -0.1) },
      { tipo: "nome", texto: "ARÁBIA SAUDITA", ponto: PONTO.arabiaSaudita, corpo: 40, cor: COR.golfo, entra: e(4, "arabia") },
      { tipo: "pais", iso: "KWT", cor: COR.golfo, bandeira: band("kuwait"), entra: e(4, "kuwait", -0.1) },
      { tipo: "nome", texto: "KUWAIT", ponto: PONTO.kuwait, ancora: "base", seta: true, dy: -8, corpo: 28, cor: COR.golfo, entra: e(4, "kuwait") },
      { tipo: "pais", iso: "IRQ", cor: COR.golfo, bandeira: band("iraque"), entra: e(4, "iraque", -0.1) },
      { tipo: "nome", texto: "IRAQUE", ponto: PONTO.iraque, corpo: 40, cor: COR.golfo, entra: e(4, "iraque") },
      { tipo: "pais", iso: "QAT", cor: COR.golfo, bandeira: band("catar"), entra: e(4, "catar", -0.1) },
      { tipo: "nome", texto: "CATAR", ponto: PONTO.catar, ancora: "direita", dx: -16, corpo: 28, cor: COR.golfo, entra: e(4, "catar") },
      { tipo: "pais", iso: "BHR", cor: COR.golfo, bandeira: band("bahrein"), entra: e(4, "bahrein", -0.1) },
      { tipo: "nome", texto: "BAHREIN", ponto: PONTO.bahrein, ancora: "direita", dx: -14, corpo: 26, cor: COR.golfo, entra: e(4, "bahrein") },
      { tipo: "pais", iso: "ARE", cor: COR.golfo, bandeira: band("emirados"), entra: e(4, "emirados", -0.1) },
      { tipo: "nome", texto: "EMIRADOS", ponto: PONTO.emirados, corpo: 32, cor: COR.golfo, entra: e(4, "emirados") },
    ],
    afirmacoes: [fato("Países em volta do Golfo Pérsico", ["natural-earth"])],
  },
  {
    id: "orm-05",
    capitulo: "geografia",
    falas: ["orm-05"],
    camera: [{ em: e(5, "saida", 0.3), vista: { caixa: CAIXA.golfo, area: "livre" }, voo: 1.2 }],
    batidas: [
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 30, cor: COR.estreito, entra: e(5, "saida") },
      { tipo: "pais", iso: "OMN", cor: COR.golfo, bandeira: band("oma"), entra: e(5, "musandam", -0.1), sai: e(7, "ilhas") },
      { tipo: "nome", texto: "MUSANDAM", ponto: PONTO.musandam, ancora: "base", seta: true, dy: -12, corpo: 32, cor: COR.golfo, entra: e(5, "musandam") },
      { tipo: "nome", texto: "OMÃ", ponto: PONTO.oma, corpo: 56, cor: COR.golfo, entra: e(5, "oma", -0.05) },
    ],
    afirmacoes: [fato("O estreito fica entre o Irã e a península de Musandam, um enclave de Omã", ["natural-earth"])],
  },
  {
    id: "orm-06",
    capitulo: "geografia",
    falas: ["orm-06"],
    camera: [{ em: e(6, "estreito", 0.5), vista: { caixa: CAIXA.estreitoPerto, area: "assunto", margem: 20 }, voo: 1.0, rho: 1.1 }],
    batidas: [
      { tipo: "painel", numero: "33", unidade: "km", rotulo: "NO PONTO MAIS ESTREITO", cor: COR.estreito, entra: e(6, "estreito", 0.7), sai: e(6, "faixas", -0.3) },
      { tipo: "painel", numero: "3", unidade: "km", rotulo: "CADA FAIXA DE NAVEGAÇÃO", icone: "petroleiro", cor: COR.estreito, entra: e(6, "faixas", 0.4) },
    ],
    afirmacoes: [
      fato("Cerca de 33 km no ponto mais estreito", ["sciam-hormuz", "usip-hormuz"], "21 milhas (EIA, citada); há fontes com ~32 km e com 21 milhas náuticas (~39 km): por isso 'cerca de'"),
      fato("Faixas de navegação de ~3 km em cada sentido", ["sciam-hormuz", "usip-hormuz"], "2 milhas = 3,2 km. As faixas não são desenhadas: sem dado da posição exata"),
    ],
  },
  {
    id: "orm-07",
    capitulo: "geografia",
    falas: ["orm-07"],
    camera: [{ em: e(7, "ilhas", 0.4), vista: { caixa: CAIXA.ilhas, area: "livre" }, voo: 1.1 }],
    batidas: [
      { tipo: "nome", texto: "ORMUZ", ponto: PONTO.ilhaOrmuz, ancora: "base", seta: true, dy: -8, corpo: 30, cor: COR.ira, entra: e(7, "ormuz") },
      { tipo: "nome", texto: "QUEIXOME", ponto: PONTO.queixome, ancora: "base", seta: true, corpo: 30, cor: COR.ira, entra: e(7, "queixome") },
      { tipo: "nome", texto: "LARAK", ponto: PONTO.larak, ancora: "esquerda", dx: 16, corpo: 28, cor: COR.ira, entra: e(7, "larak") },
      { tipo: "circulo", ponto: PONTO.abuMusa, raioKm: 7, cor: COR.alerta, entra: e(7, "abu", -0.1) },
      { tipo: "nome", texto: "ABU MUSA", ponto: PONTO.abuMusa, ancora: "base", seta: true, dy: -18, corpo: 30, cor: COR.alerta, entra: e(7, "abu") },
      { tipo: "circulo", ponto: [55.22, 26.25], raioKm: 12, cor: COR.alerta, entra: e(7, "tunb", -0.1) },
      { tipo: "nome", texto: "TUNB", ponto: [55.22, 26.25], ancora: "base", seta: true, dy: -24, corpo: 30, cor: COR.alerta, entra: e(7, "tunb") },
      { tipo: "pais", iso: "ARE", cor: COR.golfo, bandeira: band("emirados"), entra: e(7, "emirados", -0.1) },
      { tipo: "nome", texto: "EMIRADOS", ponto: [55.4, 24.9], corpo: 36, cor: COR.golfo, entra: e(7, "emirados") },
    ],
    afirmacoes: [
      fato("Ormuz, Queixome (Qeshm) e Larak são iranianas", ["natural-earth"]),
      fato("Abu Musa e as Tunb estão sob controle do Irã desde 1971 e são reivindicadas pelos Emirados", ["ilhas-1971"], "o Irã tomou as ilhas em 30/11–01/12/1971; as fontes de cada lado não são neutras: o vídeo só diz quem controla e quem reivindica"),
    ],
  },

  // ===================================================== 3. A HISTÓRIA
  {
    id: "orm-08",
    capitulo: "historia",
    falas: ["orm-08"],
    camera: [{ em: e(8, "india", -0.7), vista: { caixa: CAIXA.comercio, area: "livre" }, voo: 1.0 }],
    batidas: [
      { tipo: "imagem", id: "ormuz-medieval", foco: "50% 55%", entra: e(8, "antiga", -0.3), sai: e(8, "india", -0.3) },
      { tipo: "data", texto: "IDADE MÉDIA", rotulo: "O REINO DE ORMUZ", cor: COR.historia, entra: e(8, "india", -0.2) },
      { tipo: "rota", linha: rota("comercio-india"), chega: e(8, "persia", 0.2), cor: COR.historia, entra: e(8, "india") },
      { tipo: "nome", texto: "ÍNDIA", ponto: [73.6, 23.6], corpo: 40, cor: COR.historia, entra: e(8, "india", 0.5) },
      { tipo: "rota", linha: rota("comercio-persia"), chega: e(8, "persia", 1.0), cor: COR.historia, entra: e(8, "persia"), partida: false },
      { tipo: "nome", texto: "PÉRSIA", ponto: PONTO.shiraz, ancora: "base", dy: -12, corpo: 40, cor: COR.historia, entra: e(8, "persia", 0.3) },
      { tipo: "rota", linha: rota("comercio-arabia"), chega: e(8, "arabia", 0.8), cor: COR.historia, entra: e(8, "arabia"), partida: false },
      { tipo: "nome", texto: "ARÁBIA", ponto: [57.0, 21.6], corpo: 40, cor: COR.historia, entra: e(8, "arabia", 0.2) },
    ],
    afirmacoes: [fato("Na Idade Média, Ormuz era o centro de um reino comercial entre a Índia, a Pérsia e a Arábia", ["wiki-ormuz"], "fonte secundária; as rotas desenhadas são esquemáticas")],
  },
  {
    id: "orm-09",
    capitulo: "historia",
    falas: ["orm-09"],
    camera: [{ em: e(9, "portugueses", 0.2), vista: { caixa: CAIXA.ilhaOrmuz, area: "assunto" }, voo: 1.4, rho: 1.5 }],
    batidas: [
      { tipo: "icone", icone: "nau", ponto: [56.62, 26.98], haste: true, tamanho: 130, entra: e(9, "portugueses", 0.3) },
      { tipo: "data", texto: "1507", rotulo: "O ATAQUE DE ALBUQUERQUE", cor: COR.historia, entra: e(9, "afonso", 0.9), sai: e(9, "fortaleza", -2.7) },
      { tipo: "data", texto: "1515", rotulo: "PORTUGAL TOMA A ILHA", cor: COR.historia, entra: e(9, "fortaleza", -1.6) },
      { tipo: "imagem", id: "fortaleza-portuguesa", foco: "45% 50%", sentido: -1, entra: e(9, "fortaleza", -0.1), sai: e(10, "portugues", 0.4) },
    ],
    afirmacoes: [fato("Albuquerque atacou Ormuz em 1507; Portugal tomou a ilha em 1515 e ergueu uma fortaleza", ["wiki-ormuz"], "fontes secundárias; elas separam o ataque de 1507 da conquista de 1515")],
  },
  {
    id: "orm-10",
    capitulo: "historia",
    falas: ["orm-10"],
    batidas: [
      { tipo: "icone", icone: "fortaleza", ponto: PONTO.ilhaOrmuz, haste: true, tamanho: 130, entra: e(10, "portugues", 0.5), sai: e(10, "ingleses", 1.2) },
      { tipo: "data", texto: "1622", rotulo: "A PÉRSIA RETOMA ORMUZ", cor: COR.historia, entra: e(10, "abbas", -2.4) },
      { tipo: "icone", icone: "nau", ponto: [56.0, 26.95], haste: true, tamanho: 120, espelhar: true, entra: e(10, "ingleses") },
    ],
    afirmacoes: [fato("Em 1622, o xá Abbas I, com navios ingleses, expulsou os portugueses de Ormuz", ["wiki-ormuz"], "1515–1622: mais de cem anos de domínio português")],
  },
  {
    id: "orm-11",
    capitulo: "historia",
    falas: ["orm-11"],
    batidas: [
      { tipo: "circulo", ponto: PONTO.bandarAbbas, raioKm: 6, cor: COR.ira, entra: e(11, "bandar", -0.1) },
      { tipo: "nome", texto: "BANDAR ABBAS", ponto: PONTO.bandarAbbas, ancora: "base", seta: true, dy: -18, corpo: 40, cor: COR.ira, entra: e(11, "bandar") },
    ],
    afirmacoes: [fato("Bandar Abbas leva o nome do xá Abbas ('porto de Abbas')", ["wiki-ormuz"], "as fontes divergem sobre o ano exato da troca de nome (1614–1622)")],
  },

  // ===================================================== 4. O SÉCULO DO PETRÓLEO
  {
    id: "orm-12",
    capitulo: "petroleo",
    falas: ["orm-12"],
    camera: [{ em: e(12, "ira", -0.5), vista: { caixa: CAIXA.golfoNorte, area: "assunto" }, voo: 1.0 }],
    batidas: [
      { tipo: "imagem", id: "poco-de-petroleo-1908", foco: "50% 60%", entra: e(12, "debaixo", -0.3), sai: e(12, "ira", -0.3) },
      { tipo: "icone", icone: "cavalo_de_petroleo", ponto: PONTO.masjedSoleyman, haste: true, tamanho: 120, entra: e(12, "ira", -0.1) },
      { tipo: "data", texto: "1908", rotulo: "PETRÓLEO NO IRÃ", cor: COR.petroleo, entra: e(12, "ira", 0.4), sai: e(12, "saudita", -0.4) },
      { tipo: "icone", icone: "cavalo_de_petroleo", ponto: PONTO.dammam, haste: true, tamanho: 120, entra: e(12, "saudita", -0.1) },
      { tipo: "data", texto: "1938", rotulo: "PETRÓLEO NA ARÁBIA SAUDITA", cor: COR.petroleo, entra: e(12, "saudita", 0.6) },
    ],
    afirmacoes: [fato("Petróleo descoberto no Irã em 1908 (Masjed Soleyman) e na Arábia Saudita em 1938 (Dammam)", ["wiki-ormuz"], "datas amplamente documentadas; conferir em fonte primária antes de publicar")],
  },
  {
    id: "orm-13",
    capitulo: "petroleo",
    falas: ["orm-13"],
    camera: [{ em: e(13, "caminho", -0.4), vista: { caixa: CAIXA.golfo, area: "livre" }, voo: 1.2 }],
    batidas: [
      { tipo: "icone", icone: "barril_de_petroleo", x: 470, y: 420, tamanho: 190, entra: e(13, "reservas", -0.1), sai: e(13, "caminho", -0.3) },
      { tipo: "rota", linha: ROTA_GOLFO, chega: e(13, "caminho", 1.4), cor: COR.petroleo, largura: 6, entra: e(13, "caminho", -0.2) },
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 30, cor: COR.estreito, entra: e(13, "caminho", 0.8) },
    ],
    afirmacoes: [fato("O Oriente Médio tem as maiores reservas provadas de petróleo do mundo", ["eia-2025"], "conferir o número no Energy Institute Statistical Review antes de citar valor; a rota é esquemática")],
  },
  {
    id: "orm-14",
    capitulo: "petroleo",
    falas: ["orm-14"],
    camera: [{ em: e(14, "ira", -0.4), vista: { caixa: CAIXA.iraIraque, area: "livre" }, voo: 1.2 }],
    batidas: [
      { tipo: "data", texto: "1980–1988", rotulo: "A GUERRA IRÃ–IRAQUE", cor: COR.alerta, entra: fala(14, 0.6) },
      { tipo: "pais", iso: "IRN", cor: COR.ira, bandeira: band("ira"), entra: e(14, "ira", -0.1) },
      { tipo: "nome", texto: "IRÃ", ponto: [54.0, 32.5], corpo: 56, cor: COR.ira, entra: e(14, "ira") },
      { tipo: "pais", iso: "IRQ", cor: COR.golfo, bandeira: band("iraque"), entra: e(14, "iraque", -0.1) },
      { tipo: "nome", texto: "IRAQUE", ponto: PONTO.iraque, corpo: 48, cor: COR.golfo, entra: e(14, "iraque") },
      { tipo: "imagem", id: "guerra-dos-petroleiros", foco: "50% 50%", entra: e(14, "petroleiros", -0.4), sai: e(15, "louva-a-deus", -0.6) },
    ],
    afirmacoes: [fato("Na guerra Irã–Iraque, os dois lados atacaram navios no Golfo (a 'guerra dos petroleiros', 1984–1988)", ["wiki-1988"])],
  },
  {
    id: "orm-15",
    capitulo: "petroleo",
    falas: ["orm-15"],
    camera: [{ em: e(15, "louva-a-deus", -0.7), vista: { caixa: CAIXA.estreito, area: "assunto" }, voo: 0.8 }],
    batidas: [
      { tipo: "data", texto: "1988", cor: COR.alerta, entra: e(15, "louva-a-deus", -0.4) },
      { tipo: "icone", icone: "navio_de_guerra", ponto: [55.4, 26.0], haste: true, tamanho: 130, entra: e(15, "louva-a-deus") },
      { tipo: "icone", icone: "aviao_de_passageiros", ponto: [56.0, 26.68], haste: true, tamanho: 130, entra: e(15, "iran", -0.1) },
      { tipo: "painel", numero: "290", rotulo: "PESSOAS MORRERAM", cor: COR.alerta, y: 560, entra: e(15, "morreram", -0.9) },
    ],
    afirmacoes: [
      fato("Abril de 1988: Operação Louva-a-Deus (Praying Mantis), navios iranianos afundados", ["wiki-1988"]),
      fato("3 de julho de 1988: o USS Vincennes derrubou o voo 655 da Iran Air; 290 mortos; a tripulação disse tê-lo confundido com um caça F-14", ["wiki-1988"], "a versão americana; o Irã contesta"),
    ],
  },

  // ===================================================== 5. QUEM DEPENDE
  {
    id: "orm-16",
    capitulo: "dependencia",
    falas: ["orm-16"],
    camera: [{ em: fala(16, 0.4), vista: { caixa: CAIXA.golfoAmplo, area: "assunto" }, voo: 1.0 }],
    batidas: [
      { tipo: "pais", iso: "SAU", cor: COR.golfo, bandeira: band("arabia-saudita"), entra: e(16, "exportava", -0.1), foco: true },
      { tipo: "painel", numero: "38", unidade: "%", rotulo: "DO PETRÓLEO BRUTO (2024)", icone: "barril_de_petroleo", cor: COR.petroleo, entra: e(16, "exportava", 1.4) },
    ],
    afirmacoes: [fato("A Arábia Saudita respondia por 38% do petróleo bruto e condensado que cruzava o estreito em 2024 (5,5 milhões b/d)", ["eia-2025"])],
  },
  {
    id: "orm-17",
    capitulo: "dependencia",
    falas: ["orm-17"],
    // o país de que a fala trata vai para o centro da área do mapa
    camera: [{ em: e(17, "catar", 0.2), vista: { caixa: CAIXA.catar, area: "assunto" }, voo: 1.0 }],
    batidas: [
      { tipo: "pais", iso: "QAT", cor: COR.golfo, bandeira: band("catar"), entra: e(17, "catar", -0.1), foco: true },
      { tipo: "icone", icone: "navio_de_gas", ponto: PONTO.rasLaffan, haste: true, tamanho: 130, entra: e(17, "catar", 0.2) },
      { tipo: "imagem", id: "navio-de-gas", foco: "50% 55%", entra: e(17, "catar", 1.3), sai: e(17, "gas", -0.7) },
      { tipo: "proporcao", total: 5, destaque: 1, icone: "navio_de_gas", tamanho: 120, cor: COR.estreito, entra: e(17, "gas", -0.5), acende: e(17, "gas", 0.3) },
    ],
    afirmacoes: [
      fato("Todo o GNL do Catar sai pelo estreito (Ras Laffan fica dentro do Golfo)", ["natural-earth"]),
      fato("Cerca de um quinto do comércio mundial de GNL passou por Ormuz em 2024, principalmente do Catar", ["eia-2025"]),
    ],
  },
  {
    id: "orm-18",
    capitulo: "dependencia",
    falas: ["orm-18"],
    camera: [{ em: e(18, "asia", 0.2), vista: { caixa: CAIXA.asia, area: "assunto", margem: 10 }, voo: 1.3, rho: 1.5 }],
    batidas: [
      { tipo: "rota", linha: rota("asia"), chega: e(18, "coreia", 0.5), cor: COR.petroleo, entra: e(18, "asia", -0.2) },
      { tipo: "rota", linha: rota("india"), chega: e(18, "india", 0.6), cor: COR.petroleo, largura: 4, partida: false, entra: e(18, "india", -0.3) },
      { tipo: "painel", numero: "84", unidade: "%", rotulo: "VAI PARA A ÁSIA", icone: "petroleiro", cor: COR.destino, entra: e(18, "asia", 0.4), sai: e(18, "coreia", 0.7) },
      { tipo: "pais", iso: "CHN", cor: COR.destino, bandeira: band("china"), entra: e(18, "china", -0.1) },
      { tipo: "nome", texto: "CHINA", ponto: PONTO.china, corpo: 40, cor: COR.destino, entra: e(18, "china") },
      { tipo: "pais", iso: "IND", cor: COR.destino, bandeira: band("india"), entra: e(18, "india", -0.1) },
      { tipo: "nome", texto: "ÍNDIA", ponto: PONTO.india, corpo: 40, cor: COR.destino, entra: e(18, "india") },
      { tipo: "pais", iso: "JPN", cor: COR.destino, bandeira: band("japao"), entra: e(18, "japao", -0.1) },
      { tipo: "nome", texto: "JAPÃO", ponto: PONTO.japao, ancora: "base", seta: true, dy: -10, corpo: 32, cor: COR.destino, entra: e(18, "japao") },
      { tipo: "pais", iso: "KOR", cor: COR.destino, bandeira: band("coreia-do-sul"), entra: e(18, "coreia", -0.1) },
      { tipo: "nome", texto: "COREIA DO SUL", ponto: PONTO.coreia, dy: 40, estilo: "cidade", corpo: 28, cor: COR.destino, entra: e(18, "coreia") },
      { tipo: "painel", numero: "69", unidade: "%", rotulo: "SÓ OS QUATRO (2024)", cor: COR.destino, entra: e(18, "coreia", 0.9) },
    ],
    afirmacoes: [
      fato("84% do petróleo bruto e condensado que passou por Ormuz em 2024 foi para a Ásia", ["eia-2025"]),
      fato("China, Índia, Japão e Coreia do Sul: 69% (a fala diz 'quase setenta por cento')", ["eia-2025"], "a rota desenhada é esquemática"),
    ],
  },
  {
    id: "orm-19",
    capitulo: "dependencia",
    falas: ["orm-19"],
    camera: [{ em: e(19, "oleoduto", -0.5), vista: { caixa: CAIXA.arabia, area: "livre" }, voo: 1.3, rho: 1.4 }],
    batidas: [
      { tipo: "pais", iso: "SAU", cor: COR.golfo, bandeira: band("arabia-saudita"), opacidade: 0.5, entra: e(19, "oleoduto", -0.3) },
      { tipo: "rota", linha: rota("oleoduto-saudita"), chega: e(19, "vermelho", 0.3), cor: COR.petroleo, largura: 7, entra: e(19, "oleoduto") },
      { tipo: "icone", icone: "oleoduto", ponto: [44.5, 24.7], haste: true, tamanho: 120, entra: e(19, "oleoduto", 0.4) },
      { tipo: "mar", linhas: ["MAR", "VERMELHO"], ponto: PONTO.marVermelho, corpo: 36, entra: e(19, "vermelho", -0.1) },
      { tipo: "rota", linha: rota("oleoduto-emirados"), chega: e(19, "fujairah", 0.6), cor: COR.petroleo, largura: 6, entra: e(19, "fujairah", -0.6) },
      { tipo: "nome", texto: "FUJAIRAH", ponto: PONTO.fujairah, ancora: "esquerda", dx: 16, corpo: 30, cor: COR.petroleo, entra: e(19, "fujairah") },
    ],
    afirmacoes: [fato("Oleoduto East-West (Arábia Saudita, até Yanbu, Mar Vermelho) e Habshan–Fujairah (Emirados)", ["eia-2025"], "traçados ESQUEMÁTICOS: só as pontas são as reais")],
  },
  {
    id: "orm-20",
    capitulo: "dependencia",
    falas: ["orm-20"],
    batidas: [
      { tipo: "painel", numero: "2,6 milhões", rotulo: "DE BARRIS POR DIA LIVRES", icone: "oleoduto", cor: COR.petroleo, corpo: 88, y: 300, entra: fala(20, 2.2) },
      { tipo: "painel", numero: "20 milhões", rotulo: "PELO ESTREITO", icone: "petroleiro", cor: COR.estreito, corpo: 88, y: 560, entra: e(20, "vinte", -0.1) },
    ],
    afirmacoes: [fato("~2,6 milhões b/d de capacidade ociosa nos oleodutos saudita e dos Emirados antes da guerra, contra ~20 milhões b/d pelo estreito", ["eia-2025"])],
  },

  // ===================================================== 6. A AMEAÇA
  {
    id: "orm-21",
    capitulo: "ameaca",
    falas: ["orm-21"],
    camera: [{ em: fala(21, 0.3), vista: { caixa: CAIXA.estreito, area: "livre" }, voo: 1.2 }],
    batidas: [
      { tipo: "icone", icone: "cadeado_fechado", ponto: PONTO.estreito, haste: true, tamanho: 130, entra: e(21, "ameacou", 0.1), sai: e(21, "oma", -0.6) },
      { tipo: "data", texto: "2019", cor: COR.alerta, entra: e(21, "oma", -1.6) },
      { tipo: "mar", linhas: ["GOLFO", "DE OMÃ"], ponto: PONTO.golfoDeOma, corpo: 40, entra: e(21, "oma", -0.1) },
      { tipo: "icone", icone: "petroleiro", ponto: [55.9, 26.35], haste: true, tamanho: 130, entra: e(21, "apreendido", -0.2) },
    ],
    afirmacoes: [fato("2019: ataques a navios no Golfo de Omã (maio e junho) e apreensão do petroleiro britânico Stena Impero (julho)", ["wiki-crise-2026"], "fatos de 2019 amplamente noticiados; a fonte listada é secundária")],
  },
  {
    id: "orm-22",
    capitulo: "ameaca",
    falas: ["orm-22"],
    batidas: [
      { tipo: "data", texto: "JUNHO DE 2025", cor: COR.alerta, entra: fala(22, 0.4) },
      { tipo: "icone", icone: "cadeado_fechado", ponto: PONTO.estreito, haste: true, tamanho: 130, entra: e(22, "aprovar", 0.1), sai: e(22, "aberto", -0.4) },
      { tipo: "impacto", linhas: ["CONTINUOU", "ABERTO"], corpo: 100, entra: e(22, "aberto", -0.1) },
    ],
    afirmacoes: [fato("22/06/2025: o parlamento iraniano aprovou o fechamento; a decisão final cabia ao Conselho Supremo de Segurança Nacional; o estreito não foi fechado", ["wiki-parlamento-2025"])],
  },

  // ===================================================== 7. 2026
  {
    id: "orm-23",
    capitulo: "crise",
    falas: ["orm-23"],
    camera: [{ em: fala(23, 0.3), vista: { caixa: CAIXA.ira, area: "livre" }, voo: 1.2 }],
    batidas: [
      { tipo: "data", texto: "28 DE FEVEREIRO DE 2026", cor: COR.alerta, entra: e(23, "fevereiro", -0.3) },
      { tipo: "pais", iso: "IRN", cor: COR.ira, bandeira: band("ira"), entra: e(23, "fevereiro", 1.6), foco: true },
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 30, cor: COR.alerta, entra: e(23, "fechado", -0.3) },
      { tipo: "impacto", linhas: ["FECHADO"], corpo: 130, entra: e(23, "fechado") },
    ],
    afirmacoes: [fato("28/02/2026: ataques dos EUA e de Israel ao Irã; em poucos dias o Irã declarou o estreito fechado", ["wiki-crise-2026", "brookings-2026"], "a data da declaração varia entre 28/02 e 04/03 conforme a fonte: o vídeo diz 'em poucos dias'")],
  },
  {
    id: "orm-24",
    capitulo: "crise",
    falas: ["orm-24"],
    camera: [{ em: fala(24, 0.2), vista: { caixa: CAIXA.estreito, area: "livre" }, voo: 1.0 }],
    batidas: [
      { tipo: "icone", icone: "mina_naval", ponto: [56.6, 26.2], haste: true, tamanho: 120, entra: e(24, "atingidos", -0.1) },
      { tipo: "imagem", id: "navios-parados", foco: "50% 50%", entra: e(24, "retiraram", -0.2), sai: e(25, "brent", -0.8) },
    ],
    afirmacoes: [fato("Navios atacados, coberturas de seguro retiradas, tráfego desabou", ["wiki-crise-2026", "brookings-2026"])],
  },
  {
    id: "orm-25",
    capitulo: "crise",
    falas: ["orm-25"],
    camera: [{ em: e(25, "brent", -0.9), vista: { caixa: CAIXA.asia, area: "assunto", margem: 10 }, voo: 0.6 }],
    batidas: [
      { tipo: "painel", numero: "US$ 100", rotulo: "O BARRIL (8 DE MARÇO)", icone: "barril_de_petroleo", cor: COR.alerta, entra: e(25, "brent", 0.4), sai: e(25, "estoques", -0.4) },
      { tipo: "imagem", id: "estoques-de-emergencia", foco: "50% 50%", entra: e(25, "estoques", -0.3), sai: e(25, "barris", -1.6) },
      { tipo: "painel", numero: "400 milhões", rotulo: "DE BARRIS DOS ESTOQUES", icone: "tanque_de_petroleo", cor: COR.petroleo, corpo: 88, entra: e(25, "barris", -1.4) },
    ],
    afirmacoes: [
      fato("8/3/2026: Brent acima de US$ 100 pela primeira vez em quatro anos", ["wiki-crise-2026"], "a Wikipedia cita Reuters/Guardian/CNBC"),
      fato("IEA: liberação coordenada recorde de 400 milhões de barris", ["iea-2026-03"]),
    ],
  },
  {
    id: "orm-26",
    capitulo: "crise",
    falas: ["orm-26"],
    camera: [{ em: fala(26, 0.3), vista: { caixa: CAIXA.arabia, area: "assunto" }, voo: 1.2 }],
    batidas: [
      { tipo: "rota", linha: rota("oleoduto-saudita"), chega: e(26, "oleoduto", 0.6), cor: COR.petroleo, largura: 8, entra: fala(26, 0.5) },
      { tipo: "painel", numero: "7 milhões", rotulo: "DE BARRIS POR DIA NO OLEODUTO", icone: "oleoduto", cor: COR.petroleo, corpo: 92, entra: e(26, "oleoduto", -0.9) },
      { tipo: "imagem", id: "oleoduto-no-deserto", foco: "55% 60%", sentido: -1, entra: e(26, "compensar", -1.0), sai: e(27, "bloqueio", -0.8) },
    ],
    afirmacoes: [fato("O oleoduto East-West passou a operar a plena capacidade, 7 milhões b/d até Yanbu", ["brookings-2026"])],
  },
  {
    id: "orm-27",
    capitulo: "crise",
    falas: ["orm-27"],
    camera: [{ em: e(27, "bloqueio", -0.9), vista: { caixa: CAIXA.ira, area: "livre" }, voo: 0.6 }],
    batidas: [
      { tipo: "data", texto: "ABRIL DE 2026", cor: COR.alerta, entra: fala(27, 0.3) },
      { tipo: "pais", iso: "IRN", cor: COR.ira, bandeira: band("ira"), entra: e(27, "bloqueio", -0.2), foco: true },
      { tipo: "icone", icone: "navio_de_guerra", ponto: [58.6, 24.9], haste: true, tamanho: 120, entra: e(27, "bloqueio") },
      { tipo: "icone", icone: "cadeado_fechado", ponto: PONTO.estreito, haste: true, tamanho: 120, entra: e(27, "vez", -0.4) },
    ],
    afirmacoes: [fato("13/04/2026: bloqueio naval dos EUA aos portos do Irã; tréguas e acordos (abril, junho) e novos fechamentos", ["wiki-crise-2026", "brookings-2026"])],
  },
  {
    id: "orm-28",
    capitulo: "crise",
    falas: ["orm-28"],
    camera: [{ em: fala(28, 0.3), vista: { caixa: CAIXA.estreito, area: "assunto" }, voo: 1.0 }],
    batidas: [
      { tipo: "painel", numero: "10,9 milhões", rotulo: "DE BARRIS POR DIA EM SETEMBRO", icone: "petroleiro", cor: COR.petroleo, corpo: 84, y: 300, entra: fala(28, 3.2) },
      { tipo: "icone", icone: "mina_naval", ponto: [56.7, 26.3], haste: true, tamanho: 120, entra: e(28, "outubro", 0.2) },
    ],
    afirmacoes: [
      fato("Setembro de 2026: cerca de 10,9 milhões b/d pelo estreito (IEA), com transferências navio a navio no Golfo de Omã", ["iea-2026-10"]),
      fato("Os ataques a navios se intensificaram em outubro", ["iea-2026-10", "wiki-crise-2026"]),
    ],
  },
  {
    id: "orm-29",
    capitulo: "crise",
    falas: ["orm-29"],
    batidas: [
      { tipo: "data", texto: "OUTUBRO DE 2026", cor: COR.alerta, entra: fala(29, 1.2) },
      { tipo: "impacto", linhas: ["A CRISE", "CONTINUA"], corpo: 110, y: 560, entra: e(29, "crise", -0.1) },
    ],
    afirmacoes: [fato("Até meados de outubro de 2026 a crise continua", ["iea-2026-10"], "pesquisa encerrada em 16/10/2026: rever antes de publicar")],
  },

  // ===================================================== 8. A CONCLUSÃO
  {
    id: "orm-30",
    capitulo: "conclusao",
    falas: ["orm-30"],
    camera: [{ em: fala(30, 0.3), vista: { caixa: CAIXA.estreito, area: "livre" }, voo: 1.0 }],
    batidas: [
      { tipo: "imagem", id: "petroleiros-no-estreito", foco: "60% 55%", entra: fala(30, 0.2), sai: e(30, "passagem", 0.9) },
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 30, cor: COR.estreito, entra: e(30, "passagem", 0.8) },
      { tipo: "nome", texto: "ESTREITO DE ORMUZ", ponto: PONTO.estreito, dy: -50, corpo: 48, cor: COR.estreito, entra: e(30, "passagem", 1.0) },
    ],
    afirmacoes: [interpretacao("Quem controla uma passagem estreita tem poder sobre quem depende dela")],
  },
  {
    id: "orm-31",
    capitulo: "conclusao",
    falas: ["orm-31"],
    camera: [{ em: e(31, "kharg", -0.6), vista: { caixa: CAIXA.kharg, area: "livre" }, voo: 1.0 }],
    batidas: [
      { tipo: "nome", texto: "KHARG", ponto: PONTO.kharg, ancora: "base", seta: true, dy: -14, corpo: 40, cor: COR.ira, entra: e(31, "kharg") },
      { tipo: "imagem", id: "terminal-na-ilha", foco: "50% 55%", entra: e(31, "kharg", 0.7), sai: e(31, "vizinhos", -0.8) },
      { tipo: "rota", linha: ROTA_GOLFO, chega: e(31, "vizinhos", 0.8), cor: COR.petroleo, entra: e(31, "vizinhos", -0.6) },
      { tipo: "pais", iso: "IRN", cor: COR.ira, bandeira: band("ira"), entra: e(31, "vizinhos", -0.4), foco: true },
    ],
    afirmacoes: [
      fato("O Irã embarcava ~90% do seu petróleo bruto em Kharg, dentro do Golfo", ["kharg-2026"], "JP Morgan ~90%, Kpler ~94% (fontes de mercado)"),
      interpretacao("O Irã precisa do estreito tanto quanto os vizinhos"),
    ],
  },
  {
    id: "orm-32",
    capitulo: "conclusao",
    falas: ["orm-32"],
    camera: [
      { em: e(32, "toquio", -0.8), vista: { caixa: CAIXA.asia, area: "livre", margem: 10 }, voo: 1.4, rho: 1.5 },
      { em: e(32, "brasil", 0.3), vista: { caixa: CAIXA.mundo, area: "livre", margem: 10 }, voo: 1.6, rho: 1.6 },
    ],
    batidas: [
      { tipo: "circulo", ponto: PONTO.estreito, raioKm: 60, cor: COR.estreito, entra: fala(32, 0.4), sai: e(32, "toquio", -0.3) },
      { tipo: "nome", texto: "TÓQUIO", ponto: PONTO.toquio, ancora: "base", seta: true, dy: -10, corpo: 34, cor: COR.destino, entra: e(32, "toquio") },
      { tipo: "nome", texto: "MUMBAI", ponto: PONTO.mumbai, ancora: "base", seta: true, dy: -10, corpo: 34, cor: COR.destino, entra: e(32, "mumbai") },
      { tipo: "pais", iso: "BRA", cor: COR.petroleo, bandeira: band("br"), entra: e(32, "brasil", -0.1), foco: true },
      { tipo: "nome", texto: "BRASIL", ponto: PONTO.brasil, corpo: 52, cor: COR.petroleo, entra: e(32, "brasil", 0.1) },
    ],
    afirmacoes: [interpretacao("Os 33 km pesam no preço do combustível em Tóquio, Mumbai e no Brasil", ["brookings-2026"], "o petróleo é negociado globalmente: o choque de preço chega a importadores e produtores")],
  },
  {
    id: "orm-33",
    capitulo: "conclusao",
    falas: ["orm-33"],
    batidas: [
      {
        tipo: "cartela",
        entra: fala(33, -0.3),
        siga: e(33, "siga", -0.1),
        sino: e(33, "sino", -0.1),
        like: e(33, "like", -0.1),
        compartilhe: e(33, "compartilhe", -0.1),
        comente: e(33, "comentarios", -0.1),
        pergunta: "Você acha que Ormuz um dia vai voltar a ser o que era?",
        perguntaEm: e(33, "comentarios", 0.6),
      },
    ],
  },
];
