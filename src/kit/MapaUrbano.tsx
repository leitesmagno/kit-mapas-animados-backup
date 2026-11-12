import { useQuadro } from "./tempo";
import type { FeatureCollection, LineString } from "geojson";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useMapa } from "../base/componentes/MapCamera";
import { escalaDoZoom, RAIO_DA_TERRA } from "./cameraGlobo";

// ---------------------------------------------------------------------------
// A CIDADE DESENHADA — o mapa urbano do formato comercial, onde o satélite (10 m) não chega:
// as RUAS do OpenStreetMap, os RIOS na largura de verdade e cada ENDEREÇO do Censo (CNEFE do
// IBGE) como um ponto. De longe os endereços são as luzes da cidade; de perto viram os lotes
// ao longo das ruas. Tudo num <canvas> (são dezenas de milhares de pontos), redesenhado a
// cada quadro a partir da câmera — funciona com a câmera plana e com o globo.
//
// Vai entre a imagem (satélite/globo) e o <MapaSvg> (rota, destaques, marcadores).
//
//   <MapaUrbano ruas={RUAS} rios={RIOS} enderecos={ENDERECOS} opacidade={o} fundo={f}
//     acende={{ centro, raio }} bairro={{ nome, forca }} rua={{ nome, forca }} />
// ---------------------------------------------------------------------------

export type ClasseDeVia = 1 | 2 | 3 | 4 | 5; // 1 principal … 5 serviço
export type Ruas = FeatureCollection<LineString, { c: ClasseDeVia; n: string | null }>;
export type Rios = FeatureCollection<LineString, { n: string | null; tipo: string; largura: number }>;
// os endereços: inteiros (micrograus) a partir de `origem`, e o bairro de cada um
export type Enderecos = { origem: [number, number]; escala: number; xy: number[]; bairros: string[]; b: number[] };

type Cor = [number, number, number, number];
const mistura = (a: Cor, b: Cor, t: number): string => {
  const c = a.map((x, i) => x + (b[i] - x) * t);
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
};
const suave = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Por classe: largura de verdade (m), largura mínima (px) e a cor de longe → de perto.
const VIAS: Record<ClasseDeVia, { m: number; min: number; longe: Cor; perto: Cor }> = {
  1: { m: 16, min: 1.8, longe: [255, 226, 180, 0.62], perto: [58, 62, 70, 1] },
  2: { m: 13, min: 1.5, longe: [240, 225, 200, 0.5], perto: [52, 57, 66, 1] },
  3: { m: 11, min: 1.25, longe: [215, 225, 240, 0.42], perto: [46, 52, 62, 1] },
  4: { m: 8, min: 0.9, longe: [190, 205, 225, 0.26], perto: [37, 44, 55, 1] },
  5: { m: 5, min: 0.6, longe: [170, 185, 205, 0.14], perto: [30, 36, 46, 1] },
};

