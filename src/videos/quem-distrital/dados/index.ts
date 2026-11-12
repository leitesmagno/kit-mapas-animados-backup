import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import cidadesJson from "./cidades.json";
import distritosJson from "./distritos.json";

// Tudo local, gerado por `npm run dados -- distrital-bahia` (IBGE: a Bahia, os 417 municípios e a população de 2026).
// Os DISTRITOS são ILUSTRATIVOS: municípios vizinhos agrupados com população parecida (o desenho real não existe).
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
export type PropsDistrito = { id: number; pop: number; maior: string; municipios: number; temIlheus: boolean };
export const DISTRITOS = (distritosJson as unknown as FeatureCollection<Polygon | MultiPolygon, PropsDistrito>).features.map(desvirar);
export const DISTRITO_ILHEUS = DISTRITOS.find((d) => d.properties.temIlheus)!;
export type Cidade = { cod: string; nome: string; pop: number; meio: LonLat };
export const CIDADES = cidadesJson as unknown as Cidade[];
export const cidade = (nome: string) => CIDADES.find((c) => c.nome === nome)!;

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  bahia: caixaDe(BAHIA, 0.2),
  ilheus: caixaDe(DISTRITO_ILHEUS, 0.25),
};
export const CENTRO_BAHIA = geoCentroid(BAHIA) as LonLat;
export const CENTRO_ILHEUS = geoCentroid(DISTRITO_ILHEUS) as LonLat;
