import { geoInterpolate } from "d3-geo";
import { Easing, Img, interpolate, staticFile } from "remotion";
import {
  CURVA,
  entra,
  EtiquetaDeLugar,
  icone,
  IconeDestaque,
  TextoDigitado,
  useQuadro,
  type NomeDoIcone,
} from "../../../kit";
import { useMapa } from "../../../base/componentes/MapCamera";
import type { LonLat } from "../../../base/geo/projecao";
import fotosJson from "../dados/fotos.json";
import { FONTE } from "../estilo";

// ---------------------------------------------------------------------------
// Peças pequenas deste vídeo, no movimento do estilo "Mapas Animados": tudo entra seco
// (pop de 6–8 quadros, piscada, digitação) e NADA boia.
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// a piscada do canal: liga, desliga, liga, desliga, liga e fica (1 passo = 2 quadros)
export const piscada = (f: number, em: number) => {
  const i = Math.floor((f - em) / 2);
  if (i < 0) return 0;
  return [1, 0, 1, 0][i] ?? 1;
};

// a linha que se desenha (rotas, anéis)
export const LINHA = Easing.bezier(0.3, 0, 0.2, 1);

// pop seco (6–8 quadros) e saída encolhendo
const pop = (f: number, em: number, n = 7) => entra(f, em, n, CURVA.pop);
export const saida = (f: number, em?: number) =>
  em === undefined
    ? 1
    : interpolate(f, [em, em + 8], [1, 0], {
        ...cl,
        easing: Easing.in(Easing.cubic),
      });

// Ícone 3D com pop seco, sem boia; posição de tela ou presa ao mapa (`ponto`)
export const IconePop: React.FC<{
  nome: NomeDoIcone;
  entra: number;
  sai?: number;
  x?: number;
  y?: number;
  ponto?: LonLat;
  dx?: number;
  dy?: number;
  tamanho?: number;
  espelhar?: boolean;
}> = ({
  nome,
  entra: e,
  sai: s,
  x = 540,
  y = 960,
  ponto,
  dx = 0,
  dy = 0,
  tamanho = 200,
  espelhar = false,
}) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const k = pop(f, e) * saida(f, s);
  if (f < e || k <= 0) return null;
  const [px, py] = ponto ? projetar(ponto[0], ponto[1]) : [x, y];
  return (
    <Img
      src={staticFile(icone(nome))}
      style={{
        position: "absolute",
        left: px + dx - tamanho / 2,
        top: py + dy - tamanho / 2,
        width: tamanho,
        height: tamanho,
        objectFit: "contain",
        transform: `scale(${espelhar ? -k : k}, ${k})`,
        filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.45))",
      }}
    />
  );
};

// A BANDEIRA REDONDA (o selo de um país citado de passagem): disco com borda branca e pop
export const SeloBandeira: React.FC<{
  src: string;
  entra: number;
  sai?: number;
  x: number;
  y: number;
  tamanho?: number;
  foco?: string;
}> = ({ src, entra: e, sai: s, x, y, tamanho = 170, foco = "30% 50%" }) => {
  const f = useQuadro();
  const k = pop(f, e) * saida(f, s);
  if (f < e || k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - tamanho / 2,
        top: y - tamanho / 2,
        width: tamanho,
        height: tamanho,
        borderRadius: "50%",
        overflow: "hidden",
        border: "7px solid #FFFFFF",
        boxShadow: "0 10px 22px rgba(0,0,0,0.5)",
        transform: `scale(${k})`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: foco,
        }}
      />
    </div>
  );
};

