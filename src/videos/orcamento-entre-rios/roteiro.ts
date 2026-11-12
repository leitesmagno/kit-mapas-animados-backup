import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "087. orçamento de entre rios" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-senhor-do-bonfim (125). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoentrerios/palavras.ts de lá.
//   TRECHO A "ENTRE RIOS" = de 0,00 s até "2024." (30,00 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, complementação da União, SUS e royalties do petróleo)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 203" (33,94 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e jun/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 087).
// Satélite: copiado de Inhambupe (vizinha, nordeste da Bahia) e completado com npm run tiles -- orcamento-entre-rios.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-entre-rios";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41.0, -14.5, -35.5, -9.5];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(29.84);
export const DUR_A = INI_B;
export const DURACAO = s(34.74);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.26), r25: s(4.12), r26: s(6.78), abri: s(10.14), tribunal: s(12.48), fora: s(14.1), fpm: s(15.46), fundeb: s(19.6), compl: s(22.04), sus: s(25.18), emp: s(28.02), ano: s(30.0) };
export const B = { ano: s(30.0), arrecadou: s(31.96), n314: s(32.54), gastou: s(33.94) };

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
  // A: do Brasil até Entre Rios, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(10.5), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
