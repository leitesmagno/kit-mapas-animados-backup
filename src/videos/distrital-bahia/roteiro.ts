import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa para o vídeo "013. voto distrital misto" do Estúdio 3D (que põe a voz, a
// legenda, a pílula e a marca por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/distritalmisto/palavras.ts de lá), contados a partir do começo de cada trecho.
//   TRECHO A "HOJE"       = de "Hoje, o estado" (13,90 s) a "E quem ganha" (22,34 s)
//   TRECHO B "DISTRITOS"  = de "Primeira parte" (68,20 s) a "Segunda parte" (81,58 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/distrital-bahia";
export const ZOOM_MAX_TILES = 11;
export const AREA_DE_PERTO: [number, number, number, number] = [-47, -19, -37, -8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(8.6);
export const INI_B = DUR_A;
export const DUR_B = s(13.6);
export const DURACAO = DUR_A + DUR_B;
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos depois do começo de cada trecho, medidos na voz do 3D)
export const A = { estado: s(0.64), bahia: s(2.66), n39: s(3.78), todos: s(5.96), estadoTodo: s(7.62) };
const b = (seg: number) => INI_B + s(seg);
export const B = { cortado: b(1.44), voceVota: b(2.7), seuDistrito: b(3.94), maisVotos: b(4.86), levaVaga: b(6.0), semPuxador: b(6.86), metade: b(8.38), naBahia: b(9.66), vinte: b(12.18) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 430 a 1220): em cima vão a pílula e a marca do 3D, embaixo a legenda
const naFaixa = (c: (typeof CAIXA)[keyof typeof CAIXA], topo = 430, base = 1220, margem = 30) => enquadrar(c, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (c: Cam, dz: number): Cam => ({ ...c, zoom: c.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const bahia = naFaixa(CAIXA.bahia);
const ilheus = naFaixa(CAIXA.ilheus, 470, 1180, 40);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: brasil },
  { quadro: s(0.5), camera: d(brasil, 0.03), easing: LINEAR },
  { quadro: A.bahia, camera: d(bahia, -0.05), easing: VOO, rho: 1.2 },
  { quadro: DUR_A - 1, camera: d(bahia, 0.18), easing: LINEAR },
  // trecho B (corte seco: no 3D é outra cena)
  { quadro: INI_B, camera: d(bahia, -0.04), easing: LINEAR },
  { quadro: B.seuDistrito - 4, camera: d(bahia, 0.12), easing: LINEAR },
  { quadro: B.seuDistrito + 20, camera: d(ilheus, -0.06), easing: VOO, rho: 1.3 },
  { quadro: B.metade + 20, camera: d(ilheus, 0.14), easing: LINEAR },
  { quadro: B.naBahia + 10, camera: d(bahia, -0.04), easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: d(bahia, 0.12), easing: LINEAR },
];
