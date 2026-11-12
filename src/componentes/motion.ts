import { Easing, interpolate } from "remotion";

// As curvas do vídeo. Entradas saem rápido e pousam macio; saídas aceleram.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

// progress vai de 0 a 1 entre `from` e `from + duration`, travado nas pontas.
export const progress = (frame: number, from: number, duration: number, easing = EASE_OUT) =>
  interpolate(frame, [from, from + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
