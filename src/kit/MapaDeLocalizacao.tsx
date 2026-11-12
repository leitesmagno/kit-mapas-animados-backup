import { geoMercator, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { useMemo } from "react";
import { Easing, interpolate} from "remotion";
import { useQuadro } from "./tempo";
import type { LonLat } from "../base/geo/projecao";

// ---------------------------------------------------------------------------
// O MAPA DE LOCALIZAÇÃO — o "mapinha" de referência dos mapas profissionais: quando a câmera
// desce numa cidade, um cartão pequeno de vidro escuro mostra a silhueta do estado inteiro com um
// ponto pulsando no lugar da vez (o espectador nunca perde onde está). O ponto DESLIZA de uma
// parada para a próxima (`paradas`, cada uma com o quadro `em`), com o nome curto embaixo.
//
// Fixo na tela (vai FORA da câmera, por cima do mapa e das fotos em cartão, por baixo da
// legenda). Padrão: canto de baixo à direita, entre a legenda e a marca d'água.
//
//   <MapaDeLocalizacao regiao={ALAGOAS} entra={q("maceio")} sai={q("litoral")}
//     paradas={[{ ponto: MACEIO, em: q("maceio"), nome: "MACEIÓ" }]} cor="#C9CC1E" />
// ---------------------------------------------------------------------------

export type ParadaDoMapinha = { ponto: LonLat; em: number; nome?: string };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONTE = "Montserrat, Inter, system-ui, sans-serif";

export const MapaDeLocalizacao: React.FC<{
  regiao: Feature<Geometry>;
  paradas: ParadaDoMapinha[];
  entra: number;
  sai: number;
  x?: number; // canto de cima à esquerda do cartão (px de tela)
  y?: number;
  largura?: number;
  altura?: number;
  cor?: string; // o ponto e o halo
  corRegiao?: string;
}> = ({ regiao, paradas, entra, sai, x = 744, y = 1484, largura = 300, altura = 204, cor = "#F0A12A", corRegiao = "#9FB0FF" }) => {
  const f = useQuadro();
  const pad = 16;
  const rodape = 30;
  const { d, proj } = useMemo(() => {
    const p = geoMercator().fitExtent(
      [
        [pad, pad],
        [largura - pad, altura - pad - rodape],
      ],
      regiao,
    );
    return { d: geoPath(p)(regiao) ?? "", proj: p };
  }, [regiao, largura, altura]);
  if (f < entra || f > sai + 10) return null;
  const abre = interpolate(f, [entra, entra + 10], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
  const fecha = interpolate(f, [sai, sai + 8], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  const k = abre * fecha;
  if (k <= 0) return null;

  // a parada da vez e o deslize desde a anterior (12 quadros)
  const i = paradas.reduce((n, p, j) => (p.em <= f ? j : n), 0);
  const atual = paradas[i];
  const anterior = paradas[Math.max(0, i - 1)];
  const t = i > 0 ? interpolate(f, [atual.em, atual.em + 12], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) }) : 1;
  const [ax, ay] = proj(anterior.ponto) ?? [0, 0];
  const [bx, by] = proj(atual.ponto) ?? [0, 0];
  const px = ax + (bx - ax) * t;
  const py = ay + (by - ay) * t;
  const onda = (((f - entra) % 30) + 30) % 30 / 30;
  const nomeK = interpolate(f, [atual.em + 4, atual.em + 12], [0, 1], cl);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        height: altura,
        transform: `scale(${0.85 + 0.15 * k})`,
        transformOrigin: "100% 100%",
        opacity: k,
        borderRadius: 18,
        background: "linear-gradient(160deg, rgba(10,22,40,0.78), rgba(4,12,24,0.86))",
        border: "2px solid rgba(255,255,255,0.55)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
        overflow: "hidden",
      }}
    >
      <svg width={largura} height={altura} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={d} fill={corRegiao} fillOpacity={0.28} stroke="#FFFFFF" strokeWidth={1.8} strokeLinejoin="round" />
        <circle cx={px} cy={py} r={7 + 16 * onda} fill="none" stroke={cor} strokeWidth={2.5} opacity={1 - onda} />
        <circle cx={px} cy={py} r={7} fill="#FFFFFF" stroke={cor} strokeWidth={3.5} />
      </svg>
      {atual.nome && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 8,
            textAlign: "center",
            fontFamily: FONTE,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.06em",
            color: "#FFFFFF",
            opacity: nomeK,
            whiteSpace: "nowrap",
          }}
        >
          {atual.nome}
        </div>
      )}
    </div>
  );
};
