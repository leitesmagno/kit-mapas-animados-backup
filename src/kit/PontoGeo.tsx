import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O PONTO DE REFERÊNCIA de um passeio pela cidade (praça, igreja, mercado, prédio histórico…):
// o marcador DISCRETO, para quando vários lugares aparecem um depois do outro. Um ponto de
// luz no chão com uma onda, uma haste curta e um disco pequeno com o ícone do tipo; o nome ao
// lado (sem caixa, com um fio de luz embaixo), do lado que tiver espaço na tela.
// O `MarcadorGeo` continua sendo o marcador grande (o destino de um vídeo comercial).
// Vai FORA do <MapaSvg>, dentro da câmera.
// ---------------------------------------------------------------------------

export type TipoDePonto = "city" | "neighborhood" | "street" | "avenue" | "square" | "church" | "historic" | "business" | "tourist" | "station";

// pictogramas de traço (24×24)
const ICONES: Record<TipoDePonto, string> = {
  city: "M3 21V9l5-3v15M8 21V4l8 3v14M16 21V11l5 2v8M2 21h20",
  neighborhood: "M3 21v-8l5-4 5 4v8M13 21v-6l4-3 4 3v6M2 21h20",
  street: "M8 3 6 21M16 3l2 18M12 4v2.5M12 10v2.5M12 16v2.5",
  avenue: "M7 3 4 21M17 3l3 18M10.5 4v3M13.5 4v3M10.5 10v3M13.5 10v3M10.5 16v3M13.5 16v3",
  square: "M12 21v-5M6.5 16h11L12 3.5zM7.5 21h9",
  church: "M12 2.5v5M9.5 5h5M5 21v-9l7-4.5 7 4.5v9M10 21v-4a2 2 0 0 1 4 0v4M3.5 21h17",
  historic: "M3 9l9-5 9 5M5 9.5v8.5M9.5 9.5v8.5M14.5 9.5v8.5M19 9.5v8.5M3 20.5h18M3 9h18",
  business: "M4.5 11v9.5h15V11M3 10l2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M10 20.5v-5h4v5",
  tourist: "M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 16.5l-5.2 2.9L8 13.6l-4.4-4 5.9-.7z",
  station: "M6 16V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2ZM6 11h12M9 21l1.5-3M15 21l-1.5-3M9 14.5h.01M15 14.5h.01",
};

export const PontoGeo: React.FC<{
  ponto: [number, number];
  tipo: TipoDePonto;
  entra: number;
  sai?: number;
  nome?: string;
  sub?: string; // uma linha pequena acima do nome (o tipo, o bairro…)
  cor?: string;
  lado?: "direita" | "esquerda" | "auto";
  corpo?: number; // px do nome
  altura?: number; // px da haste
}> = ({ ponto, tipo, entra, sai = Infinity, nome, sub, cor = "#F2B45A", lado = "auto", corpo = 38, altura = 46 }) => {
  const f = useQuadro();
  const { projetar, largura } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 14);
  if (fora <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  if (x < -5000) return null;
  const t = f - entra;
  const chao = entrar(f, entra, 10, CURVA.pop);
  const onda = interpolate(t, [2, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sobe = entrar(f, entra + 6, 18, CURVA.pop);
  const texto = entrar(f, entra + 14, 18, CURVA.pouso);
  const eco = t > 36 ? ((t - 36) % 60) / 60 : -1;
  const r = 24 * (0.5 + 0.5 * sobe);
  const cy = y - altura * sobe;
  // o nome vai para o lado com mais espaço (sem sair da tela)
  const paraEsquerda = lado === "esquerda" || (lado === "auto" && x > largura * 0.56);
  const dx = (r + 22) * (paraEsquerda ? -1 : 1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fora, pointerEvents: "none" }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
        <ellipse cx={x} cy={y} rx={16 * chao} ry={6 * chao} fill="#000" opacity={0.5} />
        <circle cx={x} cy={y} r={4.5 * chao} fill="#FFFFFF" />
        {onda > 0 && onda < 1 && <ellipse cx={x} cy={y} rx={90 * onda} ry={34 * onda} fill="none" stroke={cor} strokeWidth={2.5} opacity={1 - onda} />}
        {eco >= 0 && <ellipse cx={x} cy={y} rx={14 + 60 * eco} ry={5 + 22 * eco} fill="none" stroke={cor} strokeWidth={1.8} opacity={0.6 * (1 - eco)} />}
        <line x1={x} y1={y} x2={x} y2={cy + r} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.85 * sobe} strokeLinecap="round" />
        {sobe > 0 && (
          <g>
            <circle cx={x} cy={cy} r={r * 1.9} fill={cor} opacity={0.18} />
            <circle cx={x} cy={cy} r={r} fill="#0C1119" opacity={0.94} />
            <circle cx={x} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={2.6} />
            <g transform={`translate(${x - r * 0.6} ${cy - r * 0.6}) scale(${(r * 1.2) / 24})`}>
              <path d={ICONES[tipo]} fill="none" stroke={cor} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}
      </svg>
      {texto > 0 && nome && (
        <div
          style={{
            position: "absolute",
            left: x + dx,
            top: cy,
            transform: `translate(${paraEsquerda ? "-100%" : "0"}, -50%) translateX(${(1 - texto) * (paraEsquerda ? 24 : -24)}px)`,
            opacity: texto,
            filter: `blur(${(1 - texto) * 6}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: paraEsquerda ? "flex-end" : "flex-start",
            maxWidth: paraEsquerda ? x - 70 : largura - x - 70,
          }}
        >
          {sub && <div style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "0.3em", color: cor, textShadow: "0 2px 10px rgba(0,0,0,0.95)", whiteSpace: "nowrap" }}>{sub}</div>}
          <div
            style={{
              marginTop: sub ? 4 : 0,
              fontFamily: "Montserrat, Inter, sans-serif",
              fontSize: corpo,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              color: "#FFFFFF",
              textAlign: paraEsquerda ? "right" : "left",
              textShadow: "0 3px 16px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.85)",
            }}
          >
            {nome}
          </div>
          <div style={{ marginTop: 8, width: `${70 * texto}%`, height: 2.5, borderRadius: 2, background: `linear-gradient(${paraEsquerda ? 270 : 90}deg, ${cor}, transparent)`, boxShadow: `0 0 10px ${cor}` }} />
        </div>
      )}
    </div>
  );
};
