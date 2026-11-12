import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "077. orçamento de ipirá" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-riachao-das-neves (120). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoipira/palavras.ts de lá.
//   TRECHO A "IPIRÁ" = de 0,00 s até "2024." (28,84 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, complementação da União ao Fundeb, SUS e ICMS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 253" (32,88 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 077).
// Satélite: copiado de Feira de Santana (orcamento-feira) e completado com npm run tiles -- orcamento-ipira.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-ipira";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41.8, -14.6, -37.6, -10.4];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(28.56);
export const DUR_A = INI_B;
export const DURACAO = s(33.7);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.98), r25: s(3.48), r26: s(6.04), abri: s(9.06), tribunal: s(11.44), fora: s(12.94), fpm: s(14.3), fundeb: s(17.54), compl: s(20.48), sus: s(23.72), icms: s(25.88), ano: s(28.84) };
export const B = { ano: s(28.84), arrecadou: s(30.66), n156: s(31.18), gastou: s(32.88) };

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
  // A: do Brasil até Ipirá, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
