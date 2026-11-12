import { FORMATOS } from "./formato";

// ---------------------------------------------------------------------------
// O DOCUMENTÁRIO HORIZONTAL (16:9, YouTube): a camada DECLARATIVA por cima do motor de sempre.
// Cada cena diz a que capítulo pertence, que falas da narração cobre (os ids do projeto.ts),
// quando começa e termina (em QUADROS, vindos do Whisper — nunca de estimativa pelo texto),
// que recursos visuais usa, como entra e sai, e em que fontes se apoia.
//
// O desenho de cada cena continua sendo o do motor (MapCamera, kit, ImagemDeDrone, ImagemIA):
// isto aqui não desenha nada. Serve para (1) validar o tempo contra o áudio real, (2) gerar
// capítulos, legenda e descrição para a publicação (scripts/documentario/publicacao.ts) e (3)
// a revisão editorial (o que é fato, interpretação ou hipótese, e de onde veio).
//
// A ordem dos recursos (references/horizontal-longo.md §4 da skill mapas-animados):
// mapa → foto real → imagem de IA (só ilustração) → gráfico → tipografia.
// ---------------------------------------------------------------------------

export const LARGURA_DOC = FORMATOS.horizontal.largura;
export const ALTURA_DOC = FORMATOS.horizontal.altura;

export type Fonte = {
  id: string;
  titulo: string;
  editor: string; // EIA, IBGE, Natural Earth…
  url: string;
  publicadoEm?: string; // AAAA-MM-DD
  consultadoEm: string; // AAAA-MM-DD (para assunto atual, a data da pesquisa importa)
};

// O que a narração afirma, separado por natureza. "fato" exige fonte.
export type Afirmacao = {
  texto: string;
  tipo: "fato" | "interpretacao" | "hipotese";
  fontes?: string[]; // ids de Fonte
  nota?: string; // divergência entre fontes, arredondamento, ressalva
};

export type RecursoVisual =
  | { tipo: "mapa"; descricao: string } // o motor de mapas (dados verificados)
  | { tipo: "imagem-ia"; imagem: string } // id em imagens/pedidos.json (sempre ilustrativa)
  | { tipo: "foto"; arquivo: string; credito: string } // licenciada; crédito no CREDITOS*.md
  | { tipo: "grafico"; descricao: string }
  | { tipo: "linha-do-tempo"; descricao: string }
  | { tipo: "texto"; texto: string };

export type Transicao = "corte" | "chicote" | "mergulho" | "recuo" | "voo" | "fade";

export type CenaDoDocumentario = {
  id: string; // o mesmo "cena" dos pedidos de imagem
  capitulo: string; // id do Capitulo
  falas: string[]; // ids das falas do projeto.ts que a cena cobre
  inicio: number; // quadro
  fim: number; // quadro (exclusivo)
  recursos: RecursoVisual[]; // um ou vários (combinação)
  entrada?: Transicao;
  saida?: Transicao;
  afirmacoes?: Afirmacao[];
};

export type Capitulo = { id: string; titulo: string };

// O que vai para o YouTube (scripts/documentario/publicacao.ts monta a descrição com isto, os
// capítulos no tempo real, as fontes e o aviso das imagens sintéticas). Nada de fato novo aqui:
// todo número já está numa afirmação com fonte.
export type Publicacao = {
  titulos: string[]; // o principal primeiro, depois as alternativas
  resumo: string;
  tags: string[];
  textoDaCapa: string[]; // as linhas do título da thumbnail
};

export type Documentario = {
  titulo: string;
  publicacao?: Publicacao;
  fps: number;
  duracao: number; // quadros
  capitulos: Capitulo[];
  cenas: CenaDoDocumentario[];
  fontes: Fonte[];
};

// os ids de imagem de IA que as cenas usam (para conferir contra o manifesto)
export const imagensDasCenas = (cenas: CenaDoDocumentario[]) =>
  cenas.flatMap((c) => c.recursos.flatMap((r) => (r.tipo === "imagem-ia" ? [{ cena: c.id, imagem: r.imagem }] : [])));

export type FalaNoTempo = { id: string; inicio: number; fim: number }; // segundos (transcript.json)

// A conferência do tempo: as cenas cobrem o vídeo sem buraco nem sobreposição, cada cena
// contém INTEIRAS as falas dela (nenhuma frase cortada) e toda fala tem cena. Devolve a lista
// de problemas (vazia = ok). O index chama e PARA o render se houver problema.
export const conferirDocumentario = (doc: Documentario, falas: FalaNoTempo[]): string[] => {
  const p: string[] = [];
  const caps = new Set(doc.capitulos.map((c) => c.id));
  const fontes = new Set(doc.fontes.map((f) => f.id));
  const porId = new Map(falas.map((f) => [f.id, f]));
  const usadas = new Set<string>();
  let fimAnterior = 0;
  for (const c of doc.cenas) {
    if (c.inicio !== fimAnterior) p.push(`${c.id}: começa no quadro ${c.inicio}, a anterior termina em ${fimAnterior} (${c.inicio > fimAnterior ? "buraco" : "sobreposição"})`);
    if (c.fim <= c.inicio) p.push(`${c.id}: termina antes de começar`);
    if (!caps.has(c.capitulo)) p.push(`${c.id}: capítulo ${c.capitulo} não existe`);
    if (!c.recursos.length) p.push(`${c.id}: sem recurso visual`);
    for (const id of c.falas) {
      const f = porId.get(id);
      if (!f) {
        p.push(`${c.id}: a fala ${id} não está no áudio (rode narrar e sincronizar)`);
        continue;
      }
      usadas.add(id);
      const [a, b] = [Math.round(f.inicio * doc.fps), Math.round(f.fim * doc.fps)];
      if (a < c.inicio || b > c.fim) p.push(`${c.id}: a fala ${id} (${a}–${b}) sai da cena (${c.inicio}–${c.fim}): frase cortada`);
    }
    for (const af of c.afirmacoes ?? []) {
      if (af.tipo === "fato" && !af.fontes?.length) p.push(`${c.id}: fato sem fonte: "${af.texto}"`);
      for (const id of af.fontes ?? []) if (!fontes.has(id)) p.push(`${c.id}: fonte ${id} não está na lista`);
    }
    fimAnterior = c.fim;
  }
  if (fimAnterior !== doc.duracao) p.push(`as cenas terminam no quadro ${fimAnterior}, o vídeo em ${doc.duracao}`);
  for (const f of falas) if (!usadas.has(f.id)) p.push(`a fala ${f.id} não tem cena`);
  return p;
};

// capítulos para a descrição do YouTube: o início de cada um (a 1ª cena dele)
export const capitulosNoTempo = (doc: Documentario) =>
  doc.capitulos.map((cap) => {
    const primeira = doc.cenas.find((c) => c.capitulo === cap.id);
    return { ...cap, inicio: primeira ? primeira.inicio / doc.fps : NaN };
  });
