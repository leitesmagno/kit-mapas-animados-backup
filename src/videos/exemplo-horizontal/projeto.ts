import { MARCA } from "../../marca";
import type { ProjetoNarrado } from "../../motor/projeto";
import falas from "./falas.json";

// ---------------------------------------------------------------------------
// "ESTREITO DE ORMUZ": o DOCUMENTÁRIO HORIZONTAL (16:9, YouTube), no estilo Mapas Animados
// traduzido para o formato longo (.claude/skills/mapas-animados, references/horizontal-longo.md). 32 falas em 8 capítulos, ~8 min.
//
// O TEXTO está em falas.json (um arquivo só para a voz, a sincronia e a revisão). As palavras
// entre [colchetes] são os GATILHOS das animações: o sincronizar acha cada uma na fala e grava
// o evento "NN.palavra" (ex.: "04.ira"); aqui os colchetes saem antes de ir para a voz.
// Cada número tem fonte no DATA_SOURCES.md. Pesquisa feita em 14–16/10/2026.
//
//   npm run narrar -- exemplo-horizontal   gera as falas que faltam (bruto/ nunca é sobrescrito)
//   npm run sincronizar -- exemplo-horizontal   Whisper → narracao/transcript.json, eventos.json, cenas.json
// ---------------------------------------------------------------------------

export type FalaDoRoteiro = { id: string; capitulo: string; texto: string; pausaDepois?: number };
export const FALAS_DO_ROTEIRO = falas as FalaDoRoteiro[];
export const semMarcas = (t: string) => t.replace(/\[([^\]]+)\]/g, "$1");

export const PROJETO: ProjetoNarrado = {
  titulo: "Estreito de Ormuz",
  destino: "Ormuz",
  pastaDoAudio: "audios/narracao/exemplo-horizontal",
  voz: {
    // a voz do marca.json; sem ela, a "Roger" da biblioteca da ElevenLabs, no andamento natural
    id: MARCA.voz.elevenlabsVozId || "CwhRBWXzGAHq8TQ4Fs17",
    nome: MARCA.voz.elevenlabsVozNome || "Roger",
    modelo: "eleven_multilingual_v2",
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0,
    speakerBoost: true,
    speed: 1.0,
    formato: "mp3_44100_128",
  },
  tratamento: {
    limiarDb: -42,
    pausaCurta: 0.15,
    compressao: 0.25,
    pausaMaxima: 0.45,
    pontas: 0.04,
    lufs: -14,
    andamento: 1.0,
  },
  inicio: 0.4,
  pausaEntreCenas: 0.42,
  cenas: FALAS_DO_ROTEIRO.map((f) => ({ id: f.id, titulo: f.capitulo, texto: semMarcas(f.texto), pausaDepois: f.pausaDepois })),
};
