import { interpolate } from "remotion";
import { useId } from "react";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O NOME NO RIO ("RIO NEGRO"): o nome escrito AO LONGO do rio, seguindo as curvas dele, no estilo
// do "Oceano Atlântico" do Piauí (MapLabel "aguaGrande"): itálico fino, azul-claro, espaçado; as
// letras aparecem uma a uma, de desfocadas para nítidas, subindo um pouco, e o espaçamento
// "respira" ao entrar. O tamanho é em METROS: o nome é do mapa, cresce e diminui com o zoom e fica
// sempre dentro da água (não vira um letreiro por cima da tela).
//
// Vai DENTRO do <MapaSvg>. `percurso` é a linha do meio do rio (lon/lat), de qualquer lado: o nome
// é sempre lido da esquerda para a direita (a linha vira se precisar).
//
//   <NomeNoRio texto="RIO NEGRO" percurso={MEIO_DO_NEGRO} entra={q("negro")} sai={q("juntos")} corpoMetros={620} />
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Ponto = [number, number];

// a linha suave pelos pontos (Catmull-Rom, amostrada): o texto corre liso nas curvas
const suave = (p: Ponto[], n = 14): Ponto[] => {
  if (p.length < 3) return p;
  const out: Ponto[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, c2: number, d: number) => 0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};

export const NomeNoRio: React.FC<{
  texto: string;
  percurso: LonLat[];
  entra: number;
  sai?: number;
  corpoMetros?: number; // a altura da letra no chão (m)
  cor?: string;
  espaco?: number; // o espaçamento das letras (em)
  passo?: number; // quadros entre uma letra e a próxima
}> = ({ texto, percurso, entra, sai = Infinity, corpoMetros = 620, cor = "rgba(190, 228, 255, 0.95)", espaco = 0.3, passo = 2.2 }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const id = useId().replace(/:/g, "");
  if (f < entra) return null;
  const saida = Number.isFinite(sai) ? interpolate(f, [sai, sai + 18], [1, 0], cl) : 1;
  if (saida <= 0) return null;

  let pts = suave(percurso.map((p) => projetar(p[0], p[1]) as Ponto));
  if (pts[pts.length - 1][0] < pts[0][0]) pts = [...pts].reverse();
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  // metros → px no lugar do rio (o meio do percurso)
  const meio = percurso[Math.floor(percurso.length / 2)];
  const a = projetar(meio[0], meio[1]);
  const b = projetar(meio[0], meio[1] + 0.01);
  const corpo = (corpoMetros * Math.hypot(b[0] - a[0], b[1] - a[1])) / (0.01 * 111320);
  if (corpo < 4) return null;

  // o espaçamento abre na entrada e assenta junto com as letras
  const abre = interpolate(f - entra, [0, 40], [0.35, 0], { ...cl, easing: CURVA.pouso });
  const letras = [...texto];
  const t = (i: number) => interpolate(f - entra - i * passo, [0, 16], [0, 1], { ...cl, easing: CURVA.pouso });
  const camada = (nitida: boolean) => (
    <text
      fontFamily="Montserrat, Inter, sans-serif"
      fontStyle="italic"
      fontWeight={600}
      fontSize={corpo}
      letterSpacing={`${espaco + abre}em`}
      fill={cor}
      dominantBaseline="central"
      style={{ filter: nitida ? `drop-shadow(0 ${corpo * 0.06}px ${corpo * 0.35}px rgba(0,0,0,0.85))` : `blur(${corpo * 0.14}px)` }}
    >
      <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
        {letras.map((l, i) => {
          const k = t(i);
          // a camada desfocada acende primeiro e cede o lugar à nítida (de desfocada para nítida)
          const op = nitida ? k : Math.sin(Math.PI * Math.min(1, k * 1.4)) * 0.9;
          return (
            <tspan key={i} fillOpacity={op}>
              {l}
            </tspan>
          );
        })}
      </textPath>
    </text>
  );
  // a subida da entrada: o nome inteiro assenta de leve (acompanha a letra do meio)
  const sobe = (1 - t(Math.floor(letras.length / 2))) * corpo * 0.25;
  return (
    <g opacity={saida} pointerEvents="none" transform={`translate(0 ${sobe.toFixed(2)})`}>
      <defs>
        <path id={id} d={d} />
      </defs>
      {camada(false)}
      {camada(true)}
    </g>
  );
};
