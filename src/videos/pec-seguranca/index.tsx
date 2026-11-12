import { AbsoluteFill, interpolate } from "remotion";
import { useMemo } from "react";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BRASILIA, CAPITAIS, CENTRO_ESTADO, CENTRO_MUN, CENTRO_RJ, ESTADOS, LINHA_CRIME, MUNICIPIOS, PAISES, RJ } from "./dados";
import { A, B, C, CHAVES, DURACAO, DUR_A, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "pec-seguranca": os três trechos de mapa do vídeo 018 do Estúdio 3D (a PEC da Segurança Pública).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (CADA UM NO SEU QUADRADO): os 27 estados se afastam com pasta e moeda; uma linha genérica cruza
//     as divisas (ilustração); 2018: o RJ acende (intervenção federal); o Susp liga as capitais, mas fraco.
//   B (A SUA CIDADE): os 5.570 municípios acendem em onda; depois só alguns (ilustração: quem cumprir).
//   C (E AÍ?): pontinhos verdes acendendo em cidades espalhadas (sorteio fixo, sem significado de dado).
// O verde é o acento do perfil @eumagnoleite (#2FA36B).
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.1) contrast(1.05) brightness(0.95)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : f < INI_C ? "B" : "C");
// sorteio fixo (sem Math.random): o mesmo resultado em todo render
const sorteio = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const Contorno: React.FC = () => <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.35} />;

// A: os estados como peças soltas (afastam do centro e voltam em 2018)
const Estados: React.FC = () => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  if (trecho(f) !== "A") return null;
  const [cx, cy] = projetar(...BRASILIA);
  const solta = entra(f, A.cadaUm, 14) * (1 - entra(f, A.em2018, 16));
  const rio = entra(f, A.intervencao, 14);
  return (
    <g>
      {ESTADOS.features.map((e) => {
        const sg = e.properties.sigla;
        const [x, y] = projetar(...CENTRO_ESTADO[sg]);
        const dx = (x - cx) * 0.09 * solta;
        const dy = (y - cy) * 0.09 * solta;
        const ehRio = sg === "RJ";
        return (
          <path
            key={sg}
            d={caminho(e) ?? ""}
            transform={`translate(${dx},${dy})`}
            fill={ehRio && rio > 0 ? VERDE : "#FFFFFF"}
            fillOpacity={ehRio && rio > 0 ? 0.55 * rio : 0.06 + 0.08 * solta}
            stroke="#FFFFFF"
            strokeWidth={1.6 + 1.4 * solta}
            strokeOpacity={0.75}
            strokeLinejoin="round"
          />
        );
      })}
      {rio > 0 ? <path d={caminho(RJ) ?? ""} fill="none" stroke="#E9FFF3" strokeWidth={2 + 3 * rio} strokeOpacity={rio} style={{ filter: `drop-shadow(0 0 ${10 * rio}px ${VERDE})` }} /> : null}
    </g>
  );
};

