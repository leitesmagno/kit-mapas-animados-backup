import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "131. orçamento de maraú" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-ubaitaba (092). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentomarau/palavras.ts de lá.
//   TRECHO A "MARAÚ" = de 0,00 s até "2024." (24,80 s): as três receitas, o pedido do seguidor, o Tribunal e de onde vem o dinheiro
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 132" (27,16 s) + folga
// Dados: Balanço 2024 e 2025 e PCMGE016 set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 131).
// Satélite: cópia do orcamento-itacare (vizinho; a área de perto cobre Maraú).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-marau"; // cópia do satélite de Itacaré (vizinho) + npm run tiles
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.8, -16.1, -37.2, -12.5];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(24.6);
export const DUR_A = INI_B;
export const DURACAO = s(27.9);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.94), r25: s(3.10), r26: s(5.96), seguidor: s(9.24), abri: s(12.12), tribunal: s(13.70), fora: s(14.92), fpm: s(17.70), fundeb: s(20.38), ano: s(24.80) };
export const B = { ano: s(24.80), arrecadou: s(25.28), n455: s(25.96), gastou: s(27.16) };

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
  // A: do Brasil até Maraú, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
