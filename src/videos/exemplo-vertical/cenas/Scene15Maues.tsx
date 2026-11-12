import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA15, CENA16 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 15 — MAUÉS E O GUARANÁ. "Em Maués nasceu o guaraná. Para os Sateré-Mawé, ele brotou dos olhos de um
// menino, e por isso parece um olho."
// O voo curto até Maués (o mapa embaixo); o município e o pino → "…nasceu o guaraná": a foto do fruto aberto
// no cartão → "…os Sateré-Mawé…": a tag → "…parece um olho": a tag troca.

export const Scene15Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={800} passoNome={0.5} sai={CENA16.recuo[0]} cor={COR.povos} fotos={[{ ...foto("guarana.jpg"), em: CENA15.guarana, ponto: LUGAR.maues, nome: "GUARANÁ", icone: "seedling" }]} />
    <MarcoDoLugar ponto={LUGAR.maues} entra={CENA15.maues} sai={CENA16.recuo[0]} />
    <TagNoMapa texto="A LENDA DOS SATERÉ-MAWÉ" entra={CENA15.satere} sai={CENA15.olho - 9} x={540} y={128} cor={COR.povos} corpo={34} passo={0.5} />
    <TagNoMapa texto="PARECE UM OLHO" entra={CENA15.olho} sai={CENA16.recuo[0]} x={540} y={128} cor={COR.povos} corpo={38} passo={0.5} />
  </>
);
