import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Trecho de mapa para o vídeo "096. orçamento de paratinga 2018-2024 todos os setores" do Estúdio 3D (cópia do
// orcamento-paratinga1824 do 094). Relógio = src/videos/paratingasetores1824/palavras.ts do Estúdio.
//   TRECHO A: de 0 s até "e separei todos" (6,46 s): GASTOU R$ 735,1 MI DE 2018 A 2024; depois TCM-BA (v2: sem citar o 1º vídeo).
// Dados (fontes.md do 096): soma da despesa liquidada 2018–2024 = 735.142.159,80 (conta própria, Balanços ao TCM-BA).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-paratinga1824";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -20, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(99);
export const DUR_A = INI_B;
export const DURACAO = s(7.0);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), n735: s(0.9), periodo: s(2.2), primeiro: s(4.14), tribunal: s(5.8), agora: s(6.46), abri: s(4.14) };
export const B = { ano: s(6.96), arrecadou: s(7.92), n70: s(8.4), gastou: s(9.7) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 470 a 1220): em cima vão a pílula, a marca e os selos do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 760, 1200, 40);


export const CHAVES: Chave[] = [
  // A: do Brasil até Paratinga, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
