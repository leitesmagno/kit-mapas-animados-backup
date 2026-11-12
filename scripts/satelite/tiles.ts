// O SATÉLITE de qualquer vídeo, sem copiar script: simula a câmera quadro a quadro com as MESMAS
// funções do render (geo/camera.ts + geo/tiles.ts) e baixa para public/<pasta>/ cada tile que
// aparece, e só ele. Funciona no vertical e no horizontal (a largura e a altura vêm do roteiro).
// Quem chama é o scripts/tiles.ts (npm run tiles -- <pasta do vídeo>), que lê o roteiro.ts do vídeo.
//
// Até o nível 8: NASA Blue Marble com relevo e batimetria (domínio público, GIBS). Acima disso:
// composição NASA + EOxCloudless 2016 (CC BY 4.0) dentro de `eoxArea` (scripts/satelite/perto.py).
// Tiles que a câmera não vê mais são apagados. Rode de novo sempre que mexer na câmera.
//   REFAZER=9,10 refaz esses níveis
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { pythonDoVenv } from "../lib/python.mjs";
import { cameraDoVideo, type Chave } from "../../src/base/geo/camera";
import { tilesDoQuadro } from "../../src/base/geo/tiles";

const URL = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";
const NIVEL_MAXIMO = 8;

// no WSL a conexão às vezes demora mais que os 250 ms padrão do Node ("fetch failed")
net.setDefaultAutoSelectFamilyAttemptTimeout(3000);

export type OpcoesDoSatelite = {
  pasta: string; // em public/
  chaves: Chave[];
  deriva: number;
  duracao: number; // quadros
  largura: number;
  altura: number;
  eoxArea: [number, number, number, number]; // oeste, sul, leste, norte
  zoomMax?: number; // o nível mais fundo (padrão: o do geo/tiles.ts)
  passo?: number; // de quantos em quantos quadros simular (0,5 nos vídeos a 60 fps)
};

export async function baixarSatelite(o: OpcoesDoSatelite) {
  const raiz = path.join(process.cwd(), "public", o.pasta);
  const precisa = new Set<string>();
  for (let q = 0; q < o.duracao; q += o.passo ?? 1) {
    for (const t of tilesDoQuadro(cameraDoVideo(o.chaves, q, o.largura, o.deriva), o.largura, o.altura, o.zoomMax)) precisa.add(`${t.z}/${t.x}/${t.y}`);
  }
  const refazer = new Set((process.env.REFAZER ?? "").split(",").filter(Boolean).map(Number));
  const todos = [...precisa].filter((k) => refazer.has(Number(k.split("/")[0])) || !fs.existsSync(path.join(raiz, `${k}.jpg`)));
  const perto = todos.filter((k) => Number(k.split("/")[0]) > NIVEL_MAXIMO);
  const faltam = todos.filter((k) => Number(k.split("/")[0]) <= NIVEL_MAXIMO);
  console.log(`satélite (${o.pasta}): ${precisa.size} tiles no percurso, faltando ${faltam.length} de longe e ${perto.length} de perto`);

  if (perto.length) {
    const LOTES = 8;
    const env = { ...process.env, SATELITE_PASTA: o.pasta, SATELITE_CACHE: path.join("node_modules", ".cache", o.pasta), EOX_AREA: o.eoxArea.join(",") };
    await Promise.all(
      Array.from({ length: LOTES }, (_, i) =>
        new Promise<void>((ok, erro) => {
          const p = spawn(pythonDoVenv("venv-geo"), ["scripts/satelite/perto.py"], { stdio: ["pipe", "inherit", "inherit"], env });
          p.on("exit", (c) => (c === 0 ? ok() : erro(new Error(`lote ${i}: saiu com ${c}`))));
          p.stdin.end(JSON.stringify(perto.filter((_, k) => k % LOTES === i)));
        }),
      ),
    );
  }

  const baixar = async (k: string) => {
    const [z, x, y] = k.split("/");
    const destino = path.join(raiz, `${k}.jpg`);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    for (let tentativa = 1; ; tentativa++) {
      try {
        const r = await fetch(URL.replace("{z}", z).replace("{x}", x).replace("{y}", y), { headers: { "User-Agent": "videos-de-mapas/1.0" } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
        return;
      } catch (e) {
        if (tentativa >= 5) throw new Error(`${k}: ${e}`);
        await new Promise((ok) => setTimeout(ok, 500 * tentativa));
      }
    }
  };
  const fila = [...faltam];
  let feitos = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (fila.length) {
        await baixar(fila.shift()!);
        if (++feitos % 100 === 0) console.log(`  ${feitos}/${faltam.length}`);
      }
    }),
  );

  let removidos = 0;
  if (fs.existsSync(raiz)) {
    for (const z of fs.readdirSync(raiz))
      for (const x of fs.readdirSync(path.join(raiz, z)))
        for (const nome of fs.readdirSync(path.join(raiz, z, x)))
          if (!precisa.has(`${z}/${x}/${nome.replace(".jpg", "")}`)) {
            fs.rmSync(path.join(raiz, z, x, nome));
            removidos++;
          }
  }
  console.log(`baixados: ${faltam.length} · compostos de perto: ${perto.length} · removidos (fora do percurso): ${removidos}`);
}
