import { geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { interpolate } from "remotion";
import { bandeira, ImagemNaForma, pulso, useQuadro, type NomeDaBandeira } from "../../../kit";
import { useMapa } from "../../../base/componentes/MapCamera";
import type { LonLat } from "../../../base/geo/projecao";
import { PontosDeLuz } from "../../../base/componentes/Pontos";
import { AMAZONAS, ANAVILHANAS, AREIA_PONTA_NEGRA, BR319, BR319_TERRA, caixaDaBandeira, CIDADES, JAVARI, LUGAR, MERCADO, municipio, MUNICIPIOS, pais, PROPORCAO_DA_BANDEIRA, RIO_AMAZONAS, TEATRO, uf } from "../dados";
import { COR } from "../estilo";
import { CENA01, CENA02, CENA03, CENA04, CENA05, CENA06, CENA07, CENA08, CENA09, CENA10, CENA11, CENA12, CENA13, CENA14, CENA15, CENA16, CENA17, CENA18 } from "../roteiro";
import { arco, LINHA, piscada, Tracado } from "./comum";

// ---------------------------------------------------------------------------
// O que ATRAVESSA as cenas (para não "piscar" na troca de arquivo): o Rio Amazonas, o estado (contorno,
// o verde, a bandeira), a Região Norte, os vizinhos e os países, a malha e as sedes, e Manaus. Cada um é
// uma função do quadro (de 30: useQuadro), escrita como uma linha do tempo. O mesmo esquema do "Goiás".
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Faixa = readonly [number, number];
const muda = (f: number, [a, b]: Faixa, de: number, para: number) => interpolate(f, [a, b], [de, para], cl);
// acende piscando em `em` e fica; apaga (fade) na faixa
const liga = (f: number, em: number) => (f < em ? 0 : piscada(f, em));
const apaga = (f: number, faixa: Faixa) => 1 - muda(f, faixa, 0, 1);
const em10 = (q: number): Faixa => [q, q + 10];
const progresso = (f: number, faixa: Faixa) => interpolate(f, faixa, [0, 1], { ...cl, easing: LINHA });
// dois pulsos seguidos (o "brilho" do canal)
const doisPulsos = (f: number, em: number) => Math.min(1, pulso(f, em, 3, 12) + pulso(f, em + 14, 3, 14));

// ---- a HISTÓRIA (a borracha e as sementes): de "No auge da borracha" a "Décadas depois" o satélite perde a
// cor (o cinza do canal para o passado; exportado para a Base) ----
export const cinzaDoPassado = (f: number) => muda(f, CENA05.cinza, 0, 0.65) * muda(f, CENA07.cor, 1, 0);

// ---- O RIO AMAZONAS (o gancho): se desenha do Peru até a foz em "O maior rio do mundo atravessa…",
// pulsa em "…uma única ponte" e sai quando a câmera recua para a Região Norte ----
// …e volta em "Juntos, viram o Rio Amazonas" (cena 9): acende de Manaus para o leste e pulsa em
// "…impressiona" (cena 10)
const RIO_DE_MANAUS = RIO_AMAZONAS.filter((p) => p[0] > -60.0);
export const Rio: React.FC = () => {
  const f = useQuadro();
  const { camera } = useMapa();
  // de perto o traçado do Natural Earth não segue a margem do satélite: some
  const longe = Math.min(1, Math.max(0, (8.6 - camera.zoom) / 0.8));
  if (longe <= 0) return null;
  const t = progresso(f, CENA01.rio);
  const k = t > 0 ? apaga(f, [CENA02.regiao[0], CENA02.regiao[0] + 12]) : 0;
  const t2 = progresso(f, [CENA09.rioAmazonas - 4, CENA09.rioAmazonas + 26]);
  const k2 = t2 > 0 ? apaga(f, [CENA11.voo[0], CENA11.voo[0] + 12]) : 0;
  const brilho = doisPulsos(f, CENA01.ponte);
  const brilho2 = doisPulsos(f, CENA10.impressiona);
  return (
    <>
      {k > 0 && <Tracado pontos={RIO_AMAZONAS} t={t} opacidade={k * longe} cor={COR.rio} largura={9 + 5 * brilho} />}
      {k2 > 0 && <Tracado pontos={RIO_DE_MANAUS} t={t2} opacidade={k2 * longe} cor={COR.rio} largura={9 + 4 * brilho2} />}
    </>
  );
};

// ---- O AMAZONAS: o contorno branco e o verde translúcido acendem (piscada) em "…o Amazonas…", o contorno
// pulsa em "…inteiro"; o verde sai quando a bandeira abre ("E o maior estado…") e o contorno fica até o
// último quadro ----
export const Amazonas: React.FC = () => {
  const f = useQuadro();
  const { caminho, camera } = useMapa();
  if (f < CENA01.amazonas) return null;
  const d = caminho(AMAZONAS) ?? "";
  // de muito perto (Manaus) o contorno do estado sai da tela: some
  const linha = Math.min(1, Math.max(0, (9.6 - camera.zoom) / 1.2));
  const k = liga(f, CENA01.amazonas);
  const verde = k * apaga(f, [CENA01.estado, CENA01.estado + 12]);
  const brilho = Math.min(1, doisPulsos(f, CENA01.inteiro) + doisPulsos(f, CENA10.impressiona));
  return (
    <g filter="drop-shadow(0 0 6px rgba(255,255,255,0.4))">
      {verde > 0 && <path d={d} fill={COR.estado} fillOpacity={(0.45 + 0.12 * brilho) * verde} stroke="none" />}
      {linha > 0 && <path d={d} fill="none" stroke={COR.branco} strokeWidth={3 + 5 * brilho} strokeOpacity={k * linha} strokeLinejoin="round" />}
    </g>
  );
};

// ---- a REGIÃO NORTE (cena 2, "Fica no Norte"): os outros seis estados acendem em branco translúcido, com
// contorno branco brilhando, em volta do Amazonas (o mesmo destaque do "Centro-Oeste" do "Goiás"); apagam
// quando as bandeiras dos vizinhos começam a entrar ----
const NORTE = ["RR", "PA", "AP", "TO", "RO", "AC"];
export const RegiaoNorte: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (f < CENA02.norte || f > CENA02.roraima + 12) return null;
  const k = liga(f, CENA02.norte) * apaga(f, [CENA02.roraima - 4, CENA02.roraima + 8]);
  const brilho = doisPulsos(f, CENA02.norte + 4);
  return (
    <g filter="drop-shadow(0 0 8px rgba(255,255,255,0.45))">
      {NORTE.map((sigla) => (
        <path key={sigla} d={caminho(uf(sigla)) ?? ""} fill={COR.regiao} fillOpacity={(0.28 + 0.12 * brilho) * k} stroke={COR.branco} strokeWidth={2.4 + 2 * brilho} strokeOpacity={0.95 * k} strokeLinejoin="round" />
      ))}
    </g>
  );
};

