import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "023. orçamento de salvador" do Estúdio 3D (que põe a voz,
// a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentosalvador/palavras.ts de lá.
//   TRECHO A "SALVADOR"      = de 0,00 s até 0,2 s antes de "Primeiro: de onde vem" (13,8 s)
//   TRECHO B "DE ONDE VEM"   = daí até "Agora, para onde vai" (30,6 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-salvador";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -20, -36, -8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(13.6);
export const DUR_A = INI_B;
export const DURACAO = s(31.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bi: s(0.7), em2025: s(2.6), abri: s(4.0), relatorios: s(7.7) };
export const B = {
  arrecadou: s(17.3),
  n124: s(17.7),
  pouco: s(19.7),
  resto: s(24.7),
  federal: s(25.6),
  estado: s(26.5),
  fundeb: s(27.0),
  uniao: s(28.1),
  n33: s(28.7),
};

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Salvador, e fica lá chegando devagar
  { quadro: 0, camera: brasil },
  { quadro: s(4.4), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: segue na cidade (arrecadou, impostos) e recua para ver Brasília e a Bahia em "O resto veio de fora"
  { quadro: B.resto - 4, camera: d(cidade, 0.16), easing: LINEAR },
  { quadro: B.federal + 4, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(repasses, 0.1), easing: LINEAR },
];
