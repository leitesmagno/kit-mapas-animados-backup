import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import municipioJson from "./candidosales.json";

// Tudo local, gerado por `npm run dados -- orcamento-candidosales` (IBGE: o município de Cândido Sales e a Bahia).
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

export const BAHIA = desvirar((baJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);
export const MUNICIPIO_GEO = desvirar((municipioJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);

// pontos das capitais (de onde vem o dinheiro) e da sede de Cândido Sales
export const BRASILIA: LonLat = [-47.88, -15.79];
export const SALVADOR: LonLat = [-38.5, -12.97];
// a etiqueta aponta para o centro do contorno do município (sem coordenada oficial da sede à mão)
export const SEDE: LonLat = geoCentroid(MUNICIPIO_GEO) as LonLat;

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  municipio: caixaDe(MUNICIPIO_GEO, 0.06),
  repasses: [[-49.6, -17.6], [-34.8, -11.6]] as Caixa,
};
export const CENTRO = geoCentroid(MUNICIPIO_GEO) as LonLat;

// arco suave entre dois pontos (para as setas do dinheiro), curvado para o norte
export const arco = (a: LonLat, b: LonLat, curva = 0.18, n = 48): [number, number][] => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const meio: LonLat = [(a[0] + b[0]) / 2 - dy * curva, (a[1] + b[1]) / 2 + dx * curva];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * meio[0] + t * t * b[0], u * u * a[1] + 2 * u * t * meio[1] + t * t * b[1]];
  });
};
