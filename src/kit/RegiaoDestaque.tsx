import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useMapa } from "../base/componentes/MapCamera";
import { PALETAS, type NomeDaPaleta } from "./paleta";
import { entra as entrar, pulso, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A região em destaque — a peça central dos cinco estilos de referência.
//
//   chapado   — cor sólida e saturada com o relevo do satélite aparecendo por baixo
//               (mix-blend hard-light) e contorno branco fino. "estilo Ranking".
//   neon      — preenchimento translúcido + contorno com halo brilhante. "Mapas Animados".
//   contorno  — só a borda acesa (o assunto é o satélite de dentro).
//
// Entrada: o contorno se DESENHA (0 → 100% do perímetro) enquanto o preenchimento sobe com
// um flash branco curto — o "acendeu" que marca a palavra da narração.
// Vai DENTRO de <MapaSvg> (usa os filtros #brilho/#brilhoForte de lá).
// ---------------------------------------------------------------------------

export type EstiloDeRegiao = "chapado" | "neon" | "contorno";

export const RegiaoDestaque: React.FC<{
  regiao: Feature<Geometry> | FeatureCollection;
  entra: number;
  sai?: number;
  estilo?: EstiloDeRegiao;
  paleta?: NomeDaPaleta;
  cor?: string; // sobrepõe o preenchimento da paleta (ex.: TEMATICAS.semiarido)
  borda?: string;
  opacidade?: number; // teto do preenchimento
  larguraBorda?: number;
  // quadros para o contorno se desenhar (0 = já nasce inteiro)
  desenho?: number;
  flash?: boolean;
}> = ({ regiao, entra, sai = Infinity, estilo = "chapado", paleta = "roxo", cor, borda, opacidade, larguraBorda, desenho = 16, flash = true }) => {
  const q = useQuadro();
  const { caminho } = useMapa();
  if (q < entra) return null;
  const fora = sair(q, sai, 10);
  if (fora <= 0) return null;
  const p = PALETAS[paleta];
  const d = caminho(regiao as Feature) ?? "";
  const traco = desenho > 0 ? entrar(q, entra, desenho) : 1;
  const enche = entrar(q, entra + desenho * 0.4, 10);
  const clarao = flash ? pulso(q, entra + Math.round(desenho * 0.6), 3, 14) : 0;
  const corFundo = cor ?? p.preenchimento;
  const corBorda = borda ?? p.borda;
  const teto = opacidade ?? (estilo === "chapado" ? 0.82 : estilo === "neon" ? 0.26 : 0);
  const largura = larguraBorda ?? (estilo === "neon" ? 3.2 : 2.4);
  const tracejado = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - traco };
  const halo = estilo === "chapado" ? "rgba(0,0,0,0.55)" : cor ?? p.brilho;

  return (
    <g opacity={fora}>
      {teto > 0 && <path d={d} fill={corFundo} fillOpacity={teto * enche} style={{ mixBlendMode: estilo === "chapado" ? "hard-light" : "normal" }} />}
      {clarao > 0 && <path d={d} fill="#FFFFFF" fillOpacity={0.35 * clarao} />}
      {/* chapado: sombra escura fina (a borda "descola" do mapa); neon: halo da cor */}
      <path d={d} fill="none" stroke={halo} strokeWidth={estilo === "chapado" ? 7 : 12} strokeOpacity={estilo === "chapado" ? 0.6 : 0.85} filter="url(#brilho)" strokeLinejoin="round" {...tracejado} />
      {estilo !== "chapado" && <path d={d} fill="none" stroke={cor ?? p.brilho} strokeWidth={26} strokeOpacity={0.25 + 0.4 * clarao} filter="url(#brilhoForte)" strokeLinejoin="round" {...tracejado} />}
      <path d={d} fill="none" stroke={corBorda} strokeWidth={largura} strokeLinejoin="round" strokeLinecap="round" {...tracejado} />
    </g>
  );
};

// Troca a cor de uma região ao longo do tempo (o semiárido "esquentando" de amarelo a
// vermelho): passe `interpolateColors(q, [a, b], [c1, c2])` do Remotion em `cor`.
