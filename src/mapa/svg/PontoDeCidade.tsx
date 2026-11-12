import { useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../../tema";
import { EASE_OUT, progress } from "../../componentes/motion";

type Props = {
  // Posição já na tela (veja telaDe, em CameraDoMapa).
  x: number;
  y: number;
  from: number;
  nome: string;
  abaixo?: string;
  lado?: "direita" | "esquerda";
};

// O ponto de uma cidade: alvo que pulsa, fio e rótulo. A coordenada é real e projetada
// pelo mapa; o desenho é em tamanho de tela, para o zoom não inflar a tipografia.
export const PontoDeCidade: React.FC<Props> = ({ x, y, from, nome, abaixo, lado = "direita" }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, 16, EASE_OUT);
  if (p <= 0) return null;
  const ciclo = ((frame - from) % 45) / 45;
  const dir = lado === "direita" ? 1 : -1;
  const fio = 120;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          width: 26 + ciclo * 90,
          height: 26 + ciclo * 90,
          marginLeft: -(26 + ciclo * 90) / 2,
          marginTop: -(26 + ciclo * 90) / 2,
          borderRadius: "50%",
          border: `3px solid ${COLORS.orange}`,
          opacity: (1 - ciclo) * 0.75 * p,
        }}
      />
      {/* creme com anel: laranja sobre o estado laranja sumiria */}
      <div
        style={{
          position: "absolute",
          width: 24 * p,
          height: 24 * p,
          marginLeft: -12 * p,
          marginTop: -12 * p,
          borderRadius: "50%",
          background: COLORS.cream,
          border: `4px solid ${COLORS.black}`,
          boxShadow: `0 0 0 3px ${COLORS.orange}`,
        }}
      />
      <svg width={fio + 20} height={fio} style={{ position: "absolute", left: dir > 0 ? 10 : -fio - 30, top: -fio * 0.62, overflow: "visible", opacity: p }}>
        <line
          x1={dir > 0 ? 0 : fio + 20}
          y1={fio * 0.62}
          x2={dir > 0 ? fio : 20}
          y2={fio * 0.1}
          stroke={COLORS.cream}
          strokeOpacity={0.65}
          strokeWidth={2}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: dir * (fio + 26),
          top: -fio * 0.62,
          transform: `translate(${dir > 0 ? "0" : "-100%"}, -50%)`,
          textAlign: lado === "direita" ? "left" : "right",
          fontFamily: FONT,
          whiteSpace: "nowrap",
          opacity: p,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 52, color: COLORS.cream, textShadow: "0 2px 18px rgba(8,8,8,0.95)" }}>{nome}</div>
        {abaixo && <div style={{ marginTop: 6, fontWeight: 700, fontSize: 24, letterSpacing: "0.2em", color: COLORS.creamSoft }}>{abaixo}</div>}
      </div>
    </div>
  );
};
