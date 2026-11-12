import { cameraDoVideo, type Chave } from "../../base/geo/camera";
import { criarProjetor, type Caixa, type Camera, type LonLat } from "../../base/geo/projecao";
import { FORMATOS } from "../../motor/formato";
import {
  conferirDocumentario,
  type Afirmacao,
  type Capitulo,
  type CenaDoDocumentario,
  type Documentario,
  type FalaNoTempo,
  type Fonte,
  type Publicacao,
  type RecursoVisual,
  type Transicao,
} from "../../motor/documentario";
import type { NomeDoIcone } from "../assets";
import { enquadrarNaArea } from "../camera";
import type { EstiloDeRotulo } from "../horizontal/RotuloMapa";
import { AREA, cruzam, posicaoDoNome, tamanhoDoTexto, type Caixa as CaixaDeTela } from "./layout";

// ---------------------------------------------------------------------------
// O DOCUMENTÁRIO DECLARATIVO: cada cena é uma lista de BATIDAS (país pintado, nome digitado, rota,
// painel, ícone, imagem…) presas a PALAVRAS da narração, e uma lista de PARADAS da câmera. Daqui
// sai tudo: os quadros de cada batida, a câmera (voos + deriva linear), o Documentario para a
// conferência e a publicação. As camadas (Camadas.tsx) desenham com as peças do kit de sempre.
//
// Um momento é o nome de um evento da narração ("04.ira": a palavra [Irã] da fala 4, gerado pelo
// sincronizar a partir do falas.json), com um ajuste em segundos opcional: ["04.ira", -0.1].
// "@orm-20" é o começo da fala orm-20.
// ---------------------------------------------------------------------------

export type Momento = string | readonly [string, number];

// onde a câmera para: uma caixa geográfica encaixada na área do formato ("assunto" = os 2/3
// direitos, com o terço esquerdo livre para painel; "livre" = a tela toda acima da legenda), ou
// uma câmera pronta
export type VistaDoMapa = { caixa: Caixa; area?: "assunto" | "livre"; margem?: number } | { camera: Camera };
export type Parada = { em: Momento; vista: VistaDoMapa; voo?: number; rho?: number };

type Tempo = { entra: Momento; sai?: Momento | "fim" };
export type Batida =
  // `foco`: o país é o assunto da fala (no horizontal o resto do mapa escurece em volta dele)
  | ({ tipo: "pais"; iso: string; cor: string; bandeira?: string; opacidade?: number; foco?: boolean } & Tempo)
  | ({ tipo: "nome"; texto: string; ponto: LonLat; corpo?: number; cor?: string; ancora?: "centro" | "base" | "esquerda" | "direita"; seta?: boolean; dx?: number; dy?: number; estilo?: EstiloDeRotulo } & Tempo)
  | ({ tipo: "mar"; linhas: string[]; ponto: LonLat; corpo?: number } & Tempo)
  | ({ tipo: "rota"; linha: LonLat[]; chega: Momento; cor?: string; largura?: number; partida?: boolean } & Tempo)
  | ({ tipo: "circulo"; ponto: LonLat; raioKm: number; cor?: string } & Tempo)
  | ({ tipo: "painel"; numero: string; unidade?: string; rotulo?: string; icone?: NomeDoIcone; cor?: string; corpo?: number; x?: number; y?: number } & Tempo)
  | ({ tipo: "proporcao"; total: number; destaque: number; icone: NomeDoIcone; acende: Momento; cor?: string; tamanho?: number; x?: number; y?: number } & Tempo)
  // dx/dy: o motor preenche (ícone preso ao mapa nunca fica em cima de texto)
  | ({ tipo: "icone"; icone: NomeDoIcone; ponto?: LonLat; x?: number; y?: number; tamanho?: number; cor?: string; haste?: boolean; disco?: boolean; espelhar?: boolean; dx?: number; dy?: number } & Tempo)
  | ({ tipo: "impacto"; linhas: string[]; y?: number; corpo?: number } & Tempo)
  | ({ tipo: "data"; texto: string; rotulo?: string; cor?: string } & Tempo)
  | ({ tipo: "imagem"; id: string; foco?: string; sentido?: 1 | -1; zoom?: readonly [number, number]; deslize?: readonly [number, number] } & Tempo)
  // o título na tela (o do documentário, depois do gancho): título grande + subtítulo
  | ({ tipo: "titulo"; titulo: string; abaixo?: string } & Tempo)
  // a vinheta final (siga o canal, sino, like, compartilhe, comente + a pergunta), cada pedido na palavra dele
  | ({ tipo: "cartela"; siga: Momento; sino: Momento; like: Momento; compartilhe: Momento; comente: Momento; pergunta?: string; perguntaEm?: Momento } & Tempo);

