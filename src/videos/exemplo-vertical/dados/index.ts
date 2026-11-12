import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import amJson from "./am.json";
import areasJson from "./areas.json";
import br319Json from "./br319.json";
import lugaresJson from "./lugares.json";
import brasilJson from "./brasil.json";
import cidadesJson from "./cidades.json";
import municipiosJson from "./municipios.json";
import riosJson from "./rios.json";

// Tudo local, gerado por `npm run dados -- exemplo-vertical` (scripts/dados-exemplo-vertical.py): IBGE (o Amazonas, os 62 municípios, a
// população de 2026) e Natural Earth (os países, os rios). Cada afirmação está no DATA_SOURCES.md.
export type PropsEstado = { sigla: string; nome: string; regiao?: string };
export const ESTADOS = estadosJson as unknown as FeatureCollection<Geometry, PropsEstado>;
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;

// Um polígono no sentido "errado" o d3 lê como "o planeta menos ele": desvira quem tiver área
// maior que meio planeta (o mesmo cuidado da "Paraíba").
const desvirar = <F extends Feature<Geometry>>(f: F): F => {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const inverte = (aneis: Position[][]) => aneis.map((a) => [...a].reverse());
  if (g.type === "Polygon") return { ...f, geometry: { ...g, coordinates: inverte(g.coordinates) } };
  if (g.type === "MultiPolygon") return { ...f, geometry: { ...g, coordinates: g.coordinates.map(inverte) } };
  return f;
};

type Props = { nome: string; codigo: string };

// o contorno de fora do Brasil e o Amazonas — IBGE, malha intermediária
export const BRASIL = desvirar((brasilJson as unknown as FeatureCollection<MultiPolygon>).features[0]);
export const AMAZONAS = desvirar((amJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);
// um estado pela sigla e um país pelo código
export const uf = (sigla: string) => desvirar(ESTADOS.features.find((e) => e.properties.sigla === sigla)!);
export const pais = (iso: string) => desvirar(PAISES.features.find((p) => p.properties.iso === iso)!);

// os 62 municípios
export const MUNICIPIOS = (municipiosJson as unknown as FeatureCollection<Polygon | MultiPolygon, Props>).features.map(desvirar);
export const municipio = (nome: string) => MUNICIPIOS.find((f) => f.properties.nome === nome)!;
export const caixaDoMunicipio = (nome: string, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(municipio(nome));
  return [[o - folga, s - folga], [l + folga, n + folga]];
};

// a sede e a população (estimativa IBGE 2026) de cada município, da maior para a menor
// (`meio`: o ponto de dentro do município mais longe da divisa)
export type Cidade = { cod: string; nome: string; pop: number; em: LonLat; meio: LonLat; extras: LonLat[] };
export const CIDADES = cidadesJson as unknown as Cidade[];
// a população do estado (a soma dos 62) e a de Manaus — os painéis da cena 3
export const POPULACAO = CIDADES.reduce((n, c) => n + c.pop, 0);
export const POP_MANAUS = CIDADES.find((c) => c.nome === "Manaus")!.pop;

// ---- A CAIXA DE UMA BANDEIRA dentro de uma forma (estado ou país) ----
// A bandeira fica PRESA AO MAPA (lon/lat) e CENTRADA na forma: o meio da bandeira cai no centro dela e a
// caixa, na proporção da bandeira (em Mercator, como a tela), cobre a forma inteira (o mesmo do "Pará").
const RAD_ = Math.PI / 180;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD_) / 2)) / RAD_;
const desmerc = (y: number) => (2 * Math.atan(Math.exp(y * RAD_)) - Math.PI / 2) / RAD_;
export const caixaDaBandeira = (f: Feature<Geometry>, proporcao: number, centro: LonLat = geoCentroid(f) as LonLat): [LonLat, LonLat] => {
  const [[o, s], [l, n]] = geoBounds(f);
  const cx = centro[0];
  const cy = merc(centro[1]);
  let meiaL = Math.max(cx - o, l - cx);
  let meiaA = Math.max(cy - merc(s), merc(n) - cy);
  if (meiaL / meiaA < proporcao) meiaL = meiaA * proporcao;
  else meiaA = meiaL / proporcao;
  return [[cx - meiaL, desmerc(cy - meiaA)], [cx + meiaL, desmerc(cy + meiaA)]];
};

// os rios (Natural Earth), da nascente para a foz: o Amazonas inteiro (do Peru até perto da foz; o gancho)
// e os afluentes
const RIOS = riosJson as unknown as Record<"amazonas" | "negro" | "madeira" | "purus" | "jurua" | "japura", LonLat[]>;
export const RIO_AMAZONAS = RIOS.amazonas;
export const RIO_NEGRO = RIOS.negro;
export const RIO_MADEIRA = RIOS.madeira;
export const RIO_PURUS = RIOS.purus;
export const RIO_JURUA = RIOS.jurua;
export const RIO_JAPURA = RIOS.japura;

