import { geoArea, geoBounds } from "d3-geo";
import type { Feature, Geometry, MultiPolygon, Polygon } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { useFormato } from "../../motor/formato";
import { CartelaDeTitulo } from "../horizontal/CartelaDeTitulo";
import { CartelaFinal } from "../horizontal/CartelaFinal";
import { Destaque } from "../horizontal/Destaque";
import { ImagemEditorial } from "../horizontal/ImagemEditorial";
import { RegiaoEditorial } from "../horizontal/RegiaoEditorial";
import { RotuloMapa } from "../horizontal/RotuloMapa";
import { TituloDeLugar } from "../../base/componentes/TituloDeLugar";
import { posicaoDoNome } from "./layout";
import { CirculoNoMapa } from "../CirculoNoMapa";
import { IconeDestaque } from "../IconeDestaque";
import { ImagemDeDrone } from "../ImagemDeDrone";
import { imagemDoManifesto, type ManifestoDeImagens } from "../ImagemIA";
import { ImagemNaForma } from "../ImagemNaForma";
import { PainelNumero } from "../PainelNumero";
import { ParteDoTodo } from "../ParteDoTodo";
import { RegiaoDestaque } from "../RegiaoDestaque";
import { RotaGeo } from "../RotaGeo";
import { TextoDigitado } from "../TextoDigitado";
import { TextoImpacto } from "../TextoImpacto";
import { TextoNoMar } from "../TextoNoMar";
import { trajeto, type Trajeto } from "../trajeto";
import type { BatidaNoTempo, CartelaDeCapitulo } from "./montar";

// ---------------------------------------------------------------------------
// As CAMADAS do documentário declarativo: cada batida vira a peça do kit de sempre. Só monta o
// que está na janela de tempo dela (com folga para a saída), então um vídeo de 10 min continua
// leve no Studio.
//   <MapCamera chaves={M.chaves}>
//     <MapaSvg> … <MapaDasBatidas batidas={M.batidas} paises={…} /> </MapaSvg>
//     <TextosDasBatidas batidas={M.batidas} />
//   </MapCamera>
//   <ImagensDasBatidas batidas={M.batidas} manifesto={manifesto} />
// ---------------------------------------------------------------------------

const SAIDA = 40; // quadros de folga depois da saída (as peças saem animadas)
const ativa = (b: BatidaNoTempo, f: number) => f >= b.q0 - 2 && f <= b.q1 + SAIDA;

const trajetos = new WeakMap<object, Trajeto>();
const trajetoDe = (linha: [number, number][]) => {
  let t = trajetos.get(linha);
  if (!t) {
    t = trajeto(linha);
    trajetos.set(linha, t);
  }
  return t;
};

// A caixa da bandeira: a do MAIOR pedaço do país (a bandeira fica no corpo do país, não puxada
// para um enclave ou uma ilha) — geográfica, então ela anda junto com o mapa sem "nadar".
const caixas = new WeakMap<object, [[number, number], [number, number]]>();
const caixaDaBandeira = (forma: Feature<Geometry>) => {
  let c = caixas.get(forma);
  if (c) return c;
  const g = forma.geometry;
  let alvo: Feature<Geometry> = forma;
  if (g.type === "MultiPolygon") {
    const partes = (g as MultiPolygon).coordinates.map((coordinates) => ({ type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates } as Polygon }));
    alvo = partes.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a));
  }
  c = geoBounds(alvo) as [[number, number], [number, number]];
  caixas.set(forma, c);
  return c;
};

