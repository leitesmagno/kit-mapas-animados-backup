import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "032. orçamento de belmonte" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentobelmonte/palavras.ts de lá.
//   TRECHO A "BELMONTE"        = de 0,00 s até 0,2 s antes de "Entrou: 104,5" (11,7 s)
//   TRECHO B "DE ONDE VEM 2024" = daí até "Saiu: 105" (23,6 s) + folga
// Dados: Balanço 2024 enviado ao TCM-BA (proc. 13610e25), receita líquida por origem.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-belmonte";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

// narração acelerada 1,15x no 3D: os tempos medidos na fala original se dividem por 1,15
const ACEL = 1.15;
const s = (segundos: number) => Math.round((segundos / ACEL) * FPS);
export const INI_B = s(11.5);
export const DUR_A = INI_B;
export const DURACAO = s(24.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), abri: s(4.0), tribunal: s(6.1), ano: s(8.5) };
export const B = {
  entrou: s(11.7),
  n104: s(12.7),
  uniao: s(14.9),
  n58: s(15.6),
  estado: s(17.2),
  n32: s(19.6),
  municipio: s(20.4),
  n13: s(22.4),
};

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
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Belmonte, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.2), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade no "Entrou"; recua para ver Brasília e Salvador na "União"; volta perto no "próprio município"
  { quadro: B.uniao - 24, camera: d(cidade, 0.16), easing: LINEAR },
  { quadro: B.uniao + 12, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: B.municipio - 6, camera: d(repasses, 0.1), easing: LINEAR },
  { quadro: B.municipio + 26, camera: d(cidade, -0.05), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(cidade, 0.08), easing: LINEAR },
];
