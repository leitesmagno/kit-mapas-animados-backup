import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "015. eleição nos eua" do Estúdio 3D (que põe a voz, a legenda,
// a pílula e a marca por cima). Sem narração própria: os tempos vêm da fala do vídeo 3D
// (src/videos/eleicaoeua/palavras.ts de lá), contados a partir do começo de cada trecho.
//   TRECHO A "EM JOGO"       = de "No Senado, são" (18,32 s) a "Até agora" (23,46 s)
//   TRECHO B "DISTRITOS"     = de "E como se elege" (34,72 s) a "Agora repara" (43,50 s)
//   TRECHO C "PROPORCIONAL"  = de "Agora repara" (43,50 s) a "E não para" (50,92 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/eleicao-eua";
export const ZOOM_MAX_TILES = 9;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DUR_A = s(5.24);
export const INI_B = DUR_A;
export const DUR_B = s(8.78);
export const INI_C = INI_B + DUR_B;
export const DUR_C = s(7.52);
export const DURACAO = INI_C + DUR_C;
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos (segundos depois do começo de cada trecho, medidos na voz do 3D)
export const A = { senado: s(0.16), n35: s(0.88), n100: s(1.74), n36: s(2.78), governador: s(4.62) };
const b = (seg: number) => INI_B + s(seg);
export const B = { pais: b(2.14), cortado: b(2.52), n435: b(2.98), cada: b(5.02), umSo: b(6.72), maisVotos: b(7.12), leva: b(8.24) };
const c = (seg: number) => INI_C + s(seg);
export const C = { brasil: c(1.8), proporcional: c(3.4), partido: c(5.1), estado: c(5.6), dividem: c(6.3) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 430 a 1220): em cima vão a pílula e a marca do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 430, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const eua = naFaixa(CAIXA.eua, 520, 1160, 20);
const distrito = naFaixa(CAIXA.distrito, 480, 1180, 40);
const brasil = naFaixa(CAIXA.brasil, 470, 1200, 30);
const bahia = naFaixa(CAIXA.bahia);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(eua, -0.04) },
  { quadro: DUR_A - 1, camera: d(eua, 0.08), easing: LINEAR },
  // trecho B (corte seco: no 3D é outra cena)
  { quadro: INI_B, camera: d(eua, -0.02), easing: LINEAR },
  { quadro: B.cada - 2, camera: d(eua, 0.1), easing: LINEAR },
  { quadro: B.cada + 30, camera: d(distrito, -0.05), easing: VOO, rho: 1.3 },
  { quadro: INI_C - 1, camera: d(distrito, 0.12), easing: LINEAR },
  // trecho C
  { quadro: INI_C, camera: d(brasil, -0.03), easing: LINEAR },
  { quadro: C.brasil + 30, camera: d(brasil, 0.06), easing: LINEAR },
  { quadro: C.partido, camera: d(bahia, -0.05), easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: d(bahia, 0.12), easing: LINEAR },
];
