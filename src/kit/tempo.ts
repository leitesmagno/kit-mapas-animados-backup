import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// O relógio do kit. Tudo é função do quadro (determinístico): nada de estado, nada de
// Math.random. As curvas são as da edição "viral" — entra rápido, passa um pouco do ponto
// e assenta (o "pop"), sai seca.
// ---------------------------------------------------------------------------

// O kit conta o tempo em QUADROS DE 30 FPS (as durações das animações — 12 quadros de pouso, 1 letra
// por quadro… — foram todas medidas assim). Num vídeo a 60 fps, `useQuadro` devolve o quadro nessa
// mesma escala, com fração (quadro 61 a 60 fps = 30,5): as animações duram o mesmo tempo e ganham os
// quadros do meio, mais fluidas. A 30 fps é o próprio useCurrentFrame (os vídeos antigos não mudam).
export const FPS_DO_KIT = 30;
export const useQuadro = (): number => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return fps === FPS_DO_KIT ? f : (f * FPS_DO_KIT) / fps;
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CURVA = {
  // chega rápido e assenta devagar (entrada de rótulo, cartão, câmera pousando)
  pouso: Easing.bezier(0.16, 1, 0.3, 1),
  // saída seca
  saida: Easing.bezier(0.7, 0, 0.84, 0),
  // ida e volta suave
  suave: Easing.bezier(0.45, 0, 0.55, 1),
  // passa do ponto (~12%) e volta: o "pop" de ícone, sigla e cartão
  pop: Easing.bezier(0.34, 1.56, 0.64, 1),
};

// 0 → 1 a partir de `desde`, em `n` quadros.
export const entra = (q: number, desde: number, n = 12, curva = CURVA.pouso) => interpolate(q, [desde, desde + n], [0, 1], { ...cl, easing: curva });

// 1 → 0 a partir de `desde`, em `n` quadros (Infinity = nunca sai).
export const sai = (q: number, desde = Infinity, n = 10) => (Number.isFinite(desde) ? interpolate(q, [desde, desde + n], [1, 0], { ...cl, easing: CURVA.saida }) : 1);

// Vida de um elemento: quanto ele está na tela (0 = fora, 1 = inteiro), com pop opcional.
export const vida = (q: number, e: number, s = Infinity, n = 12, curva = CURVA.pouso) => Math.min(entra(q, e, n, curva), sai(q, s));

// Um pulso: sobe em `sobe` quadros e assenta em `desce` (o "flash" de um destaque).
export const pulso = (q: number, em: number, sobe = 4, desce = 18) =>
  q < em ? 0 : q < em + sobe ? (q - em) / sobe : Math.max(0, 1 - (q - em - sobe) / desce);

// Flutuação de "adesivo": poucos px em senos de períodos diferentes, com fase própria
// (dois ícones lado a lado não boiam juntos).
export const boia = (q: number, fase = 0, amplitude = 1) => ({
  x: amplitude * (3 * Math.sin(q / 23 + fase * 1.7)),
  y: amplitude * (6 * Math.sin(q / 17 + fase)),
  giro: amplitude * (3 * Math.sin(q / 29 + fase * 2.3)),
});

// Segundos da narração → quadro (o kit trabalha em quadros; o Whisper, em segundos).
export const quadro = (segundos: number, fps: number) => Math.round(segundos * fps);

// Um id seguro para url(#…) de SVG (o useId do React traz ":" que o CSS não aceita).
export const idSvg = (base: string) => base.replace(/[^a-zA-Z0-9_-]/g, "");
