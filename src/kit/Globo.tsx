import { geoPath } from "d3-geo";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { ProvedorDoMapa, type Mapa } from "../base/componentes/MapCamera";
import { cameraGloboNoQuadro, derivaGlobo, estadoDoGlobo, type CameraGlobo as CameraGloboTipo, type ChaveGlobo, type EstadoGlobo, type Mosaico } from "./cameraGlobo";

// quantos quadros à frente o globo olha para pré-carregar os recortes (~1 s a 30 fps)
const ADIANTE = 30;

// ---------------------------------------------------------------------------
// O GLOBO: o planeta em WebGL, visto de uma câmera de verdade — satélite, luz do Sol com
// dia e noite, atmosfera no limbo, nuvens e as luzes das cidades no lado escuro. Do espaço
// até um deserto numa tacada só (a câmera só muda de distância).
//
//   <CameraGlobo chaves={…}>          ← a câmera (percurso + deriva) para tudo o que vem dentro
//     <Globo mosaicos={…} luz={…} />  ← a imagem (WebGL)
//     <MapaSvg> RegiaoDestaque… </MapaSvg>   ← as peças do kit funcionam iguais
//   </CameraGlobo>
//
// A imagem vem de MOSAICOS Web Mercator (um do mundo inteiro e recortes mais finos onde a
// câmera desce); o shader usa sempre o mais fino que cobre o pixel, com a borda esfumada.
// O render precisa de WebGL2: --gl=angle (o render:lm e a folha já passam).
// ---------------------------------------------------------------------------

// `adiante`: onde a câmera vai estar daqui a ~1 s (o globo pré-carrega os recortes de lá)
type Globo = EstadoGlobo & { quadro: number; adiante: CameraGloboTipo };
const ContextoGlobo = createContext<Globo | null>(null);

export const useGlobo = (): Globo => {
  const g = useContext(ContextoGlobo);
  if (!g) throw new Error("useGlobo fora de <CameraGlobo>");
  return g;
};

export const CameraGlobo: React.FC<{ chaves: ChaveGlobo[]; deriva?: number; children: React.ReactNode }> = ({ chaves, deriva = 1, children }) => {
  const quadro = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const valor = useMemo(() => {
    const cam = derivaGlobo(cameraGloboNoQuadro(chaves, quadro, width, height), quadro, deriva);
    const g = estadoDoGlobo(cam, width, height);
    const fora: [number, number] = [-99999, -99999];
    const mapa: Mapa = {
      camera: { lon: cam.lon, lat: cam.lat, zoom: cam.zoom, bearing: cam.bearing ?? 0 },
      projetar: (lon, lat) => (g.visivel(lon, lat) ? (g.projecao([lon, lat]) ?? fora) : fora),
      caminho: geoPath(g.projecao),
      largura: width,
      altura: height,
    };
    const adiante = cameraGloboNoQuadro(chaves, quadro + ADIANTE, width, height);
    return { globo: { ...g, quadro, adiante }, mapa };
  }, [chaves, quadro, width, height, deriva]);
  return (
    <ContextoGlobo.Provider value={valor.globo}>
      <ProvedorDoMapa value={valor.mapa}>
        <AbsoluteFill from={-8}>{children}</AbsoluteFill>
      </ProvedorDoMapa>
    </ContextoGlobo.Provider>
  );
};

// ---------------------------------------------------------------------------
// A imagem
// ---------------------------------------------------------------------------

export type LuzDoGlobo = {
  sol: [number, number]; // o ponto subsolar (lon, lat)
  dia?: number; // 0 = tudo iluminado por igual; 1 = dia e noite de verdade
  nuvens?: number; // opacidade das nuvens
  nuvensGiro?: number; // deslocamento das nuvens em longitude (graus)
  luzes?: number; // luzes das cidades no lado escuro
  atmosfera?: number;
  estrelas?: number;
  // a cor: exposição, saturação e um véu escuro (para destacar o que vem por cima)
  exposicao?: number;
  saturacao?: number;
  contraste?: number;
  gama?: number; // >1 aprofunda os meios-tons (areia clara demais), <1 abre
  veu?: number;
};

