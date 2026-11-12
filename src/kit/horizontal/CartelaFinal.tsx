import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFormato } from "../../motor/formato";
import type { NomeDoIcone } from "../assets";
import { icone as caminhoDoIcone } from "../Icone3D";

// ---------------------------------------------------------------------------
// A VINHETA FINAL do documentário horizontal: o mapa escurece, a logo do canal entra no centro,
// "SIGA O CANAL" com o botão de inscrição, e os quatro pedidos (sino, like, compartilhar,
// comentar) entram cada um NA PALAVRA da narração; por último, a pergunta que puxa o comentário.
// Fica até o fim do vídeo (o lugar da tela final do YouTube). Texto por código, ícones do banco.
//
//   <CartelaFinal entra={…} siga={…} sino={…} like={…} compartilhe={…} comente={…}
//                 pergunta="Você acha que…?" perguntaEm={…} />
// ---------------------------------------------------------------------------

// a fonte da identidade horizontal (a dos vídeos São Luís / Piauí / Ceará)
const FONTE = "Inter, system-ui, sans-serif";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.5, 0.64, 1);

const PEDIDOS: { chave: "sino" | "like" | "compartilhe" | "comente"; icone: NomeDoIcone; texto: string }[] = [
  { chave: "sino", icone: "sino", texto: "ATIVE O SINO" },
  { chave: "like", icone: "joinha", texto: "DEIXE O LIKE" },
  { chave: "compartilhe", icone: "compartilhar", texto: "COMPARTILHE" },
  { chave: "comente", icone: "balao_de_comentario", texto: "COMENTE" },
];

export const CartelaFinal: React.FC<{
  entra: number;
  siga: number;
  sino: number;
  like: number;
  compartilhe: number;
  comente: number;
  pergunta?: string;
  perguntaEm?: number;
}> = ({ entra, pergunta, perguntaEm, ...momentos }) => {
  const f = useCurrentFrame();
  const { logo } = useFormato();
  if (f < entra) return null;
  const fundo = interpolate(f, [entra, entra + 24], [0, 1], cl);
  const pop = (q: number, n = 12) => interpolate(f, [q, q + n], [0, 1], { ...cl, easing: POP });
  const kLogo = pop(entra + 4, 16);
  const kSiga = pop(momentos.siga, 10);
  const kBotao = pop(momentos.siga + 8, 10);
  const kPerg = perguntaEm !== undefined ? interpolate(f, [perguntaEm, perguntaEm + 14], [0, 1], cl) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(4,14,22,0.62) 0%, rgba(2,6,10,0.88) 100%)", opacity: fundo }} />
      {logo ? (
        <Img
          src={staticFile(logo.src)}
          style={{ position: "absolute", left: 960 - 105, top: 150, width: 210, height: 210, transform: `scale(${kLogo})`, filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))" }}
        />
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 392, textAlign: "center", fontFamily: FONTE, fontWeight: 900, fontSize: 66, color: "#FFFFFF", letterSpacing: "0.02em", opacity: kSiga, transform: `scale(${0.8 + 0.2 * kSiga})`, textShadow: "0 6px 26px rgba(0,0,0,0.6)" }}>
        SIGA O CANAL
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 488, display: "flex", justifyContent: "center", opacity: kBotao, transform: `scale(${kBotao})` }}>
        <div style={{ background: "#E8002D", color: "#FFFFFF", fontFamily: FONTE, fontWeight: 800, fontSize: 30, letterSpacing: "0.08em", padding: "14px 40px", borderRadius: 999, boxShadow: "0 8px 24px rgba(232,0,45,0.45)" }}>INSCREVER-SE</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", gap: 90 }}>
        {PEDIDOS.map((p) => {
          const k = pop(momentos[p.chave], 12);
          return (
            <div key={p.chave} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 30}px)` }}>
              <Img src={staticFile(caminhoDoIcone(p.icone))} style={{ width: 118, height: 118, transform: `scale(${k})`, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.55))" }} />
              <div style={{ marginTop: 12, fontFamily: FONTE, fontWeight: 800, fontSize: 24, letterSpacing: "0.12em", color: "#F4EFE6" }}>{p.texto}</div>
            </div>
          );
        })}
      </div>
      {pergunta ? (
        <div style={{ position: "absolute", left: 160, right: 160, top: 840, textAlign: "center", fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: "#FFC94D", opacity: kPerg, transform: `translateY(${(1 - kPerg) * 12}px)`, textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>
          {pergunta}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
