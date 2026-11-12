import { AbsoluteFill } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, CAIRU, ESTADOS, ISRAEL, ITACARE, MORRO, PITUBA, PRACA, SEDE_ITACARE, arco } from "./dados";
import { A, B, C, CHAVES, D, DURACAO, E, INI_B, INI_C, INI_D, INI_E, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "israelenses-itacare": os cinco trechos de mapa do vídeo 148 do Estúdio 3D.
// Tom informativo: só lugares e números das fontes (Cairu, vereador). Pontos da cidade são aproximados.
// Israel aparece só como ponto com nome, sem desenhar fronteira.
// ---------------------------------------------------------------------------
const AZUL = "#2F7FD1";
const AREIA = "#E0A43A";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.05)";
type T = "A" | "B" | "C" | "D" | "E";
const trecho = (f: number): T => (f < INI_B ? "A" : f < INI_C ? "B" : f < INI_D ? "C" : f < INI_E ? "D" : "E");
const ROTA = arco(ISRAEL, SEDE_ITACARE, -0.12);

const Base: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const t = trecho(f);
  const kE = t === "E" ? entra(f, E.bahia, 12) : 0;
  const longe = t === "A" || t === "E";
  // no centro da cidade o contorno simplificado do IBGE corta as ruas: some
  if (t === "C" || t === "D") return null;
  return (
    <>
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.2} opacidade={longe ? 0.3 : 0.15} />
      <CamadaGeo dados={BAHIA} stroke="#FFFFFF" strokeWidth={2} opacidade={t === "E" ? 0.5 + 0.4 * kE : 0.5} />
      {t === "E" ? <path d={caminho(BAHIA) ?? ""} fill={`rgba(255,255,255,${(0.08 * kE).toFixed(3)})`} stroke="none" /> : null}
      {t === "B" || t === "E" ? (
        <>
          <path d={caminho(CAIRU) ?? ""} fill={AREIA} fillOpacity={0.18 * (t === "B" ? entra(f, B.morro, 10) : entra(f, E.morro, 10))} stroke="#FFF6E5" strokeWidth={2} strokeOpacity={0.8 * (t === "B" ? entra(f, B.morro, 10) : entra(f, E.morro, 10))} strokeLinejoin="round" />
          <path d={caminho(ITACARE) ?? ""} fill={AZUL} fillOpacity={0.2 * (t === "B" ? entra(f, B.itacare, 10) : entra(f, E.itacare, 10))} stroke="#EAF4FF" strokeWidth={2.2} strokeOpacity={0.9 * (t === "B" ? entra(f, B.itacare, 10) : entra(f, E.itacare, 10))} strokeLinejoin="round" />
        </>
      ) : null}
      {t === "A" ? <TracadoGeo linha={ROTA} desenho={[A.voo, A.chega]} sai={INI_B + 30} estilo="trilha" cor="#FFFFFF" largura={4} fluxo={1.2} /> : null}
    </>
  );
};

const Pino: React.FC<{ ponto: [number, number]; de: number; cor?: string }> = ({ ponto, de, cor = AZUL }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const k = entra(f, de, 10);
  if (k <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const p = 1 + 0.08 * Math.sin(f / 6);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={22 * k * p} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.6 * k} />
      <circle cx={x} cy={y} r={10 * k} fill={cor} stroke="#FFFFFF" strokeWidth={3} />
    </svg>
  );
};

