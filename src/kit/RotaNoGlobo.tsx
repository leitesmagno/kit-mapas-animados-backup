import { geoInterpolate } from "d3-geo";
import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Uma ROTA de um lugar a outro pelo círculo máximo (o caminho de verdade sobre o planeta),
// que se desenha entre `desenho[0]` e `desenho[1]` com uma ponta de luz na frente. Vai
// DENTRO do <MapaSvg>.
// ---------------------------------------------------------------------------

export const RotaNoGlobo: React.FC<{
  de: [number, number];
  para: [number, number];
  desenho: readonly [number, number];
  sai?: number;
  cor?: string;
  tracejado?: boolean;
  ponta?: boolean;
  largura?: number;
}> = ({ de, para, desenho, sai = Infinity, cor = "#F2B45A", tracejado = false, ponta = true, largura = 3 }) => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  if (f < desenho[0]) return null;
  const fora = sair(f, sai, 14);
  if (fora <= 0) return null;
  const p = interpolate(f, desenho, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.suave });
  const ip = geoInterpolate(de, para);
  const n = 80;
  const pontos = Array.from({ length: Math.max(2, Math.ceil(n * p) + 1) }, (_, i) => ip(Math.min(p, i / n)));
  const d = caminho({ type: "LineString", coordinates: pontos }) ?? "";
  const cab = ip(p);
  const [hx, hy] = projetar(cab[0], cab[1]);
  return (
    <g opacity={fora}>
      <path d={d} fill="none" stroke={cor} strokeWidth={largura * 3.5} strokeOpacity={0.3} filter="url(#brilho)" strokeLinecap="round" />
      <path d={d} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeDasharray={tracejado ? "2 10" : undefined} />
      {ponta && p < 1 && hx > -5000 && (
        <>
          <circle cx={hx} cy={hy} r={16} fill={cor} opacity={0.35} filter="url(#brilho)" />
          <circle cx={hx} cy={hy} r={5} fill="#FFFFFF" />
        </>
      )}
    </g>
  );
};
