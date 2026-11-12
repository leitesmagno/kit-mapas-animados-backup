// Os materiais de PUBLICAÇÃO de um documentário horizontal (título, descrição com capítulos, fontes,
// aviso das imagens de IA, lista de revisão e a legenda .srt), a partir do que o vídeo já sabe.
//
//   npm run publicacao -- exemplo-horizontal
//
// Grava PUBLICACAO-<pasta>.md na raiz e out/<pasta>.srt.
import fs from "node:fs";
import { gerarPublicacao } from "./documentario/publicacao";

const pasta = process.argv[2];
if (!pasta) {
  console.error("uso: npm run publicacao -- <pasta do documentário em src/videos/>");
  process.exit(1);
}
const { DOC, PALAVRAS } = await import(`../src/videos/${pasta}/roteiro.ts`);
const manifesto = JSON.parse(fs.readFileSync(`src/videos/${pasta}/imagens/manifesto.json`, "utf-8"));
gerarPublicacao({ sigla: pasta, doc: DOC, palavras: PALAVRAS, imagens: manifesto, srt: `out/${pasta}.srt` });
