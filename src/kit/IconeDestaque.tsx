import {
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useVideoConfig,
} from "remotion";
import { useQuadro } from "./tempo";
import { useMapaOpcional } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import type { NomeDoIcone } from "./assets";
import { icone } from "./Icone3D";

// ---------------------------------------------------------------------------
// ÍCONE EM DESTAQUE — o ícone 3D (Fluent Emoji) "de vitrine", como nos vídeos de mapa editados
// profissionalmente: em vez de um PNG solto, ele pousa num DISCO de vidro na cor do assunto
// (aro branco, brilho em cima, halo em volta) e sai um pouco por cima dele.
//
//   entrada (≈14 quadros): o disco abre com pop, uma ONDA de choque sai dele, o ícone CAI
//   girando e amassa ao pousar (squash), e FAÍSCAS saltam em volta;
//   pousado: o ícone FLUTUA devagar (a sombra no disco encolhe quando ele sobe) e o halo pulsa —
//   com `parado`, fica quieto (sem flutuar nem balançar);
//   saída (8 quadros): estufa e some.
//
// Posição: `x`/`y` (tela) ou `ponto` (lon/lat, dentro do <MapCamera>). Com `ponto` e `haste`, o
// ícone fica ACIMA do lugar, preso a ele por uma haste fina com um ponto na ponta (o "pino").
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.7, 0.64, 1);

