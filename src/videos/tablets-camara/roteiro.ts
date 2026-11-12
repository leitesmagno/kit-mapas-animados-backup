import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// Um trecho de mapa para o vídeo "146. tablets da câmara" do Estúdio 3D.
// De "Começa pelo que é fato" (8,88 s) a "É uma licitação" (14,06 s): Brasil → Brasília → Congresso.
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/tablets-camara";
export const ZOOM_MAX_TILES = 16;
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DURACAO = s(14.06) - s(8.88);
export const DURACAO_NO_VIDEO = DURACAO;
// segundos depois de "Começa" (8,88)
export const A = { dia5: s(1.56), camara: s(2.78), pregao: s(3.98) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 560, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const brasil = naFaixa(CAIXA.brasil);
const df = naFaixa(CAIXA.df);
const esplanada = naFaixa(CAIXA.esplanada);

export const CHAVES: Chave[] = [
  { quadro: 0, camera: d(brasil, -0.05) },
  { quadro: A.dia5 - 6, camera: df, easing: VOO, rho: 1.3 },
  { quadro: A.camara + 4, camera: esplanada, easing: VOO, rho: 1.2 },
  { quadro: DURACAO, camera: d(esplanada, 0.12), easing: LINEAR },
];
