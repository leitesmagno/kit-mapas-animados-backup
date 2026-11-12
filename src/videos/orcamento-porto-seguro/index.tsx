import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, ESTADOS, PAISES, PORTO_SEGURO, SALVADOR, SEDE_PS, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-porto-seguro": os dois trechos de mapa do vídeo 024 do Estúdio 3D (o orçamento de Porto Seguro).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (PORTO SEGURO): do Brasil até Porto Seguro; o contorno do município acende; "R$ 1,15 BILHÃO".
//   B (DE ONDE VEM): arrecadou R$ 1,155 bi; 1 de cada 4 reais dos impostos da cidade; setas de Brasília
//      (governo federal) e de Salvador (estado), Fundeb e empréstimos (R$ 100 mi, previsto 30).
// Só dados de Porto Seguro: RREO dez/2025 da Prefeitura de Porto Seguro (Anexo 1, p. 1 e 2).
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

// o município de Porto Seguro: contorno verde e preenchimento leve que acende nas palavras
const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(PORTO_SEGURO) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.bilhao - 6, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.umDe4, B.umDe4 + 12, B.federal, B.federal + 16], [0, 1, 1, 0.5], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.3 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// a Bahia com contorno branco fino, para situar as setas
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.federal - 10, 16);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.8 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_PS, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE_PS, -0.35);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return (
    <>
      <TracadoGeo linha={SETA_UNIAO} desenho={[B.federal + 4, B.federal + 26]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
      <TracadoGeo linha={SETA_ESTADO} desenho={[B.estado, B.estado + 18]} sai={DURACAO + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
    </>
  );
};

// pontinhos de Brasília e Salvador
const Capitais: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[
        [BRASILIA, B.federal],
        [SALVADOR, B.estado - 4],
      ].map(([p, a], i) => {
        const k = entra(f, a as number, 10);
        const [x, y] = projetar((p as [number, number])[0], (p as [number, number])[1]);
        return <circle key={i} cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />;
      })}
    </svg>
  );
};

export const OrcamentoPortoSeguro: React.FC = () => {
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
        {tr === "A" ? <TextoDigitado texto="R$ 1,15" unidade=" BILHÃO" entra={A.n150} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="PORTO SEGURO" entra={A.bilhao + 20} sai={INI_B + 6} ponto={SEDE_PS} ancora="base" seta corpo={34} dy={-10} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE PORTO SEGURO" entra={A.abri} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {/* B: na cidade */}
        {tr === "B" ? <TextoDigitado texto="R$ 1,155" unidade=" BILHÃO" entra={B.n155} sai={B.federal - 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADADOS EM 2025" entra={B.arrecadou} sai={B.federal - 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "B" ? <TagNoMapa texto="IMPOSTOS DA CIDADE: 1 DE CADA 4 REAIS" entra={B.umDe4} sai={B.federal - 6} x={540} y={1150} cor={VERDE} corpo={30} /> : null}
        {/* B: o dinheiro de fora */}
        {tr === "B" ? <TagNoMapa texto="GOVERNO FEDERAL" entra={B.federal + 8} sai={fim} ponto={BRASILIA} dy={-60} dx={90} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO" entra={B.estado} sai={fim} ponto={SALVADOR} dy={-60} dx={-90} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB" entra={B.fundeb} sai={fim} ponto={SEDE_PS} dy={110} dx={-190} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="EMPRÉSTIMOS" entra={B.emprestimos} sai={B.n100} ponto={SEDE_PS} dy={190} dx={-230} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="EMPRÉSTIMOS: R$ 100 MI" entra={B.n100} sai={fim} ponto={SEDE_PS} dy={190} dx={-230} cor={VERDE} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="PREVISTO: R$ 30 MI" entra={B.n30} sai={fim} ponto={SEDE_PS} dy={265} dx={-230} cor={ESCURO} corpo={28} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
