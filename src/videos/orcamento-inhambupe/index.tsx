import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { MUNICIPIO_GEO, ESTADOS, PAISES, SEDE } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-inhambupe": os dois trechos de mapa do vídeo 033 do Estúdio 3D (o orçamento de Inhambupe).
// Molde: orcamento-belmonte (032). Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (INHAMBUPE): do Brasil até a cidade, no nordeste da Bahia; o contorno do município acende;
//      tags COMBUSTÍVEL / ALUGUEL DE CARROS / LIMPEZA, QUASE DOBROU, PREFEITURA, TRIBUNAL e 2024 · GESTÃO NENA.
//   B (ARRECADOU 2024): R$ 190 MI, o total que a prefeitura informou ao TCM (sem dividir por origem).
//   Valores do Balanço 2024 enviado ao TCM-BA (Anexos 10 e 12), líquidos da formação do Fundeb.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
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
  const acendeB = tr === "B" ? interpolate(f, [B.n190, B.n190 + 12], [0, 1], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.35 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

// B: a Bahia com contorno branco fino, para situar as setas



// pontinhos das capitais

export const OrcamentoInhambupe: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
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
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        {/* A */}
        {tr === "A" ? <TextoDigitado texto="INHAMBUPE" entra={A.inicio + 50} sai={INI_B + 6} ponto={SEDE} ancora="base" seta corpo={34} dy={-10} dx={-60} /> : null}
        {tr === "A" ? <TagNoMapa texto="COMBUSTÍVEL" entra={A.combustivel} sai={A.abri - 4} x={540} y={1060} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="ALUGUEL DE CARROS" entra={A.aluguel} sai={A.abri - 4} x={540} y={1130} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="LIMPEZA" entra={A.limpeza} sai={A.abri - 4} x={540} y={1200} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="QUASE DOBROU" entra={A.dobrou} sai={A.abri - 4} x={540} y={640} cor={VERDE} corpo={40} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA DE INHAMBUPE" entra={A.abri} sai={A.ano - 6} x={540} y={1150} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="TCM-BA · TRIBUNAL DE CONTAS" entra={A.tribunal} sai={A.ano - 6} x={540} y={640} cor={ESCURO} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="2024 · GESTÃO NENA" entra={A.ano} sai={INI_B + 6} x={540} y={640} cor={ESCURO} corpo={34} /> : null}
        {/* B: na cidade, só o total arrecadado que a prefeitura informou ao TCM */}
        {tr === "B" ? <TextoDigitado texto="R$ 190" unidade=" MI" entra={B.n190} sai={DURACAO + 30} x={540} y={600} corpo={100} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADOU EM 2024" entra={B.entrou + 4} sai={DURACAO + 30} x={540} y={700} cor={ESCURO} corpo={32} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
