// O SATÉLITE de um vídeo: simula a câmera do roteiro.ts quadro a quadro e baixa só os tiles que
// aparecem (NASA Blue Marble de longe, EOxCloudless 2016 de perto). Rode depois de fechar a câmera,
// e de novo sempre que mexer nela.
//
//   npm run tiles -- exemplo-vertical
//   REFAZER=9,10 npm run tiles -- exemplo-vertical     (compõe de novo esses níveis)
//
// O roteiro.ts do vídeo exporta PASTA_TILES, CHAVES, DERIVA, DURACAO, LARGURA, ALTURA e, se quiser,
// AREA_DE_PERTO ([oeste, sul, leste, norte] onde entra o satélite de perto), ZOOM_MAX_TILES e
// FPS/FPS_DO_VIDEO (a 60 fps a câmera é simulada de meio em meio quadro).
import { baixarSatelite } from "./satelite/tiles";

const pasta = process.argv[2];
if (!pasta) {
  console.error("uso: npm run tiles -- <pasta do vídeo em src/videos/>");
  process.exit(1);
}
const r = await import(`../src/videos/${pasta}/roteiro.ts`);
const passo = r.FPS_DO_VIDEO && r.FPS && r.FPS_DO_VIDEO > r.FPS ? r.FPS / r.FPS_DO_VIDEO : 1;
await baixarSatelite({
  pasta: r.PASTA_TILES,
  chaves: r.CHAVES,
  deriva: r.DERIVA ?? 0,
  duracao: r.DURACAO,
  largura: r.LARGURA,
  altura: r.ALTURA,
  eoxArea: r.AREA_DE_PERTO ?? [-180, -85, 180, 85],
  zoomMax: r.ZOOM_MAX_TILES,
  passo,
});
