import { FotoNoMapaAnimada, TagNoMapa } from "../../../kit";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA13, CENA14 } from "../roteiro";
import { foto, MarcoDoLugar } from "./comum";

// CENA 13 — PRESIDENTE FIGUEIREDO. "Presidente Figueiredo tem mais de cem cachoeiras e grutas no meio da
// mata."
// O voo até lá (o mapa embaixo); o município, o pino e a Cachoeira do Santuário no cartão → "…mais de cem
// cachoeiras": a tag → "…e grutas": a Caverna do Maroaga (um pino por vez).

export const Scene13Textos: React.FC = () => (
  <>
    <FotoNoMapaAnimada
      x={40}
      largura={1000}
      alturaMaxima={800}
      passoNome={0.5}
      sai={CENA14.voo[0] + 10}
      cor={COR.floresta}
      fotos={[
        { ...foto("cachoeira-santuario.jpg"), em: CENA13.figueiredo, ponto: LUGAR.santuario, nome: "CACHOEIRA DO SANTUÁRIO", icone: "water_wave" },
        { ...foto("maroaga.jpg"), em: CENA13.grutas, ponto: LUGAR.maroaga, nome: "CAVERNA DO MAROAGA", icone: "rock" },
      ]}
    />
    <MarcoDoLugar ponto={LUGAR.santuario} entra={CENA13.figueiredo} sai={CENA13.grutas - 6} />
    <MarcoDoLugar ponto={LUGAR.maroaga} entra={CENA13.grutas} sai={CENA14.voo[0] + 10} />
    <TagNoMapa texto="MAIS DE 100 CACHOEIRAS" entra={CENA13.cem} sai={CENA14.voo[0]} x={540} y={128} cor={COR.floresta} corpo={36} passo={0.5} />
  </>
);
