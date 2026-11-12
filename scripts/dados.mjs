// Os DADOS de um vídeo (malhas do IBGE, OpenStreetMap, Natural Earth…): roda scripts/dados-<pasta>.py
// com o Python do kit (shapely, numpy, pillow). É a única etapa, junto com o satélite, que usa internet.
//
//   npm run dados -- exemplo-vertical
//   npm run dados -- exemplo-vertical cidades      (só uma etapa, quando o script tem etapas)
import { spawnSync } from "node:child_process";

const [pasta, ...resto] = process.argv.slice(2);
if (!pasta) {
  console.error("uso: npm run dados -- <pasta do vídeo>");
  process.exit(1);
}
const r = spawnSync("node", ["scripts/py.mjs", "venv-geo", `scripts/dados-${pasta}.py`, ...resto], { stdio: "inherit" });
process.exit(r.status ?? 1);
