import { COLORS } from "../../tema";
import { CAMINHOS, ESTADOS } from "./projecao";

export type Destaque = {
  // A cor do preenchimento; sem isso, o estado fica no tom neutro.
  cor?: string;
  // 0 a 1: quanto do destaque já entrou (dá para animar a virada de cor).
  forca?: number;
  borda?: string;
};

type Props = {
  // Só as UFs citadas ganham tratamento especial; o resto é o mapa neutro.
  destaques?: Record<string, Destaque>;
  // Opacidade do mapa neutro (para escurecer o entorno numa revelação).
  entorno?: number;
  // Espessura das divisas, em px de tela (não cresce com o zoom).
  divisa?: number;
};

const NEUTRO = "#16140F";

// O Brasil inteiro em SVG: um caminho por estado, divisas creme por cima. As divisas usam
// vector-effect para não engordar quando a câmera amplia.
export const MapaBrasil: React.FC<Props> = ({ destaques = {}, entorno = 1, divisa = 1.6 }) => (
  <>
    {ESTADOS.map((f) => {
      const sigla = f.properties.sigla;
      const d = destaques[sigla];
      const forca = d?.forca ?? (d ? 1 : 0);
      return (
        <path
          key={sigla}
          d={CAMINHOS[sigla]}
          fill={d?.cor ?? NEUTRO}
          fillOpacity={d ? 0.25 + 0.75 * forca : 0.9 * entorno}
          stroke={d?.borda ?? COLORS.cream}
          strokeOpacity={(d ? 0.55 + 0.45 * forca : 0.28) * entorno}
          strokeWidth={divisa}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      );
    })}
  </>
);
