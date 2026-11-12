import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "130. orçamento de são francisco do conde" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-ubaitaba (092). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentosaofranciscodoconde/palavras.ts de lá.
//   TRECHO A "SÃO FRANCISCO DO CONDE" = de 0,00 s até "2024.": a abertura e o Tribunal
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 847" + folga, com o empréstimo de R$ 90 mi
// Dados: Balanço 2024 e 2025 e PCMGE016 set/2026 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 130).
// Satélite: o do orcamento-simoesfilho (vizinho; a área de perto cobre São Francisco do Conde).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-sfconde"; // cópia do satélite do Simões Filho (vizinho no Recôncavo) + npm run tiles
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-39.2, -13.3, -37.9, -12.2];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(7.7);
export const DUR_A = INI_B;
export const DURACAO = s(14.4);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.1), abri: s(0.48), tribunal: s(2.3), anos: s(3.92), real: s(6.66), ano: s(7.86) };
export const B = { ano: s(7.86), arrecadou: s(8.88), n: s(9.4), emp: s(11.56), gastou: s(13.76) };

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
  // A: do Brasil até São Francisco do Conde, enquanto a voz abre o vídeo
  { quadro: 0, camera: brasil },
  { quadro: s(5.2), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
