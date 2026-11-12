import { COLORS } from "../tema";

// Um brilho laranja discreto atrás de um elemento importante — pouco, e só onde importa.
export const GlowShape: React.FC<{ x: number; y: number; size: number; intensity?: number; color?: string }> = ({
  x,
  y,
  size,
  intensity = 0.35,
  color = COLORS.orange,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      opacity: intensity,
      pointerEvents: "none",
    }}
  />
);
