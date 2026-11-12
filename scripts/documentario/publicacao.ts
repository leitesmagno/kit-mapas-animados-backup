// OS MATERIAIS DE PUBLICAÇÃO de um documentário (YouTube), a partir do que o vídeo JÁ sabe: as
// cenas declaradas (motor/documentario.ts), os tempos reais do Whisper e o manifesto das imagens.
// Nada é inventado aqui: título, resumo e tags vêm do DOC.publicacao; capítulos, fontes e
// afirmações vêm do DOC; a legenda vem das palavras que a voz disse.
//
// Grava:
//   PUBLICACAO-<SIGLA>.md   título e alternativas, descrição com capítulos, fontes, aviso das imagens
//                           sintéticas, texto da capa e a lista de REVISÃO (fato / interpretação /
//                           hipótese, com nota) — nada vai ao ar sem essa revisão
//   out/<arquivo>.srt       a legenda com os tempos reais (para subir no YouTube)
//
// O script de cada vídeo tem poucas linhas (como o narrar):
//   import { gerarPublicacao } from "./documentario/publicacao";
//   gerarPublicacao({ sigla: "G01", doc: DOC, palavras: PALAVRAS, imagens: manifesto, srt: "out/ormuz-demo.srt" });
import fs from "node:fs";
import path from "node:path";
import { capitulosNoTempo, imagensDasCenas, type Documentario } from "../../src/motor/documentario";

type Palavra = { palavra: string; inicio: number; fim: number };
type Manifesto = { imagens: Record<string, { ilustrativa?: boolean; revisao?: string; aprovada?: string | null; atual?: string; versoes?: Record<string, { modelo: string }> }> };

const relogio = (s: number) => {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};
const tempoSrt = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

// a legenda .srt: cada FRASE (até a pontuação final) vira 1 bloco ou mais, divididos em partes de
// tamanho parecido (nada de sobrar "de água." sozinho por 0,8 s); até 2 linhas de ~42 caracteres.
// Cada bloco vai da 1ª à última palavra dele (nunca antes de a voz falar).
export const legendaSrt = (palavras: Palavra[], maxCaracteres = 84): string => {
  const frases: Palavra[][] = [];
  let atual: Palavra[] = [];
  for (const p of palavras) {
    atual.push(p);
    if (/[.!?]$/.test(p.palavra)) {
      frases.push(atual);
      atual = [];
    }
  }
  if (atual.length) frases.push(atual);
  const texto = (b: Palavra[]) => b.map((p) => p.palavra).join(" ");
  const blocos = frases.flatMap((f) => {
    const n = Math.ceil(texto(f).length / maxCaracteres);
    if (n <= 1) return [f];
    const alvo = texto(f).length / n;
    const partes: Palavra[][] = [[]];
    for (const p of f) {
      const ultima = partes[partes.length - 1];
      if (ultima.length && texto([...ultima, p]).length > alvo + 6 && partes.length < n) partes.push([p]);
      else ultima.push(p);
    }
    return partes;
  });
  const quebrar = (t: string) => {
    if (t.length <= maxCaracteres / 2) return t;
    const meio = t.length / 2;
    let melhor = -1;
    for (let i = 0; i < t.length; i++) if (t[i] === " " && (melhor < 0 || Math.abs(i - meio) < Math.abs(melhor - meio))) melhor = i;
    return melhor < 0 ? t : `${t.slice(0, melhor)}\n${t.slice(melhor + 1)}`;
  };
  return blocos
    .map((b, i) => `${i + 1}\n${tempoSrt(b[0].inicio)} --> ${tempoSrt(Math.max(b[b.length - 1].fim, b[0].inicio + 0.8))}\n${quebrar(texto(b))}\n`)
    .join("\n");
};

