import { random} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { CURVA, boia, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O relógio "andando": o tempo passando numa viagem ("algumas horas depois").
//
// Um adesivo no mesmo acabamento dos ícones 3D (aro metálico, mostrador claro, sombra),
// desenhado em SVG para os ponteiros GIRAREM: o dos minutos dá `horas` voltas entre
// `entra` e `sai` (ou em `duracao` quadros), o das horas anda junto. Entra em pop, boia,
// sai encolhendo. Posição: `ponto` (lon/lat, anda com a câmera) OU `x`/`y` (tela).
// Vai FORA do <MapaSvg>.
// ---------------------------------------------------------------------------

type Posicao = { ponto: LonLat; x?: never; y?: never } | { ponto?: never; x: number; y: number };

export const RelogioAndando: React.FC<
  Posicao & {
    entra: number;
    sai?: number;
    duracao?: number; // quadros em que as `horas` passam (padrão: até `sai`, ou 60)
    horas?: number; // quantas horas o relógio anda
    tamanho?: number; // px
    aro?: string; // cor do aro
    fase?: number;
  }
> = ({ entra, sai = Infinity, duracao, horas = 3, tamanho = 140, aro = "#F2B45A", fase, ...pos }) => {
  const q = useQuadro();
  const { projetar } = useMapa();
  const [x, y] = pos.ponto ? projetar(pos.ponto[0], pos.ponto[1]) : [pos.x as number, pos.y as number];
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const f = fase ?? random(`relogio-${entra}`) * 10;
  const e = entrar(q, entra, 14, CURVA.pop);
  const b = boia(q, f, 0.8);
  const n = duracao ?? (Number.isFinite(sai) ? sai - entra : 60);
  // o tempo anda rápido no começo e assenta (a viagem "chegando")
  const t = entrar(q, entra, Math.max(1, n), CURVA.pouso);
  const minutos = 360 * horas * t; // graus do ponteiro dos minutos
  const horasGraus = 300 + 30 * horas * t; // começa às 10h
  const escala = e * (0.2 + 0.8 * fora);
  return (
    <div
      style={{
        position: "absolute",
        left: x + b.x,
        top: y + b.y,
        width: tamanho,
        height: tamanho,
        transform: `translate(-50%, -50%) scale(${escala}) rotate(${(1 - e) * -18 + b.giro}deg)`,
        opacity: Math.min(1, e * 2),
        filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))",
        pointerEvents: "none",
      }}
    >
      <svg viewBox="0 0 100 100" width={tamanho} height={tamanho}>
        <defs>
          <radialGradient id="relogioMostrador" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#EEF1F6" />
            <stop offset="100%" stopColor="#C9D0DC" />
          </radialGradient>
          <linearGradient id="relogioAro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF3DC" />
            <stop offset="45%" stopColor={aro} />
            <stop offset="100%" stopColor="#8A5A1C" />
          </linearGradient>
        </defs>
        <circle cx={50} cy={50} r={47} fill="url(#relogioAro)" />
        <circle cx={50} cy={50} r={39} fill="url(#relogioMostrador)" />
        {/* os 12 traços; os de 3 em 3 horas mais fortes */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const forte = i % 3 === 0;
          const r0 = forte ? 29 : 32;
          return (
            <line
              key={i}
              x1={50 + r0 * Math.sin(a)}
              y1={50 - r0 * Math.cos(a)}
              x2={50 + 35 * Math.sin(a)}
              y2={50 - 35 * Math.cos(a)}
              stroke="#2B3340"
              strokeWidth={forte ? 3 : 1.6}
              strokeLinecap="round"
            />
          );
        })}
        <line x1={50} y1={50} x2={50} y2={30} stroke="#1B222C" strokeWidth={4.4} strokeLinecap="round" transform={`rotate(${horasGraus} 50 50)`} />
        <line x1={50} y1={54} x2={50} y2={19} stroke={aro} strokeWidth={2.8} strokeLinecap="round" transform={`rotate(${minutos} 50 50)`} />
        <circle cx={50} cy={50} r={3.6} fill="#1B222C" />
        <circle cx={50} cy={50} r={1.6} fill={aro} />
        {/* brilho do vidro */}
        <path d="M 22 38 A 30 30 0 0 1 48 16" fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
      </svg>
    </div>
  );
};
