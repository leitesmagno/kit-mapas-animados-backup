import { telaParaMundo, type Camera } from "./projecao";

// ---------------------------------------------------------------------------
// Quais tiles de satélite a câmera vê, e em que nível.
//
// Tiles de 256 px (EOxCloudless 2016, CC BY 4.0), baixados antes para
// public/satelite-sl/{z}/{x}/{y}.jpg por scripts/sao-luis-tiles.ts — que chama ESTAS
// funções para cada quadro do vídeo. Render e download fazem a mesma conta: não falta tile.
//
// Troca de nível sem "pulo": o nível de baixo (L-1) fica sempre por baixo e o nível L entra
// por cima em fade logo depois da troca. Assim a imagem só ganha nitidez, nunca salta.
// ---------------------------------------------------------------------------

export const PASTA_TILES = "satelite-sl";
export const ZOOM_MIN = 3;
export const ZOOM_MAX = 13;
export const CREDITO_SATELITE = "Imagem: EOxCloudless 2016 · Copernicus Sentinel-2 (CC BY 4.0)";

export type Tile = { z: number; x: number; y: number };
export type Nivel = { z: number; opacidade: number };

const suave = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

// `zoomMax`: o nível mais fundo que a pasta de tiles tem (13, o EOX de 10 m; o "Amazonas" vai a 16 com o
// CBERS-4A de 2 m em Manaus)
export const niveisDaCamera = (zoom: number, zoomMax = ZOOM_MAX): Nivel[] => {
  const f = zoom + 0.5;
  const L = Math.min(zoomMax, Math.max(ZOOM_MIN + 1, Math.floor(f)));
  const entrada = L === zoomMax && f >= zoomMax + 1 ? 1 : suave((f - L) / 0.25);
  return [
    { z: L - 1, opacidade: 1 },
    { z: L, opacidade: entrada },
  ];
};

export const tilesVisiveis = (cam: Camera, largura: number, altura: number, z: number, margem = 48): Tile[] => {
  const cantos = [
    [-margem, -margem],
    [largura + margem, -margem],
    [-margem, altura + margem],
    [largura + margem, altura + margem],
  ].map(([sx, sy]) => telaParaMundo(cam, largura, altura, sx, sy));
  const n = 2 ** z;
  const x0 = Math.max(0, Math.floor(Math.min(...cantos.map((c) => c[0])) * n));
  const x1 = Math.min(n - 1, Math.floor(Math.max(...cantos.map((c) => c[0])) * n));
  const y0 = Math.max(0, Math.floor(Math.min(...cantos.map((c) => c[1])) * n));
  const y1 = Math.min(n - 1, Math.floor(Math.max(...cantos.map((c) => c[1])) * n));
  const lista: Tile[] = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) lista.push({ z, x, y });
  return lista;
};

export const tilesDoQuadro = (cam: Camera, largura: number, altura: number, zoomMax = ZOOM_MAX): Tile[] =>
  niveisDaCamera(cam.zoom, zoomMax)
    .filter((n) => n.opacidade > 0)
    .flatMap((n) => tilesVisiveis(cam, largura, altura, n.z));
