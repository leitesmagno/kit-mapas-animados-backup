import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa para o vídeo "143. dino x deputados do PL" do Estúdio 3D (que põe a voz, a legenda,
// a pílula e a marca por cima). Tempos medidos na voz do 3D (src/videos/dinopl/palavras.ts de lá).
//   TRECHO A "DO EXTERIOR?" = de "A suspeita" (16,00 s) a "O pedido veio" (22,90 s)
//   TRECHO B "A BANCADA"    = de "O PL elegeu" (73,60 s) a "Essa lista" (79,10 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/dino-pl";
export const ZOOM_MAX_TILES = 7;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(22.9) - s(16.0);
export const INI_B = DUR_A;
export const DUR_B = s(79.1) - s(73.6);
export const DURACAO = INI_B + DUR_B;
export const DURACAO_NO_VIDEO = DURACAO;

// eventos do trecho A (segundos depois de "A suspeita")
export const A = { dinheiro: s(1.0), exterior: s(1.9), campanha: s(2.3), flavio: s(3.4), pl: s(4.3), dez: s(5.0), abriu: s(6.2) };
const b = (seg: number) => INI_B + s(seg);
// eventos do trecho B (segundos depois de "O PL")
export const B = { elegeu: b(0.4), n121: b(0.6), deputados: b(1.5), outubro: b(2.0), boato: b(2.8), bancada: b(3.5) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 430, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const eua = naFaixa(CAIXA.eua, 520, 1160, 20);
const americas = naFaixa(CAIXA.americas, 470, 1230, 20);
const brasil = naFaixa(CAIXA.brasil, 470, 1200, 30);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(eua, -0.05) },
  { quadro: A.dinheiro, camera: d(eua, 0.02), easing: LINEAR },
  { quadro: A.campanha + 8, camera: americas, easing: VOO, rho: 1.3 },
  { quadro: A.dez, camera: d(americas, 0.05), easing: LINEAR },
  { quadro: DUR_A - 1, camera: d(brasil, -0.12), easing: VOO, rho: 1.2 },
  // trecho B (corte seco: no 3D é outra cena)
  { quadro: INI_B, camera: d(brasil, -0.04), easing: LINEAR },
  { quadro: DURACAO, camera: d(brasil, 0.1), easing: LINEAR },
];
