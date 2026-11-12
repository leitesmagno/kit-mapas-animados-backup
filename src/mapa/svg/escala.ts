// Escala de cor para mapa temático: um valor por estado vira força de preenchimento.
//
// A paleta do canal é de uma cor só, então a escala é de intensidade: quanto maior o
// valor, mais laranja. Isso mantém o mapa legível em preto e evita inventar cor fora da
// identidade (nada de vermelho-para-azul).
import { COLORS } from "../../tema";
import type { Destaque } from "./MapaBrasil";

export type FaixaDeValores = { min: number; max: number };

// 0 a 1, com um piso para o menor valor não sumir no fundo.
export const forcaDoValor = (valor: number, { min, max }: FaixaDeValores, piso = 0.18) =>
  max === min ? 1 : piso + (1 - piso) * Math.max(0, Math.min(1, (valor - min) / (max - min)));

type Opcoes = {
  // Estados sem dado confiável ficam neutros (e o vídeo diz por quê).
  foraDaEscala?: string[];
  cor?: string;
  // 0 a 1: para o mapa "acender" em cascata em vez de já nascer pintado.
  entrada?: number;
};

// Monta o mapa de destaques que o MapaBrasil espera, a partir de valor por sigla.
export const destaquesPorValor = (
  valores: Record<string, number>,
  faixa: FaixaDeValores,
  { foraDaEscala = [], cor = COLORS.orange, entrada = 1 }: Opcoes = {},
): Record<string, Destaque> =>
  Object.fromEntries(
    Object.entries(valores)
      .filter(([sigla]) => !foraDaEscala.includes(sigla))
      .map(([sigla, valor]) => [sigla, { cor, forca: forcaDoValor(valor, faixa) * entrada }]),
  );
