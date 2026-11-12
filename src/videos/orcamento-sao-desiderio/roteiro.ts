import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "121. orçamento de são desidério" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-carinhanha (118). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentosaodesiderio/palavras.ts de lá.
//   TRECHO A "SÃO DESIDÉRIO" = de 0,00 s até "2024." (30,68 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (ICMS, FPM, Fundeb, SUS e IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 400" (34,20 s) + folga
// Dados: Balanço 2024, Balanço 2025 e PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 121).
// Satélite: copiado do orcamento-riachao-das-neves (vizinho) e completado com npm run tiles -- orcamento-sao-desiderio.
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-sao-desiderio";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-49.4, -16.5, -41.5, -9.3];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(30.5);
export const DUR_A = INI_B;
export const DURACAO = s(35.0);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(1.28), r25: s(4.26), r26: s(7.42), abri: s(10.86), tribunal: s(13.48), fora: s(15.0), icms: s(16.46), fpm: s(20.64), fundeb: s(23.34), sus: s(26.2), iptu: s(28.16), ano: s(30.68) };
export const B = { ano: s(30.68), arrecadou: s(31.96), n142: s(32.32), gastou: s(34.2) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 470, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const d = (cam: Cam, dz: number): Cam => ({ ...cam, zoom: cam.zoom + dz });
const brasil = enquadrar(CAIXA.brasil, W, H, { margem: 40, deslocar: [0, -40] });
const cidade = naFaixa(CAIXA.municipio, 980, 1320, 40);

export const CHAVES: Chave[] = [
  // A: do Brasil até São Desidério, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
