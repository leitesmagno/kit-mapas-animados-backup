import marca from "../marca.json";

// ---------------------------------------------------------------------------
// A MARCA de quem usa o kit: nome do canal, marca d'água, logo, cores e voz. Tudo vem do
// marca.json da raiz, que a skill `mapas-animados` preenche na primeira conversa (perguntando).
// Nada de marca no código: as peças do kit (MarcaDagua, LogoDoCanal, a logo da thumbnail, a
// legenda) leem daqui.
//
//   marcaDagua.usar: "texto" ("MEU CANAL | @meucanal", o "|" separa o nome do @), "imagem"
//                    (uma logo em public/, ex.: "marca/logo.png") ou "nenhuma"
//   logoRedonda:     a logo redonda com fundo transparente (public/…) — o selo do horizontal e
//                    das thumbnails; vazio = sem selo
// ---------------------------------------------------------------------------

export type Marca = {
  configurado: boolean;
  canal: string;
  arroba: string;
  marcaDagua: { usar: "texto" | "imagem" | "nenhuma" | string; texto: string; imagem: string; larguraDaImagem: number; opacidade: number };
  logoRedonda: string;
  cores: { palavraFalada: string; destaque: string };
  legenda: { fonte: string; peso: number; corpo: number; y: number };
  voz: { tipo: "gravada" | "elevenlabs" | string; elevenlabsVozId: string; elevenlabsVozNome: string };
  trilha: boolean;
  formatoPadrao: string;
};

export const MARCA: Marca = marca;

// o texto da marca d'água: o que a pessoa escreveu, ou "CANAL | @arroba" montado dos campos
export const textoDaMarca = (): string => {
  const m = MARCA.marcaDagua;
  if (m.texto.trim()) return m.texto.trim();
  if (MARCA.canal && MARCA.arroba) return `${MARCA.canal} | ${MARCA.arroba.startsWith("@") ? MARCA.arroba : `@${MARCA.arroba}`}`;
  return MARCA.canal;
};

// a fonte da legenda, com as reservas (todas carregadas em src/fontes.ts)
export const fonteDaLegenda = (): string => `${MARCA.legenda.fonte || "Poppins"}, Montserrat, sans-serif`;
