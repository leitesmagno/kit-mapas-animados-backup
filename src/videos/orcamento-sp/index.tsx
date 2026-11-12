import { AbsoluteFill } from "remotion";
import { interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BRASILIA, CENTRO_ESTADO, ESTADOS, ESTADO_SP, MUNICIPIO_SP, PAISES, SEDE_SP, arco } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-sp": os dois trechos de mapa do vídeo 020 do Estúdio 3D (o orçamento da cidade de São Paulo).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (SÃO PAULO): do Brasil até a cidade; o contorno do município acende; "R$ 117 BILHÕES"; as duas surpresas.
//   B (QUEM PAGA): seta de Brasília (União, cerca de 5 bi); o estado de SP acende (12 bi); Fundeb (8 bi);
//      volta para a cidade: impostos da cidade 67 bi; ISS 39 bi; IPTU 18 bi.
//   Valores do RREO dez/2025 da Prefeitura de São Paulo (Anexo 1, p. 1, e Anexo 3, p. 1).
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

// o município de São Paulo: contorno verde e preenchimento leve que acende nas palavras
const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(MUNICIPIO_SP) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.bi - 6, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.relatorios) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.cidade, B.cidade + 14], [0, 1], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.3 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// o estado de São Paulo: contorno branco no trecho B, acende em "O estado"
const Estado: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.federal - 24, 16);
  const acende = interpolate(f, [B.estado, B.estado + 12, B.cidade, B.cidade + 20], [0, 1, 1, 0.2], cl);
  return <path d={caminho(ESTADO_SP) ?? ""} fill={OURO} fillOpacity={0.18 * acende} stroke="#FFFFFF" strokeWidth={2.4 + 1.6 * acende} strokeOpacity={0.85 * k} strokeLinejoin="round" />;
};

const SETA_UNIAO = arco(BRASILIA, SEDE_SP, 0.22);

const Seta: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return <TracadoGeo linha={SETA_UNIAO} desenho={[B.federal, B.federal + 24]} sai={B.cidade + 10} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />;
};

const Brasilia: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  const k = entra(f, B.federal - 4, 10) * (1 - entra(f, B.cidade, 12));
  const [x, y] = projetar(BRASILIA[0], BRASILIA[1]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={9 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} opacity={k} />
    </svg>
  );
};

export const OrcamentoSp: React.FC = () => {
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
            <Estado />
            <Seta />
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        <Brasilia />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 117" unidade=" BILHÕES" entra={A.bi} sai={INI_B + 6} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={INI_B + 6} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="SÃO PAULO" entra={A.bi + 30} sai={INI_B + 6} ponto={SEDE_SP} ancora="base" seta corpo={34} dy={-10} /> : null}
        {tr === "A" ? <TagNoMapa texto="QUASE R$ 10 MIL POR MORADOR" entra={A.morador} sai={A.terceira} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {tr === "A" ? <TagNoMapa texto="A 3ª MAIOR CONTA: ?" entra={A.terceira} sai={A.centavos} x={540} y={1150} cor={ESCURO} corpo={32} /> : null}
        {tr === "A" ? <TagNoMapa texto="MENOS DE R$ 0,50 POR MORADOR: ?" entra={A.centavos} sai={A.relatorios} x={540} y={1150} cor={ESCURO} corpo={32} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE SÃO PAULO" entra={A.relatorios} sai={INI_B + 6} x={540} y={1150} cor={VERDE} corpo={32} /> : null}
        {/* B: de fora */}
        {tr === "B" ? <TagNoMapa texto="UNIÃO" entra={B.federal + 6} sai={B.n5} ponto={BRASILIA} dy={-60} dx={60} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · ≈ R$ 5 BI" entra={B.n5} sai={B.cidade} ponto={BRASILIA} dy={-60} dx={80} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO DE SP · R$ 12 BI" entra={B.n12} sai={B.cidade} ponto={CENTRO_ESTADO} dy={-70} dx={0} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB" entra={B.fundeb} sai={B.n8} ponto={CENTRO_ESTADO} dy={40} dx={0} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB · R$ 8 BI" entra={B.n8} sai={B.cidade} ponto={CENTRO_ESTADO} dy={40} dx={0} cor={ESCURO} corpo={30} /> : null}
        {/* B: a própria cidade */}
        {tr === "B" ? <TextoDigitado texto="R$ 67" unidade=" BI" entra={B.n67} sai={B.iss} x={540} y={600} corpo={110} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="IMPOSTOS DA PRÓPRIA CIDADE" entra={B.n67 + 4} sai={B.iss} x={540} y={700} cor={VERDE} corpo={32} /> : null}
        {tr === "B" ? <TagNoMapa texto="6 DE CADA 10 REAIS QUE ENTRAM" entra={B.seis} sai={B.iss} x={540} y={1150} cor={ESCURO} corpo={32} /> : null}
        {tr === "B" ? <TextoDigitado texto="ISS · R$ 39" unidade=" BI" entra={B.n39} sai={fimB} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="IMPOSTO SOBRE SERVIÇOS" entra={B.iss} sai={fimB} x={540} y={700} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="IPTU · R$ 18 BI" entra={B.n18} sai={fimB} x={540} y={1150} cor={ESCURO} corpo={34} /> : null}
        {tr === "B" ? <TagNoMapa texto="IPTU" entra={B.iptu} sai={B.n18} x={540} y={1150} cor={ESCURO} corpo={34} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
