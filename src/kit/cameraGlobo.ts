import { geoProjection, geoRotation, type GeoProjection } from "d3-geo";
import { Easing } from "remotion";
import { voo } from "../base/geo/camera";

// ---------------------------------------------------------------------------
// A câmera do GLOBO: o planeta visto de uma câmera de verdade (perspectiva, como o Google
// Earth), para os vídeos que viajam pelo mundo. Do espaço até um deserto sem troca de mapa:
// é a mesma projeção o tempo todo, só a distância da câmera muda.
//
// A câmera é descrita como a do motor plano (lon/lat/zoom/bearing), para as peças do kit
// continuarem valendo: `zoom` é o equivalente Web Mercator no centro (o mundo mede
// 256·2^zoom px), e a DISTÂNCIA da câmera sai dele com uma lente fixa — longe, o planeta é
// quase uma esfera ortográfica; perto, o chão fica plano.
//
// A mesma conta alimenta o <Globo> (WebGL, a imagem) e o d3 (as linhas e os rótulos): nada
// escorrega entre a imagem e o desenho.
// ---------------------------------------------------------------------------

export type CameraGlobo = {
  lon: number;
  lat: number;
  zoom: number;
  bearing?: number; // giro da tela, em graus
  // onde o ponto (lon, lat) cai na tela (px); padrão: o centro
  alvo?: [number, number];
};

export type ChaveGlobo = {
  quadro: number;
  camera: CameraGlobo;
  easing?: (t: number) => number; // curva do trecho que CHEGA a esta chave
  rho?: number; // van Wijk: maior = o voo sobe mais no meio (viagens longas)
};

// Um recorte de satélite (Web Mercator) que o globo sabe onde pôr: `caixa` em coordenadas de
// mundo 0–1 [x0, y0, x1, y1] (y para baixo, como os tiles).
export type Mosaico = { id: string; src: string; caixa: [number, number, number, number]; z: number };

// A lente: distância focal em px. Define o quanto o globo "curva" quando a câmera desce.
export const LENTE = 2600;

const RAD = Math.PI / 180;

// px por radiano no centro da tela
export const escalaDoZoom = (zoom: number) => (256 * 2 ** zoom) / (2 * Math.PI);
// a distância da câmera ao centro da Terra, em raios
export const distanciaDoZoom = (zoom: number) => 1 + LENTE / escalaDoZoom(zoom);

// Perspectiva vertical (a "satellite" do d3-geo-projection, sem inclinação).
const perspectiva = (P: number) => {
  const f = (x: number, y: number): [number, number] => {
    const cy = Math.cos(y);
    const k = (P - 1) / (P - cy * Math.cos(x));
    return [k * cy * Math.sin(x), k * Math.sin(y)];
  };
  f.invert = (x: number, y: number): [number, number] => {
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const sinc = (P - Math.sqrt(Math.max(0, 1 - (r2 * (P + 1)) / (P - 1)))) / ((P - 1) / r + r / (P - 1));
    return [Math.atan2(x * sinc, r * Math.sqrt(1 - sinc * sinc)), r ? Math.asin((y * sinc) / r) : 0];
  };
  return f;
};

export type EstadoGlobo = {
  camera: CameraGlobo;
  escala: number; // px por radiano no centro
  distancia: number; // P, em raios
  alvo: [number, number];
  // colunas: os eixos do referencial da câmera, em coordenadas do mundo (para o shader)
  matriz: number[];
  projecao: GeoProjection;
  // um ponto está do lado de cá do planeta?
  visivel: (lon: number, lat: number) => boolean;
};

const cart = ([lon, lat]: [number, number]) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

export const estadoDoGlobo = (cam: CameraGlobo, largura: number, altura: number): EstadoGlobo => {
  const escala = escalaDoZoom(cam.zoom);
  const P = distanciaDoZoom(cam.zoom);
  const alvo = cam.alvo ?? [largura / 2, altura / 2];
  const giro: [number, number, number] = [-cam.lon, -cam.lat, cam.bearing ?? 0];
  const horizonte = Math.acos(1 / P) / RAD;
  const projecao = geoProjection(perspectiva(P))
    .scale(escala)
    .translate(alvo)
    .rotate(giro)
    .clipAngle(horizonte - 0.05)
    .precision(0.4);
  const inv = geoRotation(giro).invert;
  const matriz = [...cart(inv([0, 0])), ...cart(inv([90, 0])), ...cart(inv([0, 90]))];
  const centro = cart([cam.lon, cam.lat]);
  const limite = 1 / P;
  const visivel = (lon: number, lat: number) => {
    const v = cart([lon, lat]);
    return v[0] * centro[0] + v[1] * centro[1] + v[2] * centro[2] > limite;
  };
  return { camera: cam, escala, distancia: P, alvo, matriz, projecao, visivel };
};

