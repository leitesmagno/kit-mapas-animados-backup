import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "032. orçamento de belmonte" (versão 4) do Estúdio 3D, que põe
// a voz, a legenda, a pílula, a marca e os selos por cima. Molde: orcamento-canavieiras (034).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados
// do src/videos/orcamentobelmonte/palavras.ts de lá (narração v4 já acelerada 1,2x).
//   TRECHO A "BELMONTE"        = de 0,00 s até pouco antes de "arrecadou 104" (8,84 s)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 105" (11,14 s) + folga
// Dado: Balanço 2024 (Anexo 12) enviado ao TCM-BA: receita arrecadada R$ 104.487.271,93. Só o total, sem setas de origem.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-belmonte";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(8.3);
export const DUR_A = INI_B;
export const DURACAO = s(11.8);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), pergunta: s(0.5), real: s(1.0), abri: s(2.1), tribunal: s(3.9), ano: s(5.74) };
export const B = { arrecadou: s(8.84), n104: s(9.26), gastou: s(11.14) };

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
  // A: do Brasil até Belmonte, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.1), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (só o total declarado ao TCM)
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
