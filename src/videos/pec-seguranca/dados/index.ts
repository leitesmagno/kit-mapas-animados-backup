import { geoCentroid } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import estadosBrJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import municipiosJson from "./municipios.json";

// Tudo local. Estados: IBGE (já no kit). Municípios: IBGE, API de malhas, qualidade mínima
// (`npm run dados -- pec-seguranca`). Capitais: lista oficial do IBGE (sedes, coordenadas aproximadas).
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
export const ESTADOS = estadosBrJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
export const MUNICIPIOS = municipiosJson as unknown as FeatureCollection<Geometry, { id: string }>;

export const CENTRO_ESTADO: Record<string, LonLat> = Object.fromEntries(ESTADOS.features.map((f) => [f.properties.sigla, geoCentroid(f) as LonLat]));
export const CENTRO_MUN = MUNICIPIOS.features.map((f) => geoCentroid(f) as LonLat);
export const RJ = ESTADOS.features.find((f) => f.properties.sigla === "RJ")!;

export const CAPITAIS: LonLat[] = [
  [-67.81, -9.97], [-35.73, -9.67], [-51.07, 0.03], [-60.02, -3.12], [-38.5, -12.97], [-38.54, -3.72], [-47.88, -15.79],
  [-40.31, -20.32], [-49.25, -16.68], [-44.3, -2.53], [-56.1, -15.6], [-54.62, -20.47], [-43.94, -19.92], [-48.5, -1.46],
  [-34.86, -7.12], [-49.27, -25.43], [-34.88, -8.05], [-42.8, -5.09], [-43.2, -22.91], [-35.21, -5.79], [-51.23, -30.03],
  [-63.9, -8.76], [-60.67, 2.82], [-48.55, -27.6], [-46.63, -23.55], [-37.07, -10.91], [-48.33, -10.18],
];
export const BRASILIA: LonLat = [-47.88, -15.79];
// ilustração (sem rota real): uma linha que corta estados do Norte ao Sudeste sem parar nas divisas
export const LINHA_CRIME: LonLat[] = [[-63, -4], [-58.5, -9], [-55.5, -13], [-51, -16.5], [-47.5, -19.5], [-46.4, -22.6]];
export const CENTRO_RJ: LonLat = [-42.7, -22.3];

export const CAIXA = {
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  sudeste: [[-50.5, -25.5], [-39, -17.5]] as Caixa,
};
