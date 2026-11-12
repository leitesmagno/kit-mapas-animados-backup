import { useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../tema";
import { parseHighlights } from "./HighlightText";
import { EASE_IN, EASE_OUT, progress } from "./motion";

type Props = {
  text: string;
  from: number;
  size: number;
  weight?: 500 | 700 | 800;
  // Quadros entre uma palavra e a próxima.
  stagger?: number;
  duration?: number;
  color?: string;
  highlightColor?: string;
  align?: "center" | "left";
  maxWidth?: number;
  lineHeight?: number;
  letterSpacing?: string;
  exitAt?: number;
  style?: React.CSSProperties;
};

// Tipografia cinética: cada palavra sobe do desfoque para o lugar, uma depois da outra.
export const KineticText: React.FC<Props> = ({
  text,
  from,
  size,
  weight = 800,
  stagger = 3,
  duration = 12,
  color = COLORS.cream,
  highlightColor = COLORS.orange,
  align = "center",
  maxWidth = 920,
  lineHeight = 1.02,
  letterSpacing = weight === 800 ? "-0.04em" : "-0.015em",
  exitAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const words = parseHighlights(text);
  const sai = exitAt === undefined ? 0 : progress(frame, exitAt, 10, EASE_IN);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.26,
        rowGap: size * 0.06,
        maxWidth,
        margin: align === "center" ? "0 auto" : undefined,
        opacity: 1 - sai,
        transform: `translateY(${-sai * size * 0.4}px)`,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = progress(frame, from + i * stagger, duration, EASE_OUT);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontWeight: weight,
              fontSize: size,
              lineHeight,
              letterSpacing,
              color: w.highlight ? highlightColor : color,
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.42}px) scale(${0.96 + p * 0.04})`,
              filter: `blur(${(1 - p) * 10}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
