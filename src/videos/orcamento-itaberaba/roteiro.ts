import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "073. orçamento de itaberaba" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-serra-do-ramalho (119). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoitaberaba/palavras.ts de lá.
//   TRECHO A "ITABERABA" = de 0,00 s até "2024." (24,28 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, complementação da União ao Fundeb e SUS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 337" (28,46 s) + folga
// Dados: Balanço 2024, Balanço 2025 (Anexo 10) e PCMGE066 set/2026 enviados ao TCM-BA (fontes.md do projeto 073).
// Satélite: copiado de Castro Alves e completado com npm run tiles -- orcamento-itaberaba.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-itaberaba";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-42.0, -14.0, -38.4, -11.0];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(24.05);
export const DUR_A = INI_B;
export const DURACAO = s(29.26);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.78), r25: s(3.46), r26: s(5.64), abri: s(8.3), tribunal: s(10.64), fora: s(12.06), fpm: s(13.64), fundeb: s(16.72), compl: s(19.0), sus: s(22.7), ano: s(24.28) };
export const B = { ano: s(24.28), arrecadou: s(26.06), n184: s(26.52), gastou: s(28.46) };

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
  // A: do Brasil até Itaberaba, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(10.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
