import { Easing, interpolate} from "remotion";
import { useQuadro } from "./tempo";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// TEXTO DE IMPACTO — "MAS EXISTE UM DETALHE", "OU SEJA", "1948": o texto grande do estilo
// "Mapas Animados" que DESPENCA DA CÂMERA: começa enorme (escala ~3,5, já opaco, cortado
// pela tela) e cai até o tamanho final em 5 quadros; depois cresce de leve com a deriva (+3%/s).
// Sai VOANDO PARA A CÂMERA (escala ↑, sobe e some pelo topo) em 8 quadros, ou num fade curto.
// No máximo 2–3 por vídeo. Uma linha por item de `linhas`.
// ---------------------------------------------------------------------------

const MONTSERRAT = "Montserrat, Inter, system-ui, sans-serif";
const QUEDA = Easing.bezier(0.2, 0.9, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const TextoImpacto: React.FC<{
  linhas: string[];
  entra: number;
  sai?: number;
  saida?: "voa" | "fade";
  y?: number; // centro do bloco, px de tela
  corpo?: number;
  cor?: string;
  queda?: number; // quadros da queda
}> = ({ linhas, entra, sai, saida = "voa", y: yDado, corpo: corpoDado, cor = "#FFFFFF", queda = 5 }) => {
  const q = useQuadro();
  // o padrão vem do formato (vertical: y 360, corpo 100, o de sempre)
  const formato = useFormato();
  const y = yDado ?? formato.impacto.y;
  const corpo = corpoDado ?? formato.impacto.corpo;
  if (q < entra) return null;
  const t = interpolate(q, [entra, entra + queda], [0, 1], { ...cl, easing: QUEDA });
  let escala = 3.5 - 2.5 * t + 0.001 * Math.max(0, q - entra - queda);
  let dy = 0;
  let opacidade = 1;
  if (sai !== undefined && q >= sai) {
    const n = saida === "voa" ? 8 : 6;
    const u = interpolate(q, [sai, sai + n], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
    if (u >= 1) return null;
    if (saida === "voa") {
      escala *= 1 + 1.6 * u;
      dy = -520 * u;
      opacidade = 1 - u * u;
    } else opacidade = 1 - u;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y + dy,
        transform: `translateY(-50%) scale(${escala})`,
        transformOrigin: "50% 50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: MONTSERRAT,
        fontWeight: 900,
        fontSize: corpo,
        lineHeight: 1.02,
        color: cor,
        textAlign: "center",
        textShadow: "0 6px 18px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)",
        opacity: opacidade,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {linhas.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};