// A: pasta e moeda em cada estado (uma de cada lado do centro do estado)
const Icones: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "A" || f < A.dados) return null;
  const [cx, cy] = projetar(...BRASILIA);
  const solta = entra(f, A.cadaUm, 14);
  const some = 1 - entra(f, A.em2018, 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {ESTADOS.features.map((e, i) => {
        const [x0, y0] = projetar(...CENTRO_ESTADO[e.properties.sigla]);
        const x = x0 + (x0 - cx) * 0.09 * solta;
        const y = y0 + (y0 - cy) * 0.09 * solta;
        const kP = entra(f, A.dados + (i % 9), 8) * some;
        const kM = entra(f, A.dinheiro + (i % 9), 8) * some;
        return (
          <g key={i}>
            {kP > 0 ? (
              <g transform={`translate(${x - 13},${y}) scale(${kP})`} opacity={kP}>
                <rect x={-9} y={-8} width={18} height={14} rx={2} fill="#E9EEF2" stroke="#0E1A14" strokeWidth={1.5} />
                <rect x={-9} y={-11} width={8} height={4} rx={1} fill="#E9EEF2" stroke="#0E1A14" strokeWidth={1.5} />
              </g>
            ) : null}
            {kM > 0 ? (
              <g transform={`translate(${x + 13},${y}) scale(${kM})`} opacity={kM}>
                <circle r={8} fill="#E3B34A" stroke="#0E1A14" strokeWidth={1.5} />
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

// A: a linha genérica que cruza as divisas (ilustração, sem rota real): vai se desenhando, com um ponto na ponta
const LinhaCrime: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "A" || f < A.crime) return null;
  const pts = LINHA_CRIME.map((p) => projetar(...p));
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((x, y) => x + y, 0);
  const corre = interpolate(f, [A.atravessa, A.licenca + 6], [0, 1], cl);
  const k = entra(f, A.crime, 10) * (1 - entra(f, A.em2018, 14));
  // a ponta, andando pelos segmentos
  let falta = corre * total;
  let ponta = pts[0];
  for (let i = 0; i < seg.length; i++) {
    if (falta <= seg[i]) {
      const u = seg[i] ? falta / seg[i] : 0;
      ponta = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
      break;
    }
    falta -= seg[i];
    ponta = pts[i + 1];
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={k}>
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeDasharray={`${total * corre} ${total + 10}`} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.9} />
      <path d={d} fill="none" stroke="#1A1D22" strokeWidth={5} strokeDasharray={`${total * corre} ${total + 10}`} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ponta[0]} cy={ponta[1]} r={13} fill="#1A1D22" stroke="#FFFFFF" strokeWidth={3} />
    </svg>
  );
};

// A: o Susp liga as capitais (rede em volta de Brasília); em "lei comum" fica tracejada e fraca
const RedeSusp: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "A" || f < A.susp) return null;
  const [bx, by] = projetar(...BRASILIA);
  const fraca = entra(f, A.leiComum, 14);
  const aceso = entra(f, A.juntar, 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {CAPITAIS.map((c, i) => {
        const [x, y] = projetar(...c);
        const k = entra(f, A.susp + (i % 14), 10);
        const someTrecho = i % 5 === 2 ? entra(f, A.mudaFacil + (i % 3) * 3, 10) : 0;
        const op = k * (0.55 + 0.45 * aceso) * (1 - 0.4 * fraca) * (1 - someTrecho);
        return (
          <g key={i}>
            <line x1={bx} y1={by} x2={x} y2={y} stroke={VERDE} strokeWidth={3 + 2 * aceso} strokeOpacity={op} strokeDasharray={fraca > 0.05 ? `${10 * fraca + 1} ${12 * fraca}` : undefined} strokeLinecap="round" />
            <circle cx={x} cy={y} r={6 * k} fill="#E9FFF3" stroke={VERDE} strokeWidth={2} opacity={op} />
          </g>
        );
      })}
      <circle cx={bx} cy={by} r={11 * entra(f, A.susp, 10)} fill={VERDE} stroke="#E9FFF3" strokeWidth={3} />
    </svg>
  );
};

// B e C: os municípios (só as linhas finas); B acende em onda do Norte para o Sul
const Municipios: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const t = trecho(f);
  const ys = useMemo(() => CENTRO_MUN.map((c) => c[1]), []);
  if (t === "A") return null;
  const base = t === "B" ? entra(f, INI_B, 10) : 1;
  return (
    <g>
      {MUNICIPIOS.features.map((m, i) => {
        let fill = 0;
        let cor = "#FFFFFF";
        if (t === "B") {
          const atraso = interpolate(ys[i], [-33, 5], [22, 0], cl);
          const onda = entra(f, B.cidade + atraso, 8) * (1 - entra(f, B.masSo, 14));
          const onda2 = entra(f, B.ronda + atraso, 8) * (1 - entra(f, B.ronda + atraso + 10, 10)) * 0.5;
          const fica = sorteio(i) < 0.07 ? entra(f, B.masSo + 6 + (i % 10), 8) : 0;
          fill = Math.max(onda * 0.5, onda2 * 0.5, fica * 0.7);
          cor = VERDE;
        }
        if (t === "C") {
          const fica = sorteio(i + 7) < 0.06 ? entra(f, C.quer + (sorteio(i + 3) * 60), 8) : 0;
          fill = fica * 0.75;
          cor = VERDE;
        }
        return <path key={i} d={caminho(m) ?? ""} fill={fill > 0.01 ? cor : "none"} fillOpacity={fill} stroke="#FFFFFF" strokeWidth={0.5} strokeOpacity={0.28 * base} />;
      })}
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.4} opacidade={0.6 * base} />
    </g>
  );
};

export const PecSeguranca: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_B || f === INI_C ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Contorno />
            <Estados />
            <Municipios />
          </MapaSvg>
        </BorraoRadial>
        <Icones />
        <LinhaCrime />
        <RedeSusp />
        {/* A */}
        {t === "A" ? <TagNoMapa texto="INTERVENÇÃO FEDERAL · 2018" entra={A.intervencao + 8} sai={A.susp} ponto={CENTRO_RJ} dy={-150} cor={VERDE} corpo={32} /> : null}
        {t === "A" ? <TagNoMapa texto="SUSP · 2018" entra={A.susp + 10} sai={DUR_A - 6} x={540} y={1230} cor="#1E2530" corpo={32} /> : null}
        {/* B */}
        {t === "B" ? <TagNoMapa texto="POLÍCIA MUNICIPAL: PODE CRIAR" entra={B.municipal} sai={B.masSo} x={540} y={1230} cor={VERDE} corpo={32} /> : null}
        {t === "B" ? <TagNoMapa texto="SÓ QUEM CUMPRIR AS REGRAS" entra={B.masSo + 8} sai={INI_C} x={540} y={1230} cor="#1E2530" corpo={32} /> : null}
        {/* C */}
        {t === "C" ? <TagNoMapa texto="E AÍ, VOCÊ QUER?" entra={C.meConta} sai={DURACAO + 30} x={540} y={1230} cor={VERDE} corpo={36} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
