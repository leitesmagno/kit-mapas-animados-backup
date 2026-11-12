import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA05, CENA06 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 05 — A BORRACHA (o satélite em cinza: o passado). "No auge da borracha, Manaus era chamada de Paris
// dos Trópicos, e ergueu o Teatro Amazonas com peças trazidas da Europa."
// "No auge da borracha…": o cartão da estrada sai, o satélite perde a cor e a câmera voa de volta ao centro
// de Manaus (o mapa embaixo); o seringueiro (foto antiga) no cartão de cima → "…Paris dos Trópicos": a tag →
// "…e ergueu o Teatro Amazonas…": o pino no Teatro e a foto dele à noite → "…da Europa": a tag troca.

export const Scene05Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada
      x={40}
      largura={1000}
      alturaMaxima={800}
      passoNome={0.5}
      sai={CENA06.recuo[0]}
      cor={COR.historia}
      fotos={[
        { ...foto("seringueiro.jpg"), em: CENA05.borracha, ponto: LUGAR.teatro, nome: "SERINGUEIRO", icone: "deciduous_tree" },
        { ...foto("teatro-noite.jpg"), em: CENA05.teatro, ponto: LUGAR.teatro, nome: "TEATRO AMAZONAS", icone: "classical_building" },
      ]}
    />
    <MarcoDoLugar ponto={LUGAR.teatro} entra={CENA05.teatro} sai={CENA06.recuo[0]} />
    {/* (a tag "PEÇAS TRAZIDAS DA EUROPA" saiu no pente fino: entrava 0,1 s antes do recuo e só aparecia pela
        metade, no borrão; a "PARIS DOS TRÓPICOS" fica até o recuo) */}
    <TagNoMapa texto="PARIS DOS TRÓPICOS" entra={CENA05.paris} sai={CENA06.recuo[0]} x={540} y={128} cor={COR.historia} corpo={38} passo={0.5} />
  </>
);
