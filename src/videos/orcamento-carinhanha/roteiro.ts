import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "118. orçamento de carinhanha" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-paulo-afonso (069). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentocarinhanha/palavras.ts de lá.
//   TRECHO A "CARINHANHA" = de 0,00 s até "2024." (26,90 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, SUS e IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 163" (30,58 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 dez/2025 e set/2026 da Prefeitura e do SAAE enviados ao TCM-BA (fontes.md do projeto 118).
// Satélite: baixado para Carinhanha (npm run tiles -- orcamento-carinhanha).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-carinhanha";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-46.9, -17.0, -40.8, -11.0];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(26.7);
export const DUR_A = INI_B;
export const DURACAO = s(31.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.94), r25: s(3.66), r26: s(6.38), abri: s(9.7), tribunal: s(13.36), fora: s(14.82), fpm: s(16.4), fundeb: s(19.32), sus: s(22.76), iptu: s(24.52), ano: s(26.9) };
export const B = { ano: s(26.9), arrecadou: s(27.92), n142: s(28.68), gastou: s(30.58) };

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
  // A: do Brasil até Carinhanha, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
