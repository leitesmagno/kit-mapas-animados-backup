import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O MARCADOR do formato comercial (imóvel, hotel, restaurante…): nada de pino padrão.
// Nasce em etapas — um ponto de luz no chão, uma onda que corre pelo chão, o disco que SOBE
// do ponto (com a sombra ficando embaixo e um fio ligando os dois) e, quando fizer sentido,
// a etiqueta. Depois fica vivo: o disco boia de leve e a onda repete devagar.
// Vai FORA do <MapaSvg>, dentro da câmera (ele mesmo desenha o SVG e o HTML).
// ---------------------------------------------------------------------------

export type TipoDeLugar = "casa" | "hotel" | "restaurante" | "empresa" | "turismo" | "ponto";

// ícones de traço (24×24), no estilo dos pictogramas de mapa
const ICONES: Record<TipoDeLugar, string> = {
  casa: "M3.5 11.2 12 4l8.5 7.2M6 9.6V20h4.4v-5.4h3.2V20H18V9.6",
  hotel: "M3 19V6m0 8h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5M7 11.5a1.5 1.5 0 1 0 0-.01",
  restaurante: "M7 3v8m-2.5-8v5a2.5 2.5 0 0 0 5 0V3M7 11v10M16.5 3c-1.9 0-3 2.2-3 5.2 0 2 1.1 3.3 3 3.3V21",
  empresa: "M4 20V5.5L12 3v17m0-12h8v12M7 8h2m-2 3.5h2M7 15h2m6-3.5h2M15 15h2M2.5 20h19",
  turismo: "M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 16.5l-5.2 2.9L8 13.6l-4.4-4 5.9-.7z",
  ponto: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7",
};

export const MarcadorGeo: React.FC<{
  ponto: [number, number];
  entra: number;
  sai?: number;
  tipo?: TipoDeLugar;
  cor?: string;
  // as etiquetas ao longo da vida do marcador (DESTINO na chegada, VOCÊ ESTÁ AQUI na volta…):
  // um sobretítulo pequeno e o nome/endereço, cada uma com a sua janela (quadros)
  etiquetas?: { entra: number; sai: number; sobretitulo?: string; titulo?: string }[];
  altura?: number; // quanto o disco sobe do chão (px)
  tamanho?: number; // raio do disco (px)
}> = ({ ponto, entra, sai = Infinity, tipo = "casa", cor = "#F2B45A", etiquetas = [], altura = 64, tamanho = 30 }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 14);
  if (fora <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  if (x < -5000) return null;
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const t = f - entra;
  const chao = entrar(f, entra, 10, CURVA.pop);
  const onda = interpolate(t, [4, 34], [0, 1], cl);
  const sobe = entrar(f, entra + 12, 22, CURVA.pop);
  const fio = entrar(f, entra + 12, 16, CURVA.pouso);
  const boia = sobe >= 1 ? 3 * Math.sin((t - 34) / 14) : 0;
  const cy = y - altura * sobe + boia;
  // a onda repete devagar enquanto o marcador está na tela
  const eco = t > 40 ? ((t - 40) % 54) / 54 : -1;
  const r = tamanho * (0.4 + 0.6 * sobe);
  const atual = etiquetas.find((x) => f >= x.entra && f <= x.sai + 12);
  const e = atual ? Math.min(entrar(f, atual.entra, 16, CURVA.pouso), sair(f, atual.sai, 12)) : 0;
  const { sobretitulo, titulo } = atual ?? {};
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fora, pointerEvents: "none" }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
        {/* a sombra no chão (encolhe quando o disco sobe) e o ponto exato */}
        <ellipse cx={x} cy={y} rx={tamanho * (0.9 - 0.25 * sobe) * chao} ry={tamanho * 0.32 * chao} fill="#000" opacity={0.55} filter="url(#sombraMarcador)" />
        <circle cx={x} cy={y} r={5 * chao} fill="#FFFFFF" />
        {/* a onda pelo chão (achatada: está deitada no mapa) */}
        {onda > 0 && onda < 1 && <ellipse cx={x} cy={y} rx={tamanho * 3.2 * onda} ry={tamanho * 1.25 * onda} fill="none" stroke={cor} strokeWidth={3} opacity={1 - onda} />}
        {eco >= 0 && <ellipse cx={x} cy={y} rx={tamanho * (0.8 + 2.4 * eco)} ry={tamanho * (0.3 + 0.95 * eco)} fill="none" stroke={cor} strokeWidth={2} opacity={0.7 * (1 - eco)} />}
        {/* o fio do chão ao disco */}
        <line x1={x} y1={y} x2={x} y2={y - (altura - r) * fio + boia} stroke="#FFFFFF" strokeWidth={2.2} strokeOpacity={0.85} strokeLinecap="round" />
        {sobe > 0 && (
          <g>
            <circle cx={x} cy={cy} r={r * 1.9} fill={cor} opacity={0.22} filter="url(#brilhoMarcador)" />
            <circle cx={x} cy={cy} r={r + 4} fill="#0B1017" opacity={0.9} />
            <circle cx={x} cy={cy} r={r} fill={cor} />
            <circle cx={x} cy={cy} r={r} fill="none" stroke="#FFFFFF" strokeWidth={3.5} />
            <g transform={`translate(${x - r * 0.62} ${cy - r * 0.64}) scale(${(r * 1.24) / 24})`}>
              <path d={ICONES[tipo]} fill="none" stroke="#141A22" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}
        <defs>
          <filter id="sombraMarcador" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="brilhoMarcador" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
      </svg>
      {e > 0 && (titulo || sobretitulo) && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: cy - r - 26,
            transform: `translate(-50%, -100%) translateY(${(1 - e) * 16}px)`,
            opacity: e,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "18px 30px 20px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(14,19,27,0.92), rgba(9,13,19,0.88))",
              border: `1.5px solid ${cor}66`,
              boxShadow: `0 18px 50px rgba(0,0,0,0.6), 0 0 30px ${cor}22`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              filter: `blur(${(1 - e) * 6}px)`,
            }}
          >
            {sobretitulo && <div style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "0.34em", paddingLeft: "0.34em", color: cor }}>{sobretitulo}</div>}
            {titulo && <div style={{ marginTop: sobretitulo ? 8 : 0, fontFamily: "Montserrat, Inter, sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "0.03em", color: "#FFFFFF", whiteSpace: "nowrap" }}>{titulo}</div>}
          </div>
          {/* o bico da etiqueta, apontando para o disco */}
          <div style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "13px solid rgba(9,13,19,0.9)" }} />
        </div>
      )}
    </div>
  );
};
