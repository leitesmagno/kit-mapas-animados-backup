import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// A MIXAGEM de um vídeo narrado (o "AudioMixer"): NARRAÇÃO > música > efeitos. É a mesma
// conta da Trilha dos vídeos "Piauí", "Lugares" e "Codó pelo mapa", trazida para o kit:
//
// - Narração: cada fala no instante que o sincronizar calculou (volume 1, a referência; os
//   arquivos já saem do tratamento em −16 LUFS).
// - Música: `fala` sob a voz, `respiro` nos buracos (ducking pelas palavras do Whisper: desce
//   0,25 s antes da voz, volta 0,6 s depois); cresce um pouco depois da última palavra.
// - Efeitos: no quadro do evento visual; em cima de fala, ~4 dB mais baixos.
// ---------------------------------------------------------------------------

export type Fala = { arquivo: string; inicio: number }; // s
export type PalavraNoTempo = { inicio: number; fim: number }; // s
// `desde` (quadros): começa o arquivo a partir desse ponto (um trecho de um som longo, como o mar);
// `duracao` (quadros): corta o som depois disso, com fade de 8 quadros (e 4 de entrada se `desde`)
export type Som = { quadro: number; arquivo: string; volume: number; motivo: string; desde?: number; duracao?: number };
// `forma`: o arco da trilha no vídeo — quadros e ganhos (multiplica o ducking): começa contida
// no gancho e cresce aos poucos, por exemplo. Sem `forma`, a trilha fica no mesmo nível.
export type Musica = { src: string; fala?: number; respiro?: number; corte?: number; entrada?: number; forma?: { quadros: number[]; ganhos: number[] } };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const blocosDeFala = (palavras: PalavraNoTempo[], fps: number): [number, number][] => {
  const blocos: [number, number][] = [];
  for (const p of palavras) {
    const a = p.inicio * fps;
    const b = p.fim * fps;
    const ultimo = blocos[blocos.length - 1];
    if (ultimo && a - ultimo[1] < 0.45 * fps) ultimo[1] = b;
    else blocos.push([a, b]);
  }
  return blocos;
};

// 0–1: o quanto a voz está presente no quadro (com as rampas do ducking)
export const falando = (blocos: [number, number][], f: number, fps: number) => {
  let v = 0;
  for (const [a, b] of blocos) {
    const antes = interpolate(f, [a - 0.25 * fps, a], [0, 1], cl);
    const depois = interpolate(f, [b, b + 0.6 * fps], [1, 0], cl);
    v = Math.max(v, Math.min(antes, depois));
  }
  return v;
};

// `ganhoSons`: multiplica o volume de TODOS os efeitos (calibrar o vídeo inteiro de uma vez)
export const Mixagem: React.FC<{ falas: Fala[]; palavras: PalavraNoTempo[]; musica?: Musica; sons?: Som[]; ganhoSons?: number }> = ({ falas, palavras, musica, sons = [], ganhoSons = 1 }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const blocos = blocosDeFala(palavras, fps);
  const fimDaFala = (palavras.at(-1)?.fim ?? 0) * fps;
  const { fala = 0.055, respiro = 0.11, corte = 0, entrada = 1.2 } = musica ?? {};
  return (
    <>
      {falas.map((a) => (
        // premontada 2 s antes: no Studio a fala já está carregada quando chega a vez dela (sem
        // isso, num trecho pesado — mergulho com borrão — o Studio trava e a voz some até o
        // arquivo carregar). No render não muda nada.
        <Sequence key={a.arquivo} from={Math.round(a.inicio * fps)} premountFor={2 * fps} style={{ pointerEvents: "none" }} name={`narração ${a.arquivo}`}>
          <Audio src={staticFile(a.arquivo)} volume={1} />
        </Sequence>
      ))}
      {musica && (
        <Sequence from={0} durationInFrames={durationInFrames} layout="none" name="música">
          <Audio
            src={staticFile(musica.src)}
            trimBefore={Math.round(corte * fps)}
            volume={(f) => {
              const duck = respiro + (fala - respiro) * falando(blocos, f, fps);
              const sobe = interpolate(f, [0, entrada * fps], [0, 1], cl);
              const cauda = interpolate(f, [fimDaFala, fimDaFala + 0.8 * fps], [1, 1.6], cl);
              const sai = interpolate(f, [durationInFrames - 1.6 * fps, durationInFrames - 2], [1, 0], cl);
              const arco = musica.forma ? interpolate(f, musica.forma.quadros, musica.forma.ganhos, cl) : 1;
              return duck * sobe * cauda * sai * arco;
            }}
          />
        </Sequence>
      )}
      {sons.map((s, i) => {
        const sobreFala = falando(blocos, s.quadro, fps) > 0.5;
        return (
          <Sequence key={i} from={Math.max(0, s.quadro)} durationInFrames={s.duracao} layout="none" name={`som: ${s.motivo}`}>
            <Audio
              src={staticFile(s.arquivo)}
              startFrom={s.desde}
              volume={(q) => {
                const base = Math.min(1, s.volume * ganhoSons * (sobreFala ? 0.63 : 1));
                const entra = s.desde ? interpolate(q, [0, 4], [0, 1], cl) : 1;
                const sai = s.duracao ? interpolate(q, [s.duracao - 8, s.duracao], [1, 0], cl) : 1;
                return base * entra * sai;
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};
