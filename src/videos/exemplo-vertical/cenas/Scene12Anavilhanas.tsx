import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA12, CENA13 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 12 — ANAVILHANAS. "Em Novo Airão, as Anavilhanas formam um labirinto de quatrocentas ilhas, com
// botos-cor-de-rosa."
// "Em Novo Airão…": o voo até o arquipélago (o mapa embaixo); o município e o pino → "…as Anavilhanas…": o
// parque acende em verde (Estado.tsx) e a foto entra no cartão → "…quatrocentas ilhas": a tag → "…com
// botos-cor-de-rosa": a foto do boto.

export const Scene12Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada
      x={40}
      largura={1000}
      alturaMaxima={800}
      passoNome={0.5}
      sai={CENA13.voo[0] + 10}
      cor={COR.floresta}
      fotos={[
        { ...foto("anavilhanas.jpg"), em: CENA12.anavilhanas, ponto: LUGAR.anavilhanas, nome: "ANAVILHANAS", icone: "desert_island" },
        { ...foto("boto.jpg"), em: CENA12.botos, ponto: LUGAR.anavilhanas, nome: "BOTO-COR-DE-ROSA", icone: "water_wave" },
      ]}
    />
    <MarcoDoLugar ponto={LUGAR.novoAirao} entra={CENA12.novoAirao} sai={CENA13.voo[0] + 10} />
    <TagNoMapa texto="400 ILHAS" entra={CENA12.ilhas} sai={CENA13.voo[0]} x={540} y={128} cor={COR.floresta} corpo={40} passo={0.5} />
  </>
);
