import { getStaticFiles } from "remotion";

// ---------------------------------------------------------------------------
// IMAGENS TROCÁVEIS: as imagens de um vídeo num catálogo só (chave → arquivo padrão), e uma
// pasta de SUBSTITUIÇÕES que ganha de tudo. O autor troca uma imagem pondo um arquivo com o
// nome da chave na pasta (substituicoes/salinas.jpg) — sem mexer em código nem na cena.
// Sobrescrever o arquivo padrão com o mesmo nome também funciona (o caminho não muda).
//
//   const IMAGENS = catalogoDeImagens("assets/rio-grande-do-norte", {
//     salinas: { src: "salinas/imagem-01.jpg", foco: "50% 60%" },
//   });
//   <Img src={staticFile(IMAGENS.salinas.src)} />
//
// A lista de arquivos de public/ vem do getStaticFiles() (lida quando o Studio carrega e no
// render): no Studio, recarregue a página depois de pôr a imagem.
// ---------------------------------------------------------------------------

export const EXTENSOES_DE_IMAGEM = ["jpg", "jpeg", "png", "webp"] as const;

export type ImagemDoCatalogo = {
  src: string; // relativo à pasta do vídeo em public/ (o padrão)
  foco?: string; // object-position: o que tem que ficar no quadro vertical
  credito?: string; // autor e licença (vai para o CREDITOS*.md, nunca para a tela)
};

export type ImagemResolvida = ImagemDoCatalogo & { trocada: boolean; existe: boolean };

const arquivos = (): Set<string> => {
  try {
    return new Set(getStaticFiles().map((f) => f.name));
  } catch {
    return new Set();
  }
};

export const catalogoDeImagens = <K extends string>(pasta: string, padroes: Record<K, ImagemDoCatalogo>, subpasta = "substituicoes"): Record<K, ImagemResolvida> => {
  const existentes = arquivos();
  const saida = {} as Record<K, ImagemResolvida>;
  for (const chave of Object.keys(padroes) as K[]) {
    const padrao = padroes[chave];
    const troca = EXTENSOES_DE_IMAGEM.map((e) => `${pasta}/${subpasta}/${chave}.${e}`).find((n) => existentes.has(n));
    const src = troca ?? `${pasta}/${padrao.src}`;
    saida[chave] = { ...padrao, src, trocada: !!troca, existe: existentes.has(src) };
  }
  return saida;
};
