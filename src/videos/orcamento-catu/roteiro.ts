import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "110. orçamento de catu" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-marau (131). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentocatu/palavras.ts de lá.
//   TRECHO A "CATU" = de 0,00 s até "2024." (22,84 s): as três receitas, as contas no Tribunal e a receita de 2025 (ISS, FPM, royalties)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 238" (26,72 s) + folga
// Dados: Balanço 2024, PCMGE066 consolidado 2025 e set/2026 e PCMGE016 dez/2025 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 110).
// Satélite: cópia do orcamento-inhambupe-tcm (a área de perto cobre Catu).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-catu"; // cópia do satélite de Inhambupe (033) + npm run tiles
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-39.6, -12.9, -37.3, -10.7];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(22.6);
export const DUR_A = INI_B;
export const DURACAO = s(27.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.7), r25: s(3.3), r26: s(5.54), abri: s(8.42), tribunal: s(11.86), fora: s(13.4), fpm: s(17.94), roy: s(20.88), ano: s(22.84) };
export const B = { ano: s(22.84), arrecadou: s(24.56), n242: s(25.12), gastou: s(26.72) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 860, 1240, 40);

export const CHAVES: Chave[] = [
  // A: do Brasil até Catu, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
