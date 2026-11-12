import { COLORS } from "../tema";
import { GlowShape } from "./GlowShape";
import { KineticText } from "./KineticText";
import { ScaleIn } from "./ScaleIn";

type Props = {
  texto: string;
  from: number;
  size?: number;
  top?: number;
  maxWidth?: number;
  // O brilho quente atrás da frase; 0 tira.
  brilho?: number;
  cor?: string;
};

// A frase que para o vídeo: entra grande, com um soco de escala e um brilho baixo atrás.
// Usar pouco — duas vezes por vídeo, no máximo.
export const BigStatement: React.FC<Props> = ({ texto, from, size = 150, top = 700, maxWidth = 960, brilho = 0.16, cor = COLORS.cream }) => (
  <>
    {brilho > 0 && <GlowShape x={540} y={top + size * 0.6} size={900} intensity={brilho} />}
    <div style={{ position: "absolute", left: 0, right: 0, top }}>
      <ScaleIn from={from} duration={14} start={1.22} punch>
        <KineticText text={texto} from={from} size={size} stagger={3} duration={10} maxWidth={maxWidth} color={cor} />
      </ScaleIn>
    </div>
  </>
);