// O PINO vermelho (gota com miolo branco) que cai 30 px e assenta; o nome (se tiver) entra deslizando da
// direita. Preso ao mapa.
export const Pino: React.FC<{
  ponto: LonLat;
  entra: number;
  sai?: number;
  nome?: string;
  esquerda?: boolean;
}> = ({ ponto, entra: e, sai: s, nome, esquerda = false }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < e) return null;
  const k = saida(f, s);
  if (k <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const cai = interpolate(f, [e, e + 5], [-30, 0], {
    ...cl,
    easing: Easing.out(Easing.cubic),
  });
  const nomeEntra = interpolate(f, [e + 3, e + 8], [0, 1], {
    ...cl,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: k,
        pointerEvents: "none",
      }}
    >
      <svg
        width={52}
        height={68}
        viewBox="0 0 52 68"
        style={{
          position: "absolute",
          left: -26,
          top: -66 + cai,
          filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.5))",
        }}
      >
        <path
          d="M26 66 C26 66 4 40 4 24 A22 22 0 1 1 48 24 C48 40 26 66 26 66 Z"
          fill="#E53935"
          stroke="#FFFFFF"
          strokeWidth={3}
        />
        <circle cx={26} cy={24} r={8} fill="#FFFFFF" />
      </svg>
      {nome && (
        <div
          style={{
            position: "absolute",
            left: esquerda ? undefined : 32 + 40 * (1 - nomeEntra),
            right: esquerda ? 32 + 40 * (1 - nomeEntra) : undefined,
            top: -58,
            opacity: nomeEntra,
            fontFamily: FONTE,
            fontWeight: 800,
            fontSize: 34,
            color: "#FFFFFF",
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            textShadow: "0 3px 6px rgba(0,0,0,0.75)",
            filter:
              nomeEntra < 1 ? `blur(${(1 - nomeEntra) * 4}px)` : undefined,
          }}
        >
          {nome}
        </div>
      )}
    </div>
  );
};

// O ESCUDO da rodovia (a "tag" retangular do canal): fundo azul, borda clara, texto digitado
// por cima; preso a um ponto da estrada.
export const Escudo: React.FC<{
  ponto: LonLat;
  entra: number;
  sai?: number;
  texto: string;
  dx?: number;
  dy?: number;
  corpo?: number;
}> = ({ ponto, entra: e, sai: s, texto, dx = 0, dy = 0, corpo = 46 }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const k = pop(f, e) * saida(f, s);
  if (f < e || k <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const n = Math.max(
    0,
    Math.min(texto.length, Math.floor((f - e - 3) / 1.2) + 1),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x + dx,
        top: y + dy,
        transform: `translate(-50%, -50%) scale(${k})`,
        padding: `${corpo * 0.22}px ${corpo * 0.48}px`,
        background: "#1F4FE0",
        border: `${Math.max(3, corpo * 0.08)}px solid #BFD0FF`,
        borderRadius: corpo * 0.26,
        boxShadow: "0 8px 18px rgba(0,0,0,0.5)",
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: corpo,
        letterSpacing: "0.04em",
        color: "#FFFFFF",
        whiteSpace: "pre",
      }}
    >
      {/* as letras que faltam ocupam o lugar (invisíveis): a tag não muda de tamanho */}
      <span>{texto.slice(0, n)}</span>
      <span style={{ opacity: 0 }}>{texto.slice(n)}</span>
    </div>
  );
};

// Um ÍCONE QUE ANDA na ponta de uma linha (o caminhão na estrada, a barcaça no rio): a posição
// vem de fora (tela), com pop na entrada e fade nos últimos 6% do caminho se `some`. `base` é a
// altura (fração do ícone) que pousa na linha: as rodas do caminhão e a linha d'água do navio
// ficam a ~86% do PNG. Os dois emojis apontam para a esquerda: `espelhar` quando andam para a
// direita.
export const IconeNaPonta: React.FC<{
  nome: NomeDoIcone;
  x: number;
  y: number;
  entra: number;
  t: number;
  tamanho?: number;
  espelhar?: boolean;
  some?: boolean;
  opacidade?: number;
  base?: number;
}> = ({
  nome,
  x,
  y,
  entra: e,
  t,
  tamanho = 120,
  espelhar = false,
  some = true,
  opacidade = 1,
  base = 0.86,
}) => {
  const f = useQuadro();
  const k = pop(f, e, 6);
  if (f < e || k <= 0 || opacidade <= 0) return null;
  const fade = some ? 1 - interpolate(t, [0.94, 1], [0, 1], cl) : 1;
  return (
    <Img
      src={staticFile(icone(nome))}
      style={{
        position: "absolute",
        left: x - tamanho / 2,
        top: y - tamanho * base,
        width: tamanho,
        height: tamanho,
        objectFit: "contain",
        transform: `scale(${espelhar ? -k : k}, ${k})`,
        transformOrigin: `50% ${base * 100}%`,
        filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))",
        opacity: opacidade * fade,
      }}
    />
  );
};