export type CenaVisual = {
  id: string;
  capitulo: string;
  falas: string[]; // ids do falas.json, em ordem
  camera?: Parada[];
  batidas: Batida[];
  afirmacoes?: Afirmacao[];
};

// a batida com os quadros resolvidos (o que as camadas desenham)
export type BatidaNoTempo = Batida & { cena: string; q0: number; q1: number; qChega?: number; qAcende?: number; qCartela?: Record<"siga" | "sino" | "like" | "compartilhe" | "comente" | "pergunta", number> };

// a cartela de abertura de cada capítulo (a partir do 2º): "CAPÍTULO 02" + o título
export type CartelaDeCapitulo = { numero: number; titulo: string; entra: number; sai: number };

export type Montagem = {
  doc: Documentario;
  capitulos: CartelaDeCapitulo[];
  chaves: Chave[];
  batidas: BatidaNoTempo[];
  duracao: number;
  problemas: string[];
  avisos: string[];
};

const LINEAR = (t: number) => t;
const VOO = (t: number) => 1 - Math.pow(1 - t, 3.2);

export const montarDocumentario = (o: {
  titulo: string;
  publicacao?: Publicacao;
  capitulos: Capitulo[];
  fontes: Fonte[];
  cenas: CenaVisual[];
  falas: FalaNoTempo[]; // o áudio real (transcript.json)
  eventos: Record<string, { t: number }>; // narracao/eventos.json
  fps: number;
  largura?: number;
  altura?: number;
  cauda?: number; // s de mapa limpo depois da última palavra (a tela final do YouTube)
  cartelaDeCapitulo?: number; // s que a cartela de capítulo fica na tela (0 = sem cartelas)
  deriva?: number; // zoom por segundo entre os voos (≈ 0,025 = 1,7%/s)
}): Montagem => {
  const { fps } = o;
  const largura = o.largura ?? FORMATOS.horizontal.largura;
  const altura = o.altura ?? FORMATOS.horizontal.altura;
  const formato = largura >= altura ? FORMATOS.horizontal : FORMATOS.vertical;
  const problemas: string[] = [];
  const avisos: string[] = []; // não param o render (ex.: ícone sem lugar 100% livre)
  const inicioDaFala = new Map(o.falas.map((f) => [f.id, f.inicio]));
  const q = (m: Momento): number => {
    const [nome, ajuste] = typeof m === "string" ? [m, 0] : m;
    // "@orm-20" = o começo da fala orm-20 (para o que entra logo no início dela)
    if (nome.startsWith("@")) {
      const t = inicioDaFala.get(nome.slice(1));
      if (t === undefined) {
        problemas.push(`fala "${nome.slice(1)}" não está no áudio`);
        return 0;
      }
      return Math.round((t + ajuste) * fps);
    }
    const e = o.eventos[nome];
    if (!e) {
      problemas.push(`evento "${nome}" não está em narracao/eventos.json (palavra entre [colchetes] no falas.json?)`);
      return 0;
    }
    return Math.round((e.t + ajuste) * fps);
  };
  const porId = new Map(o.falas.map((f) => [f.id, f]));
  const ultimaFala = o.falas[o.falas.length - 1];
  const duracao = Math.round((ultimaFala.fim + (o.cauda ?? 6)) * fps);

  // os limites de cada cena: no meio do respiro entre a última fala dela e a primeira da próxima
  const limites = o.cenas.map((c, i) => {
    const prox = o.cenas[i + 1];
    if (!prox) return duracao;
    const a = porId.get(c.falas[c.falas.length - 1]);
    const b = porId.get(prox.falas[0]);
    if (!a || !b) return 0;
    return Math.round(((a.fim + b.inicio) / 2) * fps);
  });

  // as batidas no tempo
  const batidas: BatidaNoTempo[] = [];
  o.cenas.forEach((c, i) => {
    const fim = limites[i];
    for (const b of c.batidas) {
      const q0 = q(b.entra);
      const q1 = b.sai === undefined || b.sai === "fim" ? fim : q(b.sai);
      batidas.push({
        ...b,
        cena: c.id,
        q0,
        q1,
        qChega: b.tipo === "rota" ? q(b.chega) : undefined,
        qAcende: b.tipo === "proporcao" ? q(b.acende) : undefined,
        qCartela:
          b.tipo === "cartela"
            ? { siga: q(b.siga), sino: q(b.sino), like: q(b.like), compartilhe: q(b.compartilhe), comente: q(b.comente), pergunta: b.perguntaEm ? q(b.perguntaEm) : q(b.comente) }
            : undefined,
      });
    }
  });

  // AS CARTELAS DE CAPÍTULO (do 2º em diante): no começo da 1ª cena do capítulo. O que é de tela e
  // cairia durante a cartela (número, data, texto) entra logo depois dela.
  const duracaoDaCartela = Math.round((o.cartelaDeCapitulo ?? 2.4) * fps);
  const capitulos: CartelaDeCapitulo[] = duracaoDaCartela
    ? o.capitulos.slice(1).flatMap((cap, k) => {
        const i = o.cenas.findIndex((c) => c.capitulo === cap.id);
        if (i < 0) return [];
        const entra = (i ? limites[i - 1] : 0) + 4;
        return [{ numero: k + 2, titulo: cap.titulo, entra, sai: entra + duracaoDaCartela }];
      })
    : [];
  for (const c of capitulos) {
    for (const b of batidas) {
      const deTela = ["painel", "data", "proporcao", "impacto", "titulo"].includes(b.tipo) || (b.tipo === "icone" && !b.ponto);
      if (deTela && b.q0 >= c.entra - 6 && b.q0 < c.sai + 8) {
        const dur = b.q1 - b.q0;
        b.q0 = c.sai + 10;
        b.q1 = Math.max(b.q1, b.q0 + Math.min(dur, 45));
      }
    }
  }

  // UMA COISA DE CADA VEZ (o usuário reprovou texto entrando por cima de texto): no mesmo grupo, a
  // batida anterior começa a sair 10 quadros antes da próxima entrar. Grupos: "tela" (número, data,
  // proporção, impacto, ícone solto na tela) e "icone" (ícone preso ao mapa).
  const grupo = (b: BatidaNoTempo) =>
    ["painel", "data", "proporcao", "impacto", "titulo"].includes(b.tipo) || (b.tipo === "icone" && !b.ponto) ? "tela" : b.tipo === "icone" ? "icone" : null;
  for (const g of ["tela", "icone"]) {
    const doGrupo = batidas.filter((b) => grupo(b) === g).sort((a, b) => a.q0 - b.q0);
    doGrupo.forEach((b, i) => {
      const prox = doGrupo[i + 1];
      if (prox && b.q1 > prox.q0 - 10) b.q1 = Math.max(b.q0 + 12, prox.q0 - 10);
    });
  }

  // a câmera: as paradas em ordem → voo até cada uma e deriva linear entre elas
  const cam = (v: VistaDoMapa): Camera =>
    "camera" in v ? v.camera : enquadrarNaArea(v.caixa, v.area === "livre" ? formato.telaLivre : formato.areaDoAssunto, largura, altura, v.margem ?? 30);
  const paradas = o.cenas.flatMap((c) => (c.camera ?? []).map((p) => ({ ...p, quadro: q(p.em), cena: c.id })));
  paradas.sort((a, b) => a.quadro - b.quadro);
  const taxa = o.deriva ?? 0.025;
  const derivar = (c: Camera, quadros: number): Camera => ({ ...c, zoom: c.zoom + Math.min(0.14, (taxa * quadros) / fps) });
  const chaves: Chave[] = [];
  paradas.forEach((p, i) => {
    const alvo = cam(p.vista);
    if (i === 0) {
      chaves.push({ quadro: 0, camera: { ...alvo, zoom: alvo.zoom - Math.min(0.14, (taxa * p.quadro) / fps) } });
      if (p.quadro > 0) chaves.push({ quadro: p.quadro, camera: alvo, easing: LINEAR });
      return;
    }
    const ant = chaves[chaves.length - 1];
    const voo = Math.round((p.voo ?? 0.9) * fps);
    const inicio = Math.max(ant.quadro + 1, p.quadro - voo);
    if (inicio > ant.quadro + 1) chaves.push({ quadro: inicio, camera: derivar(ant.camera, inicio - ant.quadro), easing: LINEAR });
    chaves.push({ quadro: Math.max(inicio + 1, p.quadro), camera: alvo, easing: VOO, rho: p.rho ?? 1.3 });
  });
  if (chaves.length) {
    const ult = chaves[chaves.length - 1];
    if (ult.quadro < duracao) chaves.push({ quadro: duracao, camera: derivar(ult.camera, duracao - ult.quadro), easing: LINEAR });
  } else problemas.push("nenhuma parada de câmera");

  // ÍCONE NUNCA EM CIMA DE TEXTO: para cada ícone preso ao mapa, em três momentos da vida dele, as
  // caixas de todos os textos na tela (nomes, mares, destaque, letreiro, legenda, logo) com a
  // câmera de verdade; o ícone vai para o primeiro deslocamento que não encosta em nenhuma.
  if (chaves.length) {
    const projetarEm = (quadro: number) => criarProjetor(cameraDoVideo(chaves, quadro, largura, 0), largura, altura);
    const textosEm = (quadro: number, projetar: ReturnType<typeof criarProjetor>): CaixaDeTela[] => {
      const caixas: CaixaDeTela[] = [AREA.legenda, AREA.logo];
      if (capitulos.some((c) => quadro >= c.entra && quadro <= c.sai + 16)) caixas.push(AREA.cartela);
      for (const b of batidas) {
        if (quadro < b.q0 || quadro > b.q1 + 12) continue;
        if (b.tipo === "nome") {
          const p = posicaoDoNome(b);
          const [x, y] = projetar(b.ponto[0], b.ponto[1]);
          caixas.push({ x0: x + p.dx - p.w / 2, y0: y + p.dy - p.h / 2, x1: x + p.dx + p.w / 2, y1: y + p.dy + p.h / 2 });
        } else if (b.tipo === "mar") {
          const t = tamanhoDoTexto(b.linhas, "agua");
          const [x, y] = projetar(b.ponto[0], b.ponto[1]);
          caixas.push({ x0: x - t.w / 2, y0: y - t.h / 2, x1: x + t.w / 2, y1: y + t.h / 2 });
        } else if (b.tipo === "painel" || b.tipo === "proporcao") caixas.push(AREA.destaque);
        else if (b.tipo === "data") caixas.push(AREA.data);
        else if (b.tipo === "impacto") caixas.push(AREA.titulo);
        else if (b.tipo === "titulo") caixas.push(AREA.cartela);
      }
      return caixas;
    };
    const OPCOES: [number, number][] = [[0, 0], [170, 0], [-170, 0], [0, -90], [220, -110], [-220, -110], [0, 170], [280, 70], [-280, 70], [340, 0], [-340, 0], [0, 280], [360, -160], [-360, -160]];
    for (const b of batidas) {
      if (b.tipo !== "icone" || !b.ponto) continue;
      const T = b.tamanho ?? 150;
      const haste = b.haste ? 0.95 * T : 0;
      const momentos = [b.q0 + 12, Math.round((b.q0 + b.q1) / 2), b.q1 - 4].filter((m) => m >= b.q0 && m <= b.q1);
      const cenas = momentos.map((m) => {
        const projetar = projetarEm(m);
        return { ponto: projetar(b.ponto![0], b.ponto![1]), textos: textosEm(m, projetar) };
      });
      const conflitos = ([dx, dy]: [number, number]) =>
        cenas.reduce((n, c) => {
          const cx = c.ponto[0] + dx;
          const cy = c.ponto[1] + dy - haste;
          const caixa = { x0: cx - 0.55 * T, y0: cy - 0.55 * T, x1: cx + 0.55 * T, y1: cy + 0.55 * T };
          const fora = caixa.x0 < AREA.segura.x0 || caixa.x1 > AREA.segura.x1 || caixa.y0 < AREA.segura.y0 || caixa.y1 > AREA.segura.y1 ? 1 : 0;
          return n + fora + c.textos.filter((t) => cruzam(caixa, t)).length;
        }, 0);
      let melhor = OPCOES[0];
      let menor = Infinity;
      for (const o of OPCOES) {
        const n = conflitos(o);
        if (n < menor) [melhor, menor] = [o, n];
        if (n === 0) break;
      }
      b.dx = (b.dx ?? 0) + melhor[0];
      b.dy = (b.dy ?? 0) + melhor[1];
      if (menor > 0) avisos.push(`${b.cena}: o ícone "${b.icone}" não achou lugar livre de texto (${menor} conflito(s))`);
    }
  }

  // o Documentario (conferência, publicação): recursos e transições saem das batidas
  const cenasDoc: CenaDoDocumentario[] = o.cenas.map((c, i) => {
    const recursos: RecursoVisual[] = [];
    if (c.camera?.length || c.batidas.some((b) => ["pais", "nome", "mar", "rota", "circulo"].includes(b.tipo))) recursos.push({ tipo: "mapa", descricao: "mapa animado" });
    for (const b of c.batidas) {
      if (b.tipo === "imagem") recursos.push({ tipo: "imagem-ia", imagem: b.id });
      if (b.tipo === "painel" || b.tipo === "proporcao") recursos.push({ tipo: "grafico", descricao: b.tipo === "painel" ? `${b.numero}${b.unidade ?? ""}` : `${b.destaque} em ${b.total}` });
      if (b.tipo === "impacto" || b.tipo === "data") recursos.push({ tipo: "texto", texto: b.tipo === "impacto" ? b.linhas.join(" ") : b.texto });
    }
    const temImagem = c.batidas.some((b) => b.tipo === "imagem");
    return {
      id: c.id,
      capitulo: c.capitulo,
      falas: c.falas,
      inicio: i ? limites[i - 1] : 0,
      fim: limites[i],
      recursos: recursos.length ? recursos : [{ tipo: "texto", texto: "(sem recurso)" }],
      entrada: (temImagem ? "chicote" : "voo") as Transicao,
      afirmacoes: c.afirmacoes,
    };
  });
  const doc: Documentario = { titulo: o.titulo, publicacao: o.publicacao, fps, duracao, capitulos: o.capitulos, cenas: cenasDoc, fontes: o.fontes };
  problemas.push(...conferirDocumentario(doc, o.falas));
  for (const b of batidas) if (b.q1 < b.q0) problemas.push(`${b.cena}: uma batida "${b.tipo}" sai antes de entrar`);
  return { doc, capitulos, chaves, batidas, duracao, problemas, avisos };
};
