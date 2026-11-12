// A INSTALAÇÃO do kit numa máquina nova (Windows, macOS ou Linux). Pode rodar de novo quantas
// vezes quiser: o que já está instalado é pulado.
//
//   npm run instalar            instala tudo (dependências, Whisper, sons, satélite dos exemplos)
//   npm run verificar           só confere o que falta, sem instalar nada
//
// O que precisa existir ANTES (o script confere e diz como instalar o que faltar):
//   Node.js 18+ · Python 3.9+ · FFmpeg (ffmpeg e ffprobe)
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { pastaDoVenv, pythonDoSistema, pythonDoVenv, venvExiste, WINDOWS } from "./lib/python.mjs";

const SO_VERIFICAR = process.argv.includes("--verificar");
const SO = WINDOWS ? "windows" : process.platform === "darwin" ? "mac" : "linux";
let faltou = false;

const ok = (t) => console.log(`  \x1b[32m✓\x1b[0m ${t}`);
const falta = (t) => {
  console.log(`  \x1b[31m✗\x1b[0m ${t}`);
  faltou = true;
};
const aviso = (t) => console.log(`  \x1b[33m!\x1b[0m ${t}`);
const como = { windows: { python: "winget install Python.Python.3.12", ffmpeg: "winget install Gyan.FFmpeg" }, mac: { python: "brew install python", ffmpeg: "brew install ffmpeg" }, linux: { python: "sudo apt install -y python3 python3-venv", ffmpeg: "sudo apt install -y ffmpeg" } }[SO];

const tem = (cmd, args = ["-version"]) => {
  try {
    execFileSync(cmd, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
// roda um comando mostrando a saída; no Windows, npm/npx são .cmd (precisam do shell)
const rodar = (cmd, args, opcoes = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: WINDOWS && /^(npm|npx)$/.test(cmd), ...opcoes });
  if (r.status !== 0) throw new Error(`falhou: ${cmd} ${args.join(" ")}`);
};

console.log(`== 1. o que o computador precisa ter (${SO})`);
const versaoNode = Number(process.versions.node.split(".")[0]);
versaoNode >= 18 ? ok(`Node.js ${process.version}`) : falta(`Node.js ${process.version} é antigo: instale o LTS em https://nodejs.org`);
const python = pythonDoSistema();
python ? ok(`Python (${python})`) : falta(`Python 3.9+: ${como.python}  (ou https://python.org, marcando "Add python.exe to PATH")`);
tem("ffmpeg") ? ok("FFmpeg") : falta(`FFmpeg: ${como.ffmpeg}`);
tem("ffprobe") ? ok("ffprobe") : falta("ffprobe (vem junto com o FFmpeg)");
if (faltou) {
  console.log("\nInstale o que está com ✗, FECHE e abra o terminal de novo, e rode outra vez:  npm run instalar");
  process.exit(1);
}

console.log("\n== 2. as partes do kit");
const configurado = existsSync("marca.json") && JSON.parse(readFileSync("marca.json", "utf-8")).configurado;
if (SO_VERIFICAR) {
  const estado = (cond, t) => (cond ? ok(t) : falta(`${t} — rode: npm run instalar`));
  estado(existsSync("node_modules/remotion"), "dependências do Node");
  estado(venvExiste("venv-whisper"), "Whisper local (sincronizar a narração)");
  estado(venvExiste("venv-geo"), "Python de imagem (satélite de perto, fotos, dados)");
  estado(venvExiste("venv-imagens"), "Python das imagens de IA (Gemini)");
  estado(existsSync("public/audio/sfx/zoom.wav"), "trilha e efeitos sonoros");
  estado(existsSync("public/satelite/exemplo-vertical"), "satélite do exemplo vertical");
  existsSync(".env") ? ok(".env") : aviso(".env não existe (só precisa para ElevenLabs/Gemini)");
  configurado ? ok("marca configurada (marca.json)") : aviso('marca ainda não configurada: peça ao Claude "configura o kit"');
  if (faltou) process.exit(1);
  console.log("\nTudo pronto.");
  process.exit(0);
}

const venv = (nome, pacotes) => {
  if (!venvExiste(nome)) {
    rodar(python, ["-m", "venv", pastaDoVenv(nome)]);
    rodar(pythonDoVenv(nome), ["-m", "pip", "install", "-q", "--upgrade", "pip"]);
  }
  rodar(pythonDoVenv(nome), ["-m", "pip", "install", "-q", ...pacotes]);
};

try {
  console.log("-- dependências do Node (alguns minutos)");
  rodar("npm", ["install", "--no-audit", "--no-fund"]);
  ok("npm install");

  console.log("-- Whisper local (reconhece a sua voz; roda no processador)");
  venv("venv-whisper", ["faster-whisper", "numpy"]);
  // baixa o modelo agora (≈ 480 MB, uma vez só)
  rodar(pythonDoVenv("venv-whisper"), ["-c", 'from faster_whisper import WhisperModel; WhisperModel("small", device="cpu", compute_type="int8")']);
  ok("Whisper");

  console.log("-- Python de imagem (satélite de perto, fotos, dados)");
  venv("venv-geo", ["numpy", "pillow", "shapely"]);
  ok("venv-geo");

  console.log("-- Python das imagens de IA (Gemini, opcional)");
  venv("venv-imagens", ["-r", "scripts/imagens/requisitos.txt"]);
  ok("venv-imagens");

  console.log("-- o navegador do Remotion (o que desenha cada quadro)");
  rodar("npx", ["remotion", "browser", "ensure"]);
  ok("Chrome do Remotion");

  if (!existsSync(".env")) {
    copyFileSync(".env.example", ".env");
    ok(".env criado (vazio)");
  }

  console.log("-- trilha e efeitos sonoros (Mixkit)");
  rodar("node", ["scripts/sons.mjs"]);

  console.log("-- satélite dos exemplos (só o que a câmera vê)");
  rodar("npx", ["tsx", "scripts/tiles.ts", "exemplo-vertical"]);
  rodar("npx", ["tsx", "scripts/tiles.ts", "exemplo-horizontal"]);
} catch (e) {
  console.error(`\n✗ ${e.message}\nCopie esta mensagem para o Claude: ele resolve. Depois rode de novo  npm run instalar  (continua de onde parou).`);
  process.exit(1);
}

console.log("\nKit instalado. Para abrir o estúdio:  npm run dev");
if (!configurado) console.log('Agora diga ao Claude: "configura o kit"');
