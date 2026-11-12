import { Easing } from "remotion";
import type { Chave } from "../../base/geo/camera";
import { enquadrar } from "../../base/geo/projecao";
import { CAIXA } from "./dados";

// ---------------------------------------------------------------------------
// Três trechos de mapa para o vídeo "149. triplex de lula" do Estúdio 3D (voz, legenda e marca vêm de lá).
// Tempos medidos na voz do 3D (src/videos/triplexlula/palavras.ts):
//   A "O IMÓVEL"   = de "O apartamento" (8,16 s) a "No cartório" (16,42 s)
//   B "A PRISÃO"   = de "7 de abril" (48,86 s) a "No mesmo ano" (53,34 s)
//   C "BRASÍLIA"   = de "O processo" (90,84 s) a "Como Lula" (93,58 s)
// ---------------------------------------------------------------------------
export const FPS = 30;
export const FPS_DO_VIDEO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const PASTA_TILES = "satelite/triplex-lula";
export const ZOOM_MAX_TILES = 14;
export const AREA_DE_PERTO: [number, number, number, number] = [-52, -27, -44, -14.5];
export const DERIVA = 0;

const s = (segundos: number) => Math.round(segundos * FPS);
export const TRECHOS = { A: [8.16, 16.42], B: [48.86, 53.34], C: [90.84, 93.58] } as const;
const dur = (k: keyof typeof TRECHOS) => s(TRECHOS[k][1]) - s(TRECHOS[k][0]);
export const INI_A = 0;
export const INI_B = INI_A + dur("A");
export const INI_C = INI_B + dur("B");
export const DURACAO = INI_C + dur("C");
export const DURACAO_NO_VIDEO = DURACAO;

const em = (ini: number, base: number) => (seg: number) => ini + s(seg) - s(base);
const a = em(INI_A, TRECHOS.A[0]);
const b = em(INI_B, TRECHOS.B[0]);
const c = em(INI_C, TRECHOS.C[0]);
export const A = { sp: a(8.4), guaruja: a(10.28), praia: a(11.72), tres: a(13.58), m2: a(14.58) };
export const B = { data: b(48.9), voo: b(50.26), curitiba: b(52.4) };
export const C = { voo: c(90.9), brasilia: c(91.76) };

const VOO = Easing.bezier(0.6, 0, 0.25, 1);
const LINEAR = (t: number) => t;
const W = LARGURA;
const H = ALTURA;
const naFaixa = (cx: (typeof CAIXA)[keyof typeof CAIXA], topo = 520, base = 1220, margem = 30) => enquadrar(cx, W, base - topo, { margem, deslocar: [0, (topo + base) / 2 - H / 2] });
type Cam = ReturnType<typeof naFaixa>;
const z = (cm: Cam, dz: number): Cam => ({ ...cm, zoom: cm.zoom + dz });
const brasil = naFaixa(CAIXA.brasil);
const sp = naFaixa(CAIXA.sp);
const guaruja = naFaixa(CAIXA.guaruja);
const sul = naFaixa(CAIXA.sul);
const curitiba = naFaixa(CAIXA.curitiba);
const centro = naFaixa(CAIXA.centro);

export const CHAVES: Chave[] = [
  // A: Brasil → São Paulo → Guarujá
  { quadro: INI_A, camera: z(brasil, -0.05) },
  { quadro: A.sp, camera: brasil, easing: LINEAR },
  { quadro: A.guaruja, camera: sp, easing: VOO, rho: 1.4 },
  { quadro: A.praia + 20, camera: guaruja, easing: VOO, rho: 1.2 },
  { quadro: INI_B - 1, camera: z(guaruja, 0.12), easing: LINEAR },
  // B: São Paulo → Curitiba
  { quadro: INI_B, camera: sul },
  { quadro: B.voo, camera: z(sul, 0.05), easing: LINEAR },
  { quadro: B.curitiba + 10, camera: curitiba, easing: VOO, rho: 1.2 },
  { quadro: INI_C - 1, camera: z(curitiba, 0.06), easing: LINEAR },
  // C: Curitiba → Brasília
  { quadro: INI_C, camera: centro },
  { quadro: DURACAO, camera: z(centro, 0.08), easing: LINEAR },
];
