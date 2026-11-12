import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, ESTADOS, ITABUNA, PAISES, SALVADOR, SEDE_ITABUNA, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-itabuna": os dois trechos de mapa do vídeo 017 do Estúdio 3D (o orçamento de Itabuna).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (ITABUNA): do Brasil até Itabuna; o contorno do município acende; "R$ 1,1 BILHÃO".
//   B (DE ONDE VEIO): setas de Brasília (União, 543) e de Salvador (estado, 127); Fundeb (108);
//      IPTU + ISS (169); "3×". Valores do RREO dez/2025 da Prefeitura de Itabuna, p. 1.
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

// o município de Itabuna: contorno verde e preenchimento leve que acende nas palavras
const Itabuna: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(ITABUNA) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? s0(f, A.bilhao - 6) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.impostos, B.impostos + 12, B.uniao, B.uniao + 16], [0, 1, 1, 0.45], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.3 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};
const s0 = (f: number, a: number) => entra(f, a, 14);

// B: a Bahia com contorno branco fino, para situar as setas
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.federal - 24, 16);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_ITABUNA, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE_ITABUNA, -0.35);

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

// pontinhos das capitais
const Capitais: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[
        [BRASILIA, B.federal - 4],
        [SALVADOR, B.estado - 4],
      ].map(([p, a], i) => {
        const k = entra(f, a as number, 10);
        const [x, y] = projetar((p as [number, number])[0], (p as [number, number])[1]);
        return <circle key={i} cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />;
      })}
    </svg>
  );
};

export const OrcamentoItabuna: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const tres = interpolate(f, [B.triplo, B.triplo + 8], [0.6, 1], cl);
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
            <Itabuna />
          </MapaSvg>
        </BorraoRadial>
        <Capitais />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 1,1" unidade=" BILHÃO" entra={A.cem} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="ITABUNA" entra={A.bilhao + 20} sai={INI_B + 6} ponto={SEDE_ITABUNA} ancora="base" seta corpo={34} dy={-10} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE ITABUNA" entra={A.abri} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {/* B */}
        {tr === "B" ? <TagNoMapa texto="UNIÃO" entra={B.federal + 6} sai={B.n543} ponto={BRASILIA} dy={-60} dx={60} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · R$ 543 MI" entra={B.n543} sai={DURACAO + 30} ponto={BRASILIA} dy={-60} dx={110} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO · R$ 127 MI" entra={B.n127} sai={B.uniao + 10} ponto={SALVADOR} dy={-60} dx={-150} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB" entra={B.fundeb} sai={B.n108} ponto={SEDE_ITABUNA} dy={140} dx={-170} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB · R$ 108 MI" entra={B.n108} sai={B.uniao + 10} ponto={SEDE_ITABUNA} dy={140} dx={-170} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="IPTU + ISS" entra={B.iptu} sai={B.n169} ponto={SEDE_ITABUNA} dy={240} dx={-110} cor={VERDE} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="IPTU + ISS · R$ 169 MI" entra={B.n169} sai={DURACAO + 30} ponto={SEDE_ITABUNA} dy={240} dx={-150} cor={VERDE} corpo={30} /> : null}
        {tr === "B" && f >= B.triplo ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Inter, Montserrat, sans-serif", fontWeight: 900, fontSize: 150, color: "#FFFFFF", opacity: entra(f, B.triplo, 8), transform: `scale(${tres})`, textShadow: `0 0 30px ${VERDE}, 0 6px 18px rgba(0,0,0,0.7)` }}>3×</div>
        ) : null}
        {tr === "B" && f >= B.triplo ? <TagNoMapa texto="UNIÃO × IMPOSTOS DA CIDADE" entra={B.triplo + 6} sai={DURACAO + 30} x={540} y={760} cor={ESCURO} corpo={30} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
