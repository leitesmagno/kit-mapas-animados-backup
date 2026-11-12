import { COLORS, FONT } from "../tema";
import { ScaleIn } from "./ScaleIn";

type Props = {
  valor: string;
  rotulo?: string;
  size?: number;
  cor?: string;
  from?: number;
  punch?: boolean;
};

// Um número gigante com o rótulo embaixo — a batida visual da cena.
export const BigNumber: React.FC<Props> = ({ valor, rotulo, size = 190, cor = COLORS.cream, from = 0, punch = true }) => (
  <ScaleIn from={from} duration={12} start={1.25} punch={punch} style={{ textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: "-0.05em", lineHeight: 1, color: cor }}>{valor}</div>
    {rotulo && (
      <div style={{ marginTop: size * 0.09, fontFamily: FONT, fontWeight: 700, fontSize: size * 0.17, letterSpacing: "0.26em", color: COLORS.creamSoft }}>{rotulo}</div>
    )}
  </ScaleIn>
);
