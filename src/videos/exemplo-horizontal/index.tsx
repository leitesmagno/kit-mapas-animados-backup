import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { LogoDoCanal } from "../../kit";
import { LegendaDoc } from "../../kit/horizontal";
import { CapitulosNaTela, ImagensDasBatidas, MapaDasBatidas, TextosDasBatidas } from "../../kit/documentario";
import { ImagemIA, imagemDoManifesto, type ManifestoDeImagens } from "../../kit/ImagemIA";
import { Mixagem } from "../../kit/Mixagem";
import { MapBackground, Vinheta } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera } from "../../base/componentes/MapCamera";
import manifestoDaCapa from "./capa/manifesto.json";
import { BaseMapa, Satelite } from "./cenas/Base";
import { pais } from "./dados";
import manifesto from "./imagens/manifesto.json";
import { MARCA } from "../../marca";
import eventosJson from "./narracao/eventos.json";
import { BATIDAS, CAPITULOS_NA_TELA, CHAVES, DERIVA, FALAS_NO_VIDEO, INICIO_DA_CARTELA, PALAVRAS, PROBLEMAS } from "./roteiro";

// ---------------------------------------------------------------------------
// O EXEMPLO HORIZONTAL do kit: "ESTREITO DE ORMUZ", o documentário horizontal (16:9): o MESMO motor dos verticais (MapCamera,
// satélite, kit, narração ElevenLabs → Whisper, LegendaPalavras, Mixagem), com o perfil horizontal
// (motor/formato.ts) e as cenas DECLARADAS em cenas.ts (motor em src/kit/documentario): países com
// a bandeira dentro, nomes digitados, rotas, painéis, ícones 3D e as imagens de apoio (IA) entrando
// por chicote, com a câmera voando por baixo delas até a vista seguinte.
//
//   npm run imagens -- gerar exemplo-horizontal   as imagens (etapa separada; o kit vem com imagens "TROQUE")
//   npm run render -- ExemploHorizontal           renderiza
//   npm run thumb -- exemplo-horizontal           a thumbnail (1280×720)
//   npm run publicacao -- exemplo-horizontal      capítulos, descrição, fontes e legenda .srt
// O kit vem SEM a voz do exemplo (narracao/eventos.json tem "semAudio": true): toca mudo, no tempo da
// narração original, até você gravar/gerar a sua e rodar `npm run sincronizar -- exemplo-horizontal`.
// ---------------------------------------------------------------------------

const COM_VOZ = !(eventosJson as { semAudio?: boolean }).semAudio;

export const Ormuz: React.FC = () => {
  if (PROBLEMAS.length) throw new Error(`o roteiro não bate com o áudio:\n${PROBLEMAS.join("\n")}`);
  // a identidade horizontal: o mapa escuro do São Luís / Piauí / Ceará, sem borrão nos voos (a
  // câmera van Wijk já é suave), a vinheta de lente por cima do mapa e embaixo dos textos
  return (
    <AbsoluteFill style={{ backgroundColor: "#05090D" }}>
      <MapCamera chaves={CHAVES} deriva={DERIVA}>
        <MapBackground />
        <Satelite />
        <MapaSvg>
          <BaseMapa />
          <MapaDasBatidas batidas={BATIDAS} pais={pais} />
        </MapaSvg>
        <Vinheta />
        <TextosDasBatidas batidas={BATIDAS} />
      </MapCamera>
      {/* as imagens de apoio (chicote lateral), fora da câmera */}
      <ImagensDasBatidas batidas={BATIDAS} manifesto={manifesto as ManifestoDeImagens} />
      {/* a cartela de abertura de cada capítulo (do 2º em diante) */}
      <CapitulosNaTela capitulos={CAPITULOS_NA_TELA} />
      {/* a legenda do documentário (kit/horizontal: menor, baixa, a palavra falada em destaque; some na
          vinheta final) e o selo do canal no canto de baixo à direita, do primeiro ao último quadro */}
      <LegendaDoc palavras={PALAVRAS} ate={INICIO_DA_CARTELA} />
      <LogoDoCanal />
      {/* a narração e a trilha de fundo (Mixkit, "Feedback Dreams", emendada em 7 min sem corte): baixa
          sob a voz, sobe um pouco nos respiros e na vinheta final, e some nos últimos 1,6 s */}
      <Mixagem falas={COM_VOZ ? FALAS_NO_VIDEO : []} palavras={PALAVRAS} musica={MARCA.trilha ? { src: "audio/music/documentary-background-longo.mp3", fala: 0.06, respiro: 0.12, entrada: 2.0 } : undefined} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// A THUMBNAIL (1280×720): o fundo vem do conjunto "capa" do motor de imagens (guardado à parte dos
// assets do vídeo) e o TÍTULO é código — troca-se o texto pelas props, sem gerar imagem nova:
//   npx remotion still OrmuzCapa out/capa.png --props='{"linhas":["OUTRO","TÍTULO"]}'
// `fundo` escolhe outra alternativa gerada (o id no capa/pedidos.json).
// ---------------------------------------------------------------------------
export type PropsDaCapa = { linhas: string[]; destaque: string; fundo: string };
export const CAPA_PADRAO: PropsDaCapa = { linhas: ["O CORREDOR", "DO PETRÓLEO"], destaque: "ESTREITO DE ORMUZ", fundo: "capa-petroleiro" };

export const OrmuzCapa: React.FC<PropsDaCapa> = ({ linhas, destaque, fundo }) => {
  const { height } = useVideoConfig();
  const imagem = imagemDoManifesto(manifestoDaCapa as ManifestoDeImagens, fundo);
  const corpo = height * 0.15;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ImagemIA imagem={imagem} movimento={{ de: { zoom: 1.0, foco: [0.6, 0.5] } }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,10,14,0.78) 0%, rgba(2,10,14,0.42) 42%, rgba(2,10,14,0) 64%)" }} />
      <div style={{ position: "absolute", left: height * 0.075, top: "50%", transform: "translateY(-50%)", fontFamily: "Inter", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em" }}>
        {linhas.map((l, i) => (
          <div key={i} style={{ fontSize: corpo, color: "#FFFFFF", textShadow: "0 6px 26px rgba(0,0,0,0.6)" }}>
            {l}
          </div>
        ))}
        <div style={{ display: "inline-block", marginTop: corpo * 0.28, padding: `${corpo * 0.1}px ${corpo * 0.22}px`, background: "#F2B45A", color: "#101418", fontSize: corpo * 0.36, fontWeight: 800, letterSpacing: "0.18em", borderRadius: 4 }}>{destaque}</div>
      </div>
      {/* a identidade do canal: a logo no canto de cima (o canto de baixo é o da duração no YouTube) */}
      {MARCA.logoRedonda ? <Img src={staticFile(MARCA.logoRedonda)} style={{ position: "absolute", left: height * 0.075, top: height * 0.05, width: height * 0.13, height: height * 0.13, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }} /> : null}
    </AbsoluteFill>
  );
};

export { Ormuz as ExemploHorizontal, OrmuzCapa as ExemploHorizontalCapa };
export { ALTURA, DURACAO, FPS, LARGURA } from "./roteiro";
