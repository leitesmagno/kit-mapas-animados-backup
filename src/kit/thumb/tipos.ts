import type { NomeDaBandeira, NomeDoIcone } from "../assets";

// ---------------------------------------------------------------------------
// A RECEITA DE UMA THUMBNAIL (o JSON que a composição Thumb desenha). Skill: thumbnail-chamativa.
//
// Coordenadas em FRAÇÃO do quadro: x de 0 (esquerda) a 1 (direita), y de 0 (topo) a 1 (pé).
// Tamanhos em fração da ALTURA (o mesmo número serve no 16:9 e no 9:16).
// As camadas são desenhadas na ordem da lista: a primeira fica atrás.
// Caminhos de imagem (`src`) são relativos a public/.
// ---------------------------------------------------------------------------

export type Ponto = [number, number];

export type FonteDeImpacto =
  | "Anton" // condensada e altíssima: a manchete padrão
  | "Bebas Neue" // condensada mais fina, elegante
  | "Archivo Black" // larga e pesada: palavra curta que precisa de massa
  | "Montserrat" // 900, geométrica (a fonte da marca)
  | "Bangers" // quadrinho, inclinada: humor, susto
  | "Luckiest Guy"; // arredondada de desenho: leve, curioso

export type Fundo = {
  src?: string; // imagem (relativa a public/); sem src, vale `cor`/`gradiente`
  cor?: string;
  gradiente?: string; // CSS, ex.: "radial-gradient(circle at 60% 40%, #ffb347, #3a0d00)"
  zoom?: number; // 1 = cobrindo o quadro
  foco?: Ponto; // o ponto da imagem (0–1) que fica no centro do zoom
  espelhar?: boolean;
  desfoque?: number; // fração da altura (0.004 = leve)
  brilho?: number; // 1 = original
  contraste?: number;
  saturacao?: number;
};

// o fundo dividido em dois (comparação, antes × depois, A × B)
export type Divisao = { inclinacao?: number; cor?: string; largura?: number };

export type Acabamento = {
  vinheta?: number; // 0–1, escurece as bordas (padrão 0.45)
  tom?: string; // cor sobreposta em soft-light (unifica fundo e recortes)
  intensidadeDoTom?: number; // 0–1
  moldura?: { cor?: string; largura?: number }; // borda colorida da série/nicho (largura em fração da altura)
};

export type Contorno = { cor?: string; largura?: number }; // largura em fração da altura

export type LinhaDeTexto =
  | string
  | {
      texto: string;
      cor?: string;
      gradiente?: [string, string]; // de cima para baixo
      caixa?: string; // cor de um marcador ATRÁS da linha (texto sem contorno, em `corNaCaixa`)
      corNaCaixa?: string;
      escala?: number; // a linha maior ou menor que o `tamanho` da camada
      rot?: number; // graus, só esta linha
    };

export type CamadaTexto = {
  tipo: "texto";
  linhas: LinhaDeTexto[];
  x: number;
  y: number;
  ancora?: "centro" | "esquerda" | "direita"; // o x é o centro, a borda esquerda ou a direita do bloco
  fonte?: FonteDeImpacto;
  tamanho?: number; // corpo da fonte em fração da altura (padrão 0.16)
  largura?: number; // largura máxima do bloco em fração da LARGURA: a linha encolhe para caber
  cor?: string;
  contorno?: Contorno | false; // padrão: preto grosso
  extrusao?: { cor?: string; profundidade?: number; angulo?: number } | false; // bloco 3D atrás das letras
  brilho?: string; // halo colorido em volta
  rot?: number;
  entrelinha?: number; // padrão 0.92
  espacamento?: number; // letter-spacing em em
};

export type CamadaRecorte = {
  tipo: "recorte";
  src?: string; // PNG transparente (recortes/ do conjunto capa, ou qualquer PNG em public/)
  icone?: NomeDoIcone; // atalho para public/assets/icones-3d/<nome>.png
  bandeira?: NomeDaBandeira; // atalho para public/assets/bandeiras/<nome>.png
  x: number;
  y: number;
  altura: number; // fração da altura do quadro
  ancora?: "centro" | "base"; // base = o y é o pé do objeto
  rot?: number;
  espelhar?: boolean;
  contorno?: Contorno | false; // padrão: branco (efeito adesivo)
  brilho?: string; // halo colorido atrás (separa do fundo)
  sombra?: boolean; // sombra projetada (padrão true)
  brilhoDaImagem?: number;
  saturacao?: number;
};

export type CamadaSeta = {
  tipo: "seta";
  de: Ponto;
  para: Ponto; // a ponta
  curva?: number; // -1 a 1: quanto entorta (sinal = para que lado)
  cor?: string;
  largura?: number; // fração da altura (padrão 0.022)
  contorno?: string | false; // cor do contorno (padrão branco)
};

export type CamadaCirculo = {
  tipo: "circulo"; // o círculo "feito à mão" em volta do detalhe
  x: number;
  y: number;
  rx: number; // raios em fração da altura
  ry: number;
  cor?: string;
  largura?: number;
  rot?: number;
};

export type CamadaSelo = {
  tipo: "selo";
  texto: string;
  x: number;
  y: number;
  tamanho?: number; // corpo da fonte em fração da altura (padrão 0.07)
  forma?: "pilula" | "retangulo" | "estrela" | "circulo";
  cor?: string; // fundo
  corTexto?: string;
  fonte?: FonteDeImpacto;
  rot?: number;
};

export type CamadaBrilho = { tipo: "brilho"; x: number; y: number; raio: number; cor?: string; intensidade?: number };

export type CamadaRaios = { tipo: "raios"; x: number; y: number; cor?: string; quantidade?: number; opacidade?: number; raio?: number };

export type CamadaLogo = { tipo: "logo"; src?: string; x: number; y: number; altura?: number };

export type Camada = CamadaTexto | CamadaRecorte | CamadaSeta | CamadaCirculo | CamadaSelo | CamadaBrilho | CamadaRaios | CamadaLogo;

export type ReceitaDeThumb = {
  nome?: string; // só para o arquivo de saída
  formato?: "youtube" | "shorts"; // 1280×720 ou 1080×1920 (o script escolhe a composição)
  fundo: Fundo | [Fundo, Fundo];
  divisao?: Divisao;
  acabamento?: Acabamento;
  camadas: Camada[];
  guias?: boolean; // mostra as áreas que o YouTube cobre (duração, botões do Shorts): só para conferir
};
