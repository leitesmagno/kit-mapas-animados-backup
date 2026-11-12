import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Cinco trechos de mapa, um atrás do outro, para o vídeo "148. israelenses em itacaré" do Estúdio 3D
// (que põe voz, legenda, pílula e marca por cima). Tempos medidos na voz do 3D
// (src/videos/israelenseitacare/palavras.ts de lá):
//   A "DE ONDE VÊM"   = de "Primeiro," (9,44 s) a "Uma série" (19,62 s)
//   B "QUANTOS"       = de "gravada" (22,60 s) a "Agora, as denúncias" (35,98 s)
//   C "RUA DA PITUBA" = de "Março" (38,38 s) a "Um homem" (43,30 s)
//   D "CASARÃO AZUL"  = de "30 de outubro" (59,02 s) a "pintou" (62,30 s)
//   E "O GOVERNO"     = de "O governo" (106,60 s) a "Ninguém" (113,16 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/israelenses-itacare";
export const ZOOM_MAX_TILES = 15;
export const AREA_DE_PERTO: [number, number, number, number] = [-40.8, -15.2, -38.2, -12.4];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const TRECHOS = {
  A: [9.44, 19.62],
  B: [22.6, 35.98],
  C: [38.38, 43.3],
  D: [59.02, 62.3],
  E: [106.6, 113.16],
} as const;
const dur = (k: keyof typeof TRECHOS) => s(TRECHOS[k][1]) - s(TRECHOS[k][0]);
export const INI_A = 0;
export const INI_B = INI_A + dur("A");
export const INI_C = INI_B + dur("B");
export const INI_D = INI_C + dur("C");
export const INI_E = INI_D + dur("D");
export const DURACAO = INI_E + dur("E");
export const DURACAO_NO_VIDEO = DURACAO;

// eventos: segundos do relógio do 3D convertidos para o quadro deste mapa
const em = (ini: number, base: number) => (seg: number) => ini + s(seg) - s(base);
const a = em(INI_A, TRECHOS.A[0]);
const b = em(INI_B, TRECHOS.B[0]);
const c = em(INI_C, TRECHOS.C[0]);
const dd = em(INI_D, TRECHOS.D[0]);
const e = em(INI_E, TRECHOS.E[0]);
export const A = { israel: a(9.6), voo: a(12.5), chega: a(15.6), sul: a(13.06), pontos: a(15.8) };
export const B = { morro: b(23.14), quinze: b(27.94), voo: b(29.9), itacare: b(30.36), semNumero: b(30.76), tres: b(33.34) };
export const C = { voo: c(38.7), pituba: c(39.44) };
export const D = { data: dd(59.1), casarao: dd(60.04) };
export const E = { bahia: e(107.24), itacare: e(110.0), morro: e(110.46), policia: e(111.68) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio: em cima vai a pílula e a marca do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 520, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const z = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const israel = naFaixa(CAIXA.israel);
const sul = naFaixa(CAIXA.sul);
const morro = naFaixa(CAIXA.morro);
const itacare = naFaixa(CAIXA.itacare);
const centro = naFaixa(CAIXA.centro, 560, 1180, 20);
const bahia = naFaixa(CAIXA.bahia);

export const CHAVES: Chave[] = [
  // A: Israel → sul da Bahia (o voo abre sozinho para o Atlântico)
  { quadro: INI_A, camera: z(israel, -0.05) },
  { quadro: A.voo, camera: israel, easing: LINEAR },
  { quadro: A.chega, camera: sul, easing: VOO, rho: 1.6 },
  { quadro: INI_B - 1, camera: z(sul, 0.08), easing: LINEAR },
  // B: Morro de São Paulo → Itacaré
  { quadro: INI_B, camera: z(sul, 0.08) },
  { quadro: B.morro + 20, camera: morro, easing: VOO, rho: 1.1 },
  { quadro: B.voo, camera: z(morro, 0.08), easing: LINEAR },
  { quadro: B.voo + 40, camera: itacare, easing: VOO, rho: 1.2 },
  { quadro: INI_C - 1, camera: z(itacare, 0.1), easing: LINEAR },
  // C: mergulho no centro de Itacaré, Rua da Pituba
  { quadro: INI_C, camera: z(itacare, 0.1) },
  { quadro: C.voo + 40, camera: centro, easing: VOO, rho: 1.1 },
  { quadro: INI_D - 1, camera: z(centro, 0.08), easing: LINEAR },
  // D: Casarão Azul, Praça São Miguel
  { quadro: INI_D, camera: z(centro, -0.15) },
  { quadro: INI_E - 1, camera: z(centro, 0.1), easing: LINEAR },
  // E: Bahia → os dois destinos
  { quadro: INI_E, camera: bahia },
  { quadro: E.itacare + 10, camera: sul, easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: z(sul, 0.06), easing: LINEAR },
];
