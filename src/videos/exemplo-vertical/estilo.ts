// As cores do estilo "Mapas Animados" (.claude/skills/mapas-animados/references/visual.md
// §2): satélite claro e vivo, regiões chapadas translúcidas com contorno branco, UMA cor por
// papel, que não muda até o fim do vídeo. Os mesmos papéis de "Sergipe", "Bahia", "Pará" e "Goiás".
export const COR = {
  // o Amazonas (o estado em foco): verde vivo (a floresta)
  estado: "#1E8E3E",
  estadoClaro: "#9BF0B0",
  // os cinco vizinhos: âmbar
  vizinho: "#F0A12A",
  vizinhoClaro: "#FFD58A",
  // os três países da fronteira: roxo
  pais: "#7B3FD6",
  paisClaro: "#D7BFFF",
  // os rios e as águas: azul-claro
  rio: "#3FC8FF",
  agua: "#3FC8FF",
  // a floresta, as cachoeiras e os parques: verde vivo
  floresta: "#1E8E3E",
  florestaClara: "#9BF0B0",
  // a história (a borracha, as sementes): vermelho-tijolo, com o satélite em cinza
  historia: "#B3261E",
  historiaClara: "#FF8A80",
  // as cidades (Manaus, as sedes): amarelo-oliva
  cidade: "#C9CC1E",
  cidadeClara: "#F2F48A",
  // a Região Norte (contexto): branco translúcido
  regiao: "#FFFFFF",
  // os povos indígenas (o Vale do Javari): laranja-urucum
  povos: "#E0662B",
  povosClaro: "#FFB38A",
  // o "não" (nenhuma ponte): vermelho
  alerta: "#E53935",
  // HUD e medidas: ciano
  hud: "#3FF0E0",
  branco: "#FFFFFF",
} as const;

export const FONTE = "Montserrat, Inter, system-ui, sans-serif";
