import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "133. orçamento de brotas de macaúbas" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-abaira (132). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentobrotas/palavras.ts de lá.
//   TRECHO A "BROTAS DE MACAÚBAS" = de 0,00 s até "2024." (37,0 s): as três receitas, as contas no Tribunal e a receita de 2025
//   (FPM, Fundeb, SUS, impostos e taxas da cidade, o ISS previsto x arrecadado e o IPTU)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 67" (40,3 s) + folga
// Dados: Balanço 2024, Balanço 2025, PCMGE016 dez/2025 e set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 133).
// Satélite: cópia da pasta de Seabra (vizinha) + blocos que faltarem (npm run tiles).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-brotas";
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-43.2, -12.8, -41.8, -11.4];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(36.8);
export const DUR_A = INI_B;
export const DURACAO = s(41.1);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.8), r25: s(3.8), r26: s(6.5), abri: s(9.7), tribunal: s(12.2), fora: s(13.8), fpm: s(15.4), fundeb: s(19.3), sus: s(22.2), proprios: s(25.1), iss: s(29.2), iptu: s(33.5), ano: s(37.0) };
export const B = { ano: s(37.0), arrecadou: s(37.3), n37: s(38.6), gastou: s(40.3) };

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
  // A: do Brasil até Brotas de Macaúbas, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(11.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
