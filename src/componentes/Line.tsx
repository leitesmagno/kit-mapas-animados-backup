import { useCurrentFrame } from "remotion";
import { COLORS } from "../tema";
import { EASE_OUT, progress } from "./motion";

type Props = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  from?: number;
  duration?: number;
  color?: string;
  width?: number;
  arrow?: boolean;
  dashed?: boolean;
};

// Uma linha que se desenha do começo ao fim (e ganha ponta de seta, se pedido). As
// coordenadas são as do elemento pai.
export const Line: React.FC<Props> = ({ x1, y1, x2, y2, from = 0, duration = 16, color = COLORS.cream, width = 4, arrow = false, dashed = false }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, duration, EASE_OUT);
  if (p <= 0) return null;
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const angulo = Math.atan2(y2 - y1, x2 - x1);
  const ponta = 16 + width * 2;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? `${width * 3} ${width * 3}` : undefined} />
      {arrow && p > 0.85 && (
        <path
          d={`M ${x - ponta * Math.cos(angulo - 0.5)} ${y - ponta * Math.sin(angulo - 0.5)} L ${x} ${y} L ${x - ponta * Math.cos(angulo + 0.5)} ${y - ponta * Math.sin(angulo + 0.5)}`}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={(p - 0.85) / 0.15}
        />
      )}
    </svg>
  );
};
