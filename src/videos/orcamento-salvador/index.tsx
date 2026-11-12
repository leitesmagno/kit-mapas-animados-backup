import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, CENTRO_ESTADO, ESTADOS, MUNICIPIO_SSA, PAISES, SEDE_SSA, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-salvador": os dois trechos de mapa do vídeo 023 do Estúdio 3D (o orçamento de Salvador).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (SALVADOR): do Brasil até Salvador; o contorno do município acende; "R$ 11,9 BILHÕES".
//   B (DE ONDE VEM): arrecadou R$ 12,4 bi; impostos da cidade, pouco mais de 1 em 3; recua: seta de Brasília
//      (União, R$ 3,3 bi), a Bahia acende (estado) e o Fundeb. Só números de Salvador, do RREO dez/2025, Anexo 1, p. 1.
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

const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(MUNICIPIO_SSA) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.bi - 6, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.pouco, B.pouco + 12, B.resto, B.resto + 16], [0, 1, 1, 0.4], cl) : 0;
  const preench = 0.12 + 0.22 * pulsoA + 0.3 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.resto, 16);
  const acende = interpolate(f, [B.estado, B.estado + 12], [0, 1], cl);
  return <path d={caminho(BAHIA) ?? ""} fill={OURO} fillOpacity={0.16 * acende} stroke="#FFFFFF" strokeWidth={2.2 + 1.6 * acende} strokeOpacity={0.85 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_SSA, 0.22);
const Seta: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return <TracadoGeo linha={SETA_UNIAO} desenho={[B.federal, B.federal + 24]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />;
};

const Brasilia: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.federal - 4, 10);
  const [x, y] = projetar(BRASILIA[0], BRASILIA[1]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />
    </svg>
  );
};

export const OrcamentoSalvador: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const fimB = DURACAO + 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Bahia />
            <Seta />
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        <Brasilia />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 11,9" unidade=" BILHÕES" entra={A.bi} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="SALVADOR" entra={A.bi + 30} sai={INI_B + 6} ponto={SEDE_SSA} ancora="base" seta corpo={34} dy={-10} dx={-60} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE SALVADOR" entra={A.abri} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {/* B: na cidade */}
        {tr === "B" ? <TextoDigitado texto="R$ 12,4" unidade=" BI" entra={B.n124} sai={B.resto} x={540} y={600} corpo={104} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADADO EM 2025" entra={B.arrecadou} sai={B.resto} x={540} y={700} cor={ESCURO} corpo={32} /> : null}
        {tr === "B" ? <TagNoMapa texto="IMPOSTOS DA CIDADE: POUCO MAIS DE 1 EM 3" entra={B.pouco} sai={B.resto} x={540} y={1150} cor={VERDE} corpo={30} /> : null}
        {/* B: o dinheiro de fora */}
        {tr === "B" ? <TagNoMapa texto="O RESTO VEM DE FORA" entra={B.resto + 10} sai={fimB} x={540} y={560} cor={ESCURO} corpo={34} /> : null}
        {tr === "B" ? <TagNoMapa texto="GOVERNO FEDERAL" entra={B.federal + 6} sai={B.n33} ponto={BRASILIA} dy={-60} dx={60} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · R$ 3,3 BI" entra={B.n33} sai={fimB} ponto={BRASILIA} dy={-60} dx={70} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO DA BAHIA" entra={B.estado} sai={fimB} ponto={CENTRO_ESTADO} dy={-70} dx={-90} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB" entra={B.fundeb} sai={fimB} ponto={CENTRO_ESTADO} dy={10} dx={-90} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="SALVADOR" entra={B.resto + 16} sai={fimB} ponto={SEDE_SSA} dy={135} dx={-70} cor={VERDE} corpo={28} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
