import { Easing, interpolate} from "remotion";
import { useQuadro } from "./tempo";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";

// ---------------------------------------------------------------------------
// SETA "EM LINHA RETA" — a seta grossa do estilo "Mapas Animados" (1.209 km do v06): a
// cauda larga afina até a ponta, translúcida, e DISPARA de uma ponta à outra (a ponta anda
// na frente). Vai dentro do <MapaSvg>; `de`/`para` em lon/lat, `faixa` = [início, fim] do
// disparo em quadros. Sai encolhendo de volta para a origem em `sai`.
// ---------------------------------------------------------------------------

const DISPARO = Easing.bezier(0.3, 0, 0.2, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SetaReta: React.FC<{
  de: LonLat;
  para: LonLat;
  faixa: readonly [number, number];
  sai?: number;
  cor?: string;
  cauda?: number; // largura da cauda (px)
  ponta?: number; // largura da ponta (px)
  opacidade?: number;
}> = ({ de, para, faixa, sai, cor = "#2F5BFF", cauda = 30, ponta = 70, opacidade = 0.88 }) => {
  const q = useQuadro();
  const { projetar } = useMapa();
  let t = interpolate(q, faixa, [0, 1], { ...cl, easing: DISPARO });
  if (sai !== undefined) t *= 1 - interpolate(q, [sai, sai + 10], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  if (t <= 0.001) return null;
  const [ax, ay] = projetar(de[0], de[1]);
  const [bx, by] = projetar(para[0], para[1]);
  const L = Math.hypot(bx - ax, by - ay) * t;
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const lp = Math.min(ponta * 0.95, L * 0.5); // comprimento da ponta
  const c = cauda / 2;
  const meio = c * 0.55; // a cauda afina até o começo da ponta
  const p = ponta / 2;
  const pontos = [
    [0, -c],
    [L - lp, -meio],
    [L - lp, -p],
    [L, 0],
    [L - lp, p],
    [L - lp, meio],
    [0, c],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  return (
    <g transform={`translate(${ax} ${ay}) rotate(${ang})`} opacity={opacidade}>
      <polygon points={pontos} fill={cor} stroke="#FFFFFF" strokeWidth={2.5} strokeLinejoin="round" filter="drop-shadow(0 0 8px rgba(47,91,255,0.6))" />
    </g>
  );
};
