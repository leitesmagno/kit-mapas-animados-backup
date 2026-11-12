import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import psJson from "./porto-seguro.json";
import pradoJson from "./prado.json";
import itamarajuJson from "./itamaraju.json";
import itabelaJson from "./itabela.json";

// IBGE: Bahia e os 4 municípios onde fica a TI Barra Velha do Monte Pascoal (MPF, Nota Técnica 01/2026).
export const ESTADOS = estadosJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
const desvirar = <F extends Feature<Geometry>>(f: F): F => {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const inverte = (aneis: Position[][]) => aneis.map((a) => [...a].reverse());
  if (g.type === "Polygon") return { ...f, geometry: { ...g, coordinates: inverte(g.coordinates) } };
  if (g.type === "MultiPolygon") return { ...f, geometry: { ...g, coordinates: g.coordinates.map(inverte) } };
  return f;
};
const um = (j: unknown) => desvirar((j as FeatureCollection<Polygon | MultiPolygon>).features[0]);
export const BAHIA = um(baJson);
export const PORTO_SEGURO = um(psJson);
export const PRADO = um(pradoJson);
export const ITAMARAJU = um(itamarajuJson);
export const ITABELA = um(itabelaJson);
export const QUATRO = [PORTO_SEGURO, PRADO, ITAMARAJU, ITABELA];
export const NOMES = ["PORTO SEGURO", "PRADO", "ITAMARAJU", "ITABELA"];
export const CENTROS = QUATRO.map((f) => geoCentroid(f) as LonLat);

// pontos aproximados (ilustração): aldeia Barra Velha (litoral sul de Porto Seguro), Monte Pascoal,
// fazenda da Sombras da Mata (zona rural de Itamaraju) e aldeia Kai (Cumuruxatiba, Prado)
export const BARRA_VELHA: LonLat = [-39.15, -16.87];
export const MONTE_PASCOAL: LonLat = [-39.42, -16.89];
export const TRANCOSO: LonLat = [-39.1, -16.59];
export const ITAMARAJU_PT: LonLat = geoCentroid(ITAMARAJU) as LonLat;
export const KAI: LonLat = [-39.18, -17.1];

const caixaDe = (fs: Feature<Geometry>[], folga = 0): Caixa => {
  let [o, s, l, n] = [180, 90, -180, -90];
  for (const f of fs) {
    const [[a, b], [c, d]] = geoBounds(f);
    o = Math.min(o, a); s = Math.min(s, b); l = Math.max(l, c); n = Math.max(n, d);
  }
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  bahia: caixaDe([BAHIA], 0.3),
  sul: [[-40.6, -17.6], [-38.8, -16.2]] as Caixa,
  aldeia: [[-39.6, -17.05], [-38.95, -16.7]] as Caixa,
  quatro: caixaDe(QUATRO, 0.08),
  operacoes: [[-39.9, -17.35], [-38.95, -16.75]] as Caixa,
};
