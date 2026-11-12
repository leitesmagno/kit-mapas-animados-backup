import type { FeatureCollection, Geometry } from "geojson";
import estadosJson from "../../../mapa/dados/brasil-uf.json";
import type { Caixa, LonLat } from "../../../base/geo/projecao";

// IBGE: estados. Pontos aproximados (ilustração).
export const ESTADOS = estadosJson as unknown as FeatureCollection<Geometry, { sigla: string; nome: string }>;
export const UF = (sigla: string) => ESTADOS.features.find((f) => f.properties.sigla === sigla)!;
export const GUARUJA: LonLat = [-46.2585, -24.0035]; // Praia das Astúrias
export const CURITIBA: LonLat = [-49.2733, -25.4284];
export const BRASILIA: LonLat = [-47.8825, -15.7942];

export const CAIXA = {
  brasil: [[-74, -34], [-34, 5.5]] as Caixa,
  sp: [[-48.5, -25.2], [-44.6, -22.6]] as Caixa,
  guaruja: [[-46.42, -24.1], [-46.1, -23.9]] as Caixa,
  sul: [[-50.6, -26.6], [-45.4, -22.6]] as Caixa,
  curitiba: [[-49.45, -25.6], [-49.1, -25.25]] as Caixa,
  centro: [[-51.5, -26.5], [-44.5, -14.5]] as Caixa,
  brasilia: [[-48.3, -16.1], [-47.5, -15.5]] as Caixa,
};

export const arco = (a: LonLat, b: LonLat, curva = 0.18, n = 64): [number, number][] => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const meio: LonLat = [(a[0] + b[0]) / 2 - dy * curva, (a[1] + b[1]) / 2 + dx * curva];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * meio[0] + t * t * b[0], u * u * a[1] + 2 * u * t * meio[1] + t * t * b[1]];
  });
};
