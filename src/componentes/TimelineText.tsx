import { useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../tema";
import { EASE_OUT, progress } from "./motion";

type Props = {
  etapas: string[];
  // Qual etapa está acesa (a anterior fica marcada como passada) e desde quando.
  ativa: number;
  desde: number;
  largura?: number;
};

// Uma linha do tempo em etapas (AGORA → HORAS → MILHÕES DE ANOS): deixa claro em que
// escala de tempo cada efeito acontece.
// As pontas ficam alinhadas às bordas da linha (não centradas na bolinha), senão o rótulo
// comprido da última etapa sai da tela.
export const TimelineText: React.FC<Props> = ({ etapas, ativa, desde, largura = 840 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, desde, 16, EASE_OUT);
  const passo = largura / (etapas.length - 1);
  return (
    <div style={{ position: "relative", width: largura, height: 110, margin: "0 auto" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, height: 3, background: COLORS.creamFaint }} />
      <div style={{ position: "absolute", left: 0, top: 18, height: 3, width: passo * Math.max(0, ativa - 1 + p), background: COLORS.orange }} />
      {etapas.map((e, i) => {
        const acesa = i < ativa || (i === ativa && p > 0.5);
        const atual = i === ativa;
        return (
          <div key={e}>
            <div
              style={{
                position: "absolute",
                left: i * passo,
                top: atual ? 0 : 6,
                width: atual ? 38 : 26,
                height: atual ? 38 : 26,
                borderRadius: "50%",
                background: acesa ? COLORS.orange : COLORS.black,
                border: `3px solid ${acesa ? COLORS.orange : "rgba(245,240,232,0.35)"}`,
                transform: `translateX(-50%) scale(${atual ? 0.8 + p * 0.2 : 1})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 52,
                ...(i === 0 ? { left: -13 } : i === etapas.length - 1 ? { right: -13 } : { left: i * passo, transform: "translateX(-50%)" }),
                whiteSpace: "nowrap",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.14em",
                color: atual ? COLORS.cream : COLORS.creamSoft,
                opacity: atual ? 1 : 0.6,
              }}
            >
              {e}
            </div>
          </div>
        );
      })}
    </div>
  );
};
