// A SUA VOZ no vídeo: pegue a gravação, jogue na pasta minha-voz/ (na raiz do kit) e rode
//
//   npm run voz -- <pasta do vídeo>
//
// Aceita qualquer formato de áudio (mp3, m4a do celular, wav, ogg do WhatsApp…) e dois jeitos de gravar:
//   * UMA gravação com o roteiro inteiro → o Whisper acha onde cada fala começa e corta sozinho;
//   * UM arquivo POR FALA → na ordem do nome do arquivo (01, 02, 03… ou am-01, am-02…).
// Cada fala vira public/<pastaDoAudio>/<id>.mp3 (as pausas longas encurtadas, a voz tratada e no volume
// certo), os originais vão para minha-voz/usadas/<pasta>/, e no fim roda a sincronia
// (npm run sincronizar). A pasta do vídeo em public/ é criada se não existir.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pythonDoSistema } from "./lib/python.mjs";

const ENTRADA = "minha-voz";
const AUDIO = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|mp4|mov|wma|amr)$/i;

const pasta = process.argv[2];
if (!pasta) {
  console.error("uso: npm run voz -- <pasta do vídeo em src/videos/>");
  process.exit(1);
}
const { PROJETO } = await import(`../src/videos/${pasta}/projeto.ts`);
const falas: { id: string; texto: string }[] = PROJETO.cenas.map((c: { id: string; texto: string }) => ({ id: c.id, texto: c.texto }));

mkdirSync(ENTRADA, { recursive: true });
const arquivos = readdirSync(ENTRADA)
  .filter((n) => AUDIO.test(n))
  .sort((x, y) => x.localeCompare(y, "pt-BR", { numeric: true }));
if (!arquivos.length) {
  console.error(`✗ a pasta ${ENTRADA}/ está vazia: ponha lá a gravação (um arquivo com tudo, ou um por fala)`);
  process.exit(1);
}

const destino = path.join("public", PROJETO.pastaDoAudio);
const bruto = path.join(destino, "bruto");
mkdirSync(bruto, { recursive: true });
const tmp = path.join(tmpdir(), `voz-${Date.now()}`);
mkdirSync(tmp, { recursive: true });

if (arquivos.length === 1 && falas.length > 1) {
  console.log(`1 gravação com o roteiro inteiro → dividindo em ${falas.length} falas`);
  const lista = path.join(tmp, "falas.json");
  writeFileSync(lista, JSON.stringify(falas));
  const r = spawnSync("node", ["scripts/py.mjs", "venv-whisper", "scripts/narracao/dividir.py", path.join(ENTRADA, arquivos[0]), lista, tmp], { stdio: "inherit" });
  if (r.status !== 0) process.exit(1);
  for (const f of falas) renameSync(path.join(tmp, `${f.id}.wav`), path.join(bruto, `${f.id}.wav`));
} else if (arquivos.length === falas.length) {
  console.log(`${arquivos.length} arquivos, um por fala (na ordem do nome)`);
  arquivos.forEach((nome, i) => {
    console.log(`  ${nome} → ${falas[i].id}`);
    execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", path.join(ENTRADA, nome), "-vn", "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", path.join(bruto, `${falas[i].id}.wav`)]);
  });
} else {
  console.error(`✗ achei ${arquivos.length} arquivos em ${ENTRADA}/, mas o roteiro tem ${falas.length} falas.`);
  console.error("  Ponha UMA gravação com tudo, ou exatamente um arquivo por fala.");
  process.exit(1);
}

// o mesmo tratamento da voz de IA (pausas longas encurtadas, acabamento, volume), sem acelerar a sua voz
const tratamento = { ...PROJETO.tratamento, andamento: Number(process.env.ANDAMENTO ?? 1) };
const python = pythonDoSistema() ?? "python3";
for (const f of falas) {
  execFileSync(python, ["scripts/silencios.py", path.join(bruto, `${f.id}.wav`), path.join(destino, `${f.id}.mp3`), JSON.stringify(tratamento)], { stdio: ["ignore", "ignore", "inherit"] });
}
console.log(`✓ ${falas.length} falas em ${destino}/`);

const usadas = path.join(ENTRADA, "usadas", pasta);
mkdirSync(usadas, { recursive: true });
for (const nome of arquivos) renameSync(path.join(ENTRADA, nome), path.join(usadas, nome));
rmSync(tmp, { recursive: true, force: true });
console.log(`(os originais foram para ${usadas}/)\n`);

const s = spawnSync("node", ["scripts/py.mjs", "venv-whisper", "scripts/sincronizar.py", pasta], { stdio: "inherit" });
process.exit(s.status ?? 1);
