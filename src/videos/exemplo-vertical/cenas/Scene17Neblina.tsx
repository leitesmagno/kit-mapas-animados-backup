import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA17, CENA18 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 17 — O PICO DA NEBLINA. "No extremo norte, o Pico da Neblina é o teto do Brasil, com quase três mil
// metros."
// "No extremo norte…": o voo até o pico, na fronteira com a Venezuela (o mapa embaixo) → "…o Pico da
// Neblina": o pino e a foto no cartão → "…o teto do Brasil": a tag → "…quase três mil metros": a tag troca
// para a altitude (2.995 m, IBGE).

export const Scene17Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={800} passoNome={0.5} sai={CENA18.recuo[0]} cor={COR.floresta} fotos={[{ ...foto("pico-da-neblina.jpg"), em: CENA17.neblina, ponto: LUGAR.picoDaNeblina, nome: "PICO DA NEBLINA", icone: "mountain" }]} />
    <MarcoDoLugar ponto={LUGAR.picoDaNeblina} entra={CENA17.neblina} sai={CENA18.recuo[0]} />
    <TagNoMapa texto="O TETO DO BRASIL" entra={CENA17.teto} sai={CENA17.metros - 2} x={540} y={128} cor={COR.floresta} corpo={38} passo={0.5} />
    <TagNoMapa texto="2.995 METROS" entra={CENA17.metros} sai={CENA18.recuo[0]} x={540} y={128} cor={COR.floresta} corpo={40} passo={0.5} />
  </>
);
