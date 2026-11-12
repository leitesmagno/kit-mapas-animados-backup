import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "137. orçamento de cordeiros" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-condeuba (136). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentocordeiros/palavras.ts de lá.
//   TRECHO A "CORDEIROS" = de 0,00 s até "2024." (30,46 s): as três receitas e a receita de 2025
//   (União, FPM, SUS, Estado, Fundeb, impostos e taxas da cidade e o IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 46" (33,46 s) + folga
// Dados: Balanço 2024, Balanço e PCMGE016 de 2025, PCMGE066 set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 137).
// Satélite: copiado de Condeúba (vizinha) + npm run tiles.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-cordeiros";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-44, -17, -40, -13];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(30.25);
export const DUR_A = INI_B;
export const DURACAO = s(34.2);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.82), r25: s(3.06), r26: s(5.96), pergunta: s(9.02), uniao: s(11.12), fpm: s(14.1), sus: s(18.68), estado: s(21.08), fundeb: s(23.16), proprios: s(24.88), iptu: s(27.66), ano: s(30.46) };
export const B = { ano: s(30.46), arrecadou: s(31.56), n44: s(32.04), gastou: s(33.46) };

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
  // A: do Brasil até Cordeiros, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