const MAX_RECORTES = 3;

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 cor;
uniform vec2 uTela; uniform vec2 uAlvo; uniform float uS; uniform float uP; uniform mat3 uM;
uniform sampler2D uBase;
uniform sampler2D uR0; uniform sampler2D uR1; uniform sampler2D uR2;
uniform vec4 uCaixa[${MAX_RECORTES}]; uniform float uLiga[${MAX_RECORTES}];
uniform sampler2D uNuvens; uniform sampler2D uLuzes;
uniform vec3 uSol; uniform float uDia; uniform float uNuv; uniform float uNuvGiro; uniform float uLuz;
uniform float uAtm; uniform float uEst; uniform float uExp; uniform float uSat; uniform float uVeu; uniform float uCon; uniform float uGama;
uniform vec2 uEstDesloc;
// de perto (uPlano = 1) o chão é plano na tela: onde o alvo cai no mundo (uM0) e em cada
// recorte (uUV0), e quanto cada pixel anda (uJx, uJy) — calculados no JS em precisão dupla
uniform float uPlano; uniform vec2 uM0; uniform vec2 uJx; uniform vec2 uJy; uniform vec2 uUV0[${MAX_RECORTES}];
const float PI = 3.14159265359;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

vec4 amostra(sampler2D t, vec2 uv, vec2 gx, vec2 gy){ return textureGrad(t, uv, gx, gy); }

