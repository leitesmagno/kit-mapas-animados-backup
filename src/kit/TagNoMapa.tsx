import { Easing, interpolate} from "remotion";
import { useQuadro } from "./tempo";
import { useMapaOpcional } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";

// ---------------------------------------------------------------------------
// TAG NO MAPA — a etiqueta CHAPADA do estilo "Mapas Animados" (o escudo da rodovia, o nome
// do partido em cima do estado): um retângulo na cor do assunto, borda clara e sombra, com o
// texto branco DIGITADO por cima. A tag já nasce no tamanho final (as letras que faltam ocupam
// o lugar, invisíveis) e entra com pop seco (7 quadros); sai apagando as letras de trás para a
// frente e encolhendo. `ponto` prende ao mapa (dentro do <MapCamera>); sem ele, x/y de tela.
// `escala` acompanha o zoom quando a tag precisa crescer junto com o mapa (1 = fixa).
// `saida="pop"`: sai inteira, encolhendo e sumindo em 6 quadros (sem apagar letra) — para muitas
// tags saindo juntas, quando a pílula vazia de cada uma pareceria defeito.
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
const MONTSERRAT = "Montserrat, Inter, system-ui, sans-serif";

export const TagNoMapa: React.FC<{
  texto: string;
  entra: number;
  sai?: number;
  ponto?: LonLat;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  cor?: string;
  borda?: string;
  corTexto?: string;
  corpo?: number;
  passo?: number; // quadros por letra
  escala?: number;
  saida?: "apaga" | "pop";
}> = ({ texto, entra, sai = Infinity, ponto, x = 540, y = 960, dx = 0, dy = 0, cor = "#1F4FE0", borda = "#FFFFFF", corTexto = "#FFFFFF", corpo = 32, passo = 0.8, escala = 1, saida = "apaga" }) => {
  const f = useQuadro();
  const mapa = useMapaOpcional();
  if (f < entra) return null;
  // a saída: as letras apagam de trás para a frente (1 por quadro) e a tag encolhe no fim
  const pop = saida === "pop";
  const apagando = f >= sai && !pop ? Math.floor(f - sai) : 0;
  const atraso = pop ? 0 : Math.min(texto.length, 6);
  const fecha = interpolate(f, [sai + atraso, sai + atraso + (pop ? 6 : 5)], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  const k = interpolate(f, [entra, entra + 7], [0, 1], { ...cl, easing: POP }) * fecha;
  if (k <= 0) return null;
  const n = Math.max(0, Math.min(texto.length, Math.floor((f - entra - 2) / passo) + 1) - apagando);
  const [px, py] = ponto && mapa ? mapa.projetar(ponto[0], ponto[1]) : [x, y];
  return (
    <div
      style={{
        position: "absolute",
        left: px + dx,
        top: py + dy,
        transform: `translate(-50%, -50%) scale(${k * escala})`,
        opacity: pop ? Math.min(1, fecha * 1.4) : 1,
        padding: `${corpo * 0.2}px ${corpo * 0.42}px`,
        background: cor,
        border: `${Math.max(2.5, corpo * 0.09)}px solid ${borda}`,
        borderRadius: corpo * 0.24,
        boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
        fontFamily: MONTSERRAT,
        fontWeight: 900,
        fontSize: corpo,
        lineHeight: 1.05,
        letterSpacing: "0.03em",
        color: corTexto,
        whiteSpace: "pre",
        pointerEvents: "none",
      }}
    >
      <span>{texto.slice(0, n)}</span>
      <span style={{ opacity: 0 }}>{texto.slice(n)}</span>
    </div>
  );
};
