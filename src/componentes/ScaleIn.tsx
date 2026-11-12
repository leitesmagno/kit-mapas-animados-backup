import { useCurrentFrame } from "remotion";
import { EASE_IN, EASE_OUT, mix, progress } from "./motion";

type Props = {
  from?: number;
  duration?: number;
  start?: number;
  // "Impacto": passa um pouco do tamanho final e volta (para as batidas fortes).
  punch?: boolean;
  exitAt?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const ScaleIn: React.FC<Props> = ({ from = 0, duration = 14, start = 0.85, punch = false, exitAt, style, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, duration, EASE_OUT);
  const estouro = punch ? Math.sin(Math.min(1, (frame - from) / duration) * Math.PI) * 0.06 : 0;
  const sai = exitAt === undefined ? 0 : progress(frame, exitAt, 10, EASE_IN);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p * 1.6) * (1 - sai),
        transform: `scale(${mix(start, 1, p) + (frame >= from ? estouro : 0) - sai * 0.06})`,
        filter: `blur(${(1 - p) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};
