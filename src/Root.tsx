import { Composition, Folder, Still } from "remotion";
import { RECEITA_EXEMPLO, Thumb, ThumbsDosVideos } from "./kit/thumb";
import * as EH from "./videos/exemplo-horizontal";
import * as DB from "./videos/distrital-bahia";
import * as QDB from "./videos/quem-distrital";
import * as OI from "./videos/orcamento-ilheus";
import * as EDI from "./videos/educacao-ilheus";
import * as OIT from "./videos/orcamento-itabuna";
import * as OUN from "./videos/orcamento-una";
import * as OSP from "./videos/orcamento-sp";
import * as OCQ from "./videos/orcamento-conquista";
import * as OSA from "./videos/orcamento-salvador";
import * as OPS from "./videos/orcamento-porto-seguro";
import * as KEUN from "./videos/orcamento-eunapolis";
import * as KBRU from "./videos/orcamento-brumado";
import * as KFEI from "./videos/orcamento-feira";
import * as KCOA from "./videos/orcamento-coaraci";
import * as KBEL from "./videos/orcamento-belmonte";
import * as KABEL from "./videos/arrecadacao-belmonte";
import * as KINH from "./videos/orcamento-inhambupe";
import * as KCAN from "./videos/orcamento-canavieiras";
import * as KPAR from "./videos/orcamento-paratinga";
import * as KPAR1824 from "./videos/orcamento-paratinga1824";
import * as KPS1824 from "./videos/orcamento-paratinga-setores1824";
import * as KANA from "./videos/orcamento-anage";
import * as KCMC from "./videos/orcamento-camacari";
import * as KITJ from "./videos/orcamento-itajuipe";
import * as KITP from "./videos/orcamento-itapitanga";
import * as KLIV from "./videos/orcamento-livramento";
import * as KGUA from "./videos/orcamento-guanambi";
import * as KEDT from "./videos/educacao-ilheus-tcm";
import * as KO10 from "./videos/obras-ilheus-10";
import * as KS10 from "./videos/saude-ilheus-10";
import * as ONI from "./videos/onibus-ilheus";
import * as EE from "./videos/eleicao-eua";
import * as PS from "./videos/pec-seguranca";
import * as RTB from "./videos/reforma-tributaria";
import * as DPL from "./videos/dino-pl";
import * as TBC from "./videos/tablets-camara";
import * as BVP from "./videos/barra-velha";
import * as ISR from "./videos/israelenses-itacare";
import * as TPX from "./videos/triplex-lula";
import * as MR from "./videos/midterms-resultado";
import * as EV from "./videos/exemplo-vertical";
import * as KCAB from "./videos/orcamento-cabralia";
import * as KPOT from "./videos/orcamento-potiragua";
import * as KCAI from "./videos/orcamento-cairu";
import * as KITG from "./videos/orcamento-itapetinga";
import * as KIBI from "./videos/orcamento-ibicarai";
import * as KCMN from "./videos/orcamento-camacan";
import * as KUBT from "./videos/orcamento-ubaitaba";
import * as KALM from "./videos/orcamento-almadina";
import * as KNVI from "./videos/orcamento-novavicosa";
import * as KMRC from "./videos/orcamento-maracas";
import * as KVAL from "./videos/orcamento-valenca";
import * as KITU from "./videos/orcamento-itubera";
import * as KSEA from "./videos/orcamento-seabra";
import * as KIBE from "./videos/orcamento-itambe";
import * as KGND from "./videos/orcamento-gandu";
import * as KMAC from "./videos/orcamento-macaubas";
import * as KPMI from "./videos/orcamento-paramirim";
import * as KMSJ from "./videos/orcamento-matadesaojoao";
import * as KSAJ from "./videos/orcamento-santoantonio";
import * as KNAZ from "./videos/orcamento-nazare";
import * as KBUE from "./videos/orcamento-buerarema";
import * as KFLA from "./videos/orcamento-florestaazul";
import * as KGRT from "./videos/orcamento-guaratinga";
import * as KIBRT from "./videos/orcamento-ibirataia";
import * as KITGB from "./videos/orcamento-itagiba";
import * as KITIC from "./videos/orcamento-itaju-do-colonia";
import * as KITPB from "./videos/orcamento-itapebi";
import * as KITMSC from "./videos/orcamento-mascote";
import * as KITUBTA from "./videos/orcamento-ubata";
import * as KITJS from "./videos/orcamento-jussari";
import * as KITARA from "./videos/orcamento-arataca";
import * as KITMAR from "./videos/orcamento-marau";
import * as KITDDA from "./videos/orcamento-diasdavila";
import * as KITCATU from "./videos/orcamento-catu";
import * as KITITAPE from "./videos/orcamento-itape";
import * as KITPOJUCA from "./videos/orcamento-pojuca";
import * as KITIBO from "./videos/orcamento-ibotirama";
import * as KITXIQUEXIQUE from "./videos/orcamento-xiquexique";
import * as KITPAULOAFONSO from "./videos/orcamento-paulo-afonso";
import * as KITCARINHANHA from "./videos/orcamento-carinhanha";
import * as KITSAODESIDERIO from "./videos/orcamento-sao-desiderio";
import * as KITRUYBARBOSA from "./videos/orcamento-ruy-barbosa";
import * as KITRIACHAODOJACUIPE from "./videos/orcamento-riachao-do-jacuipe";
import * as KITSERRARAMALHO from "./videos/orcamento-serra-do-ramalho";
import * as KITITABERABA from "./videos/orcamento-itaberaba";
import * as KITJAGUARARI from "./videos/orcamento-jaguarari";
import * as KITMONTESANTO from "./videos/orcamento-monte-santo";
import * as KITSENHORDOBONFIM from "./videos/orcamento-senhor-do-bonfim";
import * as KITABAIRA from "./videos/orcamento-abaira";
import * as KITCONDEUBA from "./videos/orcamento-condeuba";
import * as KITCORDEIROS from "./videos/orcamento-cordeiros";
import * as KITCANDIBA from "./videos/orcamento-candiba";
import * as KITBROTAS from "./videos/orcamento-brotas";
import * as KITDOMBASILIO from "./videos/orcamento-dombasilio";
import * as KITENTRERIOS from "./videos/orcamento-entre-rios";
import * as KITRIACHAONEVES from "./videos/orcamento-riachao-das-neves";
import * as KITMORROCHAPEU from "./videos/orcamento-morro-do-chapeu";
import * as KITIPIRA from "./videos/orcamento-ipira";
import * as KITCAV from "./videos/orcamento-castroalves";
import * as KITSFC from "./videos/orcamento-sfconde";
import * as KITSAM from "./videos/orcamento-santoamaro";
import * as KITINT from "./videos/orcamento-inhambupe-tcm";
import * as KITSL from "./videos/orcamento-santaluzia";
import * as KITSJV from "./videos/orcamento-saojosevitoria";
import * as KITCATURAMA from "./videos/orcamento-caturama";
import * as KITFEIRADAMATA from "./videos/orcamento-feiradamata";
import * as KITBTP from "./videos/orcamento-botupora";
import * as KITBDE from "./videos/orcamento-barraestiva";
import * as KITCAC from "./videos/orcamento-cacule";
import * as KITTNH from "./videos/orcamento-tanhacu";
import * as KITPIA from "./videos/orcamento-piata";
import * as KITPTN from "./videos/orcamento-tancredoneves";
import * as KILT from "./videos/orcamento-ilheus-tcm";
import * as KBPR from "./videos/orcamento-barro-preto";
import * as KCAE from "./videos/orcamento-caetite";
import * as KCSA from "./videos/orcamento-candidosales";
import * as KDME from "./videos/orcamento-dariomeira";
import * as KCRV from "./videos/orcamento-caravelas";
import * as KITB from "./videos/orcamento-itabela";
import * as KITC from "./videos/orcamento-itacare";
import * as KJEQ from "./videos/orcamento-jequie";
import * as KSIM from "./videos/orcamento-simoesfilho";
import * as KURU from "./videos/orcamento-urucuca";
import * as KBJL from "./videos/orcamento-bomjesus";
import * as KLDF from "./videos/orcamento-lauro";
import * as KTXF from "./videos/orcamento-teixeira";
import * as KMUC from "./videos/orcamento-mucuri";
import * as KLEM from "./videos/orcamento-lem";
import * as KRDC from "./videos/orcamento-riodecontas";
import * as KRDC2 from "./videos/orcamento-riodecontasv2";
import * as KBAR from "./videos/orcamento-barreiras";
import * as KITA from "./videos/orcamento-itamaraju";

