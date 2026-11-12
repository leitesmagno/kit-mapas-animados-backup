import { useCurrentFrame } from "remotion";
import { EASE_OUT, mix, progress } from "./motion";

type Props = { from: number; to: number; start: number; end: number; decimals?: number; style?: React.CSSProperties };

// Um número que conta de `from` até `to` entre os quadros `start` e `end`.
export const AnimatedNumber: React.FC<Props> = ({ from, to, start, end, decimals = 0, style }) => {
  const frame = useCurrentFrame();
  const valor = mix(from, to, progress(frame, start, end - start, EASE_OUT));
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{valor.toFixed(decimals).replace(".", ",")}</span>;
};
