import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../geo/camera";
import { COR, FONTE } from "../estiloLugares";

// O nome de um lugar de destaque (DELTA DO PARNAÍBA, SERRA DA CAPIVARA) fixo no alto da
// tela, dentro da área segura: a linha fina de cima em tipo de instrumento, o nome subindo
// de trás de uma máscara e um fio que abre do centro. Não é geografia (o mapa está andando
// embaixo), é o "letreiro" da cena. Nome comprido: "\n" no título quebra a linha (cada linha
// sobe da sua máscara, uma logo depois da outra).
export const TituloDeLugar: React.FC<{
  titulo: string;
  subtitulo?: string;
  entra: number;
  sai?: number;
  y?: number; // centro do bloco
  tamanho?: number;
  tamanhoSubtitulo?: number;
  cor?: string;
}> = ({ titulo, subtitulo, entra, sai = Infinity, y = 330, tamanho = 66, tamanhoSubtitulo = 22, cor = COR.destaque }) => {
  const q = useCurrentFrame();
  if (q < entra) return null;
  const o = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const saida = Number.isFinite(sai) ? interpolate(q, [sai, sai + 16], [0, 1], { ...o, easing: EASE.cinema }) : 0;
  if (saida >= 1) return null;
  const nome = interpolate(q, [entra, entra + 22], [0, 1], { ...o, easing: EASE.pouso });
  const sub = interpolate(q, [entra + 10, entra + 28], [0, 1], { ...o, easing: EASE.pouso });
  const fio = interpolate(q, [entra + 6, entra + 34], [0, 1], { ...o, easing: EASE.cinema });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) translateY(${-saida * 20}px)`,
        opacity: 1 - saida,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: FONTE,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-70px 0",
          background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(3,6,9,0.62) 0%, rgba(3,6,9,0) 100%)",
          opacity: nome,
        }}
      />
      {subtitulo && (
        <div
          style={{
            position: "relative",
            fontSize: tamanhoSubtitulo,
            fontWeight: 700,
            letterSpacing: `${0.46 + 0.2 * (1 - sub)}em`,
            paddingLeft: `${0.46 + 0.2 * (1 - sub)}em`,
            textTransform: "uppercase",
            color: cor,
            opacity: sub,
            marginBottom: 12,
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
          }}
        >
          {subtitulo}
        </div>
      )}
      {/* cada linha ("\n" quebra) sobe de trás da própria máscara, um pouco depois da anterior */}
      {titulo.split("\n").map((linha, i) => {
        const sobe = i === 0 ? nome : interpolate(q, [entra + 5 * i, entra + 22 + 5 * i], [0, 1], { ...o, easing: EASE.pouso });
        return (
          <div key={i} style={{ position: "relative", overflow: "hidden", padding: "2px 16px 8px", marginTop: i ? -6 : 0 }}>
            <div
              style={{
                fontSize: tamanho,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: COR.tinta,
                lineHeight: 1,
                whiteSpace: "nowrap",
                transform: `translateY(${(1 - sobe) * 110}%)`,
                textShadow: "0 4px 30px rgba(0,0,0,0.75)",
              }}
            >
              {linha}
            </div>
          </div>
        );
      })}
      <div style={{ position: "relative", marginTop: 14, width: 460 * fio, height: 2, background: `linear-gradient(90deg, transparent, ${cor}, transparent)`, boxShadow: `0 0 12px ${cor}` }} />
    </div>
  );
};