// dentro do <MapaSvg>: países (com a bandeira dentro, se houver), rotas e círculos
export const MapaDasBatidas: React.FC<{ batidas: BatidaNoTempo[]; pais: (iso: string) => Feature<Geometry> }> = ({ batidas, pais }) => {
  const f = useCurrentFrame();
  // a IDENTIDADE HORIZONTAL é a dos vídeos São Luís / Piauí / Ceará: contorno dourado com brilho,
  // sem bandeira e sem cor chapada (os verticais continuam com as peças de sempre)
  const horizontal = useFormato().nome === "horizontal";
  return (
    <>
      {batidas.map((b, i) => {
        if (!ativa(b, f)) return null;
        if (b.tipo === "pais") {
          const forma = pais(b.iso);
          if (horizontal) return <RegiaoEditorial key={i} regiao={forma} entra={b.q0} sai={b.q1} cor={b.cor} foco={b.foco} />;
          return b.bandeira ? (
            // `parada`: sem o zoom interno (ele somava ao zoom da câmera e a bandeira "tremia")
            <ImagemNaForma key={i} regiao={forma} src={b.bandeira} entra={b.q0} sai={b.q1} opacidade={b.opacidade ?? 0.82} borda="#FFFFFF" parada caixaImagem={caixaDaBandeira(forma)} />
          ) : (
            <RegiaoDestaque key={i} regiao={forma} entra={b.q0} sai={b.q1} cor={b.cor} opacidade={b.opacidade ?? 0.6} />
          );
        }
        if (b.tipo === "rota") {
          const t = trajetoDe(b.linha as [number, number][]);
          const metros = interpolate(f, [b.q0, Math.max(b.q0 + 1, b.qChega ?? b.q0 + 30)], [0, t.total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <RotaGeo key={i} trajeto={t} metros={metros} entra={b.q0} sai={b.q1} cor={b.cor ?? "#F2B45A"} largura={b.largura ?? 5} partida={b.partida ?? true} />;
        }
        if (b.tipo === "circulo") return <CirculoNoMapa key={i} centro={b.ponto} raioKm={b.raioKm} entra={b.q0} sai={b.q1} cor={b.cor ?? "#2EE6A6"} minimoPx={26} />;
        return null;
      })}
    </>
  );
};

// dentro do <MapCamera>, fora do SVG: nomes, mares, painéis, proporções, ícones, impacto, datas
export const TextosDasBatidas: React.FC<{ batidas: BatidaNoTempo[] }> = ({ batidas }) => {
  const f = useCurrentFrame();
  // no horizontal, número e data saem no estilo do documentário (Destaque, sem cartão); no
  // vertical, as peças de sempre (PainelNumero, TextoDigitado)
  const horizontal = useFormato().nome === "horizontal";
  return (
    <>
      {batidas.map((b, i) => {
        if (!ativa(b, f)) return null;
        switch (b.tipo) {
          case "nome":
            if (horizontal) {
              const p = posicaoDoNome(b);
              return <RotuloMapa key={i} linhas={[b.texto]} ponto={b.ponto} entra={b.q0} sai={b.q1} estilo={p.estilo} dx={p.dx} dy={p.dy} marcador={p.marcador} cor={b.cor} />;
            }
            return <TextoDigitado key={i} texto={b.texto} ponto={b.ponto} entra={b.q0} sai={b.q1} corpo={b.corpo ?? 44} peso={900} brilho={b.cor} ancora={b.ancora} seta={b.seta} dx={b.dx} dy={b.dy} />;
          case "mar":
            if (horizontal) return <RotuloMapa key={i} linhas={b.linhas} ponto={b.ponto} entra={b.q0} sai={b.q1} estilo="agua" />;
            return <TextoNoMar key={i} linhas={b.linhas} ponto={b.ponto} entra={b.q0} sai={b.q1} corpo={b.corpo ?? 44} />;
          case "painel":
            if (horizontal) return <Destaque key={i} texto={b.numero} unidade={b.unidade} rotulo={b.rotulo} icone={b.icone} entra={b.q0} sai={b.q1} cor={b.cor} corpo={b.corpo ? b.corpo * 1.15 : 118} />;
            return <PainelNumero key={i} numero={b.numero} unidade={b.unidade} rotulo={b.rotulo} icone={b.icone} entra={b.q0} sai={b.q1} cor={b.cor} corpo={b.corpo} x={b.x} y={b.y} />;
          case "proporcao":
            return <ParteDoTodo key={i} total={b.total} destaque={b.destaque} icone={b.icone} entra={b.q0} acende={b.qAcende ?? b.q0} sai={b.q1} cor={b.cor} tamanho={b.tamanho} x={b.x} y={b.y} />;
          case "icone":
            return (
              <IconeDestaque key={i} nome={b.icone} ponto={b.ponto} x={b.x} y={b.y} desvio={[b.dx ?? 0, b.dy ?? 0]} entra={b.q0} sai={b.q1} tamanho={b.tamanho ?? 150} cor={b.cor ?? "#F2B45A"} haste={b.haste} disco={b.disco ?? false} espelhar={b.espelhar} parado />
            );
          case "impacto":
            // no horizontal, o letreiro do Piauí no alto da tela (o nome sobe de trás de uma máscara)
            if (horizontal) return <TituloDeLugar key={i} titulo={b.linhas.join(" ")} entra={b.q0} sai={b.q1} y={175} tamanho={58} />;
            return <TextoImpacto key={i} linhas={b.linhas} entra={b.q0} sai={b.q1} y={b.y} corpo={b.corpo} />;
          case "data":
            if (horizontal) return <Destaque key={i} texto={b.texto} rotulo={b.rotulo} entra={b.q0} sai={b.q1} cor={b.cor} corpo={104} y={300} />;
            // o ano grande no terço esquerdo, em cima (a história andando no tempo)
            return (
              <div key={i}>
                <TextoDigitado texto={b.texto} entra={b.q0} sai={b.q1} x={150} y={170} ancora="esquerda" corpo={104} peso={900} brilho={b.cor ?? "#F2B45A"} />
                {b.rotulo ? <TextoDigitado texto={b.rotulo} entra={b.q0 + 6} sai={b.q1} x={156} y={252} ancora="esquerda" corpo={30} peso={800} passo={0.8} /> : null}
              </div>
            );
          case "titulo":
            return <CartelaDeTitulo key={i} forma="principal" titulo={b.titulo} abaixo={b.abaixo} entra={b.q0} sai={b.q1} />;
          case "cartela": {
            const m = b.qCartela!;
            return <CartelaFinal key={i} entra={b.q0} siga={m.siga} sino={m.sino} like={m.like} compartilhe={m.compartilhe} comente={m.comente} pergunta={b.pergunta} perguntaEm={m.pergunta} />;
          }
          default:
            return null;
        }
      })}
    </>
  );
};

// fora da câmera: as imagens de apoio em tela cheia (chicote lateral), do manifesto do motor de imagens
export const ImagensDasBatidas: React.FC<{ batidas: BatidaNoTempo[]; manifesto: ManifestoDeImagens }> = ({ batidas, manifesto }) => {
  const f = useCurrentFrame();
  const horizontal = useFormato().nome === "horizontal";
  return (
    <>
      {batidas.map((b, i) => {
        if (b.tipo !== "imagem" || !ativa(b, f)) return null;
        const img = imagemDoManifesto(manifesto, b.id);
        // no horizontal a imagem DISSOLVE (o chicote lateral é dos Shorts)
        if (horizontal) {
          const [fx, fy] = (b.foco ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100);
          return <ImagemEditorial key={i} imagem={img} entra={b.q0} sai={b.q1 - 14} foco={[fx, fy]} />;
        }
        return <ImagemDeDrone key={i} src={img.src} entra={b.q0} sai={b.q1 - 10} foco={b.foco ?? "50% 50%"} sentido={b.sentido ?? 1} zoom={b.zoom ?? [1.04, 1.12]} deslize={b.deslize ?? [-40, 0]} />;
      })}
    </>
  );
};

// as cartelas de abertura dos capítulos (por cima do mapa, embaixo das imagens e da legenda)
export const CapitulosNaTela: React.FC<{ capitulos: CartelaDeCapitulo[] }> = ({ capitulos }) => (
  <>
    {capitulos.map((c) => (
      <CartelaDeTitulo key={c.numero} forma="capitulo" acima={`CAPÍTULO ${String(c.numero).padStart(2, "0")}`} titulo={c.titulo} entra={c.entra} sai={c.sai} />
    ))}
  </>
);
