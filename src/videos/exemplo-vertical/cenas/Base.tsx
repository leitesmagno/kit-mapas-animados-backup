import { SatelliteLayer } from "../../../base/componentes/SatelliteLayer";
import { useMapa } from "../../../base/componentes/MapCamera";
import { CamadaGeo } from "../../../base/componentes/StateBoundary";
import { ESTADOS, PAISES } from "../dados";
import { PASTA_TILES, ZOOM_MAX_TILES } from "../roteiro";
import { useQuadro } from "../../../kit";
import { cinzaDoPassado } from "./Estado";

// ---------------------------------------------------------------------------
// A BASE do mapa, por baixo das cenas. No estilo "Mapas Animados" o satélite fica CLARO e
// com cor (nada de escurecer o mapa inteiro): o Blue Marble da NASA com o relevo submarino, o
// oceano puxado para o azul-petróleo do canal, a terra um pouco mais saturada. Divisas brancas
// finas. De perto, o Sentinel-2 sem nuvens da EOX (scripts/satelite/perto.py, chamado pelo npm run tiles).
// ---------------------------------------------------------------------------

const TRATAMENTO = "hue-rotate(-8deg) saturate(1.25) contrast(1.06) brightness(1.15)";

// a HISTÓRIA (a borracha e as sementes): o satélite perde a cor em "No auge da borracha" e a recupera em
// "Décadas depois" — o cinza do canal para o passado
export const Satelite: React.FC = () => {
  const cinza = cinzaDoPassado(useQuadro());
  return <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={cinza > 0 ? `${TRATAMENTO} grayscale(${cinza.toFixed(3)})` : TRATAMENTO} />;
};

// as divisas: brancas finas (países um pouco mais fortes); somem de perto (as cidades são o assunto)
export const BaseMapa: React.FC = () => {
  const { camera } = useMapa();
  const longe = Math.min(1, Math.max(0, (9.6 - camera.zoom) / 1.2));
  if (longe <= 0) return null;
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.8} opacidade={0.75 * longe} />
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.4} opacidade={0.6 * longe} />
    </>
  );
};