export const IsraelensesItacare: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const zz = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const corte = f === INI_B || f === INI_C || f === INI_D || f === INI_E;
  const borrao = corte ? 0 : Math.min(0.8, Math.max(0, (Math.abs(zz(f) - zz(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  const FIM = DURACAO + 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
          </MapaSvg>
        </BorraoRadial>

        {/* A: de onde vêm */}
        {t === "A" ? <Pino ponto={ISRAEL} de={A.israel} cor={AREIA} /> : null}
        {t === "A" ? <TagNoMapa texto="ISRAEL" entra={A.israel + 4} sai={A.voo + 20} ponto={ISRAEL} dy={-64} cor={ESCURO} corpo={30} /> : null}
        {t === "A" ? <TagNoMapa texto="VIAGEM DEPOIS DO EXÉRCITO" entra={A.voo + 10} sai={A.chega} x={540} y={1260} cor={ESCURO} corpo={26} /> : null}
        {t === "A" ? <Pino ponto={SEDE_ITACARE} de={A.pontos} /> : null}
        {t === "A" ? <Pino ponto={MORRO} de={A.pontos + 6} cor={AREIA} /> : null}
        {t === "A" ? <TagNoMapa texto="SUL DA BAHIA" entra={A.chega - 4} sai={INI_B + 10} x={540} y={1270} cor={ESCURO} corpo={30} /> : null}
        {t === "A" ? <TagNoMapa texto="ITACARÉ" entra={A.pontos + 4} sai={INI_B + 10} ponto={SEDE_ITACARE} dy={-60} cor={AZUL} corpo={26} /> : null}
        {t === "A" ? <TagNoMapa texto="MORRO DE SÃO PAULO" entra={A.pontos + 10} sai={INI_B + 10} ponto={MORRO} dy={-60} cor={ESCURO} corpo={24} /> : null}

        {/* B: quantos */}
        {t === "B" ? <Pino ponto={MORRO} de={B.morro} cor={AREIA} /> : null}
        {t === "B" ? <TagNoMapa texto="MORRO DE SÃO PAULO · CAIRU" entra={B.morro + 4} sai={B.voo + 8} ponto={MORRO} dy={-66} cor={ESCURO} corpo={26} /> : null}
        {t === "B" ? <TagNoMapa texto="≈ 15 MIL ISRAELENSES EM 2025" entra={B.quinze} sai={B.voo + 8} ponto={MORRO} dy={70} cor={AREIA} corTexto={ESCURO} corpo={26} /> : null}
        {t === "B" ? <TagNoMapa texto="FONTE: TURISMO DE CAIRU" entra={B.quinze + 10} sai={B.voo + 8} ponto={MORRO} dy={124} cor={ESCURO} corpo={18} /> : null}
        {t === "B" ? <Pino ponto={SEDE_ITACARE} de={B.itacare} /> : null}
        {t === "B" ? <TagNoMapa texto="ITACARÉ" entra={B.itacare + 4} sai={FIM} ponto={SEDE_ITACARE} dy={-66} cor={AZUL} corpo={30} /> : null}
        {t === "B" ? <TagNoMapa texto="SEM NÚMERO OFICIAL" entra={B.semNumero + 6} sai={FIM} x={540} y={1250} cor={ESCURO} corpo={26} /> : null}
        {t === "B" ? <TagNoMapa texto="≈ 3 MIL POR ANO · ESTIMATIVA DE VEREADOR" entra={B.tres} sai={FIM} x={540} y={1310} cor={AZUL} corpo={22} /> : null}

        {/* C: Rua da Pituba */}
        {t === "C" ? <Pino ponto={PITUBA} de={C.pituba} /> : null}
        {t === "C" ? <TagNoMapa texto="RUA DA PITUBA" entra={C.pituba + 4} sai={FIM} ponto={PITUBA} dy={-66} cor={AZUL} corpo={30} /> : null}
        {t === "C" ? <TagNoMapa texto="MARÇO DE 2026" entra={C.voo} sai={FIM} x={540} y={1260} cor={ESCURO} corpo={26} /> : null}

        {/* D: Casarão Azul */}
        {t === "D" ? <Pino ponto={PRACA} de={D.casarao - 4} /> : null}
        {t === "D" ? <TagNoMapa texto="30 DE OUTUBRO" entra={D.data} sai={FIM} x={540} y={1260} cor={ESCURO} corpo={26} /> : null}
        {t === "D" ? <TagNoMapa texto="CASARÃO AZUL · PRAÇA SÃO MIGUEL" entra={D.casarao} sai={FIM} ponto={PRACA} dy={-66} cor={AZUL} corpo={26} /> : null}

        {/* E: o governo */}
        {t === "E" ? <TagNoMapa texto="GOVERNO DA BAHIA" entra={E.bahia} sai={E.itacare} x={540} y={1260} cor={ESCURO} corpo={28} /> : null}
        {t === "E" ? <Pino ponto={SEDE_ITACARE} de={E.itacare} /> : null}
        {t === "E" ? <Pino ponto={MORRO} de={E.morro} cor={AREIA} /> : null}
        {t === "E" ? <TagNoMapa texto="ITACARÉ" entra={E.itacare + 4} sai={FIM} ponto={SEDE_ITACARE} dy={-60} cor={AZUL} corpo={26} /> : null}
        {t === "E" ? <TagNoMapa texto="MORRO DE SÃO PAULO" entra={E.morro + 4} sai={FIM} ponto={MORRO} dy={-60} cor={ESCURO} corpo={24} /> : null}
        {t === "E" ? <TagNoMapa texto="POLÍCIA CIVIL INVESTIGA" entra={E.policia} sai={FIM} x={540} y={1270} cor={ESCURO} corpo={26} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
