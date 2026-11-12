import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "033. orçamento de inhambupé" do Estúdio 3D (que põe
// a voz, a legenda, a pílula, a marca e os selos por cima). Molde: orcamento-belmonte (032).
// Sem narração própria: o relógio é o MESMO do vídeo 3D (quadro 0 aqui = quadro 0 lá), tempos tirados
// do src/videos/orcamentoinhambupe/palavras.ts de lá (narração já acelerada 1,15x, então sem conversão).
//   TRECHO A "INHAMBUPE"        = de 0,00 s até 0,2 s antes de "Entrou: 190" (12,18 s)
//   TRECHO B "ARRECADOU 2024" = daí até "Saiu: 154" (14,88 s) + folga (só o total do PDF do TCM, sem União/Estado/Fundeb)
// Dados: Balanço 2024 enviado ao TCM-BA (Anexos 10 e 12), receita líquida por origem.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-inhambupe";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-50, -19, -36, -8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(11.9);
export const DUR_A = INI_B;
export const DURACAO = s(15.6);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), combustivel: s(1.48), aluguel: s(2.34), limpeza: s(3.3), dobrou: s(4.26), abri: s(5.72), tribunal: s(7.8), ano: s(9.78) };
export const B = {
  entrou: s(12.08),
  n190: s(13.0),
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

export const CHAVES: Chave[] = [
  // A: do Brasil até Inhambupe, sem parar; B: fica na cidade no "Arrecadou" (só o total que a prefeitura informou ao TCM)
  { quadro: 0, camera: brasil },
  { quadro: s(4.6), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.1), easing: LINEAR },
  { quadro: DURACAO, camera: d(cidade, 0.2), easing: LINEAR },
];
