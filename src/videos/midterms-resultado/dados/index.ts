import { geoBounds, geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import type { Caixa, LonLat } from "../../../base/geo/projecao";
import { ESTADOS_EUA, PAISES } from "../../eleicao-eua/dados";

// Reaproveita os estados dos EUA do vídeo "eleicao-eua" (Censo dos EUA, domínio público).
export { ESTADOS_EUA, PAISES };

export const estadoUF = (uf: string) => ESTADOS_EUA.find((e) => e.properties.uf === uf)!;

const caixaDe = (f: Feature<Geometry>, folga = 0): Caixa => {
  const [[o, s], [l, n]] = geoBounds(f);
  return [[o - folga, s - folga], [l + folga, n + folga]];
};

export const CAIXA_VIRADAS = {
  // os EUA sem a ponta oeste (nenhuma virada lá), com folga a leste para o Maine sair da coluna de botões do Reels
  eua: [[-117.5, 24.4], [-63.5, 49.4]] as Caixa,
  texas: caixaDe(estadoUF("TX"), 0.4),
  kansas: caixaDe(estadoUF("KS"), 1.2),
};

export const centroDe = (uf: string) => geoCentroid(estadoUF(uf)) as LonLat;
