import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA11, CENA12 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 11 — O LAGO JANAUARI. "No Lago Janauari, as vitórias-régias passam de dois metros."
// O mergulho do estado até o lago (o mapa embaixo); o pino e as vitórias-régias no cartão de cima → "…passam
// de dois metros": a tag.

export const Scene11Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={800} passoNome={0.5} sai={CENA12.voo[0]} cor={COR.floresta} fotos={[{ ...foto("vitorias-regias.jpg"), em: CENA11.janauari, ponto: LUGAR.janauari, nome: "VITÓRIAS-RÉGIAS", icone: "herb" }]} />
    <MarcoDoLugar ponto={LUGAR.janauari} entra={CENA11.janauari} sai={CENA12.voo[0]} />
    <TagNoMapa texto="FOLHAS DE MAIS DE 2 METROS" entra={CENA11.metros} sai={CENA12.voo[0]} x={540} y={128} cor={COR.floresta} corpo={34} passo={0.5} />
  </>
);
