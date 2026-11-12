import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA14, CENA15 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 14 — PARINTINS. "Em Parintins, uma ilha no meio do rio, o Festival dos Bois divide a cidade entre
// Garantido e Caprichoso."
// O voo longo para o leste (o mapa embaixo); o município (a ilha) acende e o pino → "…uma ilha no meio do
// rio": a tag → "…o Festival dos Bois…": o Garantido no cartão, preso ao Bumbódromo → "…Garantido…": a tag
// VERMELHA → logo depois a foto do Caprichoso e, em "…e Caprichoso", a tag AZUL (as cores dos dois bois).

const VERMELHO = "#D32F2F";
const AZUL = "#1F4FE0";

export const Scene14Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada
      x={40}
      largura={1000}
      alturaMaxima={800}
      passoNome={0.5}
      sai={CENA14.fim}
      cor={COR.cidade}
      fotos={[
        { ...foto("garantido.jpg"), em: CENA14.festival, ponto: LUGAR.bumbodromo, nome: "FESTIVAL DE PARINTINS", icone: "party_popper" },
        { ...foto("caprichoso.jpg"), em: CENA14.fotoCaprichoso, ponto: LUGAR.bumbodromo, nome: "FESTIVAL DE PARINTINS", icone: "party_popper" },
      ]}
    />
    <MarcoDoLugar ponto={LUGAR.parintins} entra={CENA14.parintins} sai={CENA14.fim} />
    <TagNoMapa texto="UMA ILHA NO MEIO DO RIO" entra={CENA14.ilha} sai={CENA14.garantido - 2} x={540} y={128} cor={COR.cidade} corpo={34} passo={0.5} />
    <TagNoMapa texto="GARANTIDO" entra={CENA14.garantido} sai={CENA14.caprichoso - 2} x={540} y={128} cor={VERMELHO} corpo={42} passo={0.5} />
    <TagNoMapa texto="CAPRICHOSO" entra={CENA14.caprichoso} sai={CENA15.voo[0]} x={540} y={128} cor={AZUL} corpo={42} passo={0.5} />
  </>
);
