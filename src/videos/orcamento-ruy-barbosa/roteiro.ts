import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "124. orçamento de ruy barbosa" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-carinhanha (118). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoruybarbosa/palavras.ts de lá.
//   TRECHO A "RUY BARBOSA" = de 0,00 s até "2024." (33,50 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (ICMS, FPM, Fundeb, SUS e IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 122" (36,80 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 124).
// Satélite: copiado do orcamento-itaberaba (vizinho) e completado com npm run tiles -- orcamento-ruy-barbosa.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-ruy-barbosa";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-43.6, -15.3, -37.6, -9.3];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(33.3);
export const DUR_A = INI_B;
export const DURACAO = s(37.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.14), r25: s(3.72), r26: s(6.06), abri: s(9.24), tribunal: s(11.48), fora: s(13.16), fpm: s(14.56), fundeb: s(18.94), uniao: s(22.22), icms: s(25.24), sus: s(28.76), iptu: s(30.8), ano: s(33.5) };
export const B = { ano: s(33.5), arrecadou: s(34.6), n142: s(35.1), gastou: s(36.8) };

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
  // A: do Brasil até Ruy Barbosa, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
