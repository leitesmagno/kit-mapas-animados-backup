import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "026. orçamento de brumado" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentobrumado/palavras.ts de lá.
//   TRECHO A "BRUMADO"     = de 0,00 s até 0,2 s antes de "Primeiro: de onde vem" (13,4 s)
//   TRECHO B "DE ONDE VEM"          = daí até "para onde vai" (33,6 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-brumado";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(13.2);
export const DUR_A = INI_B;
export const DURACAO = s(34.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bi: s(0.6), n398: s(0.6), em2025: s(2.6), abri: s(4.0) };
export const B = {
  arrecadou: s(17.0),
  n433: s(17.3),
  umDe10: s(19.7),
  federal: s(25.6),
  estado: s(26.4),
  fundeb: s(27.1),
  uniao: s(28.1),
  n192: s(28.7),
  quatro: s(30.0),
};

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 470 a 1220): em cima vão a pílula, a marca e os selos do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Brumado, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.4), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade na arrecadação e nos impostos; recua para ver Brasília e Salvador no "governo federal"
  { quadro: B.federal - 20, camera: d(cidade, 0.18), easing: LINEAR },
  { quadro: B.federal + 14, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.12), easing: LINEAR },
];
