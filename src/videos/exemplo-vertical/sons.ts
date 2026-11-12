import type { Som } from "../../kit";
import { CENA01, CENA02, CENA03, CENA04, CENA05, CENA06, CENA07, CENA08, CENA09, CENA10, CENA11, CENA12, CENA13, CENA14, CENA15, CENA16, CENA17, CENA18 } from "./roteiro";

// ---------------------------------------------------------------------------
// Os EFEITOS (quadros de 30, como toda a decupagem; o index converte para os 60 fps do vídeo): o canal quase não usa — um whoosh no gancho e nos mergulhos/recuos grandes, nada
// de "pop" em rótulo nem clique de digitação (references/audio.md §3). Mesmos arquivos dos
// outros vídeos (public/audio/sfx, Mixkit). `no(quadro, …)` faz o PICO do arquivo cair no
// quadro (picos medidos). O acabamento do "Alagoas": whoosh curto no chicote de cada foto, o
// clique de câmera quando ela assenta (e em cada corte seco entre fotos).
// ---------------------------------------------------------------------------

// Só efeitos "de edição" (whoosh, clique, tique, transição). Tirados a pedido do usuário (2026-10-09)
// os que soavam como piano/pássaro: pino e reveal (tonais, nota definida), shimmer (carrilhão), mar e
// rio (gravações de natureza, com pássaros ao fundo).
const PICO: Record<string, number> = { bigzoom: 0.47, zoom: 1.08, transition: 0.91, pan: 0.18, photo: 0.06, marker: 0.03, tique: 0.01 };
// o pico no meio do voo (a curva VOO acelera até ~60%)
const auge = ([a, b]: readonly [number, number]) => Math.round(a + 0.6 * (b - a));
const no = (em: number, nome: string, volume: number, motivo: string): Som => ({ quadro: Math.max(0, Math.round(em - (PICO[nome] ?? 0) * 30)), arquivo: `audio/sfx/${nome}.wav`, volume, motivo });

// a foto entra por chicote (whoosh no meio do arrasto, clique quando assenta) e sai por chicote
const fotoEntra = (entra: number, motivo: string): Som[] => [no(entra + 5, "pan", 0.13, `entra a foto: ${motivo}`), no(entra + 9, "photo", 0.12, `assenta: ${motivo}`)];
const fotoSai = (sai: number, motivo: string): Som => no(sai + 5, "pan", 0.08, `sai a foto: ${motivo}`);
const corte = (em: number, motivo: string): Som => no(em, "photo", 0.12, `corte seco: ${motivo}`);
// o ícone pousa ~10 quadros depois de entrar; o pino cai em ~5
const marca = (em: number, motivo: string): Som => no(em, "marker", 0.07, motivo);
// (sem "tique" por pino nem por bandeira: em sequência vira chiado sobre a voz — pedido do usuário)

