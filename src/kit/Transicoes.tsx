import { AbsoluteFill, random, useVideoConfig } from "remotion";
import { pulso, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// As transições "de After Effects", feitas em código (sem arquivo de vídeo: o render
// continua offline e sem licença de terceiros).
//
//   VazamentoDeLuz — manchas de luz coloridas (rosa, branco, ciano, laranja) varrendo a
//                    tela em mistura "screen", estourando no quadro `em`. estilo Didático.
//   FlashBokeh     — clarão com bolhas de luz desfocadas subindo. estilo Ranking (abertura).
//   Clarao         — flash branco curto (o "corte" em cima de uma palavra forte).
//
// Todas ficam POR CIMA de tudo (último filho do vídeo). O corte de verdade (trocar a
// câmera, trocar a cena) acontece no quadro `em`, escondido atrás do pico da luz.
// ---------------------------------------------------------------------------

const PALETA_LUZ = ["#FF3FD2", "#FFFFFF", "#35E0FF", "#FF9A3C", "#B04BFF", "#FFE35A"];

export const VazamentoDeLuz: React.FC<{ em: number; duracao?: number; semente?: string; forca?: number }> = ({ em, duracao = 14, semente = "luz", forca = 1 }) => {
  const q = useQuadro();
  const { width, height } = useVideoConfig();
  const ini = em - duracao / 2;
  if (q < ini || q > ini + duracao) return null;
  const t = (q - ini) / duracao; // 0 → 1
  const pico = Math.sin(Math.PI * t) ** 0.7; // sobe e desce; mais largo no meio
  const manchas = Array.from({ length: 7 }, (_, i) => {
    const r = (k: string) => random(`${semente}-${i}-${k}`);
    const cor = PALETA_LUZ[Math.floor(r("c") * PALETA_LUZ.length)];
    const x = (r("x") * 1.2 - 0.1) * width + (r("dx") - 0.5) * 500 * t;
    const y = (1.1 - 1.4 * t - r("y") * 0.4) * height; // as manchas varrem de baixo para cima
    const w = (0.5 + r("w")) * width;
    const h = (0.8 + r("h") * 1.2) * height * 0.6;
    return `radial-gradient(ellipse ${w}px ${h}px at ${x}px ${y}px, ${cor} 0%, ${cor}00 70%)`;
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: manchas.join(","), mixBlendMode: "screen", opacity: forca * pico, filter: "blur(30px) saturate(1.4)" }} />
      <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: 0.6 * forca * pico }} />
    </AbsoluteFill>
  );
};

export const FlashBokeh: React.FC<{ em: number; duracao?: number; semente?: string; cor?: string }> = ({ em, duracao = 18, semente = "bokeh", cor = "#FFF6E0" }) => {
  const q = useQuadro();
  const { width, height } = useVideoConfig();
  if (q < em - 4 || q > em + duracao) return null;
  const clarao = pulso(q, em - 4, 4, duracao * 0.6);
  const t = (q - em + 4) / (duracao + 4);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${cor} 0%, ${cor}00 75%)`, opacity: 0.85 * clarao, mixBlendMode: "screen" }} />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (k: string) => random(`${semente}-${i}-${k}`);
        const d = 40 + r("d") * 140;
        const o = Math.sin(Math.PI * Math.min(1, t * (1 + r("v")))) * (0.35 + 0.5 * r("o"));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r("x") * width - d / 2,
              top: (0.25 + r("y") * 0.7) * height - t * (80 + 160 * r("s")) - d / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${cor}EE 0%, ${cor}99 55%, ${cor}00 72%)`,
              opacity: Math.max(0, o),
              filter: `blur(${2 + r("b") * 5}px)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Clarao: React.FC<{ em: number; forca?: number; cor?: string }> = ({ em, forca = 0.7, cor = "#FFFFFF" }) => {
  const q = useQuadro();
  const v = pulso(q, em - 2, 2, 10);
  if (v <= 0) return null;
  return <AbsoluteFill style={{ background: cor, opacity: forca * v, pointerEvents: "none" }} />;
};

// Desfoque de movimento "falso" para os voos rápidos de câmera: envolva o conteúdo e
// passe a velocidade (0 = parado; 1 = voo rápido). Mais barato que CameraMotionBlur.
export const BorraoDeVoo: React.FC<{ velocidade: number; children: React.ReactNode }> = ({ velocidade, children }) => (
  <AbsoluteFill style={{ filter: velocidade > 0.05 ? `blur(${Math.min(6, velocidade * 6)}px)` : undefined, transform: `scale(${1 + 0.02 * velocidade})` }}>{children}</AbsoluteFill>
);