vec3 recorte(sampler2D t, vec4 cx, float liga, vec2 uv0, vec2 m, vec2 d, vec2 gx, vec2 gy, vec3 atual){
  if (liga < 0.001) return atual;
  vec2 tam = cx.zw - cx.xy;
  // de perto, a coordenada vem do alvo (precisa) mais o deslocamento; de longe, da esfera
  vec2 uv = uPlano > 0.5 ? uv0 + (uJx * d.x + uJy * d.y) / tam : (m - cx.xy) / tam;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return atual;
  float borda = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float w = smoothstep(0.0, 0.12, borda) * liga;
  return mix(atual, amostra(t, uv, gx / tam, gy / tam).rgb, w);
}

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uTela.y - gl_FragCoord.y);
  vec2 r = vec2(frag.x - uAlvo.x, uAlvo.y - frag.y) / uS;
  float r2 = dot(r, r);
  float rho = sqrt(r2);
  float rh = sqrt((uP - 1.0) / (uP + 1.0));
  float px = 1.0 / uS;
  float disc = 1.0 - r2 * (uP + 1.0) / (uP - 1.0);

  // --- o espaço: estrelas e o brilho da atmosfera além do limbo
  vec3 espaco = vec3(0.004, 0.006, 0.012);
  vec2 ce = floor((frag + uEstDesloc) / 2.0);
  float h = hash(ce);
  float estrela = step(0.9975, h) * pow(hash(ce + 7.1), 3.0);
  espaco += vec3(0.85, 0.9, 1.0) * estrela * uEst;
  // o ponto do limbo mais próximo, no mundo (para saber se o Sol o ilumina)
  vec2 dir = rho > 0.0 ? r / rho : vec2(1.0, 0.0);
  float sh = sqrt(1.0 - 1.0 / (uP * uP));
  vec3 limbo = uM * vec3(1.0 / uP, sh * dir.x, sh * dir.y);
  float solNoLimbo = smoothstep(-0.35, 0.45, dot(limbo, uSol));
  float esp = max(rh * 0.045, 3.0 * px);
  float fora = max(rho - rh, 0.0);
  float halo = exp(-fora / esp) * 0.9 + exp(-fora / (esp * 4.0)) * 0.25;
  vec3 corAtm = mix(vec3(0.05, 0.10, 0.25), vec3(0.35, 0.62, 1.0), solNoLimbo);
  espaco += corAtm * halo * uAtm * (0.25 + 0.75 * solNoLimbo);

  if (disc < 0.0) { cor = vec4(mix(espaco, vec3(0.0), uVeu * 0.6), 1.0); return; }

  // --- o chão: inverte a perspectiva → ponto na esfera → lon/lat
  float sinc = (uP - sqrt(disc)) / ((uP - 1.0) / max(rho, 1e-9) + rho / (uP - 1.0));
  float lam = atan(r.x * sinc, rho * sqrt(max(0.0, 1.0 - sinc * sinc)));
  float phi = rho > 0.0 ? asin(clamp(r.y * sinc / rho, -1.0, 1.0)) : 0.0;
  vec3 vc = vec3(cos(phi) * cos(lam), cos(phi) * sin(lam), sin(phi));
  vec3 n = normalize(uM * vc);
  float lon = atan(n.y, n.x);
  float lat = asin(clamp(n.z, -1.0, 1.0));

  float latC = clamp(lat, -1.4844, 1.4844);
  vec2 m = vec2(lon / (2.0 * PI) + 0.5, 0.5 - log(tan(PI / 4.0 + latC / 2.0)) / (2.0 * PI));
  vec2 gx = dFdx(m); vec2 gy = dFdy(m);
  gx.x -= round(gx.x); gy.x -= round(gy.x);
  // De perto, as funções trigonométricas da GPU (32 bits) não têm precisão para o satélite de
  // 2 m: a imagem "rasga" em faixas. Lá o chão é plano na tela, então a coordenada é o alvo
  // mais o deslocamento do pixel (e o gradiente é exato).
  vec2 d = frag - uAlvo;
  if (uPlano > 0.5) { m = uM0 + uJx * d.x + uJy * d.y; gx = uJx; gy = uJy; }
  vec3 c = amostra(uBase, m, gx, gy).rgb;
  c = recorte(uR0, uCaixa[0], uLiga[0], uUV0[0], m, d, gx, gy, c);
  c = recorte(uR1, uCaixa[1], uLiga[1], uUV0[1], m, d, gx, gy, c);
  c = recorte(uR2, uCaixa[2], uLiga[2], uUV0[2], m, d, gx, gy, c);
  // acima de ~85° o Mercator acaba: o gelo do mar (norte) e o da Antártida (sul), com uma
  // transição longa e um pouco de textura (sem o "disco" branco no polo)
  float polo = smoothstep(1.46, 1.52, abs(lat));
  // a cor da própria imagem na borda do Mercator, bem desfocada (um nível alto do mipmap):
  // o polo continua o que está em volta, sem disco
  vec3 gelo = textureLod(uBase, vec2(m.x, lat > 0.0 ? 0.004 : 0.996), 5.5).rgb;
  c = mix(c, gelo, polo);

  // a cor do vídeo: saturação e exposição
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(lum), c, uSat) * uExp;
  // gama só na luminância (aprofunda sem mudar o tom)
  float lg = max(dot(c, vec3(0.299, 0.587, 0.114)), 1e-4);
  c *= pow(lg, uGama) / lg;
  c = max((c - 0.42) * uCon + 0.42, 0.0);

  // --- luz: dia e noite
  vec3 cam = uM * vec3(uP, 0.0, 0.0);
  vec3 olhar = normalize(cam - n);
  float ns = dot(n, uSol);
  float dia = smoothstep(-0.12, 0.35, ns);
  float luzDoDia = mix(1.0, mix(0.035, 1.0, dia) * (0.8 + 0.25 * max(ns, 0.0)), uDia);
  vec3 res = c * luzDoDia;
  // o mar brilha onde reflete o Sol
  float mar = smoothstep(0.03, 0.12, c.b - c.r) * smoothstep(0.35, 0.1, lum);
  float brilho = pow(max(dot(reflect(-uSol, n), olhar), 0.0), 90.0);
  res += vec3(1.0, 0.92, 0.78) * brilho * mar * dia * uDia * 0.16;

  // nuvens (equirretangulares)
  vec2 e = vec2(fract(lon / (2.0 * PI) + 0.5 + uNuvGiro / 360.0), 0.5 - lat / PI);
  vec2 ex = vec2(dFdx(e.x), dFdx(e.y)); vec2 ey = vec2(dFdy(e.x), dFdy(e.y));
  ex.x -= round(ex.x); ey.x -= round(ey.x);
  float nuv = smoothstep(0.12, 0.85, textureGrad(uNuvens, e, ex, ey).r) * uNuv * smoothstep(1.45, 1.25, abs(lat));
  res = mix(res, vec3(0.97) * mix(1.0, mix(0.02, 1.0, dia), uDia), nuv * 0.85);

  // luzes das cidades no lado escuro
  vec2 el = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);
  vec2 lx = vec2(dFdx(el.x), dFdx(el.y)); vec2 ly = vec2(dFdy(el.x), dFdy(el.y));
  lx.x -= round(lx.x); ly.x -= round(ly.x);
  float cidade = textureGrad(uLuzes, el, lx, ly).r;
  res += vec3(1.0, 0.72, 0.38) * pow(cidade, 1.6) * (1.0 - dia) * uLuz * uDia * (1.0 - nuv) * 1.4;

  // atmosfera: a névoa azul que engrossa rasante ao limbo
  float rasante = 1.0 - max(dot(n, olhar), 0.0);
  float nevoa = pow(rasante, 2.6) * uAtm;
  res = mix(res, corAtm * (0.35 + 0.9 * dia), clamp(nevoa * 0.75, 0.0, 1.0));

  // ombro nos altos (o deserto não estoura: a areia clara continua com textura)
  res = mix(res, 0.75 + 0.25 * (1.0 - exp(-(res - 0.75) * 3.0)) , step(0.75, res));

  // antisserrilhado do limbo
  float borda = smoothstep(rh, rh - 1.5 * px, rho);
  res = mix(espaco, res, borda);
  cor = vec4(mix(res, vec3(0.0), uVeu), 1.0);
}`;

const carregar = (src: string) =>
  new Promise<HTMLImageElement>((ok, erro) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => erro(new Error(`Globo: não carregou ${src}`));
    img.src = staticFile(src);
  });

type Gl = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  tex: Record<string, WebGLTexture>;
  uso: Record<string, number>;
  carregando: Set<string>;
  u: (nome: string) => WebGLUniformLocation | null;
};

const iniciar = (canvas: HTMLCanvasElement, imagens: Record<string, HTMLImageElement>): Gl => {
  const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false });
  if (!gl) throw new Error("Globo: sem WebGL2 (renderize com --gl=angle)");
  const shader = (tipo: number, fonte: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`Globo: shader\n${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`Globo: programa\n${gl.getProgramInfoLog(prog)}`);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex: Record<string, WebGLTexture> = {};
  for (const [id, img] of Object.entries(imagens)) tex[id] = criarTextura(gl, id, img);
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (nome: string) => {
    if (!cache.has(nome)) cache.set(nome, gl.getUniformLocation(prog, nome));
    return cache.get(nome)!;
  };
  // o último quadro em que cada recorte foi desenhado (para descartar os que saíram de cena)
  const uso: Record<string, number> = {};
  return { gl, prog, tex, u, uso, carregando: new Set<string>() };
};

