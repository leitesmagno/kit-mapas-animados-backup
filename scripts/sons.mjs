// A TRILHA e os EFEITOS SONOROS do kit, baixados do Mixkit (mixkit.co) e tratados. Roda uma vez (o
// `npm run instalar` já chama); depois os arquivos vivem em public/audio/ e o render é offline.
//
//   npm run sons            (REFAZER=1 baixa de novo)
//
// Licença: Mixkit Free License (música: https://mixkit.co/license/#musicFree · efeitos:
// https://mixkit.co/license/#sfxFree) — uso comercial liberado nos seus vídeos, sem atribuição
// obrigatória. NÃO é permitido redistribuir os sons avulsos: por isso o kit não traz os arquivos, e
// sim este script, que baixa na sua máquina.
//
// Tratamento igual para todos os efeitos: corta o silêncio da frente, tira o que está abaixo de 45 Hz,
// suaviza os agudos e normaliza no MESMO pico (−3 dBFS, em duas passadas), para que os `volume` do
// sons.ts de cada vídeo signifiquem a mesma coisa em todos os arquivos. A música vai como veio.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const MUSICA = "public/audio/music";
const SFX = "public/audio/sfx";
mkdirSync(MUSICA, { recursive: true });
mkdirSync(SFX, { recursive: true });
const tmp = mkdtempSync(path.join(tmpdir(), "sons-"));
const pronto = (f) => existsSync(f) && statSync(f).size > 0 && !process.env.REFAZER;
const duracao = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString()).toFixed(2);
const ffmpeg = (args) => execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", ...args]);

const baixar = async (url, destino) => {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      return;
    } catch (e) {
      if (tentativa >= 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 1500 * tentativa));
    }
  }
};

console.log("trilha → public/audio/music/");
const musica = `${MUSICA}/documentary-background.mp3`;
if (!pronto(musica)) await baixar("https://assets.mixkit.co/music/588/588.mp3", musica);
console.log(`  documentary-background.mp3  ${duracao(musica)}s  (mixkit music 588, "Feedback Dreams" — Eugenio Mininni)`);
// a versão LONGA (documentário): a mesma faixa emendada em ~7 min, com cruzamento de 4 s em cada emenda
const longa = `${MUSICA}/documentary-background-longo.mp3`;
if (!pronto(longa)) ffmpeg(["-i", musica, "-i", musica, "-i", musica, "-filter_complex", "[0][1]acrossfade=d=4[a];[a][2]acrossfade=d=4", "-c:a", "libmp3lame", "-b:a", "192k", longa]);
console.log(`  documentary-background-longo.mp3  ${duracao(longa)}s  (a mesma, emendada)`);

const efeito = async (id, nome, agudo, envelope = "") => {
  const destino = `${SFX}/${nome}`;
  if (pronto(destino)) return;
  const mp3 = path.join(tmp, `${id}.mp3`);
  const wav = path.join(tmp, `${id}.wav`);
  await baixar(`https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`, mp3);
  const filtros = `silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.005,highpass=f=45,treble=g=${agudo}:f=6000:width_type=q:width=0.7${envelope ? `,${envelope}` : ""}`;
  ffmpeg(["-i", mp3, "-af", filtros, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
  // duas passadas: mede o pico e aplica o ganho exato
  const medida = spawnSync("ffmpeg", ["-nostdin", "-i", wav, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" }).stderr;
  const pico = Number(/max_volume: (-?[\d.]+) dB/.exec(medida)?.[1] ?? 0);
  ffmpeg(["-i", wav, "-af", `volume=${(-3 - pico).toFixed(2)}dB`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", destino]);
  console.log(`  ${nome.padEnd(18)} ${duracao(destino)}s  (mixkit sfx ${id})`);
};

console.log("efeitos → public/audio/sfx/");
try {
  // passagens de câmera
  await efeito(1492, "zoom.wav", -3, "atrim=0:2.5,afade=t=out:st=1.8:d=0.7");
  await efeito(1486, "bigzoom.wav", -3, "atrim=0:3.5,afade=t=out:st=2.5:d=1");
  await efeito(1468, "pan.wav", -4, "atrim=0:3,afade=t=out:st=2:d=1");
  await efeito(2638, "transition.wav", -3, "atrim=0:4,afade=t=out:st=3:d=1");
  await efeito(1482, "outro.wav", -4, "atrim=0:4,afade=t=out:st=2.5:d=1.5");
  await efeito(166, "route.wav", -3, "atrim=0:2,afade=t=out:st=1.4:d=0.6");
  await efeito(1486, "whoosh-tunel.wav", -3);
  // toques
  await efeito(2356, "marker.wav", -2);
  await efeito(1133, "photo.wav", -4);
  await efeito(2568, "tique.wav", -4);
  await efeito(2574, "pino.wav", -4);
  await efeito(2586, "shimmer.wav", -5, "atrim=0:3,afade=t=out:st=2:d=1");
  await efeito(781, "reveal.wav", -2, "atrim=0:4,afade=t=out:st=2.5:d=1.5");
  // camas (ambiente)
  await efeito(1177, "espaco.wav", -4, "atrim=0:12,afade=t=in:d=1.5,afade=t=out:st=7:d=5");
  await efeito(2505, "cidade.wav", -3, "atrim=0:24,afade=t=in:d=2.5,afade=t=out:st=18:d=6");
  await efeito(2453, "rio.wav", -3, "atrim=0:6,afade=t=in:d=1.2,afade=t=out:st=3:d=3");
  await efeito(2472, "passaros.wav", -4, "atrim=0:16,afade=t=in:d=2,afade=t=out:st=11:d=5");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log("sons prontos.");
