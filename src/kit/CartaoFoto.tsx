import { Img, interpolate, staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { COR, FONTE } from "../base/estilo";
import type { FotoDaJanela } from "./JanelaFoto";
import { CURVA, boia, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Um cartão com foto e nome, pequeno, para SÉRIES (os rios, as cidades de um ranking): vários
// lado a lado, cada um entrando quando a voz diz o nome. Pop na entrada, boia de leve, sai
// seco. `ponto` liga o cartão ao lugar do mapa por um fio (o espectador sabe de qual rio /
// cidade é a foto). Bom para fotos pequenas (≤ 700 px): o cartão não estica a imagem.
// Vai FORA do <MapaSvg> (dentro do <MapCamera>, para o fio seguir o ponto).
// ---------------------------------------------------------------------------

export const CartaoFoto: React.FC<{
  foto: FotoDaJanela;
  titulo: string;
  entra: number;
  sai?: number;
  x: number; // canto superior esquerdo, px de tela
  y: number;
  largura: number;
  altura: number;
  cor?: string;
  ponto?: LonLat;
  fase?: number;
}> = ({ foto, titulo, entra, sai = Infinity, x, y, largura, altura, cor = COR.destaque, ponto, fase = 0 }) => {
  const q = useQuadro();
  const { projetar } = useMapa();
  if (q < entra) return null;
  const fora = sair(q, sai, 10);
  if (fora <= 0) return null;
  const e = entrar(q, entra, 14, CURVA.pop);
  const b = boia(q, fase, 0.6);
  const vida = interpolate(q, [entra, entra + 150], [0, 1], { extrapolateRight: "clamp" });
  const fio = entrar(q, entra + 6, 12, CURVA.pouso);
  const cx = x + largura / 2 + b.x;
  const topo = y + b.y + (1 - e) * 40;
  const [px, py] = ponto ? projetar(ponto[0], ponto[1]) : [0, 0];
  return (
    <>
      {ponto && fio > 0 && (
        <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", opacity: fora }} width="100%" height="100%">
          <line x1={cx} y1={topo} x2={cx + (px - cx) * fio} y2={topo + (py - topo) * fio} stroke={cor} strokeWidth={2.2} strokeOpacity={0.85} />
          <circle cx={cx + (px - cx) * fio} cy={topo + (py - topo) * fio} r={fio < 1 ? 7 : 6} fill="#FFFFFF" />
          {fio >= 1 && <circle cx={px} cy={py} r={16} fill={cor} opacity={0.35} />}
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: x + b.x,
          top: topo,
          width: largura,
          height: altura,
          borderRadius: 22,
          overflow: "hidden",
          background: "#0A0E12",
          opacity: Math.min(1, e * 2) * fora,
          transform: `scale(${(0.6 + 0.4 * e) * (0.9 + 0.1 * fora)}) rotate(${b.giro * 0.5}deg)`,
          transformOrigin: "50% 100%",
          boxShadow: `0 26px 60px rgba(0,0,0,0.6), 0 0 0 3px ${cor}`,
          pointerEvents: "none",
        }}
      >
        <Img
          src={staticFile(foto.src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: foto.foco,
            transform: `scale(${1.14 - 0.08 * CURVA.suave(vida)})`,
            transformOrigin: foto.foco,
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(6,9,12,0.85) 100%)" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            textAlign: "center",
            fontFamily: FONTE,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: COR.tinta,
            textShadow: "0 3px 16px rgba(0,0,0,0.85)",
            whiteSpace: "nowrap",
          }}
        >
          {titulo}
        </div>
      </div>
    </>
  );
};
