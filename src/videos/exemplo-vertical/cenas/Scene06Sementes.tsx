import { IconeDestaque, PainelNumero, TagNoMapa, TextoImpacto } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA06, CENA07 } from "../roteiro";
import { MarcadorCidade, SeloNoMapa, Viagem } from "./comum";
import { ROTA_ASIA, ROTA_LONDRES } from "./Estado";

// CENA 06 — AS SEMENTES (ainda em cinza). "Até que um inglês levou setenta mil sementes de seringueira,
// que viraram plantações na Ásia. E a riqueza acabou."
// "Até que um inglês…": o cartão sai e a câmera RECUA até o mundo; Manaus e Londres marcadas, o selo da
// bandeira inglesa → "…levou setenta mil sementes…": a semente atravessa o Atlântico deixando a rota
// (Estado.tsx) e o painel "70.000 SEMENTES" → "…na Ásia": a rota até a Malásia e as árvores pousam → "E a
// riqueza acabou": o texto de impacto despenca.

export const Scene06Textos: React.FC = () => (
  <>
    <MarcadorCidade ponto={LUGAR.manaus} nome="MANAUS" entra={CENA06.recuo[1] - 8} sai={CENA07.mergulho[0]} cor={COR.cidade} corpo={30} />
    <MarcadorCidade ponto={LUGAR.londres} nome="LONDRES" entra={CENA06.ingles} sai={CENA07.mergulho[0]} cor={COR.historiaClara} corpo={30} />
    <SeloNoMapa src="assets/bandeiras/reino-unido.png" ponto={LUGAR.londres} dy={-120} entra={CENA06.ingles + 3} sai={CENA07.mergulho[0]} tamanho={110} />
    <Viagem pontos={ROTA_LONDRES} faixa={CENA06.rota1} icone="seedling" sai={CENA07.mergulho[0]} cor={COR.historiaClara} tamanho={90} rastro={false} />
    <PainelNumero numero="70.000" rotulo="SEMENTES DE SERINGUEIRA" icone="seedling" entra={CENA06.sementes} sai={CENA06.acabou - 9} y={330} cor={COR.historia} corNumero={COR.historiaClara} corpo={86} />
    <Viagem pontos={ROTA_ASIA} faixa={CENA06.rota2} icone="seedling" sai={CENA07.mergulho[0]} cor={COR.historiaClara} tamanho={90} rastro={false} />
    <MarcadorCidade ponto={LUGAR.asia} nome="ÁSIA" entra={CENA06.asia} sai={CENA07.mergulho[0]} cor={COR.historiaClara} corpo={30} />
    <IconeDestaque parado nome="deciduous_tree" entra={CENA06.asia + 6} sai={CENA07.mergulho[0]} ponto={LUGAR.asia} dy={-130} tamanho={100} cor={COR.historia} />
    <TagNoMapa texto="PLANTAÇÕES NA ÁSIA" entra={CENA06.asia} sai={CENA06.acabou - 9} ponto={LUGAR.asia} dx={-150} dy={110} cor={COR.historia} corpo={26} passo={0.5} />
    <TextoImpacto linhas={["E A RIQUEZA", "ACABOU"]} entra={CENA06.acabou} sai={CENA07.mergulho[0] + 4} y={360} corpo={104} cor={COR.historiaClara} />
  </>
);