// a BR-319, de Manaus a Porto Velho (OSM), e o "trecho do meio" sem asfalto (do km ~250 ao ~655, contados
// de Manaus ao longo da linha)
export const BR319 = br319Json as unknown as LonLat[];
const km = (a: LonLat, b: LonLat) => Math.hypot((b[0] - a[0]) * 111.32 * Math.cos((a[1] * Math.PI) / 180), (b[1] - a[1]) * 110.57);
const trecho = (de: number, ate: number): LonLat[] => {
  let acc = 0;
  const saida: LonLat[] = [];
  BR319.forEach((p, i) => {
    if (i) acc += km(BR319[i - 1], p);
    if (acc >= de && acc <= ate) saida.push(p);
  });
  return saida;
};
export const BR319_TERRA = trecho(250, 655);
export const MEIO_DA_TERRA = BR319_TERRA[Math.floor(BR319_TERRA.length / 2)];

// as áreas do OSM: o Parque Nacional de Anavilhanas e a Terra Indígena Vale do Javari
type Area = Feature<Polygon | MultiPolygon, { chave: string; km2: number }>;
const AREAS = (areasJson as unknown as FeatureCollection<Polygon | MultiPolygon, { chave: string; km2: number }>).features.map(desvirar);
const area = (chave: string): Area => AREAS.find((f) => f.properties.chave === chave)!;
export const ANAVILHANAS = area("anavilhanas");
export const JAVARI = area("javari");

// os CONTORNOS dos lugares (OSM): o prédio do Teatro e o do Mercado, a areia da Ponta Negra e o Parque
// Nacional do Pico da Neblina — o "marcar o lugar certinho" (pente fino do usuário)
const LUGARES = (lugaresJson as unknown as FeatureCollection<Polygon | MultiPolygon, { chave: string; km2: number }>).features.map(desvirar);
const lugar = (chave: string): Area => LUGARES.find((f) => f.properties.chave === chave)!;
export const TEATRO = lugar("teatro");
export const MERCADO = lugar("mercado");
export const AREIA_PONTA_NEGRA = lugar("pontaNegra");
export const PARQUE_NEBLINA = lugar("picoDaNeblina");
const caixaDoLugar = (f: Feature<Geometry>, folga: number): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};

// a proporção (largura/altura) de cada bandeira usada, medida nos arquivos
export const PROPORCAO_DA_BANDEIRA: Record<string, number> = { am: 1.3989, rr: 1.4286, pa: 1.4988, mt: 1.4286, ro: 1.4286, ac: 1.4286, ve: 1.4988, co: 1.4988, peru: 1.4988 };

// as sedes (dados/cidades.json: o ponto do OSM dentro de cada município)
const sede = (nome: string) => CIDADES.find((c) => c.nome === nome)!.em;

// a linha do MEIO de cada rio no Encontro das Águas (traçada no satélite CBERS, cena 9): o nome corre por
// ela (kit NomeNoRio). O Negro, do porto de Manaus até o encontro; o Solimões, do sudoeste, fazendo a curva
// e subindo até o encontro
export const MEIO_DO_NEGRO: LonLat[] = [[-60.0037, -3.176], [-59.9814, -3.1726], [-59.9608, -3.1649], [-59.935, -3.1503], [-59.9127, -3.1329], [-59.899, -3.1238]];
export const MEIO_DO_SOLIMOES: LonLat[] = [[-59.9779, -3.2325], [-59.9333, -3.2154], [-59.899, -3.2017], [-59.8921, -3.1777], [-59.8938, -3.1538], [-59.8981, -3.1401]];

