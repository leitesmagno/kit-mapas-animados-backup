// As THUMBNAILS montadas por camadas (skill thumbnail-chamativa): renderiza cada receita
// src/videos/<doc>/capa/thumb-*.json na composição certa (ThumbYouTube 1280×720 ou ThumbShorts
// 1080×1920, pelo campo `formato`) e monta a folha de conferência (tamanho real, tamanho de
// celular, preto e branco e as áreas que o YouTube cobre).
//
//   npm run thumb -- <doc>                 todas as receitas do vídeo
//   npm run thumb -- <doc> thumb-a thumb-c só essas
//   GUIAS=0 npm run thumb -- <doc>         a folha sem as áreas cobertas
//
// Sai em out/thumbs/<doc>/<receita>.png (o arquivo para subir no YouTube, < 2 MB) e
// out/thumbs/<doc>/folha.jpg.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { pythonDoVenv } from "../lib/python.mjs";

const [doc, ...pedidas] = process.argv.slice(2);
if (!doc) {
  console.error("uso: npm run thumb -- <doc> [receitas…]   (doc = pasta em src/videos/)");
  process.exit(1);
}
const pastaCapa = join("src/videos", doc, "capa");
if (!existsSync(pastaCapa)) {
  console.error(`não achei ${pastaCapa}`);
  process.exit(1);
}
const receitas = readdirSync(pastaCapa)
  .filter((f) => /^thumb-.*\.json$/.test(f))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((n) => !pedidas.length || pedidas.includes(n))
  .sort();
if (!receitas.length) {
  console.error(`nenhuma receita thumb-*.json em ${pastaCapa}`);
  process.exit(1);
}

// toda imagem citada tem de existir em public/ (erro claro em vez de buraco na thumbnail)
const faltando = [];
for (const n of receitas) {
  const texto = readFileSync(join(pastaCapa, `${n}.json`), "utf8");
  for (const m of texto.matchAll(/"src"\s*:\s*"([^"]+)"/g)) if (!existsSync(join("public", m[1]))) faltando.push(`${n}: public/${m[1]}`);
}
if (faltando.length) {
  console.error("imagens que não existem:\n  " + faltando.join("\n  "));
  process.exit(1);
}

const saida = join("out/thumbs", doc);
mkdirSync(saida, { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });
const feitas = [];
for (const n of receitas) {
  const receita = JSON.parse(readFileSync(join(pastaCapa, `${n}.json`), "utf8"));
  // a mesma composição que o usuário vê no Studio (kit/thumb/registro.tsx)
  const id = `Thumb-${doc}-${n.replace(/^thumb-/, "")}`.replace(/[^a-zA-Z0-9-]/g, "-");
  const composition = await selectComposition({ serveUrl, id, inputProps: receita });
  const arquivo = join(saida, `${n}.png`);
  await renderStill({ serveUrl, composition, inputProps: receita, output: arquivo, imageFormat: "png", timeoutInMilliseconds: 120000 });
  if (process.env.GUIAS !== "0") {
    await renderStill({ serveUrl, composition, inputProps: { ...receita, guias: true }, output: join(saida, `${n}.guias.png`), imageFormat: "png", timeoutInMilliseconds: 120000 });
  }
  const kb = Math.round(statSync(arquivo).size / 1024);
  console.log(`${arquivo} (${composition.width}×${composition.height}, ${kb} KB)`);
  feitas.push(arquivo);
}

execFileSync(pythonDoVenv("venv-imagens"), ["-I", "scripts/thumb/conferir.py", join(saida, "folha.jpg"), ...feitas], { stdio: "inherit" });
