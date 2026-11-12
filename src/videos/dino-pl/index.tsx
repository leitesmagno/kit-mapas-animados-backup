import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BRASILIA, ESTADOS, ESTADOS_EUA, PAISES, WASHINGTON } from "./dados";
import { A, B, CHAVES, DURACAO, DUR_A, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "dino-pl": os dois trechos de mapa do vídeo 143 do Estúdio 3D (Dino x deputados do PL).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (DO EXTERIOR?): EUA → Brasília em linha tracejada com "?": é o que o inquérito APURA, não fato provado.
//   B (A BANCADA): o Brasil; os 27 estados acendem em onda e aparece "121 deputados eleitos pelo PL" (Congresso em Foco, 05/10/2026).
// Verde (#2FA36B) = acento do perfil @eumagnoleite. Âmbar = dúvida/suspeita em apuração.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const AMBAR = "#E3B34A";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.05)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : "B");

const Base: React.FC = () => {
  const f = useQuadro();
  const t = trecho(f);
  const br = t === "B" ? 0.7 : 0.35 + 0.4 * entra(f, A.campanha, 14);
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.4} />
      {t === "A" ? ESTADOS_EUA.map((e, i) => <CamadaGeo key={i} dados={e} stroke="#FFFFFF" strokeWidth={1.1} opacidade={0.55} />) : null}
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.3} opacidade={br} />
    </>
  );
};

// B: os 27 estados acendem em onda, de oeste para leste
const Bancada: React.FC = () => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  return (
    <g>
      {ESTADOS.features.map((e, i) => {
        const g = e.geometry as unknown as {type: string; coordinates: number[][][] | number[][][][]};
        const c = (g.type === "Polygon" ? (g.coordinates as number[][][])[0][0] : (g.coordinates as number[][][][])[0][0][0]) as [number, number];
        const [x] = projetar(c[0], c[1]);
        const k = entra(f, B.elegeu + Math.max(0, Math.min(18, (x / 1080) * 18)), 8);
        if (k <= 0) return null;
        return <path key={i} d={caminho(e) ?? ""} fill={VERDE} fillOpacity={0.32 * k} stroke="#E9FFF3" strokeWidth={1.6} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
      })}
    </g>
  );
};

// A: a linha tracejada EUA → Brasília, com o "?" no meio (o que o inquérito investiga)
const Linha: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "A" || f < A.dinheiro) return null;
  const [sx, sy] = projetar(...WASHINGTON);
  const [bx, by] = projetar(...BRASILIA);
  const u = interpolate(f, [A.dinheiro, A.campanha + 14], [0, 1], cl);
  const e = u * u * (3 - 2 * u);
  const cx = (sx + bx) / 2 + 220;
  const cy = (sy + by) / 2;
  const ponto = (k: number) => [(1 - k) * (1 - k) * sx + 2 * (1 - k) * k * cx + k * k * bx, (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * cy + k * k * by];
  const n = 40;
  const pts = Array.from({ length: n + 1 }, (_, i) => ponto((i / n) * e));
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [mx, my] = ponto(0.5);
  const kQ = entra(f, A.exterior, 10);
  const pulso = 1 + 0.06 * Math.sin(f / 5);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={sx} cy={sy} r={10} fill={AMBAR} opacity={entra(f, A.dinheiro, 8)} />
      <path d={d} fill="none" stroke={AMBAR} strokeWidth={6} strokeDasharray="14 14" strokeLinecap="round" opacity={0.95} style={{ filter: `drop-shadow(0 0 6px ${AMBAR})` }} />
      {e >= 0.999 ? <circle cx={bx} cy={by} r={12 * pulso} fill={AMBAR} /> : null}
      {kQ > 0 ? (
        <g transform={`translate(${mx},${my}) scale(${(0.6 + 0.4 * kQ) * pulso})`} opacity={kQ}>
          <circle r={42} fill={ESCURO} stroke={AMBAR} strokeWidth={5} />
          <text y={18} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={54} fill={AMBAR}>?</text>
        </g>
      ) : null}
    </svg>
  );
};

export const DinoPl: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_B ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Bancada />
          </MapaSvg>
        </BorraoRadial>
        <Linha />
        {/* A: plaquinhas pequenas presas aos lugares */}
        {t === "A" ? <TagNoMapa texto="GRUPO AMERICANO" entra={4} sai={A.campanha + 10} ponto={WASHINGTON} dy={-60} cor={ESCURO} corpo={26} saida="pop" /> : null}
        {t === "A" ? <TagNoMapa texto="DINHEIRO OU AJUDA?" entra={A.exterior} sai={A.dez} x={540} y={1260} cor={ESCURO} corpo={30} /> : null}
        {t === "A" ? <TagNoMapa texto="CAMPANHA PRESIDENCIAL · PL" entra={A.flavio} sai={DUR_A + 10} ponto={BRASILIA} dy={70} cor={ESCURO} corpo={26} /> : null}
        {t === "A" ? <TagNoMapa texto="INQUÉRITO ABERTO · 10/11" entra={A.dez} sai={DUR_A + 10} x={540} y={1260} cor={VERDE} corpo={30} /> : null}
        {/* B */}
        {t === "B" ? <TextoDigitado texto="121" unidade=" DEPUTADOS DO PL" entra={B.n121} sai={DURACAO + 30} x={540} y={880} corpo={64} brilho={VERDE} /> : null}
        {t === "B" ? <TagNoMapa texto="ELEITOS EM OUTUBRO DE 2026" entra={B.outubro} sai={DURACAO + 30} x={540} y={1260} cor={ESCURO} corpo={30} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
