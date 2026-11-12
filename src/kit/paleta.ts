// ---------------------------------------------------------------------------
// As paletas dos estilos de referência (ver ESTILO.md). Cada uma é UM destaque forte
// sobre satélite escurecido — nunca misture duas paletas no mesmo vídeo.
//
//   preenchimento: a cor chapada da região em destaque
//   realce:        a sub-região dentro dela (cidade dentro do estado), mais clara
//   borda:         o contorno fino
//   valor:         o número do rótulo
//   brilho:        o halo (neon) e o fio dos cartões
// ---------------------------------------------------------------------------

export type Paleta = {
  preenchimento: string;
  realce: string;
  borda: string;
  valor: string;
  brilho: string;
  tinta: string;
};

export const PALETAS = {
  // "estilo Ranking": estado roxo chapado, cidade rosa-lilás, contorno branco, valor amarelo.
  roxo: { preenchimento: "#8A2BE2", realce: "#D65CFF", borda: "#FFFFFF", valor: "#FFD23F", brilho: "#C77DFF", tinta: "#FFFFFF" },
  // "Mapas Animados": verde neon translúcido com halo, país-contexto em roxo.
  neon: { preenchimento: "#1FAA3A", realce: "#5CFF7A", borda: "#7CFF8F", valor: "#FFFFFF", brilho: "#3DFF6A", tinta: "#FFFFFF" },
  // "estilo Didático": azul vivo, contorno branco, brilho ciano.
  azul: { preenchimento: "#2B8CFF", realce: "#6FC3FF", borda: "#FFFFFF", valor: "#FFFFFF", brilho: "#35E0FF", tinta: "#FFFFFF" },
  // documentário minimalista (o "bico do Mato Grosso"): verde-água translúcido.
  agua: { preenchimento: "#2EE6A6", realce: "#7CFFD4", borda: "#BFFFEA", valor: "#FFFFFF", brilho: "#2EE6A6", tinta: "#FFFFFF" },
  // o dourado dos vídeos São Luís / Piauí (a identidade atual do projeto).
  dourado: { preenchimento: "#F2B45A", realce: "#FFD99A", borda: "#FFF3DC", valor: "#F2B45A", brilho: "#F2B45A", tinta: "#EEF1F4" },
  // PL 2026 (vídeo do plano de Flávio Bolsonaro): azul e amarelo medidos na capa do plano
  // registrado no TSE (azul #035498, azul-escuro #00356E, amarelo #FECA07). Cartão: #00356E.
  pl: { preenchimento: "#035498", realce: "#3A86D6", borda: "#FFFFFF", valor: "#FECA07", brilho: "#FECA07", tinta: "#FFFFFF" },
  // PT 2026 (vídeo do plano de Lula): o vermelho medido na capa do plano no TSE (#EC242B),
  // só vermelho e branco — o azul/amarelo/verde da campanha ficam de fora. Cartão: #8E0F14.
  pt: { preenchimento: "#EC242B", realce: "#FF6B6F", borda: "#FFFFFF", valor: "#FFFFFF", brilho: "#FF3B41", tinta: "#FFFFFF" },
} satisfies Record<string, Paleta>;

export type NomeDaPaleta = keyof typeof PALETAS;

// Cores temáticas (mapa de clima/bioma, estilo estilo Didático "clima do Brasil").
export const TEMATICAS = {
  equatorial: "#2BD44A",
  semiarido: "#D9A21B",
  quente: "#F24A1D",
  subtropical: "#3FD0D8",
  tropical: "#8BD13A",
  frio: "#7FB8FF",
  neutro: "#D8D2C4",
  contexto: "#7B2FBE", // o país/estado "de contexto" em roxo antes do zoom (Mapas Animados)
} as const;
