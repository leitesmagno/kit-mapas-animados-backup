import { COLORS } from "../tema";

// Palavras entre *asteriscos* ganham o laranja da marca. Um trecho pode ter várias
// palavras: "*VAPOR DE ÁGUA.*". O resto do texto fica na cor normal — o laranja é
// exceção, nunca a regra.
export type Word = { text: string; highlight: boolean };

export function parseHighlights(text: string): Word[] {
  const words: Word[] = [];
  let inside = false;
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const opens = raw.startsWith("*");
    const closes = raw.endsWith("*") && (raw.length > 1 || !opens);
    const clean = raw.replace(/\*/g, "");
    const highlight = inside || opens;
    words.push({ text: clean, highlight });
    if (opens && !closes) inside = true;
    if (closes) inside = false;
  }
  return words;
}

type Props = { text: string; color?: string; highlightColor?: string; style?: React.CSSProperties };

export const HighlightText: React.FC<Props> = ({ text, color = COLORS.cream, highlightColor = COLORS.orange, style }) => {
  const words = parseHighlights(text);
  return (
    <span style={{ color, ...style }}>
      {words.map((w, i) => (
        <span key={i} style={{ color: w.highlight ? highlightColor : undefined }}>
          {w.text}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
};
