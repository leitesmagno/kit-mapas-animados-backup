import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";
import type { Trajeto } from "./trajeto";

// ---------------------------------------------------------------------------
// A ROTA PELAS RUAS: o trajeto (kit/trajeto) se desenhando até `metros` — quem decide quanto
// já foi percorrido é quem chama (o mesmo ritmo que move a câmera: a linha e a câmera andam
// juntas). Linha de luz com halo, um fio claro no meio, a ponta brilhando na frente e um
// rastro que esquenta perto dela. Na partida, um anel pequeno. Vai DENTRO do <MapaSvg>.
//
//   <RotaGeo trajeto={t} metros={ritmo(u) } entra={a} cor="#F2B45A" />
// ---------------------------------------------------------------------------

export const RotaGeo: React.FC<{
  trajeto: Trajeto;
  metros: number; // quanto já foi desenhado
  entra: number; // quadro em que a partida aparece
  sai?: number;
  cor?: string;
  largura?: number; // px (a linha engrossa um pouco de perto)
  opacidade?: number;
  partida?: boolean; // o anel no começo
  ponta?: boolean; // a luz na frente
}> = ({ trajeto, metros, entra, sai = Infinity, cor = "#F2B45A", largura = 5, opacidade = 1, partida = true, ponta = true }) => {
  const f = useQuadro();
  const { caminho, projetar, camera } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 16) * opacidade;
  if (fora <= 0) return null;
  const nasce = entrar(f, entra, 16, CURVA.pop);
  const esp = largura * Math.max(0.7, Math.min(1.6, 1 + (camera.zoom - 16.5) * 0.25));
  const feito = trajeto.trecho(0, metros);
  const d = feito.length > 1 ? (caminho({ type: "LineString", coordinates: feito }) ?? "") : "";
  // o rastro quente: os últimos ~120 m mais claros
  const rastro = feito.length > 1 ? (caminho({ type: "LineString", coordinates: trajeto.trecho(Math.max(0, metros - 120), metros) }) ?? "") : "";
  const [sx, sy] = projetar(...trajeto.ponto(0));
  const [hx, hy] = projetar(...trajeto.ponto(metros));
  const andando = metros > 0.5 && metros < trajeto.total - 0.5;
  const brilho = 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <g opacity={fora}>
      {d && (
        <>
          {/* a sombra (descola a linha do mapa), o halo, a linha e o fio claro */}
          <path d={d} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={esp * 2.2} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={cor} strokeOpacity={0.35} strokeWidth={esp * 3.6} strokeLinecap="round" strokeLinejoin="round" filter="url(#brilho)" />
          <path d={d} fill="none" stroke={cor} strokeWidth={esp} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#FFF6E4" strokeOpacity={0.7} strokeWidth={esp * 0.28} strokeLinecap="round" strokeLinejoin="round" />
          {andando && <path d={rastro} fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={esp * 0.9} strokeLinecap="round" strokeLinejoin="round" filter="url(#brilho)" />}
        </>
      )}
      {partida && sx > -5000 && (
        <g>
          <circle cx={sx} cy={sy} r={esp * 3.4 * nasce} fill="#0A0F16" stroke={cor} strokeWidth={esp * 0.7} />
          <circle cx={sx} cy={sy} r={esp * 1.3 * nasce} fill={cor} />
        </g>
      )}
      {ponta && andando && hx > -5000 && (
        <g>
          <circle cx={hx} cy={hy} r={esp * (5 + 1.5 * brilho)} fill={cor} opacity={0.3} filter="url(#brilhoForte)" />
          <circle cx={hx} cy={hy} r={esp * 1.9} fill={cor} opacity={0.9} filter="url(#brilho)" />
          <circle cx={hx} cy={hy} r={esp * 1.1} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};
