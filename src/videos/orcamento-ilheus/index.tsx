import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BRASILIA, CENTRO_ILHEUS, ESTADOS, ILHEUS, PAISES, SALVADOR, SEDE_ILHEUS, arco } from "./dados";
import { A, B, C, CHAVES, DURACAO, DUR_A, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-ilheus": os três trechos de mapa do vídeo 014 do Estúdio 3D (o orçamento de Ilhéus).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (ILHÉUS): do Brasil até Ilhéus; o contorno do município acende; "R$ 790 MILHÕES".
//   B (DE ONDE VEM): "R$ 823 MILHÕES ARRECADADOS"; IPTU + ISS de dentro da cidade; setas de
//      Brasília (União) e de Salvador (estado); o Fundeb. Valores do RREO dez/2025, p. 1.
//   C (É SEU): Ilhéus de novo; o endereço do portal; as cinco áreas em volta.
// O verde é o acento do perfil @eumagnoleite (#2FA36B).
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const OURO = "#C99A2E";
const ESCURO = "#1E2530";
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

// o município de Ilhéus: contorno verde (todos os trechos) e preenchimento leve que acende nas palavras
const Ilheus: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(ILHEUS) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? s0(f, A.n790 - 6) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.cadaReal) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.impostos, B.impostos + 12, B.federal - 6, B.federal + 10], [0, 1, 1, 0.45], cl) : 0;
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

const SETA_UNIAO = arco(BRASILIA, SEDE_ILHEUS, 0.22);
const SETA_ESTADO = arco(SALVADOR, SEDE_ILHEUS, -0.35);

const Setas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B") return null;
  return (
    <>
      <TracadoGeo linha={SETA_UNIAO} desenho={[B.federal, B.federal + 24]} sai={INI_C + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
      <TracadoGeo linha={SETA_ESTADO} desenho={[B.estado, B.estado + 18]} sai={INI_C + 30} estilo="trilha" cor={OURO} largura={4} fluxo={1.2} />
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

// B: "só 1 de cada 4 reais": quatro moedas em fila, uma acende
const QuatroMoedas: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B" || f < B.umDeQuatro - 2) return null;
  const sai = interpolate(f, [B.iptu - 8, B.iptu + 4], [1, 0], cl);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={sai}>
      {[0, 1, 2, 3].map((i) => {
        const k = entra(f, B.umDeQuatro + i * 3, 8);
        const acesa = i === 0 ? entra(f, B.umDeQuatro + 14, 10) : 0;
        return (
          <g key={i} transform={`translate(${405 + i * 90},790) scale(${k})`} opacity={k}>
            <circle r={34} fill={acesa > 0 ? VERDE : "#8C8F96"} fillOpacity={0.35 + 0.65 * Math.max(acesa, i === 0 ? 0 : 0.6)} stroke="#FFFFFF" strokeWidth={4} />
            <text y={12} textAnchor="middle" fontFamily="Inter, Montserrat, sans-serif" fontWeight={900} fontSize={32} fill="#FFFFFF">R$</text>
          </g>
        );
      })}
    </svg>
  );
};

const AREAS = ["EDUCAÇÃO", "SAÚDE", "TRANSPORTE", "SANEAMENTO", "SEGURANÇA"];
const POS_AREAS: [number, number][] = [[-250, -230], [250, -200], [-280, 40], [270, 70], [0, 230]];

export const OrcamentoIlheus: React.FC = () => {
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
        <Capitais />
        <QuatroMoedas />
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="R$ 790" unidade=" MILHÕES" entra={A.n790} sai={DUR_A + 30} x={540} y={600} corpo={96} brilho={VERDE} /> : null}
        {tr === "A" ? <TagNoMapa texto="GASTOS DE 2025" entra={A.em2025} sai={DUR_A + 30} x={540} y={690} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="ILHÉUS" entra={A.n790 + 30} sai={DUR_A + 30} ponto={SEDE_ILHEUS} ancora="base" seta corpo={34} dy={-10} /> : null}
        {/* B */}
        {tr === "B" ? <TextoDigitado texto="R$ 823" unidade=" MILHÕES" entra={B.n823} sai={B.iptu - 8} x={540} y={600} corpo={88} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADADOS EM 2025" entra={B.n823 + 8} sai={B.iptu - 8} x={540} y={690} cor={ESCURO} corpo={32} /> : null}
        {tr === "B" ? <TagNoMapa texto="IPTU + ISS · R$ 201 MI" entra={B.iptu} sai={INI_C + 30} ponto={SEDE_ILHEUS} dy={70} dx={-190} cor={VERDE} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="UNIÃO · R$ 343 MI" entra={B.federal + 6} sai={INI_C + 30} ponto={BRASILIA} dy={-60} dx={110} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ESTADO · R$ 154 MI" entra={B.estado + 6} sai={INI_C + 30} ponto={SALVADOR} dy={-60} dx={-150} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="FUNDEB · R$ 107 MI" entra={B.fundeb} sai={INI_C + 30} ponto={SEDE_ILHEUS} dy={140} dx={-170} cor={ESCURO} corpo={30} /> : null}
        {/* C */}
        {tr === "C" ? <TextoDigitado texto="ILHÉUS" entra={INI_C + 6} sai={DURACAO + 30} ponto={SEDE_ILHEUS} ancora="base" seta corpo={36} dy={-10} /> : null}
        {tr === "C" ? <TagNoMapa texto="transparencia.ilheus.ba.gov.br" entra={C.portal} sai={C.areas + 2} x={540} y={1110} cor={ESCURO} corpo={30} /> : null}
        {tr === "C"
          ? AREAS.map((a, i) => <TagNoMapa key={a} texto={a} entra={C.areas + i * 12} sai={DURACAO + 30} ponto={CENTRO_ILHEUS} dx={POS_AREAS[i][0]} dy={POS_AREAS[i][1]} cor={i % 2 ? ESCURO : VERDE} corpo={30} />)
          : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
