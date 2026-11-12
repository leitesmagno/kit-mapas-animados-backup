import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "080. orçamento de xique-xique" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-marau (131). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoxiquexique/palavras.ts de lá.
//   TRECHO A "XIQUE-XIQUE" = de 0,00 s até "2024." (28,96 s): as três receitas, as contas no Tribunal e a receita de 2025 (Fundeb, FPM, complementação da União, ISS)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 240" (32,20 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 dez/2025 e set/2026 (consolidado do município) enviados ao TCM-BA (fontes.md do projeto 080).
// Satélite próprio (npm run tiles -- orcamento-xiquexique), área de perto em volta de Xique-Xique (IBGE 2933604).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-xiquexique";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-44.4, -12.5, -41.2, -9.3];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(28.7);
export const DUR_A = INI_B;
export const DURACAO = s(33.0);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.92), r25: s(3.66), r26: s(7.02), abri: s(10.64), tribunal: s(14.28), fora: s(15.76), fundeb: s(18.18), fpm: s(20.4), uniao: s(23.68), iss: s(25.94), ano: s(28.96) };
export const B = { ano: s(28.96), arrecadou: s(29.44), n232: s(30.52), gastou: s(32.2) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 860, 1240, 40);

export const CHAVES: Chave[] = [
  // A: do Brasil até Xique-Xique, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