// ---------------------------------------------------------------------------
// O percurso: entre duas chaves, o voo de van Wijk sobre a ESFERA — o centro anda pelo arco
// de círculo máximo e a largura da vista (em radianos) sobe e desce junto, com velocidade
// percebida constante. Numa viagem longa (Saara → Ásia) a câmera naturalmente se afasta no
// meio do caminho: é o "atravessar o planeta".
// ---------------------------------------------------------------------------

export const CURVA_GLOBO = {
  cinema: Easing.bezier(0.65, 0, 0.35, 1),
  // sai quase parada e acelera (a câmera "decidindo")
  arrancada: Easing.bezier(0.7, 0, 0.2, 1),
  pouso: Easing.bezier(0.25, 0.1, 0.25, 1),
  // quase linear: a aproximação lentíssima do espaço
  deriva: Easing.bezier(0.3, 0, 0.7, 1),
};

const slerp = (a: number[], b: number[], t: number) => {
  const d = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  if (d < 1e-9) return a;
  const s = Math.sin(d);
  const ka = Math.sin((1 - t) * d) / s;
  const kb = Math.sin(t * d) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
};

export const cameraGloboNoQuadro = (chaves: ChaveGlobo[], quadro: number, largura: number, altura: number): CameraGlobo => {
  if (quadro <= chaves[0].quadro) return chaves[0].camera;
  const ultima = chaves[chaves.length - 1];
  if (quadro >= ultima.quadro) return ultima.camera;
  const i = chaves.findIndex((k) => k.quadro > quadro);
  const a = chaves[i - 1].camera;
  const b = chaves[i].camera;
  const t = (chaves[i].easing ?? CURVA_GLOBO.cinema)((quadro - chaves[i - 1].quadro) / (chaves[i].quadro - chaves[i - 1].quadro));
  const va = cart([a.lon, a.lat]);
  const vb = cart([b.lon, b.lat]);
  const d = Math.acos(Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
  const wa = largura / escalaDoZoom(a.zoom);
  const wb = largura / escalaDoZoom(b.zoom);
  const [u, , w] = voo([0, 0, wa], [d, 0, wb], chaves[i].rho ?? 1.2)(t);
  const v = slerp(va, vb, d > 1e-9 ? u / d : t);
  const aa = a.alvo ?? [largura / 2, altura / 2];
  const ab = b.alvo ?? [largura / 2, altura / 2];
  return {
    lon: Math.atan2(v[1], v[0]) / RAD,
    lat: Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD,
    zoom: Math.log2((largura / w) * 2 * Math.PI / 256),
    bearing: (a.bearing ?? 0) + ((b.bearing ?? 0) - (a.bearing ?? 0)) * t,
    alvo: [aa[0] + (ab[0] - aa[0]) * t, aa[1] + (ab[1] - aa[1]) * t],
  };
};

// ---------------------------------------------------------------------------
// VIAGEM COM ESCALAS: do primeiro ao último ponto passando pelos do meio SEM parar neles
// (Brasil → Nordeste → Maranhão). Cada trecho é um voo de van Wijk; a viagem inteira segue
// UMA curva (`curva`), repartida pelo comprimento de cada voo — a velocidade percebida não
// quebra nas escalas. Devolve as chaves (o primeiro ponto fica em `inicio`).
// ---------------------------------------------------------------------------
const inverter = (curva: (t: number) => number, y: number) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    if (curva(m) < y) a = m;
    else b = m;
  }
  return (a + b) / 2;
};

