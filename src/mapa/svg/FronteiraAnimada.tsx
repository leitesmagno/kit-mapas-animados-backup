import { useCurrentFrame } from "remotion";
import { COLORS } from "../../tema";
import { EASE_IN_OUT, progress } from "../../componentes/motion";
import { CAMINHOS } from "./projecao";

type Props = {
  sigla: string;
  from: number;
  duracao?: number;
  cor?: string;
  largura?: number;
  // O contorno nasce do começo ao fim, como quem passa o lápis na divisa.
  comprimento?: number;
};

// A divisa de um estado sendo desenhada. O truque é o strokeDasharray do tamanho do
// caminho: o traço "anda" de 0 até o contorno inteiro.
export const FronteiraAnimada: React.FC<Props> = ({ sigla, from, duracao = 40, cor = COLORS.orange, largura = 4, comprimento = 6000 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, duracao, EASE_IN_OUT);
  if (p <= 0) return null;
  return (
    <path
      d={CAMINHOS[sigla]}
      fill="none"
      stroke={cor}
      strokeWidth={largura}
      strokeLinejoin="round"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      strokeDasharray={comprimento}
      strokeDashoffset={comprimento * (1 - p)}
    />
  );
};
