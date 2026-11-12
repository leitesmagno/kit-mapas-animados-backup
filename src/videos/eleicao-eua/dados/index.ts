import { geoArea, geoBounds, geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import estadosBrJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import baJson from "./ba.json";
import distritosJson from "./distritos-eua.json";
import estadosJson from "./estados-eua.json";

// Tudo local, gerado por `npm run dados -- eleicao-eua`: estados e os 435 distritos do Censo dos EUA
// (119º Congresso, 1:20 milhões, domínio público); Brasil e Bahia do IBGE (copiados do distrital-bahia).
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
export const ESTADOS_BR = estadosBrJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;

const desvirar = <F extends Feature<Geometry>>(f: F): F => {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const inverte = (aneis: Position[][]) => aneis.map((a) => [...a].reverse());
  if (g.type === "Polygon") return { ...f, geometry: { ...g, coordinates: inverte(g.coordinates) } };
  if (g.type === "MultiPolygon") return { ...f, geometry: { ...g, coordinates: g.coordinates.map(inverte) } };
  return f;
};

export type PropsEstado = { uf: string; nome: string; fips: string; senado: boolean; governador: boolean };
export const ESTADOS_EUA = (estadosJson as unknown as FeatureCollection<MultiPolygon, PropsEstado>).features.map(desvirar);
export type PropsDistrito = { id: string; fips: string; cd: string };
export const DISTRITOS = (distritosJson as unknown as FeatureCollection<Polygon | MultiPolygon, PropsDistrito>).features.map(desvirar);
// o distrito do mergulho: o 3º de Iowa (Des Moines), um distrito comum no meio do país, sem nome na tela
export const DISTRITO_EXEMPLO = DISTRITOS.find((d) => d.properties.id === "1903")!;
export const BAHIA = desvirar((baJson as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]);

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};
export const CAIXA = {
  eua: [[-124.8, 24.4], [-66.9, 49.4]] as Caixa,
  distrito: caixaDe(DISTRITO_EXEMPLO, 0.6),
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  bahia: caixaDe(BAHIA, 0.2),
};
export const CENTRO_DISTRITO = geoCentroid(DISTRITO_EXEMPLO) as LonLat;
export const CENTRO_BAHIA = geoCentroid(BAHIA) as LonLat;
