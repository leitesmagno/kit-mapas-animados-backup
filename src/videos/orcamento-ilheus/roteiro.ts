import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "014. orçamento de ilhéus" do Estúdio 3D (que põe a voz, a
// legenda, a pílula e a marca por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/orcamentoilheus/palavras.ts de lá), contados a partir do começo de cada trecho.
//   TRECHO A "ILHÉUS"       = do início (0,00 s) a "Tudo aqui" (7,84 s)          → no 3D de 0 a 8,10
//   TRECHO B "DE ONDE VEM"  = de "Primeiro: de onde" (14,78 s) a "Agora, para onde" (29,20 s) → no 3D de 14,58 a 29,48
//   TRECHO C "É SEU"        = de "O dinheiro é seu" (144,30 s) ao fim (155,55 + folga) → no 3D de 144,10 a 156,50
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-ilheus";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(8.1);
export const INI_B = DUR_A;
export const DUR_B = s(14.9);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(12.4);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos depois do começo de cada trecho, medidos na voz do 3D)
export const A = { n790: s(0.7), em2025: s(3.04), abri: s(4.46), cadaReal: s(7.02) };
const b = (seg: number) => INI_B + s(seg);
export const B = { n823: b(4.5), umDeQuatro: b(6.82), impostos: b(8.76), iptu: b(10.06), federal: b(12.48), estado: b(13.42), fundeb: b(14.26) };
const c = (seg: number) => INI_C + s(seg);
export const C = { portal: c(2.98), areas: c(4.36) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 470 a 1220): em cima vão a pílula, a marca e os selos do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const ilheus = naFaixa(CAIXA.ilheus, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até Ilhéus, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(ilheus, -0.1), easing: VOO, rho: 1.4 },
  { quadro: DUR_A - 1, camera: d(ilheus, 0.12), easing: LINEAR },
  // B (corte seco: no 3D é outra cena): sai de Ilhéus e recua até ver Brasília e Salvador
  { quadro: INI_B, camera: d(ilheus, -0.2), easing: LINEAR },
  { quadro: B.iptu + 12, camera: d(ilheus, -0.45), easing: LINEAR },
  { quadro: B.federal + 2, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: INI_C - 1, camera: d(repasses, 0.1), easing: LINEAR },
  // C: Ilhéus de novo, recuando devagar
  { quadro: INI_C, camera: d(ilheus, 0.15), easing: LINEAR },
  { quadro: DURACAO, camera: d(ilheus, -0.15), easing: LINEAR },
];
