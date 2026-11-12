import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "120. orçamento de riachão das neves" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-paulo-afonso (069). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoriachaodasneves/palavras.ts de lá.
//   TRECHO A "RIACHÃO DAS NEVES" = de 0,00 s até "2024." (30,48 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (ICMS, FPM, Fundeb, complementação da União ao Fundeb e SUS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 158" (33,40 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 120).
// Satélite: copiado de Barreiras (vizinha) e completado com npm run tiles -- orcamento-riachao-das-neves.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-riachao-das-neves";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50.0, -16.2, -42.0, -8.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(30.2);
export const DUR_A = INI_B;
export const DURACAO = s(34.2);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.18), r25: s(3.3), r26: s(5.7), abri: s(8.3), tribunal: s(10.54), fora: s(11.98), icms: s(13.62), fpm: s(18.04), fundeb: s(21.8), compl: s(24.34), sus: s(27.84), ano: s(30.48) };
export const B = { ano: s(30.48), arrecadou: s(30.96), n156: s(31.44), gastou: s(33.4) };

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
  // A: do Brasil até Riachão das Neves, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