export const SONS: Som[] = [
  // ===== 01 — o gancho =====
  no(auge(CENA01.mergulho), "bigzoom", 0.22, "mergulho até o rio (\"O maior rio…\")"),
  no(CENA01.rio[0] + 6, "transition", 0.08, "o rio corre"),
  no(CENA01.amazonas + 1, "transition", 0.11, "o Amazonas acende"),
  no(CENA01.ponte + 1, "transition", 0.12, "NENHUMA PONTE"),
  marca(CENA01.ponte + 15, "o proibido pousa ao lado do NENHUMA"),
  no(CENA01.estado + 4, "transition", 0.11, "a bandeira abre no Amazonas"),
  ...fotoEntra(CENA01.teatro, "Teatro Amazonas"),
  // (as fotos do gancho trocam em CORTE SECO no cartão de fundo desfocado: o clique de câmera em cada corte)
  corte(CENA01.praias, "Ponta Negra"),
  corte(CENA01.cachoeiras, "Cachoeira de Iracema"),
  fotoSai(CENA01.fotoSai, "de volta ao mapa"),
  // ===== 02 — as divisas =====
  no(auge(CENA02.regiao), "zoom", 0.1, "recuo até a Região Norte"),
  no(CENA02.norte + 3, "transition", 0.08, "a Região Norte acende"),
  no(auge(CENA02.divisa), "zoom", 0.1, "recuo até os vizinhos e os países"),
  // ===== 03 — os números e Manaus =====
  no(auge(CENA03.volta), "zoom", 0.1, "volta ao estado"),
  marca(CENA03.municipios + 4, "painel 62"),
  marca(CENA03.milhoes + 4, "painel habitantes"),
  marca(CENA03.metade + 4, "painel 53%"),
  no(auge(CENA03.mergulho), "bigzoom", 0.2, "mergulho em Manaus"),
  ...fotoEntra(CENA03.manaus + 2, "a foto de Manaus"),
  fotoSai(CENA04.inicio, "cartão de Manaus"),
  // ===== 04 — como se chega =====
  no(auge(CENA04.recuo), "zoom", 0.12, "recuo de Manaus"),
  marca(CENA04.aventura + 4, "tag UMA AVENTURA"),
  no(CENA04.aviao[0] + 6, "pan", 0.12, "o avião passa"),
  no(CENA04.barco[0] + 6, "pan", 0.09, "o barco sobe o rio"),
  no(auge(CENA04.voo), "zoom", 0.12, "voo até a BR-319"),
  no(CENA04.estrada[0] + 4, "transition", 0.07, "a estrada se desenha"),
  marca(CENA04.br319 + 8, "escudo BR-319"),
  ...fotoEntra(CENA04.terra, "a BR-319 de terra"),
  // ===== 05 — a borracha =====
  fotoSai(CENA05.voo[0], "cartão da estrada"),
  no(auge(CENA05.voo), "bigzoom", 0.16, "voo ao centro de Manaus (o cinza)"),
  ...fotoEntra(CENA05.borracha, "o seringueiro"),
  marca(CENA05.paris + 4, "tag PARIS DOS TRÓPICOS"),
  corte(CENA05.teatro, "o Teatro à noite"),
  // ===== 06 — as sementes =====
  fotoSai(CENA06.recuo[0], "cartão do Teatro"),
  no(auge(CENA06.recuo), "bigzoom", 0.2, "recuo até o mundo"),
  marca(CENA06.ingles + 5, "Londres"),
  no(CENA06.rota1[0] + 8, "pan", 0.1, "a semente cruza o Atlântico"),
  marca(CENA06.sementes + 4, "painel 70.000"),
  no(CENA06.rota2[0] + 8, "pan", 0.1, "a semente vai à Ásia"),
  marca(CENA06.asia + 8, "as árvores na Ásia"),
  no(CENA06.acabou + 1, "transition", 0.12, "E A RIQUEZA ACABOU"),
  // ===== 07 e 08 — a Zona Franca, o Mercado e a Ponta Negra =====
  no(auge(CENA07.mergulho), "bigzoom", 0.22, "mergulho de volta a Manaus (a cor volta)"),
  ...fotoEntra(CENA07.zonaFranca, "o Polo Industrial"),
  marca(CENA07.moto + 4, "tag QUASE TODA MOTO"),
  corte(CENA08.mercado, "o Mercado"),
  corte(CENA08.pontaNegra, "a Ponta Negra"),
  // ===== 09 — o Encontro das Águas =====
  fotoSai(CENA09.voo[0] + 6, "cartão da cidade"),
  no(auge(CENA09.voo), "zoom", 0.14, "voo até o Encontro"),
  ...fotoEntra(CENA09.foto, "o Encontro do alto"),
  fotoSai(CENA09.recuo[0], "cartão do Encontro"),
  no(auge(CENA09.recuo), "zoom", 0.14, "recuo: o Rio Amazonas"),
  // ===== 10 — a virada =====
  no(auge(CENA10.recuo), "zoom", 0.12, "recuo até o estado"),
  no(CENA10.impacto + 1, "transition", 0.12, "SAINDO DE MANAUS"),
  // ===== 11 a 15 — os lugares =====
  no(auge(CENA11.voo), "bigzoom", 0.18, "mergulho no Janauari"),
  ...fotoEntra(CENA11.janauari, "as vitórias-régias"),
  marca(CENA11.metros + 4, "tag 2 METROS"),
  fotoSai(CENA12.voo[0], "cartão do Janauari"),
  no(auge(CENA12.voo), "zoom", 0.13, "voo até as Anavilhanas"),
  no(CENA12.anavilhanas + 2, "transition", 0.08, "o parque acende"),
  ...fotoEntra(CENA12.anavilhanas, "Anavilhanas"),
  marca(CENA12.ilhas + 4, "tag 400 ILHAS"),
  corte(CENA12.botos, "o boto"),
  fotoSai(CENA13.voo[0] + 10, "cartão das Anavilhanas"),
  no(auge(CENA13.voo), "zoom", 0.13, "voo até Presidente Figueiredo"),
  ...fotoEntra(CENA13.figueiredo, "a Cachoeira do Santuário"),
  marca(CENA13.cem + 4, "tag 100 CACHOEIRAS"),
  corte(CENA13.grutas, "a Caverna do Maroaga"),
  fotoSai(CENA14.voo[0] + 10, "cartão de Presidente Figueiredo"),
  no(auge(CENA14.voo), "zoom", 0.14, "voo até Parintins"),
  marca(CENA14.ilha + 4, "tag ILHA"),
  ...fotoEntra(CENA14.festival, "o Garantido"),
  corte(CENA14.fotoCaprichoso, "o Caprichoso"),
  fotoSai(CENA14.fim, "cartão de Parintins"),
  no(auge(CENA15.voo), "zoom", 0.12, "voo até Maués"),
  ...fotoEntra(CENA15.guarana, "o guaraná"),
  marca(CENA15.olho + 4, "tag PARECE UM OLHO"),
  // ===== 16 — os povos =====
  fotoSai(CENA16.recuo[0], "cartão de Maués"),
  no(auge(CENA16.recuo), "zoom", 0.12, "recuo até o estado"),
  ...fotoEntra(CENA16.indigenas + 2, "o povo Tikuna"),
  marca(CENA16.numero + 4, "painel 490.854"),
  fotoSai(CENA16.voo[0], "cartão dos povos"),
  no(auge(CENA16.voo), "zoom", 0.12, "voo até o Javari"),
  no(CENA16.javari + 2, "transition", 0.09, "o Javari acende"),
  // ===== 17 — o Pico da Neblina =====
  no(auge(CENA17.voo), "bigzoom", 0.18, "voo até o Pico da Neblina"),
  ...fotoEntra(CENA17.neblina, "o Pico da Neblina"),
  marca(CENA17.metros + 4, "tag 2.995 METROS"),
  // ===== 18 — o fecho =====
  fotoSai(CENA18.recuo[0], "cartão do pico"),
  no(auge(CENA18.recuo), "zoom", 0.12, "recuo até o estado"),
  marca(CENA18.encontro + 10, "janelinha do Encontro"),
  marca(CENA18.neblina + 10, "janelinha do pico"),
  // (as outras quatro pousam em sequência: um whoosh só, nada de clique por janela — vira chiado sobre a voz)
  no(CENA18.neblina + 20, "pan", 0.08, "as outras janelinhas pousam"),
  no(auge(CENA18.volta), "bigzoom", 0.18, "recuo até o Brasil"),
  no(CENA18.qual + 1, "transition", 0.12, "a pergunta"),
];
