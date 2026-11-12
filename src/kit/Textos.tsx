import { useCurrentFrame, useVideoConfig } from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import { PALETAS, type NomeDaPaleta } from "./paleta";
import { CURVA, entra as entrar, sai as sair, useQuadro } from "./tempo";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// Os textos dos estilos de referência:
//   TituloGancho    — o título do gancho, letra a letra, inclinado, 2ª linha na cor de destaque
//   LegendaPalavras — a legenda embaixo, sincronizada PALAVRA a palavra com o Whisper
//   PinoRotulo      — "Leticia ▼": o nome num balão que cai sobre o ponto
// ---------------------------------------------------------------------------

// ----- Título do gancho ("CIDADES MAIS / POBRES", "Clima / Equatorial") -----
export const TituloGancho: React.FC<{
  linhas: string[]; // a última linha vai na cor de destaque
  entra: number;
  sai?: number;
  x?: number; // centro, px de tela (padrão: meio)
  y: number;
  corpo?: number;
  inclinacao?: number; // graus (os originais usam -3 a -6)
  paleta?: NomeDaPaleta;
  corDestaque?: string;
  maiusculas?: boolean;
  passo?: number; // quadros entre letras
}> = ({ linhas, entra, sai = Infinity, x, y, corpo = 96, inclinacao = -4, paleta = "roxo", corDestaque, maiusculas = true, passo = 1.1 }) => {
  const q = useQuadro();
  const { width } = useVideoConfig();
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const destaque = corDestaque ?? PALETAS[paleta].valor;
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x ?? width / 2,
        top: y,
        transform: `translate(-50%, -50%) rotate(${inclinacao}deg) scale(${0.9 + 0.1 * fora})`,
        opacity: fora,
        textAlign: "center",
        fontFamily: FONTE,
        fontWeight: 800,
        lineHeight: 0.98,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {linhas.map((linha, li) => (
        <div key={li} style={{ fontSize: li === linhas.length - 1 && linhas.length > 1 ? corpo * 0.92 : corpo, color: li === linhas.length - 1 && linhas.length > 1 ? destaque : "#FFFFFF" }}>
          {[...(maiusculas ? linha.toUpperCase() : linha)].map((ch, i) => {
            const t = entrar(q, entra + n++ * passo, 7, CURVA.pop);
            return (
              <span
                key={i}
                style={{
                  display: ch === " " ? "inline" : "inline-block",
                  opacity: Math.min(1, t * 1.6),
                  transform: `translateY(${(1 - t) * corpo * 0.3}px) scale(${0.4 + 0.6 * t}) rotate(${(1 - t) * 14}deg)`,
                  filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined,
                  textShadow: "0 4px 0 rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.55)",
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ----- Legenda palavra a palavra -----
// `palavras` é o `palavras` do transcript.json do Whisper ({ palavra, inicio, fim } em s).
// A legenda mostra um BLOCO de até `porBloco` palavras (quebra também em pontuação); a
// palavra falada agora acende (cor de destaque + pop). Fica na faixa de baixo da área segura.
export type PalavraFalada = { palavra: string; inicio: number; fim: number };

// A GRAFIA da legenda (o Whisper acerta o tempo, mas às vezes erra a escrita): troca SEQUÊNCIAS de
// palavras, mantendo o tempo de cada uma. Mexe só no texto da legenda (o áudio e os eventos ficam).
//   trocarPalavras(PALAVRAS, [[["ao", "Omã."], ["a", "Omã."]], [["estreito", "de", "Ormuz,"], ["Estreito", "de", "Ormuz,"]]])
export const trocarPalavras = (palavras: PalavraFalada[], trocas: [string[], string[]][]): PalavraFalada[] => {
  const saida = palavras.map((p) => ({ ...p }));
  for (const [de, para] of trocas) {
    for (let i = 0; i + de.length <= saida.length; i++) {
      if (de.every((d, k) => saida[i + k].palavra === d)) para.forEach((t, k) => (saida[i + k].palavra = t));
    }
  }
  return saida;
};

// `maxLetras`: fecha o bloco ANTES de uma palavra que o faria passar disso (a linha não quebra
// em duas nem corta nome próprio quando os itens são longos, como "São Roque de Minas")
const blocos = (palavras: PalavraFalada[], porBloco: number, maxLetras = Infinity) => {
  const out: PalavraFalada[][] = [];
  let atual: PalavraFalada[] = [];
  for (const p of palavras) {
    if (atual.length && [...atual, p].map((x) => x.palavra).join(" ").length > maxLetras) {
      out.push(atual);
      atual = [];
    }
    atual.push(p);
    const pausa = /[.,!?;:]$/.test(p.palavra);
    if (atual.length >= porBloco || pausa) {
      out.push(atual);
      atual = [];
    }
  }
  if (atual.length) out.push(atual);
  return out;
};

export const LegendaPalavras: React.FC<{
  palavras: PalavraFalada[];
  deslocamento?: number; // s somados aos tempos do Whisper (quando o áudio começa depois do 0)
  y?: number; // centro, px de tela
  corpo?: number;
  porBloco?: number;
  maxLetras?: number;
  paleta?: NomeDaPaleta;
  corAtiva?: string;
  modo?: "bloco" | "palavra"; // "palavra": só a palavra falada, grande (estilo Mapas Animados)
  // CORTE SECO (estilo "Mapas Animados"): o bloco troca sem animação, tudo branco, sem
  // palavra acesa, em Montserrat 800 — a legenda é só leitura, quem anima é o mapa
  seco?: boolean;
  // os blocos já montados (cada um, uma linha), no lugar do `porBloco`/`maxLetras`: para o vídeo que
  // escreve os blocos à mão e não quer nome próprio cortado no meio
  blocosProntos?: PalavraFalada[][];
  // a fonte e o CONTORNO preto (px) das letras — a legenda dos Reels: Poppins ExtraBold com contorno grosso
  fonte?: string;
  peso?: number;
  contorno?: number;
}> = ({ palavras, deslocamento = 0, y: yDado, corpo: corpoDado, porBloco = 4, maxLetras, paleta = "roxo", corAtiva, modo = "bloco", seco = false, blocosProntos, fonte, peso = 800, contorno = 0 }) => {
  const q = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  // os padrões vêm do formato (vertical: y 1440, corpo 46, linha de width − 160 — os de sempre)
  const formato = useFormato();
  const y = yDado ?? formato.legenda.y;
  const corpo = corpoDado ?? formato.legenda.corpo;
  const larguraDaLinha = Math.min(width - 160, formato.legenda.larguraMax);
  const t = q / fps - deslocamento;
  const lista = blocosProntos ?? (modo === "palavra" ? palavras.map((p) => [p]) : blocos(palavras, porBloco, maxLetras));
  const bloco = lista.find((b, i) => t >= b[0].inicio - 0.05 && t < (lista[i + 1]?.[0].inicio ?? b[b.length - 1].fim + 0.6));
  if (!bloco) return null;
  const ativa = corAtiva ?? PALETAS[paleta].valor;
  const nasce = seco ? 1 : entrar(q, Math.round((bloco[0].inicio + deslocamento - 0.05) * fps), 5, CURVA.pop);
  return (
    <div
      style={{
        position: "absolute",
        left: (width - larguraDaLinha) / 2,
        width: larguraDaLinha,
        top: y,
        transform: `translateY(-50%) scale(${0.85 + 0.15 * nasce})`,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        // com contorno (a legenda dos Reels) o espaço é maior: o traço preto come parte dele
        columnGap: corpo * (contorno ? 0.42 : 0.34),
        fontFamily: fonte ?? (seco ? "Montserrat, Inter, system-ui, sans-serif" : FONTE),
        fontWeight: peso,
        fontSize: corpo,
        lineHeight: 1.1,
        pointerEvents: "none",
      }}
    >
      {bloco.map((p, i) => {
        // acende até a PRÓXIMA palavra começar (nunca duas acesas ao mesmo tempo)
        const falando = !seco && t >= p.inicio && t < Math.min(p.fim + 0.25, bloco[i + 1]?.inicio ?? Infinity);
        const ja = seco || t >= p.inicio;
        const pop = entrar(q, Math.round((p.inicio + deslocamento) * fps), 4, CURVA.pop);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: falando && modo === "bloco" ? ativa : "#FFFFFF",
              opacity: modo === "palavra" || ja ? 1 : 0.55,
              // a palavra acesa NÃO cresce com contorno: crescendo, ela encostava na vizinha ("dahumanidade")
              transform: `scale(${falando && !contorno ? 1 + 0.08 * pop : 1})`,
              textShadow: contorno ? "0 4px 0 rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.55)" : seco ? "0 3px 6px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.8)" : "0 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
              WebkitTextStroke: contorno ? `${contorno}px #000000` : undefined,
              paintOrder: contorno ? "stroke fill" : undefined,
            }}
          >
            {p.palavra}
          </span>
        );
      })}
    </div>
  );
};

// ----- Pino com nome ("Leticia ▼") -----
export const PinoRotulo: React.FC<{
  ponto: LonLat;
  nome: string;
  entra: number;
  sai?: number;
  paleta?: NomeDaPaleta;
  corpo?: number;
}> = ({ ponto, nome, entra, sai = Infinity, paleta = "neon", corpo = 34 }) => {
  const q = useQuadro();
  const { projetar } = useMapa();
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const cai = entrar(q, entra, 12, CURVA.pop);
  const p = PALETAS[paleta];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - (1 - cai) * 60,
        transform: "translate(-50%, -100%)",
        opacity: Math.min(1, cai * 2) * fora,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: FONTE,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: corpo, fontWeight: 800, color: "#FFFFFF", textShadow: `0 0 12px ${p.brilho}, 0 2px 4px rgba(0,0,0,0.9)`, whiteSpace: "nowrap" }}>{nome}</div>
      <div style={{ width: 0, height: 0, marginTop: 4, borderLeft: `${corpo * 0.36}px solid transparent`, borderRight: `${corpo * 0.36}px solid transparent`, borderTop: `${corpo * 0.5}px solid #FFFFFF`, filter: `drop-shadow(0 0 6px ${p.brilho})` }} />
    </div>
  );
};