// MEMÓRIA: no máximo isto de recortes na placa de vídeo ao mesmo tempo (além do planeta, das
// nuvens e das luzes). Uma pirâmide de satélite pesa centenas de MB se nada sai; os que não
// estão na tela e foram usados há mais tempo são apagados — se voltarem, são recarregados
// (o quadro espera, como na primeira vez).
const RECORTES_NA_MEMORIA = 6;
const descartar = (ctx: { gl: WebGL2RenderingContext; tex: Record<string, WebGLTexture>; uso: Record<string, number> }, naTela: Set<string>) => {
  const recortes = Object.keys(ctx.tex).filter((id) => !id.startsWith("__"));
  if (recortes.length <= RECORTES_NA_MEMORIA) return;
  const sobram = recortes.filter((id) => !naTela.has(id)).sort((a, b) => (ctx.uso[a] ?? -1) - (ctx.uso[b] ?? -1));
  for (const id of sobram.slice(0, recortes.length - RECORTES_NA_MEMORIA)) {
    ctx.gl.deleteTexture(ctx.tex[id]);
    delete ctx.tex[id];
    delete ctx.uso[id];
  }
};

const criarTextura = (gl: WebGL2RenderingContext, id: string, img: HTMLImageElement) => {
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // o mundo dá a volta em x; os recortes não
    const volta = id === "__base" || id === "__nuvens" || id === "__luzes";
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, volta ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  }
};

