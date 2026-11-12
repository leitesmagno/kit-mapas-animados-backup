import { geoCentroid } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import estadosBrJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import municipiosJson from "./municipios.json";

// Tudo local. Estados: IBGE (já no kit). Municípios: IBGE, API de malhas, qualidade mínima (cópia do pec-seguranca).
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
export const ESTADOS = estadosBrJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
export const MUNICIPIOS = municipiosJson as unknown as FeatureCollection<Geometry, { id: string }>;

export const CENTRO_ESTADO: Record<string, LonLat> = Object.fromEntries(ESTADOS.features.map((f) => [f.properties.sigla, geoCentroid(f) as LonLat]));
export const CENTRO_MUN = MUNICIPIOS.features.map((f) => geoCentroid(f) as LonLat);
export const UF = (sg: string) => ESTADOS.features.find((f) => f.properties.sigla === sg)!;

// guerra fiscal: ILUSTRAÇÃO genérica (sem dado real): a fábrica pula de um estado para o vizinho
export const GUERRA_DE = "MG";
export const GUERRA_PARA = "GO";
// a virada: o exemplo do roteiro (fábrica em SP, compra na BA)
export const ORIGEM = "SP";
export const DESTINO = "BA";

export const CAIXA = {
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
  centro: [[-54, -24.5], [-40.5, -12]] as Caixa,
  spba: [[-53.5, -25.5], [-37, -8.5]] as Caixa,
};
