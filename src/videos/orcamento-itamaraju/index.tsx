import { AbsoluteFill } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TextoDigitado, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { MUNICIPIO_GEO, ESTADOS, PAISES, SEDE } from "./dados";
import { A, CHAVES, DURACAO, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-itamaraju": o trecho de mapa do vídeo 071 do Estúdio 3D (o orçamento de Itamaraju). Molde: orcamento-lem.
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima (os chips do arrecadado ficam em y ~1060).
// Do Brasil até a cidade, no extremo sul da Bahia; o contorno do município acende e pulsa no "Eu abri as contas".
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.06)";

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

const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(MUNICIPIO_GEO) ?? "";
  const ini = entra(f, A.inicio + 40, 14);
  const pulso = Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI));
  const preench = 0.12 + 0.25 * pulso;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulso} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulso}px ${VERDE})` }} />
  );
};

export const OrcamentoItamaraju: React.FC = () => {
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
            <Base />
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        <TextoDigitado texto="ITAMARAJU" entra={A.inicio + 60} sai={DURACAO + 30} ponto={SEDE} ancora="base" seta corpo={36} dy={-10} dx={0} />
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