// ---- as BANDEIRAS. Cada bandeira PRESA AO MAPA e centrada na forma: não "dá zoom" quando a câmera anda.
//  · o AMAZONAS (o padrão dos estados: a bandeira sempre dentro do estado, meio transparente): a versão
//    CENTRADA (scripts/bandeira-estado.py: as listras na largura toda e o retângulo azul das estrelas no meio
//    do estado) abre em "E o maior estado…" e fica até o último quadro; mais forte na revelação, mais
//    apagada de perto (Manaus), para o lugar continuar visível
//  · os VIZINHOS e os PAÍSES só na hora em que aparecem, cada um NA PALAVRA, até a volta ao estado (cena 3)
// ---------------------------------------------------------------------------
const CAIXA_AM: [LonLat, LonLat] = [[-74.3, -10.3], [-55.6, 2.7]];
const BANDEIRA_AM = "assets/exemplo-vertical/bandeira-am-centrada.png";
// de perto (zoom 7 → 8,6) a bandeira SOME (1 → 0): a listra vermelha sujava o satélite de Manaus, e mesmo a
// 10 % a listra branca virava uma faixa clara atravessando a tela nas Anavilhanas (pente fino do usuário: o
// satélite de perto tem que ficar limpo)
const dePerto = (zoom: number) => 1 - Math.min(1, Math.max(0, (zoom - 7.0) / 1.6));
// a revelação: a bandeira fica mais forte
const destaque = (f: number) => Math.max(muda(f, em10(CENA01.estado), 0, 1) * apaga(f, [CENA02.regiao[0], CENA02.regiao[0] + 14]), muda(f, em10(CENA18.cheio), 0, 1));

