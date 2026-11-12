import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O NOME DA VIA: aparece PERTO da rua quando a câmera chega nela (não é legenda nem lista).
// Um ponto pequeno sobre a rua, um fio curto e o nome em cima, com as letras se apertando na
// entrada e um fio de luz embaixo; sai subindo e desfocando. A etiqueta não sai da tela:
// se a rua está perto da borda, ela desliza para dentro (o fio acompanha).
// Vai FORA do <MapaSvg>, dentro da câmera.
// ---------------------------------------------------------------------------

export const NomeDaVia: React.FC<{
  ponto: [number, number]; // um ponto sobre a via
  texto: string;
  entra: number;
  sai: number;
  cor?: string;
  corpo?: number;
  acima?: number; // quanto acima do ponto (px)
  margem?: number; // distância mínima da borda da tela
}> = ({ ponto, texto, entra, sai, cor = "#F2B45A", corpo = 40, acima = 96, margem = 70 }) => {
  const f = useQuadro();
  const { projetar, largura } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 14);
  if (fora <= 0) return null;
  const [px, py] = projetar(ponto[0], ponto[1]);
  if (px < -5000) return null;
  const e = entrar(f, entra, 18, CURVA.pouso);
  const fio = entrar(f, entra, 12, CURVA.pouso);
  const aperto = interpolate(f, [entra, entra + 40], [0.3, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.pouso });
  // largura aproximada do texto (Montserrat 800) para manter a etiqueta dentro da tela
  const meia = (texto.length * corpo * (0.7 + aperto)) / 2;
  const cx = Math.max(margem + meia, Math.min(largura - margem - meia, px));
  const topo = py - acima * fio;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: fora }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
        <line x1={px} y1={py} x2={px + (cx - px) * fio} y2={topo + 14} stroke="#000" strokeOpacity={0.4} strokeWidth={4} strokeLinecap="round" />
        <line x1={px} y1={py} x2={px + (cx - px) * fio} y2={topo + 14} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={px} cy={py} r={9 * e} fill={cor} opacity={0.35} />
        <circle cx={px} cy={py} r={4.5 * e} fill="#FFFFFF" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: topo,
          transform: `translate(-50%, -100%) translateY(${-18 * (1 - fora)}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: e,
          filter: `blur(${(1 - e) * 8 + (1 - fora) * 6}px)`,
        }}
      >
        <div style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: corpo, fontWeight: 800, letterSpacing: `${aperto}em`, paddingLeft: `${aperto}em`, color: "#FFFFFF", whiteSpace: "nowrap", textShadow: "0 3px 18px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.8)" }}>{texto}</div>
        <div style={{ marginTop: 8, width: `${80 * e}%`, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${cor}, transparent)`, boxShadow: `0 0 10px ${cor}` }} />
      </div>
    </div>
  );
};
