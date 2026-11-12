// A paleta do vídeo: mapa escuro, água um tom mais fria que a terra, UM destaque quente
// (o Maranhão, a cidade, as rotas) e um azul-claro reservado aos rios.
export const COR = {
  oceano: "#050A10",
  oceanoLuz: "#0B1824",
  terra: "#1A2129",
  terraBrasil: "#212B35",
  // Sobre satélite, linha clara e fina (escura some na floresta).
  divisa: "rgba(255, 255, 255, 0.30)",
  divisaPais: "rgba(255, 255, 255, 0.55)",
  grade: "rgba(150, 180, 205, 0.055)",
  tinta: "#EEF1F4",
  tintaSuave: "rgba(238, 241, 244, 0.62)",
  tintaFraca: "rgba(238, 241, 244, 0.32)",
  destaque: "#F2B45A",
  destaqueFundo: "#3A2A14",
  rio: "#6FD3FF",
} as const;

export const FONTE = "Inter, system-ui, sans-serif";
