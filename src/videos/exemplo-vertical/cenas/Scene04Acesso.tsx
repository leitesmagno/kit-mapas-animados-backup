import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { BR319, LUGAR, MEIO_DA_TERRA, RIO_AMAZONAS } from "../dados";
import { COR } from "../estilo";
import { CENA04, CENA05 } from "../roteiro";
import { arco, Escudo, foto, MarcadorCidade, Viagem } from "./comum";

// CENA 04 — COMO SE CHEGA. "E chegar lá é uma aventura: quase todo mundo vai de avião ou de barco. Por
// terra, a BR-319 tem centenas de quilômetros de terra no meio da floresta."
// "E chegar lá…": a câmera recua de Manaus até um quadro com Brasília e Belém; Manaus fica marcada e a tag
// "UMA AVENTURA" → "…de avião…": o avião voa de Brasília a Manaus, com o rastro tracejado → "…ou de
// barco": o barco sobe o Amazonas até Manaus → "Por terra…": o voo até a BR-319 (o mapa embaixo) →
// "…a BR-319…": a estrada se desenha de Manaus a Porto Velho e o escudo pousa (Estado.tsx) → "…centenas
// de quilômetros de terra…": o trecho do meio vira terra, a foto da estrada no cartão de cima, presa ao
// trecho por um fio, e a tag.

const VOO_DO_AVIAO = arco(LUGAR.brasilia, LUGAR.manaus, -0.2);
// o barco sobe o rio: do fim do traçado (perto da foz) até Manaus
const RIO_ACIMA = RIO_AMAZONAS.filter((p) => p[0] > -60.0).reverse();

export const Scene04Textos: React.FC = () => (
  <>
    <MarcadorCidade ponto={LUGAR.manaus} nome="MANAUS" entra={CENA04.recuo[1] - 6} sai={CENA04.voo[0] + 4} cor={COR.cidade} corpo={38} />
    <TagNoMapa texto="UMA AVENTURA" entra={CENA04.aventura} sai={CENA04.voo[0]} x={540} y={420} cor={COR.estado} corpo={40} passo={0.5} />
    <Viagem pontos={VOO_DO_AVIAO} faixa={CENA04.aviao} icone="airplane" giro={-45} sai={CENA04.voo[0]} cor="#FFFFFF" tamanho={120} />
    <Viagem pontos={RIO_ACIMA} faixa={CENA04.barco} icone="ship" espelhar sai={CENA04.voo[0]} cor={COR.rio} tamanho={110} />
    <MarcadorCidade ponto={LUGAR.manaus} nome="MANAUS" entra={CENA04.voo[1] - 4} sai={CENA05.voo[0]} cor={COR.cidade} corpo={30} />
    <MarcadorCidade ponto={LUGAR.portoVelho} nome="PORTO VELHO" entra={CENA04.estrada[1] - 6} sai={CENA05.voo[0]} cor={COR.vizinho} corpo={30} />
    <Escudo ponto={BR319[Math.floor(BR319.length * 0.2)]} entra={CENA04.br319 + 4} sai={CENA05.voo[0]} texto="BR-319" dx={110} corpo={40} />
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={800} passoNome={0.5} sai={CENA05.voo[0]} cor={COR.vizinho} fotos={[{ ...foto("br-319.jpg"), em: CENA04.terra, ponto: MEIO_DA_TERRA, nome: "BR-319", icone: "warning" }]} />
    <TagNoMapa texto="CERCA DE 400 KM DE TERRA" entra={CENA04.terra + 6} sai={CENA05.voo[0]} x={540} y={128} cor={COR.vizinho} corpo={34} passo={0.5} />
  </>
);