// Os recortes que valem para esta vista (no máximo MAX_RECORTES, o shader tem 3 vagas):
//  1. o FUNDO: o mais fino que cobre a vista inteira (sem ele, onde os recortes pequenos não
//     chegam aparece o planeta de baixa resolução — o "borrão" em volta de uma cidade);
//  2. nas vagas que sobram, os que acrescentam detalhe ao fundo: os mais finos primeiro (o
//     "fino útil" de cada um é limitado pelo zoom: um recorte muito mais fino que a tela não
//     vale mais que um pouco mais fino), pesando quanto da tela cada um cobre.
// O shader aplica na ordem: o fundo primeiro, os mais finos por cima.
const TILE_MUNDO = 256;
//  `finoAte`: um recorte PARCIAL (que não cobre a tela toda) só entra se for no máximo isto de
//     níveis mais fino que a tela — muito mais fino não acrescenta detalhe que se veja e, no mar,
//     a cor do oceano muda de um nível do satélite para outro: a borda vira um retângulo escuro.
export const recortesDaVista = (mosaicos: Mosaico[], lon: number, lat: number, zoom: number, largura: number, altura: number, alvo: [number, number] = [largura / 2, altura / 2], giro = 0, finoAte = 5) => {
  const mx = (lon + 180) / 360;
  const r = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  const my = 0.5 - Math.log(Math.tan(Math.PI / 4 + r / 2)) / (2 * Math.PI);
  // a tela de verdade no mundo: os 4 cantos em volta do alvo, girados com a câmera (+10% de
  // folga; de longe, com o planeta curvo, a folga cresce)
  const px = (zoom < 6 ? 1.6 : 1.1) / (TILE_MUNDO * 2 ** zoom);
  const a = (giro * Math.PI) / 180;
  const cantos = [[0, 0], [largura, 0], [0, altura], [largura, altura]].map(([x, y]) => {
    const dx = x - alvo[0];
    const dy = y - alvo[1];
    return [mx + (dx * Math.cos(a) - dy * Math.sin(a)) * px, my + (dx * Math.sin(a) + dy * Math.cos(a)) * px];
  });
  const vista = [Math.min(...cantos.map((c) => c[0])), Math.min(...cantos.map((c) => c[1])), Math.max(...cantos.map((c) => c[0])), Math.max(...cantos.map((c) => c[1]))];
  const area = (vista[2] - vista[0]) * (vista[3] - vista[1]) || 1;
  const cobre = (m: Mosaico) => {
    const w = Math.min(m.caixa[2], vista[2]) - Math.max(m.caixa[0], vista[0]);
    const h = Math.min(m.caixa[3], vista[3]) - Math.max(m.caixa[1], vista[1]);
    return w > 0 && h > 0 ? (w * h) / area : 0;
  };
  const candidatos = mosaicos
    .filter((m) => m.z <= zoom + 5)
    .map((m) => ({ m, util: Math.min(m.z, zoom + 1.5), c: cobre(m) }))
    .filter((x) => x.c > 0);
  const fundo = candidatos.filter((x) => x.c >= 0.999).sort((a, b) => b.util - a.util || a.m.z - b.m.z)[0];
  // um recorte que cobre um canto da tela vale menos que um que cobre quase tudo
  const valor = (x: { util: number; c: number }) => x.util + 0.5 * Math.log2(Math.max(x.c, 1e-4));
  const finos = candidatos.filter((x) => x !== fundo && x.m.z <= zoom + finoAte && (!fundo || x.util > fundo.util)).sort((a, b) => valor(b) - valor(a));
  return [...(fundo ? [fundo] : []), ...finos]
    .slice(0, MAX_RECORTES)
    .sort((a, b) => a.util - b.util || b.c - a.c)
    .map((x) => x.m);
};

