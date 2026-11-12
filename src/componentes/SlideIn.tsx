import { useCurrentFrame } from "remotion";
import { EASE_IN, EASE_OUT, progress } from "./motion";

type Props = {
  from?: number;
  duration?: number;
  // De onde vem, em px (o deslocamento inicial).
  dx?: number;
  dy?: number;
  exitAt?: number;
  exitDx?: number;
  exitDy?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const SlideIn: React.FC<Props> = ({ from = 0, duration = 16, dx = 0, dy = 60, exitAt, exitDx = 0, exitDy = -40, style, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, duration, EASE_OUT);
  const s = exitAt === undefined ? 0 : progress(frame, exitAt, 12, EASE_IN);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p * 1.4) * (1 - s),
        transform: `translate(${(1 - p) * dx + s * exitDx}px, ${(1 - p) * dy + s * exitDy}px)`,
        filter: `blur(${(1 - p) * 6 + s * 6}px)`,
      }}
    >
      {children}
    </div>
  );
};
