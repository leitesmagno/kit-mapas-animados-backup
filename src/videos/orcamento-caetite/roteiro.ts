import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "053. orçamento de caetité" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-inhambupe (033).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados
// do src/videos/orcamentocaetite/palavras.ts de lá.
//   TRECHO A "CAETITÉ"           = de 0,00 s até "2024" (8,00 s)
//   TRECHO B "ARRECADOU 2024"    = daí até "Gastou 220" (12,14 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (subtotal das receitas: R$ 236.845.895,65).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-caetite";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-44, -15.5, -41, -12.5];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(7.95);
export const DUR_A = INI_B;
export const DURACAO = s(12.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), pergunta: s(0.7), abri: s(3.48), tribunal: s(5.06), ano: s(8.0) };
export const B = { ano: s(8.0), arrecadou: s(9.66), n98: s(10.06), gastou: s(12.14) };

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
  // A: do Brasil até Caetité, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (v3: só o total declarado ao TCM, sem União e Estado)
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
