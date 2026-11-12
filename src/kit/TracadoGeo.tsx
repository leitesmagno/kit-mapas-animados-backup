import type { Feature, LineString } from "geojson";
import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, sai as sair, useQuadro } from "./tempo";
import { trajeto, type Ponto, type Trajeto } from "./trajeto";

// ---------------------------------------------------------------------------
// UM TRAÇADO QUE ANDA pelo mapa, do primeiro ao último ponto da linha, entre `desenho[0]` e
// `desenho[1]` (quadros) — um rio correndo da nascente à foz, o caminho de uma viagem. Dois
// estilos, os dois discretos (sem brilho de filtro: sombra, linha e um fio claro):
//
//   "rio":    água — azul claro sobre uma sombra escura, um reflexo fino no meio e um ponto de
//             luz na frente enquanto corre;
//   "trilha": a viagem — tracejado branco com a ponta acesa.
//
// A linha tem que vir ORIENTADA (o rio da nascente para a foz). Vai DENTRO do <MapaSvg>.
// ---------------------------------------------------------------------------

const medidos = new WeakMap<object, Trajeto>();
const medir = (linha: Feature<LineString> | Ponto[]) => {
  const chave = linha as object;
  let t = medidos.get(chave);
  if (!t) {
    t = trajeto(Array.isArray(linha) ? linha : (linha.geometry.coordinates as Ponto[]));
    medidos.set(chave, t);
  }
  return t;
};

export const TracadoGeo: React.FC<{
  linha: Feature<LineString> | Ponto[];
  desenho: readonly [number, number];
  sai?: number;
  estilo?: "rio" | "trilha";
  cor?: string;
  largura?: number;
  opacidade?: number; // multiplica tudo (para apagar o traçado aos poucos depois de usado)
  fluxo?: number; // "trilha": px por quadro que o tracejado corre no sentido da linha (0 = parado)
}> = ({ linha, desenho, sai = Infinity, estilo = "rio", cor, largura, opacidade = 1, fluxo = 0 }) => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  if (f < desenho[0]) return null;
  const fora = sair(f, sai, 16) * opacidade;
  if (fora <= 0) return null;
  const t = medir(linha);
  const p = interpolate(f, desenho, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.suave });
  const feito = t.trecho(0, t.total * p);
  if (feito.length < 2) return null;
  const d = caminho({ type: "LineString", coordinates: feito }) ?? "";
  const [hx, hy] = projetar(...t.ponto(t.total * p));
  const correndo = p > 0 && p < 1 && hx > -5000;
  if (estilo === "trilha") {
    const c = cor ?? "#FFFFFF";
    const w = largura ?? 3;
    return (
      <g opacity={fora} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#000" strokeOpacity={0.4} strokeWidth={w * 2.2} strokeDasharray={`${w * 2.6} ${w * 2.4}`} strokeDashoffset={-f * fluxo} />
        <path d={d} stroke={c} strokeWidth={w} strokeDasharray={`${w * 2.6} ${w * 2.4}`} strokeDashoffset={-f * fluxo} />
        {correndo && (
          <>
            <circle cx={hx} cy={hy} r={w * 3.2} fill={c} opacity={0.25} />
            <circle cx={hx} cy={hy} r={w * 1.5} fill={c} />
          </>
        )}
      </g>
    );
  }
  const c = cor ?? "#6CCBFF";
  const w = largura ?? 3.4;
  return (
    <g opacity={fora} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#021420" strokeOpacity={0.5} strokeWidth={w * 2.4} />
      <path d={d} stroke={c} strokeOpacity={0.28} strokeWidth={w * 3.2} />
      <path d={d} stroke={c} strokeWidth={w} />
      <path d={d} stroke="#E9F8FF" strokeOpacity={0.75} strokeWidth={w * 0.32} />
      {correndo && (
        <>
          <circle cx={hx} cy={hy} r={w * 2.6} fill={c} opacity={0.35} />
          <circle cx={hx} cy={hy} r={w * 1.1} fill="#FFFFFF" />
        </>
      )}
    </g>
  );
};
