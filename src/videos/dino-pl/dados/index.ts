import type { FeatureCollection, Geometry } from "geojson";
import estadosBrJson from "../../../mapa/dados/brasil-uf.json";
import paisesJson from "../../../base/dados/paises.json";
import estadosEuaJson from "../../eleicao-eua/dados/estados-eua.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";

// Tudo local: países e estados do Brasil (IBGE) já vêm no kit.
export const PAISES = paisesJson as unknown as FeatureCollection<Geometry, { iso: string; nome: string }>;
export const ESTADOS = estadosBrJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
export const ESTADOS_EUA = (estadosEuaJson as unknown as FeatureCollection<Geometry, { uf: string }>).features;

// pontos de referência (ilustração do caminho investigado; não é rota real de dinheiro)
export const WASHINGTON: LonLat = [-77.04, 38.9];
export const BRASILIA: LonLat = [-47.88, -15.79];

export const CAIXA = {
  eua: [[-124.8, 24.4], [-66.9, 49.4]] as Caixa,
  americas: [[-118, -34], [-34.8, 47]] as Caixa,
  brasil: [[-74, -34], [-34.8, 5.3]] as Caixa,
};
