import { useQuadro } from "../../kit/tempo";
import { useMapa } from "./MapCamera";
import type { LonLat } from "../geo/projecao";
import { COR } from "../estiloLugares";

// Pontos de luz discretos presos ao mapa: a população (uma sede = um ponto, do tamanho da
// cidade), as ilhas do delta e os sítios arqueológicos. `acende(i)` dá o 0 → 1 de cada um.
// `leve`: o halo é um degradê radial (uma definição só) em vez de um filtro de desfoque por
// ponto — com centenas de pontos, o filtro trava o Studio.
export const PontosDeLuz: React.FC<{
  pontos: { em: LonLat; raio: number }[];
  acende: (i: number) => number;
  cor?: string;
  miolo?: string;
  opacidade?: number;
  forma?: "circulo" | "losango";
  leve?: boolean;
}> = ({ pontos, acende, cor = COR.destaque, miolo = "#FFF3DC", opacidade = 1, forma = "circulo", leve = false }) => {
  useQuadro();
  const { projetar, largura, altura } = useMapa();
  if (opacidade <= 0) return null;
  const halo = `haloDosPontos${cor.replace(/[^0-9a-z]/gi, "")}`;
  return (
    <g opacity={opacidade}>
      {leve && (
        <defs>
          <radialGradient id={halo}>
            <stop offset="0%" stopColor={cor} stopOpacity={0.75} />
            <stop offset="45%" stopColor={cor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={cor} stopOpacity={0} />
          </radialGradient>
        </defs>
      )}
      {pontos.map((p, i) => {
        const t = acende(i);
        if (t <= 0) return null;
        const [x, y] = projetar(p.em[0], p.em[1]);
        if (x < -40 || y < -40 || x > largura + 40 || y > altura + 40) return null;
        // entra com um clarão (maior) e assenta
        const flash = 1 + 0.8 * Math.max(0, 1 - Math.abs(t - 0.5) / 0.5) * (t < 1 ? 1 : 0);
        const r = p.raio * Math.min(1, t * 1.6) * flash;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            {leve ? <circle r={r * 3.2} fill={`url(#${halo})`} opacity={t} /> : <circle r={r * 2.6} fill={cor} opacity={0.3 * t} filter="url(#brilho)" />}
            {forma === "losango" ? (
              <rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" fill={miolo} stroke={cor} strokeWidth={1.5} opacity={t} />
            ) : (
              <circle r={r} fill={miolo} opacity={t} />
            )}
          </g>
        );
      })}
    </g>
  );
};
