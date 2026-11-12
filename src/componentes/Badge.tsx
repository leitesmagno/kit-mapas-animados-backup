import { COLORS, FONT } from "../tema";
import { ScaleIn } from "./ScaleIn";

type Props = { text: string; from?: number; color?: string; solid?: boolean; size?: number; style?: React.CSSProperties };

// Rótulo editorial: caixa alta, espaçado, com contorno fino.
export const Badge: React.FC<Props> = ({ text, from = 0, color = COLORS.cream, solid = false, size = 26, style }) => (
  <ScaleIn from={from} duration={12} start={0.8} style={{ display: "inline-block", ...style }}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: 999,
        border: `2px solid ${solid ? color : "rgba(245, 240, 232, 0.28)"}`,
        background: solid ? color : "transparent",
        color: solid ? COLORS.black : color,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </ScaleIn>
);
