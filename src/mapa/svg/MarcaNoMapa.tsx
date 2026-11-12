import { useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../../tema";
import { EASE_OUT, mix, progress } from "../../componentes/motion";

type Props = {
  // Posição já na tela (veja telaDe, em CameraDoMapa).
  x: number;
  y: number;
  from: number;
  texto: string;
  // A pastilha laranja com o número da contagem.
  numero?: string;
  tamanho?: number;
  cor?: string;
  // Para onde o rótulo cresce a partir do ponto.
  ancora?: "centro" | "esquerda" | "direita";
};

// O rótulo de um lugar no mapa. Vive fora do grupo da câmera: a posição acompanha o zoom,
// mas o tamanho da letra não.
export const MarcaNoMapa: React.FC<Props> = ({ x, y, from, texto, numero, tamanho = 30, cor = COLORS.cream, ancora = "centro" }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, 14, EASE_OUT);
  if (p <= 0) return null;
  const alinha = ancora === "centro" ? "center" : ancora === "esquerda" ? "flex-end" : "flex-start";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${ancora === "centro" ? "-50%" : ancora === "esquerda" ? "-100%" : "0"}, -50%) scale(${mix(0.86, 1, p)})`,
        display: "flex",
        flexDirection: "column",
        alignItems: alinha,
        gap: 6,
        opacity: p,
        fontFamily: FONT,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {numero && (
        <span
          style={{
            width: tamanho * 1.5,
            height: tamanho * 1.5,
            borderRadius: "50%",
            background: COLORS.orange,
            color: COLORS.black,
            fontWeight: 800,
            fontSize: tamanho * 0.82,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {numero}
        </span>
      )}
      <span style={{ fontWeight: 800, fontSize: tamanho, color: cor, textShadow: "0 2px 16px rgba(8,8,8,0.95), 0 0 6px rgba(8,8,8,0.9)" }}>{texto}</span>
    </div>
  );
};
