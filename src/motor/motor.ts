import { FPS } from "../tema";

// ---------------------------------------------------------------------------
// O motor da série: CONTEÚDO (dados de cada vídeo) separado da APRESENTAÇÃO (as cenas).
//
// Um vídeo é uma lista de cenas. Cada cena diz o que o narrador fala, os textos da tela,
// os momentos (cues) em quadros e, para cada cue, a PALAVRA da narração em que ele
// acontece. Quando existe a narração transcrita, a voz manda: cada cena dura o que a fala
// dela dura e cada texto entra na palavra dele. Sem narração, valem os segundos e os
// quadros escritos nos dados.
// ---------------------------------------------------------------------------

export type Ancora = { palavra: string; vez?: number; ajuste?: number; minimo?: number };

export type DadosCena = {
  id: string;
  // O que o narrador diz nesta cena (e a intenção, que vai como direção para a voz).
  narracao: string;
  entonacao?: string;
  // Duração sem narração, em segundos.
  segundos: number;
  // Com narração: o mínimo que a animação precisa (quadros) e a respiração antes/depois.
  minimo?: number;
  lead?: number;
  tail?: number;
  textos: Record<string, string>;
  cues: Record<string, number>;
  sync?: Record<string, Ancora>;
};

export type Analise = {
  tema: string;
  gancho: string;
  tipoDeGancho: string;
  gatilho: string;
  emocao: string;
  pergunta: string;
  surpresa: string;
  cta: string;
  ritmo: string;
};

export type DadosVideo = {
  numero: string;
  composicao: string;
  titulo: string;
  analise: Analise;
  // Como o narrador deve soar NESTE vídeo (a voz é a mesma da série). `andamento` é a
  // aceleração da fala no npm run narrar (padrão 1,15); o ANDAMENTO do ambiente ainda manda.
  narrador: { energia: string; andamento?: number };
  cenas: DadosCena[];
};

export type Palavra = { texto: string; em: number; ate: number };
// `colada`: o corte que abre esta fatia caiu em cima de som, porque a voz emendou as
// duas frases sem pausar. Quem marca é o scripts/narracao.py, medindo o áudio.
export type Trecho = { de: number; ate: number; palavras: Palavra[]; colada?: boolean };
export type Manifesto = { arquivo: string; cenas: Record<string, Trecho> };

export type CenaPronta = {
  id: string;
  inicio: number;
  duracao: number;
  lead: number;
  // Onde a fala é contínua, a fatia não leva rampa: ela emenda direto na vizinha.
  rampa: { inicio: boolean; fim: boolean };
  textos: Record<string, string>;
  cues: Record<string, number>;
  trecho: Trecho | null;
};

export type VideoPronto = { dados: DadosVideo; cenas: CenaPronta[]; total: number; arquivo: string; narrado: boolean };

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();

// O whisper escreve números em algarismo e às vezes come uma letra do fim da palavra.
const NUMEROS: Record<string, string> = {
  um: "1",
  uma: "1",
  dois: "2",
  tres: "3",
  cinco: "5",
  seis: "6",
  quatro: "4",
  sete: "7",
  oito: "8",
  nove: "9",
  dez: "10",
  onze: "11",
  doze: "12",
  vinte: "20",
  trinta: "30",
  quarenta: "40",
  cinquenta: "50",
  oitenta: "80",
  cem: "100",
  mil: "1000",
  zero: "0",
};

const casa = (texto: string, alvo: string) => {
  const t = normalizar(texto);
  return t.startsWith(alvo) || (t.length >= 4 && alvo.startsWith(t)) || NUMEROS[alvo] === t || (NUMEROS[alvo] !== undefined && t.startsWith(NUMEROS[alvo]));
};

// Em que quadro da cena a palavra é dita, ou null.
export function quadroDaPalavra(trecho: Trecho, lead: number, palavra: string, vez = 0): number | null {
  const alvo = normalizar(palavra);
  const achada = trecho.palavras.filter((p) => casa(p.texto, alvo))[vez];
  return achada ? lead + Math.round((achada.em - trecho.de) * FPS) : null;
}

// O quadro absoluto de um momento de uma cena — para pendurar um efeito sonoro nele.
export function quadroDoCue(video: VideoPronto, cena: string, cue: string, ajuste = 0): number {
  const c = video.cenas.find((x) => x.id === cena);
  if (!c) return 0;
  return Math.max(0, c.inicio + (c.cues[cue] ?? 0) + ajuste);
}

export function montarVideo(dados: DadosVideo, manifesto: Manifesto): VideoPronto {
  const narrado = Object.keys(manifesto.cenas).length > 0;
  let t = 0;
  const cenas = dados.cenas.map((c, i) => {
    const trecho = manifesto.cenas[c.id] ?? null;
    const seguinte = dados.cenas[i + 1] ? manifesto.cenas[dados.cenas[i + 1].id] : undefined;
    // Respiro só onde a voz respirou. Se o corte caiu em cima de som, a fatia emenda
    // direto na vizinha e o áudio sai idêntico à tomada — sem pausa inventada no meio da
    // frase, que é o que faz o áudio travar.
    const lead = trecho?.colada ? 0 : (c.lead ?? (i === 0 ? 0 : 4));
    const tail = seguinte?.colada ? 0 : (c.tail ?? 4);
    const duracao = trecho
      ? Math.max(c.minimo ?? 60, lead + Math.ceil((trecho.ate - trecho.de) * FPS) + tail)
      : Math.round(c.segundos * FPS);
    const cues: Record<string, number> = { ...c.cues };
    if (trecho) {
      for (const [chave, a] of Object.entries(c.sync ?? {})) {
        const q = quadroDaPalavra(trecho, lead, a.palavra, a.vez ?? 0);
        if (q !== null) cues[chave] = Math.max(a.minimo ?? -Infinity, q + (a.ajuste ?? 0));
      }
    }
    const pronta: CenaPronta = {
      id: c.id,
      inicio: t,
      duracao,
      lead,
      rampa: { inicio: !trecho?.colada, fim: !seguinte?.colada },
      textos: c.textos,
      cues,
      trecho,
    };
    t += duracao;
    return pronta;
  });
  return { dados, cenas, total: t, arquivo: manifesto.arquivo, narrado };
}

// Para a conferência: as âncoras que não acharam a palavra na voz.
export function ancorasPerdidas(dados: DadosVideo, manifesto: Manifesto) {
  const perdidas: string[] = [];
  for (const c of dados.cenas) {
    const trecho = manifesto.cenas[c.id];
    if (!trecho) continue;
    for (const [chave, a] of Object.entries(c.sync ?? {})) {
      if (quadroDaPalavra(trecho, 0, a.palavra, a.vez ?? 0) === null) perdidas.push(`${c.id}.${chave}:"${a.palavra}"`);
    }
  }
  return perdidas;
}
