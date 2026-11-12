import { TextoDigitado } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA02 } from "../roteiro";

// CENA 02 — AS DIVISAS. "Fica no Norte, faz divisa com Roraima, Pará, Mato Grosso, Rondônia e Acre, e
// fronteira com a Venezuela, a Colômbia e o Peru."
// As fotos saem → "Fica no Norte": a câmera recua até a região inteira, os outros seis estados acendem em
// branco em volta do Amazonas (Estado.tsx) e "REGIÃO NORTE" digita sobre o Pará → "…faz divisa…": o recuo
// até os vizinhos e os países inteiros → cada vizinho ganha a bandeira e a sigla NA PALAVRA → "…e
// fronteira…": cada país ganha a bandeira e o nome NA PALAVRA (Estado.tsx).

export const Scene02Textos: React.FC = () => (
  <TextoDigitado texto="REGIÃO NORTE" entra={CENA02.regiao[1] - 8} sai={CENA02.roraima} ponto={LUGAR.nomeNorte} corpo={50} peso={900} brilho={COR.estadoClaro} passo={1} />
);
