import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "017. orçamento de itabuna" do Estúdio 3D (que põe a voz,
// a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentoitabuna/palavras.ts de lá.
//   TRECHO A "ITABUNA"      = de 0,00 s até 0,2 s antes de "Primeiro, de onde" (7,52 s)
//   TRECHO B "DE ONDE VEIO" = daí até "para onde foi" (25,64 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-itabuna";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(7.32);
export const DUR_A = INI_B;
export const DURACAO = s(26.1);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bilhao: s(0.72), cem: s(1.4), em2025: s(2.16), abri: s(4.18) };
export const B = {
  federal: s(9.52),
  n543: s(10.38),
  estado: s(12.34),
  n127: s(12.86),
  fundeb: s(14.08),
  n108: s(15.96),
  impostos: s(17.04),
  iptu: s(18.28),
  n169: s(20.36),
  uniao: s(21.68),
  triplo: s(23.4),
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
const itabuna = naFaixa(CAIXA.itabuna, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Itabuna, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.4), camera: d(itabuna, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(itabuna, 0.1), easing: LINEAR },
  // B: recua até ver Brasília e Salvador e segue chegando bem devagar
  { quadro: B.federal + 2, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.12), easing: LINEAR },
];
