import { interpolate, useCurrentFrame } from "remotion";
import { useMapa } from "../../base/componentes/MapCamera";
import { COR, FONTE } from "../../base/estilo";
import { EASE } from "../../base/geo/camera";
import type { LonLat } from "../../base/geo/projecao";

// ---------------------------------------------------------------------------
// O RÓTULO DE MAPA da identidade horizontal — a tipografia dos vídeos "São Luís", "Piauí" e
// "Ceará" (o MapLabel de lá): versalete em Inter, espaçamento largo que "respira" ao entrar, letra
// a letra subindo e focando, sombra funda; a água em itálico azul-claro. Aqui com o que o
// documentário precisa a mais: deslocamento em px (dx/dy) e um PONTO dourado marcando o lugar
// exato quando o nome vai ao lado dele (ilha, cidade, enclave).
// ---------------------------------------------------------------------------

export type EstiloDeRotulo = "pais" | "paisPequeno" | "lugar" | "cidade" | "regiao" | "agua" | "aguaTitulo";

const TIPO: Record<EstiloDeRotulo, React.CSSProperties> = {
  pais: { fontSize: 54, fontWeight: 800, letterSpacing: "0.3em", color: COR.tinta },
  paisPequeno: { fontSize: 26, fontWeight: 700, letterSpacing: "0.3em", color: COR.tintaSuave },
  lugar: { fontSize: 34, fontWeight: 800, letterSpacing: "0.24em", color: COR.tinta },
  cidade: { fontSize: 28, fontWeight: 700, letterSpacing: "0.08em", color: COR.tinta },
  regiao: { fontSize: 24, fontWeight: 700, letterSpacing: "0.5em", color: COR.tintaSuave },
  agua: { fontSize: 24, fontWeight: 500, fontStyle: "italic", letterSpacing: "0.32em", color: "rgba(165, 214, 255, 0.82)" },
  aguaTitulo: { fontSize: 44, fontWeight: 700, fontStyle: "italic", letterSpacing: "0.22em", color: "rgba(190, 228, 255, 0.95)" },
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const RotuloMapa: React.FC<{
  linhas: string[];
  ponto: LonLat;
  entra: number;
  sai?: number;
  estilo?: EstiloDeRotulo;
  dx?: number;
  dy?: number;
  marcador?: boolean; // o ponto dourado no lugar exato (o nome vai deslocado por dx/dy)
  cor?: string; // o marcador
  tamanho?: number; // sobrepõe o tamanho do estilo
}> = ({ linhas, ponto, entra, sai = Infinity, estilo = "pais", dx = 0, dy = 0, marcador = false, cor = COR.destaque, tamanho }) => {
  const q = useCurrentFrame();
  const { projetar } = useMapa();
  if (q < entra) return null;
  const saida = Number.isFinite(sai) ? interpolate(q, [sai, sai + 16], [1, 0], cl) : 1;
  if (saida <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const abre = interpolate(q - entra, [0, 40], [0.35, 0], { ...cl, easing: EASE.pouso });
  const tipo = { ...TIPO[estilo], ...(tamanho ? { fontSize: tamanho } : {}) };
  const espaco = parseFloat(String(tipo.letterSpacing)) + abre;
  const ponto0 = interpolate(q, [entra, entra + 10], [0, 1], cl);
  let k = 0;
  return (
    <>
      {marcador ? (
        <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${ponto0})`, opacity: saida }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: cor, boxShadow: `0 0 0 3px rgba(0,0,0,0.35), 0 0 14px ${cor}` }} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x + dx,
          top: y + dy,
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
          fontFamily: FONTE,
          textTransform: "uppercase",
          textAlign: "center",
          textShadow: "0 2px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.6)",
          opacity: saida,
          lineHeight: 1.15,
          ...tipo,
          letterSpacing: `${espaco}em`,
          paddingLeft: `${espaco}em`, // o espaçamento depois da última letra não desloca o centro
        }}
      >
        {linhas.map((l, li) => (
          <div key={li}>
            {[...l].map((c, i) => {
              const t = interpolate(q - entra - (k++ * 1.1), [0, 12], [0, 1], { ...cl, easing: EASE.pouso });
              return (
                <span key={i} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 10}px)`, filter: `blur(${(1 - t) * 4}px)` }}>
                  {c === " " ? "\u00A0" : c}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};
