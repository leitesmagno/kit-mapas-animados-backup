import type { NomeDoIcone } from "./assets";
import { Icone3D } from "./Icone3D";

// ---------------------------------------------------------------------------
// O SELO 3D: um ícone 3D (Fluent Emoji) preso ao canto de um card ou de um número — o "carimbo"
// do assunto (as dunas no card das dunas, o foguete no card do CLBI). Entra em POP girando logo
// depois que o card abre (`entra`), boia enquanto ele está na tela e encolhe na saída. Vai na
// mesma camada do card (tela), com o retângulo do card (`caixa`, px de tela).
// ---------------------------------------------------------------------------

export const Selo3D: React.FC<{
  nome: NomeDoIcone;
  caixa: { x: number; y: number; largura: number; altura: number };
  entra: number;
  sai?: number;
  canto?: "direito" | "esquerdo";
  tamanho?: number;
  brilho?: string;
}> = ({ nome, caixa, entra, sai, canto = "direito", tamanho = 128, brilho }) => (
  <Icone3D
    nome={nome}
    x={canto === "direito" ? caixa.x + caixa.largura - tamanho * 0.18 : caixa.x + tamanho * 0.18}
    y={caixa.y + tamanho * 0.12}
    entra={entra}
    sai={sai}
    tamanho={tamanho}
    giro={canto === "direito" ? 22 : -22}
    brilho={brilho}
    balanco={0.8}
  />
);
