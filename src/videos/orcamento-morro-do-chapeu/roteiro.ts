import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "123. orçamento de morro do chapéu" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-paulo-afonso (069). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentomorrodochapeu/palavras.ts de lá.
//   TRECHO A "MORRO DO CHAPÉU" = de 0,00 s até "2024." (29,58 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (ICMS, FPM, SUS, Fundeb e complementação da União ao Fundeb)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 251" (33,06 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 da Prefeitura e PCMGE016 consolidado set/2026 enviados ao TCM-BA (fontes.md do projeto 123).
// Satélite: copiado de Seabra (Chapada) e completado com npm run tiles -- orcamento-morro-do-chapeu.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-morro-do-chapeu";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-42.5, -12.6, -40.0, -10.4];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(29.3);
export const DUR_A = INI_B;
export const DURACAO = s(33.8);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.02), r25: s(3.52), r26: s(5.72), abri: s(8.44), tribunal: s(10.74), fora: s(12.28), icms: s(13.66), fpm: s(17.28), sus: s(20.58), fundeb: s(23.06), compl: s(25.62), ano: s(29.58) };
export const B = { ano: s(29.58), arrecadou: s(30.58), n259: s(31.04), gastou: s(33.06) };

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
  // A: do Brasil até Morro do Chapéu, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
