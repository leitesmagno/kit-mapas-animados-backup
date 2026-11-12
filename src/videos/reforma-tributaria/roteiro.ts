import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "050. reforma tributária" do Estúdio 3D (que põe a voz, a legenda,
// a pílula, a marca e os selos por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/reformatrib/palavras.ts de lá, VERSÃO 3 de 08/11/2026), contados a partir do começo de cada trecho.
//   A1 "CADA UM COM SUA LEI" = de "O problema" (22,32 s) a "Muitas vezes" (27,26 s)
//   A2 "GUERRA FISCAL"       = de "E estados" (32,88 s) a "Por mais" (36,92 s)
//   B  "A GRANDE VIRADA"     = de "Agora repara" (80,58 s) a "O que continua" (101,96 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/reforma-tributaria";
export const DERIVA = 0;
export const ZOOM_MAX_TILES = 8;

const s = (segundos: number) => Math.round(segundos * FPS);
export const T3D = { a1: 19.68, a1fim: 24.4, a2: 29.62, a2fim: 33.26, b: 62.84, bfim: 73.52 };
export const DUR_A1 = s(T3D.a1fim) - s(T3D.a1);
export const INI_A2 = DUR_A1;
export const DUR_A2 = s(T3D.a2fim) - s(T3D.a2);
export const INI_B = INI_A2 + DUR_A2;
export const DUR_B = s(T3D.bfim) - s(T3D.b);
export const DURACAO = INI_B + DUR_B;
export const DURACAO_NO_VIDEO = DURACAO;

const a1 = (seg: number) => s(seg) - s(T3D.a1);
export const A1 = { n27: a1(20.62), icms: a1(21.78), mil: a1(23.36), iss: a1(23.96) };
const a2 = (seg: number) => INI_A2 + s(seg) - s(T3D.a2);
export const A2 = { desconto: a2(30.32), roubar: a2(30.88), guerra: a2(32.34) };
const b = (seg: number) => INI_B + s(seg) - s(T3D.b);
export const B = {
  compra: b(64.94),
  fabrica: b(66.02),
  sp: b(67.48),
  bahia: b(68.28),
  vai: b(68.92),
  sentido: 99999,
  nenhum: b(70.38),
  devagar: b(71.32),
  a2077: b(71.94),
  antiga: 99999,
  uniao: 99999,
  fundo: 99999,
  n60: 99999,
};

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (y 600 a 1340): em cima vão a pílula, o selo e os chips do 3D; embaixo, a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 600, base = 1340, margem = 6) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const brasil = naFaixa(CAIXA.brasil);
const centro = naFaixa(CAIXA.centro);
const spba = naFaixa(CAIXA.spba);

export const CHAVES: Chave[] = [
  // A1: o país inteiro, aproximando devagar
  { quadro: 0, camera: d(brasil, -0.03) },
  { quadro: DUR_A1 - 1, camera: d(brasil, 0.05), easing: LINEAR },
  // A2 (corte seco: no 3D é outra cena): já perto dos dois vizinhos
  { quadro: INI_A2, camera: d(centro, -0.05), easing: LINEAR },
  { quadro: INI_B - 1, camera: d(centro, 0.06), easing: LINEAR },
  // B: país, mergulho em SP → BA na viagem da moeda, volta ao país na transição e no fundo
  { quadro: INI_B, camera: d(brasil, -0.02), easing: LINEAR },
  { quadro: B.sp - 4, camera: d(brasil, 0.02), easing: LINEAR },
  { quadro: B.sp + 22, camera: d(spba, -0.03), easing: VOO, rho: 1.2 },
  { quadro: B.nenhum - 6, camera: d(spba, 0.04), easing: LINEAR },
  { quadro: B.nenhum + 22, camera: d(brasil, 0), easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: d(brasil, 0.08), easing: LINEAR },
];
