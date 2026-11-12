import { Easing, Img, interpolate, staticFile} from "remotion";
import { useQuadro } from "./tempo";
import { useMapaOpcional } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { TagNoMapa } from "./TagNoMapa";
import { TextoDigitado } from "./TextoDigitado";

// ---------------------------------------------------------------------------
// RETRATO NO MAPA — a pessoa no lugar dela (o governador no estado, o prefeito na cidade), no
// movimento do estilo "Mapas Animados": um disco com a foto, borda branca e um aro na cor
// do assunto (o partido), que salta com pop seco (8 quadros) em cima do `ponto`; o NOME digita
// logo embaixo, e um `selo` opcional ("REELEITO") entra como tag chapada depois. Sai encolhendo
// (o nome apaga de trás para a frente). Vai dentro do <MapCamera>, fora do <MapaSvg>.
// `foco` é o object-position da foto (o rosto costuma ficar no terço de cima); `aproximar`
// fecha no rosto quando a foto é de meio corpo. Sem `ponto`, fica fixo na tela em `x`/`y` (o
// duelo de candidatos no alto, o placar): aí pode ir fora do <MapCamera>.
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);

export const RetratoNoMapa: React.FC<{
  foto: string;
  nome: string;
  entra: number;
  sai?: number;
  ponto?: LonLat;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  cor?: string;
  tamanho?: number;
  foco?: string;
  corpo?: number;
  aproximar?: number; // >1 chega mais perto do rosto (a partir do `foco`)
  selo?: string;
  seloEntra?: number;
}> = ({ foto, nome, entra, sai = Infinity, ponto, x: xTela = 540, y: yTela = 960, dx = 0, dy = 0, cor = "#1F4FE0", tamanho = 150, foco = "50% 22%", aproximar = 1, corpo = 40, selo, seloEntra }) => {
  const f = useQuadro();
  const mapa = useMapaOpcional();
  if (f < entra) return null;
  const fora = interpolate(f, [sai + 4, sai + 10], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  const k = interpolate(f, [entra, entra + 8], [0, 1], { ...cl, easing: POP }) * fora;
  if (k <= 0) return null;
  const [px, py] = ponto && mapa ? mapa.projetar(ponto[0], ponto[1]) : [xTela, yTela];
  const x = px + dx;
  const y = py + dy;
  const aro = Math.max(5, tamanho * 0.045);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - tamanho / 2,
          top: y - tamanho / 2,
          width: tamanho,
          height: tamanho,
          borderRadius: "50%",
          overflow: "hidden",
          border: `${aro}px solid #FFFFFF`,
          boxShadow: `0 0 0 ${aro}px ${cor}, 0 12px 24px rgba(0,0,0,0.55)`,
          transform: `scale(${k})`,
          background: "#0A0E12",
        }}
      >
        <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: foco, transform: `scale(${aproximar})`, transformOrigin: foco }} />
      </div>
      <TextoDigitado texto={nome} entra={entra + 4} sai={sai} x={x} y={y + tamanho / 2 + aro * 2 + corpo * 0.62} corpo={corpo} peso={900} brilho={cor} passo={0.8} />
      {selo && <TagNoMapa texto={selo} entra={seloEntra ?? entra + 10} sai={sai} x={x} y={y + tamanho / 2 + aro * 2 + corpo * 1.75} cor={cor} corpo={corpo * 0.62} />}
    </>
  );
};
