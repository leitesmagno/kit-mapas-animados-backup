import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import ilheusJson from "./ilheus.json";

// Copiado de orcamento-ilheus (IBGE: o município de Ilhéus e a Bahia), para o vídeo 029 do Estúdio 3D.
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
export const ILHEUS = desvirar((ilheusJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);

// pontos das capitais (de onde vem o dinheiro) e da sede de Ilhéus
export const BRASILIA: LonLat = [-47.88, -15.79];
export const SALVADOR: LonLat = [-38.5, -12.97];
export const SEDE_ILHEUS: LonLat = [-39.05, -14.79];

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
// ponto simbólico do fundo (sem cidade): no meio da Bahia
export const FUNDO: LonLat = [-41.6, -13.1];
export const CAIXA = {
  bahiaSul: [[-45.6, -16.6], [-37.4, -11.2]] as Caixa,
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  ilheus: caixaDe(ILHEUS, 0.06),
  repasses: [[-49.6, -17.6], [-35.2, -11.2]] as Caixa,
};
export const CENTRO_ILHEUS = geoCentroid(ILHEUS) as LonLat;

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
