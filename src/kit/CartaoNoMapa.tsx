import { Easing, Img, interpolate, staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { icone } from "./Icone3D";
import type { NomeDoIcone } from "./assets";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O CARTÃO NO MAPA (linguagem "Mapas Animados", energética): uma foto com moldura branca
// que CAI sobre o mapa e fica presa ao lugar dela por um fio. Feito para o MOSAICO — vários
// cartões, um por palavra, em volta do lugar ("ele reúne praias, rios, cidades…"), todos ficam
// na tela e saem juntos por chicote.
//
//   o lugar:  na palavra, um ponto branco com aro na cor do assunto + uma onda de choque;
//   o fio:    corre do ponto até o cartão (8 quadros);
//   o cartão: cai de 1,35× desfocado e girado, passa do ponto e assenta inclinado (`giro`), com um
//             clarão branco quando pousa; a foto cresce 4% por dentro, bem devagar;
//   o selo:   um ícone 3D (opcional) no canto de cima, com pop;
//   o rótulo: o nome do lugar (opcional) numa tarja na cor do assunto, no pé do cartão, digitado;
//   a saída:  chicote para o lado (`lado`), desfocando; o fio recolhe e o ponto apaga.
//
// O cartão tem a proporção da foto (passe `proporcao`, medida no arquivo): nada é cortado.
// Vai FORA do <MapaSvg>, dentro da câmera (o ponto acompanha o mapa).
//
//   <CartaoNoMapa src="assets/sergipe/praia.jpg" proporcao={1.78} ponto={SACO} x={265} y={1230}
//     largura={440} giro={-4} entra={q("praias")} sai={q("fim")} lado={-1} cor="#3FE0B0" icone="beach_with_umbrella" />
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CartaoNoMapa: React.FC<{
  src: string;
  proporcao: number;
  ponto: LonLat;
  entra: number;
  sai?: number;
  x: number; // centro do cartão (tela)
  y: number;
  largura?: number;
  giro?: number; // inclinação final (graus)
  lado?: -1 | 1; // para onde sai o chicote
  cor?: string;
  icone?: NomeDoIcone;
  rotulo?: string;
  foco?: string;
}> = ({ src, proporcao, ponto, entra, sai = Infinity, x, y, largura = 440, giro = 0, lado = 1, cor = "#3FC8FF", icone: nomeDoIcone, rotulo, foco = "50% 50%" }) => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (f < entra || f > sai + 12) return null;
  const altura = largura / proporcao;
  const [px, py] = projetar(ponto[0], ponto[1]);

  // a saída: chicote lateral com desfoque
  const fora = Number.isFinite(sai) ? interpolate(f, [sai, sai + 9], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 0;
  // o cartão cai 3 quadros depois do ponto
  const c = f - entra - 3;
  const pousa = interpolate(c, [0, 9], [0, 1], { ...cl, easing: CURVA.pop });
  const chega = interpolate(c, [0, 6], [0, 1], cl);
  const escala = 1.35 - 0.35 * pousa;
  const rot = giro + lado * 9 * (1 - pousa);
  const desfoque = 8 * (1 - chega) + 14 * fora;
  const dx = lado * 1300 * fora;
  const clarao = interpolate(c, [7, 14], [0.75, 0], cl);
  const vida = interpolate(f, [entra, entra + 150], [1, 1.04], cl);

  // o fio: do ponto até a borda do cartão mais perto dele
  const fio = interpolate(f, [entra + 1, entra + 9], [0, 1], { ...cl, easing: CURVA.pouso }) * (1 - interpolate(f, [sai, sai + 6], [0, 1], cl));
  const bx = Math.max(x - largura / 2 + 20, Math.min(px, x + largura / 2 - 20));
  const by = py > y ? y + altura / 2 : y - altura / 2;
  const ex = px + (bx + dx - px) * fio;
  const ey = py + (by - py) * fio;

  // o ponto e a onda de choque
  const kPonto = interpolate(f, [entra, entra + 5], [0, 1], { ...cl, easing: CURVA.pop }) * (1 - interpolate(f, [sai + 2, sai + 10], [0, 1], cl));
  const choque = interpolate(f, [entra, entra + 16], [0, 1], cl);
  const onda = (((f - entra) % 30) + 30) % 30 / 30;

  // o rótulo digita depois que o cartão pousa (1 letra por quadro)
  const letras = rotulo ? Math.max(0, Math.min(rotulo.length, f - entra - 10)) : 0;
  const selo = nomeDoIcone ? interpolate(f, [entra + 9, entra + 17], [0, 1], { ...cl, easing: CURVA.pop }) : 0;

  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        {fio > 0 && (
          <g style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}>
            <line x1={px} y1={py} x2={ex} y2={ey} stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" />
            <circle cx={ex} cy={ey} r={6 * fio} fill="#FFFFFF" />
          </g>
        )}
        {kPonto > 0 && (
          <g>
            <circle cx={px} cy={py} r={14 + 70 * choque} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={(1 - choque) * kPonto} />
            <circle cx={px} cy={py} r={12 + 26 * onda} fill="none" stroke={cor} strokeWidth={3} opacity={(1 - onda) * kPonto} />
            <circle cx={px} cy={py} r={12 * kPonto} fill="#FFFFFF" stroke={cor} strokeWidth={6} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }} />
          </g>
        )}
      </svg>
      {c >= 0 && (
        <div
          style={{
            position: "absolute",
            left: x - largura / 2 + dx,
            top: y - altura / 2,
            width: largura,
            height: altura,
            transform: `scale(${escala}) rotate(${rot}deg)`,
            opacity: chega,
            filter: desfoque > 0.2 ? `blur(${desfoque.toFixed(1)}px)` : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "9px solid #FFFFFF",
              borderRadius: 8,
              overflow: "hidden",
              background: "#FFFFFF",
              boxShadow: "0 18px 34px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.4)",
            }}
          >
            <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: foco, transform: `scale(${vida})` }} />
            {clarao > 0 && <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: clarao }} />}
          </div>
          {rotulo && letras > 0 && (
            <div
              style={{
                position: "absolute",
                left: 18,
                bottom: -20,
                padding: "6px 14px",
                background: cor,
                border: "3px solid #FFFFFF",
                borderRadius: 6,
                boxShadow: "0 6px 12px rgba(0,0,0,0.45)",
                fontFamily: "Montserrat, Inter, system-ui, sans-serif",
                fontWeight: 900,
                fontSize: Math.round(largura * 0.075),
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                whiteSpace: "pre",
              }}
            >
              <span>{rotulo.slice(0, letras)}</span>
              <span style={{ opacity: 0 }}>{rotulo.slice(letras)}</span>
            </div>
          )}
          {selo > 0 && nomeDoIcone && (
            <Img
              src={staticFile(icone(nomeDoIcone))}
              style={{
                position: "absolute",
                width: 118,
                height: 118,
                top: -54,
                ...(lado < 0 ? { left: -40 } : { right: -40 }),
                transform: `scale(${selo}) rotate(${-giro * 2}deg)`,
                filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.5))",
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