// [sigla, quando, onde fica a sigla, corpo]
const VIZINHOS: [string, number, LonLat, number][] = [
  ["RR", CENA02.roraima, LUGAR.siglaRR, 50],
  ["PA", CENA02.para, LUGAR.siglaPA, 60],
  ["MT", CENA02.mt, LUGAR.siglaMT, 60],
  ["RO", CENA02.rondonia, LUGAR.siglaRO, 50],
  ["AC", CENA02.acre, LUGAR.siglaAC, 46],
];
// [código, bandeira, quando, onde fica o nome, nome, corpo]
const PAISES_DA_FRONTEIRA: [string, NomeDaBandeira, number, LonLat, string, number][] = [
  ["VEN", "ve", CENA02.venezuela, LUGAR.nomeVE, "VENEZUELA", 36],
  ["COL", "co", CENA02.colombia, LUGAR.nomeCO, "COLÔMBIA", 36],
  ["PER", "peru", CENA02.peru, LUGAR.nomePE, "PERU", 44],
];
const caixaDe = (chave: string, regiao: Feature<Geometry>) => caixaDaBandeira(regiao, PROPORCAO_DA_BANDEIRA[chave]);
// o PERU com a bandeira recortada no território, (scripts/bandeira-pais.py): a
// oficial esticada deixava o país quase todo branco (pente fino do usuário); aqui cada faixa cobre um terço
// do Peru, na caixa do país
const BANDEIRA_PERU = "assets/exemplo-vertical/bandeira-peru-faixas.png";
const CAIXA_PERU: [LonLat, LonLat] = [[-81.337, -18.346], [-68.685, -0.042]];

export const Bandeiras: React.FC = () => {
  const f = useQuadro();
  const { camera } = useMapa();
  const perto = dePerto(camera.zoom);
  // (com os pontos de luz da cena 3 acesos a bandeira recua um pouco: os pontos somem no branco das listras)
  const pontos = muda(f, [CENA03.milhoes - 4, CENA03.milhoes + 8], 0, 1) * apaga(f, CENA03.mergulho);
  // (com a terra indígena do Javari acesa a bandeira recua: a área fica legível)
  const javari = muda(f, [CENA16.javari - 4, CENA16.javari + 8], 0, 1) * apaga(f, CENA17.voo);
  const am = (0.58 - 0.25 * javari + 0.3 * destaque(f) - 0.25 * pontos) * perto;
  return (
    <>
      {/* o AMAZONAS, de "E o maior estado…" ao último quadro */}
      <ImagemNaForma regiao={AMAZONAS} src={BANDEIRA_AM} entra={CENA01.estado} caixaImagem={CAIXA_AM} ajuste="none" borda={null} parada opacidade={am} />
      {VIZINHOS.map(([sigla, entra, pos, corpo]) => {
        const regiao = uf(sigla);
        return <ImagemNaForma key={sigla} regiao={regiao} src={bandeira(sigla.toLowerCase() as NomeDaBandeira)} entra={entra} sai={CENA03.volta[0]} sigla={sigla} posSigla={pos} corpoSigla={corpo} caixaImagem={caixaDe(sigla.toLowerCase(), regiao)} ajuste="none" parada opacidade={0.9} />;
      })}
      {PAISES_DA_FRONTEIRA.map(([iso, nome, entra, pos, rotulo, corpo]) => {
        const regiao = pais(iso);
        const peru = iso === "PER";
        return <ImagemNaForma key={iso} regiao={regiao} src={peru ? BANDEIRA_PERU : bandeira(nome)} entra={entra} sai={CENA03.volta[0]} sigla={rotulo} posSigla={pos} corpoSigla={corpo} caixaImagem={peru ? CAIXA_PERU : caixaDe(nome, regiao)} ajuste="none" parada opacidade={0.9} />;
      })}
    </>
  );
};

// ---- a malha dos 62 municípios (cena 3): se desenha de Manaus para fora, por cima da bandeira ----
const longeDeManaus = (p: LonLat) => Math.hypot(p[0] - LUGAR.manaus[0], p[1] - LUGAR.manaus[1]);
const ONDA = (() => {
  const d = MUNICIPIOS.map((m) => longeDeManaus(geoCentroid(m) as LonLat));
  const maior = Math.max(...d);
  return d.map((x) => x / maior);
})();
// a malha sai no mergulho em Manaus
const SAEM: Faixa = CENA03.mergulho;