// ---------------------------------------------------------------------------
// O CATÁLOGO de vídeos que aparece no Studio (npm run dev). Cada vídeo é uma pasta em src/videos/
// e uma linha aqui. Vídeo novo: copie a pasta de um exemplo, importe e registre embaixo dele.
// ---------------------------------------------------------------------------

export const Root: React.FC = () => (
  <>
    <Folder name="Exemplos">
      {/* 9:16 (Shorts/Reels/TikTok), 60 fps: o molde de todo vídeo vertical */}
      <Composition id="DistritalBahia" component={DB.DistritalBahia} durationInFrames={DB.DURACAO_NO_VIDEO} fps={DB.FPS_DO_VIDEO} width={DB.LARGURA} height={DB.ALTURA} />
      <Composition id="QuemDistritalBahia" component={QDB.QuemDistritalBahia} durationInFrames={QDB.DURACAO_NO_VIDEO} fps={QDB.FPS_DO_VIDEO} width={QDB.LARGURA} height={QDB.ALTURA} />
      <Composition id="OnibusIlheus" component={ONI.OnibusIlheus} durationInFrames={ONI.DURACAO_NO_VIDEO} fps={ONI.FPS_DO_VIDEO} width={ONI.LARGURA} height={ONI.ALTURA} />
      <Composition id="OrcamentoItabuna" component={OIT.OrcamentoItabuna} durationInFrames={OIT.DURACAO_NO_VIDEO} fps={OIT.FPS_DO_VIDEO} width={OIT.LARGURA} height={OIT.ALTURA} />
      <Composition id="OrcamentoUna" component={OUN.OrcamentoUna} durationInFrames={OUN.DURACAO_NO_VIDEO} fps={OUN.FPS_DO_VIDEO} width={OUN.LARGURA} height={OUN.ALTURA} />
      <Composition id="OrcamentoSp" component={OSP.OrcamentoSp} durationInFrames={OSP.DURACAO_NO_VIDEO} fps={OSP.FPS_DO_VIDEO} width={OSP.LARGURA} height={OSP.ALTURA} />
      <Composition id="OrcamentoConquista" component={OCQ.OrcamentoConquista} durationInFrames={OCQ.DURACAO_NO_VIDEO} fps={OCQ.FPS_DO_VIDEO} width={OCQ.LARGURA} height={OCQ.ALTURA} />
      <Composition id="OrcamentoSalvador" component={OSA.OrcamentoSalvador} durationInFrames={OSA.DURACAO_NO_VIDEO} fps={OSA.FPS_DO_VIDEO} width={OSA.LARGURA} height={OSA.ALTURA} />
      <Composition id="OrcamentoPortoSeguro" component={OPS.OrcamentoPortoSeguro} durationInFrames={OPS.DURACAO_NO_VIDEO} fps={OPS.FPS_DO_VIDEO} width={OPS.LARGURA} height={OPS.ALTURA} />
      <Composition id="OrcamentoEunapolis" component={KEUN.OrcamentoEunapolis} durationInFrames={KEUN.DURACAO_NO_VIDEO} fps={KEUN.FPS_DO_VIDEO} width={KEUN.LARGURA} height={KEUN.ALTURA} />
      <Composition id="OrcamentoBrumado" component={KBRU.OrcamentoBrumado} durationInFrames={KBRU.DURACAO_NO_VIDEO} fps={KBRU.FPS_DO_VIDEO} width={KBRU.LARGURA} height={KBRU.ALTURA} />
      <Composition id="OrcamentoFeira" component={KFEI.OrcamentoFeira} durationInFrames={KFEI.DURACAO_NO_VIDEO} fps={KFEI.FPS_DO_VIDEO} width={KFEI.LARGURA} height={KFEI.ALTURA} />
      <Composition id="OrcamentoCoaraci" component={KCOA.OrcamentoCoaraci} durationInFrames={KCOA.DURACAO_NO_VIDEO} fps={KCOA.FPS_DO_VIDEO} width={KCOA.LARGURA} height={KCOA.ALTURA} />
      <Composition id="OrcamentoBelmonte" component={KBEL.OrcamentoBelmonte} durationInFrames={KBEL.DURACAO_NO_VIDEO} fps={KBEL.FPS_DO_VIDEO} width={KBEL.LARGURA} height={KBEL.ALTURA} />
      <Composition id="ArrecadacaoBelmonte" component={KABEL.ArrecadacaoBelmonte} durationInFrames={KABEL.DURACAO_NO_VIDEO} fps={KABEL.FPS_DO_VIDEO} width={KABEL.LARGURA} height={KABEL.ALTURA} />
      <Composition id="OrcamentoInhambupe" component={KINH.OrcamentoInhambupe} durationInFrames={KINH.DURACAO_NO_VIDEO} fps={KINH.FPS_DO_VIDEO} width={KINH.LARGURA} height={KINH.ALTURA} />
      <Composition id="OrcamentoCanavieiras" component={KCAN.OrcamentoCanavieiras} durationInFrames={KCAN.DURACAO_NO_VIDEO} fps={KCAN.FPS_DO_VIDEO} width={KCAN.LARGURA} height={KCAN.ALTURA} />
      <Composition id="OrcamentoParatinga" component={KPAR.OrcamentoParatinga} durationInFrames={KPAR.DURACAO_NO_VIDEO} fps={KPAR.FPS_DO_VIDEO} width={KPAR.LARGURA} height={KPAR.ALTURA} />
      <Composition id="OrcamentoParatinga1824" component={KPAR1824.OrcamentoParatinga1824} durationInFrames={KPAR1824.DURACAO_NO_VIDEO} fps={KPAR1824.FPS_DO_VIDEO} width={KPAR1824.LARGURA} height={KPAR1824.ALTURA} />
      <Composition id="OrcamentoParatingaSetores1824" component={KPS1824.OrcamentoParatingaSetores1824} durationInFrames={KPS1824.DURACAO_NO_VIDEO} fps={KPS1824.FPS_DO_VIDEO} width={KPS1824.LARGURA} height={KPS1824.ALTURA} />
      <Composition id="OrcamentoAnage" component={KANA.OrcamentoAnage} durationInFrames={KANA.DURACAO_NO_VIDEO} fps={KANA.FPS_DO_VIDEO} width={KANA.LARGURA} height={KANA.ALTURA} />
      <Composition id="OrcamentoCamacari" component={KCMC.OrcamentoCamacari} durationInFrames={KCMC.DURACAO_NO_VIDEO} fps={KCMC.FPS_DO_VIDEO} width={KCMC.LARGURA} height={KCMC.ALTURA} />
      <Composition id="OrcamentoItajuipe" component={KITJ.OrcamentoItajuipe} durationInFrames={KITJ.DURACAO_NO_VIDEO} fps={KITJ.FPS_DO_VIDEO} width={KITJ.LARGURA} height={KITJ.ALTURA} />
      <Composition id="OrcamentoItapitanga" component={KITP.OrcamentoItapitanga} durationInFrames={KITP.DURACAO_NO_VIDEO} fps={KITP.FPS_DO_VIDEO} width={KITP.LARGURA} height={KITP.ALTURA} />
      <Composition id="OrcamentoLivramento" component={KLIV.OrcamentoLivramento} durationInFrames={KLIV.DURACAO_NO_VIDEO} fps={KLIV.FPS_DO_VIDEO} width={KLIV.LARGURA} height={KLIV.ALTURA} />
      <Composition id="OrcamentoGuanambi" component={KGUA.OrcamentoGuanambi} durationInFrames={KGUA.DURACAO_NO_VIDEO} fps={KGUA.FPS_DO_VIDEO} width={KGUA.LARGURA} height={KGUA.ALTURA} />
      <Composition id="OrcamentoCabralia" component={KCAB.OrcamentoCabralia} durationInFrames={KCAB.DURACAO_NO_VIDEO} fps={KCAB.FPS_DO_VIDEO} width={KCAB.LARGURA} height={KCAB.ALTURA} />
      <Composition id="OrcamentoPotiragua" component={KPOT.OrcamentoPotiragua} durationInFrames={KPOT.DURACAO_NO_VIDEO} fps={KPOT.FPS_DO_VIDEO} width={KPOT.LARGURA} height={KPOT.ALTURA} />
      <Composition id="OrcamentoCairu" component={KCAI.OrcamentoCairu} durationInFrames={KCAI.DURACAO_NO_VIDEO} fps={KCAI.FPS_DO_VIDEO} width={KCAI.LARGURA} height={KCAI.ALTURA} />
      <Composition id="OrcamentoItapetinga" component={KITG.OrcamentoItapetinga} durationInFrames={KITG.DURACAO_NO_VIDEO} fps={KITG.FPS_DO_VIDEO} width={KITG.LARGURA} height={KITG.ALTURA} />
      <Composition id="OrcamentoIbicarai" component={KIBI.OrcamentoIbicarai} durationInFrames={KIBI.DURACAO_NO_VIDEO} fps={KIBI.FPS_DO_VIDEO} width={KIBI.LARGURA} height={KIBI.ALTURA} />
      <Composition id="OrcamentoCamacan" component={KCMN.OrcamentoCamacan} durationInFrames={KCMN.DURACAO_NO_VIDEO} fps={KCMN.FPS_DO_VIDEO} width={KCMN.LARGURA} height={KCMN.ALTURA} />
      <Composition id="OrcamentoUbaitaba" component={KUBT.OrcamentoUbaitaba} durationInFrames={KUBT.DURACAO_NO_VIDEO} fps={KUBT.FPS_DO_VIDEO} width={KUBT.LARGURA} height={KUBT.ALTURA} />
      <Composition id="OrcamentoAlmadina" component={KALM.OrcamentoAlmadina} durationInFrames={KALM.DURACAO_NO_VIDEO} fps={KALM.FPS_DO_VIDEO} width={KALM.LARGURA} height={KALM.ALTURA} />
      <Composition id="OrcamentoNovaVicosa" component={KNVI.OrcamentoNovaVicosa} durationInFrames={KNVI.DURACAO_NO_VIDEO} fps={KNVI.FPS_DO_VIDEO} width={KNVI.LARGURA} height={KNVI.ALTURA} />
      <Composition id="OrcamentoMaracas" component={KMRC.OrcamentoMaracas} durationInFrames={KMRC.DURACAO_NO_VIDEO} fps={KMRC.FPS_DO_VIDEO} width={KMRC.LARGURA} height={KMRC.ALTURA} />
      <Composition id="OrcamentoValenca" component={KVAL.OrcamentoValenca} durationInFrames={KVAL.DURACAO_NO_VIDEO} fps={KVAL.FPS_DO_VIDEO} width={KVAL.LARGURA} height={KVAL.ALTURA} />
      <Composition id="OrcamentoItubera" component={KITU.OrcamentoItubera} durationInFrames={KITU.DURACAO_NO_VIDEO} fps={KITU.FPS_DO_VIDEO} width={KITU.LARGURA} height={KITU.ALTURA} />
      <Composition id="OrcamentoSeabra" component={KSEA.OrcamentoSeabra} durationInFrames={KSEA.DURACAO_NO_VIDEO} fps={KSEA.FPS_DO_VIDEO} width={KSEA.LARGURA} height={KSEA.ALTURA} />
      <Composition id="OrcamentoItambe" component={KIBE.OrcamentoItambe} durationInFrames={KIBE.DURACAO_NO_VIDEO} fps={KIBE.FPS_DO_VIDEO} width={KIBE.LARGURA} height={KIBE.ALTURA} />
      <Composition id="OrcamentoGandu" component={KGND.OrcamentoGandu} durationInFrames={KGND.DURACAO_NO_VIDEO} fps={KGND.FPS_DO_VIDEO} width={KGND.LARGURA} height={KGND.ALTURA} />
      <Composition id="OrcamentoMacaubas" component={KMAC.OrcamentoMacaubas} durationInFrames={KMAC.DURACAO_NO_VIDEO} fps={KMAC.FPS_DO_VIDEO} width={KMAC.LARGURA} height={KMAC.ALTURA} />
      <Composition id="OrcamentoParamirim" component={KPMI.OrcamentoParamirim} durationInFrames={KPMI.DURACAO_NO_VIDEO} fps={KPMI.FPS_DO_VIDEO} width={KPMI.LARGURA} height={KPMI.ALTURA} />
      <Composition id="OrcamentoMataDeSaoJoao" component={KMSJ.OrcamentoMataDeSaoJoao} durationInFrames={KMSJ.DURACAO_NO_VIDEO} fps={KMSJ.FPS_DO_VIDEO} width={KMSJ.LARGURA} height={KMSJ.ALTURA} />
      <Composition id="OrcamentoSantoAntonio" component={KSAJ.OrcamentoSantoAntonio} durationInFrames={KSAJ.DURACAO_NO_VIDEO} fps={KSAJ.FPS_DO_VIDEO} width={KSAJ.LARGURA} height={KSAJ.ALTURA} />
      <Composition id="OrcamentoNazare" component={KNAZ.OrcamentoNazare} durationInFrames={KNAZ.DURACAO_NO_VIDEO} fps={KNAZ.FPS_DO_VIDEO} width={KNAZ.LARGURA} height={KNAZ.ALTURA} />
      <Composition id="OrcamentoBuerarema" component={KBUE.OrcamentoBuerarema} durationInFrames={KBUE.DURACAO_NO_VIDEO} fps={KBUE.FPS_DO_VIDEO} width={KBUE.LARGURA} height={KBUE.ALTURA} />
      <Composition id="OrcamentoFlorestaAzul" component={KFLA.OrcamentoFlorestaAzul} durationInFrames={KFLA.DURACAO_NO_VIDEO} fps={KFLA.FPS_DO_VIDEO} width={KFLA.LARGURA} height={KFLA.ALTURA} />
      <Composition id="OrcamentoGuaratinga" component={KGRT.OrcamentoGuaratinga} durationInFrames={KGRT.DURACAO_NO_VIDEO} fps={KGRT.FPS_DO_VIDEO} width={KGRT.LARGURA} height={KGRT.ALTURA} />
      <Composition id="OrcamentoIbirataia" component={KIBRT.OrcamentoIbirataia} durationInFrames={KIBRT.DURACAO_NO_VIDEO} fps={KIBRT.FPS_DO_VIDEO} width={KIBRT.LARGURA} height={KIBRT.ALTURA} />
      <Composition id="OrcamentoItagiba" component={KITGB.OrcamentoItagiba} durationInFrames={KITGB.DURACAO_NO_VIDEO} fps={KITGB.FPS_DO_VIDEO} width={KITGB.LARGURA} height={KITGB.ALTURA} />
      <Composition id="OrcamentoItajuDoColonia" component={KITIC.OrcamentoItajuDoColonia} durationInFrames={KITIC.DURACAO_NO_VIDEO} fps={KITIC.FPS_DO_VIDEO} width={KITIC.LARGURA} height={KITIC.ALTURA} />
      <Composition id="OrcamentoItapebi" component={KITPB.OrcamentoItapebi} durationInFrames={KITPB.DURACAO_NO_VIDEO} fps={KITPB.FPS_DO_VIDEO} width={KITPB.LARGURA} height={KITPB.ALTURA} />
      <Composition id="OrcamentoMascote" component={KITMSC.OrcamentoMascote} durationInFrames={KITMSC.DURACAO_NO_VIDEO} fps={KITMSC.FPS_DO_VIDEO} width={KITMSC.LARGURA} height={KITMSC.ALTURA} />
      <Composition id="OrcamentoUbata" component={KITUBTA.OrcamentoUbata} durationInFrames={KITUBTA.DURACAO_NO_VIDEO} fps={KITUBTA.FPS_DO_VIDEO} width={KITUBTA.LARGURA} height={KITUBTA.ALTURA} />
      <Composition id="OrcamentoJussari" component={KITJS.OrcamentoJussari} durationInFrames={KITJS.DURACAO_NO_VIDEO} fps={KITJS.FPS_DO_VIDEO} width={KITJS.LARGURA} height={KITJS.ALTURA} />
      <Composition id="OrcamentoArataca" component={KITARA.OrcamentoArataca} durationInFrames={KITARA.DURACAO_NO_VIDEO} fps={KITARA.FPS_DO_VIDEO} width={KITARA.LARGURA} height={KITARA.ALTURA} />
      <Composition id="OrcamentoMarau" component={KITMAR.OrcamentoMarau} durationInFrames={KITMAR.DURACAO_NO_VIDEO} fps={KITMAR.FPS_DO_VIDEO} width={KITMAR.LARGURA} height={KITMAR.ALTURA} />
      <Composition id="OrcamentoDiasDavila" component={KITDDA.OrcamentoDiasDavila} durationInFrames={KITDDA.DURACAO_NO_VIDEO} fps={KITDDA.FPS_DO_VIDEO} width={KITDDA.LARGURA} height={KITDDA.ALTURA} />
      <Composition id="OrcamentoCatu" component={KITCATU.OrcamentoCatu} durationInFrames={KITCATU.DURACAO_NO_VIDEO} fps={KITCATU.FPS_DO_VIDEO} width={KITCATU.LARGURA} height={KITCATU.ALTURA} />
      <Composition id="OrcamentoItape" component={KITITAPE.OrcamentoItape} durationInFrames={KITITAPE.DURACAO_NO_VIDEO} fps={KITITAPE.FPS_DO_VIDEO} width={KITITAPE.LARGURA} height={KITITAPE.ALTURA} />
      <Composition id="OrcamentoPojuca" component={KITPOJUCA.OrcamentoPojuca} durationInFrames={KITPOJUCA.DURACAO_NO_VIDEO} fps={KITPOJUCA.FPS_DO_VIDEO} width={KITPOJUCA.LARGURA} height={KITPOJUCA.ALTURA} />
      <Composition id="OrcamentoIbotirama" component={KITIBO.OrcamentoIbotirama} durationInFrames={KITIBO.DURACAO_NO_VIDEO} fps={KITIBO.FPS_DO_VIDEO} width={KITIBO.LARGURA} height={KITIBO.ALTURA} />
      <Composition id="OrcamentoXiqueXique" component={KITXIQUEXIQUE.OrcamentoXiqueXique} durationInFrames={KITXIQUEXIQUE.DURACAO_NO_VIDEO} fps={KITXIQUEXIQUE.FPS_DO_VIDEO} width={KITXIQUEXIQUE.LARGURA} height={KITXIQUEXIQUE.ALTURA} />
      <Composition id="OrcamentoPauloAfonso" component={KITPAULOAFONSO.OrcamentoPauloAfonso} durationInFrames={KITPAULOAFONSO.DURACAO_NO_VIDEO} fps={KITPAULOAFONSO.FPS_DO_VIDEO} width={KITPAULOAFONSO.LARGURA} height={KITPAULOAFONSO.ALTURA} />
      <Composition id="OrcamentoCarinhanha" component={KITCARINHANHA.OrcamentoCarinhanha} durationInFrames={KITCARINHANHA.DURACAO_NO_VIDEO} fps={KITCARINHANHA.FPS_DO_VIDEO} width={KITCARINHANHA.LARGURA} height={KITCARINHANHA.ALTURA} />
      <Composition id="OrcamentoSaoDesiderio" component={KITSAODESIDERIO.OrcamentoSaoDesiderio} durationInFrames={KITSAODESIDERIO.DURACAO_NO_VIDEO} fps={KITSAODESIDERIO.FPS_DO_VIDEO} width={KITSAODESIDERIO.LARGURA} height={KITSAODESIDERIO.ALTURA} />
      <Composition id="OrcamentoRuyBarbosa" component={KITRUYBARBOSA.OrcamentoRuyBarbosa} durationInFrames={KITRUYBARBOSA.DURACAO_NO_VIDEO} fps={KITRUYBARBOSA.FPS_DO_VIDEO} width={KITRUYBARBOSA.LARGURA} height={KITRUYBARBOSA.ALTURA} />
      <Composition id="OrcamentoRiachaoDoJacuipe" component={KITRIACHAODOJACUIPE.OrcamentoRiachaoDoJacuipe} durationInFrames={KITRIACHAODOJACUIPE.DURACAO_NO_VIDEO} fps={KITRIACHAODOJACUIPE.FPS_DO_VIDEO} width={KITRIACHAODOJACUIPE.LARGURA} height={KITRIACHAODOJACUIPE.ALTURA} />
      <Composition id="OrcamentoSerraDoRamalho" component={KITSERRARAMALHO.OrcamentoSerraDoRamalho} durationInFrames={KITSERRARAMALHO.DURACAO_NO_VIDEO} fps={KITSERRARAMALHO.FPS_DO_VIDEO} width={KITSERRARAMALHO.LARGURA} height={KITSERRARAMALHO.ALTURA} />
      <Composition id="OrcamentoItaberaba" component={KITITABERABA.OrcamentoItaberaba} durationInFrames={KITITABERABA.DURACAO_NO_VIDEO} fps={KITITABERABA.FPS_DO_VIDEO} width={KITITABERABA.LARGURA} height={KITITABERABA.ALTURA} />
      <Composition id="OrcamentoJaguarari" component={KITJAGUARARI.OrcamentoJaguarari} durationInFrames={KITJAGUARARI.DURACAO_NO_VIDEO} fps={KITJAGUARARI.FPS_DO_VIDEO} width={KITJAGUARARI.LARGURA} height={KITJAGUARARI.ALTURA} />
      <Composition id="OrcamentoMonteSanto" component={KITMONTESANTO.OrcamentoMonteSanto} durationInFrames={KITMONTESANTO.DURACAO_NO_VIDEO} fps={KITMONTESANTO.FPS_DO_VIDEO} width={KITMONTESANTO.LARGURA} height={KITMONTESANTO.ALTURA} />
      <Composition id="OrcamentoSenhorDoBonfim" component={KITSENHORDOBONFIM.OrcamentoSenhorDoBonfim} durationInFrames={KITSENHORDOBONFIM.DURACAO_NO_VIDEO} fps={KITSENHORDOBONFIM.FPS_DO_VIDEO} width={KITSENHORDOBONFIM.LARGURA} height={KITSENHORDOBONFIM.ALTURA} />
      <Composition id="OrcamentoAbaira" component={KITABAIRA.OrcamentoAbaira} durationInFrames={KITABAIRA.DURACAO_NO_VIDEO} fps={KITABAIRA.FPS_DO_VIDEO} width={KITABAIRA.LARGURA} height={KITABAIRA.ALTURA} />
      <Composition id="OrcamentoCondeuba" component={KITCONDEUBA.OrcamentoCondeuba} durationInFrames={KITCONDEUBA.DURACAO_NO_VIDEO} fps={KITCONDEUBA.FPS_DO_VIDEO} width={KITCONDEUBA.LARGURA} height={KITCONDEUBA.ALTURA} />
      <Composition id="OrcamentoCordeiros" component={KITCORDEIROS.OrcamentoCordeiros} durationInFrames={KITCORDEIROS.DURACAO_NO_VIDEO} fps={KITCORDEIROS.FPS_DO_VIDEO} width={KITCORDEIROS.LARGURA} height={KITCORDEIROS.ALTURA} />
      <Composition id="OrcamentoCandiba" component={KITCANDIBA.OrcamentoCandiba} durationInFrames={KITCANDIBA.DURACAO_NO_VIDEO} fps={KITCANDIBA.FPS_DO_VIDEO} width={KITCANDIBA.LARGURA} height={KITCANDIBA.ALTURA} />
      <Composition id="OrcamentoBrotas" component={KITBROTAS.OrcamentoBrotas} durationInFrames={KITBROTAS.DURACAO_NO_VIDEO} fps={KITBROTAS.FPS_DO_VIDEO} width={KITBROTAS.LARGURA} height={KITBROTAS.ALTURA} />
      <Composition id="OrcamentoDomBasilio" component={KITDOMBASILIO.OrcamentoDomBasilio} durationInFrames={KITDOMBASILIO.DURACAO_NO_VIDEO} fps={KITDOMBASILIO.FPS_DO_VIDEO} width={KITDOMBASILIO.LARGURA} height={KITDOMBASILIO.ALTURA} />
      <Composition id="OrcamentoEntreRios" component={KITENTRERIOS.OrcamentoEntreRios} durationInFrames={KITENTRERIOS.DURACAO_NO_VIDEO} fps={KITENTRERIOS.FPS_DO_VIDEO} width={KITENTRERIOS.LARGURA} height={KITENTRERIOS.ALTURA} />
      <Composition id="OrcamentoRiachaoDasNeves" component={KITRIACHAONEVES.OrcamentoRiachaoDasNeves} durationInFrames={KITRIACHAONEVES.DURACAO_NO_VIDEO} fps={KITRIACHAONEVES.FPS_DO_VIDEO} width={KITRIACHAONEVES.LARGURA} height={KITRIACHAONEVES.ALTURA} />
      <Composition id="OrcamentoMorroDoChapeu" component={KITMORROCHAPEU.OrcamentoMorroDoChapeu} durationInFrames={KITMORROCHAPEU.DURACAO_NO_VIDEO} fps={KITMORROCHAPEU.FPS_DO_VIDEO} width={KITMORROCHAPEU.LARGURA} height={KITMORROCHAPEU.ALTURA} />
      <Composition id="OrcamentoIpira" component={KITIPIRA.OrcamentoIpira} durationInFrames={KITIPIRA.DURACAO_NO_VIDEO} fps={KITIPIRA.FPS_DO_VIDEO} width={KITIPIRA.LARGURA} height={KITIPIRA.ALTURA} />
      <Composition id="OrcamentoCastroAlves" component={KITCAV.OrcamentoCastroAlves} durationInFrames={KITCAV.DURACAO_NO_VIDEO} fps={KITCAV.FPS_DO_VIDEO} width={KITCAV.LARGURA} height={KITCAV.ALTURA} />
      <Composition id="OrcamentoSfconde" component={KITSFC.OrcamentoSfconde} durationInFrames={KITSFC.DURACAO_NO_VIDEO} fps={KITSFC.FPS_DO_VIDEO} width={KITSFC.LARGURA} height={KITSFC.ALTURA} />
      <Composition id="OrcamentoSantoAmaro" component={KITSAM.OrcamentoSantoAmaro} durationInFrames={KITSAM.DURACAO_NO_VIDEO} fps={KITSAM.FPS_DO_VIDEO} width={KITSAM.LARGURA} height={KITSAM.ALTURA} />
      <Composition id="OrcamentoInhambupeTcm" component={KITINT.OrcamentoInhambupeTcm} durationInFrames={KITINT.DURACAO_NO_VIDEO} fps={KITINT.FPS_DO_VIDEO} width={KITINT.LARGURA} height={KITINT.ALTURA} />
      <Composition id="OrcamentoSantaLuzia" component={KITSL.OrcamentoSantaLuzia} durationInFrames={KITSL.DURACAO_NO_VIDEO} fps={KITSL.FPS_DO_VIDEO} width={KITSL.LARGURA} height={KITSL.ALTURA} />
      <Composition id="OrcamentoSaoJoseVitoria" component={KITSJV.OrcamentoSaoJoseVitoria} durationInFrames={KITSJV.DURACAO_NO_VIDEO} fps={KITSJV.FPS_DO_VIDEO} width={KITSJV.LARGURA} height={KITSJV.ALTURA} />
      <Composition id="OrcamentoCaturama" component={KITCATURAMA.OrcamentoCaturama} durationInFrames={KITCATURAMA.DURACAO_NO_VIDEO} fps={KITCATURAMA.FPS_DO_VIDEO} width={KITCATURAMA.LARGURA} height={KITCATURAMA.ALTURA} />
      <Composition id="OrcamentoFeiraDaMata" component={KITFEIRADAMATA.OrcamentoFeiraDaMata} durationInFrames={KITFEIRADAMATA.DURACAO_NO_VIDEO} fps={KITFEIRADAMATA.FPS_DO_VIDEO} width={KITFEIRADAMATA.LARGURA} height={KITFEIRADAMATA.ALTURA} />
      <Composition id="OrcamentoBotupora" component={KITBTP.OrcamentoBotupora} durationInFrames={KITBTP.DURACAO_NO_VIDEO} fps={KITBTP.FPS_DO_VIDEO} width={KITBTP.LARGURA} height={KITBTP.ALTURA} />
      <Composition id="OrcamentoBarraEstiva" component={KITBDE.OrcamentoBarraEstiva} durationInFrames={KITBDE.DURACAO_NO_VIDEO} fps={KITBDE.FPS_DO_VIDEO} width={KITBDE.LARGURA} height={KITBDE.ALTURA} />
      <Composition id="OrcamentoCacule" component={KITCAC.OrcamentoCacule} durationInFrames={KITCAC.DURACAO_NO_VIDEO} fps={KITCAC.FPS_DO_VIDEO} width={KITCAC.LARGURA} height={KITCAC.ALTURA} />
      <Composition id="OrcamentoTanhacu" component={KITTNH.OrcamentoTanhacu} durationInFrames={KITTNH.DURACAO_NO_VIDEO} fps={KITTNH.FPS_DO_VIDEO} width={KITTNH.LARGURA} height={KITTNH.ALTURA} />
      <Composition id="OrcamentoPiata" component={KITPIA.OrcamentoPiata} durationInFrames={KITPIA.DURACAO_NO_VIDEO} fps={KITPIA.FPS_DO_VIDEO} width={KITPIA.LARGURA} height={KITPIA.ALTURA} />
      <Composition id="OrcamentoTancredoNeves" component={KITPTN.OrcamentoTancredoNeves} durationInFrames={KITPTN.DURACAO_NO_VIDEO} fps={KITPTN.FPS_DO_VIDEO} width={KITPTN.LARGURA} height={KITPTN.ALTURA} />
      <Composition id="OrcamentoIlheusTcm" component={KILT.OrcamentoIlheusTcm} durationInFrames={KILT.DURACAO_NO_VIDEO} fps={KILT.FPS_DO_VIDEO} width={KILT.LARGURA} height={KILT.ALTURA} />
      <Composition id="OrcamentoBarroPreto" component={KBPR.OrcamentoBarroPreto} durationInFrames={KBPR.DURACAO_NO_VIDEO} fps={KBPR.FPS_DO_VIDEO} width={KBPR.LARGURA} height={KBPR.ALTURA} />
      <Composition id="OrcamentoCaetite" component={KCAE.OrcamentoCaetite} durationInFrames={KCAE.DURACAO_NO_VIDEO} fps={KCAE.FPS_DO_VIDEO} width={KCAE.LARGURA} height={KCAE.ALTURA} />
      <Composition id="OrcamentoCandidoSales" component={KCSA.OrcamentoCandidoSales} durationInFrames={KCSA.DURACAO_NO_VIDEO} fps={KCSA.FPS_DO_VIDEO} width={KCSA.LARGURA} height={KCSA.ALTURA} />
      <Composition id="OrcamentoDarioMeira" component={KDME.OrcamentoDarioMeira} durationInFrames={KDME.DURACAO_NO_VIDEO} fps={KDME.FPS_DO_VIDEO} width={KDME.LARGURA} height={KDME.ALTURA} />
      <Composition id="OrcamentoCaravelas" component={KCRV.OrcamentoCaravelas} durationInFrames={KCRV.DURACAO_NO_VIDEO} fps={KCRV.FPS_DO_VIDEO} width={KCRV.LARGURA} height={KCRV.ALTURA} />
      <Composition id="OrcamentoItabela" component={KITB.OrcamentoItabela} durationInFrames={KITB.DURACAO_NO_VIDEO} fps={KITB.FPS_DO_VIDEO} width={KITB.LARGURA} height={KITB.ALTURA} />
      <Composition id="OrcamentoItacare" component={KITC.OrcamentoItacare} durationInFrames={KITC.DURACAO_NO_VIDEO} fps={KITC.FPS_DO_VIDEO} width={KITC.LARGURA} height={KITC.ALTURA} />
      <Composition id="OrcamentoJequie" component={KJEQ.OrcamentoJequie} durationInFrames={KJEQ.DURACAO_NO_VIDEO} fps={KJEQ.FPS_DO_VIDEO} width={KJEQ.LARGURA} height={KJEQ.ALTURA} />
      <Composition id="OrcamentoSimoesFilho" component={KSIM.OrcamentoSimoesFilho} durationInFrames={KSIM.DURACAO_NO_VIDEO} fps={KSIM.FPS_DO_VIDEO} width={KSIM.LARGURA} height={KSIM.ALTURA} />
      <Composition id="OrcamentoUrucuca" component={KURU.OrcamentoUrucuca} durationInFrames={KURU.DURACAO_NO_VIDEO} fps={KURU.FPS_DO_VIDEO} width={KURU.LARGURA} height={KURU.ALTURA} />
      <Composition id="OrcamentoBomJesus" component={KBJL.OrcamentoBomJesus} durationInFrames={KBJL.DURACAO_NO_VIDEO} fps={KBJL.FPS_DO_VIDEO} width={KBJL.LARGURA} height={KBJL.ALTURA} />
      <Composition id="OrcamentoLauro" component={KLDF.OrcamentoLauro} durationInFrames={KLDF.DURACAO_NO_VIDEO} fps={KLDF.FPS_DO_VIDEO} width={KLDF.LARGURA} height={KLDF.ALTURA} />
      <Composition id="OrcamentoTeixeira" component={KTXF.OrcamentoTeixeira} durationInFrames={KTXF.DURACAO_NO_VIDEO} fps={KTXF.FPS_DO_VIDEO} width={KTXF.LARGURA} height={KTXF.ALTURA} />
      <Composition id="OrcamentoMucuri" component={KMUC.OrcamentoMucuri} durationInFrames={KMUC.DURACAO_NO_VIDEO} fps={KMUC.FPS_DO_VIDEO} width={KMUC.LARGURA} height={KMUC.ALTURA} />
      <Composition id="OrcamentoLem" component={KLEM.OrcamentoLem} durationInFrames={KLEM.DURACAO_NO_VIDEO} fps={KLEM.FPS_DO_VIDEO} width={KLEM.LARGURA} height={KLEM.ALTURA} />
      <Composition id="OrcamentoRioDeContas" component={KRDC.OrcamentoRioDeContas} durationInFrames={KRDC.DURACAO_NO_VIDEO} fps={KRDC.FPS_DO_VIDEO} width={KRDC.LARGURA} height={KRDC.ALTURA} />
      <Composition id="OrcamentoRioDeContasV2" component={KRDC2.OrcamentoRioDeContasV2} durationInFrames={KRDC2.DURACAO_NO_VIDEO} fps={KRDC2.FPS_DO_VIDEO} width={KRDC2.LARGURA} height={KRDC2.ALTURA} />
      <Composition id="OrcamentoBarreiras" component={KBAR.OrcamentoBarreiras} durationInFrames={KBAR.DURACAO_NO_VIDEO} fps={KBAR.FPS_DO_VIDEO} width={KBAR.LARGURA} height={KBAR.ALTURA} />
      <Composition id="OrcamentoItamaraju" component={KITA.OrcamentoItamaraju} durationInFrames={KITA.DURACAO_NO_VIDEO} fps={KITA.FPS_DO_VIDEO} width={KITA.LARGURA} height={KITA.ALTURA} />
      <Composition id="ObrasIlheus10Mapa" component={KO10.ObrasIlheus10Mapa} durationInFrames={KO10.DURACAO_NO_VIDEO} fps={KO10.FPS_DO_VIDEO} width={KO10.LARGURA} height={KO10.ALTURA} />
      <Composition id="SaudeIlheus10Mapa" component={KS10.SaudeIlheus10Mapa} durationInFrames={KS10.DURACAO_NO_VIDEO} fps={KS10.FPS_DO_VIDEO} width={KS10.LARGURA} height={KS10.ALTURA} />
      <Composition id="EducacaoIlheusTCM" component={KEDT.EducacaoIlheusTCM} durationInFrames={KEDT.DURACAO_NO_VIDEO} fps={KEDT.FPS_DO_VIDEO} width={KEDT.LARGURA} height={KEDT.ALTURA} />
      <Composition id="OrcamentoIlheus" component={OI.OrcamentoIlheus} durationInFrames={OI.DURACAO_NO_VIDEO} fps={OI.FPS_DO_VIDEO} width={OI.LARGURA} height={OI.ALTURA} />
      <Composition id="EducacaoIlheus" component={EDI.EducacaoIlheus} durationInFrames={EDI.DURACAO_NO_VIDEO} fps={EDI.FPS_DO_VIDEO} width={EDI.LARGURA} height={EDI.ALTURA} />
      <Composition id="ExemploVertical" component={EV.ExemploVertical} durationInFrames={EV.DURACAO_NO_VIDEO} fps={EV.FPS_DO_VIDEO} width={EV.LARGURA} height={EV.ALTURA} />
      {/* 16:9 (YouTube), documentário em capítulos: mapa ↔ imagens de apoio */}
      <Composition id="ExemploHorizontal" component={EH.ExemploHorizontal} durationInFrames={EH.DURACAO} fps={EH.FPS} width={EH.LARGURA} height={EH.ALTURA} />
      <Still id="ExemploHorizontalCapa" component={EH.ExemploHorizontalCapa} width={1280} height={720} defaultProps={EH.CAPA_PADRAO} />
    </Folder>

    {/* ====== os seus vídeos entram aqui ====== */}
    <Composition id="ReformaTributaria" component={RTB.ReformaTributaria} durationInFrames={RTB.DURACAO_NO_VIDEO} fps={RTB.FPS_DO_VIDEO} width={RTB.LARGURA} height={RTB.ALTURA} />
    <Composition id="DinoPl" component={DPL.DinoPl} durationInFrames={DPL.DURACAO_NO_VIDEO} fps={DPL.FPS_DO_VIDEO} width={DPL.LARGURA} height={DPL.ALTURA} />
    <Composition id="TabletsCamara" component={TBC.TabletsCamara} durationInFrames={TBC.DURACAO_NO_VIDEO} fps={TBC.FPS_DO_VIDEO} width={TBC.LARGURA} height={TBC.ALTURA} />
    <Composition id="BarraVelha" component={BVP.BarraVelha} durationInFrames={BVP.DURACAO_NO_VIDEO} fps={BVP.FPS_DO_VIDEO} width={BVP.LARGURA} height={BVP.ALTURA} />
    <Composition id="IsraelensesItacare" component={ISR.IsraelensesItacare} durationInFrames={ISR.DURACAO_NO_VIDEO} fps={ISR.FPS_DO_VIDEO} width={ISR.LARGURA} height={ISR.ALTURA} />
    <Composition id="TriplexLula" component={TPX.TriplexLula} durationInFrames={TPX.DURACAO_NO_VIDEO} fps={TPX.FPS_DO_VIDEO} width={TPX.LARGURA} height={TPX.ALTURA} />
    <Composition id="PecSeguranca" component={PS.PecSeguranca} durationInFrames={PS.DURACAO_NO_VIDEO} fps={PS.FPS_DO_VIDEO} width={PS.LARGURA} height={PS.ALTURA} />
    <Composition id="MidtermsResultado" component={MR.MidtermsResultado} durationInFrames={MR.DURACAO_NO_VIDEO} fps={MR.FPS_DO_VIDEO} width={MR.LARGURA} height={MR.ALTURA} />
    <Composition id="EleicaoEua" component={EE.EleicaoEua} durationInFrames={EE.DURACAO_NO_VIDEO} fps={EE.FPS_DO_VIDEO} width={EE.LARGURA} height={EE.ALTURA} />

    {/* thumbnails montadas por camadas (kit/thumb, skill thumbnail-chamativa): a receita vem por --props */}
    <Still id="ThumbYouTube" component={Thumb} width={1280} height={720} defaultProps={RECEITA_EXEMPLO} />
    <Still id="ThumbShorts" component={Thumb} width={1080} height={1920} defaultProps={{ ...RECEITA_EXEMPLO, formato: "shorts" }} />
    {/* cada src/videos/<pasta>/capa/thumb-*.json vira um Still na pasta Thumbs-<pasta> */}
    <ThumbsDosVideos />
  </>
);
