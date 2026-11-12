import { FotoNoMapaAnimada, PainelNumero, TagNoMapa, TextoDigitado } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA16, CENA17 } from "../roteiro";
import { foto } from "./comum";

// CENA 16 — OS POVOS. "O Amazonas tem mais indígenas que qualquer estado: mais de quatrocentos e noventa
// mil. E no Vale do Javari vivem povos isolados até hoje."
// O cartão sai e a câmera recua até o estado inteiro → "…mais indígenas que qualquer estado": a tag no alto e
// a FOTO no cartão (uma jovem Tikuna, para exemplificar; sem fio, não é um lugar) → "…mais de quatrocentos e
// noventa mil": o painel "490.854 INDÍGENAS" (Censo 2022) embaixo do estado → "E no Vale do Javari…": o voo
// até a terra indígena, que acende em laranja-urucum (Estado.tsx), e o nome digita → "…povos isolados": a
// tag.

export const Scene16Textos: React.FC = () => (
  <>
    <TagNoMapa texto="MAIS INDÍGENAS DO BRASIL" entra={CENA16.indigenas} sai={CENA16.voo[0]} x={540} y={128} cor={COR.povos} corpo={34} passo={0.5} />
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={700} passoNome={0.5} sai={CENA16.voo[0]} cor={COR.povos} fotos={[{ ...foto("povos-tikuna.jpg"), em: CENA16.indigenas + 2, nome: "POVO TIKUNA", icone: "feather" }]} />
    {/* embaixo do estado (o cartão ocupa o alto) */}
    <PainelNumero numero="490.854" rotulo="INDÍGENAS" icone="busts_in_silhouette" entra={CENA16.numero} sai={CENA17.voo[0]} y={1460} cor={COR.povos} corNumero={COR.povosClaro} corpo={86} />
    <TextoDigitado texto="VALE DO JAVARI" entra={CENA16.javari + 4} sai={CENA17.voo[0]} ponto={LUGAR.javari} corpo={46} peso={900} brilho={COR.povos} passo={1} />
    <TagNoMapa texto="POVOS ISOLADOS" entra={CENA16.isolados} sai={CENA17.voo[0]} x={540} y={480} cor={COR.povos} corpo={36} passo={0.5} />
  </>
);
