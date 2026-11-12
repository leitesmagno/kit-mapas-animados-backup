import { geoBounds, geoCentroid, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { HEIGHT, WIDTH } from "../../tema";
import malha from "../dados/brasil-uf.json";
import vizinhosJson from "../dados/vizinhos.json";

// ---------------------------------------------------------------------------
// O mapa temático em SVG. Tudo vem de arquivo local (malha oficial do IBGE, gerada por
// scripts/mapa-dados.py): o render nunca busca nada na internet.
//
// A projeção é calculada UMA vez, enquadrando o Brasil inteiro no vídeo. Os caminhos SVG
// de cada estado também: o que se move depois é a câmera (um transform no grupo), não a
// projeção — assim o desenho não é recalculado a cada quadro.
// ---------------------------------------------------------------------------

export type DadosUF = { sigla: string; nome: string; regiao: string; codigo: number };
export type FeicaoUF = Feature<Geometry, DadosUF>;

const colecao = malha as unknown as FeatureCollection<Geometry, DadosUF>;

// O retângulo onde o Brasil inteiro cabe, dentro da área segura do vídeo.
const MOLDURA: [[number, number], [number, number]] = [
  [60, 420],
  [WIDTH - 60, HEIGHT - 460],
];

export const PROJECAO = geoMercator().fitExtent(MOLDURA, colecao);
const caminho = geoPath(PROJECAO);

export const ESTADOS: FeicaoUF[] = colecao.features;
export const VIZINHOS = vizinhosJson as Record<string, string[]>;

const porSigla = new Map(ESTADOS.map((f) => [f.properties.sigla, f]));

export const estado = (sigla: string): FeicaoUF => {
  const f = porSigla.get(sigla);
  if (!f) throw new Error(`não existe a UF "${sigla}" na malha`);
  return f;
};

// Caminho SVG de cada estado, pronto e memorizado.
export const CAMINHOS: Record<string, string> = Object.fromEntries(ESTADOS.map((f) => [f.properties.sigla, caminho(f) ?? ""]));

export const projetar = (lon: number, lat: number): [number, number] => {
  const p = PROJECAO([lon, lat]);
  if (!p) throw new Error(`ponto fora da projeção: ${lon}, ${lat}`);
  return p;
};

// O centro visual de um estado, em coordenadas da tela.
export const centroDoEstado = (sigla: string): [number, number] => {
  const [lon, lat] = geoCentroid(estado(sigla));
  return projetar(lon, lat);
};

// Quanto a câmera precisa ampliar para um estado (ou um conjunto deles) ocupar a tela.
export const zoomPara = (siglas: string[], folga = 1.25): { centro: [number, number]; zoom: number } => {
  const cantos = siglas.map((s) => geoBounds(estado(s)));
  const oeste = Math.min(...cantos.map((c) => c[0][0]));
  const sul = Math.min(...cantos.map((c) => c[0][1]));
  const leste = Math.max(...cantos.map((c) => c[1][0]));
  const norte = Math.max(...cantos.map((c) => c[1][1]));
  const [x1, y1] = projetar(oeste, norte);
  const [x2, y2] = projetar(leste, sul);
  const larguraDoAlvo = Math.abs(x2 - x1) * folga;
  const alturaDoAlvo = Math.abs(y2 - y1) * folga;
  // A área útil é a faixa central: o alto e o pé da tela ficam para os textos.
  const zoom = Math.min(WIDTH / larguraDoAlvo, (HEIGHT * 0.52) / alturaDoAlvo);
  return { centro: [(x1 + x2) / 2, (y1 + y2) / 2], zoom };
};

export const NOME: Record<string, string> = Object.fromEntries(ESTADOS.map((f) => [f.properties.sigla, f.properties.nome]));