// O MARCADOR DE CIDADE: um ponto branco com aro âmbar no CENTRO da cidade (a sede), com uma onda
// que pulsa, e o nome digitado logo em cima, centrado no ponto. Preso ao mapa.
export const MarcadorCidade: React.FC<{
  ponto: LonLat;
  nome: string;
  entra: number;
  sai?: number;
  corpo?: number;
  cor?: string;
}> = ({ ponto, nome, entra: e, sai: s, corpo = 40, cor = "#F0A12A" }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const k = pop(f, e, 6) * saida(f, s);
  if (f < e || k <= 0) return null;
  const [x, y] = projetar(ponto[0], ponto[1]);
  const r = Math.round(corpo * 0.3);
  const onda = ((((f - e) % 30) + 30) % 30) / 30;
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <circle
          cx={x}
          cy={y}
          r={r + r * 2.2 * onda}
          fill="none"
          stroke={cor}
          strokeWidth={3}
          opacity={k * (1 - onda)}
        />
        <circle
          cx={x}
          cy={y}
          r={r * k}
          fill="#FFFFFF"
          stroke={cor}
          strokeWidth={Math.max(3, r * 0.45)}
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
        />
      </svg>
      <TextoDigitado
        texto={nome}
        entra={e + 2}
        sai={s}
        x={x}
        y={y - r - 10}
        ancora="base"
        corpo={corpo}
        peso={900}
        brilho={cor}
        passo={0.8}
      />
    </>
  );
};

// O CARTÃO DE FOTO (kit ImagemDeDrone, modo "cartao"): centro em y=860, na PROPORÇÃO da foto
// (largura até 1012; foto em pé = cartão mais estreito, até `alturaMaxima`). A etiqueta do lugar
// fica no canto de cima, por dentro do cartão.
export const CARTAO_Y = 860;
export const cantoDoCartao = (
  proporcao: number,
  alturaMaxima = 1920 * 0.62,
  y = CARTAO_Y,
) => {
  const alt = Math.min(1012 / proporcao, alturaMaxima);
  return { x: (1080 - alt * proporcao) / 2 + 28, y: y - alt / 2 + 24 };
};
// as proporções (largura/altura) MEDIDAS nos arquivos (`npm run fotos -- exemplo-vertical` → dados/fotos.json): a
// foto entra inteira, sem corte; trocou a foto, rode o fotos:am e o cartão se ajusta
const P = fotosJson as Record<string, number>;
export const proporcaoDe = (arquivo: string) => {
  const p = P[arquivo];
  if (!p)
    throw new Error(
      `a foto "${arquivo}" não está em dados/fotos.json — rode npm run fotos -- exemplo-vertical`,
    );
  return p;
};
// a foto de um cartão (FotoNoMapaAnimada): o caminho e a proporção medida
export const foto = (arquivo: string) => ({
  src: `assets/exemplo-vertical/${arquivo}`,
  proporcao: proporcaoDe(arquivo),
});
export const PROPORCAO = {
  teatro: proporcaoDe("teatro-amazonas.jpg"),
  pontaNegra: proporcaoDe("ponta-negra.jpg"),
  iracema: proporcaoDe("cachoeira-iracema.jpg"),
};
// O ÍCONE NO CANTO DO CARTÃO (como nos cartões do "Alagoas"/"Pernambuco"): o ícone 3D em disco de
// vidro (kit IconeDestaque) no canto de cima à DIREITA do cartão de foto (ImagemDeDrone, modo
// "cartao"), saindo um pouco para fora; a etiqueta do lugar fica no canto da esquerda
export const cantoDireitoDoCartao = (
  proporcao: number,
  alturaMaxima = 1920 * 0.62,
  y = CARTAO_Y,
) => {
  const alt = Math.min(1012 / proporcao, alturaMaxima);
  // o disco (130 px) fica todo DENTRO da tela: o cartão largo vai até x≈1046, então o ícone entra
  // ~80 px para dentro do canto
  return {
    x: Math.min((1080 + alt * proporcao) / 2 - 80, 1080 - 90),
    y: y - alt / 2 + 16,
  };
};

// as fotos EM PÉ: o cartão ocupa toda a altura livre entre o painel de cima (até y ~380) e a legenda
// (y 1425) — a foto inteira, sem corte, o maior possível (pedido do usuário: "estava fininha")
export const ALTURA_EM_PE = 1000;
export const Y_EM_PE = 895;

