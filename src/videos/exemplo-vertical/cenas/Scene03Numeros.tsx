import { FotoNoMapaAnimada, PainelNumero, TagNoMapa } from "../../../kit";
import { LUGAR, POP_MANAUS, POPULACAO } from "../dados";
import { COR } from "../estilo";
import { CENA03, CENA04 } from "../roteiro";
import { foto, Pino } from "./comum";

// CENA 03 — OS NÚMEROS E MANAUS. "São sessenta e dois municípios e mais de quatro milhões de pessoas.
// Metade vive em Manaus, a maior cidade do Norte."
// De volta ao estado (as bandeiras dos vizinhos e dos países apagam); a malha dos 62 municípios se desenha
// de Manaus para fora por cima da bandeira e o painel "62 MUNICÍPIOS" (Estado.tsx) → "…mais de quatro
// milhões de pessoas": as sedes acendem em onda a partir de Manaus, do tamanho da população, e o painel
// "4.360.926 HABITANTES" (IBGE, 2026) → "Metade vive…": os pontos do interior apagam, o de Manaus cresce e o
// painel "53% EM MANAUS" → "…em Manaus": o mergulho, o município demarcado, o pino e a FOTO da capital no
// cartão, presa ao pino pelo fio (o painel sai para o cartão entrar) → "…a maior cidade do Norte": a tag no
// alto, acima do cartão.

const milhar = (n: number) => n.toLocaleString("pt-BR");
const PERCENTUAL = Math.round((100 * POP_MANAUS) / POPULACAO);

export const Scene03Textos: React.FC = () => (
  <>
    <PainelNumero numero="62" rotulo="MUNICÍPIOS" icone="houses" entra={CENA03.municipios} sai={CENA03.milhoes - 2} y={330} cor={COR.estadoClaro} corpo={89} />
    <PainelNumero numero={milhar(POPULACAO)} rotulo="HABITANTES" icone="busts_in_silhouette" entra={CENA03.milhoes} sai={CENA03.metade - 2} y={330} cor={COR.cidade} corNumero={COR.cidadeClara} corpo={83} />
    <PainelNumero numero={`${PERCENTUAL}%`} rotulo="VIVEM EM MANAUS" icone="cityscape" entra={CENA03.metade} sai={CENA03.manaus - 2} y={330} cor={COR.cidade} corNumero={COR.cidadeClara} corpo={89} />
    {/* o pino sem nome e sem ícone em cima: o cartão da foto já traz os dois (pedido do usuário) */}
    <Pino ponto={LUGAR.manaus} entra={CENA03.manaus + 4} sai={CENA04.inicio + 20} />
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={700} passoNome={0.5} sai={CENA04.inicio} cor={COR.cidade} fotos={[{ ...foto("manaus.jpg"), em: CENA03.manaus + 2, ponto: LUGAR.manaus, nome: "MANAUS", icone: "cityscape" }]} />
    <TagNoMapa texto="MAIOR CIDADE DO NORTE" entra={CENA03.maior} sai={CENA04.inicio} x={540} y={128} cor={COR.cidade} corpo={34} passo={0.5} />
  </>
);
