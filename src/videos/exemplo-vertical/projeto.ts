import { MARCA } from "../../marca";
import type { ProjetoNarrado } from "../../motor/projeto";

// ---------------------------------------------------------------------------
// O EXEMPLO VERTICAL do kit: "Amazonas" (o maior rio do mundo sem uma única ponte; Manaus, a borracha
// e a Zona Franca; o Encontro das Águas; os lugares; os povos; o Pico da Neblina) no estilo Mapas
// Animados, com a estrutura que funciona: gancho → o que ele guarda → divisas → números → capital →
// história → lugares → povos → fecho → pergunta. COPIE esta pasta para fazer um vídeo novo.
// Números por extenso (a ElevenLabs às vezes lê algarismos em inglês). Cada número tem fonte no
// DATA_SOURCES.md. Os <break> dão tempo às fotos.
//
//   npm run narrar -- exemplo-vertical          gera as falas que ainda não existem (bruto/)
//   npm run narrar -- exemplo-vertical am-01    só uma
//   REFAZER=1 npm run narrar -- exemplo-vertical  gera de novo (a anterior vai para bruto/anteriores/)
//   TRATAR=1 npm run narrar -- exemplo-vertical  só refaz o tratamento (bruto → am-NN.mp3), sem API
//   npm run sincronizar -- exemplo-vertical     Whisper → narracao/transcript.json, eventos.json, cenas.json
// ---------------------------------------------------------------------------

export const PROJETO: ProjetoNarrado = {
  titulo: "Amazonas",
  destino: "Amazonas",
  pastaDoAudio: "audios/narracao/exemplo-vertical",
  voz: {
    // a voz do marca.json (escolhida na configuração); sem ela, a "Roger" da biblioteca da ElevenLabs
    id: MARCA.voz.elevenlabsVozId || "CwhRBWXzGAHq8TQ4Fs17",
    nome: MARCA.voz.elevenlabsVozNome || "Roger",
    modelo: "eleven_multilingual_v2",
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0,
    speakerBoost: true,
    speed: 1.04,
    formato: "mp3_44100_128",
  },
  tratamento: {
    limiarDb: -42,
    pausaCurta: 0.15,
    compressao: 0.2,
    pausaMaxima: 0.26,
    pontas: 0.04,
    lufs: -16,
    // a voz acelerada a 1,14× (o vídeo fica em ~1:50)
    andamento: 1.14,
  },
  inicio: 0.05,
  pausaEntreCenas: 0.16,
  cenas: [
    { id: "am-01", titulo: "O gancho", texto: "O maior rio do mundo atravessa o Amazonas inteiro. E não existe uma única ponte sobre ele." },
    {
      id: "am-02",
      titulo: "O que ele guarda",
      texto: 'E o maior estado do Brasil ainda guarda um teatro de ópera no meio da selva, <break time="0.45s" /> praias de rio <break time="0.45s" /> e cachoeiras escondidas na mata.',
    },
    { id: "am-03", titulo: "As divisas", texto: "Fica no Norte, faz divisa com Roraima, Pará, Mato Grosso, Rondônia e Acre, e fronteira com a Venezuela, a Colômbia e o Peru." },
    { id: "am-04", titulo: "Os números", texto: "São sessenta e dois municípios e mais de quatro milhões de pessoas. Metade vive em Manaus, a maior cidade do Norte." },
    {
      id: "am-05",
      titulo: "Como se chega",
      texto: "E chegar lá é uma aventura: quase todo mundo vai de avião ou de barco. Por terra, a BR trezentos e dezenove tem centenas de quilômetros de terra no meio da floresta.",
    },
    { id: "am-06", titulo: "A borracha", texto: "No auge da borracha, Manaus era chamada de Paris dos Trópicos, e ergueu o Teatro Amazonas com peças trazidas da Europa." },
    { id: "am-07", titulo: "As sementes", texto: "Até que um inglês levou setenta mil sementes de seringueira, que viraram plantações na Ásia. E a riqueza acabou." },
    { id: "am-08", titulo: "A Zona Franca", texto: "Décadas depois veio a Zona Franca. Hoje, quase toda moto fabricada no Brasil sai de Manaus." },
    { id: "am-09", titulo: "Manaus", texto: 'Na cidade, ainda tem o Mercado Adolpho Lisboa <break time="0.4s" /> e a Praia da Ponta Negra.' },
    {
      id: "am-10",
      titulo: "O Encontro das Águas",
      texto: "Em frente, o Negro, escuro, encontra o Solimões, barrento, e eles correm quilômetros sem se misturar. Juntos, viram o Rio Amazonas.",
      // a virada pede o respiro maior do vídeo
      pausaDepois: 0.5,
    },
    { id: "am-11", titulo: "A virada", texto: "Mas é saindo de Manaus que o Amazonas impressiona." },
    { id: "am-12", titulo: "Janauari", texto: "No Lago Janauari, as vitórias-régias passam de dois metros." },
    { id: "am-13", titulo: "Anavilhanas", texto: "Em Novo Airão, as Anavilhanas formam um labirinto de quatrocentas ilhas, com botos-cor-de-rosa." },
    { id: "am-14", titulo: "Presidente Figueiredo", texto: "Presidente Figueiredo tem mais de cem cachoeiras e grutas no meio da mata." },
    { id: "am-15", titulo: "Parintins", texto: "Em Parintins, uma ilha no meio do rio, o Festival dos Bois divide a cidade entre Garantido e Caprichoso." },
    { id: "am-16", titulo: "Maués e o guaraná", texto: "Em Maués nasceu o guaraná. Para os Sateré-Mawé, ele brotou dos olhos de um menino, e por isso parece um olho." },
    {
      id: "am-17",
      titulo: "Os povos",
      texto: "O Amazonas tem mais indígenas que qualquer estado: mais de quatrocentos e noventa mil. E no Vale do Javari vivem povos isolados até hoje.",
    },
    { id: "am-18", titulo: "O Pico da Neblina", texto: "No extremo norte, o Pico da Neblina é o teto do Brasil, com quase três mil metros." },
    { id: "am-19", titulo: "O fecho", texto: "Do encontro das águas ao Pico da Neblina, o Amazonas é cheio de lugares para descobrir." },
    { id: "am-20", titulo: "A pergunta", texto: "Qual desses lugares você já conhecia?" },
  ],
};
