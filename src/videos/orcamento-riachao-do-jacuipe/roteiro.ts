import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "090. orçamento de riachão do jacuípe" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-ruy-barbosa (124). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoriachaodojacuipe/palavras.ts de lá.
//   TRECHO A "RIACHÃO DO JACUÍPE" = de 0,00 s até "2024." (34,98 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, União, SUS, ICMS e IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 136" (37,22 s) + folga
// Dados: Balanço 2024, Balanço 2025 (Anexo 10) e consolidado PCMGE066 jun/2026 enviados ao TCM-BA (fontes.md do projeto 090).
// Satélite: copiado do orcamento-ipira (mesma região) e completado com npm run tiles -- orcamento-riachao-do-jacuipe.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-riachao-do-jacuipe";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-42.4, -14.8, -36.4, -8.8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(34.8);
export const DUR_A = INI_B;
export const DURACAO = s(38.0);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.52), r25: s(4.2), r26: s(6.96), abri: s(10.18), tribunal: s(13.4), fora: s(14.86), fpm: s(16.26), fundeb: s(19.38), uniao: s(22.48), sus: s(25.42), icms: s(27.38), iptu: s(30.88), ano: s(34.98) };
export const B = { ano: s(34.98), arrecadou: s(35.46), n142: s(36.1), gastou: s(37.22) };

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
  // A: do Brasil até Riachão do Jacuípe, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(14.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
