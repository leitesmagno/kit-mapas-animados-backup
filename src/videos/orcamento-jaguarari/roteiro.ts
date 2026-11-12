import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "122. orçamento de jaguarari" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-serra-do-ramalho (119). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentojaguarari/palavras.ts de lá.
//   TRECHO A "JAGUARARI" = de 0,00 s até "2024." (27,84 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, ICMS, Fundeb e a compensação da mineração)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 219" (31,46 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 122).
// Satélite: copiado de Paulo Afonso (mesma região do norte da Bahia) e completado com npm run tiles -- orcamento-jaguarari.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-jaguarari";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.6, -12.6, -35.9, -6.6];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(27.6);
export const DUR_A = INI_B;
export const DURACAO = s(32.26);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.88), r25: s(3.64), r26: s(6.54), abri: s(10.12), tribunal: s(12.56), fora: s(14.16), fpm: s(15.8), icms: s(18.86), fundeb: s(22.74), cfem: s(24.86), ano: s(27.84) };
export const B = { ano: s(27.84), arrecadou: s(29.14), n218: s(29.64), gastou: s(31.46) };

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
  // A: do Brasil até Jaguarari, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(12.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
