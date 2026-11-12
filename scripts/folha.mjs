// FOLHA DE CONTATO de um vídeo: um quadro a cada PASSO segundos (padrão 1 s), ou os quadros pedidos,
// numa imagem só — para conferir de relance o ritmo das cenas, se nada saiu da área segura e se
// textos, legenda e fotos não se encavalam. ESCALA=0.5 (padrão) renderiza em meia resolução.
//
//   npm run folha -- ExemploVertical              um quadro por segundo do vídeo todo
//   npm run folha -- ExemploVertical 120 240 300  quadros específicos (do vídeo)
//   PASSO=0.5 COLUNAS=8 npm run folha -- …
//
// Sai em out/folha-<Composicao>.jpg (e os quadros em out/folha-<Composicao>/). Não é o render do vídeo.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [id, ...resto] = process.argv.slice(2);
if (!id) {
  console.error("uso: npm run folha -- <Composicao> [quadros…]   (o id que aparece no Studio)");
  process.exit(1);
}
const pasta = `out/folha-${id}`;
rmSync(pasta, { recursive: true, force: true });
mkdirSync(pasta, { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
const FPS = composition.fps;
const pedidos = resto.map(Number);
const passo = Math.max(1, Math.round(Number(process.env.PASSO ?? 1) * FPS));
const lista = pedidos.length ? pedidos : Array.from({ length: Math.ceil(composition.durationInFrames / passo) }, (_, i) => i * passo);
const arquivos = [];
for (const q of lista) {
  const f = join(pasta, `${String(q).padStart(5, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame: Math.min(q, composition.durationInFrames - 1), output: f, imageFormat: "jpeg", jpegQuality: 80, scale: Number(process.env.ESCALA ?? 0.5), timeoutInMilliseconds: 120000 });
  arquivos.push({ f, q });
  process.stdout.write(".");
}
console.log();

const vertical = composition.height > composition.width;
const colunas = Number(process.env.COLUNAS ?? (vertical ? 6 : 4));
const larg = vertical ? 270 : 480;
const alt = vertical ? 480 : 270;
const entradas = arquivos.flatMap(({ f }) => ["-i", f]);
// no vertical, a moldura amarela é a área segura do 9:16 (o que a interface do Shorts/Reels não cobre)
const moldura = vertical ? `,drawbox=x=0:y=${Math.round((220 / 1920) * alt)}:w=${larg}:h=${Math.round((1340 / 1920) * alt)}:color=yellow@0.35:t=1` : "";
const filtros = arquivos.map(({ q }, i) => `[${i}]scale=${larg}:${alt},drawtext=text='q${q} ${(q / FPS).toFixed(1)}s':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6${moldura}[s${i}]`).join(";");
const layout = arquivos.map((_, i) => `${(i % colunas) * larg}_${Math.floor(i / colunas) * alt}`).join("|");
const saida = `out/folha-${id}.jpg`;
execFileSync("ffmpeg", ["-v", "error", "-y", ...entradas, "-filter_complex", `${filtros};${arquivos.map((_, i) => `[s${i}]`).join("")}xstack=inputs=${arquivos.length}:layout=${layout}:fill=gray`, "-q:v", "3", saida]);
console.log(`→ ${saida}`);
