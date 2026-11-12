import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, COARACI, ESTADOS, PAISES, SALVADOR, SEDE_COARACI, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-coaraci": os dois trechos de mapa do vídeo 030 do Estúdio 3D (o orçamento de Coaraci).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (COARACI): do Brasil até a cidade; o contorno do município acende; "R$ 91,6 MILHÕES".
//   B (DE ONDE VEM): arrecadou R$ 2,43 bi; menos de 1 em 4 reais dos impostos da cidade; setas de Brasília (União)
//      e de Salvador (estado); UNIÃO · FPM R$ 42,9 MI; mais de 8 vezes os impostos da cidade.
//   Valores da DCA 2025 da Prefeitura de Coaraci (SICONFI) e dedução do Fundeb do SIOPE 2025.
// O verde é o acento do perfil @eumagnoleite (#2FA36B).
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const OURO = "#C99A2E";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.06)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : "B");

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

// o município: contorno verde e preenchimento leve que acende nas palavras
const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(COARACI) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.gastou - 6, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.cinco, B.cinco + 12, B.brasilia, B.brasilia + 16], [0, 1, 1, 0.45], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.3 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// B: a Bahia com contorno branco fino, para situar as setas
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.brasilia - 10, 16);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_COARACI, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE_COARACI, -0.35);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return (
    <>
      <TracadoGeo linha={SETA_UNIAO} desenho={[B.brasilia + 4, B.brasilia + 28]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
      <TracadoGeo linha={SETA_ESTADO} desenho={[B.salvador, B.salvador + 18]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
    </>
  );
};

// pontinhos das capitais
const Capitais: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[
        [BRASILIA, B.brasilia + 2],
        [SALVADOR, B.salvador - 4],
      ].map(([p, a], i) => {
        const k = entra(f, a as number, 10);
        const [x, y] = projetar((p as [number, number])[0], (p as [number, number])[1]);
        return <circle key={i} cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />;
      })}
    </svg>
  );
};

export const OrcamentoCoaraci: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const fim = DURACAO + 30;
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
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        <Capitais />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 91,6" unidade=" MILHÕES" entra={A.n91} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="COARACI" entra={A.gastou + 20} sai={INI_B + 6} ponto={SEDE_COARACI} ancora="base" seta corpo={34} dy={-10} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE COARACI" entra={A.abri} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={30} /> : null}
        {/* B: na cidade */}
        {tr === "B" ? <TextoDigitado texto="R$ 98" unidade=" MI" entra={B.n98} sai={B.brasilia} x={540} y={600} corpo={100} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADADOS EM 2025" entra={B.arrecadou + 4} sai={B.brasilia} x={540} y={700} cor={ESCURO} corpo={32} /> : null}
        {tr === "B" ? <TagNoMapa texto="IMPOSTOS DA CIDADE: 5 DE CADA 100 REAIS" entra={B.cinco} sai={B.brasilia} x={540} y={1150} cor={VERDE} corpo={30} /> : null}
        {/* B: de fora */}
        {tr === "B" ? <TagNoMapa texto="ESTADO" entra={B.salvador + 4} sai={fim} ponto={SALVADOR} dy={70} dx={-60} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO" entra={B.uniao} sai={B.n42 - 6} ponto={BRASILIA} dy={-60} dx={120} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · FPM R$ 42,9 MI" entra={B.n42} sai={fim} ponto={BRASILIA} dy={-60} dx={300} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="COARACI" entra={B.brasilia + 14} sai={fim} ponto={SEDE_COARACI} dy={120} dx={-120} cor={VERDE} corpo={28} /> : null}
        {tr === "B" && f >= B.maisQue ? <TagNoMapa texto="MAIS DE 8 VEZES OS IMPOSTOS DA CIDADE" entra={B.maisQue} sai={fim} x={540} y={640} cor={VERDE} corpo={30} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
