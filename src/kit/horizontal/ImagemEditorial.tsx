import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ImagemIA, type ImagemDoAcervo, type MovimentoDeImagem } from "../ImagemIA";

// ---------------------------------------------------------------------------
// A IMAGEM DE APOIO da identidade horizontal: entra e sai DISSOLVENDO (nada de chicote lateral, que
// é dos Shorts), com aproximação lenta por dentro (ImagemIA: nunca mostra borda) e a vinheta escura
// do documentário. O mapa continua por baixo — e a câmera voa até a vista seguinte enquanto ela cobre.
// ---------------------------------------------------------------------------

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ImagemEditorial: React.FC<{ imagem: ImagemDoAcervo; entra: number; sai: number; foco?: [number, number]; dissolve?: number }> = ({ imagem, entra, sai, foco = [0.5, 0.5], dissolve = 14 }) => {
  const f = useCurrentFrame();
  if (f < entra || f > sai + dissolve) return null;
  const o = Math.min(interpolate(f, [entra, entra + dissolve], [0, 1], cl), interpolate(f, [sai, sai + dissolve], [1, 0], cl));
  const movimento: MovimentoDeImagem = { de: { zoom: 1.02, foco }, ate: { zoom: 1.13, foco } };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* o movimento corre do começo ao fim da imagem (a Sequence implícita é o vídeo todo) */}
      <ImagemIA imagem={imagem} movimento={movimento} inicio={entra} duracao={sai + dissolve - entra} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(2,6,10,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
