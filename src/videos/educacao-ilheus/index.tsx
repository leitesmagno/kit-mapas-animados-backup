import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, ESTADOS, FUNDO, ILHEUS, PAISES, SEDE_ILHEUS, arco } from "./dados";
import { A, B, C, CHAVES, DURACAO, DUR_A, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "educacao-ilheus": os três trechos de mapa do vídeo 029 do Estúdio 3D (a educação em Ilhéus).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (ILHÉUS): do Brasil até Ilhéus; o contorno do município acende; "R$ 2 BILHÕES · EDUCAÇÃO 2008 A 2025";
//      três percentuais que não batem (26,2% SIOPE · 24,2% PREFEITURA · 24% TCM).
//   B (O FUNDEB): o fundo no meio da Bahia (ponto simbólico, sem cidade); Ilhéus põe 20% (setas finas) e
//      o fundo devolve (seta grossa).
//   C (É SEU): Ilhéus de novo; o endereço do portal; pontinhos verdes na cidade.
// O verde é o acento do perfil @eumagnoleite (#2FA36B).
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const OURO = "#C99A2E";
const ESCURO = "#1E2530";
const MARSALA = "#8E3B4A";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.06)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : f < INI_C ? "B" : "C");

const Base: React.FC = () => {
  const { camera } = useMapa();
  const longe = Math.min(1, Math.max(0, (9 - camera.zoom) / 1.4));
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.6} opacidade={0.55 * longe} />
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.1} opacidade={0.45 * longe} />
    </>
  );
};

// o município de Ilhéus: contorno verde e preenchimento leve que acende nas palavras
const Ilheus: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(ILHEUS) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.ilheus - 4, 12) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.n2bi) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.cidade, B.cidade + 10, B.vinte + 20, B.vinte + 34], [0, 1, 1, 0.45], cl) : 0;
  const acendeC = tr === "C" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - C.escola) / 18)) * Math.PI)) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.3 * acendeB + 0.2 * acendeC;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// B: a Bahia com contorno branco fino, para situar o fundo
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.fundeb, 14);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.75 * k} strokeLinejoin="round" />;
};

// as setas da vaquinha: duas finas de Ilhéus para o fundo (20%) e uma grossa de volta
const IDA_1 = arco(SEDE_ILHEUS, FUNDO, 0.22);
const IDA_2 = arco(SEDE_ILHEUS, FUNDO, 0.34);
const VOLTA = arco(FUNDO, SEDE_ILHEUS, 0.16);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return (
    <>
      <TracadoGeo linha={IDA_1} desenho={[B.vinte, B.vinte + 18]} sai={INI_C + 30} estilo="trilha" cor={OURO} largura={3} fluxo={1.2} />
      <TracadoGeo linha={IDA_2} desenho={[B.repasses, B.repasses + 18]} sai={INI_C + 30} estilo="trilha" cor={OURO} largura={3} fluxo={1.2} />
      <TracadoGeo linha={VOLTA} desenho={[B.devolve, B.devolve + 20]} sai={INI_C + 30} estilo="trilha" cor={VERDE} largura={8} fluxo={1.4} />
    </>
  );
};

// o fundo: círculo com moedinha girando, no meio da Bahia
const Fundo: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.vaquinha, 12);
  const [x, y] = projetar(FUNDO[0], FUNDO[1]);
  const gira = Math.cos((f - B.vaquinha) / 9);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k)}>
        <circle r={64} fill={ESCURO} fillOpacity={0.85} stroke="#FFFFFF" strokeWidth={5} />
        <ellipse rx={30 * Math.max(0.15, Math.abs(gira))} ry={30} fill={OURO} stroke="#FFFFFF" strokeWidth={3} />
      </g>
    </svg>
  );
};

// pontinhos verdes na cidade (C): símbolos, não escolas reais
const PONTOS: [number, number][] = [[-120, -60], [-40, -110], [60, -70], [130, -10], [-90, 30], [20, 10], [90, 70], [-30, 90], [-150, 110], [150, 130], [40, 150], [-80, 170]];
const Pontinhos: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "C") return null;
  const [cx, cy] = projetar(SEDE_ILHEUS[0], SEDE_ILHEUS[1]);
  const pulso = Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - C.escola) / 18)) * Math.PI));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {PONTOS.map(([dx, dy], i) => {
        const k = entra(f, C.dinheiro + i * 2, 8);
        return <circle key={i} cx={cx + dx} cy={cy + 60 + dy} r={(10 + 4 * pulso) * k} fill={VERDE} stroke="#FFFFFF" strokeWidth={3} opacity={Math.min(1, k)} style={{ filter: `drop-shadow(0 0 ${6 + 8 * pulso}px ${VERDE})` }} />;
      })}
    </svg>
  );
};

export const EducacaoIlheus: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const corte = f === INI_B || f === INI_C;
  const borrao = corte ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Bahia />
            <Setas />
            <Ilheus />
          </MapaSvg>
        </BorraoRadial>
        <Fundo />
        <Pontinhos />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 2" unidade=" BILHÕES" entra={A.n2bi} sai={DUR_A + 30} x={540} y={600} corpo={96} brilho={VERDE} passo={1} /> : null}
        {tr === "A" ? <TagNoMapa texto="EDUCAÇÃO · 2008 A 2025" entra={A.educacao} sai={DUR_A + 30} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TagNoMapa texto="SIOPE 26,2%" entra={A.numeros} sai={DUR_A + 30} x={300} y={1120} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA 24,2%" entra={A.numeros + 6} sai={DUR_A + 30} x={780} y={1080} cor={MARSALA} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="TCM 24%" entra={A.naoBatem} sai={DUR_A + 30} x={540} y={1190} cor={MARSALA} corpo={30} /> : null}
        {/* B */}
        {tr === "B" ? <TagNoMapa texto="FUNDO" entra={B.vaquinha + 4} sai={INI_C + 30} ponto={FUNDO} dy={110} cor={ESCURO} corpo={34} /> : null}
        {tr === "B" ? <TagNoMapa texto="ILHÉUS" entra={B.cidade} sai={INI_C + 30} ponto={SEDE_ILHEUS} dy={80} dx={-60} cor={VERDE} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="PÕE 20% · FPM, ICMS…" entra={B.vinte + 8} sai={INI_C + 30} x={540} y={600} cor={OURO} corpo={32} /> : null}
        {tr === "B" ? <TagNoMapa texto="O FUNDO DEVOLVE" entra={B.devolve + 8} sai={INI_C + 30} x={540} y={1180} cor={VERDE} corpo={32} /> : null}
        {/* C */}
        {tr === "C" ? <TextoDigitado texto="ILHÉUS" entra={INI_C + 6} sai={DURACAO + 30} ponto={SEDE_ILHEUS} ancora="base" seta corpo={36} dy={-10} /> : null}
        {tr === "C" ? <TagNoMapa texto="transparencia.ilheus.ba.gov.br" entra={C.portal + 4} sai={C.conta} x={540} y={1110} cor={ESCURO} corpo={30} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
