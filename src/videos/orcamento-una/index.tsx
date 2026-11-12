import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, ESTADOS, PAISES, SALVADOR, SEDE_UNA, UNA, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-una": os dois trechos de mapa do vídeo 021 do Estúdio 3D (o orçamento de Una, BA).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (UNA): do Brasil até Una; "R$ 132 MILHÕES"; acendem Brasília (União), Salvador (estado) e Una (impostos).
//   B (DE ONDE VEIO): setas de Brasília (União 72, FPM 43) e de Salvador (estado 11); Fundeb 24.
//   Valores do RREO dez/2025 da Prefeitura de Una (Anexo 1, p. 1 e Anexo 3, p. 1). Só dados de Una.
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

// o município de Una: contorno verde e preenchimento leve que acende nas palavras
const Una: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(UNA) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.n132 - 6, 14) : 1;
  const pulso = (a: number) => Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - a) / 18)) * Math.PI));
  const pulsoA = tr === "A" ? Math.max(pulso(A.impostos), pulso(A.abri)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.fundeb, B.fundeb + 12], [0, 1], cl) : 0;
  const preench = 0.12 + 0.25 * pulsoA + 0.25 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 4 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 12 * pulsoA}px ${VERDE})` }} />
  );
};

// a Bahia com contorno branco fino, para situar as setas
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const k = trecho(f) === "A" ? interpolate(f, [A.uniao - 20, A.uniao, A.abri, A.abri + 20], [0, 1, 1, 0], cl) : entra(f, B.federal - 24, 16);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_UNA, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE_UNA, -0.35);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return (
    <>
      <TracadoGeo linha={SETA_UNIAO} desenho={[B.federal, B.federal + 24]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
      <TracadoGeo linha={SETA_ESTADO} desenho={[B.estado, B.estado + 18]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
    </>
  );
};

// pontinhos das capitais (no trecho A acendem com "União" e "estado"; no B, com as setas)
const Capitais: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const tr = trecho(f);
  const pontos: [[number, number], number][] =
    tr === "A"
      ? [
          [BRASILIA, A.uniao],
          [SALVADOR, A.estado],
        ]
      : [
          [BRASILIA, B.federal - 4],
          [SALVADOR, B.estado - 4],
        ];
  const someA = tr === "A" ? 1 - entra(f, A.abri + 10, 14) : 1;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {pontos.map(([p, a], i) => {
        const k = entra(f, a, 10) * someA;
        const [x, y] = projetar(p[0], p[1]);
        return <circle key={i} cx={x} cy={y} r={10 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />;
      })}
    </svg>
  );
};

export const OrcamentoUna: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const fimA = A.abri + 6;
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
            <Una />
          </MapaSvg>
        </BorraoRadial>
        <Capitais />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 132" unidade=" MILHÕES" entra={A.milhoes} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="RECEBIDOS EM 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TagNoMapa texto="UNIÃO" entra={A.uniao} sai={fimA} ponto={BRASILIA} dy={-50} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="ESTADO" entra={A.estado} sai={fimA} ponto={SALVADOR} dy={-50} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="IMPOSTOS DA CIDADE" entra={A.impostos} sai={A.abri - 4} ponto={SEDE_UNA} dy={70} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TextoDigitado texto="UNA" entra={A.abri - 10} sai={INI_B + 6} ponto={SEDE_UNA} ancora="base" seta corpo={34} dy={-10} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE UNA" entra={A.abri} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {/* B */}
        {tr === "B" ? <TagNoMapa texto="UNIÃO" entra={B.federal + 6} sai={B.n72} ponto={BRASILIA} dy={-60} dx={60} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · R$ 72 MI" entra={B.n72} sai={DURACAO + 30} ponto={BRASILIA} dy={-60} dx={90} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FPM" entra={B.fpm} sai={B.n43} ponto={BRASILIA} dy={10} dx={90} cor={OURO} corpo={26} /> : null}
        {tr === "B" ? <TagNoMapa texto="SÓ O FPM · R$ 43 MI" entra={B.n43} sai={DURACAO + 30} ponto={BRASILIA} dy={10} dx={110} cor={OURO} corpo={26} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO · R$ 11 MI" entra={B.n11} sai={DURACAO + 30} ponto={SALVADOR} dy={-60} dx={-130} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB" entra={B.fundeb} sai={B.n24} ponto={SEDE_UNA} dy={130} dx={-150} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB · R$ 24 MI" entra={B.n24} sai={DURACAO + 30} ponto={SEDE_UNA} dy={130} dx={-150} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TextoDigitado texto="UNA" entra={INI_B + 4} sai={DURACAO + 30} ponto={SEDE_UNA} ancora="base" seta corpo={30} dy={-10} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
