import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "018. pec da segurança" do Estúdio 3D (que põe a voz, a legenda,
// a pílula, a marca e os selos por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/pecseguranca/palavras.ts de lá), contados a partir do começo de cada trecho.
//   TRECHO A "CADA UM NO SEU QUADRADO" = de "Resultado" (21,84 s) a "Por isso" (36,68 s)
//   TRECHO B "A SUA CIDADE"            = de "Dois" (81,30 s) a "Três" (90,36 s)
//   TRECHO C "E AÍ?"                   = de "E aí, você quer" (157,94 s) ao fim (167,09 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/pec-seguranca";
export const ZOOM_MAX_TILES = 8;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(36.68 - 21.84);
export const INI_B = DUR_A;
export const DUR_B = s(90.36 - 81.3);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(167.09 - 157.94);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos da fala do 3D menos o começo do trecho)
const a = (seg: number) => s(seg - 21.84);
export const A = {
  cadaUm: a(22.62),
  dados: a(23.5),
  dinheiro: a(24.14),
  crime: a(25.62),
  atravessa: a(26.36),
  licenca: a(27.64),
  em2018: a(28.88),
  intervencao: a(30.16),
  rio: a(31.12),
  susp: a(32.12),
  juntar: a(32.94),
  leiComum: a(35.22),
  mudaFacil: a(35.96),
};
const b = (seg: number) => INI_B + s(seg - 81.3);
export const B = { cidade: b(82.06), municipal: b(83.1), ronda: b(84.34), masSo: b(85.02) };
const c = (seg: number) => INI_C + s(seg - 157.94);
export const C = { quer: c(158.84), meConta: c(160.34) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (y 640 a 1300): em cima vão a pílula, o selo e os chips do 3D; embaixo, a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 560, base = 1370, margem = 6) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const brasil = naFaixa(CAIXA.brasil);
const sudeste = naFaixa(CAIXA.sudeste);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(brasil, -0.03) },
  { quadro: A.intervencao - 4, camera: d(brasil, 0.03), easing: LINEAR },
  { quadro: A.intervencao + 26, camera: d(sudeste, -0.04), easing: VOO, rho: 1.2 },
  { quadro: A.susp - 2, camera: d(sudeste, 0.02), easing: LINEAR },
  { quadro: A.susp + 26, camera: d(brasil, 0), easing: VOO, rho: 1.2 },
  { quadro: DUR_A - 1, camera: d(brasil, 0.05), easing: LINEAR },
  // trecho B (corte seco: no 3D é outra cena)
  { quadro: INI_B, camera: d(brasil, -0.02), easing: LINEAR },
  { quadro: INI_C - 1, camera: d(brasil, 0.07), easing: LINEAR },
  // trecho C
  { quadro: INI_C, camera: d(brasil, 0.02), easing: LINEAR },
  { quadro: DURACAO, camera: d(brasil, 0.12), easing: LINEAR },
];
