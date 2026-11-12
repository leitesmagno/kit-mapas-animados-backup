import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "065. orçamento de luís eduardo magalhães" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-lauro (063).
// Sem narração própria: o relógio é o MESMO do vídeo 3D, tempos tirados do src/videos/orcamentolem/palavras.ts de lá.
//   v3 (09/11/2026, molde Ubaitaba): TRECHO A = de 0,00 s até "2024" (16,64 s); TRECHO B = daí até "Gastou 909" (24,18 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (subtotal das receitas: R$ 922.679.193,21); IBGE (Censos 2010 e 2022).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-lem"; // pasta própria (copiada da de Bom Jesus da Lapa, já entregue, e completada pelo npm run tiles)
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50.0, -16.2, -42.0, -8.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(16.58);
export const DUR_A = INI_B;
export const DURACAO = s(24.7);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.88), r25: s(4.76), r26: s(8.16), abri: s(12.38), tribunal: s(14.4), ano: s(16.64) };
export const B = { ano: s(16.64), arrecadou: s(18.3), n922: s(18.68), emp: s(20.4), gastou: s(24.18) };

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
  // A: do Brasil até Luís Eduardo Magalhães, no oeste da Bahia, sem parar; depois aproxima devagar
  { quadro: 0, camera: brasil },
  { quadro: s(4.8), camera: d(cidade, -0.15), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (só o total declarado ao TCM)
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
