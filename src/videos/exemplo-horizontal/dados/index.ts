import type { Feature, FeatureCollection, Geometry, LineString } from "geojson";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import paisesJson from "./paises.json";
import rotasJson from "./rotas.json";

// Tudo local, gerado por `npm run dados -- exemplo-horizontal` (scripts/dados-exemplo-horizontal.py): Natural Earth 1:10m (países,
// domínio público; a 1:10m é a que tem a península de Musandam) e as rotas ESQUEMÁTICAS pelo mar
// (o sentido do fluxo, não o trajeto exato dos navios). Cada número está no DATA_SOURCES.md.
export type PropsPais = { iso: string; nome: string };
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, PropsPais>;

export const pais = (iso: string): Feature<Geometry, PropsPais> => {
  const f = PAISES.features.find((p) => p.properties.iso === iso);
  if (!f) throw new Error(`país ${iso} não está em dados/paises.json — rode (os dados já vêm prontos)`);
  return f;
};

type PropsRota = { id: string; esquematica: boolean };
const ROTAS = rotasJson as unknown as FeatureCollection<LineString, PropsRota>;
export const rota = (id: string) => ROTAS.features.find((f) => f.properties.id === id)!.geometry.coordinates as [number, number][];

// os enquadramentos (oeste-sul, leste-norte)
export const CAIXA = {
  // do Brasil ao Japão (o fecho: "e também aqui no Brasil")
  mundo: [[-78, -36], [146, 50]] as Caixa,
  // do Oriente Médio ao Japão: o mundo que depende do estreito
  asia: [[36, -6], [146, 44]] as Caixa,
  // o Golfo inteiro, com todos os países em volta
  golfoAmplo: [[43.5, 21.0], [62.5, 33.0]] as Caixa,
  // o Golfo com mais do norte (os primeiros poços: Masjed Soleyman sai de baixo do ano no canto)
  golfoNorte: [[41.0, 21.5], [62.5, 36.5]] as Caixa,
  // o Golfo Pérsico e o Golfo de Omã, com o sul do Irã e o norte de Omã
  golfo: [[47.5, 22.3], [61.0, 31.0]] as Caixa,
  // o estreito com os dois golfos dos lados (os nomes dos mares cabem)
  estreito: [[53.6, 24.6], [59.0, 27.9]] as Caixa,
  // o estreito de perto (a largura)
  estreitoPerto: [[55.7, 25.8], [57.3, 27.1]] as Caixa,
  // as ilhas: Abu Musa e as Tunb a oeste, Queixome, Larak e Ormuz no estreito
  ilhas: [[54.6, 25.55], [57.0, 27.35]] as Caixa,
  // o Catar centrado (a fala do gás), com Ras Laffan e o Golfo em volta
  catar: [[49.6, 23.9], [53.6, 27.2]] as Caixa,
  // a ilha de Ormuz e Bandar Abbas, de perto
  ilhaOrmuz: [[55.55, 26.6], [57.05, 27.55]] as Caixa,
  // o comércio medieval: de Ormuz à Índia, à Pérsia e à Arábia
  comercio: [[49.0, 18.5], [76.0, 31.5]] as Caixa,
  // o Irã inteiro com o Golfo embaixo (a bandeira não corta no topo; a data cabe no canto)
  ira: [[42.0, 23.0], [64.5, 40.2]] as Caixa,
  // o Irã e o Iraque (a guerra dos anos 80)
  iraIraque: [[38.5, 24.0], [63.5, 39.8]] as Caixa,
  // a península Arábica com os dois oleodutos
  arabia: [[35.5, 19.5], [60.0, 30.5]] as Caixa,
  // Kharg e o estreito (o Irã também depende do Golfo)
  kharg: [[48.5, 25.6], [58.0, 31.0]] as Caixa,
};

// pontos dos rótulos (no mar, no país)
export const PONTO = {
  estreito: [56.45, 26.42] as LonLat,
  ira: [55.0, 29.4] as LonLat,
  oma: [57.2, 23.6] as LonLat,
  musandam: [56.25, 26.05] as LonLat,
  arabiaSaudita: [45.5, 24.5] as LonLat,
  kuwait: [47.6, 29.35] as LonLat,
  iraque: [44.0, 32.6] as LonLat,
  catar: [51.2, 25.3] as LonLat,
  bahrein: [50.55, 26.05] as LonLat,
  emirados: [54.2, 23.6] as LonLat,
  golfoPersico: [54.5, 26.35] as LonLat,
  golfoPersicoAmplo: [51.4, 27.4] as LonLat,
  golfoDeOma: [58.2, 24.9] as LonLat,
  marVermelho: [38.6, 21.0] as LonLat,
  marArabico: [63.5, 17.5] as LonLat,
  // as ilhas
  ilhaOrmuz: [56.46, 27.07] as LonLat,
  queixome: [55.9, 26.8] as LonLat,
  larak: [56.36, 26.86] as LonLat,
  abuMusa: [55.03, 25.88] as LonLat,
  tunbMaior: [55.3, 26.26] as LonLat,
  tunbMenor: [55.15, 26.24] as LonLat,
  // a história
  bandarAbbas: [56.27, 27.19] as LonLat,
  shiraz: [52.53, 29.59] as LonLat,
  guzerate: [72.6, 22.3] as LonLat,
  mascate: [58.4, 23.6] as LonLat,
  // o petróleo
  masjedSoleyman: [49.3, 31.93] as LonLat,
  dammam: [50.1, 26.43] as LonLat,
  kharg: [50.32, 29.24] as LonLat,
  rasLaffan: [51.53, 25.91] as LonLat,
  abqaiq: [49.68, 25.93] as LonLat,
  yanbu: [38.06, 24.09] as LonLat,
  habshan: [53.67, 23.83] as LonLat,
  fujairah: [56.33, 25.12] as LonLat,
  teera: [51.39, 35.69] as LonLat,
  // a Ásia e o mundo
  china: [101.0, 34.5] as LonLat,
  india: [78.5, 21.5] as LonLat,
  japao: [138.2, 36.3] as LonLat,
  coreia: [127.9, 36.3] as LonLat,
  // o nome da Coreia vai no mar, a sudoeste dela, terminando ali (ancorado à direita): na latitude do
  // Japão os dois nomes se encostavam e o nome batia na borda direita
  coreiaRotulo: [125.2, 33.4] as LonLat,
  toquio: [139.69, 35.69] as LonLat,
  mumbai: [72.88, 19.08] as LonLat,
  brasil: [-51.5, -10.5] as LonLat,
};
