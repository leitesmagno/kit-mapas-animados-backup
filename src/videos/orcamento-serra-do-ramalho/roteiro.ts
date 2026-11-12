import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "119. orçamento de serra do ramalho" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-paulo-afonso (069). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoserradoramalho/palavras.ts de lá.
//   TRECHO A "SERRA DO RAMALHO" = de 0,00 s até "2024." (24,14 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, complementação da União ao Fundeb e SUS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 178" (27,84 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 (Prefeitura, Instituto de Previdência e Agência) enviados ao TCM-BA (fontes.md do projeto 119).
// Satélite: copiado de Bom Jesus da Lapa (vizinha) e completado com npm run tiles -- orcamento-serra-do-ramalho.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-serra-do-ramalho";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-47.4, -17.2, -39.4, -9.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(23.9);
export const DUR_A = INI_B;
export const DURACAO = s(28.64);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.1), r25: s(3.4), r26: s(5.42), abri: s(8.06), tribunal: s(10.32), fora: s(11.98), fpm: s(13.56), fundeb: s(16.92), compl: s(19.52), sus: s(22.72), ano: s(24.14) };
export const B = { ano: s(24.14), arrecadou: s(25.66), n184: s(26.32), gastou: s(27.84) };

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
  // A: do Brasil até Serra do Ramalho, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(10.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
