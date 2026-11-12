import type { Feature, Geometry } from "geojson";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { useMapa } from "../../base/componentes/MapCamera";
import { COR } from "../../base/estilo";

// ---------------------------------------------------------------------------
// A REGIÃO DA IDENTIDADE HORIZONTAL — o destaque dos vídeos "São Luís", "Piauí" e "Ceará": o
// CONTORNO DOURADO que se desenha em volta do lugar (um traço fino + um halo de brilho largo), um
// véu quente muito leve por dentro e, quando a região é o FOCO da fala, o resto do mapa escurece
// (o lugar "acende" sozinho). Sem bandeira e sem cor chapada: a luz é que destaca.
// Vai DENTRO do <MapaSvg> (usa o filtro #brilho de lá).
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const RegiaoEditorial: React.FC<{
  regiao: Feature<Geometry>;
  entra: number;
  sai?: number;
  cor?: string;
  foco?: boolean; // escurece o entorno
  desenho?: number; // quadros para o contorno se desenhar
}> = ({ regiao, entra, sai = Infinity, cor = COR.destaque, foco = false, desenho = 28 }) => {
  const q = useCurrentFrame();
  const { caminho, largura, altura } = useMapa();
  if (q < entra) return null;
  const fora = Number.isFinite(sai) ? interpolate(q, [sai, sai + 18], [1, 0], cl) : 1;
  if (fora <= 0) return null;
  const d = caminho(regiao) ?? "";
  const traco = interpolate(q, [entra, entra + desenho], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const veu = interpolate(q, [entra + desenho * 0.5, entra + desenho + 10], [0, 1], cl);
  const moldura = `M-50,-50H${largura + 50}V${altura + 50}H-50Z`;
  return (
    <g opacity={fora}>
      {foco ? <path d={`${moldura}${d}`} fillRule="evenodd" fill="#03070B" opacity={0.55 * veu} /> : null}
      <path d={d} fill={cor} fillOpacity={0.12 * veu} stroke="none" />
      <path d={d} fill="none" stroke={cor} strokeWidth={7} strokeOpacity={0.5} filter="url(#brilho)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - traco} />
      <path d={d} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - traco} />
    </g>
  );
};
