import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "147. barra velha pataxó" do Estúdio 3D (que põe voz, legenda, pílula e marca).
// Tempos medidos na voz do 3D (src/videos/barravelha/palavras.ts de lá).
//   A "O LUGAR"     = de "Primeiro, o lugar" (10,70 s) a "Na quarta" (16,36 s)
//   B "A TERRA"     = de "A Terra Indígena" (66,23 s) a "O estudo da" (73,81 s)
//   C "A RÉGUA"     = de "Uma, sobre" (93,05 s) a "São casos" (104,31 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/barra-velha";
export const ZOOM_MAX_TILES = 12;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(16.36) - s(10.7);
export const INI_B = DUR_A;
export const DUR_B = s(73.81) - s(66.23);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(104.31) - s(93.05);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// A: segundos depois de "Primeiro" (10,70)
export const A = { sul: s(2.4), portoSeguro: s(3.56), monte: s(4.8) };
// B: depois de "A Terra" (66,23)
const b = (x: number) => INI_B + s(x);
export const B = { area: b(2.2), pega: b(4.06), cidades: [b(4.1), b(5.18), b(5.8), b(6.58)] };
// C: depois de "Uma, sobre" (93,05)
const c = (x: number) => INI_C + s(x);
export const C = { itamaraju: c(1.72), seis: c(3.78), outra: c(5.32), prado: c(6.6), zero: c(10.18) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 560, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const bahia = naFaixa(CAIXA.bahia);
const sul = naFaixa(CAIXA.sul);
const aldeia = naFaixa(CAIXA.aldeia);
const quatro = naFaixa(CAIXA.quatro);
const op = naFaixa(CAIXA.operacoes);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(bahia, -0.05) },
  { quadro: A.sul, camera: sul, easing: VOO, rho: 1.2 },
  { quadro: A.monte, camera: aldeia, easing: VOO, rho: 1.1 },
  { quadro: DUR_A, camera: d(aldeia, 0.06), easing: LINEAR },
  { quadro: INI_B, camera: d(quatro, -0.04) },
  { quadro: INI_B + DUR_B, camera: d(quatro, 0.06), easing: LINEAR },
  { quadro: INI_C, camera: d(op, -0.04) },
  { quadro: DURACAO, camera: d(op, 0.06), easing: LINEAR },
];
