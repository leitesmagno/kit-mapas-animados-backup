import { interpolate} from "remotion";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Título de DOCUMENTÁRIO (abertura estilo Netflix/National Geographic): letras largas e
// espaçadas que entram de um desfoque e se apertam devagar no lugar (o "tracking in"),
// com um fio de luz fino por baixo. Sai subindo um pouco e desfocando. É o oposto do
// `TituloGancho` (inclinado, letra por letra, "viral"): para vídeos de tom premium.
// ---------------------------------------------------------------------------

// A largura aproximada de uma linha em maiúsculas (Montserrat 800 ≈ 0,76 em por letra, mais o
// espaçamento): conta sem medir a fonte, igual em todo quadro.
const larguraDe = (t: string, corpo: number, espaco: number) => t.length * corpo * (0.76 + espaco);

// O título dentro da tela (com o espaçamento largo da entrada): se diminuir um pouco resolve,
// diminui; se não, quebra em duas linhas equilibradas (e diminui o que ainda faltar).
const encaixar = (texto: string, corpo: number, espaco: number, largura: number) => {
  let linhas = [texto];
  const palavras = texto.split(" ");
  // cabe numa linha só diminuindo até 75%? fica numa linha; senão, quebra
  if (largura / larguraDe(texto, corpo, espaco) < 0.75 && palavras.length > 1) {
    let melhor = linhas;
    let pior = Infinity;
    for (let i = 1; i < palavras.length; i++) {
      const par = [palavras.slice(0, i).join(" "), palavras.slice(i).join(" ")];
      const maior = Math.max(...par.map((l) => l.length));
      if (maior < pior) [pior, melhor] = [maior, par];
    }
    linhas = melhor;
  }
  const maior = Math.max(...linhas.map((l) => larguraDe(l, corpo, espaco)));
  return { linhas, tamanho: corpo * Math.min(1, largura / maior) };
};

export const TituloCinema: React.FC<{
  texto: string;
  entra: number;
  sai?: number;
  y: number; // centro vertical, px de tela
  corpo?: number; // px
  cor?: string;
  peso?: number;
  fonte?: string;
  espaco?: number; // espaçamento final entre letras (em)
  fio?: boolean; // o fio de luz por baixo
  corDoFio?: string;
  largura?: number; // px que o título pode ocupar (a área segura do 9:16); passou, quebra a linha e/ou diminui
}> = ({ texto, entra, sai = Infinity, y, corpo = 88, cor = "#FFFFFF", peso = 800, fonte = "Montserrat, Inter, sans-serif", espaco = 0.14, fio = false, corDoFio = "#F2B45A", largura = 940 }) => {
  const q = useQuadro();
  if (q < entra) return null;
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const e = interpolate(q, [entra, entra + 16], [0, 1], { ...cl, easing: CURVA.pouso });
  // o aperto das letras continua devagar enquanto o título está na tela (nunca parado)
  const aperto = interpolate(q, [entra, entra + 90], [0.34, espaco], { ...cl, easing: CURVA.pouso });
  const s = Number.isFinite(sai) ? interpolate(q, [sai, sai + 12], [0, 1], { ...cl, easing: CURVA.saida }) : 0;
  if (s >= 1) return null;
  const linha = interpolate(q, [entra + 6, entra + 30], [0, 1], { ...cl, easing: CURVA.pouso });
  const { linhas, tamanho } = encaixar(texto, corpo, Math.max(0.34, espaco), largura);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(${-50 - 30 * s}%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: e * (1 - s),
        filter: `blur(${(1 - e) * 14 + s * 10}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fonte,
          fontWeight: peso,
          fontSize: tamanho,
          lineHeight: 1.1,
          textAlign: "center",
          color: cor,
          letterSpacing: `${aperto}em`,
          paddingLeft: `${aperto}em`,
          whiteSpace: "nowrap",
          textShadow: "0 4px 30px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        {linhas.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {fio && <div style={{ marginTop: tamanho * 0.32, width: 520 * linha, height: 2, background: `linear-gradient(90deg, transparent, ${corDoFio}, transparent)`, boxShadow: `0 0 12px ${corDoFio}` }} />}
    </div>
  );
};
