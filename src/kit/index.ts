// ---------------------------------------------------------------------------
// O KIT DE ESTILO — as peças dos vídeos de mapa "virais" (ver ESTILO.md na raiz).
// Funciona sobre o motor SVG dos vídeos São Luís / Noroeste / Piauí:
//   <MapCamera chaves={percurso([...])}>
//     <MapBackground /> <SatelliteLayer … />
//     <MapaSvg>  ← RegiaoDestaque, ImagemNaForma, FotoSaltando (peças SVG)
//     </MapaSvg>
//     ← RotuloValor, PinoRotulo, Icone3D, Precipitacao, BalaoDeFala (HTML presas ao mapa)
//   </MapCamera>
//   ← TituloGancho, CartaoHud, LegendaPalavras, NumeroNoMapa (composição de tela)
//   ← VazamentoDeLuz, FlashBokeh, Clarao (transições, por último)
// ---------------------------------------------------------------------------

export { BANDEIRAS, ICONES, type NomeDaBandeira, type NomeDoIcone } from "./assets";
export { enquadrarNaArea, percurso, vistaDe, vistaEm, type Parada } from "./camera";
// o perfil de formato (vertical 9:16 × horizontal 16:9): as peças leem dele os seus padrões
export { FORMATOS, formatoDe, useFormato, type AreaDaTela, type Formato, type NomeDoFormato } from "../motor/formato";
// proporção em símbolos ("1 em cada 5 barris"): o gráfico que se lê no celular
export { ParteDoTodo } from "./ParteDoTodo";
export { CartaoFoto } from "./CartaoFoto";
export { CartaoHud } from "./CartaoHud";
export { FotoSaltando } from "./FotoSaltando";
export { BalaoDeFala, Icone3D, IconesEspalhados, Precipitacao, icone } from "./Icone3D";
export { IconeDuna } from "./IconeDuna";
export { ImagemNaForma, bandeira } from "./ImagemNaForma";
export { PALETAS, TEMATICAS, type NomeDaPaleta, type Paleta } from "./paleta";
export { RegiaoDestaque, type EstiloDeRegiao } from "./RegiaoDestaque";
export { JanelaFoto, type FotoDaJanela } from "./JanelaFoto";
export { MARCA_PADRAO, MarcaDagua } from "./MarcaDagua";
// o selo com a logo do canal: a identidade dos vídeos horizontais (o vertical usa a MarcaDagua)
export { LogoDoCanal } from "./LogoDoCanal";
export { RelogioAndando } from "./Relogio";
export { RotuloValor } from "./RotuloValor";
export { LegendaPalavras, PinoRotulo, TituloGancho, trocarPalavras, type PalavraFalada } from "./Textos";
// o estilo "Mapas Animados": nome/número digitado caractere a caractere, apaga de trás para frente
export { TextoDigitado } from "./TextoDigitado";
export { BorraoRadial } from "./BorraoRadial";
export { TextoImpacto } from "./TextoImpacto";
// a imagem real em tela cheia (o "trecho de drone"), com chicote lateral e movimento interno
export { ImagemDeDrone } from "./ImagemDeDrone";
// o acabamento "de editor": o ícone 3D de vitrine, o painel de número e a etiqueta de lugar
export { IconeDestaque } from "./IconeDestaque";
export { EtiquetaDeLugar, PainelNumero } from "./PainelNumero";
export { SetaReta } from "./SetaReta";
// a etiqueta chapada (nome de partido, escudo de rodovia) presa ao mapa, com o texto digitado
export { TagNoMapa } from "./TagNoMapa";
// a pessoa no lugar dela: retrato redondo com aro na cor do assunto, nome digitado e selo
export { RetratoNoMapa } from "./RetratoNoMapa";
export { BorraoDeVoo, Clarao, FlashBokeh, VazamentoDeLuz } from "./Transicoes";
export { CURVA, FPS_DO_KIT, boia, entra, idSvg, pulso, quadro, sai, useQuadro, vida } from "./tempo";
export { UFS, estado, regiao, type PropsUF } from "./geo";
// o globo (vídeos que viajam pelo mundo): câmera em perspectiva sobre o planeta em WebGL;
// as peças acima funcionam dentro dele (ele alimenta o mesmo contexto do <MapCamera>)
export { CameraGlobo, Globo, useGlobo, type LuzDoGlobo } from "./Globo";
export { CURVA_GLOBO, estadoDoGlobo, type CameraGlobo as VistaGlobo, type ChaveGlobo, type Mosaico } from "./cameraGlobo";
export { TituloCinema } from "./TituloCinema";
// a imagem gerada por IA (documentários 16:9), com movimento de câmera que nunca mostra borda
export { ImagemIA, MOVIMENTOS, enquadrar, imagemDoManifesto, type ImagemDoAcervo, type ManifestoDeImagens, type MovimentoDeImagem } from "./ImagemIA";
export { CirculoNoMapa } from "./CirculoNoMapa";
export { RotaNoGlobo } from "./RotaNoGlobo";
export { FotoIris, type FotoDaIris } from "./FotoIris";
export { Chamada } from "./Chamada";
export { chavesDeFuncao, distanciaKm, escalaDoZoom as escalaDoZoomGlobo, projetarNoAr, RAIO_DA_TERRA, viagemGlobo } from "./cameraGlobo";
export { faixaDeTiles, mosaico, type Recorte } from "./mosaicos";
// o formato comercial (geostorytelling: do espaço até a porta de um lugar)
export { metrosEntre, ritmoDoTrajeto, trajeto, type Trajeto } from "./trajeto";
export { RotaGeo } from "./RotaGeo";
export { MarcadorGeo, type TipoDeLugar } from "./MarcadorGeo";
export { MapaUrbano, type Enderecos, type Rios, type Ruas } from "./MapaUrbano";
export { FotoDoDestino, FotoOuEspaco, LAYOUT_FINAL, PainelFinal, recorteDoMapa, type DestinoGeo } from "./DestinoGeo";
export { NomeDaVia } from "./NomeDaVia";
// o passeio pela cidade (bairro por bairro, ponto por ponto, pela rua)
export { PontoGeo, type TipoDePonto } from "./PontoGeo";
export { cameraNaRota, desenrolarGiro } from "./cameraNaRota";
export { JornadaDeBairros, destaqueDaJornada, planejarJornada, type JanelaDaJornada, type ParadaDaJornada } from "./JornadaDeBairros";
// vídeo narrado: as imagens trocáveis (pasta de substituições) e a mixagem voz > música > efeitos
export { catalogoDeImagens, EXTENSOES_DE_IMAGEM, type ImagemDoCatalogo, type ImagemResolvida } from "./imagensTrocaveis";
export { blocosDeFala, falando, Mixagem, type Fala, type Musica, type PalavraNoTempo, type Som } from "./Mixagem";
export { Selo3D } from "./Selo3D";
// a linguagem sóbria (documentário): a foto presa ao lugar e o traçado que anda (rio, viagem)
export { FotoNoMapa, type FotoDaSequencia } from "./FotoNoMapa";
export { CartaoNoMapa } from "./CartaoNoMapa";
export { FotoNoMapaAnimada, type FotoAnimada } from "./FotoNoMapaAnimada";
export { TextoNoMar } from "./TextoNoMar";
export { NomeNoRio } from "./NomeNoRio";
export { TracadoGeo } from "./TracadoGeo";
export { MapaDeLocalizacao, type ParadaDoMapinha } from "./MapaDeLocalizacao";
