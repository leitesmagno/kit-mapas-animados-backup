import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Um trecho de mapa para o vídeo "071. orçamento de itamaraju" do Estúdio 3D (que põe a voz, a legenda, a pílula, a marca,
// os chips com o que Itamaraju arrecadou e o selo do @ por cima). Molde: orcamento-barreiras (067).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (src/videos/orcamentoitamaraju/palavras.ts de lá).
//   TRECHO A "ITAMARAJU" = de 0,00 s até "Começa em 2024" (11,68 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-itamaraju"; // pasta própria (copiada da de Itabela, vizinha e já entregue, e completada pelo npm run tiles)
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41.6, -18.6, -37.6, -14.6]; // a mesma de Itabela (Itamaraju fica em -17,0 / -39,5)
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const DURACAO = s(12.1);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), v2024: s(0.92), v2025: s(3.28), v2026: s(5.28), abri: s(8.54), comeca: s(11.68) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 470 a 1220): em cima vão a pílula, a marca e o selo do @, embaixo os chips e a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 700, 1040, 40);

export const CHAVES: Chave[] = [
  // do Brasil até Itamaraju, no extremo sul da Bahia, sem parar; depois aproxima devagar até o 3D entrar
  { quadro: 0, camera: brasil },
  { quadro: s(5.0), camera: d(cidade, -0.15), easing: VOO, rho: 1.4 },
  { quadro: DURACAO, camera: d(cidade, 0.18), easing: LINEAR },
];