// De perto (zoom ≥ 12,9, uma vista de ≲ 25 km) o chão é plano na tela: a distorção da
// perspectiva e a variação da escala do Mercator ficam abaixo de ~1 px nos cantos. O mapeamento pixel →
// mundo vira afim: o alvo (m0) e o passo de um pixel em x e em y, tirados da própria projeção
// (a mesma do d3: as linhas do mapa continuam em cima da imagem).
const ZOOM_PLANO = 12.9;
const mercator = (lon: number, lat: number): [number, number] => {
  const r = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  return [lon / 360 + 0.5, 0.5 - Math.log(Math.tan(Math.PI / 4 + r / 2)) / (2 * Math.PI)];
};
const planoDaVista = (g: Globo) => {
  if (g.camera.zoom < ZOOM_PLANO || !g.projecao.invert) return null;
  const [ax, ay] = g.alvo;
  const h = 64;
  const em = (dx: number, dy: number) => {
    const p = g.projecao.invert!([ax + dx, ay + dy]);
    return p ? mercator(p[0], p[1]) : null;
  };
  const [c, xa, xb, ya, yb] = [em(0, 0), em(-h, 0), em(h, 0), em(0, -h), em(0, h)];
  if (!c || !xa || !xb || !ya || !yb) return null;
  return {
    m0: c,
    jx: [(xb[0] - xa[0]) / (2 * h), (xb[1] - xa[1]) / (2 * h)] as [number, number],
    jy: [(yb[0] - ya[0]) / (2 * h), (yb[1] - ya[1]) / (2 * h)] as [number, number],
  };
};

const cartesiano = ([lon, lat]: [number, number]) => {
  const a = (lon * Math.PI) / 180;
  const b = (lat * Math.PI) / 180;
  return [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)];
};

