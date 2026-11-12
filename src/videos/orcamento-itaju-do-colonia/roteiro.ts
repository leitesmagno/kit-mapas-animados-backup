import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "102. orçamento de itaju do colônia" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-ubaitaba (092). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoitajudocolonia/palavras.ts de lá.
//   TRECHO A "ITAJU DO COLÔNIA" = de 0,00 s até "2024." (16,14 s): as três receitas e o Tribunal
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 47" (20,56 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 set/2026 enviados ao TCM-BA (fontes.md do projeto 102).
// Satélite: cópia da pasta do orcamento-camacan (a área de perto cobre Itaju do Colônia).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-itaju-do-colonia";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41, -16, -38.5, -13.8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(15.9);
export const DUR_A = INI_B;
export const DURACAO = s(21.2);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.96), r25: s(4.34), r26: s(7.22), abri: s(10.66), tribunal: s(12.82), ano: s(16.14) };
export const B = { ano: s(16.14), arrecadou: s(18.18), n455: s(18.64), gastou: s(20.56) };

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
  // A: do Brasil até Itaju do Colônia, devagar enquanto a voz diz as três receitas
  { quadro: 0, camera: brasil },
  { quadro: s(10.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
