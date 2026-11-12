import { Easing, Img, interpolate, staticFile} from "remotion";
import { useQuadro } from "./tempo";
import type { NomeDoIcone } from "./assets";
import { icone } from "./Icone3D";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// PAINEL DE NÚMERO e ETIQUETA DE LUGAR — o "HUD" dos vídeos de mapa editados profissionalmente.
//
// PainelNumero: um cartão de vidro escuro (desfoca o que está atrás, fio de luz na cor do
// assunto) com o ícone 3D à esquerda, o NÚMERO digitado caractere a caractere (o estilo
// "Mapas Animados": número não conta, se digita) e o rótulo embaixo. Entra subindo com
// pop (10 quadros) e sai encolhendo. Fica legível em cima do mapa ou de uma foto.
//
// EtiquetaDeLugar: a "tag" do lugar em cima de uma imagem real — um ponto na cor do assunto e o
// nome digitado, num retângulo de vidro que se abre da esquerda. Sai fechando para a esquerda.
// Os dois vão em TELA (x/y em px).
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.45, 0.64, 1);
const MONTSERRAT = "Montserrat, Inter, system-ui, sans-serif";

// quantos caracteres já foram digitados (1 a cada `passo` quadros)
const digitados = (f: number, entra: number, n: number, passo = 1.2) => Math.max(0, Math.min(n, Math.floor((f - entra) / passo) + 1));

