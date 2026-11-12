import { Img, interpolate, staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import type { FotoDaJanela } from "./JanelaFoto";
import { CURVA, entra as entrar, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A FOTO NO MAPA, na linguagem SÓBRIA do documentário: um card retangular preso ao lugar por
// um fio fino, com UMA gramática só do começo ao fim do vídeo —
//
//   entrada: fade + escala 0,96 → 1 (e sobe 18 px), sem quique;
//   vida:    a foto anda por dentro, bem devagar (zoom 1 → 1,06 e um pan pequeno);
//   troca:   a próxima foto entra por cima num fade de 10 quadros, assentando de 1,05 → 1, e o
//            fio e o marcador DESLIZAM para o lugar dela (uma sequência de lugares num card só);
//            com `troca="cortina"`, ela entra numa cortina da esquerda para a direita, com um fio
//            claro na frente (16 quadros) — para quando a MUDANÇA é o assunto ("o cenário muda");
//   saída:   fade + escala → 0,98 (e sobe 10 px).
//
// Sem brilho, sem inclinação, sem faísca: borda clara fina, sombra em duas camadas. O card tem
// a proporção da foto (passe `caixa` com a mesma razão da imagem: a paisagem não é cortada).
// Vai FORA do <MapaSvg>, dentro da câmera (o marcador acompanha o mapa).
//
//   <FotoNoMapa caixa={{ x: 90, y: 250, largura: 900, altura: 600 }} sai={q("dentro")}
//     fotos={[{ foto: praia, em: q("praias"), ponto: PIPA }, { foto: duna, em: q("dunas"), ponto: GENIPABU }]} />
// ---------------------------------------------------------------------------

// `proporcao` (largura/altura): o cartão fica na proporção DESSA foto (mesma largura da caixa, a
// altura muda na troca) — a foto aparece inteira, sem corte
export type FotoDaSequencia = { foto: FotoDaJanela; em: number; ponto?: LonLat; legenda?: string; proporcao?: number };

const ABRE = 14;
const FECHA = 12;
const TROCA = 10;

export const FotoNoMapa: React.FC<{
  fotos: FotoDaSequencia[];
  sai: number;
  caixa: { x: number; y: number; largura: number; altura: number };
  cor?: string; // o marcador e o fio da legenda
  raio?: number;
  zoomInterno?: number; // quanto a foto cresce por dentro na vida dela (1,06 = 6%)
  troca?: "fade" | "cortina";
}> = ({ fotos, sai, caixa, cor = "#F2B45A", raio = 16, zoomInterno = 1.06, troca: modo = "fade" }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const entra = fotos[0].em;
  if (f < entra || f > sai + FECHA) return null;
  const e = entrar(f, entra, ABRE, CURVA.pouso);
  const x = entrar(f, sai, FECHA, CURVA.saida);
  const vis = e * (1 - x);
  if (vis <= 0.001) return null;
  const escala = 0.96 + 0.04 * e - 0.02 * x;
  const sobe = (1 - e) * 18 + x * -10;

  // a foto da vez e a anterior (só as duas são desenhadas)
  const i = fotos.reduce((k, p, j) => (p.em <= f ? j : k), 0);
  const cortina = modo === "cortina";
  const troca = i > 0 ? entrar(f, fotos[i].em, cortina ? 16 : TROCA, CURVA.suave) : 1;

  // a altura do cartão: a da foto da vez (na proporção dela), deslizando da anterior na troca
  const altDe = (p: FotoDaSequencia) => (p.proporcao ? caixa.largura / p.proporcao : caixa.altura);
  const altura = i > 0 ? altDe(fotos[i - 1]) + (altDe(fotos[i]) - altDe(fotos[i - 1])) * troca : altDe(fotos[i]);
  // o marcador e o fio: deslizam do lugar anterior para o novo durante a troca
  const tela = (p?: LonLat) => (p ? projetar(p[0], p[1]) : null);
  const agora = tela(fotos[i].ponto);
  const antes = i > 0 ? tela(fotos[i - 1].ponto) : agora;
  const ponto = agora && antes ? ([antes[0] + (agora[0] - antes[0]) * troca, antes[1] + (agora[1] - antes[1]) * troca] as const) : agora;
  const visivel = ponto && ponto[0] > -5000;
  // o fio sai da borda de baixo do card (o card fica acima do lugar), no x mais perto do ponto
  const bx = visivel ? Math.max(caixa.x + raio * 2, Math.min(ponto[0], caixa.x + caixa.largura - raio * 2)) : 0;
  const by = caixa.y + altura + sobe;
  const fio = interpolate(f, [entra + 4, entra + ABRE + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.suave }) * (1 - x);
  const anel = i > 0 ? interpolate(f, [fotos[i].em, fotos[i].em + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(f, [entra, entra + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const camada = (p: FotoDaSequencia, opacidade: number, assenta: number, recorte?: number) => {
    // a vida da foto: zoom lento e um pan pequeno, alternando o lado a cada foto
    const v = interpolate(f, [p.em, p.em + 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lado = fotos.indexOf(p) % 2 ? -1 : 1;
    const k = (1 + (zoomInterno - 1) * v) * assenta;
    return (
      <Img
        key={p.foto.src + p.em}
        src={staticFile(p.foto.src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: p.foto.foco,
          opacity: opacidade,
          clipPath: recorte !== undefined ? `inset(0 ${(1 - recorte) * 100}% 0 0)` : undefined,
          transform: `translateX(${lado * (v - 0.5) * caixa.largura * 0.012}px) scale(${k})`,
          transformOrigin: p.foto.foco,
        }}
      />
    );
  };

  return (
    <>
      {visivel && fio > 0 && (
        <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%">
          {/* o fio: uma sombra escura embaixo (descola do satélite) e a linha clara */}
          <line x1={ponto[0]} y1={ponto[1]} x2={ponto[0] + (bx - ponto[0]) * fio} y2={ponto[1] + (by - ponto[1]) * fio} stroke="#000" strokeOpacity={0.4 * vis} strokeWidth={4} strokeLinecap="round" />
          <line x1={ponto[0]} y1={ponto[1]} x2={ponto[0] + (bx - ponto[0]) * fio} y2={ponto[1] + (by - ponto[1]) * fio} stroke="#FFFFFF" strokeOpacity={0.85 * vis} strokeWidth={1.6} strokeLinecap="round" />
          {/* o marcador: um ponto claro com anel; uma onda única quando o lugar chega */}
          {anel < 1 && <circle cx={ponto[0]} cy={ponto[1]} r={10 + 30 * anel} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeOpacity={0.7 * (1 - anel) * vis} />}
          <circle cx={ponto[0]} cy={ponto[1]} r={13} fill="none" stroke={cor} strokeWidth={2.2} strokeOpacity={0.9 * vis} />
          <circle cx={ponto[0]} cy={ponto[1]} r={5.5} fill="#FFFFFF" opacity={vis} />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: caixa.x,
          top: caixa.y,
          width: caixa.largura,
          height: altura,
          borderRadius: raio,
          overflow: "hidden",
          background: "#0A0E12",
          opacity: vis,
          transform: `translateY(${sobe}px) scale(${escala})`,
          transformOrigin: "50% 100%",
          boxShadow: "0 6px 16px rgba(0,0,0,0.38), 0 26px 64px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      >
        {i > 0 && camada(fotos[i - 1], 1, 1)}
        {cortina && i > 0 ? camada(fotos[i], 1, 1.03 - 0.03 * troca, troca) : camada(fotos[i], troca, 1.05 - 0.05 * troca)}
        {cortina && i > 0 && troca > 0 && troca < 1 && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${troca * 100}%`, width: 3, marginLeft: -1.5, background: "#FFFFFF", boxShadow: "0 0 18px rgba(255,255,255,0.7)" }} />
        )}
        {/* a borda clara fina, por dentro */}
        <div style={{ position: "absolute", inset: 0, borderRadius: raio, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.5)" }} />
        {fotos[i].legenda && (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "38%", background: "linear-gradient(180deg, rgba(6,9,12,0) 0%, rgba(6,9,12,0.72) 100%)", opacity: troca }} />
            <div
              style={{
                position: "absolute",
                left: 36,
                bottom: 30,
                fontFamily: FONTE,
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "#FFFFFF",
                opacity: troca,
                textShadow: "0 2px 14px rgba(0,0,0,0.6)",
                whiteSpace: "nowrap",
              }}
            >
              {fotos[i].legenda}
            </div>
          </>
        )}
      </div>
    </>
  );
};
