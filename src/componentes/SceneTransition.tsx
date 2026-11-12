import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE_OUT, mix, progress } from "./motion";

// A entrada de cada cena. Cada vídeo da série tem o seu jeito de cortar — é parte do ritmo:
//   zoom     — soco de zoom saindo do desfoque (tensão)
//   corte    — seco, com um tranco curto de escala (números, impacto)
//   desfoque — nasce do escuro e do desfoque, devagar (mistério)
//   deslizar — entra de lado, como uma página (explicação calma)
//   subir    — sobe do escuro (intimidade)
export type TipoDeTransicao = "zoom" | "corte" | "desfoque" | "deslizar" | "subir" | "nenhuma";

type Props = { tipo: TipoDeTransicao; duracao: number; drift?: number; children: React.ReactNode };

export const SceneTransition: React.FC<Props> = ({ tipo, duracao, drift = 1.03, children }) => {
  const frame = useCurrentFrame();
  const camera = mix(1, drift, frame / Math.max(1, duracao));
  const t = {
    zoom: progress(frame, 0, 10),
    corte: progress(frame, 0, 6),
    desfoque: progress(frame, 0, 18),
    deslizar: progress(frame, 0, 14),
    subir: progress(frame, 0, 16),
    nenhuma: 1,
  }[tipo];
  const estilo: React.CSSProperties =
    tipo === "zoom"
      ? { transform: `scale(${mix(1.1, 1, t) * camera})`, filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined, opacity: Math.min(1, 0.2 + t) }
      : tipo === "corte"
        ? { transform: `scale(${mix(1.04, 1, t) * camera})` }
        : tipo === "desfoque"
          ? { transform: `scale(${camera})`, filter: t < 1 ? `blur(${(1 - t) * 22}px)` : undefined, opacity: t }
          : tipo === "deslizar"
            ? { transform: `translateX(${(1 - progress(frame, 0, 14, EASE_OUT)) * 180}px) scale(${camera})`, opacity: Math.min(1, t * 1.4), filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined }
            : tipo === "subir"
              ? { transform: `translateY(${(1 - t) * 60}px) scale(${camera})`, opacity: t }
              : { transform: `scale(${camera})` };
  return <AbsoluteFill style={estilo}>{children}</AbsoluteFill>;
};
