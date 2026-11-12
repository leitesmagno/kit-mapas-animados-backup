// ---------------------------------------------------------------------------
// O PROJETO NARRADO: a configuração central de um vídeo com voz gerada (ElevenLabs). Um
// arquivo `projeto.ts` por vídeo descreve o título, a voz, o tratamento dos silêncios e as
// cenas (o texto de cada fala) — e os scripts genéricos fazem o resto:
//
//   scripts/narracao/elevenlabs.ts   gera cada fala (bruta), nunca sobrescreve sem REFAZER=1
//   scripts/silencios.py             encurta os silêncios longos, mantém as pausas curtas
//   scripts/narracao/sincronizar.py  Whisper → palavras, frases e eventos por cena
//
// Vídeo novo (Ceará, Bahia, Maranhão…) = copiar o projeto.ts, trocar o texto e as cenas.
// Este arquivo é lido pelo Remotion (navegador) e pelos scripts (Node): nada de process.env
// aqui. A chave da API vem SÓ do .env (ELEVENLABS_API_KEY), lida pelo script.
// ---------------------------------------------------------------------------

export type ConfigDeVoz = {
  // o id da voz na ElevenLabs (não é segredo); a variável VOZ_ID do ambiente tem prioridade
  id: string;
  nome: string; // só para os logs e o README
  modelo: "eleven_multilingual_v2" | (string & {});
  stability: number;
  similarityBoost: number;
  style: number;
  speakerBoost: boolean;
  speed: number; // 0,7–1,2; 1 = a velocidade natural da voz
  formato: string; // output_format da API
};

// Como os silêncios da fala bruta são tratados (scripts/silencios.py). Pausa em segundos.
export type TratamentoDoAudio = {
  limiarDb: number; // abaixo disso é silêncio (a respiração fica ACIMA: não é cortada)
  pausaCurta: number; // até aqui a pausa fica inteira (vírgula, respiração)
  compressao: number; // acima da curta, cada segundo a mais vira `compressao` segundo
  pausaMaxima: number; // e nenhuma pausa no meio da fala passa disto
  pontas: number; // silêncio que sobra no começo e no fim de cada arquivo
  lufs: number; // nível final (−16 = TikTok/Reels/Shorts)
  // a fala inteira mais rápida (1,07 = 7%), sem mudar o tom (atempo, depois dos cortes); 1 = como veio
  andamento?: number;
};

export type FalaDaCena = {
  id: string; // "cena-01" — o nome do arquivo de áudio
  titulo: string; // "O gancho"
  texto: string; // o que a voz fala (pausas naturais: vírgula, reticências, ponto)
  pausaDepois?: number; // respiro entre esta fala e a próxima, no vídeo (s)
  // REAPROVEITAR um áudio já gravado em vez de gerar outro: o bruto de outra fala (sem .mp3)
  // e o andamento (1,1 = 10% mais rápido, sem mudar o tom — atempo/WSOLA)
  // `recorte` = só um trecho do bruto (s), para aproveitar uma frase de dentro de outra fala
  reaproveita?: { bruto: string; andamento?: number; recorte?: [number, number] };
};

export type ProjetoNarrado = {
  titulo: string;
  destino: string;
  pastaDoAudio: string; // dentro de public/
  voz: ConfigDeVoz;
  tratamento: TratamentoDoAudio;
  inicio: number; // s de imagem antes da primeira palavra
  pausaEntreCenas: number; // s (padrão de pausaDepois)
  cenas: FalaDaCena[];
};
