import { Easing, Img, interpolate, staticFile} from "remotion";
import { useQuadro } from "./tempo";
import { useFormato } from "../motor/formato";
import type { NomeDoIcone } from "./assets";
import { icone as caminhoDoIcone } from "./Icone3D";

// ---------------------------------------------------------------------------
// PARTE DO TODO — o gráfico mais simples que existe, e o que mais se lê no celular: N ícones 3D
// lado a lado (os do banco do kit: barril_de_petroleo, petroleiro, busts_in_silhouette…),
// `destaque` deles ACESOS (cor cheia + brilho na cor do assunto), o resto APAGADO (cinza,
// translúcido): "1 em cada 5 barris", "3 em cada 10 brasileiros". Os ícones entram um a um com
// pop (2 quadros entre eles); os acesos acendem no quadro `acende` (a palavra da narração), com um
// flash. Sai encolhendo.
//
// Use quando a narração diz uma PROPORÇÃO. Para valor absoluto, PainelNumero; para comparar
// lugares, o mapa pintado. Vai em TELA (x/y = o centro da fileira; padrão = o painel do formato).
//
//   <ParteDoTodo total={5} destaque={1} icone="barril_de_petroleo" entra={q("barris")} acende={q("planeta")} />
// ---------------------------------------------------------------------------

const POP = Easing.bezier(0.34, 1.45, 0.64, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ParteDoTodo: React.FC<{
  total: number;
  destaque: number;
  icone: NomeDoIcone;
  entra: number;
  acende: number;
  sai?: number;
  x?: number;
  y?: number;
  tamanho?: number; // lado de cada ícone (px)
  cor?: string; // o brilho dos acesos
}> = ({ total, destaque, icone, entra, acende, sai = Infinity, x: xDado, y: yDado, tamanho = 120, cor = "#F2B45A" }) => {
  const f = useQuadro();
  const formato = useFormato();
  const x = xDado ?? formato.painel.x;
  const y = yDado ?? formato.painel.y;
  if (f < entra) return null;
  const fora = interpolate(f, [sai, sai + 8], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  if (fora <= 0) return null;
  const flash = interpolate(f, [acende, acende + 3, acende + 16], [0, 1, 0], cl);
  const apaga = interpolate(f, [acende, acende + 8], [0, 1], cl); // os não destacados perdem a cor
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${fora})`, display: "flex", gap: tamanho * 0.08 }}>
      {Array.from({ length: total }, (_, i) => {
        const k = interpolate(f, [entra + i * 2, entra + i * 2 + 9], [0, 1], { ...cl, easing: POP });
        const aceso = i < destaque;
        const brilho = aceso ? interpolate(f, [acende, acende + 6], [0, 1], cl) : 0;
        return (
          <Img
            key={i}
            src={staticFile(caminhoDoIcone(icone))}
            style={{
              width: tamanho,
              height: tamanho,
              transform: `scale(${k * (1 + 0.14 * brilho * flash)})`,
              opacity: aceso ? 1 : 1 - 0.55 * apaga,
              filter: aceso
                ? `drop-shadow(0 0 ${8 + 22 * flash}px ${cor}) drop-shadow(0 6px 10px rgba(0,0,0,${0.35 + 0.2 * brilho}))`
                : `grayscale(${apaga}) brightness(${1 - 0.35 * apaga}) drop-shadow(0 6px 10px rgba(0,0,0,0.35))`,
            }}
          />
        );
      })}
    </div>
  );
};
