import { Easing } from "remotion";
import { deMundo, paraMundo, TILE, type Camera } from "./projecao";

// ---------------------------------------------------------------------------
// Interpolação da câmera.
//
// Entre duas vistas, a câmera faz o "voo" de van Wijk & Nuij (o mesmo do d3.zoom e do
// flyTo dos mapas web): o zoom e o deslocamento andam juntos de forma que a velocidade
// PERCEBIDA na tela seja constante. Interpolar centro e zoom separados faz o alvo
// "nadar" pela tela; assim, ele chega em linha e sem tranco.
//
// Por cima do percurso vai uma deriva lenta e contínua (respiração de câmera na mão), para
// a câmera nunca ficar parada.
// ---------------------------------------------------------------------------

export type Chave = {
  quadro: number;
  camera: Camera;
  // Curva do trecho que CHEGA a esta chave.
  easing?: (t: number) => number;
  // rho do van Wijk: maior = o voo se afasta mais no meio do caminho.
  rho?: number;
};

export const EASE = {
  cinema: Easing.bezier(0.65, 0, 0.35, 1),
  // Começa quase parado (câmera "decidindo") e acelera para o alvo.
  arrancada: Easing.bezier(0.7, 0, 0.2, 1),
  pouso: Easing.bezier(0.25, 0.1, 0.25, 1),
  suave: Easing.bezier(0.45, 0, 0.55, 1),
};

export type Vista = [number, number, number]; // centro x, centro y (mundo 0–1), largura visível (mundo)

const vista = (c: Camera, largura: number): Vista => {
  const [x, y] = paraMundo(c.lon, c.lat);
  return [x, y, largura / (TILE * 2 ** c.zoom)];
};

// Van Wijk & Nuij, "Smooth and efficient zooming and panning" (2003) — a mesma conta do
// d3-interpolate/zoom.
export const voo = (a: Vista, b: Vista, rho: number) => {
  const [ux0, uy0, w0] = a;
  const [ux1, uy1, w1] = b;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  if (d2 < 1e-18) {
    const S = Math.log(w1 / w0) / rho;
    // `S`: o comprimento do voo (para dividir uma viagem com escalas pelo caminho percorrido)
    return Object.assign((t: number): Vista => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)], { S: Math.abs(S) });
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  const fn = (t: number): Vista => {
    const s = t * S;
    const coshr0 = Math.cosh(r0);
    const u = (w0 / (rho2 * d1)) * (coshr0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
    return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(rho * s + r0)];
  };
  return Object.assign(fn, { S: Math.abs(S) });
};

export const cameraNoQuadro = (chaves: Chave[], quadro: number, largura: number): Camera => {
  if (quadro <= chaves[0].quadro) return chaves[0].camera;
  const ultima = chaves[chaves.length - 1];
  if (quadro >= ultima.quadro) return ultima.camera;
  const i = chaves.findIndex((k) => k.quadro > quadro);
  const a = chaves[i - 1];
  const b = chaves[i];
  const t = (b.easing ?? EASE.cinema)((quadro - a.quadro) / (b.quadro - a.quadro));
  const [x, y, w] = voo(vista(a.camera, largura), vista(b.camera, largura), b.rho ?? 1.1)(t);
  const [lon, lat] = deMundo(x, y);
  return {
    lon,
    lat,
    zoom: Math.log2(largura / (w * TILE)),
    bearing: a.camera.bearing + (b.camera.bearing - a.camera.bearing) * t,
  };
};

// Deriva contínua: poucos px de passeio e um sopro de zoom, em senos de períodos
// diferentes (não se repete de forma perceptível). Determinística: só depende do quadro.
export const deriva = (cam: Camera, quadro: number, forca = 1): Camera => {
  const s = TILE * 2 ** cam.zoom;
  const px = 10 * Math.sin(quadro / 97) + 5 * Math.sin(quadro / 41 + 1.3);
  const py = 7 * Math.cos(quadro / 113) + 4 * Math.sin(quadro / 53 + 0.4);
  const [x, y] = paraMundo(cam.lon, cam.lat);
  const [lon, lat] = deMundo(x + (px * forca) / s, y + (py * forca) / s);
  return {
    lon,
    lat,
    // (limitada: um avanço linear no tempo se acumularia e desenquadraria o fim do vídeo)
    zoom: cam.zoom + forca * (0.012 * Math.sin(quadro / 131) + 0.03 * Math.sin(quadro / 233)),
    bearing: cam.bearing + forca * 0.35 * Math.sin(quadro / 157),
  };
};

// A câmera final de um quadro (percurso + deriva). O render e o script que baixa os tiles
// usam ESTA função — é o que garante que todo tile que aparece na tela foi baixado.
export const cameraDoVideo = (chaves: Chave[], quadro: number, largura: number, forca = 1): Camera =>
  deriva(cameraNoQuadro(chaves, quadro, largura), quadro, forca);
