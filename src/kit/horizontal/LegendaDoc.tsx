import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useFormato } from "../../motor/formato";
import type { PalavraFalada } from "../Textos";

// ---------------------------------------------------------------------------
// A LEGENDA DO DOCUMENTÁRIO HORIZONTAL — outra coisa que a legenda dos Shorts (LegendaPalavras):
// sem cartão, texto MENOR, baixo na tela, a frase inteira (até ~50 caracteres por vez) e a PALAVRA
// FALADA em destaque (dourado), as já ditas em branco e as que vêm ainda apagadas. Uma faixa de
// sombra bem leve no pé da tela dá leitura sobre mapa claro ou imagem, sem virar caixa.
//
// Os blocos quebram na pontuação (ponto, dois-pontos, e vírgula depois de ~24 caracteres) e nunca
// passam de `maxCaracteres`. A posição e o tamanho vêm do perfil horizontal (motor/formato.ts).
//
//   <LegendaDoc palavras={PALAVRAS} />
// ---------------------------------------------------------------------------

// a fonte da identidade horizontal (a dos vídeos São Luís / Piauí / Ceará)
const FONTE = "Inter, system-ui, sans-serif";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const blocos = (palavras: PalavraFalada[], maxCaracteres: number) => {
  const out: PalavraFalada[][] = [];
  let atual: PalavraFalada[] = [];
  const tamanho = (b: PalavraFalada[]) => b.map((p) => p.palavra).join(" ").length;
  for (const p of palavras) {
    if (atual.length && tamanho([...atual, p]) > maxCaracteres) {
      out.push(atual);
      atual = [];
    }
    atual.push(p);
    const fim = /[.!?:;]$/.test(p.palavra) || (/,$/.test(p.palavra) && tamanho(atual) >= 24);
    if (fim) {
      out.push(atual);
      atual = [];
    }
  }
  if (atual.length) out.push(atual);
  return out;
};

export const LegendaDoc: React.FC<{
  palavras: PalavraFalada[];
  y?: number; // o centro da linha (px)
  corpo?: number;
  maxCaracteres?: number;
  cor?: string; // o destaque da palavra falada
  ate?: number; // quadro em que a legenda some (a vinheta final já tem o texto dela)
}> = ({ palavras, y: yDado, corpo: corpoDado, maxCaracteres = 50, cor = "#FFC94D", ate = Infinity }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const formato = useFormato();
  const y = yDado ?? formato.legenda.y;
  const corpo = corpoDado ?? formato.legenda.corpo;
  const t = f / fps;
  const lista = blocos(palavras, maxCaracteres);
  const i = lista.findIndex((b, k) => t >= b[0].inicio - 0.06 && t < (lista[k + 1]?.[0].inicio ?? b[b.length - 1].fim + 0.6) - 0.02);
  const bloco = i >= 0 && f < ate ? lista[i] : null;
  // a faixa de sombra no pé da tela: aparece com a legenda e some nos silêncios longos
  const temFala = bloco ? 1 : 0;
  const entra = bloco ? interpolate(t, [bloco[0].inicio - 0.06, bloco[0].inicio + 0.12], [0, 1], cl) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,0.34) 88%, rgba(0,0,0,0.5) 100%)", opacity: temFala }} />
      {bloco ? (
        <div
          style={{
            position: "absolute",
            left: (width - formato.legenda.larguraMax) / 2,
            width: formato.legenda.larguraMax,
            top: y,
            transform: `translateY(calc(-50% + ${(1 - entra) * 8}px))`,
            opacity: entra,
            textAlign: "center",
            fontFamily: FONTE,
            fontWeight: 700,
            fontSize: corpo,
            lineHeight: 1.25,
            letterSpacing: "0.005em",
            whiteSpace: "nowrap",
          }}
        >
          {bloco.map((p, k) => {
            const proxima = bloco[k + 1]?.inicio ?? p.fim + 0.25;
            const falando = t >= p.inicio - 0.04 && t < proxima - 0.02;
            const dita = t >= proxima - 0.02;
            return (
              <span
                key={k}
                style={{
                  color: falando ? cor : "#FFFFFF",
                  opacity: falando || dita ? 1 : 0.62,
                  textShadow: falando
                    ? `0 2px 6px rgba(0,0,0,0.85), 0 0 16px ${cor}55`
                    : "0 2px 6px rgba(0,0,0,0.85), 0 0 14px rgba(0,0,0,0.45)",
                }}
              >
                {p.palavra}
                {k < bloco.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
