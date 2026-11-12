import { geoArea, geoBounds } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import ilheusJson from "./ilheus.json";
import distritosJson from "./distritos.json";

// Tudo local, gerado por `npm run dados -- onibus-ilheus`:
//  - o contorno do município de Ilhéus (IBGE 2913606);
//  - as sedes dos distritos (nomes da lista oficial do IBGE; posições do OpenStreetMap, ODbL).
const desvirar = <F extends Feature<Geometry>>(f: F): F => {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const inverte = (aneis: Position[][]) => aneis.map((a) => [...a].reverse());
  if (g.type === "Polygon") return { ...f, geometry: { ...g, coordinates: inverte(g.coordinates) } };
  if (g.type === "MultiPolygon") return { ...f, geometry: { ...g, coordinates: g.coordinates.map(inverte) } };
  return f;
};
export const ILHEUS = desvirar((ilheusJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);
export const DISTRITOS = distritosJson as { nome: string; lon: number; lat: number }[];

// a sede (a cidade): centro e um raio aproximado da mancha urbana, em graus
export const SEDE_ILHEUS: LonLat = [-39.05, -14.79];
export const RAIO_CIDADE = 0.05;

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  bahiaSul: [[-41.6, -16.6], [-37.2, -12.6]] as Caixa,
  ilheus: caixaDe(ILHEUS, 0.04),
  cidade: [[-39.17, -14.92], [-38.97, -14.67]] as Caixa,
};

// pontinhos de "seu bairro" espalhados pela cidade (fixos, sem sorteio a cada quadro)
export const BAIRROS: LonLat[] = Array.from({ length: 14 }, (_, i) => {
  const a = i * 2.39996;
  const r = 0.035 * 0.95 * Math.sqrt((i + 0.6) / 14);
  return [SEDE_ILHEUS[0] - 0.012 + r * Math.cos(a) * 0.8, SEDE_ILHEUS[1] + r * Math.sin(a) * 1.25];
});