export const LUGAR = {
  // o nome do rio no gancho, sobre o trecho de Manaus para cima
  nomeRio: [-62.6, -3.55],
  // o "proibido" do gancho, em cima do rio entre Manaus e Parintins
  semPonte: [-55.4, -2.15],
  // o nome da Região Norte (cena 2), em cima do Pará
  nomeNorte: [-52.8, -4.6],
  // as siglas dos cinco vizinhos (cena 2)
  siglaRR: [-61.4, 2.0],
  siglaPA: [-52.6, -4.2],
  siglaMT: [-55.8, -12.2],
  siglaRO: [-62.9, -10.9],
  siglaAC: [-70.4, -9.2],
  // os nomes dos três países (cena 2)
  // no meio da parte da Venezuela que aparece na tela (mais a oeste, ficava colado na Colômbia)
  nomeVE: [-64.6, 7.2],
  nomeCO: [-72.9, 3.6],
  // na faixa vermelha do LESTE (Madre de Dios), dentro da tela: a do meio é branca (o nome branco sumia
  // nela) e a do oeste fica fora do quadro
  nomePE: [-71.6, -11.8],
  // as cidades
  manaus: sede("Manaus"),
  novoAirao: sede("Novo Airão"),
  presidenteFigueiredo: sede("Presidente Figueiredo"),
  parintins: sede("Parintins"),
  maues: sede("Maués"),
  // de onde vêm o avião e o barco (cena 4)
  brasilia: [-47.8825, -15.7942],
  belem: [-48.4902, -1.4558],
  portoVelho: [-63.8735, -8.7495],
  // a história (cena 6): Kew, em Londres, e Colombo, no Ceilão (hoje Sri Lanka), para onde foram as primeiras
  // mudas (OSM)
  londres: [-0.2969, 51.4782],
  asia: [79.8612, 6.9271],
  // os lugares (OSM, Nominatim)
  teatro: [-60.0234, -3.1303],
  distritoIndustrial: [-59.955, -3.115],
  mercado: [-60.0236, -3.1399],
  // NA AREIA da praia (o ponto de dentro do polígono do OSM): o ponto antigo caía no meio do rio
  pontaNegra: [-60.1019, -3.0648],
  // na LINHA onde as duas águas correm lado a lado (medida no satélite: preta de um lado, barrenta do
  // outro); o ponto antigo caía dentro do Negro
  encontro: [-59.8809, -3.112],
  // na ÁGUA do Lago do Janauari (o meio da água aberta do lago, medido no satélite): o ponto do OSM (a atração
  // "Lago Vitória Régia") é uma lagoinha que não aparece no satélite e caía na mata
  janauari: [-59.9744, -3.2048],
  anavilhanas: [-60.75, -2.62],
  santuario: [-59.9291, -2.0613],
  maroaga: [-59.9706, -2.0511],
  bumbodromo: [-56.7374, -2.6335],
  javari: [-71.24, -5.77],
  picoDaNeblina: [-66.0075, 0.8],
} satisfies Record<string, LonLat>;

export const CAIXA = {
  // o Brasil inteiro (o começo e o fim do vídeo)
  brasil: [[-74, -34], [-34.5, 5.5]],
  // o Amazonas inteiro
  am: [[-73.8, -9.82], [-56.1, 2.25]],
  // o Rio Amazonas inteiro, do Peru à foz, com o estado (o gancho)
  rio: [[-74.2, -10.2], [-50.8, 2.6]],
  // a Região Norte inteira (cena 2, "Fica no Norte")
  norte: [[-74.0, -13.7], [-46.0, 5.3]],
  // o Amazonas com os vizinhos e os três países (cena 2)
  vizinhos: [[-79.5, -15.2], [-46.0, 11.5]],
  // Manaus: o município inteiro (cena 3)
  manaus: caixaDoMunicipio("Manaus", 0.03),
  // como se chega (cena 4): de Brasília e de Belém até Manaus
  acesso: [[-66.0, -16.6], [-46.5, 0.8]],
  // a BR-319 inteira, de Manaus a Porto Velho (cena 4)
  br319: [[-64.4, -9.0], [-59.5, -2.9]],
  // o centro de Manaus (cenas 5, 7 e 8): o Teatro, o Mercado, o Distrito Industrial e a Ponta Negra
  centro: [[-60.09, -3.17], [-59.95, -3.07]],
  cidade: [[-60.13, -3.17], [-59.92, -3.03]],
  // o Encontro das Águas de perto (cena 9)
  encontro: [[-59.99, -3.2], [-59.83, -3.06]],
  // o Rio Amazonas de Manaus para o leste (cena 9, "…viram o Rio Amazonas")
  amazonasLeste: [[-61.0, -4.4], [-51.0, -0.6]],
  // os lugares (cenas 11 a 17)
  janauari: [[-59.996, -3.225], [-59.953, -3.187]],
  // os lugares de Manaus BEM de perto (o CBERS-4A de 2 m): o Teatro e o Mercado (o prédio), a areia da Ponta
  // Negra e o Distrito Industrial
  teatro: caixaDoLugar(TEATRO, 0.0024),
  mercado: caixaDoLugar(MERCADO, 0.0024),
  pontaNegra: caixaDoLugar(AREIA_PONTA_NEGRA, 0.003),
  distrito: [[-59.985, -3.14], [-59.925, -3.09]],
  anavilhanas: [[-61.15, -2.95], [-60.35, -2.2]],
  presidenteFigueiredo: [[-60.06, -2.12], [-59.86, -1.99]],
  parintins: [[-56.85, -2.72], [-56.62, -2.56]],
  maues: [[-57.8, -3.47], [-57.62, -3.32]],
  javari: [[-74.2, -8.0], [-69.4, -3.6]],
  picoDaNeblina: [[-66.35, 0.55], [-65.7, 1.05]],
} satisfies Record<string, Caixa>;
