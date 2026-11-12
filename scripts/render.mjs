// O RENDER final de um vídeo (MP4 pronto para postar): renderiza e acerta o volume em −14 LUFS (o
// padrão do YouTube, do Reels e do TikTok).
//
//   npm run render -- ExemploVertical
//   NUCLEOS=2 npm run render -- ExemploVertical      (computador mais fraco: menos de uma vez)
//
// Sai em out/<Composicao>.mp4.
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";

const id = process.argv[2];
if (!id) {
  console.error("uso: npm run render -- <Composicao>   (o nome que aparece no estúdio)");
  process.exit(1);
}
mkdirSync("out", { recursive: true });
const bruto = `out/${id}-bruto.mp4`;
const final = `out/${id}.mp4`;
const r = spawnSync("npx", ["remotion", "render", id, bruto, `--concurrency=${process.env.NUCLEOS ?? 4}`, "--timeout=120000"], { stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) process.exit(r.status ?? 1);

const medida = spawnSync("ffmpeg", ["-nostdin", "-hide_banner", "-i", bruto, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf-8" }).stderr;
const json = /\{[\s\S]*\}/.exec(medida)?.[0];
const m = json ? JSON.parse(json) : null;
if (!m || m.input_i === "-inf") {
  // vídeo mudo (o exemplo, antes da sua voz): só copia
  copyFileSync(bruto, final);
} else {
  execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", bruto, "-c:v", "copy", "-af",
    `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "-ar", "48000", "-c:a", "aac", "-b:a", "256k", final]);
  console.log(`áudio: ${m.input_i} LUFS → −14 LUFS`);
}
rmSync(bruto, { force: true });
console.log(`pronto: ${final}`);
