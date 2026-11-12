import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { NomeDoIcone } from "../assets";
import { icone as caminhoDoIcone } from "../Icone3D";

// ---------------------------------------------------------------------------
// O DESTAQUE DO DOCUMENTÁRIO HORIZONTAL — o número, a data ou o nome em evidência, no estilo do
// título de abertura: tipografia grande e limpa no terço esquerdo, um filete dourado que cresce e o
// rótulo em versalete espaçado embaixo. SEM cartão: uma sombra suave vinda da esquerda dá a
// leitura (o cartão de vidro do PainelNumero é dos verticais).
//
// O texto principal se DIGITA caractere a caractere (o estilo do canal); a unidade entra no fim,
// menor e dourada. O ícone 3D (opcional) pousa à esquerda do número. Sai deslizando para a esquerda.
// No documentário declarativo, só um destaque fica na tela por vez (src/kit/documentario).
//
//   <Destaque texto="20 milhões" rotulo="DE BARRIS POR DIA (2024)" icone="petroleiro" entra={…} sai={…} />
// ---------------------------------------------------------------------------

// a fonte da identidade horizontal (a dos vídeos São Luís / Piauí / Ceará)
const FONTE = "Inter, system-ui, sans-serif";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const POP = Easing.bezier(0.34, 1.45, 0.64, 1);

export const Destaque: React.FC<{
  texto: string;
  unidade?: string;
  rotulo?: string;
  icone?: NomeDoIcone;
  entra: number;
  sai?: number;
  cor?: string; // o filete e a unidade
  corpo?: number; // o tamanho do texto principal (encolhe sozinho se o texto for longo)
  x?: number; // a margem esquerda do bloco
  y?: number; // o centro do bloco
  larguraMax?: number;
}> = ({ texto, unidade = "", rotulo, icone, entra, sai = Infinity, cor = "#F2B45A", corpo = 118, x = 132, y = 430, larguraMax = 1080 }) => {
  const f = useCurrentFrame();
  if (f < entra) return null;
  const fora = interpolate(f, [sai, sai + 10], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  if (fora <= 0) return null;
  // o texto longo ("28 DE FEVEREIRO DE 2026") encolhe para caber
  const c = Math.min(corpo, larguraMax / Math.max(1, (texto.length + unidade.length * 0.6) * 0.66));
  const n = Math.min(texto.length, Math.max(0, Math.floor((f - entra - 3) / 1.1) + 1));
  const nU = unidade ? Math.min(unidade.length, Math.max(0, Math.floor((f - entra - 3 - texto.length * 1.1) / 1.1) + 1)) : 0;
  const filete = interpolate(f, [entra + 6, entra + 22], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const rot = rotulo ? Math.min(rotulo.length, Math.max(0, Math.floor((f - entra - 12) / 0.7) + 1)) : 0;
  const ic = icone ? interpolate(f, [entra, entra + 12], [0, 1], { ...cl, easing: POP }) : 0;
  const dx = (1 - fora) * -60;
  const ladoIcone = c * 0.95;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fora }}>
      {/* a sombra da esquerda (não é caixa): o texto lê bem em cima do mapa claro */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,12,18,0.62) 0%, rgba(3,12,18,0.34) 30%, rgba(3,12,18,0) 52%)" }} />
      <div style={{ position: "absolute", left: x + dx, top: y, transform: "translateY(-50%)", fontFamily: FONTE, color: "#F4EFE6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: c * 0.22 }}>
          {icone ? (
            <Img
              src={staticFile(caminhoDoIcone(icone))}
              style={{ width: ladoIcone, height: ladoIcone, transform: `scale(${ic})`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))" }}
            />
          ) : null}
          <div style={{ fontSize: c, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 4px 22px rgba(0,0,0,0.55)" }}>
            {texto.slice(0, n)}
            {nU > 0 ? <span style={{ fontSize: c * 0.42, fontWeight: 800, color: cor, marginLeft: c * 0.08 }}>{unidade.slice(0, nU)}</span> : null}
          </div>
        </div>
        <div style={{ marginTop: c * 0.22, height: 4, width: 240 * filete, background: cor, borderRadius: 2, boxShadow: `0 0 12px ${cor}88` }} />
        {rotulo ? (
          <div style={{ marginTop: c * 0.2, fontSize: Math.max(24, c * 0.24), fontWeight: 700, letterSpacing: "0.14em", color: "rgba(244,239,230,0.88)", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
            {rotulo.slice(0, rot)}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
