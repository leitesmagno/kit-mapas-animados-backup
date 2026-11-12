import { AbsoluteFill } from "remotion";
import { HEIGHT } from "../../tema";

type Props = {
  // Onde o véu começa a escurecer e onde ele fecha, em px de tela.
  de?: number;
  para?: number;
  forca?: number;
  // Por cima, para texto no alto da tela.
  emCima?: boolean;
};

// Um véu escuro entre o mapa e o texto. Número laranja sobre estado laranja some; este
// degradê devolve o contraste sem apagar o mapa — é o truque de documentário geográfico.
export const VeuDeTexto: React.FC<Props> = ({ de = HEIGHT * 0.55, para = HEIGHT, forca = 0.82, emCima = false }) => (
  <AbsoluteFill
    style={{
      backgroundImage: emCima
        ? `linear-gradient(0deg, transparent ${(1 - de / HEIGHT) * 100}%, rgba(8,8,8,${forca}) 100%)`
        : `linear-gradient(180deg, transparent ${(de / HEIGHT) * 100}%, rgba(8,8,8,${forca}) ${(para / HEIGHT) * 100}%)`,
      pointerEvents: "none",
    }}
  />
);
