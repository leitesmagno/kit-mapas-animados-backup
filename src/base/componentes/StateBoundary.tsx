import type { Feature, FeatureCollection, Geometry } from "geojson";
import { COR } from "../estilo";
import { useMapa } from "./MapCamera";

// Uma camada de linhas (fronteiras de países, divisas de estados) sobre o satélite.
export const CamadaGeo: React.FC<{
  dados: FeatureCollection | Feature;
  stroke: string;
  strokeWidth?: number;
  fill?: string;
  opacidade?: number;
}> = ({ dados, stroke, strokeWidth = 1, fill = "none", opacidade = 1 }) => {
  const { caminho } = useMapa();
  const feicoes = dados.type === "FeatureCollection" ? dados.features : [dados];
  return (
    <g opacity={opacidade}>
      {feicoes.map((f, i) => (
        <path key={i} d={caminho(f) ?? ""} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      ))}
    </g>
  );
};

// Um estado vizinho em evidência por um instante (quando a narração o nomeia): véu claro
// por dentro e a divisa acesa. `forca` 0 → 1.
export const NeighborHighlight: React.FC<{ estado: Feature<Geometry>; forca: number }> = ({ estado, forca }) => {
  const { caminho } = useMapa();
  if (forca <= 0) return null;
  const d = caminho(estado) ?? "";
  return (
    <g opacity={forca}>
      <path d={d} fill="#FFFFFF" fillOpacity={0.09} stroke="none" />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeOpacity={0.35} filter="url(#brilho)" />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeOpacity={0.9} strokeLinejoin="round" />
    </g>
  );
};

// Escurece tudo MENOS o estado: um retângulo do tamanho da tela com o estado recortado
// (evenodd). O satélite dentro do estado continua com a cor viva.
export const EscurecerEntorno: React.FC<{ estado: Feature<Geometry>; forca: number }> = ({ estado, forca }) => {
  const { caminho, largura, altura } = useMapa();
  if (forca <= 0) return null;
  const moldura = `M-50,-50H${largura + 50}V${altura + 50}H-50Z`;
  return <path d={`${moldura}${caminho(estado) ?? ""}`} fillRule="evenodd" fill="#03070B" opacity={0.58 * forca} />;
};

// Um estado em destaque: um véu quente muito leve, borda dourada e halo de brilho.
// `destaque` vai de 0 (estado comum) a 1 (em evidência).
export const StateBoundary: React.FC<{ estado: Feature<Geometry>; destaque: number; borda?: number }> = ({
  estado,
  destaque,
  borda = destaque,
}) => {
  const { caminho } = useMapa();
  const d = caminho(estado) ?? "";
  return (
    <g>
      <path d={d} fill={COR.destaque} fillOpacity={0.1 * destaque} stroke="none" />
      <path d={d} fill="none" stroke={COR.destaque} strokeWidth={6} strokeOpacity={0.6 * borda} filter="url(#brilho)" />
      <path d={d} fill="none" stroke={COR.destaque} strokeWidth={1.8} strokeOpacity={borda} strokeLinejoin="round" />
    </g>
  );
};
