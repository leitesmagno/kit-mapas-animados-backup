import { Easing, Img, interpolate, staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import type { NomeDoIcone } from "./assets";
import { IconeDestaque } from "./IconeDestaque";
import { EtiquetaDeLugar } from "./PainelNumero";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A FOTO NO MAPA, versão ANIMADA (a linguagem dos cartões do "Alagoas"/"Pernambuco"): um cartão
// grande em cima, preso ao lugar por um fio, que troca de foto a cada lugar da narração.
//
//   entrada: o cartão salta (0,82 → 1, passa do ponto), desgira 4° e desembaça; o fio corre do
//            lugar até ele;
//   troca:   a foto nova entra DESLIZANDO da direita (com rastro desfocado) e um CLARÃO branco
//            estoura; o fio e o marcador deslizam para o lugar novo;
//   vida:    a foto anda por dentro devagar (zoom 1 → 1,04) e um BRILHO diagonal passa pelo
//            vidro logo depois de cada troca;
//   o nome:  a tarja do lugar (kit EtiquetaDeLugar: ponto na cor do assunto + nome digitado)
//            DENTRO do cartão, no canto de cima;
//   o ícone: um ícone 3D em disco de vidro (kit IconeDestaque) no canto de cima à direita, um
//            por foto — sai o da foto anterior, pousa o da nova;
//   saída:   o cartão encolhe e some (o fio recolhe).
//
// O cartão tem a LARGURA da caixa e a altura da foto da vez (passe `proporcao`, medida no
// arquivo: nada é cortado; a altura desliza na troca). Vai FORA do <MapaSvg>, dentro da câmera.
// ---------------------------------------------------------------------------

export type FotoAnimada = { src: string; proporcao: number; em: number; ponto?: LonLat; nome?: string; icone?: NomeDoIcone; foco?: string };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// a tarja do nome cabe entre o canto esquerdo e o ícone da direita: nome comprido em cartão estreito
// (a foto em pé, "TERRA TUPINAMBÁ") passava por baixo do ícone e cortava — o corpo diminui só o
// necessário (Montserrat 900 em maiúsculas, espaçamento 0,06: ~0,8 do corpo por letra, mais ~2,3
// corpos de pino e respiro), de 38 até 24 px
const corpoDoNome = (nome: string, larguraDoCartao: number, comIcone: boolean) => {
  const livre = larguraDoCartao - 26 - (comIcone ? 150 : 30);
  return Math.max(24, Math.min(38, livre / (nome.length * 0.8 + 2.3)));
};
const ABRE = 13;
const FECHA = 10;
const TROCA = 9;

export const FotoNoMapaAnimada: React.FC<{
  fotos: FotoAnimada[];
  sai: number;
  x?: number;
  y?: number; // o topo do cartão
  largura?: number;
  alturaMaxima?: number;
  cor?: string;
  passoNome?: number; // quadros por letra na digitação do nome (o padrão da EtiquetaDeLugar é 0,9)
}> = ({ fotos, sai, x = 70, y = 240, largura = 940, alturaMaxima = 640, cor = "#3FC8FF", passoNome }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const entra = fotos[0].em;
  if (f < entra || f > sai + FECHA + 8) return null;

  // a foto da vez e a anterior
  const i = fotos.reduce((k, p, j) => (p.em <= f ? j : k), 0);
  const troca = i > 0 ? interpolate(f, [fotos[i].em, fotos[i].em + TROCA], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }) : 1;

  // entrada e saída do cartão
  const pop = interpolate(f, [entra, entra + ABRE], [0, 1], { ...cl, easing: CURVA.pop });
  const chega = interpolate(f, [entra, entra + 7], [0, 1], cl);
  const fora = interpolate(f, [sai, sai + FECHA], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const vis = chega * (1 - fora);
  if (vis <= 0.001) return null;
  const escala = (0.82 + 0.18 * pop) * (1 - 0.12 * fora);
  const giro = -4 * (1 - pop);
  const desfoque = 10 * (1 - chega) + 6 * fora;

  // a altura: a da foto da vez (largura fixa), deslizando da anterior na troca
  const alt = (p: FotoAnimada) => Math.min(largura / p.proporcao, alturaMaxima);
  const altura = i > 0 ? alt(fotos[i - 1]) + (alt(fotos[i]) - alt(fotos[i - 1])) * troca : alt(fotos[i]);
  // a largura também se ajusta quando a foto em pé bate na altura máxima
  const larg = (p: FotoAnimada) => Math.min(largura, alt(p) * p.proporcao);
  const w = i > 0 ? larg(fotos[i - 1]) + (larg(fotos[i]) - larg(fotos[i - 1])) * troca : larg(fotos[i]);
  const x0 = x + (largura - w) / 2;

  // o fio e o marcador (deslizam do lugar anterior para o novo)
  const tela = (p?: LonLat) => (p ? projetar(p[0], p[1]) : null);
  const agora = tela(fotos[i].ponto);
  const antes = i > 0 ? tela(fotos[i - 1].ponto) : agora;
  const ponto = agora && antes ? ([antes[0] + (agora[0] - antes[0]) * troca, antes[1] + (agora[1] - antes[1]) * troca] as const) : agora;
  const fio = interpolate(f, [entra + 4, entra + 14], [0, 1], { ...cl, easing: CURVA.pouso }) * (1 - fora);
  const bx = ponto ? Math.max(x0 + 40, Math.min(ponto[0], x0 + w - 40)) : 0;
  const by = y + altura;
  const onda = interpolate(f, [fotos[i].em, fotos[i].em + 20], [0, 1], cl);

  // a camada de uma foto (a da vez entra deslizando da direita)
  const camada = (p: FotoAnimada, entrando: boolean) => {
    const v = interpolate(f, [p.em, p.em + 150], [0, 1], cl);
    const dx = entrando && i > 0 ? (1 - troca) * 100 : 0;
    const borra = entrando && i > 0 ? (1 - troca) * 14 : 0;
    return (
      <Img
        key={p.src + p.em}
        src={staticFile(p.src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: p.foco ?? "50% 50%",
          transform: `translateX(${dx}%) scale(${1 + 0.04 * v})`,
          filter: borra > 0.3 ? `blur(${borra.toFixed(1)}px)` : undefined,
        }}
      />
    );
  };
  // o clarão de cada troca (e da entrada) e o brilho diagonal que passa logo depois
  const desde = fotos[i].em;
  const clarao = interpolate(f, [desde + 2, desde + 10], [i > 0 ? 0.55 : 0.4, 0], cl);
  const brilho = interpolate(f, [desde + 8, desde + 26], [-0.4, 1.4], cl);

  return (
    <>
      {ponto && fio > 0 && (
        <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%">
          <line x1={ponto[0]} y1={ponto[1]} x2={ponto[0] + (bx - ponto[0]) * fio} y2={ponto[1] + (by - ponto[1]) * fio} stroke="#000" strokeOpacity={0.45 * vis} strokeWidth={5} strokeLinecap="round" />
          <line x1={ponto[0]} y1={ponto[1]} x2={ponto[0] + (bx - ponto[0]) * fio} y2={ponto[1] + (by - ponto[1]) * fio} stroke="#FFFFFF" strokeOpacity={0.95 * vis} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={ponto[0] + (bx - ponto[0]) * fio} cy={ponto[1] + (by - ponto[1]) * fio} r={6} fill="#FFFFFF" opacity={vis} />
          {onda < 1 && <circle cx={ponto[0]} cy={ponto[1]} r={12 + 46 * onda} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeOpacity={0.8 * (1 - onda) * vis} />}
          <circle cx={ponto[0]} cy={ponto[1]} r={15} fill={cor} fillOpacity={0.35 * vis} stroke={cor} strokeWidth={3} strokeOpacity={vis} />
          <circle cx={ponto[0]} cy={ponto[1]} r={7} fill="#FFFFFF" opacity={vis} />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: x0,
          top: y,
          width: w,
          height: altura,
          opacity: vis,
          transform: `scale(${escala}) rotate(${giro}deg)`,
          transformOrigin: "50% 100%",
          filter: desfoque > 0.3 ? `blur(${desfoque.toFixed(1)}px)` : undefined,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            overflow: "hidden",
            background: "#0A0E12",
            border: "6px solid #FFFFFF",
            boxShadow: `0 0 0 2px ${cor}55, 0 10px 22px rgba(0,0,0,0.45), 0 34px 70px rgba(0,0,0,0.5)`,
          }}
        >
          {i > 0 && troca < 1 && camada(fotos[i - 1], false)}
          {camada(fotos[i], true)}
          {/* o brilho diagonal no vidro */}
          {brilho > -0.4 && brilho < 1.4 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(115deg, rgba(255,255,255,0) ${(brilho - 0.18) * 100}%, rgba(255,255,255,0.35) ${brilho * 100}%, rgba(255,255,255,0) ${(brilho + 0.18) * 100}%)`,
              }}
            />
          )}
          {clarao > 0 && <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: clarao }} />}
        </div>
      </div>
      {/* o nome DENTRO do cartão (canto de cima à esquerda) e o ícone no canto de cima à direita,
          um por foto */}
      {fotos.map((p, j) => {
        const proxima = j + 1 < fotos.length ? fotos[j + 1].em : sai;
        const wl = larg(p);
        const xl = x + (largura - wl) / 2;
        return (
          <div key={p.src + j}>
            {p.nome && <EtiquetaDeLugar nome={p.nome} entra={p.em + 4} sai={proxima - 3} x={xl + 26} y={y + 24} cor={cor} corpo={corpoDoNome(p.nome, wl, !!p.icone)} passo={passoNome} />}
            {p.icone && <IconeDestaque parado nome={p.icone} entra={p.em + 5} sai={proxima - 2} x={Math.min(xl + wl - 76, 1080 - 90)} y={y + 14} tamanho={128} cor={cor} />}
          </div>
        );
      })}
    </>
  );
};