// o "drone" dentro do cartão: um zoom bem leve (de 1 a 1,025), para a foto aparecer INTEIRA e nítida no
// cartão — o movimento continua, mas quase nada fica fora da moldura (pente fino 2: "ficar dentro, bem
// nítida")
export const ZOOM_DO_CARTAO = [1, 1.025] as const;

// A LINHA QUE SE DESENHA (a costa, os rios): halo, traço e miolo claro; `t` de 0 a 1
export const Tracado: React.FC<{
  pontos: LonLat[];
  t: number;
  cor: string;
  miolo?: string;
  largura?: number;
  opacidade?: number;
  tracejado?: boolean;
}> = ({
  pontos,
  t,
  cor,
  miolo = "#E0F7FF",
  largura = 7,
  opacidade = 1,
  tracejado = false,
}) => {
  const { projetar } = useMapa();
  if (t <= 0 || opacidade <= 0) return null;
  const pts = pontos.map(([lon, lat]) => projetar(lon, lat));
  const d = `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}`;
  if (tracejado) {
    // o tracejado não usa o dasharray do desenho: a linha cresce e os traços ficam no lugar
    const ate = Math.max(1, Math.round(t * (pts.length - 1)));
    const parcial = `M${pts
      .slice(0, ate + 1)
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join("L")}`;
    return (
      <g fill="none" strokeLinecap="round" opacity={opacidade}>
        <path
          d={parcial}
          stroke={cor}
          strokeWidth={largura}
          strokeDasharray={`${largura * 2.6} ${largura * 2}`}
          filter="drop-shadow(0 0 4px rgba(0,0,0,0.6))"
        />
      </g>
    );
  }
  const traco = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - t };
  return (
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacidade}
    >
      <path
        d={d}
        stroke={cor}
        strokeWidth={largura * 2.4}
        strokeOpacity={0.35}
        {...traco}
      />
      <path d={d} stroke={cor} strokeWidth={largura} {...traco} />
      <path d={d} stroke={miolo} strokeWidth={largura * 0.3} {...traco} />
    </g>
  );
};

// o ícone do cartão: posição pelo canto direito, pop parado (sem flutuar)
export const IconeNoCartao: React.FC<{
  nome: NomeDoIcone;
  proporcao: number;
  entra: number;
  sai: number;
  cor: string;
  alturaMaxima?: number;
  y?: number;
}> = ({ nome, proporcao, entra: e, sai: s, cor, alturaMaxima, y }) => (
  <IconeDestaque
    parado
    nome={nome}
    entra={e}
    sai={s}
    {...cantoDireitoDoCartao(proporcao, alturaMaxima, y)}
    tamanho={130}
    cor={cor}
  />
);