export const PainelNumero: React.FC<{
  numero: string;
  unidade?: string;
  rotulo?: string;
  icone?: NomeDoIcone;
  entra: number;
  sai?: number;
  x?: number;
  y?: number;
  cor?: string;
  corNumero?: string;
  corpo?: number; // tamanho do número (px)
}> = ({ numero, unidade = "", rotulo, icone: nomeDoIcone, entra, sai = Infinity, x: xDado, y: yDado, cor = "#3FC8FF", corNumero = "#FFFFFF", corpo = 112 }) => {
  const f = useQuadro();
  // o padrão vem do formato (vertical: 540 × 380, o de sempre; horizontal: o terço esquerdo)
  const formato = useFormato();
  const x = xDado ?? formato.painel.x;
  const y = yDado ?? formato.painel.y;
  if (f < entra) return null;
  const k = interpolate(f, [entra, entra + 10], [0, 1], { ...cl, easing: POP });
  const fora = interpolate(f, [sai, sai + 8], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  if (fora <= 0) return null;
  const n = digitados(f, entra + 4, numero.length);
  const nU = digitados(f, entra + 4 + numero.length * 1.2, unidade.length);
  const nR = rotulo ? digitados(f, entra + 8, rotulo.length, 0.8) : 0;
  const lado = nomeDoIcone ? corpo * 1.25 : 0;
  // o brilho que corre no fio do painel uma vez, logo depois de abrir
  const fio = interpolate(f, [entra + 6, entra + 26], [-30, 130], cl);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - k) * 40}px) scale(${(0.85 + 0.15 * k) * (0.9 + 0.1 * fora)})`,
        opacity: Math.min(1, k * 1.5) * fora,
        display: "flex",
        alignItems: "center",
        gap: corpo * 0.22,
        padding: `${corpo * 0.18}px ${corpo * 0.42}px ${corpo * 0.18}px ${nomeDoIcone ? corpo * 0.24 : corpo * 0.42}px`,
        borderRadius: corpo * 0.32,
        background: "linear-gradient(160deg, rgba(10,24,40,0.72), rgba(4,12,22,0.62))",
        backdropFilter: "blur(14px) saturate(1.3)",
        border: "2px solid rgba(255,255,255,0.28)",
        boxShadow: `0 18px 40px rgba(0,0,0,0.5), 0 0 0 1px ${cor}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
        whiteSpace: "nowrap",
        // um div absoluto em left: x só "cabe" até a borda direita da tela (shrink-to-fit): sem
        // isto, um rótulo comprido no meio da tela era cortado ("MENOR ESTAD")
        width: "max-content",
        overflow: "hidden",
      }}
    >
      {/* o fio de luz na cor do assunto, embaixo, e o brilho que passa uma vez */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: `linear-gradient(90deg, ${cor}00, ${cor}, ${cor}00)` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${fio}%`, width: "22%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))", transform: "skewX(-18deg)" }} />
      {nomeDoIcone && (
        <Img
          src={staticFile(icone(nomeDoIcone))}
          style={{
            width: lado,
            height: lado,
            objectFit: "contain",
            transform: `scale(${interpolate(f, [entra + 3, entra + 13], [0, 1], { ...cl, easing: POP })}) rotate(${interpolate(f, [entra + 3, entra + 13], [-20, 0], cl)}deg)`,
            filter: `drop-shadow(0 8px 10px rgba(0,0,0,0.5)) drop-shadow(0 0 14px ${cor}66)`,
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: nomeDoIcone ? "flex-start" : "center" }}>
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: corpo, lineHeight: 1, color: corNumero, letterSpacing: "0.01em", textShadow: `0 0 18px ${cor}AA, 0 4px 10px rgba(0,0,0,0.6)` }}>
          <span>{numero.slice(0, n)}</span>
          <span style={{ opacity: 0 }}>{numero.slice(n)}</span>
          {unidade && (
            <span style={{ fontSize: corpo * 0.45, marginLeft: corpo * 0.08 }}>
              <span>{unidade.slice(0, nU)}</span>
              <span style={{ opacity: 0 }}>{unidade.slice(nU)}</span>
            </span>
          )}
        </div>
        {rotulo && (
          <div style={{ marginTop: corpo * 0.1, fontFamily: MONTSERRAT, fontWeight: 800, fontSize: corpo * 0.36, letterSpacing: "0.12em", color: "rgba(255,255,255,0.88)" }}>
            <span>{rotulo.slice(0, nR)}</span>
            <span style={{ opacity: 0 }}>{rotulo.slice(nR)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// `passo`: QUADROS por letra na digitação do nome (0,9 = o padrão; 0,5 = duas letras por quadro, o nome
// inteiro em ~0,4 s, para os cartões que ficam pouco na tela)
export const EtiquetaDeLugar: React.FC<{ nome: string; entra: number; sai?: number; x?: number; y?: number; cor?: string; corpo?: number; passo?: number }> = ({
  nome,
  entra,
  sai = Infinity,
  x = 60,
  y = 250,
  cor = "#F0A12A",
  corpo = 40,
  passo = 0.9,
}) => {
  const f = useQuadro();
  if (f < entra) return null;
  const abre = interpolate(f, [entra, entra + 9], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const fecha = interpolate(f, [sai, sai + 7], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  const k = abre * fecha;
  if (k <= 0) return null;
  const n = digitados(f, entra + 4, nome.length, passo);
  const pulso = 0.6 + 0.4 * Math.sin((f - entra) / 6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: corpo * 0.4,
        padding: `${corpo * 0.32}px ${corpo * 0.6}px ${corpo * 0.32}px ${corpo * 0.45}px`,
        borderRadius: corpo * 0.3,
        background: "rgba(6,16,28,0.62)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255,255,255,0.25)",
        borderLeft: `${corpo * 0.16}px solid ${cor}`,
        boxShadow: "0 12px 26px rgba(0,0,0,0.45)",
        clipPath: `inset(0 ${(1 - k) * 100}% 0 0 round ${corpo * 0.3}px)`,
        whiteSpace: "nowrap",
      }}
    >
      <svg width={corpo * 0.62} height={corpo * 0.8} viewBox="0 0 24 32">
        <path d="M12 31 C12 31 2 18 2 11 A10 10 0 1 1 22 11 C22 18 12 31 12 31 Z" fill={cor} stroke="#FFFFFF" strokeWidth={2} />
        <circle cx={12} cy={11} r={4} fill="#FFFFFF" opacity={pulso} />
      </svg>
      <span style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: corpo, letterSpacing: "0.06em", color: "#FFFFFF", textShadow: "0 3px 8px rgba(0,0,0,0.6)" }}>
        <span>{nome.slice(0, n)}</span>
        <span style={{ opacity: 0 }}>{nome.slice(n)}</span>
      </span>
    </div>
  );
};
