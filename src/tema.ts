// ---------------------------------------------------------------------------
// O TEMA: cor, tipografia e formato. É o único arquivo que se troca para o vídeo mudar de
// cara — e é de propósito que ele seja neutro aqui. Cada cliente (ou cada série) copia
// este arquivo, troca as cores e a fonte, e o resto do motor não muda.
//
// A regra que vale para qualquer tema: UMA cor de destaque, usada com parcimônia. Sobre
// satélite, a imagem já é colorida; se o destaque também for, nada se destaca.
// ---------------------------------------------------------------------------

export const CORES = {
  // O fundo e a tinta: escuro editorial, quase preto, com um creme que não é branco puro
  // (branco puro sobre satélite "queima" e cansa em tela de celular).
  fundo: "#0B0D10",
  tinta: "#F2F4F7",
  // O destaque. Trocar esta linha já muda o vídeo inteiro.
  destaque: "#3DDC97",
  destaque2: "#2FB87E",
  // Derivados: transparências da tinta e painéis. Não invente cor nova fora daqui.
  tintaSuave: "rgba(242, 244, 247, 0.62)",
  tintaFraca: "rgba(242, 244, 247, 0.14)",
  tintaFantasma: "rgba(242, 244, 247, 0.06)",
  painel: "#12151A",
  bruma: "#0E1620",
} as const;

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;

// A área que TikTok, Reels e Shorts não cobrem com a interface deles. Nada importante sai
// deste retângulo. Em 16:9, troque por { top: 90, bottom: 990, left: 120, right: 1800 }.
export const SEGURO = { top: 230, bottom: 1600, left: 80, right: 1000 } as const;

// A faixa do mapa: o mapa divide a tela com o título (em cima) e o apoio (embaixo).
// Reserve a mesma faixa em todas as cenas e o vídeo parece um relatório só.
export const FAIXA_DO_MAPA = { topo: 500, base: 1270 } as const;

export const FONTE = "Inter, system-ui, sans-serif";

export const TIPO = {
  display: { fontFamily: FONTE, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.0 },
  corpo: { fontFamily: FONTE, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.25 },
  rotulo: { fontFamily: FONTE, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const },
};

// Os nomes em inglês que os componentes copiados usam. Mantidos como apelido para não
// espalhar tradução por dentro das peças; o que se edita é o bloco de cima.
export const COLORS = {
  black: CORES.fundo,
  cream: CORES.tinta,
  orange: CORES.destaque,
  orange2: CORES.destaque2,
  creamSoft: CORES.tintaSuave,
  creamFaint: CORES.tintaFraca,
  creamGhost: CORES.tintaFantasma,
  panel: CORES.painel,
  warmHaze: CORES.bruma,
} as const;
export const WIDTH = LARGURA;
export const HEIGHT = ALTURA;
export const SAFE = SEGURO;
export const FONT = FONTE;
export const TYPE = { display: TIPO.display, body: TIPO.corpo, label: TIPO.rotulo };