// O ÍCONE FORA DO ESTADO, PRESO AO LUGAR POR UM FIO (o fecho): o ícone fica numa posição FIXA da tela
// (`x`, `y`: no mar, acima ou ao lado do estado, sem cobrir a bandeira) e um fio fino corre do lugar
// (um ponto na cor do assunto) até ele — pedido do usuário: os ícones do fecho atrapalhavam a bandeira.
// A FOTO COM FIO (o fecho): a fotinha do lugar numa janelinha (cartão branco, cantos redondos) fora do
// estado, presa ao lugar por um fio que corre do ponto até ela, com o NOME dentro (a etiqueta do lugar,
// como nos cartões) e o ícone 3D no canto de cima à direita; pop seco ao entrar (o movimento do IconeComFio)
export const FotoComFio: React.FC<{
  arquivo: string;
  nome: string;
  icone: NomeDoIcone;
  ponto: LonLat;
  x: number;
  y: number;
  entra: number;
  sai: number;
  cor: string;
  largura?: number;
}> = ({
  arquivo,
  nome,
  icone: nomeDoIcone,
  ponto,
  x,
  y,
  entra: e,
  sai: s,
  cor,
  largura = 250,
}) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < e) return null;
  const fora = saida(f, s);
  if (fora <= 0) return null;
  const [px, py] = projetar(ponto[0], ponto[1]);
  const t = interpolate(f, [e, e + 8], [0, 1], { ...cl, easing: LINHA });
  const k = pop(f, e + 4) * fora;
  const alt = largura / proporcaoDe(arquivo);
  const d = Math.hypot(x - px, y - py) || 1;
  const recuo = Math.max(0, 1 - Math.min(largura, alt) / 2 / d);
  return (
    <>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          opacity: fora,
        }}
        width={1080}
        height={1920}
      >
        <line
          x1={px}
          y1={py}
          x2={px + (x - px) * t * recuo}
          y2={py + (y - py) * t * recuo}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.9}
          filter="drop-shadow(0 0 3px rgba(0,0,0,0.6))"
        />
        <circle
          cx={px}
          cy={py}
          r={8}
          fill={cor}
          stroke="#FFFFFF"
          strokeWidth={3}
          opacity={Math.min(1, t * 2)}
        />
      </svg>
      {k > 0 && (
        <div
          style={{
            position: "absolute",
            left: x - largura / 2,
            top: y - alt / 2,
            width: largura,
            height: alt,
            borderRadius: 14,
            overflow: "hidden",
            border: "5px solid #FFFFFF",
            boxShadow: `0 0 0 2px ${cor}66, 0 10px 22px rgba(0,0,0,0.5)`,
            transform: `scale(${k})`,
          }}
        >
          <Img
            src={staticFile(`assets/exemplo-vertical/${arquivo}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <EtiquetaDeLugar
        nome={nome}
        entra={e + 8}
        sai={s}
        x={x - largura / 2 + 14}
        y={y - alt / 2 + 14}
        cor={cor}
        corpo={Math.round(Math.max(17, largura * 0.052))}
        passo={0.5}
      />
      <IconeDestaque
        parado
        nome={nomeDoIcone}
        entra={e + 9}
        sai={s}
        x={x + largura / 2 - 18}
        y={y - alt / 2 + 6}
        tamanho={Math.round(Math.max(48, largura * 0.16))}
        cor={cor}
      />
    </>
  );
};

export const IconeComFio: React.FC<{
  nome: NomeDoIcone;
  ponto: LonLat;
  x: number;
  y: number;
  entra: number;
  sai: number;
  cor: string;
  tamanho?: number;
}> = ({ nome, ponto, x, y, entra: e, sai: s, cor, tamanho = 100 }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < e) return null;
  const fora = saida(f, s);
  if (fora <= 0) return null;
  const [px, py] = projetar(ponto[0], ponto[1]);
  // o fio corre do lugar até a borda do disco em ~8 quadros
  const t = interpolate(f, [e, e + 8], [0, 1], { ...cl, easing: LINHA });
  const d = Math.hypot(x - px, y - py) || 1;
  const fx = px + (x - px) * t * Math.max(0, 1 - tamanho / 2 / d);
  const fy = py + (y - py) * t * Math.max(0, 1 - tamanho / 2 / d);
  return (
    <>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          opacity: fora,
        }}
        width={1080}
        height={1920}
      >
        <line
          x1={px}
          y1={py}
          x2={fx}
          y2={fy}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.9}
          filter="drop-shadow(0 0 3px rgba(0,0,0,0.6))"
        />
        <circle
          cx={px}
          cy={py}
          r={8}
          fill={cor}
          stroke="#FFFFFF"
          strokeWidth={3}
          opacity={Math.min(1, t * 2)}
        />
      </svg>
      <IconeDestaque
        parado
        nome={nome}
        entra={e + 4}
        sai={s}
        x={x}
        y={y}
        tamanho={tamanho}
        cor={cor}
      />
    </>
  );
};

// UM ARCO entre dois lugares: em grande círculo (as rotas do mundo, que no Mercator saem curvas) ou numa
// curva suave com a barriga para o lado (`curva`: fração da distância; o voo do avião)
export const arco = (
  a: LonLat,
  b: LonLat,
  curva = 0.18,
  n = 48,
  grandeCirculo = false,
): LonLat[] => {
  if (grandeCirculo) {
    const g = geoInterpolate(a, b);
    return Array.from({ length: n + 1 }, (_, i) => g(i / n) as LonLat);
  }
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const c: LonLat = [mx - dy * curva, my + dx * curva];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [
      (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
      (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
    ] as LonLat;
  });
};

// A VIAGEM: um ícone 3D que percorre um caminho do mapa (o avião, o barco, a semente) de `faixa[0]` a
// `faixa[1]`, saindo rápido e freando na chegada, com o RASTRO tracejado que fica para trás. O ícone vira
// para onde anda: `giro` é o ângulo para o qual o PNG aponta (o avião do Fluent aponta para cima e à
// direita, −45°; o navio aponta para a esquerda, 180°: espelha em vez de girar). Pop seco na entrada; na
// chegada o ícone encolhe e some (`some`), o rastro fica até `sai`.
const ANDA = Easing.bezier(0.45, 0, 0.25, 1);
export const Viagem: React.FC<{
  pontos: LonLat[];
  faixa: readonly [number, number];
  icone: NomeDoIcone;
  sai: number;
  cor: string;
  tamanho?: number;
  giro?: number;
  espelhar?: boolean;
  rastro?: boolean;
  some?: boolean;
}> = ({
  pontos,
  faixa: [a, b],
  icone: nomeDoIcone,
  sai: s,
  cor,
  tamanho = 110,
  giro,
  espelhar = false,
  rastro = true,
  some = true,
}) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < a - 2) return null;
  const fora = saida(f, s);
  if (fora <= 0) return null;
  const t = interpolate(f, [a, b], [0, 1], { ...cl, easing: ANDA });
  // o caminho na tela e o comprimento acumulado
  const pts = pontos.map(([lon, lat]) => projetar(lon, lat));
  const acc = [0];
  for (let i = 1; i < pts.length; i++)
    acc.push(
      acc[i - 1] +
        Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]),
    );
  const alvo = t * acc[acc.length - 1];
  let i = 1;
  while (i < acc.length - 1 && acc[i] < alvo) i++;
  const u = (alvo - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
  const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u;
  const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
  const angulo =
    (Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180) /
    Math.PI;
  const feito = [...pts.slice(0, i), [x, y]];
  const d = `M${feito.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}`;
  const k =
    pop(f, a, 6) *
    (some
      ? interpolate(f, [b, b + 8], [1, 0], {
          ...cl,
          easing: Easing.in(Easing.cubic),
        })
      : 1) *
    fora;
  // o PNG que aponta para a esquerda espelha quando anda para a direita
  const vira = espelhar && Math.abs(angulo) < 90 ? -1 : 1;
  const rot = giro === undefined ? 0 : angulo - giro;
  return (
    <>
      {rastro && (
        <svg
          width={1080}
          height={1920}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            overflow: "visible",
            pointerEvents: "none",
            opacity: fora,
          }}
        >
          <path
            d={d}
            fill="none"
            stroke={cor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="14 12"
            filter="drop-shadow(0 0 4px rgba(0,0,0,0.6))"
          />
          <circle
            cx={pts[0][0]}
            cy={pts[0][1]}
            r={8}
            fill={cor}
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </svg>
      )}
      {k > 0 && (
        <Img
          src={staticFile(icone(nomeDoIcone))}
          style={{
            position: "absolute",
            left: x - tamanho / 2,
            top: y - tamanho / 2,
            width: tamanho,
            height: tamanho,
            objectFit: "contain",
            transform: `rotate(${rot}deg) scale(${vira * k}, ${k})`,
            filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))",
          }}
        />
      )}
    </>
  );
};

// O SELO DA BANDEIRA preso a um lugar do mapa (Londres, na cena 6): o SeloBandeira na posição projetada
export const SeloNoMapa: React.FC<{
  src: string;
  ponto: LonLat;
  entra: number;
  sai?: number;
  dx?: number;
  dy?: number;
  tamanho?: number;
}> = ({ src, ponto, entra: e, sai: s, dx = 0, dy = 0, tamanho = 120 }) => {
  const { projetar } = useMapa();
  const [x, y] = projetar(ponto[0], ponto[1]);
  return (
    <SeloBandeira
      src={src}
      entra={e}
      sai={s}
      x={x + dx}
      y={y + dy}
      tamanho={tamanho}
      foco="50% 50%"
    />
  );
};

// O MARCO DO LUGAR: só o pino vermelho (o "pino de sempre"), SEM nome e SEM ícone em cima — o cartão da foto
// já traz o nome e o ícone (pedido do usuário: repetido); o contorno ou o anel em volta vêm do Estado.tsx
// (Demarcacoes)
export const MarcoDoLugar: React.FC<{
  ponto: LonLat;
  entra: number;
  sai?: number;
}> = ({ ponto, entra, sai }) => <Pino ponto={ponto} entra={entra} sai={sai} />;
