import { AbsoluteFill } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { CONGRESSO, ESTADOS, PAISES } from "./dados";
import { A, CHAVES, DURACAO, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// "tablets-camara": o voo até o Congresso para o vídeo 146 do Estúdio 3D (sem legenda, marca e som).
const VERDE = "#2FA36B";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.05)";

export const TabletsCamara: React.FC = () => {
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
            <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.35} />
            <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.3} opacidade={0.55} />
          </MapaSvg>
        </BorraoRadial>
        <TagNoMapa texto="BRASÍLIA" entra={6} sai={A.camara} x={540} y={1260} cor={ESCURO} corpo={30} />
        <TagNoMapa texto="CÂMARA DOS DEPUTADOS" entra={A.camara + 2} sai={DURACAO + 30} ponto={CONGRESSO} dy={-80} cor={VERDE} corpo={30} />
        <TagNoMapa texto="PREGÃO ELETRÔNICO · ABERTO EM 5/11" entra={A.pregao} sai={DURACAO + 30} x={540} y={1260} cor={ESCURO} corpo={28} />
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
