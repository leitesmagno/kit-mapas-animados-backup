import { useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../tema";
import { EASE_OUT, progress } from "./motion";

type Props = {
  from: number;
  to: number;
  start: number;
  end: number;
  size: number;
  color?: string;
  easing?: (t: number) => number;
  suffix?: string;
  weight?: 700 | 800;
};

// Odômetro: cada dígito é uma fita de 0 a 9 que rola, e a casa de cima gira puxada pela de
// baixo — é o contador que se lê como "número crescendo", não como texto trocando.
export const Counter: React.FC<Props> = ({ from, to, start, end, size, color = COLORS.cream, easing = EASE_OUT, suffix = "", weight = 800 }) => {
  const frame = useCurrentFrame();
  const valor = from + (to - from) * progress(frame, start, end - start, easing);
  const inteiro = Math.floor(valor);
  const texto = inteiro.toLocaleString("pt-BR");
  const digitos = texto.replace(/\D/g, "").length;
  let casa = digitos - 1;
  const alto = size * 1.02;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: FONT, fontWeight: weight, fontSize: size, letterSpacing: "-0.05em", color, lineHeight: 1 }}>
      {texto.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} style={{ opacity: 0.55, margin: "0 -0.02em" }}>
              {ch}
            </span>
          );
        }
        const peso = Math.pow(10, casa--);
        // A fração que a casa de baixo já andou puxa esta casa para o próximo dígito.
        const resto = (valor / peso) % 10;
        const d = Math.floor(resto);
        const fracao = peso >= 1 ? Math.max(0, (resto - d - 0.9) / 0.1) : 0;
        return (
          <span key={i} style={{ display: "inline-block", height: alto, overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ display: "block", transform: `translateY(${-(d + (valor >= to ? 0 : fracao)) * alto}px)` }}>
              {Array.from({ length: 11 }, (_, n) => (
                <span key={n} style={{ display: "block", height: alto }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span style={{ marginLeft: size * 0.12, fontSize: size * 0.5 }}>{suffix}</span>}
    </span>
  );
};