export const MalhaMunicipal: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (f < CENA03.malha[0] || f > SAEM[1]) return null;
  const p = muda(f, CENA03.malha, 0, 1);
  const fora = apaga(f, SAEM);
  return (
    <g fill="none" stroke={COR.branco} strokeLinejoin="round">
      {MUNICIPIOS.map((m, i) => {
        const k = Math.min(1, Math.max(0, (p - ONDA[i] * 0.8) / 0.2)) * fora;
        if (k <= 0) return null;
        return <path key={m.properties.codigo} d={caminho(m) ?? ""} strokeWidth={1.2} strokeOpacity={0.75 * k} />;
      })}
    </g>
  );
};

// ---- as pessoas (cena 3): um ponto no meio de cada município, do tamanho da população, e pontos menores
// espalhados pelos grandes, em onda a partir de Manaus; em "Metade vive…" os do interior apagam e o de
// Manaus cresce (metade do estado num ponto só) ----
const MAIOR = Math.max(...CIDADES.map((c) => c.pop));
const PONTOS = CIDADES.flatMap((c) => [{ em: c.meio, raio: 4.5 + 24 * Math.sqrt(c.pop / MAIOR), manaus: c.nome === "Manaus" }, ...c.extras.map((em) => ({ em, raio: 3, manaus: false }))]).sort((a, b) => longeDeManaus(a.em) - longeDeManaus(b.em));

export const Sedes: React.FC = () => {
  const f = useQuadro();
  if (f < CENA03.pontos[0] || f > SAEM[1]) return null;
  const p = muda(f, CENA03.pontos, 0, 1);
  const n = PONTOS.length;
  const interior = apaga(f, em10(CENA03.metade));
  const cresce = muda(f, [CENA03.metade, CENA03.metade + 12], 1, 2.2);
  const pontos = PONTOS.map((pt) => (pt.manaus ? { em: pt.em, raio: pt.raio * cresce } : pt));
  return (
    <PontosDeLuz
      pontos={pontos}
      acende={(i) => Math.min(1, Math.max(0, (p * (n + 20) - i) / 20)) * (PONTOS[i].manaus ? 1 : interior)}
      cor={COR.cidade}
      opacidade={0.95 * apaga(f, SAEM)}
    />
  );
};

