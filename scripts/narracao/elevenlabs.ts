// A NARRAÇÃO de um projeto narrado (src/motor/projeto.ts) na ElevenLabs — genérico: cada vídeo
// tem um script de 3 linhas que importa o projeto.ts dele e chama `narrarProjeto`.
//
// A chave vem SÓ do ambiente/.env (ELEVENLABS_API_KEY) e nunca é impressa. A voz é a do
// projeto.ts; VOZ_ID no ambiente tem prioridade (para testar outra voz sem mexer no código).
//
// Para cada cena (uma fala):
//   1. API → public/<pasta>/bruto/<cena>.mp3 — a tomada crua, que NUNCA é sobrescrita: se já
//      existe, não chama a API. Com REFAZER=1, a anterior vai para bruto/anteriores/ (com a
//      data) antes de gerar outra.
//   2. scripts/silencios.py → public/<pasta>/<cena>.mp3 — silêncios longos encurtados, pausas
//      curtas e respirações intactas, acabamento de voz, −16 LUFS (relatório em bruto/).
// O texto da fala anterior e o da seguinte vão junto (previous_text/next_text): a entonação
// corre como se fosse uma tomada só.
//
//   argumentos: [ids das cenas…]   (nenhum = todas)
//   TRATAR=1   não chama a API: só refaz o tratamento a partir do bruto que existe
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pythonDoSistema } from "../lib/python.mjs";
import type { ProjetoNarrado } from "../../src/motor/projeto";

const lerEnv = (): Record<string, string> => {
  if (!existsSync(".env")) return {};
  return Object.fromEntries(
    readFileSync(".env", "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
  );
};

const duracao = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

export const tratar = (projeto: ProjetoNarrado, bruto: string, final: string) =>
  execFileSync(pythonDoSistema() ?? "python3", ["scripts/silencios.py", bruto, final, JSON.stringify(projeto.tratamento)], { stdio: "inherit" });

export async function narrarProjeto(projeto: ProjetoNarrado, argumentos = process.argv.slice(2)) {
  const env = lerEnv();
  const chave = process.env.ELEVENLABS_API_KEY ?? env.ELEVENLABS_API_KEY;
  const voz = process.env.VOZ_ID ?? projeto.voz.id;
  const esconder = (s: string) => (chave ? s.split(chave).join("***") : s);
  const pasta = path.join("public", projeto.pastaDoAudio);
  const pastaBruta = path.join(pasta, "bruto");
  mkdirSync(pastaBruta, { recursive: true });
  const soTratar = !!process.env.TRATAR;
  if (!soTratar && !chave) throw new Error("falta ELEVENLABS_API_KEY no .env (veja .env.example)");

  const cenas = projeto.cenas.filter((c) => !argumentos.length || argumentos.includes(c.id));
  if (!cenas.length) throw new Error(`nenhuma cena com id ${argumentos.join(", ")}`);
  for (const cena of cenas) {
    const i = projeto.cenas.indexOf(cena);
    const bruto = path.join(pastaBruta, `${cena.id}.mp3`);
    const final = path.join(pasta, `${cena.id}.mp3`);
    if (cena.reaproveita) {
      // não chama a API: o bruto vem de uma fala já gravada, no andamento pedido
      const origem = path.join(pastaBruta, `${cena.reaproveita.bruto}.mp3`);
      if (!existsSync(origem)) throw new Error(`${cena.id}: o áudio a reaproveitar não existe (${origem})`);
      if (!existsSync(bruto)) {
        const andamento = cena.reaproveita.andamento ?? 1;
        const corte = cena.reaproveita.recorte;
        const filtro = [corte ? `atrim=${corte[0]}:${corte[1]},asetpts=PTS-STARTPTS` : "", `atempo=${andamento}`].filter(Boolean).join(",");
        execFileSync("ffmpeg", ["-v", "error", "-y", "-i", origem, "-af", filtro, "-c:a", "libmp3lame", "-b:a", "192k", bruto]);
        console.log(`${cena.id}: reaproveitado de ${cena.reaproveita.bruto}${corte ? ` [${corte[0]}–${corte[1]} s]` : ""} (andamento ${andamento})`);
      }
    } else if (soTratar) {
      if (!existsSync(bruto)) {
        console.log(`${cena.id}: sem bruto, pulando`);
        continue;
      }
    } else if (existsSync(bruto) && !process.env.REFAZER) {
      console.log(`${cena.id}: já existe (bruto/${cena.id}.mp3) — REFAZER=1 para gerar de novo`);
      if (existsSync(final)) continue;
    } else {
      if (existsSync(bruto)) {
        const guarda = path.join(pastaBruta, "anteriores");
        mkdirSync(guarda, { recursive: true });
        const destino = path.join(guarda, `${cena.id}-${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`);
        renameSync(bruto, destino);
        console.log(`${cena.id}: a tomada anterior foi guardada em ${destino}`);
      }
      const corpo = {
        text: cena.texto,
        model_id: projeto.voz.modelo,
        voice_settings: {
          stability: projeto.voz.stability,
          similarity_boost: projeto.voz.similarityBoost,
          style: projeto.voz.style,
          use_speaker_boost: projeto.voz.speakerBoost,
          speed: projeto.voz.speed,
        },
        previous_text: projeto.cenas[i - 1]?.texto,
        next_text: projeto.cenas[i + 1]?.texto,
      };
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=${projeto.voz.formato}`;
      for (let tentativa = 1; ; tentativa++) {
        const r = await fetch(url, { method: "POST", headers: { "xi-api-key": chave!, "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
        if (r.ok) {
          writeFileSync(bruto, Buffer.from(await r.arrayBuffer()));
          break;
        }
        const erro = esconder((await r.text()).slice(0, 300));
        if ((r.status === 429 || r.status >= 500) && tentativa < 5) {
          console.log(`  ${r.status}: esperando ${8 * tentativa}s…`);
          await new Promise((ok) => setTimeout(ok, 8000 * tentativa));
          continue;
        }
        throw new Error(`${cena.id}: HTTP ${r.status}: ${erro}`);
      }
    }
    tratar(projeto, bruto, final);
    console.log(`${cena.id}: ${duracao(bruto).toFixed(2)} s bruto → ${duracao(final).toFixed(2)} s tratado`);
  }
}

export const rodar = (projeto: ProjetoNarrado) =>
  narrarProjeto(projeto).catch((e) => {
    const chave = process.env.ELEVENLABS_API_KEY ?? lerEnv().ELEVENLABS_API_KEY;
    const msg = String(e?.message ?? e);
    console.error(chave ? msg.split(chave).join("***") : msg);
    process.exit(1);
  });
