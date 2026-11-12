import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA07, CENA08, CENA09 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENAS 07 e 08 — A ZONA FRANCA, O MERCADO E A PONTA NEGRA (a cor volta). "Décadas depois veio a Zona
// Franca. Hoje, quase toda moto fabricada no Brasil sai de Manaus. Na cidade, ainda tem o Mercado Adolpho
// Lisboa e a Praia da Ponta Negra."
// "Décadas depois…": a cor volta e a câmera MERGULHA do mundo em Manaus (a cidade embaixo) → "…veio a Zona
// Franca": o pino no Distrito Industrial, a fábrica de motos no cartão de cima e a tag → "…quase toda moto…":
// a tag troca → "…o Mercado Adolpho Lisboa": o mesmo cartão troca de foto e o fio corre até o Mercado; um
// pino por vez → "…e a Praia da Ponta Negra": a praia.

export const Scene07Textos: React.FC = () => (
  <>
    {/* o cartão antes dos pinos: o fio passa POR TRÁS do pino */}
    <FotoNoMapaAnimada
      x={40}
      largura={1000}
      alturaMaxima={800}
      passoNome={0.5}
      sai={CENA09.voo[0] + 6}
      cor={COR.cidade}
      fotos={[
        { ...foto("polo-industrial.jpg"), em: CENA07.zonaFranca, ponto: LUGAR.distritoIndustrial, nome: "POLO INDUSTRIAL", icone: "factory" },
        { ...foto("mercado.jpg"), em: CENA08.mercado, ponto: LUGAR.mercado, nome: "MERCADO ADOLPHO LISBOA", icone: "classical_building" },
        { ...foto("ponta-negra-alto.jpg"), em: CENA08.pontaNegra, ponto: LUGAR.pontaNegra, nome: "PONTA NEGRA", icone: "beach_with_umbrella" },
      ]}
    />
    <MarcoDoLugar ponto={LUGAR.distritoIndustrial} entra={CENA07.zonaFranca} sai={CENA08.paraMercado[0]} />
    <MarcoDoLugar ponto={LUGAR.mercado} entra={CENA08.mercado} sai={CENA08.paraPontaNegra[0]} />
    <MarcoDoLugar ponto={LUGAR.pontaNegra} entra={CENA08.pontaNegra} sai={CENA09.voo[0]} />
    <TagNoMapa texto="ZONA FRANCA DE MANAUS" entra={CENA07.zonaFranca + 4} sai={CENA07.moto - 2} x={540} y={128} cor={COR.cidade} corpo={36} passo={0.5} />
    <TagNoMapa texto="QUASE TODA MOTO DO BRASIL" entra={CENA07.moto} sai={CENA08.mercado - 2} x={540} y={128} cor={COR.cidade} corpo={34} passo={0.5} />
  </>
);
