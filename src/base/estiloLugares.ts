// A paleta é a do vídeo "São Luís" (mapa escuro, UM destaque quente, azul só nos rios):
// este vídeo continua aquela linguagem. Aqui entra só o que é próprio do Piauí — a pedra
// da Serra da Capivara, que toma o lugar do dourado quando a viagem chega ao sul.
import { COR as COR_BASE, FONTE } from "./estilo";

export const COR = {
  ...COR_BASE,
  // o arenito da Serra da Capivara (terracota) e a tinta das pinturas (ocre-vermelho)
  pedra: "#E58A4E",
  pedraClara: "#F6C49A",
  // o litoral e o mar do delta
  mar: "#7FE0E6",
} as const;

export { FONTE };
