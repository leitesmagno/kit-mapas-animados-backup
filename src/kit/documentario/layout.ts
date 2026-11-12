// ---------------------------------------------------------------------------
// O LAYOUT da identidade horizontal, num lugar só: o estilo e a posição de cada rótulo (as camadas
// desenham com isto) e a CAIXA que cada texto ocupa na tela (o motor usa para tirar os ícones de
// cima das letras). Se mudar um tamanho aqui, a conta de colisão muda junto.
// ---------------------------------------------------------------------------

import type { EstiloDeRotulo } from "../horizontal/RotuloMapa";

export type Caixa = { x0: number; y0: number; x1: number; y1: number };
export const cruzam = (a: Caixa, b: Caixa, folga = 14) => a.x0 - folga < b.x1 && a.x1 + folga > b.x0 && a.y0 - folga < b.y1 && a.y1 + folga > b.y0;

export const TIPO_DO_ROTULO: Record<EstiloDeRotulo, { tamanho: number; espaco: number }> = {
  pais: { tamanho: 54, espaco: 0.3 },
  paisPequeno: { tamanho: 26, espaco: 0.3 },
  lugar: { tamanho: 34, espaco: 0.24 },
  cidade: { tamanho: 28, espaco: 0.08 },
  regiao: { tamanho: 24, espaco: 0.5 },
  agua: { tamanho: 24, espaco: 0.32 },
  aguaTitulo: { tamanho: 44, espaco: 0.22 },
};

type Nome = { texto: string; corpo?: number; ancora?: "centro" | "base" | "esquerda" | "direita"; seta?: boolean; dx?: number; dy?: number; estilo?: EstiloDeRotulo };

// o estilo pelo tamanho pedido: nome grande = país; com seta/âncora lateral = lugar pequeno marcado
export const estiloDoNome = (b: Nome): EstiloDeRotulo => {
  if (b.estilo) return b.estilo;
  const c = b.corpo ?? 44;
  if (c >= 48) return "pais";
  if (b.seta || b.ancora === "esquerda" || b.ancora === "direita") return c >= 34 ? "lugar" : "cidade";
  return c >= 36 ? "lugar" : "paisPequeno";
};

export const tamanhoDoTexto = (linhas: string[], estilo: EstiloDeRotulo) => {
  const t = TIPO_DO_ROTULO[estilo];
  const maior = Math.max(...linhas.map((l) => l.length));
  return { w: maior * t.tamanho * (0.66 + t.espaco), h: linhas.length * t.tamanho * 1.15 };
};

// onde o nome fica em relação ao ponto (px) e se leva o ponto dourado
export const posicaoDoNome = (b: Nome) => {
  const estilo = estiloDoNome(b);
  const { w, h } = tamanhoDoTexto([b.texto], estilo);
  let dx = b.dx ?? 0;
  let dy = b.dy ?? 0;
  let marcador = false;
  if (b.ancora === "base" || b.seta) {
    dy += -h / 2 - 14;
    marcador = true;
  } else if (b.ancora === "esquerda") {
    dx += w / 2 + 18;
    marcador = true;
  } else if (b.ancora === "direita") {
    dx -= w / 2 + 18;
    marcador = true;
  }
  return { estilo, dx, dy, marcador, w, h };
};

// as áreas fixas da tela (1920×1080) que os ícones têm que respeitar
export const AREA = {
  destaque: { x0: 100, y0: 210, x1: 1180, y1: 660 } as Caixa, // número/data no terço esquerdo
  data: { x0: 100, y0: 150, x1: 1180, y1: 480 } as Caixa,
  titulo: { x0: 330, y0: 70, x1: 1590, y1: 260 } as Caixa, // o letreiro no alto (impacto)
  cartela: { x0: 260, y0: 300, x1: 1660, y1: 680 } as Caixa, // a cartela de título/capítulo, no centro
  legenda: { x0: 280, y0: 940, x1: 1640, y1: 1040 } as Caixa,
  logo: { x0: 1750, y0: 920, x1: 1870, y1: 1040 } as Caixa,
  segura: { x0: 96, y0: 64, x1: 1824, y1: 920 } as Caixa, // onde um ícone pode ficar
};
