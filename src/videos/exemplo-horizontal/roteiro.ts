import { montarDocumentario } from "../../kit/documentario";
import type { FalaNoTempo } from "../../motor/documentario";
import { FORMATOS } from "../../motor/formato";
import { CAPITULOS, CENAS, FONTES, PUBLICACAO } from "./cenas";
import eventosJson from "./narracao/eventos.json";
import legendaJson from "./narracao/legenda.json";
import transcript from "./narracao/transcript.json";

// ---------------------------------------------------------------------------
// A MONTAGEM do documentário: a NARRAÇÃO é o relógio (como nos verticais). As cenas estão
// declaradas em cenas.ts; o motor (src/kit/documentario) resolve cada batida no quadro da palavra
// dela (narracao/eventos.json, `npm run sincronizar -- exemplo-horizontal`), monta a câmera (voos + deriva linear)
// e confere tudo contra o áudio real: se uma frase for cortada ou faltar um evento, PROBLEMAS
// lista o que é e o index para o render. Trocou a narração? Rode o sincronizar e tudo se reajusta.
// ---------------------------------------------------------------------------

export const FPS = 30;
export const LARGURA = FORMATOS.horizontal.largura;
export const ALTURA = FORMATOS.horizontal.altura;
export const PASTA_TILES = "satelite/exemplo-horizontal";
// a deriva senoidal fica DESLIGADA (o balanço fazia o mapa "tremer"): a câmera anda
// pelo avanço linear entre as paradas. O script de tiles usa ESTE valor.
export const DERIVA = 0;
// onde o satélite de perto (EOX) entra por cima da NASA: oeste, sul, leste, norte
export const AREA_DE_PERTO: [number, number, number, number] = [36, 18, 64, 34];

// as falas no tempo REAL (o arquivo de cada uma e onde ele cai no vídeo)
export const FALAS: FalaNoTempo[] = transcript.audios.map((a) => ({
  id: a.arquivo.split("/").pop()!.replace(".mp3", ""),
  inicio: a.inicio,
  fim: a.inicio + a.duracao,
}));
export const FALAS_NO_VIDEO = transcript.audios.map((a) => ({ arquivo: a.arquivo, inicio: a.inicio }));
// a legenda: o tempo do Whisper com a GRAFIA do roteiro (scripts/narracao/falas.py)
export const PALAVRAS = legendaJson as { palavra: string; inicio: number; fim: number }[];

const M = montarDocumentario({
  titulo: "Estreito de Ormuz: o corredor de água que parou o petróleo do mundo",
  publicacao: PUBLICACAO,
  capitulos: CAPITULOS,
  fontes: FONTES,
  cenas: CENAS,
  falas: FALAS,
  eventos: eventosJson.eventos,
  fps: FPS,
  largura: LARGURA,
  altura: ALTURA,
  // a vinheta final fica na tela depois da última palavra (o lugar da tela final do YouTube)
  cauda: 7,
});

export const DOC = M.doc;
export const CHAVES = M.chaves;
export const BATIDAS = M.batidas;
export const CAPITULOS_NA_TELA = M.capitulos;
export const DURACAO = M.duracao;
export const PROBLEMAS = M.problemas;
export const AVISOS = M.avisos;
// onde a vinheta final começa (a legenda some ali: a vinheta tem o texto dela)
export const INICIO_DA_CARTELA = M.batidas.find((b) => b.tipo === "cartela")?.q0 ?? Infinity;
