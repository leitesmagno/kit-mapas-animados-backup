import { EtiquetaDeLugar, IconeDestaque, ImagemDeDrone, type NomeDoIcone, TagNoMapa, TextoDigitado, TextoImpacto } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA01, CENA02 } from "../roteiro";
import { cantoDoCartao, IconeNoCartao, PROPORCAO, ZOOM_DO_CARTAO } from "./comum";

// CENA 01 — GANCHO. "O maior rio do mundo atravessa o Amazonas inteiro. E não existe uma única ponte sobre
// ele. E o maior estado do Brasil ainda guarda um teatro de ópera no meio da selva, praias de rio e
// cachoeiras escondidas na mata."
// O Brasil inteiro, satélite claro, a câmera já andando → "O maior rio…": o Rio Amazonas se desenha do
// Peru até a foz enquanto a câmera mergulha (Estado.tsx) e "RIO AMAZONAS" digita em cima → "…o Amazonas
// inteiro": o estado acende em verde em volta do rio e o contorno pulsa → "…uma única ponte": o texto de
// impacto "NENHUMA PONTE" despenca, o "proibido" pousa à esquerda dele e o rio pulsa → "E o maior estado do Brasil…": a bandeira abre
// dentro do estado e "AMAZONAS" digita no alto, com a tag "MAIOR ESTADO DO BRASIL" → "…um teatro…": as imagens reais em cortes secos no
// cartão com o fundo desfocado, cada uma com a etiqueta e o ícone → de volta ao mapa antes de "Fica no Norte".

export const Scene01Textos: React.FC = () => (
  <>
    <TextoDigitado texto="RIO AMAZONAS" entra={CENA01.nomeRio} sai={CENA01.estado} ponto={LUGAR.nomeRio} corpo={46} peso={900} brilho={COR.rio} passo={1} />
    {/* "…uma única ponte": o texto de impacto despenca da câmera e o "proibido" 3D pousa colado à ESQUERDA do
        "NENHUMA" (pedido do usuário: em cima do rio, não). Os espaços no começo das duas linhas empurram o
        bloco ~70 px para a direita, para o ícone caber na tela */}
    <TextoImpacto linhas={["     NENHUMA", "     PONTE"]} entra={CENA01.ponte} sai={CENA01.estado} y={330} corpo={110} />
    <IconeDestaque parado nome="prohibited" entra={CENA01.ponte + 5} sai={CENA01.estado} x={185} y={272} tamanho={120} cor={COR.alerta} centrado />
    <TextoDigitado texto="AMAZONAS" entra={CENA01.estado + 8} sai={CENA02.regiao[0]} x={540} y={240} corpo={112} peso={900} brilho={COR.estado} passo={1} />
    <TagNoMapa texto="MAIOR ESTADO DO BRASIL" entra={CENA01.estado + 16} sai={CENA01.teatro} x={540} y={380} cor={COR.estado} corpo={32} passo={0.5} />
  </>
);

// as imagens reais em cortes secos no CARTÃO com o fundo desfocado (kit ImagemDeDrone, modo "cartao"), como no
// gancho do "Goiás", cada uma com a etiqueta do lugar e o ícone no canto do cartão (pedido do usuário: só
// aqui no gancho; o cartão por cima do mapa ficava em cima do Amazonas, "meio feio")
const Foto: React.FC<{ arquivo: string; proporcao: number; nome: string; icone: NomeDoIcone; cor: string; entra: number; sai: number; primeira?: boolean; ultima?: boolean; lado: number }> = ({ arquivo, proporcao, nome, icone, cor, entra, sai, primeira, ultima, lado }) => (
  <>
    <ImagemDeDrone src={`assets/exemplo-vertical/${arquivo}`} modo="cartao" proporcao={proporcao} entra={entra} sai={sai} corteNaEntrada={!primeira} corteNaSaida={!ultima} zoom={ZOOM_DO_CARTAO} deslize={[8 * lado, 0]} />
    <EtiquetaDeLugar nome={nome} entra={entra + (primeira ? 5 : 2)} sai={ultima ? sai : sai - 2} {...cantoDoCartao(proporcao)} passo={0.5} cor={cor} />
    <IconeNoCartao nome={icone} proporcao={proporcao} entra={entra + (primeira ? 7 : 3)} sai={ultima ? sai : sai - 1} cor={cor} />
  </>
);

export const Scene01Fotos: React.FC = () => (
  <>
    <Foto arquivo="teatro-amazonas.jpg" proporcao={PROPORCAO.teatro} nome="TEATRO AMAZONAS" icone="classical_building" cor={COR.cidade} entra={CENA01.teatro} sai={CENA01.praias} primeira lado={-1} />
    <Foto arquivo="ponta-negra.jpg" proporcao={PROPORCAO.pontaNegra} nome="PRAIA DA PONTA NEGRA" icone="beach_with_umbrella" cor={COR.cidade} entra={CENA01.praias} sai={CENA01.cachoeiras} lado={1} />
    <Foto arquivo="cachoeira-iracema.jpg" proporcao={PROPORCAO.iracema} nome="CACHOEIRA DE IRACEMA" icone="water_wave" cor={COR.cidade} entra={CENA01.cachoeiras} sai={CENA01.fotoSai} ultima lado={-1} />
  </>
);
