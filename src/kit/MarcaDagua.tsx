import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MARCA, textoDaMarca } from "../marca";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// A MARCA D'ÁGUA do canal nos vídeos VERTICAIS, por cima de tudo. O texto (ou a logo) vem do
// marca.json da raiz (src/marca.ts), que a skill preenche na primeira configuração:
//   "marcaDagua": { "usar": "texto", "texto": "MEU CANAL | @meucanal" }   → o "|" vira um fio fino
//   "marcaDagua": { "usar": "imagem", "imagem": "marca/logo.png" }         → a logo no lugar do texto
//   "marcaDagua": { "usar": "nenhuma" }                                     → não desenha nada
//
// Semitransparente e discreta — não disputa com o mapa nem com os textos. O padrão é "fixa":
// centralizada, no pé da tela, a 5% da borda de baixo. No modo "passeia" ela anda devagar pela
// área segura (mais difícil de recortar). Vai no fim do vídeo (último filho).
// Vídeo de CLIENTE: `imagem` (caminho em public/) troca o texto pela logo dele, com `largura`
// em px; a posição e o modo são os mesmos.
// ---------------------------------------------------------------------------

export const MARCA_PADRAO = textoDaMarca();
// a fonte da marca: Montserrat (src/fontes.ts carrega os pesos 600 e 900, locais)
const FONTE_MARCA = "Montserrat, Inter, system-ui, sans-serif";

export const MarcaDagua: React.FC<{
  texto?: string;
  imagem?: string; // logo (public/…) no lugar do texto: vídeo de cliente
  largura?: number; // px da logo
  opacidade?: number; // 0–1 (padrão 0,35)
  corpo?: number; // px
  modo?: "passeia" | "fixa";
  x?: number; // modo "fixa": centro, px de tela (padrão: o meio)
  y?: number; // modo "fixa": centro, px de tela (padrão: 5% acima da borda de baixo)
  // a área em que ela passeia (px de tela): a área segura do 9:16, com folga para o texto
  area?: { esquerda: number; direita: number; topo: number; base: number };
}> = ({ texto = MARCA_PADRAO, imagem: imagemDada, largura = MARCA.marcaDagua.larguraDaImagem || 170, opacidade = MARCA.marcaDagua.opacidade || 0.4, corpo = 44, modo = "fixa", x, y, area: areaDada }) => {
  const imagem = imagemDada ?? (MARCA.marcaDagua.usar === "imagem" && MARCA.marcaDagua.imagem ? MARCA.marcaDagua.imagem : undefined);
  const f = useCurrentFrame();
  // a área do passeio vem do formato (vertical: a de sempre)
  const formato = useFormato();
  const area = areaDada ?? formato.areaDaMarca;
  const { fps, width, height } = useVideoConfig();
  const s = f / fps;
  // o passeio: duas senoides de períodos longos e diferentes (≈ 37 s e 53 s) — atravessa a
  // tela devagar, nunca aos saltos
  const cx = modo === "fixa" ? (x ?? width / 2) : area.esquerda + ((area.direita - area.esquerda) * (1 + Math.sin((s / 37) * 2 * Math.PI + 0.6))) / 2;
  const cy = modo === "fixa" ? (y ?? height * 0.95) : area.topo + ((area.base - area.topo) * (1 + Math.sin((s / 53) * 2 * Math.PI + 2.1))) / 2;
  // sem marca configurada (ou "nenhuma"): nada na tela
  if (!imagem && (MARCA.marcaDagua.usar === "nenhuma" || !texto.trim())) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%, -50%)",
          opacity: opacidade,
          display: "flex",
          alignItems: "center",
          gap: corpo * 0.45,
          fontFamily: FONTE_MARCA,
          fontSize: corpo,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
        }}
      >
        {/* "CANAL | @canal": o nome pesado e espaçado, um fio fino, o @ mais leve */}
        {imagem ? (
          <Img src={staticFile(imagem)} style={{ width: largura, height: "auto", display: "block", filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.45))" }} />
        ) : texto.includes("|") ? (
          <>
            <span style={{ fontWeight: 900, letterSpacing: "0.16em", paddingLeft: "0.16em" }}>{texto.split("|")[0].trim()}</span>
            <span style={{ width: 2, height: corpo * 0.9, background: "#FFFFFF", opacity: 0.7, borderRadius: 1 }} />
            <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>{texto.split("|")[1].trim()}</span>
          </>
        ) : (
          <span style={{ fontWeight: 900, letterSpacing: "0.06em" }}>{texto}</span>
        )}
      </div>
    </AbsoluteFill>
  );
};