// ---- os MUNICÍPIOS da história (o "pino de sempre": o município demarcado em volta do pino): cada um pisca
// em amarelo-oliva na palavra e apaga no voo seguinte; de perto o preenchimento sai de cima do satélite ----
const CIDADES_DA_HISTORIA: { nome: string; entra: number; sai: Faixa }[] = [
  { nome: "Manaus", entra: CENA03.manaus, sai: CENA04.recuo },
  { nome: "Novo Airão", entra: CENA12.novoAirao, sai: CENA13.voo },
  { nome: "Presidente Figueiredo", entra: CENA13.figueiredo, sai: CENA14.voo },
  { nome: "Parintins", entra: CENA14.parintins, sai: CENA15.voo },
  { nome: "Maués", entra: CENA15.maues, sai: CENA16.recuo },
];
export const Municipios: React.FC = () => {
  const f = useQuadro();
  const { caminho, camera } = useMapa();
  const perto = 1 - 0.7 * Math.min(1, Math.max(0, (camera.zoom - 10.5) / 0.8));
  return (
    <g filter="drop-shadow(0 0 6px rgba(255,255,255,0.35))">
      {CIDADES_DA_HISTORIA.map(({ nome, entra, sai }) => {
        if (f < entra || f > sai[1]) return null;
        const k = liga(f, entra) * apaga(f, sai);
        if (k <= 0) return null;
        const d = caminho(municipio(nome)) ?? "";
        // em Novo Airão, quando o parque das Anavilhanas acende, o amarelo do município recua: o rio e as
        // ilhas ficam à vista
        const parque = nome === "Novo Airão" ? 1 - 0.8 * muda(f, em10(CENA12.anavilhanas), 0, 1) : 1;
        return (
          <g key={nome}>
            <path d={d} fill={COR.cidade} fillOpacity={0.22 * k * perto * parque} stroke={COR.cidade} strokeWidth={9} strokeOpacity={0.3 * k * perto * parque} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={COR.branco} strokeWidth={3.5} strokeOpacity={Math.min(1, k * 1.4)} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// ---- a BR-319 (cena 4): a estrada se desenha de Manaus a Porto Velho em "…a BR-319…" (branca com miolo
// claro) e, em "…centenas de quilômetros de terra…", o trecho do meio vira TERRA (marrom, tracejado,
// pulsando) ----
const TERRA = "#C77B3A";
export const Estrada: React.FC = () => {
  const f = useQuadro();
  const t = progresso(f, CENA04.estrada);
  if (t <= 0) return null;
  const k = apaga(f, [CENA05.voo[0], CENA05.voo[0] + 12]);
  if (k <= 0) return null;
  const terra = muda(f, [CENA04.terra, CENA04.terra + 10], 0, 1);
  const brilho = doisPulsos(f, CENA04.terra + 4);
  return (
    <>
      <Tracado pontos={BR319} t={t} opacidade={k} cor="#F4F1E8" miolo="#FFFFFF" largura={7} />
      {terra > 0 && <Tracado pontos={BR319_TERRA} t={1} opacidade={k * terra} cor={TERRA} miolo="#FFE0B0" largura={9 + 4 * brilho} />}
      {terra > 0 && <Tracado pontos={BR319_TERRA} t={terra} opacidade={k} cor="#5A3315" largura={4} tracejado />}
    </>
  );
};

// ---- as ROTAS das sementes (cena 6): de Manaus a Londres e de Londres à Ásia, em grande círculo, na cor da
// história (o desenho anda junto com a semente, Scene06) ----
export const ROTA_LONDRES = arco(LUGAR.manaus, LUGAR.londres, 0, 60, true);
export const ROTA_ASIA = arco(LUGAR.londres, LUGAR.asia, 0, 60, true);
export const Rotas: React.FC = () => {
  const f = useQuadro();
  const t1 = progresso(f, CENA06.rota1);
  if (t1 <= 0) return null;
  const k = apaga(f, CENA07.mergulho);
  if (k <= 0) return null;
  const t2 = progresso(f, CENA06.rota2);
  return (
    <>
      <Tracado pontos={ROTA_LONDRES} t={t1} opacidade={k} cor={COR.historiaClara} largura={5} tracejado />
      {t2 > 0 && <Tracado pontos={ROTA_ASIA} t={t2} opacidade={k} cor={COR.historiaClara} largura={5} tracejado />}
    </>
  );
};

// ---- as ÁREAS (OSM): o Parque Nacional de Anavilhanas (cena 12) e a Terra Indígena Vale do Javari (cena
// 16), cada uma na palavra ----
const Area: React.FC<{ regiao: Feature<Geometry>; cor: string; entra: number; sai: Faixa; opacidade?: number }> = ({ regiao, cor, entra, sai, opacidade = 0.45 }) => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (f < entra || f > sai[1]) return null;
  const k = liga(f, entra) * apaga(f, sai);
  if (k <= 0) return null;
  const brilho = doisPulsos(f, entra + 2);
  return (
    <g filter="drop-shadow(0 0 8px rgba(255,255,255,0.45))">
      <path d={caminho(regiao) ?? ""} fill={cor} fillOpacity={(opacidade + 0.1 * brilho) * k} stroke={COR.branco} strokeWidth={3 + 2 * brilho} strokeOpacity={k} strokeLinejoin="round" />
    </g>
  );
};
export const Areas: React.FC = () => (
  <>
    <Area regiao={ANAVILHANAS} cor={COR.floresta} entra={CENA12.anavilhanas} sai={CENA13.voo} opacidade={0.22} />
    <Area regiao={JAVARI} cor={COR.povos} entra={CENA16.javari} sai={CENA17.voo} opacidade={0.45} />
  </>
);

// ---- A DEMARCAÇÃO DO LUGAR (pente fino do usuário: "marcar o lugar certinho, com contorno"). Na palavra:
//  · o CONTORNO de verdade (OSM) se desenha em volta do lugar em ~12 quadros (halo na cor do assunto, traço
//    branco), o preenchimento pisca e fica translúcido — o prédio do Teatro e o do Mercado, a areia da Ponta
//    Negra;
//  · onde o OSM só tem um ponto, o ANEL-ALVO: um anel branco que se desenha de 0 a 360° em volta do lugar,
//    um anel de dentro na cor do assunto e uma onda que pulsa para fora a cada segundo.
// Sai em fade na faixa `sai` ----
type Marca = { entra: number; sai: Faixa; cor: string } & ({ regiao: Feature<Geometry> } | { ponto: LonLat; raio?: number });
const MARCAS: Marca[] = [
  { regiao: TEATRO, entra: CENA05.teatro, sai: CENA06.recuo, cor: COR.cidade },
  // (o prédio é pequeno nesse zoom: o anel em volta deixa a marcação visível)
  { ponto: LUGAR.teatro, raio: 75, entra: CENA05.teatro + 4, sai: CENA06.recuo, cor: COR.cidade },
  { ponto: LUGAR.distritoIndustrial, raio: 90, entra: CENA07.zonaFranca, sai: CENA08.paraMercado, cor: COR.cidade },
  { regiao: MERCADO, entra: CENA08.mercado, sai: CENA08.paraPontaNegra, cor: COR.cidade },
  { ponto: LUGAR.mercado, raio: 75, entra: CENA08.mercado + 4, sai: CENA08.paraPontaNegra, cor: COR.cidade },
  { regiao: AREIA_PONTA_NEGRA, entra: CENA08.pontaNegra, sai: CENA09.voo, cor: COR.agua },
  { ponto: LUGAR.encontro, raio: 70, entra: CENA09.solimoes + 10, sai: CENA09.recuo, cor: COR.rio },
  { ponto: LUGAR.janauari, raio: 60, entra: CENA11.janauari, sai: CENA12.voo, cor: COR.floresta },
  { ponto: LUGAR.santuario, raio: 50, entra: CENA13.figueiredo, sai: [CENA13.grutas - 8, CENA13.grutas + 2], cor: COR.floresta },
  { ponto: LUGAR.maroaga, raio: 50, entra: CENA13.grutas, sai: CENA14.voo, cor: COR.floresta },
  { ponto: LUGAR.bumbodromo, raio: 55, entra: CENA14.festival, sai: CENA15.voo, cor: COR.cidade },
  { ponto: LUGAR.picoDaNeblina, raio: 60, entra: CENA17.neblina, sai: CENA18.recuo, cor: COR.floresta },
];
const DESENHA = 12;
export const Demarcacoes: React.FC = () => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  return (
    <>
      {MARCAS.map((m, i) => {
        if (f < m.entra || f > m.sai[1]) return null;
        const k = apaga(f, [m.sai[0], m.sai[0] + 8]);
        if (k <= 0) return null;
        const t = interpolate(f, [m.entra, m.entra + DESENHA], [0, 1], { ...cl, easing: LINHA });
        if ("regiao" in m) {
          const d = caminho(m.regiao) ?? "";
          const preenche = liga(f, m.entra + DESENHA - 2);
          const brilho = doisPulsos(f, m.entra + DESENHA);
          return (
            <g key={i} opacity={k} strokeLinejoin="round" fill="none">
              <path d={d} fill={m.cor} fillOpacity={(0.28 + 0.12 * brilho) * preenche} stroke="none" />
              <path d={d} stroke={m.cor} strokeWidth={14} strokeOpacity={0.45} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
              <path d={d} stroke={COR.branco} strokeWidth={4 + 2 * brilho} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} filter="drop-shadow(0 0 6px rgba(0,0,0,0.6))" />
            </g>
          );
        }
        const [x, y] = projetar(m.ponto[0], m.ponto[1]);
        const r = m.raio ?? 60;
        const onda = (((f - m.entra - DESENHA) % 30) + 30) % 30 / 30;
        const c = 2 * Math.PI * r;
        return (
          <g key={i} opacity={k} fill="none">
            <circle cx={x} cy={y} r={r} stroke={m.cor} strokeWidth={14} strokeOpacity={0.45} strokeDasharray={c} strokeDashoffset={c * (1 - t)} transform={`rotate(-90 ${x} ${y})`} />
            <circle cx={x} cy={y} r={r} stroke={COR.branco} strokeWidth={5} strokeDasharray={c} strokeDashoffset={c * (1 - t)} transform={`rotate(-90 ${x} ${y})`} filter="drop-shadow(0 0 6px rgba(0,0,0,0.6))" />
            <circle cx={x} cy={y} r={r * 0.62 * t} fill={m.cor} fillOpacity={0.25} stroke={m.cor} strokeWidth={3} />
            {f >= m.entra + DESENHA && <circle cx={x} cy={y} r={r * (1 + 0.8 * onda)} stroke={COR.branco} strokeWidth={3} opacity={0.8 * (1 - onda)} />}
          </g>
        );
      })}
    </>
  );
};
