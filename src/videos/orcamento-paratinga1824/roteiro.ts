import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "094. orçamento de paratinga 2018-2024" do Estúdio 3D (que põe a voz,
// a legenda, o cabeçalho com os dois selos e a marca por cima). Molde: orcamento-paratinga (035) e orcamento-ubaitaba (092).
// Sem narração própria: o relógio é o MESMO do vídeo 3D, tempos do src/videos/orcamentoparatinga1824/palavras.ts de lá.
//   TRECHO A "PARATINGA"        = de 0,00 s até "2018." (6,96 s): gastou 151 mi em 2024, TCM, arrecadou 2018–2024
//   TRECHO B "ARRECADOU 2018"   = daí até "Gastou 77" (9,70 s) + folga
// Dados (Balanços enviados ao TCM-BA, fontes.md do 094): gasto 2024 liquidado 151.212.427,23; soma arrecadada
// 2018–2024 690.752.413,57 (conta própria); arrecadado 2018 70.623.693,53.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-paratinga1824";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -20, -36, -10];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(6.9);
export const DUR_A = INI_B;
export const DURACAO = s(10.3);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), n151: s(0.82), abri: s(2.7), tribunal: s(4.36), periodo: s(5.14), ano: s(6.96) };
export const B = { ano: s(6.96), arrecadou: s(7.92), n70: s(8.4), gastou: s(9.7) };

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


export const CHAVES: Chave[] = [
  // A: do Brasil até Paratinga, sem parar
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  // B: fica na cidade e aproxima devagar no "arrecadou" (v3: só o total declarado ao TCM, sem União e Estado)
  { quadro: DURACAO, camera: d(cidade, 0.22), easing: LINEAR },
];
