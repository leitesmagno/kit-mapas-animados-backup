import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, MUNICIPIO_GEO, ESTADOS, PAISES, SALVADOR, SEDE, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-paratinga-setores1824": o trecho de mapa do vídeo 096 do Estúdio 3D (Paratinga 2018–2024, parceria @eugeniodmr).
// Cópia do orcamento-paratinga (035). Sem legenda, marca d'água nem som: o vídeo 3D põe tudo isso por cima.
//   A (PARATINGA): do Brasil até a cidade; tags GASTOU R$ 151,2 MI EM 2024, TCM-BA e ARRECADOU DE 2018 A 2024 R$ 690,8 MI.
//   B (ARRECADOU 2018): 2018 e R$ 70,6 MI · ARRECADOU EM 2018. Valores dos Balanços enviados ao TCM-BA.
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
  const d = caminho(MUNICIPIO_GEO) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.inicio + 40, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.arrecadou, B.arrecadou + 12], [0, 1], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.35 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// B: a Bahia com contorno branco fino, para situar as setas
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = 0 * entra(f, B.arrecadou, 16);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE, 0.35);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B" || true) return null;
  return (
    <>
      <TracadoGeo linha={SETA_UNIAO} desenho={[B.n70 + 4, B.n70 + 30]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
      <TracadoGeo linha={SETA_ESTADO} desenho={[B.n70 + 10, B.n70 + 32]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
    </>
  );
};

// pontinhos das capitais
const Capitais: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B" || true) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[
        [BRASILIA, B.n70],
        [SALVADOR, B.n70 + 6],
      ].map(([p, a], i) => {
        const k = entra(f, a as number, 10);
        const [x, y] = projetar((p as [number, number])[0], (p as [number, number])[1]);
        return <circle key={i} cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />;
      })}
    </svg>
  );
};

export const OrcamentoParatingaSetores1824: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
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
        {/* A (096): o total gasto de 2018 a 2024 e o Tribunal de Contas */}
        <TextoDigitado texto="PARATINGA" entra={A.inicio + 50} sai={DURACAO + 6} ponto={SEDE} ancora="base" seta corpo={34} dy={-10} dx={0} />
        <TagNoMapa texto="GASTOU DE 2018 A 2024" entra={A.periodo} sai={A.primeiro - 4} x={540} y={1060} cor={ESCURO} corpo={34} />
        <TextoDigitado texto="R$ 735,1" unidade=" MI" entra={A.n735} sai={A.primeiro - 4} x={540} y={1150} corpo={72} brilho={VERDE} />
        <TagNoMapa texto="TCM-BA · TRIBUNAL DE CONTAS" entra={A.tribunal} sai={DURACAO + 30} x={540} y={1100} cor={ESCURO} corpo={30} />
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
