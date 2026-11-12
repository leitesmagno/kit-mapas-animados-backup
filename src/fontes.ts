import { continueRender, delayRender } from "remotion";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff2";
import inter800 from "@fontsource/inter/files/inter-latin-800-normal.woff2";
import montserrat600 from "@fontsource/montserrat/files/montserrat-latin-600-normal.woff2";
import montserrat700 from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff2";
import montserrat800 from "@fontsource/montserrat/files/montserrat-latin-800-normal.woff2";
import montserrat900 from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff2";
// a fonte da legenda dos vídeos novos (Poppins ExtraBold, contorno grosso: a legenda dos Reels)
import poppins800 from "@fontsource/poppins/files/poppins-latin-800-normal.woff2";
import poppins900 from "@fontsource/poppins/files/poppins-latin-900-normal.woff2";
// as fontes de impacto das thumbnails (kit/thumb)
import anton from "@fontsource/anton/files/anton-latin-400-normal.woff2";
import archivoBlack from "@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2";
import bangers from "@fontsource/bangers/files/bangers-latin-400-normal.woff2";
import bebasNeue from "@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2";
import luckiestGuy from "@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2";

// A fonte vem do pacote @fontsource (arquivos locais, empacotados no bundle): o render não
// depende de internet. O delayRender segura o primeiro quadro até ela carregar — sem isso,
// os primeiros quadros saem com a fonte do sistema.
//
// Trocar de fonte: instale outro @fontsource/*, troque os imports e os nomes abaixo, e ajuste
// FONTE no tema. A Montserrat é a fonte da marca d'água do canal (kit/MarcaDagua).
const PESOS: [string, string, string][] = [
  ["Inter", "500", inter500],
  ["Inter", "700", inter700],
  ["Inter", "800", inter800],
  ["Montserrat", "600", montserrat600],
  // 700 e 800: o estilo "Mapas Animados" (legenda, rótulos digitados)
  ["Montserrat", "700", montserrat700],
  ["Montserrat", "800", montserrat800],
  ["Montserrat", "900", montserrat900],
  ["Poppins", "800", poppins800],
  ["Poppins", "900", poppins900],
  ["Anton", "400", anton],
  ["Archivo Black", "400", archivoBlack],
  ["Bangers", "400", bangers],
  ["Bebas Neue", "400", bebasNeue],
  ["Luckiest Guy", "400", luckiestGuy],
];

// Quem MEDE texto (a thumbnail ajusta o título à largura) espera esta promessa: medir antes da
// fonte chegar dá a largura da fonte do sistema.
export const fontesCarregadas: Promise<void> =
  typeof document === "undefined"
    ? Promise.resolve()
    : (() => {
        const handle = delayRender("Carregando as fontes");
        return Promise.all(
          PESOS.map(([familia, weight, url]) =>
            new FontFace(familia, `url(${url}) format("woff2")`, { weight, style: "normal" }).load().then((face) => {
              document.fonts.add(face);
            }),
          ),
        )
          .then(() => continueRender(handle))
          .catch((err) => {
            console.error("Falha ao carregar a fonte", err);
            continueRender(handle);
          });
      })();
