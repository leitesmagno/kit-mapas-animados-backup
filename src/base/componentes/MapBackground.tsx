import { geoGraticule } from "d3-geo";
import { AbsoluteFill } from "remotion";
import { COR } from "../estilo";
import { useMapa } from "./MapCamera";

const GRADE = geoGraticule().step([5, 5]).extent([[-100, -60], [0, 20]])();

// O oceano (com um halo mais claro no centro do quadro) e a grade de meridianos e
// paralelos, que anda com a câmera e dá a leitura de "carta geográfica".
export const MapBackground: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 55% 45%, ${COR.oceanoLuz} 0%, ${COR.oceano} 72%)` }} />
);

export const Grade: React.FC<{ opacidade?: number }> = ({ opacidade = 1 }) => {
  const { caminho } = useMapa();
  return <path d={caminho(GRADE) ?? ""} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} opacity={opacidade} />;
};

// Escurece as bordas do quadro: o olho vai para o centro, como numa lente.
export const Vinheta: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(2,5,8,0.72) 100%)",
    }}
  />
);
