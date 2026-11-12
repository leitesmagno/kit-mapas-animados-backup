import { geoCircle } from "d3-geo";
import { interpolate} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { escalaDoZoom, RAIO_DA_TERRA } from "./cameraGlobo";
import { CURVA, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O CÍRCULO que marca o lugar exato: no tamanho de verdade (`raioKm`, desenhado na
// superfície do planeta: no globo ele curva com a Terra) e nunca menor que `minimoPx`.
// O traço se desenha como uma caneta dando a volta, com halo, quatro marcas de mira do lado
// de fora e um pulso de radar lento. Vai DENTRO do <MapaSvg>.
// ---------------------------------------------------------------------------

export const CirculoNoMapa: React.FC<{
  centro: [number, number];
  raioKm: number;
  entra: number;
  sai?: number;
  cor?: string;
  minimoPx?: number;
  desenho?: number; // quadros para dar a volta
  mira?: boolean; // as quatro marcas
  pulso?: boolean;
  largura?: number;
  tracejado?: boolean; // hipótese: linha tracejada
}> = ({ centro, raioKm, entra, sai = Infinity, cor = "#F2B45A", minimoPx = 26, desenho = 22, mira = true, pulso = true, largura = 3, tracejado = false }) => {
  const f = useQuadro();
  const { caminho, projetar, camera } = useMapa();
  if (f < entra) return null;
  const fora = sair(f, sai, 12);
  if (fora <= 0) return null;
  const [cx, cy] = projetar(centro[0], centro[1]);
  if (cx < -5000) return null;
  const rPx = (raioKm / RAIO_DA_TERRA) * escalaDoZoom(camera.zoom);
  const real = rPx >= minimoPx;
  const r = real ? rPx : minimoPx;
  const d = real ? (caminho(geoCircle().center(centro).radius((raioKm / RAIO_DA_TERRA) * (180 / Math.PI)).precision(2)()) ?? "") : `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
  const traco = interpolate(f, [entra, entra + desenho], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.pouso });
  const marcas = interpolate(f, [entra + desenho * 0.6, entra + desenho + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.pop });
  const fase = pulso && f > entra + desenho ? ((f - entra - desenho) % 50) / 50 : 0;
  const giro = (f - entra) * 0.4;
  const dash = tracejado ? { strokeDasharray: "10 9" } : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - traco };
  return (
    <g opacity={fora * (tracejado ? traco : 1)}>
      <path d={d} fill="none" stroke={cor} strokeWidth={largura * 4} strokeOpacity={0.35} filter="url(#brilho)" {...dash} />
      <path d={d} fill={cor} fillOpacity={0.06 * traco} stroke={cor} strokeWidth={largura} strokeLinecap="round" {...dash} />
      {fase > 0 && <circle cx={cx} cy={cy} r={r * (1 + fase * 0.7)} fill="none" stroke={cor} strokeWidth={2} strokeOpacity={0.6 * (1 - fase)} />}
      {mira &&
        marcas > 0 &&
        [0, 90, 180, 270].map((a) => {
          const rad = ((a + giro) * Math.PI) / 180;
          const r1 = r + 10;
          const r2 = r + 10 + 22 * marcas;
          return <line key={a} x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)} x2={cx + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)} stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.9 * marcas} strokeLinecap="round" />;
        })}
      <circle cx={cx} cy={cy} r={3.5 * marcas} fill="#FFFFFF" />
    </g>
  );
};
