import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile } from "remotion";
import { Grain } from "../componentes/Grain";
import { SceneTransition, TipoDeTransicao } from "../componentes/SceneTransition";
import { COLORS, FPS } from "../tema";
import { CenaPronta, VideoPronto } from "./motor";

export type CenaDoVideo = React.FC<{ c: CenaPronta }>;

const existe = (nome: string) => {
  try {
    return getStaticFiles().some((f) => f.name === nome);
  } catch {
    return false;
  }
};

// Um pedaço da tomada, com uma rampa de um quadro em cada ponta.
//
// A rampa não é capricho: a tomada é contínua e cada cena toca uma fatia dela, com o
// respiro (lead + tail) entre uma e outra. Quando a voz emenda duas frases sem pausar, o
// corte cai em cima de som e o fim abrupto vira estalo — e, se o corte pegar no meio da
// palavra, a palavra toca partida ("igno—" pausa "—ra"). O `scripts/narracao.py` corta no
// ponto mais silencioso que existir; a rampa cobre as vezes em que silêncio não existe.
const FatiaDaVoz: React.FC<{ arquivo: string; de: number; ate: number; rampa: { inicio: boolean; fim: boolean } }> = ({ arquivo, de, ate, rampa }) => {
  const total = Math.max(1, ate - de);
  return (
    <Audio
      src={staticFile(arquivo)}
      trimBefore={de}
      trimAfter={ate}
      // A rampa só existe onde a ponta cai em silêncio. Onde a fatia emenda direto na
      // vizinha (fala contínua), rampa seria um buraco de dois quadros no meio da frase.
      volume={(f) => Math.max(0, Math.min(1, rampa.inicio ? f : 1, rampa.fim ? total - 1 - f : 1))}
    />
  );
};

type Props = {
  video: VideoPronto;
  cenas: Record<string, CenaDoVideo>;
  transicao: TipoDeTransicao;
  comAudio: boolean;
  // Quanto a câmera anda devagar dentro de cada cena (o ritmo do vídeo).
  drift?: number;
  // Efeitos sonoros, em quadros do vídeo inteiro. O que não existir em public/ é ignorado.
  sons?: { arquivo: string; em: number; volume?: number }[];
  // Uma camada contínua por baixo de todas as cenas (o mapa do vídeo 13, que atravessa as
  // cenas sem cortar). As cenas desenham por cima dela; a que precisa de tela cheia cobre.
  fundo?: React.ReactNode;
  // A força do grão de filme (padrão 0,06). Sobre imagem de satélite o grão, que muda a
  // cada quadro, lê como a imagem tremendo: num vídeo de satélite, use 0 (a vinheta fica).
  grao?: number;
  // A assinatura de quem assina o vídeo (logo, @, marca d'água), no alto. Ela some na cena
  // "marca", se houver. Sem isto, o vídeo não tem assinatura nenhuma.
  assinatura?: React.ReactNode;
};

// Monta o vídeo: o fundo contínuo (o mapa), as cenas em sequência com a transição
// escolhida, a assinatura no alto, o grão e — se existir — a narração, com cada cena
// tocando o trecho dela da tomada.
export const VideoDeMapa: React.FC<Props> = ({ video, cenas, transicao, comAudio, drift = 1.03, sons = [], fundo, grao = 0.06, assinatura }) => {
  const narracao = comAudio && existe(video.arquivo);
  const musica = comAudio && existe(`music-${video.dados.numero}.mp3`);
  const fimDaMarca = video.cenas.find((c) => c.id === "marca")?.inicio ?? video.total;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {fundo}
      {video.cenas.map((c, i) => {
        const Cena = cenas[c.id];
        if (!Cena) throw new Error(`o vídeo ${video.dados.numero} não tem a cena "${c.id}"`);
        return (
          <Sequence key={c.id} from={c.inicio} durationInFrames={c.duracao} name={c.id}>
            <SceneTransition tipo={i === 0 || c.id === "marca" ? "nenhuma" : transicao} duracao={c.duracao} drift={drift}>
              <Cena c={c} />
            </SceneTransition>
          </Sequence>
        );
      })}
      {assinatura ? (
        <Sequence durationInFrames={fimDaMarca} name="assinatura">
          {assinatura}
        </Sequence>
      ) : null}
      <Grain amount={grao} />
      {narracao &&
        video.narrado &&
        video.cenas.map((c) =>
          c.trecho ? (
            <Sequence key={`voz-${c.id}`} from={c.inicio + c.lead} durationInFrames={c.duracao - c.lead} layout="none" name={`voz ${c.id}`}>
              <FatiaDaVoz arquivo={video.arquivo} de={Math.floor(c.trecho.de * FPS)} ate={Math.ceil(c.trecho.ate * FPS)} rampa={c.rampa} />
            </Sequence>
          ) : null,
        )}
      {narracao && !video.narrado && <Audio src={staticFile(video.arquivo)} />}
      {comAudio &&
        sons
          .filter((s) => existe(s.arquivo))
          .map((s, i) => (
            <Sequence key={`som-${i}`} from={s.em} layout="none" name={`som ${s.arquivo}`}>
              <Audio src={staticFile(s.arquivo)} volume={s.volume ?? 0.5} />
            </Sequence>
          ))}
      {musica && (
        <Audio
          src={staticFile(`music-${video.dados.numero}.mp3`)}
          volume={(f) => interpolate(f, [0, 20, video.total - 45, video.total], [0, narracao ? 0.16 : 0.4, narracao ? 0.16 : 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      )}
    </AbsoluteFill>
  );
};
