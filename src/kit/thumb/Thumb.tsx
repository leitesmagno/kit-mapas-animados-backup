import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Img, staticFile, useVideoConfig } from "remotion";
import { fontesCarregadas } from "../../fontes";
import { Brilho, Circulo, Logo, Raios, Recorte, Selo, Seta } from "./Pecas";
import { TextoThumb } from "./TextoThumb";
import type { Camada, Fundo, ReceitaDeThumb } from "./tipos";

// ---------------------------------------------------------------------------
// A THUMBNAIL MONTADA POR CAMADAS (skill thumbnail-chamativa). Uma composição só para todas: a
// receita (JSON) diz o fundo, as camadas e o acabamento.
//   npm run thumb -- <doc>              renderiza src/videos/<doc>/capa/thumb-*.json + a folha de conferência
//   npx remotion still ThumbYouTube out/x.png --props=src/videos/<doc>/capa/thumb-a.json
// ThumbYouTube = 1280×720; ThumbShorts = 1080×1920 (capa do Shorts).
// ---------------------------------------------------------------------------

export const Thumb: React.FC<ReceitaDeThumb> = (receita) => {
  const { width, height } = useVideoConfig();
  // o título mede a própria largura: só desenha depois de as fontes chegarem
  const [pronto, setPronto] = useState(false);
  const [espera] = useState(() => delayRender("fontes da thumbnail"));
  useEffect(() => {
    fontesCarregadas.then(() => {
      setPronto(true);
      continueRender(espera);
    });
  }, [espera]);

  const fundos = Array.isArray(receita.fundo) ? receita.fundo : [receita.fundo];
  const div = receita.divisao ?? {};
  const inclinacao = (div.inclinacao ?? 0.08) * width;
  const vinheta = receita.acabamento?.vinheta ?? 0.45;
  const tom = receita.acabamento?.tom;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {fundos.length === 2 ? (
        <>
          <PlanoDeFundo fundo={fundos[0]} recorte={`polygon(0 0, ${width / 2 + inclinacao / 2}px 0, ${width / 2 - inclinacao / 2}px 100%, 0 100%)`} />
          <PlanoDeFundo fundo={fundos[1]} recorte={`polygon(${width / 2 + inclinacao / 2}px 0, 100% 0, 100% 100%, ${width / 2 - inclinacao / 2}px 100%)`} />
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <line x1={width / 2 + inclinacao / 2} y1={-10} x2={width / 2 - inclinacao / 2} y2={height + 10} stroke={div.cor ?? "#FFFFFF"} strokeWidth={(div.largura ?? 0.014) * height} />
          </svg>
        </>
      ) : (
        <PlanoDeFundo fundo={fundos[0]} />
      )}
      {vinheta > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${vinheta}) 100%)` }} /> : null}
      {pronto ? receita.camadas.map((c, i) => <Desenhar key={i} camada={c} />) : null}
      {tom ? <AbsoluteFill style={{ background: tom, mixBlendMode: "soft-light", opacity: receita.acabamento?.intensidadeDoTom ?? 0.35 }} /> : null}
      {receita.acabamento?.moldura ? (
        <AbsoluteFill style={{ boxShadow: `inset 0 0 0 ${(receita.acabamento.moldura.largura ?? 0.014) * height}px ${receita.acabamento.moldura.cor ?? "#FFD400"}` }} />
      ) : null}
      {receita.guias ? <Guias /> : null}
    </AbsoluteFill>
  );
};

const PlanoDeFundo: React.FC<{ fundo: Fundo; recorte?: string }> = ({ fundo, recorte }) => {
  const { height } = useVideoConfig();
  const [fx, fy] = fundo.foco ?? [0.5, 0.5];
  const filtro = [
    fundo.desfoque ? `blur(${fundo.desfoque * height}px)` : "",
    `brightness(${fundo.brilho ?? 1})`,
    `contrast(${fundo.contraste ?? 1.1})`,
    `saturate(${fundo.saturacao ?? 1.2})`,
  ].join(" ");
  return (
    <AbsoluteFill style={{ clipPath: recorte, background: fundo.gradiente ?? fundo.cor ?? "#111" }}>
      {fundo.src ? (
        <Img
          src={staticFile(fundo.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${fx * 100}% ${fy * 100}%`,
            transform: `scale(${(fundo.zoom ?? 1) * (fundo.desfoque ? 1.05 : 1)}) scaleX(${fundo.espelhar ? -1 : 1})`,
            transformOrigin: `${fx * 100}% ${fy * 100}%`,
            filter: filtro,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Desenhar: React.FC<{ camada: Camada }> = ({ camada }) => {
  switch (camada.tipo) {
    case "texto":
      return <TextoThumb camada={camada} />;
    case "recorte":
      return <Recorte camada={camada} />;
    case "seta":
      return <Seta camada={camada} />;
    case "circulo":
      return <Circulo camada={camada} />;
    case "selo":
      return <Selo camada={camada} />;
    case "brilho":
      return <Brilho camada={camada} />;
    case "raios":
      return <Raios camada={camada} />;
    case "logo":
      return <Logo camada={camada} />;
  }
};

// As áreas que o YouTube cobre: a duração (canto inferior direito) no 16:9; no Shorts, o texto e os
// botões da interface (pé e lateral direita). Só para conferir — nunca na thumbnail entregue.
const Guias: React.FC = () => {
  const { width, height } = useVideoConfig();
  const estilo: React.CSSProperties = { position: "absolute", background: "rgba(255,0,80,0.28)", border: "2px dashed #ff0050" };
  if (width > height) return <div style={{ ...estilo, right: width * 0.015, bottom: height * 0.03, width: width * 0.12, height: height * 0.085 }} />;
  return (
    <>
      <div style={{ ...estilo, left: 0, right: 0, bottom: 0, height: height * 0.2 }} />
      <div style={{ ...estilo, right: 0, top: height * 0.45, width: width * 0.14, height: height * 0.35 }} />
    </>
  );
};

export type { ReceitaDeThumb } from "./tipos";

// a receita de exemplo (o padrão das composições no Studio): usa o fundo e os ícones do g01
export const RECEITA_EXEMPLO: ReceitaDeThumb = {
  formato: "youtube",
  fundo: { src: "imagens-ia/exemplo-horizontal-capa/capa-petroleiro/7407fb59bf390f63.jpg", foco: [0.62, 0.5], zoom: 1.08 },
  acabamento: { vinheta: 0.55 },
  camadas: [
    { tipo: "brilho", x: 0.72, y: 0.5, raio: 0.5, cor: "#FFB347", intensidade: 0.55 },
    { tipo: "recorte", icone: "barril_de_petroleo", x: 0.8, y: 0.7, altura: 0.42, rot: 10, brilho: "#FF8A00" },
    { tipo: "texto", linhas: ["20% DO", { texto: "PETRÓLEO", cor: "#FFD400", escala: 1.25 }, { texto: "PASSA AQUI", caixa: "#FF2D2D", corNaCaixa: "#FFFFFF", escala: 0.55 }], x: 0.05, y: 0.5, ancora: "esquerda", tamanho: 0.2, largura: 0.55, rot: -3 },
    { tipo: "seta", de: [0.5, 0.22], para: [0.66, 0.42], curva: -0.5 },
  ],
};