export const Globo: React.FC<{
  mundo: string; // o mosaico do mundo inteiro (Web Mercator, 0–1 nos dois eixos)
  mosaicos?: Mosaico[]; // recortes mais finos
  nuvens?: string; // equirretangular
  luzes?: string; // equirretangular
  luz: LuzDoGlobo;
  finoAte?: number; // recortes parciais no máximo isto de níveis mais finos que a tela (ver recortesDaVista)
  // BORRÃO RADIAL dos mergulhos (0–1; o mesmo do kit/BorraoRadial, mas no planeta): cópias da
  // imagem empilhadas, cada uma um pouco maior a partir do `centroDoBorrao` (px), opacidade 1/(i+1).
  // Feito num canvas 2D por cima do WebGL (uma imagem só, sem desenhar o planeta de novo).
  borrao?: number;
  alcanceDoBorrao?: number;
  centroDoBorrao?: [number, number];
}> = ({ mundo, mosaicos = [], nuvens, luzes, luz, finoAte = 5, borrao = 0, alcanceDoBorrao = 0.08, centroDoBorrao }) => {
  const g = useGlobo();
  const { width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const refBorrao = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<Gl | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [pronto, setPronto] = useState(false);
  const [espera] = useState(() => delayRender("Globo: carregando as texturas", { timeoutInMilliseconds: 120000 }));

  useLayoutEffect(() => {
    const lista: [string, string][] = [["__base", mundo]];
    if (nuvens) lista.push(["__nuvens", nuvens]);
    if (luzes) lista.push(["__luzes", luzes]);
    Promise.all(lista.map(([id, src]) => carregar(src).then((img) => [id, img] as const)))
      .then((pares) => {
        glRef.current = iniciar(ref.current!, Object.fromEntries(pares));
        setPronto(true);
        continueRender(espera);
      })
      .catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // os recortes carregam quando a câmera chega perto deles (cada aba do render só carrega os
  // do trecho que desenha): o quadro espera a imagem
  const ativos = recortesDaVista(mosaicos, g.camera.lon, g.camera.lat, g.camera.zoom, width, height, g.alvo, g.camera.bearing ?? 0, finoAte);
  // os que vão ser precisos daqui a ~1 s: carregam em SEGUNDO PLANO (sem segurar o quadro), para a
  // câmera não travar quando chegar lá (no Studio, sobretudo nos voos que atravessam a pirâmide)
  const adiante = g.adiante;
  const proximos = recortesDaVista(mosaicos, adiante.lon, adiante.lat, adiante.zoom, width, height, adiante.alvo ?? [width / 2, height / 2], adiante.bearing ?? 0, finoAte);
  const chaveProximos = proximos.map((m) => m.id).join(",");
  useLayoutEffect(() => {
    const ctx = glRef.current;
    if (!pronto || !ctx) return;
    const faltam = proximos.filter((m) => !ctx.tex[m.id] && !ctx.carregando.has(m.id));
    for (const m of faltam) {
      ctx.carregando.add(m.id);
      carregar(m.src)
        .then((img) => {
          if (!ctx.tex[m.id]) ctx.tex[m.id] = criarTextura(ctx.gl, m.id, img);
          ctx.carregando.delete(m.id);
          descartar(ctx, new Set([...ativos, ...proximos].map((x) => x.id)));
        })
        .catch(() => ctx.carregando.delete(m.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, chaveProximos]);
  const faltando = pronto ? ativos.filter((m) => !glRef.current!.tex[m.id]) : [];
  const chaveFaltando = faltando.map((m) => m.id).join(",");
  const [, setCarregados] = useState(0);
  useLayoutEffect(() => {
    if (!faltando.length) return;
    const h = delayRender(`Globo: recortes ${chaveFaltando}`, { timeoutInMilliseconds: 120000 });
    Promise.all(faltando.map((m) => carregar(m.src).then((img) => [m.id, img] as const)))
      .then((pares) => {
        const ctx = glRef.current!;
        for (const [id, img] of pares) if (!ctx.tex[id]) ctx.tex[id] = criarTextura(ctx.gl, id, img);
        descartar(ctx, new Set([...ativos, ...proximos].map((m) => m.id)));
        setCarregados((n) => n + 1);
        continueRender(h);
      })
      .catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveFaltando]);

  useLayoutEffect(() => {
    const ctx = glRef.current;
    if (!pronto || !ctx || faltando.length) return;
    const { gl, tex, u } = ctx;
    for (const m of ativos) ctx.uso[m.id] = g.quadro;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(u("uTela"), width, height);
    gl.uniform2f(u("uAlvo"), g.alvo[0], g.alvo[1]);
    gl.uniform1f(u("uS"), g.escala);
    gl.uniform1f(u("uP"), g.distancia);
    gl.uniformMatrix3fv(u("uM"), false, g.matriz);
    let unidade = 0;
    const liga = (nome: string, t: WebGLTexture | undefined) => {
      gl.activeTexture(gl.TEXTURE0 + unidade);
      gl.bindTexture(gl.TEXTURE_2D, t ?? tex.__base);
      gl.uniform1i(u(nome), unidade++);
    };
    liga("uBase", tex.__base);
    liga("uNuvens", tex.__nuvens);
    liga("uLuzes", tex.__luzes);
    // os recortes mais finos por último (o shader aplica na ordem: o último fica por cima)
    // o chão plano de perto: o alvo no mundo e o passo de um pixel, em precisão dupla
    const plano = planoDaVista(g);
    gl.uniform1f(u("uPlano"), plano ? 1 : 0);
    if (plano) {
      gl.uniform2f(u("uM0"), plano.m0[0], plano.m0[1]);
      gl.uniform2f(u("uJx"), plano.jx[0], plano.jx[1]);
      gl.uniform2f(u("uJy"), plano.jy[0], plano.jy[1]);
    }
    for (let i = 0; i < MAX_RECORTES; i++) {
      const m = ativos[i];
      liga(`uR${i}`, m ? tex[m.id] : undefined);
      const [x0, y0, x1, y1] = m ? m.caixa : [0, 0, 0, 0];
      gl.uniform4f(u(`uCaixa[${i}]`), x0, y0, x1, y1);
      gl.uniform1f(u(`uLiga[${i}]`), m ? 1 : 0);
      // o alvo dentro do recorte (0–1), calculado aqui: no shader a subtração perderia precisão
      const uv0 = plano && m ? [(plano.m0[0] - x0) / (x1 - x0), (plano.m0[1] - y0) / (y1 - y0)] : [0, 0];
      gl.uniform2f(u(`uUV0[${i}]`), uv0[0], uv0[1]);
    }
    const sol = cartesiano(luz.sol);
    gl.uniform3f(u("uSol"), sol[0], sol[1], sol[2]);
    gl.uniform1f(u("uDia"), luz.dia ?? 1);
    gl.uniform1f(u("uNuv"), nuvens ? (luz.nuvens ?? 0) : 0);
    gl.uniform1f(u("uNuvGiro"), luz.nuvensGiro ?? 0);
    gl.uniform1f(u("uLuz"), luzes ? (luz.luzes ?? 0) : 0);
    gl.uniform1f(u("uAtm"), luz.atmosfera ?? 1);
    gl.uniform1f(u("uEst"), luz.estrelas ?? 1);
    gl.uniform1f(u("uExp"), luz.exposicao ?? 1);
    gl.uniform1f(u("uSat"), luz.saturacao ?? 1);
    gl.uniform1f(u("uVeu"), luz.veu ?? 0);
    gl.uniform1f(u("uCon"), luz.contraste ?? 1);
    gl.uniform1f(u("uGama"), luz.gama ?? 1);
    // as estrelas andam um pouco com o giro da câmera (paralaxe de fundo)
    gl.uniform2f(u("uEstDesloc"), g.camera.lon * 6, -g.camera.lat * 6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // o borrão radial: as cópias num canvas 2D por cima (o buffer do WebGL é preservado)
    const c2 = refBorrao.current?.getContext("2d");
    if (c2) {
      c2.clearRect(0, 0, width, height);
      const k = Math.min(1, Math.max(0, borrao));
      if (k >= 0.02) {
        const n = Math.max(2, Math.round(2 + 8 * k));
        const [cx, cy] = centroDoBorrao ?? g.alvo;
        for (let i = 0; i < n; i++) {
          const e = 1 + (alcanceDoBorrao * k * i) / (n - 1);
          c2.globalAlpha = 1 / (i + 1);
          c2.setTransform(e, 0, 0, e, cx * (1 - e), cy * (1 - e));
          c2.drawImage(ref.current!, 0, 0);
        }
        c2.setTransform(1, 0, 0, 1, 0, 0);
        c2.globalAlpha = 1;
      }
    }
  });

  return (
    <>
      <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0, width, height }} />
      <canvas ref={refBorrao} width={width} height={height} style={{ position: "absolute", inset: 0, width, height, pointerEvents: "none" }} />
    </>
  );
};
