import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "111. orçamento de dias d'ávila" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-marau (131). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentodiasdavila/palavras.ts de lá.
//   TRECHO A "DIAS D'ÁVILA" = de 0,00 s até "2024." (24,54 s): as três receitas, o Tribunal e de onde vem o dinheiro
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 344" (28,69 s) + folga
// Dados: Balanço 2024 e 2025 e PCMGE016 set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 111).
// Satélite: cópia do orcamento-catu (vizinho; a área de perto cobre Dias d'Ávila).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-diasdavila"; // cópia do satélite de Catu (vizinho) + npm run tiles
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.0, -14.2, -36.8, -11.0];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(24.34);
export const DUR_A = INI_B;
export const DURACAO = s(29.43);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.46), r25: s(4.78), r26: s(7.9), abri: s(11.28), tribunal: s(13.82), fora: s(15.42), fpm: s(18.26), fundeb: s(20.5), ano: s(24.54) };
export const B = { ano: s(24.54), arrecadou: s(25.7), n455: s(26.34), gastou: s(28.69) };

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
  // A: do Brasil até Dias d'Ávila, devagar enquanto a voz diz as três receitas
  { quadro: 0, camera: brasil },
  { quadro: s(10.8), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
