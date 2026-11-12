import { useVideoConfig } from "remotion";
import { useQuadro } from "./tempo";
import { useMapaOpcional } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";

// ---------------------------------------------------------------------------
// TEXTO DIGITADO — o rótulo do estilo "Mapas Animados": nome ou número que aparece
// CARACTERE A CARACTERE (1 a cada ~1,2 quadro a 30 fps), o último entrando com fade curto, e
// que sai APAGANDO DE TRÁS PARA FRENTE no mesmo ritmo. Número não conta: se digita
// ("1" → "1." → "1.1" → "1.16" → "1.167"), e a `unidade` vem por último, menor, colada na
// linha de base ("1.167km", "10km²").
//
// Posição: `ponto` (lon/lat, preso ao mapa — vai dentro do <MapCamera>) ou `x`/`y` (tela).
// `ancora` diz que ponto do texto fica na posição: "centro" (padrão), "base" (o texto fica
// ACIMA do ponto, com o ▼ opcional embaixo), "esquerda" (começa no ponto) ou "direita".
// ---------------------------------------------------------------------------

const MONTSERRAT = "Montserrat, Inter, system-ui, sans-serif";

export const TextoDigitado: React.FC<{
  texto: string;
  unidade?: string;
  entra: number; // quadro do 1º caractere
  sai?: number; // quadro em que começa a apagar (de trás para frente)
  passo?: number; // quadros por caractere
  ponto?: LonLat;
  x?: number;
  y?: number;
  dx?: number; // px somados à posição (depois de projetar)
  dy?: number;
  ancora?: "centro" | "base" | "esquerda" | "direita";
  corpo?: number;
  peso?: number;
  cor?: string;
  // o brilho/contorno da cor do assunto em volta das letras (o canal usa a cor da região)
  brilho?: string;
  espacamento?: number; // em em
  seta?: boolean; // ▼ branco embaixo (marcador de lugar)
  inclinacao?: number; // graus (o valor ao longo de uma seta)
  opacidade?: number;
}> = ({
  texto,
  unidade = "",
  entra,
  sai,
  passo = 1.2,
  ponto,
  x: xDado,
  y: yDado,
  dx = 0,
  dy = 0,
  ancora = "centro",
  corpo = 40,
  peso = 800,
  cor = "#FFFFFF",
  brilho,
  espacamento = 0.03,
  seta = false,
  inclinacao = 0,
  opacidade = 1,
}) => {
  const q = useQuadro();
  const mapa = useMapaOpcional();
  // o padrão é o centro da tela (no vertical, 540 × 960, o de sempre)
  const { width, height } = useVideoConfig();
  const x = xDado ?? width / 2;
  const y = yDado ?? height / 2;
  const total = texto.length + (unidade ? 1 : 0); // a unidade entra de uma vez, como o último "caractere"
  // quantos caracteres estão na tela (fracionário: o último em fade)
  const escrito = (q - entra) / passo + 1;
  const apagado = sai !== undefined ? Math.max(0, (q - sai) / passo) : 0;
  const n = Math.min(total, Math.max(0, escrito)) - apagado;
  if (n <= 0 || opacidade <= 0) return null;

  const [px, py] = ponto && mapa ? mapa.projetar(ponto[0], ponto[1]) : [x, y];
  const tx = { centro: "-50%", base: "-50%", esquerda: "0%", direita: "-100%" }[ancora];
  const ty = ancora === "base" ? "-100%" : "-50%";
  const sombra = [
    "0 3px 6px rgba(0,0,0,0.7)",
    "0 0 2px rgba(0,0,0,0.6)",
    brilho ? `0 0 14px ${brilho}` : "",
    brilho ? `0 0 4px ${brilho}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const letra = (i: number) => Math.min(1, Math.max(0, n - i));
  const letras = [...texto];

  return (
    <div
      style={{
        position: "absolute",
        left: px + dx,
        top: py + dy,
        transform: `translate(${tx}, ${ty}) rotate(${inclinacao}deg)`,
        transformOrigin: "50% 100%",
        display: "flex",
        flexDirection: "column",
        alignItems: ancora === "esquerda" ? "flex-start" : ancora === "direita" ? "flex-end" : "center",
        pointerEvents: "none",
        opacity: opacidade,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "pre", fontFamily: MONTSERRAT, fontWeight: peso, fontSize: corpo, lineHeight: 1, letterSpacing: `${espacamento}em`, color: cor, textShadow: sombra }}>
        {letras.map((c, i) => (
          // a letra que ainda não entrou ocupa o lugar (invisível): o texto não "anda" ao digitar
          <span key={i} style={{ opacity: letra(i) }}>
            {c}
          </span>
        ))}
        {unidade && <span style={{ opacity: letra(letras.length), fontSize: corpo * 0.5, marginLeft: corpo * 0.06 }}>{unidade}</span>}
      </div>
      {seta && (
        <div
          style={{
            width: 0,
            height: 0,
            marginTop: corpo * 0.18,
            borderLeft: `${corpo * 0.26}px solid transparent`,
            borderRight: `${corpo * 0.26}px solid transparent`,
            borderTop: `${corpo * 0.34}px solid #FFFFFF`,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))",
            opacity: letra(0),
          }}
        />
      )}
    </div>
  );
};
