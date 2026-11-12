import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "029. educação em ilhéus" do Estúdio 3D (que põe a voz, a
// legenda, a pílula, os selos e a marca d'água por cima). Sem narração própria: os tempos vêm da
// fala do vídeo 3D (src/videos/educacaoilheus/palavras.ts de lá), contados do começo de cada trecho.
//   TRECHO A "ILHÉUS"    = do início (0,00 s) a "A regra" (4,64 s)            → no 3D de 0 a 4,94
//   TRECHO B "O FUNDEB"  = de "E o Fundeb" (7,60 s) a "2006." (12,18 s)      → no 3D de 7,40 a 12,50
//   TRECHO C "É SEU"     = de "Confira no portal" (171,52 s) ao fim (179,06 + folga) → no 3D de 171,32 a 180,02
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/educacao-ilheus";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(4.94);
export const INI_B = DUR_A;
export const DUR_B = s(5.1);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(8.7);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos depois do começo de cada trecho, medidos na voz do 3D)
export const A = { ilheus: s(1.32), n2bi: s(1.82), educacao: s(2.72), numeros: s(3.26), naoBatem: s(3.96) };
const b = (seg: number) => INI_B + s(seg);
export const B = { fundeb: b(0.2), vaquinha: b(0.94), cidade: b(1.68), vinte: b(2.3), repasses: b(3.0), devolve: b(3.76) };
const c = (seg: number) => INI_C + s(seg);
export const C = { portal: c(0.2), dinheiro: c(1.7), escola: c(2.78), conta: c(3.66), segue: c(4.58) };

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
const bahia = naFaixa(CAIXA.bahiaSul);

export const CHAVES: Chave[] = [
  // A: do Brasil até Ilhéus, rápido (o gancho tem 4,6 s)
  { quadro: 0, camera: brasil },
  { quadro: s(1.5), camera: d(ilheus, -0.1), easing: VOO, rho: 1.4 },
  { quadro: DUR_A - 1, camera: d(ilheus, 0.1), easing: LINEAR },
  // B (corte seco: no 3D é outra cena): sai de Ilhéus e recua até o sul da Bahia, onde fica o fundo
  { quadro: INI_B, camera: d(ilheus, -0.25), easing: LINEAR },
  { quadro: B.vaquinha + 4, camera: d(bahia, 0.05), easing: VOO, rho: 1.2 },
  { quadro: INI_C - 1, camera: d(bahia, 0.15), easing: LINEAR },
  // C: Ilhéus de novo, recuando devagar
  { quadro: INI_C, camera: d(ilheus, 0.15), easing: LINEAR },
  { quadro: DURACAO, camera: d(ilheus, -0.15), easing: LINEAR },
];
