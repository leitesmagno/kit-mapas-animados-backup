import type { Mosaico } from "./cameraGlobo";

// ---------------------------------------------------------------------------
// Os RECORTES de satélite do <Globo>: cada vídeo lista os seus (nível de zoom dos tiles Web
// Mercator + a caixa em graus) e o script de tiles do vídeo baixa e costura cada um numa
// imagem só. O script arredonda a caixa para tiles inteiros; `mosaico()` faz a MESMA conta,
// então o globo sabe exatamente onde a imagem cai.
// ---------------------------------------------------------------------------

export type Recorte = { id: string; z: number; oeste: number; sul: number; leste: number; norte: number };

const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

// A faixa de tiles de um recorte (inclusiva), a mesma para o script e para o globo.
export const faixaDeTiles = (r: Recorte) => {
  const n = 2 ** r.z;
  const x0 = Math.max(0, tileX(r.oeste, r.z));
  const x1 = Math.min(n - 1, tileX(r.leste - 1e-9, r.z));
  const y0 = Math.max(0, tileY(r.norte, r.z));
  const y1 = Math.min(n - 1, tileY(r.sul, r.z));
  return { x0, x1, y0, y1 };
};

// O recorte como o globo o lê; `pasta` = onde o script de tiles grava (public/<pasta>/sat-<id>.jpg).
export const mosaico = (r: Recorte, pasta: string): Mosaico => {
  const { x0, x1, y0, y1 } = faixaDeTiles(r);
  const n = 2 ** r.z;
  return { id: r.id, src: `${pasta}/sat-${r.id}.jpg`, caixa: [x0 / n, y0 / n, (x1 + 1) / n, (y1 + 1) / n], z: r.z };
};
