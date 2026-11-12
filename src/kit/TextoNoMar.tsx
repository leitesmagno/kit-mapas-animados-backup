import { Easing, interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { CURVA, useQuadro } from "./tempo";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// O TEXTO NO MAR ("OCEANO ATLÂNTICO"): as letras SOBEM da água, uma a uma — saem de baixo
// achatadas e desfocadas, passam do ponto e assentam; cada letra abre uma ondinha (elipse) na
// água quando aparece. Azul em degradê (do claro ao azul do mar) com contorno branco fino e
// brilho; um reflexo espelhado e desfocado fica embaixo, e um brilho passa pelas letras depois
// que todas chegaram. Depois de pousar, as letras balançam MUITO de leve, como na água. Na saída,
// afundam de trás para frente.
//
// Vai FORA do <MapaSvg>, dentro da câmera (o `ponto` acompanha o mapa) — ou em posição de tela
// (x, y). Cada item de `linhas` é uma linha, centrada no ponto. Com `giro`, o texto deita na direção
// de um rio (gira em volta do ponto).
//
//   <TextoNoMar linhas={["OCEANO", "ATLÂNTICO"]} ponto={OCEANO} entra={q("oceano")} sai={q("fim")} />
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// a largura de cada letra em Montserrat 900 (fração do corpo): cada letra é posicionada sozinha, e
// uma largura igual para todas deixava vão em volta do "I" e apertava o "M"/"O"
const LARGURA: Record<string, number> = { I: 0.34, Í: 0.34, J: 0.56, L: 0.62, T: 0.66, F: 0.64, E: 0.66, S: 0.68, Z: 0.68, P: 0.72, R: 0.74, B: 0.76, K: 0.76, Y: 0.72, A: 0.8, Â: 0.8, Á: 0.8, Ã: 0.8, V: 0.78, X: 0.76, C: 0.76, Ç: 0.76, G: 0.82, D: 0.82, U: 0.8, N: 0.84, H: 0.84, O: 0.86, Ó: 0.86, Q: 0.86, M: 0.96, W: 1.1, " ": 0.32 };
const larguraDe = (c: string) => LARGURA[c] ?? 0.74;
const FONTE = "Montserrat, Inter, system-ui, sans-serif";

export const TextoNoMar: React.FC<{
  linhas: string[];
  entra: number;
  sai?: number;
  ponto?: LonLat;
  x?: number;
  y?: number;
  corpo?: number;
  passo?: number; // quadros entre uma letra e a próxima
  claro?: string;
  escuro?: string;
  // o texto inteiro gira em volta do ponto (graus, horário): o nome de um rio deitado na direção da água
  giro?: number;
}> = ({ linhas, entra, sai = Infinity, ponto, x: xDado, y: yDado, corpo = 56, passo = 1.6, claro = "#D8F6FF", escuro = "#1E88E5", giro = 0 }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const formato = useFormato();
  const x = xDado ?? formato.mar.x;
  const y = yDado ?? formato.mar.y;
  if (f < entra) return null;
  const total = linhas.reduce((n, l) => n + l.length, 0);
  const fimDaSaida = Number.isFinite(sai) ? sai + total * 0.6 + 10 : Infinity;
  if (f > fimDaSaida) return null;
  const [cx, cy] = ponto ? projetar(ponto[0], ponto[1]) : [x, y];
  const altLinha = corpo * 1.12;
  const topo = cy - (linhas.length * altLinha) / 2;
  // o brilho passa da esquerda para a direita depois que a última letra chega
  const chegou = entra + total * passo + 10;
  const brilho = interpolate(f, [chegou, chegou + 22], [-0.3, 1.3], cl);

  let k = 0;
  const letras: React.ReactNode[] = [];
  const reflexos: React.ReactNode[] = [];
  const ondas: React.ReactNode[] = [];
  linhas.forEach((linha, li) => {
    const yLinha = topo + li * altLinha;
    const chars = [...linha];
    const tamanhos = chars.map((c) => larguraDe(c) * corpo);
    const largura = tamanhos.reduce((a, b) => a + b, 0);
    let antes = 0;
    chars.forEach((c, ci) => {
      const i = k++;
      // a posição vem antes de qualquer `return` (as letras que ainda não apareceram ocupam o lugar)
      const xLetra = cx - largura / 2 + antes + tamanhos[ci] / 2;
      antes += tamanhos[ci];
      const t0 = entra + i * passo;
      const sobe = interpolate(f, [t0, t0 + 12], [0, 1], { ...cl, easing: CURVA.pop });
      const aparece = interpolate(f, [t0, t0 + 6], [0, 1], cl);
      // a saída: afunda de trás para frente
      const afunda = Number.isFinite(sai) ? interpolate(f, [sai + (total - 1 - i) * 0.6, sai + (total - 1 - i) * 0.6 + 8], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 0;
      const vis = aparece * (1 - afunda);
      if (vis <= 0.001) return;
      // o balanço na água, bem leve, depois de pousar
      const pousou = interpolate(f, [t0 + 12, t0 + 24], [0, 1], cl);
      const balanco = Math.sin((f - t0) * 0.11 + i * 0.7) * 2.2 * pousou;
      const dy = (1 - sobe) * corpo * 0.7 + afunda * corpo * 0.6 + balanco;
      const desfoque = (1 - aparece) * 8 + afunda * 6;
      const escalaY = 0.35 + 0.65 * sobe;
      // a letra pega o brilho quando a faixa passa por ela
      const pos = (ci + 0.5) / chars.length;
      const luz = Math.max(0, 1 - Math.abs(pos - brilho) / 0.18);
      const estilo: React.CSSProperties = {
        position: "absolute",
        left: xLetra,
        top: yLinha,
        transform: `translate(-50%, ${dy}px) scaleY(${escalaY})`,
        transformOrigin: "50% 100%",
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: corpo,
        lineHeight: 1,
        letterSpacing: 0,
        whiteSpace: "pre",
      };
      letras.push(
        <div
          key={`l${i}`}
          style={{
            ...estilo,
            opacity: vis,
            backgroundImage: `linear-gradient(180deg, ${claro} 0%, #7FD8FF 45%, ${escuro} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextStroke: "1.6px rgba(255,255,255,0.9)",
            filter: `blur(${desfoque.toFixed(1)}px) drop-shadow(0 0 ${10 + 14 * luz}px rgba(80,200,255,${0.75 + 0.25 * luz})) drop-shadow(0 4px 6px rgba(0,30,60,0.55)) brightness(${1 + 0.45 * luz})`,
          }}
        >
          {c}
        </div>,
      );
      // o reflexo: a letra espelhada embaixo da linha, desfocada e transparente
      reflexos.push(
        <div
          key={`r${i}`}
          style={{
            ...estilo,
            top: yLinha + corpo * 1.02,
            transform: `translate(-50%, ${-dy * 0.6}px) scaleY(${-0.55 * escalaY})`,
            transformOrigin: "50% 0%",
            opacity: vis * 0.22,
            color: "#9FE3FF",
            filter: "blur(3px)",
          }}
        >
          {c}
        </div>,
      );
      // a ondinha que abre na água quando a letra aparece
      const o = interpolate(f, [t0, t0 + 20], [0, 1], cl);
      if (o > 0 && o < 1) {
        ondas.push(
          <ellipse key={`o${i}`} cx={xLetra} cy={yLinha + corpo * 0.98} rx={corpo * (0.2 + 0.7 * o)} ry={corpo * (0.05 + 0.16 * o)} fill="none" stroke="#D8F6FF" strokeWidth={2.2} opacity={(1 - o) * 0.8} />,
        );
      }
    });
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", transform: giro ? `rotate(${giro}deg)` : undefined, transformOrigin: `${cx}px ${cy}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {ondas}
      </svg>
      {reflexos}
      {letras}
    </div>
  );
};
