import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "021. orçamento de una" do Estúdio 3D (que põe a voz,
// a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentouna/palavras.ts de lá.
//   TRECHO A "UNA"          = de 0,00 s até 0,2 s antes de "Primeiro, de onde" (11,84 s)
//   TRECHO B "DE ONDE VEIO" = daí até "E os impostos" (25,58 s) + folga
// Só dados de Una (RREO dez/2025 da Prefeitura de Una).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-una";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(11.64);
export const DUR_A = INI_B;
export const DURACAO = s(26.1);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { n132: s(0.6), milhoes: s(1.58), em2025: s(2.7), uniao: s(4.5), estado: s(5.52), impostos: s(6.74), abri: s(8.6) };
export const B = {
  fora: s(14.02),
  federal: s(14.84),
  n72: s(15.68),
  fpm: s(17.54),
  n43: s(20.9),
  estado: s(21.74),
  n11: s(22.58),
  fundeb: s(23.36),
  n24: s(25.22),
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
const una = naFaixa(CAIXA.una, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: Brasil; vai para o quadro dos três lugares (Brasília, Salvador, Una) enquanto a fala cita União, estado e cidade; desce até Una
  { quadro: 0, camera: brasil },
  { quadro: s(3.4), camera: d(repasses, -0.1), easing: VOO, rho: 1.3 },
  { quadro: s(6.9), camera: d(repasses, 0.05), easing: LINEAR },
  { quadro: s(9.6), camera: d(una, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(una, 0.05), easing: LINEAR },
  // B: recua de novo até ver Brasília e Salvador e segue chegando bem devagar
  { quadro: B.federal - 18, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.12), easing: LINEAR },
];
