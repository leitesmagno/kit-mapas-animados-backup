import { useMapa } from "../base/componentes/MapCamera";
import { FONTE } from "../base/estilo";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A CHAMADA (a do vídeo "Ceará", que o autor aprovou, trazida para o kit): o nome de um lugar
// SEM caixa, afastado dele. Um ponto de luz no lugar exato, um fio fino que se desenha até um
// espaço livre (`dx`, `dy`, px) e lá o nome, com um fio de luz embaixo. `sub` = uma linha
// menor (a coordenada, o país). Vai FORA do <MapaSvg>, dentro da câmera.
// ---------------------------------------------------------------------------

export const Chamada: React.FC<{
  ponto: [number, number];
  texto: string;
  sub?: string;
  entra: number;
  sai?: number;
  dx: number;
  dy: number;
  cor?: string;
  corpo?: number;
  alinhar?: "esquerda" | "direita" | "centro";
  pontoDeLuz?: boolean;
}> = ({ ponto, texto, sub, entra, sai = Infinity, dx, dy, cor = "#F2B45A", corpo = 46, alinhar = "esquerda", pontoDeLuz = true }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 10);
  if (fora <= 0) return null;
  const [px, py] = projetar(ponto[0], ponto[1]);
  if (px < -5000) return null;
  const p0 = entrar(f, entra, 10, CURVA.pop);
  const fio = entrar(f, entra + 3, 12, CURVA.pouso);
  const rot = entrar(f, entra + 10, 14, CURVA.pouso);
  const pulsa = 0.5 + 0.5 * Math.sin((f - entra) / 8);
  const ax = px + dx;
  const ay = py + dy;
  const tx = alinhar === "esquerda" ? "0%" : alinhar === "direita" ? "-100%" : "-50%";
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fora, pointerEvents: "none" }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
        <line x1={px} y1={py} x2={px + dx * fio} y2={py + dy * fio} stroke="#000" strokeWidth={4} strokeOpacity={0.35} strokeLinecap="round" />
        <line x1={px} y1={py} x2={px + dx * fio} y2={py + dy * fio} stroke="#FFFFFF" strokeWidth={1.8} strokeOpacity={0.9} strokeLinecap="round" />
        {pontoDeLuz && (
          <>
            <circle cx={px} cy={py} r={(14 + 7 * pulsa) * p0} fill={cor} opacity={0.35} />
            <circle cx={px} cy={py} r={6 * p0} fill="#FFFFFF" />
          </>
        )}
      </svg>
      <div style={{ position: "absolute", left: ax, top: ay, transform: `translate(${tx}, -50%) translateY(${(1 - rot) * 12}px)`, opacity: rot, display: "flex", flexDirection: "column", alignItems: alinhar === "direita" ? "flex-end" : alinhar === "centro" ? "center" : "flex-start" }}>
        <div style={{ fontFamily: FONTE, fontSize: corpo, fontWeight: 800, letterSpacing: "0.06em", color: "#FFFFFF", whiteSpace: "nowrap", textShadow: "0 3px 16px rgba(0,0,0,0.95)" }}>{texto}</div>
        <div style={{ marginTop: 5, width: `${100 * rot}%`, height: 3, borderRadius: 2, background: `linear-gradient(${alinhar === "direita" ? "270deg" : "90deg"}, ${cor}, transparent)`, boxShadow: `0 0 10px ${cor}` }} />
        {sub && <div style={{ marginTop: 8, fontFamily: FONTE, fontSize: corpo * 0.5, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>{sub}</div>}
      </div>
    </div>
  );
};
