import type { FeatureCollection, Geometry } from "geojson";
import estadosBrJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";

export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
export const ESTADOS = estadosBrJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;

// Congresso Nacional, Praça dos Três Poderes (Brasília)
export const CONGRESSO: LonLat = [-47.8644, -15.7997];
export const CAIXA = {
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  df: [[-48.3, -16.05], [-47.3, -15.5]] as Caixa,
  esplanada: [[-47.884, -15.812], [-47.852, -15.79]] as Caixa,
};
