import { AbsoluteFill } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, BARRA_VELHA, CENTROS, ESTADOS, ITAMARAJU_PT, KAI, MONTE_PASCOAL, NOMES, PORTO_SEGURO, QUATRO } from "./dados";
import { A, B, C, CHAVES, DUR_A, DURACAO, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "barra-velha": os três trechos de mapa do vídeo 147 do Estúdio 3D.
//   A: Bahia → extremo sul → Porto Seguro, aldeia Barra Velha e Monte Pascoal (pontos aproximados).
//   B: os 4 municípios onde fica a TI (MPF): Porto Seguro, Prado, Itamaraju e Itabela; ~52,7 mil ha.
//   C: as duas operações de 9/12/2025 (Polícia Civil): Sombras da Mata (Itamaraju) e Tekó Porã (Prado).
// Neutro: plaquinhas só com os números da fonte, mesma cor para os dois lados.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.05)";
const trecho = (f: number) => (f < INI_B ? "A" : f < INI_C ? "B" : "C");

const Base: React.FC = () => {
  const f = useQuadro();
  const t = trecho(f);
  return (
    <>
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.35} />
      <CamadaGeo dados={BAHIA} stroke="#FFFFFF" strokeWidth={2} opacidade={t === "A" ? 0.8 : 0.4} />
      {t === "A" ? <CamadaGeo dados={PORTO_SEGURO} stroke="#E9FFF3" strokeWidth={2.4} opacidade={0.9 * entra(f, A.portoSeguro, 10)} fill={`rgba(47,163,107,${(0.16 * entra(f, A.portoSeguro, 10)).toFixed(3)})`} /> : null}
    </>
  );
};

const Quatro: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const t = trecho(f);
  if (t === "A") return null;
  return (
    <g>
      {QUATRO.map((m, i) => {
        const k = t === "B" ? entra(f, B.cidades[i], 8) : 1;
        return <path key={i} d={caminho(m) ?? ""} fill={VERDE} fillOpacity={(t === "B" ? 0.28 : 0.1) * k} stroke="#E9FFF3" strokeWidth={1.8} strokeOpacity={(t === "B" ? 0.9 : 0.5) * k} strokeLinejoin="round" />;
      })}
    </g>
  );
};

const Pino: React.FC<{ ponto: [number, number]; de: number }> = ({ ponto, de }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const k = entra(f, de, 10);
  if (k <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const p = 1 + 0.08 * Math.sin(f / 6);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={22 * k * p} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.6 * k} />
      <circle cx={x} cy={y} r={10 * k} fill={VERDE} stroke="#FFFFFF" strokeWidth={3} />
    </svg>
  );
};

export const BarraVelha: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_B || f === INI_C ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Quatro />
          </MapaSvg>
        </BorraoRadial>
        {t === "A" ? <Pino ponto={BARRA_VELHA} de={A.portoSeguro + 6} /> : null}
        {t === "A" ? <TagNoMapa texto="EXTREMO SUL DA BAHIA" entra={A.sul - 6} sai={A.portoSeguro + 4} x={540} y={1260} cor={ESCURO} corpo={30} /> : null}
        {t === "A" ? <TagNoMapa texto="ALDEIA BARRA VELHA" entra={A.portoSeguro + 8} sai={DUR_A + 10} ponto={BARRA_VELHA} dy={-64} cor={VERDE} corpo={28} /> : null}
        {t === "A" ? <TagNoMapa texto="MONTE PASCOAL" entra={A.monte} sai={DUR_A + 10} ponto={MONTE_PASCOAL} dy={64} cor={ESCURO} corpo={26} /> : null}
        {t === "A" ? <TagNoMapa texto="PORTO SEGURO" entra={A.portoSeguro} sai={DUR_A + 10} x={540} y={1260} cor={ESCURO} corpo={30} /> : null}
        {t === "B" ? <TagNoMapa texto="TERRA INDÍGENA · CERCA DE 52,7 MIL HECTARES" entra={INI_B + 6} sai={INI_B + 1000} x={540} y={1270} cor={VERDE} corpo={26} /> : null}
        {t === "B" ? NOMES.map((n, i) => <TagNoMapa key={n} texto={n} entra={B.cidades[i]} sai={INI_B + 1000} ponto={CENTROS[i]} dy={-10} cor={ESCURO} corpo={24} />) : null}
        {t === "B" ? <TagNoMapa texto="EM PARTE DE 4 MUNICÍPIOS" entra={B.cidades[3] + 8} sai={INI_B + 1000} x={540} y={1340} cor={ESCURO} corpo={24} /> : null}
        {t === "C" ? <Pino ponto={ITAMARAJU_PT} de={C.itamaraju} /> : null}
        {t === "C" ? <Pino ponto={KAI} de={C.prado} /> : null}
        {t === "C" ? <TagNoMapa texto="FAZENDA · ITAMARAJU" entra={C.itamaraju} sai={DURACAO + 30} ponto={ITAMARAJU_PT} dy={-70} cor={ESCURO} corpo={26} /> : null}
        {t === "C" ? <TagNoMapa texto="6 MANDADOS DE PRISÃO" entra={C.seis} sai={DURACAO + 30} ponto={ITAMARAJU_PT} dy={70} cor={VERDE} corpo={26} /> : null}
        {t === "C" ? <TagNoMapa texto="ALDEIA KAI · PRADO" entra={C.prado} sai={DURACAO + 30} ponto={KAI} dy={-70} cor={ESCURO} corpo={26} /> : null}
        {t === "C" ? <TagNoMapa texto="2 DE BUSCA · 0 DE PRISÃO" entra={C.zero} sai={DURACAO + 30} ponto={KAI} dy={70} cor={VERDE} corpo={26} /> : null}
        {t === "C" ? <TagNoMapa texto="DEZEMBRO DE 2025 · MESMO DIA" entra={INI_C + 6} sai={DURACAO + 30} x={540} y={1300} cor={ESCURO} corpo={26} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
