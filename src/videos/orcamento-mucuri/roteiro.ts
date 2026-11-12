import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "078. orçamento de mucuri" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-lauro (063).
// Sem narração própria: o relógio é o MESMO do vídeo 3D, tempos tirados do src/videos/orcamentomucuri/palavras.ts de lá.
//   TRECHO A "MUCURI" = de 0,00 s até "2024." (13,82 s)
//   TRECHO B "PREVIA / ARRECADOU 2024" = daí até "gastou 263" (20,30 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (previsão inicial R$ 408.500.000,00; receitas realizadas R$ 232.439.640,58).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-mucuri"; // pasta própria: cópias de Teixeira, Caravelas, Itabela e Itamaraju (rsync --ignore-existing) + npm run tiles para o que faltava
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41.4, -19.6, -37.4, -15.8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(13.8);
export const DUR_A = INI_B;
export const DURACAO = s(21.1);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), abri: s(9.78), tribunal: s(11.42), ano: s(13.82) };
export const B = { ano: s(13.82), previa: s(15.32), arrecadou: s(18.08), n98: s(18.44), gastou: s(20.3) };

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
  // A: do Brasil até Mucuri, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(6.5), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (v3: só o total declarado ao TCM, sem União e Estado)
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
