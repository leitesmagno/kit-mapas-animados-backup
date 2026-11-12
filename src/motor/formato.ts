import { MARCA } from "../marca";
import { useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// O PERFIL DE FORMATO: onde as coisas ficam na tela em cada formato. As peças do kit leem
// daqui os seus PADRÕES (quem passa x/y explícito continua mandando), então a mesma peça
// serve ao Short vertical e ao documentário horizontal, sem duas implementações.
//
// O formato vem do tamanho da composição (largura ≥ altura = horizontal). Os valores do
// vertical são EXATAMENTE os padrões antigos das peças: os vídeos verticais não mudam.
//
// O lado curto é 1080 nos dois formatos, então tamanho de fonte em px vale igual. O que muda
// é a composição: no vertical o assunto fica no centro, com texto em cima e embaixo; no
// horizontal, o assunto fica nos 2/3 direitos e os painéis no terço esquerdo.
// ---------------------------------------------------------------------------

export type NomeDoFormato = "vertical" | "horizontal";

// um retângulo da tela, em px
export type AreaDaTela = { x0: number; x1: number; y0: number; y1: number };

export type Formato = {
  nome: NomeDoFormato;
  largura: number;
  altura: number;
  fps: number;
  // a legenda curta (LegendaPalavras): o centro dela e a largura máxima da linha
  legenda: { y: number; corpo: number; larguraMax: number };
  // o painel de número/cartão (PainelNumero) e o texto de impacto (TextoImpacto)
  painel: { x: number; y: number };
  impacto: { y: number; corpo: number };
  // o nome de um mar (TextoNoMar), quando não se passa o ponto geográfico
  mar: { x: number; y: number };
  // a área onde a marca d'água passeia no modo "varia"
  areaDaMarca: { esquerda: number; direita: number; topo: number; base: number };
  // onde o ASSUNTO do mapa fica ao enquadrar (kit: enquadrarNaArea): no vertical, a faixa entre o
  // título e a legenda; no horizontal, os 2/3 direitos acima da legenda (o terço esquerdo é dos painéis)
  areaDoAssunto: AreaDaTela;
  // a tela inteira acima da legenda (o gancho, o recuo para o mundo: sem painel ao lado)
  telaLivre: AreaDaTela;
  // margem segura: nada importante fora dela (player do YouTube, interface do Shorts)
  seguro: { lateral: number; topo: number; base: number };
  // a IDENTIDADE do canal na tela: o vertical leva a marca d'água de texto (MarcaDagua, no pé);
  // o horizontal leva o SELO com a logo (LogoDoCanal, no canto de baixo à direita) e nenhuma marca
  // d'água. null = sem selo. `x`/`y` = o centro, `diametro` em px.
  logo: { src: string; diametro: number; x: number; y: number; opacidade: number } | null;
};

export const FORMATOS: Record<NomeDoFormato, Formato> = {
  vertical: {
    nome: "vertical",
    largura: 1080,
    altura: 1920,
    fps: 30,
    legenda: { y: 1440, corpo: 46, larguraMax: 920 },
    painel: { x: 540, y: 380 },
    impacto: { y: 360, corpo: 100 },
    mar: { x: 540, y: 960 },
    areaDaMarca: { esquerda: 230, direita: 850, topo: 290, base: 1500 },
    areaDoAssunto: { x0: 60, x1: 1020, y0: 470, y1: 1370 },
    telaLivre: { x0: 60, x1: 1020, y0: 220, y1: 1370 },
    seguro: { lateral: 60, topo: 220, base: 420 },
    logo: null,
  },
  horizontal: {
    nome: "horizontal",
    largura: 1920,
    altura: 1080,
    fps: 30,
    // a legenda do documentário (kit/horizontal/LegendaDoc): menor e baixa, no pé da tela, numa
    // linha de até ~50 caracteres 
    legenda: { y: 990, corpo: 40, larguraMax: 1320 },
    // o terço esquerdo, um pouco acima do meio
    painel: { x: 470, y: 400 },
    impacto: { y: 300, corpo: 120 },
    mar: { x: 960, y: 540 },
    areaDaMarca: { esquerda: 360, direita: 1560, topo: 140, base: 860 },
    areaDoAssunto: { x0: 700, x1: 1824, y0: 64, y1: 860 },
    telaLivre: { x0: 96, x1: 1824, y0: 64, y1: 860 },
    seguro: { lateral: 96, topo: 64, base: 120 },
    // o canto de BAIXO à direita, pequena e transparente, como a marca d'água do YouTube; fica à
    // direita da legenda (que vai até x ≈ 1660). A logo vem do marca.json ("logoRedonda").
    logo: MARCA.logoRedonda ? { src: MARCA.logoRedonda, diametro: 84, x: 1812, y: 978, opacidade: 0.5 } : null,
  },
};

export const formatoDe = (largura: number, altura: number): Formato => (largura >= altura ? FORMATOS.horizontal : FORMATOS.vertical);

// dentro de uma composição: o formato dela
export const useFormato = (): Formato => {
  const { width, height } = useVideoConfig();
  return formatoDe(width, height);
};
