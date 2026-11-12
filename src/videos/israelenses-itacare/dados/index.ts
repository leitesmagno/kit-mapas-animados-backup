import { geoArea, geoBounds } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import itacareJson from "./itacare.json";
import cairuJson from "./cairu.json";

// IBGE: Bahia, Itacaré e Cairu (Morro de São Paulo). Sem contorno de país no Oriente Médio
// (fronteira disputada): Israel aparece só como um ponto com nome.
export const ESTADOS = estadosJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
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
export const ITACARE = um(itacareJson);
export const CAIRU = um(cairuJson);

// pontos aproximados (ilustração)
export const ISRAEL: LonLat = [34.85, 31.9];
export const MORRO: LonLat = [-38.9131, -13.3782];
export const SEDE_ITACARE: LonLat = [-38.997, -14.2775];
export const PITUBA: LonLat = [-38.9927, -14.2804];
export const PRACA: LonLat = [-38.9905, -14.279];

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  israel: [[28, 25], [42, 38]] as Caixa,
  mundo: [[-60, -30], [50, 45]] as Caixa,
  bahia: caixaDe(BAHIA, 0.3),
  sul: [[-39.6, -14.9], [-38.4, -12.9]] as Caixa,
  morro: [[-39.15, -13.6], [-38.75, -13.2]] as Caixa,
  itacare: [[-39.2, -14.45], [-38.85, -14.1]] as Caixa,
  centro: [[-39.012, -14.294], [-38.978, -14.266]] as Caixa,
};

// arco suave entre dois pontos, curvado para o norte
export const arco = (a: LonLat, b: LonLat, curva = 0.18, n = 64): [number, number][] => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const meio: LonLat = [(a[0] + b[0]) / 2 - dy * curva, (a[1] + b[1]) / 2 + dx * curva];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * meio[0] + t * t * b[0], u * u * a[1] + 2 * u * t * meio[1] + t * t * b[1]];
  });
};
