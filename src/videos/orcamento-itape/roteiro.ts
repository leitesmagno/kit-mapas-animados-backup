import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Dois trechos de mapa SEGUIDOS para o vídeo "142. orçamento de itapé" do Estúdio 3D (que põe a voz, a legenda,
// o cabeçalho, a marca e os selos por cima). Molde: orcamento-catu (110). Sem narração própria: o relógio é o MESMO
// do vídeo 3D, tempos tirados do src/videos/orcamentoitape/palavras.ts de lá.
//   TRECHO A "ITAPÉ" = de 0,00 s até "2024." (27,64 s): as três receitas, o pedido do seguidor, as contas no Tribunal e a receita de 2025 (FPM, Fundeb)
//   TRECHO B "ARRECADOU 2024"  = daí até "Gastou 55" (31,26 s) + folga
// Dados: Balanços 2024 e 2025, PCMGE066 consolidado set/2026 e PCMGE016 dez/2025 da Prefeitura enviados ao TCM-BA (fontes.md do projeto 142).
// Satélite: cópia do orcamento-ibicarai (vizinha; a área de perto cobre Itapé).
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/orcamento-itape"; // cópia do satélite de Ibicaraí (vizinha) 
export const ZOOM_MAX_TILES = 13;
export const AREA_DE_PERTO: [number, number, number, number] = [-41, -16, -38.5, -13.8];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const INI_B = s(27.4);
export const DUR_A = INI_B;
export const DURACAO = s(31.9);
export const DURACAO_NO_VIDEO = DURACAO;

// os eventos, no relógio do vídeo 3D
export const A = { inicio: s(0.2), r24: s(0.82), r25: s(3.68), r26: s(6.24), pedido: s(9.24), abri: s(14.46), tribunal: s(16.76), fora: s(18.22), fpm: s(21.02), fundeb: s(24.12), ano: s(27.64) };
export const B = { ano: s(27.64), arrecadou: s(28.16), n59: s(29.34), gastou: s(31.26) };

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
  // A: do Brasil até Itapé, devagar enquanto a voz diz as três receitas e o pedido
  { quadro: 0, camera: brasil },
  { quadro: s(13.0), camera: d(cidade, -0.1), easing: VOO, rho: 1.4 },
  { quadro: INI_B, camera: d(cidade, 0.08), easing: LINEAR },
  // B: fica na cidade e aproxima devagar
  { quadro: DURACAO, camera: d(cidade, 0.24), easing: LINEAR },
];
