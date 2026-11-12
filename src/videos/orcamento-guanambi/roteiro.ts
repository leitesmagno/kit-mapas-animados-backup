import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "051. orçamento de guanambi" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-livramento (047).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados
// do src/videos/orcamentoguanambi/palavras.ts de lá (voz Google Algenib).
//   TRECHO A "GUANAMBI"          = de 0,00 s até "2024" (5,48 s)
//   TRECHO B "ARRECADOU 2024"    = daí até "Gastou 416" (9,18 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (Anexo 12, subtotal das receitas: R$ 405.669.813,42).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-guanambi";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -20, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(5.4);
export const DUR_A = INI_B;
export const DURACAO = s(9.75);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.1), gastou: s(0.68), tribunal: s(4.6), ano: s(5.48) };
export const B = { ano: s(5.48), arrecadou: s(7.06), n405: s(7.42), gastou: s(9.18) };

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

export const CHAVES: Chave[] = [
  // A: do Brasil até Guanambi, sem parar (o voo é mais curto que no 047: a abertura aqui tem 5,5 s)
  { quadro: 0, camera: brasil },
  { quadro: s(4.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (só o total declarado ao TCM)
  { quadro: DURACAO, camera: d(cidade, 0.2), easing: LINEAR },
];
