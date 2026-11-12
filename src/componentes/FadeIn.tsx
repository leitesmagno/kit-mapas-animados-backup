import { useCurrentFrame } from "remotion";
import { EASE_IN, EASE_OUT, progress } from "./motion";

type Props = { from?: number; duration?: number; exitAt?: number; exitDuration?: number; style?: React.CSSProperties; children: React.ReactNode };

// Aparece (e, se pedido, some) sem se mover.
export const FadeIn: React.FC<Props> = ({ from = 0, duration = 12, exitAt, exitDuration = 10, style, children }) => {
  const frame = useCurrentFrame();
  const entra = progress(frame, from, duration, EASE_OUT);
  const sai = exitAt === undefined ? 0 : progress(frame, exitAt, exitDuration, EASE_IN);
  return <div style={{ ...style, opacity: entra * (1 - sai) }}>{children}</div>;
};