export const MapaUrbano: React.FC<{
  ruas: Ruas;
  rios?: Rios;
  enderecos?: Enderecos;
  opacidade?: number; // a camada inteira
  fundo?: number; // 0–1: o chão escuro que cobre o satélite por baixo das ruas
  corDoFundo?: string;
  ruasVisiveis?: number; // 0–1: as ruas acendem das principais para as menores
  acende?: { centro: [number, number]; raio: number }; // os endereços acendem num raio (m)
  bairro?: { nome: string; forca: number; cor?: string }; // os endereços de um bairro em destaque
  rua?: { nome: string; forca: number; cor?: string }; // uma rua em destaque
  corDosPontos?: [number, number, number];
}> = ({ ruas, rios, enderecos, opacidade = 1, fundo = 1, corDoFundo = "7,11,18", ruasVisiveis = 1, acende, bairro, rua, corDosPontos = [255, 200, 128] }) => {
  const f = useQuadro();
  const { projetar, caminho, camera, largura, altura } = useMapa();
  const ref = useRef<HTMLCanvasElement>(null);

  // os dados em forma de desenhar (uma vez): caixas das ruas e os pontos em graus
  const prep = useMemo(() => {
    const caixa = (c: number[][]) => {
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
      for (const [x, y] of c) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      return [x0, y0, x1, y1];
    };
    const vias = ruas.features.map((r) => ({ f: r, c: r.properties.c, n: r.properties.n, caixa: caixa(r.geometry.coordinates) })).sort((a, b) => b.c - a.c);
    const agua = (rios?.features ?? []).map((r) => ({ f: r, l: r.properties.largura, caixa: caixa(r.geometry.coordinates) }));
    let lon = new Float64Array(0);
    let lat = new Float64Array(0);
    let grupo = new Int16Array(0);
    if (enderecos) {
      const n = enderecos.xy.length / 2;
      lon = new Float64Array(n);
      lat = new Float64Array(n);
      grupo = new Int16Array(n);
      for (let i = 0; i < n; i++) {
        lon[i] = enderecos.origem[0] + enderecos.xy[2 * i] * enderecos.escala;
        lat[i] = enderecos.origem[1] + enderecos.xy[2 * i + 1] * enderecos.escala;
        grupo[i] = enderecos.b[i];
      }
    }
    return { vias, agua, lon, lat, grupo };
  }, [ruas, rios, enderecos]);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, largura, altura);
    if (opacidade <= 0.001) return;
    const z = camera.zoom;
    const escala = escalaDoZoom(z);
    const pxPorMetro = escala / (RAIO_DA_TERRA * 1000);
    // a janela da câmera em graus (com folga para o giro): só desenha o que cai nela
    const meia = (0.75 * Math.hypot(largura, altura)) / (escala * (Math.PI / 180));
    const kLon = 1 / Math.max(0.2, Math.cos((camera.lat * Math.PI) / 180));
    const [jx0, jx1, jy0, jy1] = [camera.lon - meia * kLon, camera.lon + meia * kLon, camera.lat - meia, camera.lat + meia];
    const naJanela = (c: number[]) => c[2] >= jx0 && c[0] <= jx1 && c[3] >= jy0 && c[1] <= jy1;
    const perto = suave(15.2, 17.4, z);

    if (fundo > 0) {
      ctx.fillStyle = `rgba(${corDoFundo},${fundo})`;
      ctx.fillRect(0, 0, largura, altura);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // os rios: a faixa d'água na largura de verdade e um fio de luz no meio
    for (const r of prep.agua) {
      if (!naJanela(r.caixa)) continue;
      const p = new Path2D(caminho(r.f) ?? "");
      ctx.strokeStyle = mistura([30, 90, 130, 0.55], [13, 44, 66, 1], perto);
      ctx.lineWidth = Math.max(r.l > 20 ? 3 : 1.4, r.l * pxPorMetro);
      ctx.stroke(p);
      ctx.strokeStyle = `rgba(111,211,255,${0.22 + 0.12 * (1 - perto)})`;
      ctx.lineWidth = Math.max(1, r.l * pxPorMetro * 0.12);
      ctx.stroke(p);
    }

    // as ruas: das menores para as principais (as principais por cima); acendem das
    // principais para as menores conforme `ruasVisiveis`
    for (const v of prep.vias) {
      if (!naJanela(v.caixa)) continue;
      const vis = suave((v.c - 1) * 0.16, (v.c - 1) * 0.16 + 0.36, ruasVisiveis);
      if (vis <= 0.001) continue;
      const e = VIAS[v.c];
      const p = new Path2D(caminho(v.f) ?? "");
      ctx.globalAlpha = vis;
      ctx.strokeStyle = mistura(e.longe, e.perto, perto);
      ctx.lineWidth = Math.max(e.min, e.m * pxPorMetro);
      ctx.stroke(p);
    }
    ctx.globalAlpha = 1;

    // a rua em destaque
    if (rua && rua.forca > 0) {
      const cor = rua.cor ?? "242,180,90";
      for (const v of prep.vias) {
        if (v.n !== rua.nome || !naJanela(v.caixa)) continue;
        const p = new Path2D(caminho(v.f) ?? "");
        const l = Math.max(3, VIAS[v.c].m * pxPorMetro);
        ctx.strokeStyle = `rgba(${cor},${0.25 * rua.forca})`;
        ctx.lineWidth = l * 2.6;
        ctx.stroke(p);
        ctx.strokeStyle = `rgba(${cor},${0.9 * rua.forca})`;
        ctx.lineWidth = l;
        ctx.stroke(p);
      }
    }

    // os endereços: luzes de longe (somam), lotes de perto
    const n = prep.lon.length;
    if (n) {
      const lado = Math.min(10, Math.max(1.3, 6.5 * pxPorMetro));
      const destaque = bairro && bairro.forca > 0 && enderecos ? enderecos.bairros.indexOf(bairro.nome) : -1;
      const [cr, cg, cb] = corDosPontos;
      const aLonge = 0.5;
      const aPerto = 0.78;
      const alfa = aLonge + (aPerto - aLonge) * perto;
      ctx.globalCompositeOperation = perto < 0.5 ? "lighter" : "source-over";
      const lat0 = acende?.centro[1] ?? 0;
      const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
      for (let i = 0; i < n; i++) {
        const lo = prep.lon[i];
        const la = prep.lat[i];
        if (lo < jx0 || lo > jx1 || la < jy0 || la > jy1) continue;
        let a = alfa;
        if (acende) {
          const d = Math.hypot((lo - acende.centro[0]) * kx, (la - acende.centro[1]) * 110574);
          a *= suave(0, 260, acende.raio - d);
          if (a <= 0.004) continue;
        }
        const [x, y] = projetar(lo, la);
        if (x < -20 || y < -20 || x > largura + 20 || y > altura + 20) continue;
        const ehDestaque = destaque >= 0 && prep.grupo[i] === destaque;
        if (ehDestaque) {
          const cor = bairro!.cor ?? "255,196,92";
          ctx.fillStyle = `rgba(${cor},${Math.min(1, a + 0.4 * bairro!.forca)})`;
          const l = lado * (1 + 0.5 * bairro!.forca);
          ctx.fillRect(x - l / 2, y - l / 2, l, l);
        } else {
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${bairro ? a * (1 - 0.55 * bairro.forca) : a})`;
          ctx.fillRect(x - lado / 2, y - lado / 2, lado, lado);
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }
  });

  return <canvas ref={ref} width={largura} height={altura} style={{ position: "absolute", inset: 0, width: largura, height: altura, opacity: opacidade, pointerEvents: "none" }} data-quadro={f} />;
};
