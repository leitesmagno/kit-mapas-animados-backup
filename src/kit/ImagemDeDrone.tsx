import { AbsoluteFill, Easing, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// IMAGEM DE DRONE — o "trecho real" do estilo "Mapas Animados" (references/movimento.md
// §2.5 e §2.18): a imagem do lugar, que entra e sai por CHICOTE LATERAL (arrastada na
// horizontal com borrão de movimento, 10 quadros, sai rápido e freia forte) e, por dentro, anda
// devagar como um drone (zoom lento + deslize).
//
// Dois modos:
//   "tela"   — a foto em tela cheia, recortada na vertical (para foto em pé ou bem larga);
//   "cartao" — a foto DEITADA inteira, na largura da tela (cantos arredondados, fio branco,
//              sombra funda), sobre ela mesma ampliada, desfocada e escurecida (o fundo do
//              vertical profissional: nada da foto se perde no recorte). Passe a `proporcao`
//              (largura/altura) da foto.
// O acabamento dos dois: correção de cor, vinheta, um CLARÃO curto quando a foto assenta e um
// REFLEXO que passa uma vez por cima dela. No chicote, o cartão gira um pouco em 3D.
//
// `entra`/`sai` em quadros: o chicote de entrada termina em entra+10; o de saída começa em
// `sai`. `corteNaEntrada`/`corteNaSaida` trocam o chicote por CORTE SECO (duas imagens
// seguidas). `sentido` 1 = vem da direita. Vai FORA da câmera do mapa (tela), por baixo da
// legenda e da marca d'água.
// ---------------------------------------------------------------------------

const CHICOTE = Easing.bezier(0.8, 0, 0.2, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const QUADROS = 10;
const GRADE = "saturate(1.15) contrast(1.06) brightness(1.03)";

export const ImagemDeDrone: React.FC<{
  src: string;
  entra: number;
  sai: number;
  modo?: "tela" | "cartao";
  proporcao?: number; // largura/altura da foto (modo cartão)
  alturaMaxima?: number; // px (modo cartão): a foto em pé fica deste tamanho, mais estreita, sem corte
  y?: number; // o centro do cartão (px de tela)
  foco?: string; // object-position da foto recortada (modo tela)
  zoom?: readonly [number, number]; // escala no começo e no fim (o "drone" chegando)
  deslize?: readonly [number, number]; // px em x e y ao longo da imagem
  sentido?: 1 | -1;
  corteNaEntrada?: boolean;
  corteNaSaida?: boolean;
}> = ({
  src,
  entra,
  sai,
  modo = "tela",
  proporcao = 1.5,
  alturaMaxima,
  y = 860,
  foco = "50% 50%",
  zoom = [1.06, 1.16],
  deslize = [-40, 0],
  sentido = 1,
  corteNaEntrada = false,
  corteNaSaida = false,
}) => {
  const f = useQuadro();
  const { width, height } = useVideoConfig();
  const fim = corteNaSaida ? sai : sai + QUADROS;
  if (f < entra || f >= fim) return null;

  // a posição do chicote (px) e a velocidade dele (px/quadro), que vira o borrão
  const x = (q: number) => {
    const dentro = corteNaEntrada ? 0 : interpolate(q, [entra, entra + QUADROS], [sentido * width, 0], { ...cl, easing: CHICOTE });
    const fora = corteNaSaida ? 0 : interpolate(q, [sai, sai + QUADROS], [0, -sentido * width], { ...cl, easing: CHICOTE });
    return dentro + fora;
  };
  const px = x(f);
  const v = x(f) - x(f - 1);
  const copias = Math.abs(v) > 6 ? 6 : 0;

  // o drone: zoom e deslize lineares do primeiro ao último quadro em tela
  const t = interpolate(f, [entra, fim], [0, 1], cl);
  const escala = zoom[0] + (zoom[1] - zoom[0]) * t;
  const dx = deslize[0] * t;
  const dy = deslize[1] * t;

  // o clarão quando assenta e o reflexo que passa uma vez
  const assenta = corteNaEntrada ? entra : entra + QUADROS - 2;
  const clarao = interpolate(f, [assenta, assenta + 2, assenta + 9], [0, 0.32, 0], cl);
  const reflexo = interpolate(f, [assenta + 4, assenta + 26], [-40, 140], cl);

  const foto = (estilo: React.CSSProperties = {}) => (
    <Img
      src={staticFile(src)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: foco, transform: `translate(${dx}px, ${dy}px) scale(${escala})`, filter: GRADE, ...estilo }}
    />
  );

  if (modo === "tela") {
    const camada = (k: number, opacidade: number) => (
      <AbsoluteFill key={k} style={{ transform: `translateX(${px - (v * k) / 2}px)`, opacity: opacidade, overflow: "hidden" }}>
        {foto()}
      </AbsoluteFill>
    );
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {Array.from({ length: copias }, (_, i) => camada(copias - i, 0.22)).reverse()}
        {camada(0, copias ? 0.75 : 1)}
        <AbsoluteFill style={{ transform: `translateX(${px}px)` }}>
          {/* a vinheta (a legenda branca continua legível embaixo) */}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%), linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.4) 100%)" }} />
          <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,255,255,0) ${reflexo - 12}%, rgba(255,255,255,0.16) ${reflexo}%, rgba(255,255,255,0) ${reflexo + 12}%)` }} />
          <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: clarao }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // o cartão: a foto inteira na largura da tela, sobre ela mesma desfocada
  // na PROPORÇÃO da foto, sem corte: se a altura passa do limite (foto em pé), o cartão fica mais
  // estreito em vez de recortar a foto
  const largMax = width - 68;
  const alt = Math.min(largMax / proporcao, alturaMaxima ?? height * 0.62);
  const larg = alt * proporcao;
  const margem = (width - larg) / 2;
  // o giro 3D do chicote (o cartão "vira" um pouco no sentido do movimento)
  const giro = (-px / width) * 28 * sentido;
  const camadaCartao = (k: number, opacidade: number) => (
    <div
      key={k}
      style={{
        position: "absolute",
        left: margem,
        top: y - alt / 2,
        width: larg,
        height: alt,
        borderRadius: 30,
        overflow: "hidden",
        opacity: opacidade,
        transform: `translateX(${px - (v * k) / 2}px) perspective(1600px) rotateY(${giro}deg)`,
        border: k === 0 ? "5px solid rgba(255,255,255,0.92)" : undefined,
        boxShadow: k === 0 ? "0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.3)" : undefined,
      }}
    >
      {foto({ objectPosition: "50% 50%" })}
      {k === 0 && (
        <>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)" }} />
          <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,255,255,0) ${reflexo - 12}%, rgba(255,255,255,0.22) ${reflexo}%, rgba(255,255,255,0) ${reflexo + 12}%)` }} />
          <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: clarao }} />
        </>
      )}
    </div>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* o fundo: a própria foto, ampliada, desfocada e escurecida (anda junto com o chicote) */}
      <AbsoluteFill style={{ transform: `translateX(${px}px)`, overflow: "hidden" }}>
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.25 + 0.1 * t})`, filter: "blur(38px) saturate(1.4) brightness(0.55)" }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.45) 100%)" }} />
      </AbsoluteFill>
      {Array.from({ length: copias }, (_, i) => camadaCartao(copias - i, 0.2)).reverse()}
      {camadaCartao(0, copias ? 0.8 : 1)}
    </AbsoluteFill>
  );
};
