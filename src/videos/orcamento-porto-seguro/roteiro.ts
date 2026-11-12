import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "024. orçamento de porto seguro" do Estúdio 3D (que põe a voz,
// a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentoportoseguro/palavras.ts de lá.
//   TRECHO A "PORTO SEGURO" = de 0,00 s até 0,2 s antes de "Primeiro: de onde vem" (14,3 s)
//   TRECHO B "DE ONDE VEM"  = daí até "para onde vai" (33,9 s) + folga
// Só dados de Porto Seguro (RREO dez/2025 da Prefeitura de Porto Seguro).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-porto-seguro";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(14.1);
export const DUR_A = INI_B;
export const DURACAO = s(34.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bilhao: s(0.9), n150: s(1.7), em2025: s(3.2), abri: s(4.9) };
export const B = {
  arrecadou: s(17.8),
  n155: s(19.1),
  umDe4: s(21.2),
  impostos: s(22.8),
  federal: s(26.4),
  estado: s(27.4),
  fundeb: s(28.0),
  emprestimos: s(28.8),
  n100: s(30.3),
  n30: s(32.6),
};

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const municipio = naFaixa(CAIXA.municipio, 760, 1200, 60);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Porto Seguro, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.4), camera: d(municipio, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(municipio, 0.1), easing: LINEAR },
  // B: fica na cidade enquanto fala da arrecadação e dos impostos; recua até ver Brasília e Salvador no governo federal
  { quadro: B.federal - 20, camera: d(municipio, 0.16), easing: LINEAR },
  { quadro: B.federal + 4, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.12), easing: LINEAR },
];
