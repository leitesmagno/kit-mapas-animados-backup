import { TextoImpacto } from "../../../kit";
import { COR } from "../estilo";
import { CENA10, CENA11 } from "../roteiro";

// CENA 10 — A VIRADA. "Mas é saindo de Manaus que o Amazonas impressiona."
// O texto de impacto despenca junto com o recuo até o estado inteiro → "…impressiona": o contorno do estado
// e o rio pulsam (Estado.tsx).

export const Scene10Textos: React.FC = () => <TextoImpacto linhas={["SAINDO", "DE MANAUS…"]} entra={CENA10.impacto} sai={CENA11.voo[0]} y={340} corpo={108} cor={COR.estadoClaro} />;
