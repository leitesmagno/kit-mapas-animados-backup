import { AbsoluteFill, useVideoConfig } from "remotion";
import { MARCA, fonteDaLegenda } from "../../marca";
import eventosJson from "./narracao/eventos.json";
import { BorraoRadial, LegendaPalavras, MarcaDagua, Mixagem, useQuadro, VazamentoDeLuz } from "../../kit";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera } from "../../base/componentes/MapCamera";
import { cameraDoVideo } from "../../base/geo/camera";
import { BaseMapa, Satelite } from "./cenas/Base";
import { Amazonas as EstadoAmazonas, Areas, Bandeiras, Demarcacoes, Estrada, MalhaMunicipal, Municipios, RegiaoNorte, Rio, Rotas, Sedes } from "./cenas/Estado";
import { Scene01Fotos, Scene01Textos } from "./cenas/Scene01Gancho";
import { Scene02Textos } from "./cenas/Scene02Divisas";
import { Scene03Textos } from "./cenas/Scene03Numeros";
import { Scene04Textos } from "./cenas/Scene04Acesso";
import { Scene05Textos } from "./cenas/Scene05Borracha";
import { Scene06Textos } from "./cenas/Scene06Sementes";
import { Scene07Textos } from "./cenas/Scene07ZonaFranca";
import { Scene09Mapa, Scene09Textos } from "./cenas/Scene09Encontro";
import { Scene10Textos } from "./cenas/Scene10Virada";
import { Scene11Textos } from "./cenas/Scene11Janauari";
import { Scene12Textos } from "./cenas/Scene12Anavilhanas";
import { Scene13Textos } from "./cenas/Scene13Figueiredo";
import { Scene14Textos } from "./cenas/Scene14Parintins";
import { Scene15Textos } from "./cenas/Scene15Maues";
import { Scene16Textos } from "./cenas/Scene16Povos";
import { Scene17Textos } from "./cenas/Scene17Neblina";
import { Scene18Fotos, Scene18Textos } from "./cenas/Scene18Fecho";
import { CENA01, CENA02, CENA03, CENA04, CENA05, CENA06, CENA07, CENA09, CENA10, CENA11, CENA12, CENA13, CENA14, CENA15, CENA16, CENA17, CENA18, CHAVES, DERIVA, DURACAO, FALAS_NO_VIDEO, FPS, FPS_DO_VIDEO, LEGENDA, LINHAS_DA_LEGENDA } from "./roteiro";
import { SONS } from "./sons";

// O EXEMPLO VERTICAL do kit ("Amazonas — o maior rio do mundo, sem uma única ponte"), no estilo Mapas
// Animados: satélite claro e vivo, regiões translúcidas com contorno branco, textos digitados, mergulhos
// com borrão radial, legenda karaokê embaixo, a marca d'água do marca.json e a trilha de fundo discreta.
// A NARRAÇÃO é o relógio (roteiro.ts); cada cena é um arquivo em cenas/ com o que desenha no mapa
// (Estado.tsx) e o que põe por cima (…Textos). As imagens reais (…Fotos) ficam fora da câmera.
// A 60 FPS: a decupagem é em quadros de 30 (useQuadro); só a Mixagem trabalha no quadro do vídeo, então
// os efeitos e o arco da trilha são convertidos aqui (× 2).
// O kit vem SEM a voz do exemplo (narracao/eventos.json tem "semAudio": true): o vídeo toca mudo, no
// tempo da narração original. Grave/gere a sua e rode `npm run sincronizar -- <pasta>`: o "semAudio" some.

const PARA_O_VIDEO = FPS_DO_VIDEO / FPS;

// a velocidade do zoom da câmera vira o borrão radial (mergulhos e recuos), por quadro de 30
const velocidadeDoZoom = (f: number, largura: number) =>
  f <= 0 ? 0 : Math.abs(cameraDoVideo(CHAVES, f, largura, 0).zoom - cameraDoVideo(CHAVES, f - 1, largura, 0).zoom);

const MUSICA = {
  src: "audio/music/documentary-background.mp3",
  corte: 22,
  fala: 0.07,
  respiro: 0.12,
  entrada: 0.8,
  forma: {
    // o arco da trilha: mais presente no gancho, desce no passado (a borracha e as sementes), sobe na virada
    // e cresce no fecho
    quadros: [0, CENA01.estado, CENA01.estado + 45, CENA05.cinza[0], CENA05.cinza[1], CENA07.cor[1], CENA10.impacto - 10, CENA10.impacto + 5, CENA11.voo[1] + 30, CENA18.recuo[0], CENA18.qual].map((q) => Math.round(q * PARA_O_VIDEO)),
    ganhos: [1.25, 1.2, 1.0, 1.0, 0.82, 1.0, 1.0, 1.3, 1.0, 0.95, 1.3],
  },
};
const SONS_NO_VIDEO = SONS.map((s) => ({ ...s, quadro: Math.round(s.quadro * PARA_O_VIDEO), duracao: s.duracao && Math.round(s.duracao * PARA_O_VIDEO) }));

// só a fala das cenas prontas (o vídeo termina no começo da próxima cena)
// (sem a voz — o kit vem assim — o vídeo toca mudo no tempo da narração original)
const COM_VOZ = !(eventosJson as { semAudio?: boolean }).semAudio;
const FALAS = COM_VOZ ? FALAS_NO_VIDEO.filter((a) => a.inicio * FPS < DURACAO) : [];
const PALAVRAS = LEGENDA.filter((p) => p.inicio * FPS < DURACAO);
const LINHAS = LINHAS_DA_LEGENDA.filter((l) => l[0].inicio * FPS < DURACAO);

