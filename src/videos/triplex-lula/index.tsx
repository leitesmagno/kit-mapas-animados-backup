import { AbsoluteFill } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TracadoGeo, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BRASILIA, CURITIBA, ESTADOS, GUARUJA, UF, arco } from "./dados";
import { A, B, C, CHAVES, DURACAO, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "triplex-lula": três trechos de mapa do vídeo 149 do Estúdio 3D. Só lugares, sem juízo.
// ---------------------------------------------------------------------------
const AZUL = "#2F7FD1";
const AREIA = "#E0A43A";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.05)";
type T = "A" | "B" | "C";
const trecho = (f: number): T => (f < INI_B ? "A" : f < INI_C ? "B" : "C");
const SP = UF("SP");
const PR = UF("PR");
const DF = UF("DF");
const ROTA_B = arco(GUARUJA, CURITIBA, 0.2);
const ROTA_C = arco(CURITIBA, BRASILIA, -0.15);

const Base: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const t = trecho(f);
  const realce = (uf: typeof SP, k: number, cor: string) => (
    <path d={caminho(uf) ?? ""} fill={cor} fillOpacity={0.16 * k} stroke="#FFFFFF" strokeWidth={2.2} strokeOpacity={0.85 * k} strokeLinejoin="round" />
  );
  return (
    <>
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.28} />
      {t === "A" ? realce(SP, entra(f, A.sp, 12) * (1 - entra(f, A.praia, 12)), AREIA) : null}
      {t === "B" ? realce(PR, entra(f, B.voo, 12), AZUL) : null}
      {t === "C" ? realce(DF, entra(f, C.brasilia, 8), AREIA) : null}
      {t === "B" ? <TracadoGeo linha={ROTA_B} desenho={[B.voo, B.curitiba]} sai={INI_C + 30} estilo="trilha" cor="#FFFFFF" largura={4} fluxo={1.2} /> : null}
      {t === "C" ? <TracadoGeo linha={ROTA_C} desenho={[C.voo, C.brasilia + 6]} sai={DURACAO + 30} estilo="trilha" cor="#FFFFFF" largura={4} fluxo={1.2} /> : null}
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

export const TriplexLula: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const zz = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const corte = f === INI_B || f === INI_C;
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

        {/* A: o imóvel */}
        {t === "A" ? <TagNoMapa texto="SÃO PAULO" entra={A.sp + 6} sai={A.guaruja + 16} x={540} y={1260} cor={ESCURO} corpo={28} /> : null}
        {t === "A" ? <Pino ponto={GUARUJA} de={A.guaruja} cor={AREIA} /> : null}
        {t === "A" ? <TagNoMapa texto="GUARUJÁ (SP)" entra={A.guaruja + 4} sai={INI_B} ponto={GUARUJA} dy={-66} cor={ESCURO} corpo={28} /> : null}
        {t === "A" ? <TagNoMapa texto="PRAIA DAS ASTÚRIAS · CONDOMÍNIO SOLARIS" entra={A.praia} sai={INI_B} x={540} y={1250} cor={AREIA} corTexto={ESCURO} corpo={24} /> : null}
        {t === "A" ? <TagNoMapa texto="UNIDADE 164-A · 215 m² · 3 ANDARES" entra={A.tres} sai={INI_B} x={540} y={1310} cor={ESCURO} corpo={22} /> : null}

        {/* B: a prisão em Curitiba */}
        {t === "B" ? <TagNoMapa texto="7 DE ABRIL DE 2018" entra={B.data} sai={DURACAO} x={540} y={1260} cor={ESCURO} corpo={28} /> : null}
        {t === "B" ? <Pino ponto={CURITIBA} de={B.curitiba - 6} /> : null}
        {t === "B" ? <TagNoMapa texto="CURITIBA · POLÍCIA FEDERAL" entra={B.curitiba} sai={DURACAO} ponto={CURITIBA} dy={-66} cor={AZUL} corpo={26} /> : null}

        {/* C: o processo vai a Brasília */}
        {t === "C" ? <Pino ponto={CURITIBA} de={INI_C} /> : null}
        {t === "C" ? <TagNoMapa texto="CURITIBA" entra={INI_C + 2} sai={FIM} ponto={CURITIBA} dy={-60} cor={ESCURO} corpo={24} /> : null}
        {t === "C" ? <Pino ponto={BRASILIA} de={C.brasilia} cor={AREIA} /> : null}
        {t === "C" ? <TagNoMapa texto="BRASÍLIA · JUSTIÇA FEDERAL DO DF" entra={C.brasilia + 2} sai={FIM} ponto={BRASILIA} dy={-66} cor={ESCURO} corpo={26} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
