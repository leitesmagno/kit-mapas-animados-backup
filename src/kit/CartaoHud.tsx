import type { Feature, Geometry } from "geojson";
import { geoIdentity, geoPath } from "d3-geo";
import { useMemo } from "react";
import { paraMundo } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import { PALETAS, type NomeDaPaleta } from "./paleta";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O cartão HUD ("Mapas Animados"): uma moldura com brilho que nasce pequena e
// desfocada, com a SILHUETA da região dentro e um número embaixo ("109.000 km²").
// Na saída ele inclina (perspectiva) e some — o gesto que ficou marcante no original.
//
// A silhueta é desenhada na mesma projeção do mapa (Mercator), só encaixada na caixa: a
// forma no cartão é a forma que o espectador acabou de ver no mapa.
// É composição de tela (não anda com a câmera): vai FORA do <MapaSvg>.
// ---------------------------------------------------------------------------

export const CartaoHud: React.FC<{
  regiao: Feature<Geometry>;
  entra: number;
  sai?: number;
  x: number; // centro, px de tela
  y: number;
  largura?: number;
  altura?: number;
  numero?: string; // "109.000"
  unidade?: string; // "km²"
  legenda?: string; // linha pequena opcional, em cima
  paleta?: NomeDaPaleta;
}> = ({ regiao, entra, sai = Infinity, x, y, largura = 520, altura = 330, numero, unidade, legenda, paleta = "neon" }) => {
  const q = useQuadro();
  const p = PALETAS[paleta];
  const d = useMemo(() => {
    // Mercator "plano": as coordenadas de mundo do projeto (y cresce para baixo)
    const mercator = geoIdentity().reflectY(false);
    const plano = {
      ...regiao,
      geometry: mapearGeometria(regiao.geometry, (lon, lat) => paraMundo(lon, lat)),
    } as Feature<Geometry>;
    mercator.fitExtent(
      [
        [34, 30],
        [largura - 34, altura - (numero ? 92 : 30)],
      ],
      plano,
    );
    return geoPath(mercator)(plano) ?? "";
  }, [regiao, largura, altura, numero]);

  if (q < entra) return null;
  const fora = sair(q, sai, 12);
  if (fora <= 0) return null;
  const t = entrar(q, entra, 14, CURVA.pop);
  const nitido = entrar(q, entra, 10);
  const forma = entrar(q, entra + 6, 14);
  const num = entrar(q, entra + 12, 10);
  const saindo = 1 - fora; // 0 → 1 durante a saída
  return (
    <div
      style={{
        position: "absolute",
        left: x - largura / 2,
        top: y - altura / 2,
        width: largura,
        height: altura,
        perspective: 1200,
        opacity: Math.min(1, nitido * 1.4) * fora,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${0.55 + 0.45 * t}) rotateX(${saindo * 28}deg) rotateZ(${saindo * -7}deg) translateY(${saindo * 30}px)`,
          filter: nitido < 1 ? `blur(${(1 - nitido) * 10}px)` : undefined,
          borderRadius: 10,
          border: `3px solid rgba(255,255,255,0.92)`,
          boxShadow: `0 0 18px ${p.brilho}, 0 0 42px ${p.brilho}88, inset 0 0 26px ${p.brilho}55`,
          background: "rgba(4, 14, 8, 0.55)",
          backdropFilter: "blur(2px)",
        }}
      >
        <svg width={largura} height={altura} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="hudBrilho" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <g opacity={forma} transform={`translate(0 ${(1 - forma) * 14})`}>
            <path d={d} fill={p.preenchimento} fillOpacity={0.9} />
            <path d={d} fill="none" stroke={p.brilho} strokeWidth={8} strokeOpacity={0.7} filter="url(#hudBrilho)" />
            <path d={d} fill="none" stroke={p.borda} strokeWidth={2.4} strokeLinejoin="round" />
          </g>
        </svg>
        {legenda && (
          <div style={{ position: "absolute", left: 24, top: 14, fontFamily: FONTE, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: p.realce, opacity: forma }}>{legenda}</div>
        )}
        {numero && (
          <div
            style={{
              position: "absolute",
              left: 28,
              bottom: 22,
              fontFamily: FONTE,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: "-0.02em",
              color: p.tinta,
              textShadow: `0 0 16px ${p.brilho}, 0 2px 4px rgba(0,0,0,0.8)`,
              opacity: num,
              transform: `translateX(${(1 - num) * -18}px)`,
            }}
          >
            {numero}
            {unidade && <span style={{ fontSize: 30, marginLeft: 6 }}>{unidade}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// Aplica uma função a cada coordenada de uma geometria GeoJSON.
type Pos = number[];
const mapearGeometria = (g: Geometry, f: (lon: number, lat: number) => [number, number]): Geometry => {
  const ponto = (c: Pos) => f(c[0], c[1]);
  switch (g.type) {
    case "Point":
      return { ...g, coordinates: ponto(g.coordinates) };
    case "MultiPoint":
    case "LineString":
      return { ...g, coordinates: g.coordinates.map(ponto) };
    case "MultiLineString":
    case "Polygon":
      return { ...g, coordinates: g.coordinates.map((l) => l.map(ponto)) };
    case "MultiPolygon":
      return { ...g, coordinates: g.coordinates.map((p) => p.map((l) => l.map(ponto))) };
    case "GeometryCollection":
      return { ...g, geometries: g.geometries.map((x) => mapearGeometria(x, f)) };
  }
};
