import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "069. orçamento de paulo afonso" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-pojuca (112). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentopauloafonso/palavras.ts de lá.
//   TRECHO A "PAULO AFONSO" = de 0,00 s até "2024." (28,94 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (SUS, FPM, ICMS e a compensação das usinas hidrelétricas)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 545" (32,90 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 069).
// Satélite: baixado para Paulo Afonso (npm run tiles -- orcamento-paulo-afonso).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-paulo-afonso";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.6, -12.6, -35.9, -6.6];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(28.7);
export const DUR_A = INI_B;
export const DURACAO = s(33.7);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.26), r25: s(4.22), r26: s(7.32), abri: s(11.58), tribunal: s(13.52), fora: s(14.96), sus: s(16.1), fpm: s(18.08), icms: s(21.68), usinas: s(25.42), ano: s(28.94) };
export const B = { ano: s(28.94), arrecadou: s(30.46), n548: s(30.92), gastou: s(32.9) };

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
  // A: do Brasil até Paulo Afonso, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