export const IconeDestaque: React.FC<{
  nome: NomeDoIcone;
  entra: number;
  sai?: number;
  x?: number;
  y?: number;
  ponto?: LonLat;
  dx?: number;
  dy?: number;
  tamanho?: number; // diâmetro do disco (px); o ícone sai ~20% por cima
  cor?: string; // a cor do assunto (o disco e o halo)
  haste?: boolean; // com `ponto`: o ícone sobe e fica preso ao lugar por uma haste
  espelhar?: boolean;
  disco?: boolean; // false = só o ícone (com a sombra e as faíscas)
  parado?: boolean; // true = depois de pousar fica QUIETO (sem flutuar nem balançar; o halo não pulsa)
  // desloca SÓ o ícone (px): a ponta da haste continua no lugar exato (tirar o ícone de cima de um texto)
  desvio?: [number, number];
  // true = o ícone fica CENTRADO no disco, do mesmo tamanho (para ícone redondo, como o "proibido"); o
  // padrão é o objeto 3D "em pé" sobre o disco, saindo por cima
  centrado?: boolean;
}> = ({
  nome,
  entra,
  sai = Infinity,
  x: xDado,
  y: yDado,
  ponto,
  dx = 0,
  dy = 0,
  desvio = [0, 0],
  tamanho = 170,
  cor = "#3FC8FF",
  haste = false,
  espelhar = false,
  disco = true,
  parado = false,
  centrado = false,
}) => {
  // o padrão é o centro da tela (no vertical, 540 × 960, o de sempre)
  const { width: larguraDaTela, height: alturaDaTela } = useVideoConfig();
  const x = xDado ?? larguraDaTela / 2;
  const y = yDado ?? alturaDaTela / 2;
  const f = useQuadro();
  const mapa = useMapaOpcional();
  if (f < entra) return null;
  const t = f - entra;
  const fora = interpolate(f, [sai, sai + 8], [1, 0], {
    ...cl,
    easing: Easing.in(Easing.cubic),
  });
  if (fora <= 0) return null;

  // onde está o lugar (px de tela) e onde fica o ícone
  const [lx, ly] = ponto && mapa ? mapa.projetar(ponto[0], ponto[1]) : [x, y];
  const altura = haste ? tamanho * 0.95 : 0;
  const cx = lx + dx + desvio[0];
  const cy = ly + dy - altura + desvio[1];

  // a entrada
  const abre = interpolate(t, [0, 9], [0, 1], { ...cl, easing: POP });
  const queda = interpolate(t, [2, 10], [-tamanho * 0.55, 0], {
    ...cl,
    easing: Easing.in(Easing.quad),
  });
  const pousou = t >= 10;
  const squash = pousou
    ? 1 - 0.14 * Math.exp(-(t - 10) / 2.2) * Math.cos((t - 10) * 0.9)
    : 1;
  const giro = interpolate(t, [2, 12], [-24, 0], {
    ...cl,
    easing: Easing.out(Easing.cubic),
  });
  const icone0 = interpolate(t, [2, 6], [0, 1], cl);
  // parado: flutua (o semente muda a fase de cada ícone)
  const fase = random(`destaque-${nome}-${entra}`) * Math.PI * 2;
  const sobe =
    pousou && !parado ? Math.sin((t - 10) / 14 + fase) * tamanho * 0.035 : 0;
  const balanco = pousou && !parado ? Math.sin((t - 10) / 22 + fase) * 3 : 0;
  // a saída estufa antes de sumir
  const estufa = 1 + 0.12 * Math.sin(Math.PI * (1 - fora));
  const k = abre * fora * estufa;

  // a onda de choque e as faíscas
  const onda = interpolate(t, [3, 18], [0, 1], cl);
  const faiscas = Array.from({ length: 7 }, (_, i) => {
    const ang =
      (i / 7) * Math.PI * 2 + random(`faisca-${nome}-${entra}-${i}`) * 0.6;
    const p = interpolate(t, [6, 20], [0, 1], {
      ...cl,
      easing: Easing.out(Easing.cubic),
    });
    const r = tamanho * (0.55 + 0.45 * p);
    return {
      x: Math.cos(ang) * r,
      y: Math.sin(ang) * r * 0.85,
      a: p > 0 && p < 1 ? 1 - p : 0,
      s: 10 + 8 * random(`fs-${nome}-${i}`),
    };
  });

  const d = tamanho;
  const img = d * 1.02;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      {/* a haste até o lugar e o ponto na ponta */}
      {haste && (
        <svg
          width={1}
          height={1}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          <line
            x1={cx}
            y1={cy + d * 0.42 * k}
            x2={lx + dx}
            y2={ly + dy}
            stroke="#FFFFFF"
            strokeWidth={4}
            strokeOpacity={0.9 * fora * abre}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}
          />
          <circle
            cx={lx + dx}
            cy={ly + dy}
            r={8 * k}
            fill={cor}
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: `translate(-50%, -50%) scale(${k})`,
        }}
      >
        {/* o halo pulsando */}
        <div
          style={{
            position: "absolute",
            left: -d * 0.95,
            top: -d * 0.95,
            width: d * 1.9,
            height: d * 1.9,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${cor}88 0%, ${cor}33 40%, ${cor}00 68%)`,
            opacity: parado ? 0.9 : 0.75 + 0.25 * Math.sin(t / 10 + fase),
          }}
        />
        {/* a onda de choque */}
        {onda > 0 && onda < 1 && (
          <div
            style={{
              position: "absolute",
              left: (-d / 2) * (1 + onda * 0.9),
              top: (-d / 2) * (1 + onda * 0.9),
              width: d * (1 + onda * 0.9),
              height: d * (1 + onda * 0.9),
              borderRadius: "50%",
              border: `${Math.max(2, 6 * (1 - onda))}px solid #FFFFFF`,
              opacity: 1 - onda,
            }}
          />
        )}
        {/* o disco de vidro */}
        {disco && (
          <div
            style={{
              position: "absolute",
              left: -d / 2,
              top: -d / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              background: `radial-gradient(circle at 50% 30%, #FFFFFFAA 0%, ${cor}EE 38%, ${cor} 62%, #00000066 100%)`,
              border: `${Math.max(4, d * 0.035)}px solid #FFFFFF`,
              boxShadow: `0 ${d * 0.08}px ${d * 0.16}px rgba(0,0,0,0.5), inset 0 ${-d * 0.06}px ${d * 0.12}px rgba(0,0,0,0.35)`,
            }}
          >
            {/* o reflexo em cima */}
            <div
              style={{
                position: "absolute",
                left: "16%",
                top: "7%",
                width: "68%",
                height: "34%",
                borderRadius: "50%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))",
              }}
            />
          </div>
        )}
        {/* a sombra do ícone no disco (encolhe quando ele sobe) */}
        {!centrado && (
          <div
            style={{
              position: "absolute",
              left: -d * 0.3,
              top: d * 0.2,
              width: d * 0.6,
              height: d * 0.14,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              filter: "blur(6px)",
              transform: `scale(${(1 - sobe / (d * 0.2)) * icone0})`,
            }}
          />
        )}
        {/* o ícone 3D: cai, amassa ao pousar, flutua */}
        <Img
          src={staticFile(icone(nome))}
          style={{
            position: "absolute",
            left: -img / 2,
            top: -img * (centrado ? 0.5 : 0.62) + queda - sobe,
            width: img,
            height: img,
            objectFit: "contain",
            opacity: icone0,
            transformOrigin: centrado ? "50% 50%" : "50% 92%",
            transform: `scale(${(espelhar ? -1 : 1) * (2 - squash)}, ${squash}) rotate(${giro + balanco}deg)`,
            filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))",
          }}
        />
        {/* as faíscas */}
        {faiscas.map((s, i) =>
          s.a > 0 ? (
            <svg
              key={i}
              width={s.s * 2}
              height={s.s * 2}
              viewBox="-10 -10 20 20"
              style={{
                position: "absolute",
                left: s.x - s.s,
                top: s.y - s.s,
                opacity: s.a,
              }}
            >
              <path
                d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z"
                fill="#FFFFFF"
                style={{ filter: `drop-shadow(0 0 3px ${cor})` }}
              />
            </svg>
          ) : null,
        )}
      </div>
    </div>
  );
};
