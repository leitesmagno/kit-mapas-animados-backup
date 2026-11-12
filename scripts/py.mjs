// Roda um script Python do kit com o ambiente certo, em qualquer sistema:
//
//   node scripts/py.mjs <venv> <script.py | -m modulo> [argumentos…]
//
// (é o que os comandos do package.json usam: npm run sincronizar, fotos, dados, imagens…)
import { spawnSync } from "node:child_process";
import { pythonDoVenv, venvExiste } from "./lib/python.mjs";

const [venv, ...resto] = process.argv.slice(2);
if (!venvExiste(venv)) {
  console.error(`✗ falta o ambiente Python "${venv}": rode  npm run instalar`);
  process.exit(1);
}
const r = spawnSync(pythonDoVenv(venv), resto, { stdio: "inherit", env: { ...process.env, PYTHONUTF8: "1" } });
process.exit(r.status ?? 1);
