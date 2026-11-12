import { FotoNoMapaAnimada, NomeNoRio, TagNoMapa, TextoDigitado } from "../../../kit";
import { LUGAR, MEIO_DO_NEGRO, MEIO_DO_SOLIMOES } from "../dados";
import { COR } from "../estilo";
import { CENA09, CENA10 } from "../roteiro";
import { foto } from "./comum";

// CENA 09 — O ENCONTRO DAS ÁGUAS. "Em frente, o Negro, escuro, encontra o Solimões, barrento, e eles correm
// quilômetros sem se misturar. Juntos, viram o Rio Amazonas."
// "Em frente…": o cartão sai e a câmera voa até o Encontro, BEM perto (o satélite mostra as duas cores) →
// "…o Negro, escuro…": o nome se escreve AO LONGO da água preta → "…o Solimões, barrento…": ao longo da barrenta, na curva →
// "…e eles correm…": a câmera desce para a faixa de baixo e a foto do alto entra no cartão → "…sem se
// misturar": a tag →
// "Juntos, viram o Rio Amazonas": o cartão sai, a câmera recua e o Amazonas acende de Manaus para o leste
// (Estado.tsx), com o nome.

// os nomes dos rios ESCRITOS NO RIO, seguindo a curva da água, no estilo do "Oceano Atlântico" do Piauí
// (kit NomeNoRio, dentro do MapaSvg): o tamanho é do mapa (em metros), então no zoom o nome continua dentro
// do rio (pedido do usuário: "acompanhar o rio… mesmo que ela faz curva")
export const Scene09Mapa: React.FC = () => (
  <>
    <NomeNoRio texto="RIO NEGRO" percurso={MEIO_DO_NEGRO} entra={CENA09.negro} sai={CENA09.recuo[0]} corpoMetros={620} />
    <NomeNoRio texto="RIO SOLIMÕES" percurso={MEIO_DO_SOLIMOES} entra={CENA09.solimoes} sai={CENA09.recuo[0]} corpoMetros={620} />
  </>
);

export const Scene09Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada x={40} largura={1000} alturaMaxima={800} passoNome={0.5} sai={CENA09.recuo[0]} cor={COR.rio} fotos={[{ ...foto("encontro-das-aguas.jpg"), em: CENA09.foto, ponto: LUGAR.encontro, nome: "ENCONTRO DAS ÁGUAS", icone: "water_wave" }]} />
    <TagNoMapa texto="SEM SE MISTURAR" entra={CENA09.misturar} sai={CENA09.recuo[0]} x={540} y={128} cor={COR.rio} corpo={38} passo={0.5} />
    <TextoDigitado texto="RIO AMAZONAS" entra={CENA09.rioAmazonas} sai={CENA10.recuo[0] + 6} ponto={[-56.4, -2.25]} corpo={48} peso={900} brilho={COR.rio} passo={1} />
  </>
);
