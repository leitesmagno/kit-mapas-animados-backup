import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "126. orçamento de monte santo" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-serra-do-ramalho (119). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentomontesanto/palavras.ts de lá.
//   TRECHO A "MONTE SANTO" = de 0,00 s até "2024." (25,30 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (complementação da União ao Fundeb, Fundeb, FPM e SUS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 312" (29,42 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 126).
// Satélite: copiado de Senhor do Bonfim (mesma região do norte da Bahia) e completado com npm run tiles -- orcamento-monte-santo.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-monte-santo";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-39.9, -10.95, -38.75, -9.9];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(25.1);
export const DUR_A = INI_B;
export const DURACAO = s(30.22);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.86), r25: s(3.62), r26: s(6.42), abri: s(10.28), tribunal: s(12.26), fora: s(14.12), comp: s(15.28), fundeb: s(18.4), fpm: s(20.7), sus: s(23.18), ano: s(25.3) };
export const B = { ano: s(25.3), arrecadou: s(26.82), n318: s(27.26), gastou: s(29.42) };

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
  // A: do Brasil até Monte Santo, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(12.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