export const Amazonas: React.FC = () => {
  const f = useQuadro();
  const { width } = useVideoConfig();
  // (limitado: nos mergulhos longos — do mundo à cidade — o borrão sem teto lambuzava a imagem; pente fino do
  // usuário, "tá toda borrada")
  const borrao = Math.min(0.85, Math.max(0, (velocidadeDoZoom(f, width) - 0.04) / 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={DERIVA}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <Satelite />
          {/* todas as linhas num SVG só (a ordem é a de empilhamento) */}
          <MapaSvg>
            <BaseMapa />
            <RegiaoNorte />
            <Bandeiras />
            {/* o contorno branco do Amazonas por cima das bandeiras */}
            <EstadoAmazonas />
            <MalhaMunicipal />
            <Municipios />
            <Areas />
            <Estrada />
            <Rotas />
            <Rio />
            <Sedes />
            <Scene09Mapa />
            <Demarcacoes />
          </MapaSvg>
        </BorraoRadial>
        {/* textos e ícones: por cima do mapa, presos à câmera quando precisam */}
        <Scene01Textos />
        <Scene02Textos />
        <Scene03Textos />
        <Scene04Textos />
        <Scene05Textos />
        <Scene06Textos />
        <Scene07Textos />
        <Scene09Textos />
        <Scene10Textos />
        <Scene11Textos />
        <Scene12Textos />
        <Scene13Textos />
        <Scene14Textos />
        <Scene15Textos />
        <Scene16Textos />
        <Scene17Textos />
        <Scene18Textos />
      </MapCamera>
      {/* a vinheta de cinema, leve (o satélite continua claro: é o estilo do canal) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.28) 100%)", pointerEvents: "none" }} />
      {/* as imagens reais (chicote lateral) */}
      <Scene01Fotos />
      <Scene18Fotos />
      {/* os vazamentos de luz: nos mergulhos grandes e nas revelações */}
      <VazamentoDeLuz em={CENA01.mergulho[1] - 4} forca={0.35} semente="rio" />
      <VazamentoDeLuz em={CENA01.amazonas + 2} forca={0.4} semente="amazonas" />
      <VazamentoDeLuz em={CENA01.estado + 2} forca={0.3} semente="bandeira" />
      <VazamentoDeLuz em={CENA02.regiao[1] - 4} forca={0.25} semente="norte" />
      <VazamentoDeLuz em={CENA02.divisa[1] - 4} forca={0.25} semente="vizinhos" />
      <VazamentoDeLuz em={CENA03.mergulho[1] - 4} forca={0.38} semente="manaus" />
      <VazamentoDeLuz em={CENA04.voo[1] - 4} forca={0.25} semente="br319" />
      <VazamentoDeLuz em={CENA05.voo[1] - 4} forca={0.3} semente="borracha" />
      <VazamentoDeLuz em={CENA06.recuo[1] - 4} forca={0.3} semente="mundo" />
      <VazamentoDeLuz em={CENA07.mergulho[1] - 4} forca={0.4} semente="zona-franca" />
      <VazamentoDeLuz em={CENA09.voo[1] - 4} forca={0.3} semente="encontro" />
      <VazamentoDeLuz em={CENA10.impacto + 2} forca={0.4} semente="virada" />
      <VazamentoDeLuz em={CENA11.voo[1] - 4} forca={0.3} semente="janauari" />
      <VazamentoDeLuz em={CENA12.voo[1] - 4} forca={0.3} semente="anavilhanas" />
      <VazamentoDeLuz em={CENA13.voo[1] - 4} forca={0.3} semente="figueiredo" />
      <VazamentoDeLuz em={CENA14.voo[1] - 4} forca={0.3} semente="parintins" />
      <VazamentoDeLuz em={CENA15.voo[1] - 4} forca={0.25} semente="maues" />
      <VazamentoDeLuz em={CENA16.javari + 2} forca={0.3} semente="javari" />
      <VazamentoDeLuz em={CENA17.voo[1] - 4} forca={0.35} semente="neblina" />
      <VazamentoDeLuz em={CENA18.cheio + 2} forca={0.3} semente="fecho-bandeira" />
      <VazamentoDeLuz em={CENA18.qual + 2} forca={0.4} semente="fecho" />
      {/* a legenda: uma linha de até 30 letras, BEM embaixo (logo acima da marca do canal), com a palavra
          falada acesa em amarelo, em Poppins ExtraBold com contorno preto (a legenda do "Goiás") */}
      <LegendaPalavras palavras={PALAVRAS} blocosProntos={LINHAS} y={MARCA.legenda.y} corpo={MARCA.legenda.corpo} corAtiva={MARCA.cores.palavraFalada} fonte={fonteDaLegenda()} peso={MARCA.legenda.peso} contorno={7} />
      <MarcaDagua />
      {/* a voz, os efeitos de edição e a TRILHA de fundo (a mesma do "Goiás": 0,07 sob a voz e 0,12 nos
          respiros) */}
      <Mixagem falas={FALAS} palavras={PALAVRAS} sons={SONS_NO_VIDEO} musica={MARCA.trilha ? MUSICA : undefined} />
    </AbsoluteFill>
  );
};

export { ALTURA, DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA } from "./roteiro";

// o nome com que o Root registra o exemplo
export { Amazonas as ExemploVertical };
