import type { Feature, FeatureCollection, Geometry } from "geojson";
import ufJson from "../mapa/dados/brasil-uf.json";

// As 27 UFs (IBGE, simplificadas — boas para Brasil/região/estado; para zoom de município,
// baixe a malha em alta no script de dados do vídeo). `estado("PI")` devolve o contorno.
export type PropsUF = { sigla: string; nome: string; regiao: string; codigo: number };
export const UFS = ufJson as unknown as FeatureCollection<Geometry, PropsUF>;

export const estado = (sigla: string): Feature<Geometry, PropsUF> => {
  const f = UFS.features.find((e) => e.properties.sigla === sigla.toUpperCase());
  if (!f) throw new Error(`UF ${sigla} não existe na malha`);
  return f;
};

// Uma região (Norte, Nordeste, Centro-Oeste, Sudeste, Sul) como coleção de UFs.
export const regiao = (nome: string): FeatureCollection<Geometry, PropsUF> => ({
  type: "FeatureCollection",
  features: UFS.features.filter((f) => f.properties.regiao === nome),
});
