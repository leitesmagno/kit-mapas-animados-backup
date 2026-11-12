import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "020. orçamento de são paulo" do Estúdio 3D (que põe a voz,
// a legenda, a pílula, a marca e os selos por cima). Sem narração própria: o relógio é o MESMO do vídeo
// 3D (quadro 0 aqui = quadro 0 lá), tempos tirados do src/videos/orcamentosp/palavras.ts de lá.
//   TRECHO A "SÃO PAULO"     = de 0,00 s até 0,2 s antes de "Primeiro, quem paga" (17,9 s)
//   TRECHO B "QUEM PAGA"     = daí até "para onde foi" (41,7 s) + folga
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-sp";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-54, -26, -43, -14];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(17.7);
export const DUR_A = INI_B;
export const DURACAO = s(42.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { bi: s(0.7), em2025: s(2.5), morador: s(3.9), terceira: s(8.4), centavos: s(12.2), relatorios: s(13.8) };
export const B = {
  federal: s(19.7),
  n5: s(20.9),
  estado: s(21.9),
  n12: s(22.6),
  fundeb: s(23.3),
  n8: s(24.9),
  cidade: s(25.4),
  n67: s(27.5),
  seis: s(30.5),
  iss: s(35.3),
  n39: s(37.6),
  iptu: s(39.8),
  n18: s(40.5),
};

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
// o assunto fica na faixa do meio (de y 470 a 1220): em cima vão a pílula, a marca e os selos do 3D, embaixo a legenda
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 760, 1200, 40);
const repasses = naFaixa(CAIXA.repasses);

export const CHAVES: Chave[] = [
  // A: do Brasil até a cidade de São Paulo, e fica lá chegando devagar
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.12), easing: LINEAR },
  // B: recua até ver Brasília e o estado de SP; volta para a cidade nos impostos da própria cidade
  { quadro: B.federal + 2, camera: d(repasses, -0.02), easing: VOO, rho: 1.3 },
  { quadro: B.cidade - 6, camera: d(repasses, 0.1), easing: LINEAR },
  { quadro: B.cidade + 40, camera: d(cidade, -0.05), easing: VOO, rho: 1.3 },
  { quadro: DURACAO, camera: d(cidade, 0.1), easing: LINEAR },
];
