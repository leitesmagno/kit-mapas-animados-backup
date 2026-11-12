import { SAFE, WIDTH } from "../tema";

// A área onde o texto importante pode morar: fora das faixas que o TikTok, o Reels e o
// Shorts cobrem com a interface deles.
export const SafeArea: React.FC<{ top?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top = SAFE.top, children, style }) => (
  <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top, ...style }}>{children}</div>
);

export const SAFE_WIDTH = SAFE.right - SAFE.left;
export const CENTER_X = WIDTH / 2;
