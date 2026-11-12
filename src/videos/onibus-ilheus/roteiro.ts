import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "016. ônibus de ilhéus" do Estúdio 3D (que põe a voz, a
// legenda, a pílula, o cartão da fonte e a marca por cima). Sem narração própria: os tempos vêm
// da fala do vídeo 3D (src/videos/onibusilheus/palavras.ts de lá), a partir do começo de cada trecho.
//   TRECHO A "O SALTO"            = no 3D de 0,00 a 6,32 ("Como chegamos" é 6,02)
//   TRECHO B "QUEM FICA COM O QUÊ" = no 3D de 120,52 a 127,38 ("Em novembro" 120,72; "A Viametro ganha mais" 127,18)
//   TRECHO C "SEU BAIRRO"         = no 3D de 142,64 ao fim, 153,09 ("O ônibus do seu" 142,84)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/onibus-ilheus";
export const ZOOM_MAX_TILES = 13;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(6.32);
export const INI_B = DUR_A;
export const DUR_B = s(6.86);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(10.45);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// eventos (segundos desde o começo de cada trecho, medidos na voz do 3D)
export const A = { meses: s(0.84), gastou: s(2.1), dez: s(3.28), de2024: s(4.86) };
const b = (seg: number) => INI_B + s(seg);
export const B = { assume: b(2.0), trinta: b(3.58), brisa: b(5.26) };
const c = (seg: number) => INI_C + s(seg);
export const C = { bairro: c(0.9), meConta: c(3.26), segue: c(4.74) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa D do 3D (y 640 a 1340): em cima vão a pílula, a fonte e a data; embaixo, a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 640, base = 1340, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const bahiaSul = naFaixa(CAIXA.bahiaSul);
const ilheus = naFaixa(CAIXA.ilheus);
const cidade = naFaixa(CAIXA.cidade);

export const CHAVES: Chave[] = [
  // A: do sul da Bahia até Ilhéus
  { quadro: 0, camera: d(bahiaSul, -0.1) },
  { quadro: s(2.6), camera: d(ilheus, -0.05), easing: VOO, rho: 1.3 },
  { quadro: DUR_A - 1, camera: d(ilheus, 0.12), easing: LINEAR },
  // B (corte seco): Ilhéus inteiro, aproximando devagar
  { quadro: INI_B, camera: d(ilheus, -0.08), easing: LINEAR },
  { quadro: INI_C - 1, camera: d(ilheus, 0.1), easing: LINEAR },
  // C: a cidade, aproximando devagar
  { quadro: INI_C, camera: d(cidade, -0.25), easing: LINEAR },
  { quadro: DURACAO, camera: d(cidade, 0.1), easing: LINEAR },
];
