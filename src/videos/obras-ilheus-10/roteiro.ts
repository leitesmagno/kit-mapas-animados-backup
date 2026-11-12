import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Trecho de mapa do vídeo "095. ilhéus 10 anos obras" (cópia do 036, só etiquetas e tempos novos; do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-inhambupe (033).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados
// do src/videos/orcamentoparatinga/palavras.ts de lá (narração já acelerada 1,15x).
//   TRECHO A "PARATINGA"         = de 0,00 s até "2024" (9,26 s)
//   TRECHO B "ARRECADOU 2024"    = daí até "Gastou 151" (13,9 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (Anexo 12, subtotal das receitas: R$ 141.827.540,46).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/educacao-ilheus-tcm";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(14.4);
export const DUR_A = INI_B;
export const DURACAO = s(14.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), pergunta: s(0.6), real: s(2.2), abri: s(7.2), tribunal: s(9.3), ano: s(14.4), decisoes: s(9.3), oficiais: s(11.2), prometeu: s(1.95), entraram: s(4.5) };
export const B = { ano: s(15.2), arrecadou: s(15.3), n141: s(15.4), gastou: s(15.6) };

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
  // A: do Brasil até Paratinga, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(5.2), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (v3: só o total declarado ao TCM, sem União e Estado)
];
