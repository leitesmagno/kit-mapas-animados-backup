import { Img, interpolate, staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { COR, FONTE } from "../base/estilo";
import { CURVA, entra as entrar, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Uma foto real que NASCE DO MAPA e volta para ele: MAPA → IMAGEM → MAPA sem corte seco.
//
// - entra: a janela abre a partir do ponto do mapa (um círculo pequeno sobre o lugar) e cresce
//   até o retângulo `destino`, enquanto a câmera continua andando por baixo;
// - vida: a foto anda por dentro (zoom lento + pan: `zoom`, `pan`), com um fio ligando a
//   janela ao ponto — o espectador sabe de onde a imagem veio;
// - sai: encolhe de volta para o ponto (que a câmera, a essa altura, já moveu).
// `titulo` é a palavra grande da imagem (LITORAL, SERTÃO), embaixo, dentro da janela.
// Acabamento opcional (desligado por padrão): `inclina` = a janela nasce girada em
// perspectiva (graus; o sinal escolhe o lado) e assenta reta; `faisca` = uma luz corre pelo
// fio do lugar até a janela enquanto ela abre; `brilho` = um reflexo atravessa a foto quando
// ela assenta; `premium` = sombra em camadas com halo, vinheta, brilho de vidro no topo, fio claro
// por dentro da borda e a faixa do nome mais forte. `troca` = no quadro `em`, uma cortina revela uma SEGUNDA foto no mesmo card
// (duas imagens do mesmo lugar sem fechar e reabrir a janela).
// Vai FORA do <MapaSvg> (dentro do <MapCamera>, para seguir o ponto).
// ---------------------------------------------------------------------------

export type FotoDaJanela = { src: string; foco: string };

export const JanelaFoto: React.FC<{
  foto: FotoDaJanela;
  ponto: LonLat;
  entra: number;
  sai: number;
  destino: { x: number; y: number; largura: number; altura: number };
  titulo?: string;
  corTitulo?: string;
  zoom?: readonly [number, number]; // escala da foto na entrada → na saída
  pan?: readonly [number, number]; // deslocamento horizontal da foto (px) na entrada → na saída
  raio?: number;
  abertura?: number; // quadros para abrir / fechar
  corpoTitulo?: number; // px do título (padrão 86)
  inclina?: number;
  faisca?: boolean;
  brilho?: boolean;
  premium?: boolean;
  troca?: { foto: FotoDaJanela; em: number; duracao?: number };
}> = ({ foto, ponto, entra, sai, destino, titulo, corTitulo = COR.destaque, zoom = [1.18, 1.04], pan = [-30, 30], raio = 28, abertura = 18, corpoTitulo = 86, inclina = 0, faisca = false, brilho = false, premium = false, troca }) => {
  const q = useQuadro();
  const { projetar } = useMapa();
  if (q < entra || q > sai + abertura) return null;
  const abre = entrar(q, entra, abertura, CURVA.pouso);
  const fecha = entrar(q, sai, abertura, CURVA.saida);
  const t = abre * (1 - fecha); // 0 = ponto no mapa, 1 = janela inteira
  const [px, py] = projetar(ponto[0], ponto[1]);
  const semente = 36;
  const w = semente + (destino.largura - semente) * t;
  const h = semente + (destino.altura - semente) * t;
  const cx = px + (destino.x + destino.largura / 2 - px) * t;
  const cy = py + (destino.y + destino.altura / 2 - py) * t;
  const r = semente / 2 + (raio - semente / 2) * t;
  const vida = interpolate(q, [entra, sai + abertura], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = zoom[0] + (zoom[1] - zoom[0]) * CURVA.suave(vida);
  const dx = pan[0] + (pan[1] - pan[0]) * vida;
  const texto = entrar(q, entra + abertura * 0.6, 16, CURVA.pouso) * (1 - fecha);
  // o fio sai da borda da janela mais perto do ponto
  const bx = Math.max(cx - w / 2, Math.min(px, cx + w / 2));
  const by = Math.max(cy - h / 2, Math.min(py, cy + h / 2));
  // a faísca: corre do ponto à borda enquanto a janela abre
  const fp = interpolate(q, [entra, entra + abertura + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.suave });
  const mostraFaisca = faisca && fp > 0 && fp < 1 && fecha === 0;
  // o reflexo: uma faixa clara atravessa a foto logo depois de ela assentar
  const reflexo = interpolate(q, [entra + abertura * 0.7, entra + abertura * 0.7 + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.suave });
  const giro = inclina * (1 - abre) + -inclina * 0.6 * fecha;
  // a cortina da segunda foto: corre da direita para a esquerda, com um fio de luz na frente
  const cortina = troca ? entrar(q, troca.em, troca.duracao ?? 16, CURVA.suave) : 0;
  return (
    <>
      {t > 0.05 && (
        <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%">
          <line x1={px} y1={py} x2={bx} y2={by} stroke={corTitulo} strokeWidth={2.4} strokeOpacity={0.9 * t} />
          <circle cx={px} cy={py} r={14} fill={corTitulo} opacity={0.35 * t} />
          <circle cx={px} cy={py} r={6} fill="#FFF3DC" opacity={t} />
          {mostraFaisca && (
            <>
              <circle cx={px + (bx - px) * fp} cy={py + (by - py) * fp} r={16} fill={corTitulo} opacity={0.45} />
              <circle cx={px + (bx - px) * fp} cy={py + (by - py) * fp} r={5} fill="#FFFFFF" />
            </>
          )}
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: r,
          overflow: "hidden",
          background: "#0A0E12",
          opacity: Math.min(1, t * 3),
          boxShadow: premium
            ? // sombra em camadas (perto e longe) + a borda + um halo dourado suave
              `0 12px 24px rgba(0,0,0,${0.45 * t}), 0 44px 110px rgba(0,0,0,${0.6 * t}), 0 0 0 3px ${corTitulo}${Math.round(0xdd * t).toString(16).padStart(2, "0")}, 0 0 46px ${corTitulo}${Math.round(0x40 * t).toString(16).padStart(2, "0")}`
            : `0 34px 90px rgba(0,0,0,${0.65 * t}), 0 0 0 3px ${corTitulo}${Math.round(0xcc * t).toString(16).padStart(2, "0")}`,
          pointerEvents: "none",
          transform: giro ? `perspective(1400px) rotateY(${giro}deg) rotateX(${giro * 0.35}deg)` : undefined,
        }}
      >
        <Img
          src={staticFile(foto.src)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: destino.largura,
            height: destino.altura,
            objectFit: "cover",
            objectPosition: foto.foco,
            // a foto tem sempre o tamanho final (não "espreme" enquanto a janela abre): a
            // janela é que revela mais ou menos dela, a partir do centro
            transform: `translate(${(w - destino.largura) / 2 + dx}px, ${(h - destino.altura) / 2}px) scale(${k})`,
            transformOrigin: foto.foco,
          }}
        />
        {troca && cortina > 0 && (
          <>
            <Img
              src={staticFile(troca.foto.src)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: destino.largura,
                height: destino.altura,
                objectFit: "cover",
                objectPosition: troca.foto.foco,
                clipPath: `inset(0 0 0 ${(1 - cortina) * 100}%)`,
                transform: `translate(${(w - destino.largura) / 2 + dx}px, ${(h - destino.altura) / 2}px) scale(${k * (1.06 - 0.06 * cortina)})`,
                transformOrigin: troca.foto.foco,
              }}
            />
            {cortina < 1 && (
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(1 - cortina) * 100}%`, width: 4, marginLeft: -2, background: "#FFF8EA", boxShadow: `0 0 24px 6px ${corTitulo}` }} />
            )}
          </>
        )}
        {brilho && reflexo > 0 && reflexo < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent ${-40 + 140 * reflexo}%, rgba(255,248,234,0.38) ${-25 + 140 * reflexo}%, transparent ${-10 + 140 * reflexo}%)`,
              mixBlendMode: "screen",
            }}
          />
        )}
        {premium && (
          <>
            {/* a vinheta (o olho vai para o meio da foto) e o brilho de vidro no topo */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,6,9,0.42) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 22%)", pointerEvents: "none" }} />
            {/* o fio claro por dentro da borda */}
            <div style={{ position: "absolute", inset: 0, borderRadius: r, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.28)", pointerEvents: "none" }} />
          </>
        )}
        {titulo && (
          <>
            <div style={{ position: "absolute", inset: 0, background: premium ? "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(6,9,12,0.55) 72%, rgba(6,9,12,0.92) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(6,9,12,0.8) 100%)", opacity: texto }} />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 30 * t,
                textAlign: "center",
                fontFamily: FONTE,
                fontSize: corpoTitulo,
                fontWeight: 800,
                letterSpacing: `${0.14 + 0.1 * (1 - texto)}em`,
                paddingLeft: `${0.14 + 0.1 * (1 - texto)}em`,
                color: COR.tinta,
                opacity: texto,
                transform: `translateY(${(1 - texto) * 20}px)`,
                textShadow: "0 4px 26px rgba(0,0,0,0.8)",
                whiteSpace: "nowrap",
              }}
            >
              {titulo}
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 22 * t,
                width: 300 * texto,
                height: 3,
                transform: "translateX(-50%)",
                background: `linear-gradient(90deg, transparent, ${corTitulo}, transparent)`,
                boxShadow: `0 0 12px ${corTitulo}`,
              }}
            />
          </>
        )}
      </div>
    </>
  );
};