export const viagemGlobo = (
  paradas: CameraGlobo[],
  inicio: number,
  fim: number,
  { curva = CURVA_GLOBO.cinema, rho = 1.2, largura = 1080 }: { curva?: (t: number) => number; rho?: number; largura?: number } = {},
): ChaveGlobo[] => {
  const comp = paradas.slice(1).map((b, i) => {
    const a = paradas[i];
    const va = cart([a.lon, a.lat]);
    const vb = cart([b.lon, b.lat]);
    const d = Math.acos(Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
    return Math.max(1e-6, voo([0, 0, largura / escalaDoZoom(a.zoom)], [d, 0, largura / escalaDoZoom(b.zoom)], rho).S);
  });
  const total = comp.reduce((x, y) => x + y, 0);
  const marcos = [0];
  for (const c of comp) marcos.push(marcos[marcos.length - 1] + c / total);
  const tempos = marcos.map((m, i) => (i === 0 ? 0 : i === marcos.length - 1 ? 1 : inverter(curva, m)));
  const chaves: ChaveGlobo[] = [{ quadro: inicio, camera: paradas[0] }];
  for (let i = 1; i < paradas.length; i++) {
    const [t0, t1] = [tempos[i - 1], tempos[i]];
    const [m0, m1] = [marcos[i - 1], marcos[i]];
    chaves.push({
      quadro: inicio + (fim - inicio) * t1,
      camera: paradas[i],
      rho,
      easing: (t: number) => (curva(t0 + t * (t1 - t0)) - m0) / (m1 - m0),
    });
  }
  return chaves;
};

// Chaves de uma câmera descrita por uma FUNÇÃO do quadro (a câmera que acompanha uma rota):
// uma chave por quadro, entre elas a interpolação é quase nula.
export const chavesDeFuncao = (inicio: number, fim: number, camera: (quadro: number) => CameraGlobo): ChaveGlobo[] =>
  Array.from({ length: Math.round(fim - inicio) + 1 }, (_, i) => ({ quadro: inicio + i, camera: camera(inicio + i), easing: (t: number) => t, rho: 1 }));

// Deriva lenta (câmera na mão): um sopro de giro e de zoom, determinístico.
export const derivaGlobo = (cam: CameraGlobo, quadro: number, forca = 1): CameraGlobo => {
  if (!forca) return cam;
  const grau = 1 / (escalaDoZoom(cam.zoom) * RAD); // graus por px
  return {
    ...cam,
    lon: cam.lon + forca * grau * (8 * Math.sin(quadro / 97) + 4 * Math.sin(quadro / 41 + 1.3)),
    lat: cam.lat + forca * grau * (6 * Math.cos(quadro / 113) + 3 * Math.sin(quadro / 53 + 0.4)),
    zoom: cam.zoom + forca * 0.012 * Math.sin(quadro / 131),
    bearing: (cam.bearing ?? 0) + forca * 0.3 * Math.sin(quadro / 157),
  };
};

// ---------------------------------------------------------------------------
// Um ponto NO AR (a ISS, uma nave descendo): acima do chão `km` quilômetros. Devolve a
// posição na tela e se ele é visível (não está atrás do planeta nem atrás da câmera).
// ---------------------------------------------------------------------------
export const RAIO_DA_TERRA = 6371;

export const projetarNoAr = (g: EstadoGlobo, lon: number, lat: number, km: number): { x: number; y: number; visivel: boolean } => {
  const r = 1 + km / RAIO_DA_TERRA;
  const w = cart([lon, lat]).map((c) => c * r);
  const m = g.matriz;
  // referencial da câmera: as colunas de `matriz` são os eixos (x = para a câmera)
  const x = w[0] * m[0] + w[1] * m[1] + w[2] * m[2];
  const y = w[0] * m[3] + w[1] * m[4] + w[2] * m[5];
  const z = w[0] * m[6] + w[1] * m[7] + w[2] * m[8];
  const P = g.distancia;
  if (x >= P) return { x: -99999, y: -99999, visivel: false };
  const k = (P - 1) / (P - x);
  const sx = g.alvo[0] + g.escala * k * y;
  const sy = g.alvo[1] - g.escala * k * z;
  // atrás do planeta? o raio câmera → ponto corta a esfera antes de chegar nele
  const d = [x - P, y, z];
  const a = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  const b = 2 * P * d[0];
  const c = P * P - 1;
  const disc = b * b - 4 * a * c;
  const tapado = disc > 0 && (-b - Math.sqrt(disc)) / (2 * a) < 1 - 1e-6;
  return { x: sx, y: sy, visivel: !tapado };
};

// Distância em km entre dois pontos (círculo máximo).
export const distanciaKm = (a: [number, number], b: [number, number]) => {
  const va = cart(a);
  const vb = cart(b);
  return RAIO_DA_TERRA * Math.acos(Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
};
