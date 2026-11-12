import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "075. orçamento de santo amaro" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-inhambupe-tcm (129) / orcamento-sfconde (130). Sem narração própria:
// o relógio é o MESMO do vídeo 3D, tempos tirados do src/videos/orcamentosantoamaro/palavras.ts de lá.
//   TRECHO A "SANTO AMARO" = de 0,00 s até "2024." (14,86 s): as três receitas e o Tribunal
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 240" (18,48 s) + folga
// Dados: Balanço 2024 e 2025 e PCMGE016 set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 075).
// Satélite: cópia do orcamento-sfconde (vizinho no Recôncavo) + npm run tiles.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-santoamaro"; // cópia do satélite de São Francisco do Conde (vizinho) + npm run tiles
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-39.2, -13.3, -37.9, -12.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(14.6);
export const DUR_A = INI_B;
export const DURACAO = s(19.2);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.1), r24: s(0.96), r25: s(3.62), r26: s(6.94), abri: s(10.76), tribunal: s(12.1), ano: s(14.86) };
export const B = { ano: s(14.86), arrecadou: s(15.92), n: s(16.42), gastou: s(18.48) };

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
  // A: do Brasil até Santo Amaro, devagar enquanto a voz diz as três receitas
  { quadro: 0, camera: brasil },
  { quadro: s(10.2), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
