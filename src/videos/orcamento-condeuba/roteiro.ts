import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "136. orçamento de condeúba" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-abaira (132). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentocondeuba/palavras.ts de lá.
//   TRECHO A "CONDEÚBA" = de 0,00 s até "2024." (31,66 s): as três receitas e a receita de 2025
//   (União, FPM, SUS, Estado, Fundeb, impostos e taxas da cidade e o IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 93" (34,62 s) + folga
// Dados: Balanço 2024, Balanço e Anexo 10 de 2025, PCMGE016 ago/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 136).
// Satélite: copiado de Anagé (Sudoeste/Centro-Sul; Condeúba fica dentro da área dos tiles) + npm run tiles.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-condeuba";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-44, -17, -40, -13];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(31.45);
export const DUR_A = INI_B;
export const DURACAO = s(35.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.84), r25: s(3.18), r26: s(5.66), pergunta: s(8.4), uniao: s(10.58), fpm: s(13.94), sus: s(18.36), estado: s(20.52), fundeb: s(22.64), proprios: s(25.02), iptu: s(27.8), ano: s(31.66) };
export const B = { ano: s(31.66), arrecadou: s(31.98), n92: s(32.96), gastou: s(34.62) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 980, 1320, 40);

export const CHAVES: Chave[] = [
  // A: do Brasil até Condeúba, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
