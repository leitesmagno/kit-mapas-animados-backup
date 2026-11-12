import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "027. orçamento de feira de santana" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentofeira/palavras.ts de lá.
//   TRECHO A "FEIRA DE SANTANA" = de 0,00 s até 0,2 s antes de "Primeiro: de onde vem" (14,6 s)
//   TRECHO B "DE ONDE VEM"          = daí até "para onde vai" (34,9 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-feira";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(14.4);
export const DUR_A = INI_B;
export const DURACAO = s(35.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bi: s(1.1), n320: s(2.0), em2025: s(3.7), abri: s(5.0) };
export const B = {
  arrecadou: s(18.2),
  n430: s(19.5),
  umDe4: s(21.7),
  federal: s(27.1),
  estado: s(28.0),
  fundeb: s(28.6),
  uniao: s(29.7),
  n661: s(30.3),
  maisQue: s(32.2),
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
  // A: do Brasil até Feira de Santana, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.4), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade na arrecadação e nos impostos; recua para ver Brasília e Salvador no "governo federal"
  { quadro: B.federal - 20, camera: d(cidade, 0.18), easing: LINEAR },
  { quadro: B.federal + 14, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.12), easing: LINEAR },
];