export function gerarPublicacao(o: { sigla: string; doc: Documentario; palavras: Palavra[]; imagens: Manifesto; srt: string }) {
  const { doc } = o;
  const pub = doc.publicacao;
  const caps = capitulosNoTempo(doc);
  const fontes = new Map(doc.fontes.map((f) => [f.id, f]));
  const linhas: string[] = [];
  linhas.push(`# Publicação — ${doc.titulo}`, "");
  linhas.push("> Gerado por `scripts/documentario/publicacao.ts`. **Revise a seção “Revisão editorial” antes de publicar.** Este arquivo não publica nada.", "");
  if (pub) {
    linhas.push("## Título", "", `**${pub.titulos[0]}**`, "", "Alternativas:", ...pub.titulos.slice(1).map((t) => `- ${t}`), "");
    linhas.push("## Texto da thumbnail", "", pub.textoDaCapa.join(" / "), "");
  }
  linhas.push("## Descrição (pronta para colar)", "", "```");
  if (pub) linhas.push(pub.resumo, "");
  linhas.push("Capítulos:");
  for (const c of caps) linhas.push(`${relogio(c.inicio)} ${c.titulo}`);
  linhas.push("", "Fontes:");
  for (const f of doc.fontes) linhas.push(`- ${f.editor}: ${f.titulo}${f.publicadoEm ? ` (${f.publicadoEm})` : ""} — ${f.url}`);
  const sinteticas = imagensDasCenas(doc.cenas).filter(({ imagem }) => o.imagens.imagens[imagem]?.ilustrativa !== false);
  if (sinteticas.length) linhas.push("", "Algumas imagens deste vídeo são ilustrações geradas por inteligência artificial (não são fotografias dos lugares ou dos fatos).");
  if (pub) linhas.push("", pub.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" "));
  linhas.push("```", "");
  if (pub) linhas.push("## Tags", "", pub.tags.join(", "), "");

  // as checagens do YouTube para capítulos
  const avisos: string[] = [];
  if (caps[0]?.inicio !== 0) avisos.push("o primeiro capítulo precisa começar em 00:00");
  caps.forEach((c, i) => {
    const fim = caps[i + 1]?.inicio ?? doc.duracao / doc.fps;
    if (fim - c.inicio < 10) avisos.push(`o capítulo "${c.titulo}" tem ${(fim - c.inicio).toFixed(1)} s (o YouTube só mostra capítulos com 10 s ou mais)`);
  });
  if (avisos.length) linhas.push("### ⚠ Capítulos", "", ...avisos.map((a) => `- ${a}`), "");

  linhas.push("## Imagens sintéticas (IA)", "");
  if (!sinteticas.length) linhas.push("Nenhuma.", "");
  for (const { cena, imagem } of sinteticas) {
    const m = o.imagens.imagens[imagem];
    const v = m?.versoes?.[m.aprovada ?? m.atual ?? ""];
    linhas.push(`- \`${imagem}\` (${cena}) — ilustrativa, ${v?.modelo ?? "?"}, revisão: **${m?.revisao ?? "pendente"}**`);
  }
  linhas.push("");

  linhas.push("## Revisão editorial (o que a narração afirma)", "");
  for (const c of doc.cenas) {
    for (const a of c.afirmacoes ?? []) {
      const refs = (a.fontes ?? []).map((id) => fontes.get(id)?.editor ?? id).join("; ");
      linhas.push(`- [ ] **${a.tipo}** · ${c.id} (${relogio(c.inicio / doc.fps)}): ${a.texto}${refs ? ` — ${refs}` : ""}${a.nota ? `  \n  _${a.nota}_` : ""}`);
    }
  }
  linhas.push("");
  const md = path.join(process.cwd(), `PUBLICACAO-${o.sigla}.md`);
  fs.writeFileSync(md, linhas.join("\n"));
  fs.mkdirSync(path.dirname(o.srt), { recursive: true });
  fs.writeFileSync(o.srt, legendaSrt(o.palavras));
  console.log(`${path.basename(md)} · ${o.srt} (${caps.length} capítulos, ${sinteticas.length} imagens sintéticas, ${doc.cenas.reduce((n, c) => n + (c.afirmacoes?.length ?? 0), 0)} afirmações para revisar)`);
  if (avisos.length) console.log(`atenção: ${avisos.join("; ")}`);
}
