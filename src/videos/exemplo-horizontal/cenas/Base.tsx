import { SatelliteLayer } from "../../../base/componentes/SatelliteLayer";
import { Grade } from "../../../base/componentes/MapBackground";
import { useMapa } from "../../../base/componentes/MapCamera";
import { CamadaGeo } from "../../../base/componentes/StateBoundary";
import { COR } from "../../../base/estilo";
import { PAISES } from "../dados";
import { PASTA_TILES } from "../roteiro";

// ---------------------------------------------------------------------------
// A BASE do mapa na IDENTIDADE HORIZONTAL: o mapa escuro dos vídeos "São Luís", "Piauí" e "Ceará".
// O satélite é TEXTURA escura e pouco saturada (as linhas e a luz dourada mandam); de perto ele
// ganha um pouco de cor (a costa, as ilhas aparecem). A grade de meridianos e as divisas finas e
// claras por cima. A região do assunto acende com o contorno dourado (RegiaoEditorial).
// ---------------------------------------------------------------------------

export const Satelite: React.FC = () => {
  const { camera } = useMapa();
  const perto = Math.min(1, Math.max(0, (camera.zoom - 6.5) / 3.5));
  // de perto o Sentinel-2 é claro (deserto) e manchado: escurece MAIS, para continuar textura
  const sat = 0.55 - 0.05 * perto;
  const luz = 0.52 - 0.08 * perto;
  const con = 1.15 + 0.1 * perto;
  return <SatelliteLayer pasta={PASTA_TILES} tratamento={`saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) brightness(${luz.toFixed(3)})`} />;
};

export const BaseMapa: React.FC = () => {
  const { camera } = useMapa();
  const longe = 1 - Math.min(1, Math.max(0, (camera.zoom - 8) / 2));
  return (
    <>
      <Grade opacidade={0.8 * longe} />
      <CamadaGeo dados={PAISES} stroke={COR.divisaPais} strokeWidth={1.1} opacidade={0.55 + 0.25 * longe} />
    </>
  );
};
