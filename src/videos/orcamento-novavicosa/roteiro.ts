import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "091. orçamento de nova viçosa" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-almadina (081) e orcamento-ubaitaba (092). Sem narração própria: o relógio é o MESMO
// do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentonovavicosa/palavras.ts de lá.
//   TRECHO A "NOVA VIÇOSA"      = de 0,00 s até "2024." (13,32 s): as três receitas e o Tribunal
//   TRECHO B "ARRECADOU 2024"   = daí até "Gastou 180" (16,8 s) + folga: R$ 200,4 mi
// Dados: Balanço 2024, Balanço 2025 e PCMGE066 ago/2026 enviados ao TCM-BA (fontes.md do projeto 091).
// Satélite: pasta própria (cópia de Mucuri, Caravelas e Teixeira de Freitas + blocos que faltarem, pelo npm run tiles).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-novavicosa";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.8, -18.6, -38.9, -17.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(13.25);
export const DUR_A = INI_B;
export const DURACAO = s(17.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.96), r25: s(3.24), r26: s(5.86), abri: s(9.54), tribunal: s(10.98), ano: s(13.32) };
export const B = { ano: s(13.32), arrecadou: s(14.3), n34: s(14.9), gastou: s(16.8) };

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
  // A: do Brasil até Nova Viçosa, devagar enquanto a voz diz as três receitas
  { quadro: 0, camera: brasil },
  { quadro: s(8.3), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
