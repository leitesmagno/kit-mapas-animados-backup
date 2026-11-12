import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA_VIRADAS } from "./dados";

// ---------------------------------------------------------------------------
// Trecho de mapa do vídeo "019. resultado midterms eua" do Estúdio 3D (que põe a voz, a legenda,
// a pílula, a marca e os selos por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/midtermsresultado/palavras.ts de lá), contados a partir do começo do trecho.
//   TRECHO "AS 7 VIRADAS" = de "De madrugada" (31,12 s) a "Faz a conta" (42,34 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/midterms-resultado";
export const ZOOM_MAX_TILES = 9;
export const DERIVA = 0;

const INICIO = 31.12; // "De madrugada" no 3D
const s = (seg: number) => Math.round((seg - INICIO) * FPS);
export const DURACAO = s(42.34);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos da fala do 3D, convertidos para quadros do trecho)
export const E = {
  lista: s(31.98), // "a lista cresceu": aparece o contador
  sete: s(33.6), // "7 cadeiras": Carolina do Norte
  republicanos: s(34.52), // "dos republicanos": Carolina do Sul, Ohio, Iowa
  nunca: s(35.8), // "onde quase nunca ganham": Kansas, Texas, Maine
  texas: s(37.16), // "O Texas": a câmera chega no Texas
  anos30: s(39.58), // "30 anos"
  kansas: s(40.4), // "O Kansas": a câmera voa para o Kansas
  anos90: s(41.32), // "mais de 90"
};

// a ordem em que os 7 estados acendem (lista da CBS, 04/11/2026)
export const VIRADAS: { uf: string; nome: string; q: number }[] = [
  { uf: "NC", nome: "CAROLINA DO NORTE", q: E.sete },
  { uf: "SC", nome: "CAROLINA DO SUL", q: E.republicanos },
  { uf: "OH", nome: "OHIO", q: E.republicanos + 12 },
  { uf: "IA", nome: "IOWA", q: E.republicanos + 24 },
  { uf: "KS", nome: "KANSAS", q: E.nunca },
  { uf: "TX", nome: "TEXAS", q: E.nunca + 12 },
  { uf: "ME", nome: "MAINE", q: E.nunca + 24 },
];

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 520 a 1180): em cima vão a pílula, a marca e o selo do 3D; embaixo o contador e a legenda
const naFaixa = (cx: (typeof CAIXA_VIRADAS)[keyof typeof CAIXA_VIRADAS], topo = 520, base = 1180, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const eua = naFaixa(CAIXA_VIRADAS.eua, 540, 1160, 10);
const texas = naFaixa(CAIXA_VIRADAS.texas, 560, 1160, 60);
const kansas = naFaixa(CAIXA_VIRADAS.kansas, 560, 1160, 80);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(eua, -0.05) },
  { quadro: E.texas - 1, camera: d(eua, 0.08), easing: LINEAR },
  { quadro: E.texas + 30, camera: d(texas, -0.04), easing: VOO, rho: 1.2 },
  { quadro: E.kansas - 1, camera: d(texas, 0.06), easing: LINEAR },
  { quadro: E.kansas + 28, camera: d(kansas, -0.04), easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: d(kansas, 0.05), easing: LINEAR },
];
