import { geoPath, geoTransform } from "d3-geo";

// ---------------------------------------------------------------------------
// Projeção: Web Mercator planar, recalculada a cada quadro a partir da câmera.
//
// Não escalamos o SVG com CSS (que borra e engorda as linhas no zoom): a câmera muda a
// PROJEÇÃO, e o d3 redesenha os caminhos. Assim a linha tem sempre 1,2 px na tela, seja
// no Brasil inteiro, seja numa rua de São Luís.
// ---------------------------------------------------------------------------

export type LonLat = [number, number];
export type Ponto = [number, number];

export type Camera = {
  lon: number;
  lat: number;
  // Zoom no padrão dos mapas web: o mundo inteiro mede 256·2^zoom px.
  zoom: number;
  // Giro do mapa na tela, em graus (positivo = horário).
  bearing: number;
};

export const TILE = 256;

// lon/lat → coordenada de "mundo" normalizada (0–1), a mesma dos tiles.
export const paraMundo = (lon: number, lat: number): Ponto => {
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return [(lon + 180) / 360, 0.5 - y / (2 * Math.PI)];
};

export const deMundo = (x: number, y: number): LonLat => {
  const lon = x * 360 - 180;
  const lat = (Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) * 360) / Math.PI - 90;
  return [lon, lat];
};

export type Projetor = (lon: number, lat: number) => Ponto;
export type ProjetorMundo = (x: number, y: number) => Ponto;

// Coordenada de mundo (0–1) → tela. É a base de tudo: tiles, polígonos e rótulos.
export const criarProjetorMundo = (cam: Camera, largura: number, altura: number): ProjetorMundo => {
  const s = TILE * 2 ** cam.zoom;
  const [cx, cy] = paraMundo(cam.lon, cam.lat);
  const b = (cam.bearing * Math.PI) / 180;
  const cos = Math.cos(b);
  const sin = Math.sin(b);
  return (x, y) => {
    const dx = (x - cx) * s;
    const dy = (y - cy) * s;
    return [largura / 2 + dx * cos - dy * sin, altura / 2 + dx * sin + dy * cos];
  };
};

// A inversa: ponto da tela → coordenada de mundo (para saber o que a câmera enxerga).
export const telaParaMundo = (cam: Camera, largura: number, altura: number, sx: number, sy: number): Ponto => {
  const s = TILE * 2 ** cam.zoom;
  const [cx, cy] = paraMundo(cam.lon, cam.lat);
  const b = (cam.bearing * Math.PI) / 180;
  const dx = sx - largura / 2;
  const dy = sy - altura / 2;
  return [cx + (dx * Math.cos(b) + dy * Math.sin(b)) / s, cy + (-dx * Math.sin(b) + dy * Math.cos(b)) / s];
};

// A função que leva lon/lat à posição na tela para uma câmera.
export const criarProjetor = (cam: Camera, largura: number, altura: number): Projetor => {
  const m = criarProjetorMundo(cam, largura, altura);
  return (lon, lat) => {
    const [x, y] = paraMundo(lon, lat);
    return m(x, y);
  };
};

// Gerador de caminho SVG do d3 que usa o nosso projetor (planar: sem o recorte e a
// reamostragem esféricos do d3, e sem depender do sentido dos anéis do GeoJSON).
export const criarCaminho = (projetar: Projetor) =>
  geoPath(
    geoTransform({
      point(lon: number, lat: number) {
        const [x, y] = projetar(lon, lat);
        this.stream.point(x, y);
      },
    }),
  );

export type Caixa = [LonLat, LonLat]; // [[oeste, sul], [leste, norte]]

// A câmera que enquadra uma caixa geográfica. `deslocar` empurra o assunto na tela
// (px), para abrir espaço a um texto ou card do lado.
export const enquadrar = (
  caixa: Caixa,
  largura: number,
  altura: number,
  opcoes: { margem?: number; bearing?: number; deslocar?: Ponto } = {},
): Camera => {
  const { margem = 80, bearing = 0, deslocar = [0, 0] } = opcoes;
  const [x0, y1] = paraMundo(caixa[0][0], caixa[0][1]);
  const [x1, y0] = paraMundo(caixa[1][0], caixa[1][1]);
  const escala = Math.min((largura - 2 * margem) / (x1 - x0), (altura - 2 * margem) / (y1 - y0));
  const zoom = Math.log2(escala / TILE);
  const s = TILE * 2 ** zoom;
  const [lon, lat] = deMundo((x0 + x1) / 2 - deslocar[0] / s, (y0 + y1) / 2 - deslocar[1] / s);
  return { lon, lat, zoom, bearing };
};
