import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COR, FONTE } from "../../base/estilo";

// ---------------------------------------------------------------------------
// A CARTELA DE TÍTULO da identidade horizontal (a tipografia do São Luís / Piauí / Ceará): o mapa
// escurece um pouco, a linha de cima em versalete dourado ("CAPÍTULO 02"), o título SOBE de trás de
// uma máscara e um fio dourado abre do centro; sai subindo e apagando. Duas formas:
//   "capitulo"  a abertura de cada capítulo (linha de cima + título)
//   "principal" o título do documentário (título grande + subtítulo embaixo)
// Vai por cima do mapa e embaixo da legenda. Texto por código.
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POUSO = Easing.bezier(0.16, 1, 0.3, 1);

export const CartelaDeTitulo: React.FC<{
  titulo: string;
  acima?: string; // "CAPÍTULO 02"
  abaixo?: string; // o subtítulo (forma principal)
  entra: number;
  sai: number;
  forma?: "capitulo" | "principal";
  y?: number; // o centro do bloco
}> = ({ titulo, acima, abaixo, entra, sai, forma = "capitulo", y = 470 }) => {
  const f = useCurrentFrame();
  if (f < entra - 2 || f > sai + 18) return null;
  const nasce = interpolate(f, [entra, entra + 22], [0, 1], { ...cl, easing: POUSO });
  const vai = interpolate(f, [sai, sai + 16], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const o = 1 - vai;
  const fio = interpolate(f, [entra + 8, entra + 30], [0, 1], { ...cl, easing: POUSO });
  const linha = interpolate(f, [entra + 4, entra + 20], [0, 1], cl);
  const grande = forma === "principal";
  const corpo = grande ? 96 : 66;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 46%, rgba(3,8,12,0.62) 0%, rgba(3,8,12,0.25) 60%, rgba(3,8,12,0) 100%)", opacity: Math.min(nasce, o) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: `translateY(calc(-50% - ${vai * 24}px))`, textAlign: "center", fontFamily: FONTE, opacity: o }}>
        {acima ? (
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.55em", paddingLeft: "0.55em", color: COR.destaque, opacity: linha, marginBottom: 18 }}>{acima}</div>
        ) : null}
        <div style={{ overflow: "hidden", paddingBottom: 6 }}>
          <div
            style={{
              fontSize: corpo,
              fontWeight: 800,
              letterSpacing: grande ? "0.14em" : "0.08em",
              paddingLeft: grande ? "0.14em" : "0.08em",
              textTransform: "uppercase",
              color: COR.tinta,
              lineHeight: 1.05,
              transform: `translateY(${(1 - nasce) * 105}%)`,
              textShadow: "0 4px 28px rgba(0,0,0,0.7)",
            }}
          >
            {titulo}
          </div>
        </div>
        <div style={{ margin: "20px auto 0", height: 2, width: 420 * fio, background: `linear-gradient(90deg, rgba(242,180,90,0), ${COR.destaque}, rgba(242,180,90,0))`, boxShadow: `0 0 12px ${COR.destaque}` }} />
        {abaixo ? (
          <div style={{ marginTop: 18, fontSize: 28, fontWeight: 500, letterSpacing: "0.22em", paddingLeft: "0.22em", textTransform: "uppercase", color: COR.tintaSuave, opacity: interpolate(f, [entra + 16, entra + 34], [0, 1], cl) }}>{abaixo}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
