import { fitText } from "@remotion/layout-utils";
import React from "react";
import { useVideoConfig } from "remotion";
import type { CamadaTexto, LinhaDeTexto } from "./tipos";

// ---------------------------------------------------------------------------
// O TÍTULO DE THUMBNAIL: letra de impacto com contorno grosso POR FORA (a letra não afina), bloco 3D
// atrás (extrusão), degradê ou cor chapada, halo e marcador colorido atrás de uma palavra.
//
// Cada linha são duas cópias do texto empilhadas: atrás, a silhueta (contorno + extrusão + sombra);
// na frente, o preenchimento. Assim o contorno cresce para fora, como nos editores.
// Com `largura`, a linha encolhe até caber (medida com a fonte já carregada — ver Thumb).
// ---------------------------------------------------------------------------

const PESO: Record<string, number> = { Montserrat: 900 };

export const TextoThumb: React.FC<{ camada: CamadaTexto }> = ({ camada }) => {
  const { width, height } = useVideoConfig();
  const fonte = camada.fonte ?? "Anton";
  const peso = PESO[fonte] ?? 400;
  const corpo = (camada.tamanho ?? 0.16) * height;
  const contorno = camada.contorno === false ? null : { cor: camada.contorno?.cor ?? "#000", largura: (camada.contorno?.largura ?? 0.012) * height };
  const ext = camada.extrusao === false ? null : { cor: camada.extrusao?.cor ?? "#000", prof: (camada.extrusao?.profundidade ?? 0.012) * height, ang: camada.extrusao?.angulo ?? 60 };
  const ancora = camada.ancora ?? "centro";
  const deslocX = ancora === "centro" ? "-50%" : ancora === "direita" ? "-100%" : "0%";
  const espacamento = camada.espacamento ?? 0.01;

  const linhas = camada.linhas.map((l): Exclude<LinhaDeTexto, string> => (typeof l === "string" ? { texto: l } : l));
  const tamanhos = linhas.map((l) => {
    let tam = corpo * (l.escala ?? 1);
    if (camada.largura) {
      const folga = (contorno ? contorno.largura * 2 : 0) + (ext ? ext.prof : 0) + (l.caixa ? tam * 0.5 : 0);
      const cabe = fitText({ text: l.texto.toUpperCase(), withinWidth: camada.largura * width - folga, fontFamily: `"${fonte}"`, fontWeight: peso, letterSpacing: `${espacamento}em` }).fontSize;
      tam = Math.min(tam, cabe);
    }
    return tam;
  });

  return (
    <div
      style={{
        position: "absolute",
        left: camada.x * width,
        top: camada.y * height,
        transform: `translate(${deslocX}, -50%) rotate(${camada.rot ?? 0}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: ancora === "centro" ? "center" : ancora === "direita" ? "flex-end" : "flex-start",
        lineHeight: camada.entrelinha ?? 0.92,
        fontFamily: `"${fonte}"`,
        fontWeight: peso,
        letterSpacing: `${espacamento}em`,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {/* duas passadas iguais e sobrepostas: todas as silhuetas, depois todos os preenchimentos (o
          contorno do acento de uma linha não cobre a letra da linha de cima) */}
      {(["silhueta", "preenchimento"] as const).map((passada) => (
        <div
          key={passada}
          style={{
            position: passada === "silhueta" ? "relative" : "absolute",
            inset: passada === "silhueta" ? undefined : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "inherit",
          }}
        >
          {linhas.map((l, i) => (
            <Linha key={i} passada={passada} linha={l} tamanho={tamanhos[i]} cor={camada.cor ?? "#FFFFFF"} contorno={contorno} ext={ext} brilho={camada.brilho} altura={height} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Linha: React.FC<{
  passada: "silhueta" | "preenchimento";
  linha: Exclude<LinhaDeTexto, string>;
  tamanho: number;
  cor: string;
  contorno: { cor: string; largura: number } | null;
  ext: { cor: string; prof: number; ang: number } | null;
  brilho?: string;
  altura: number;
}> = ({ passada, linha, tamanho, cor, contorno, ext, brilho, altura }) => {
  // a extrusão é uma pilha de sombras sem desfoque, 1 px a 1 px, na direção do ângulo
  const sombras: string[] = [];
  if (ext) {
    const passos = Math.max(1, Math.round(ext.prof));
    const dx = Math.cos((ext.ang * Math.PI) / 180);
    const dy = Math.sin((ext.ang * Math.PI) / 180);
    for (let k = 1; k <= passos; k++) sombras.push(`${(dx * k).toFixed(1)}px ${(dy * k).toFixed(1)}px 0 ${ext.cor}`);
  }
  sombras.push(`0 ${altura * 0.012}px ${altura * 0.03}px rgba(0,0,0,0.55)`);
  if (brilho) sombras.push(`0 0 ${altura * 0.05}px ${brilho}`, `0 0 ${altura * 0.1}px ${brilho}`);

  const naCaixa = !!linha.caixa;
  // o degradê só pinta dentro da caixa do elemento: a folga em cima (padding, desfeito no `top`)
  // cobre os acentos, que sobem acima da linha (Ó, Ã, É)
  const preenchimento: React.CSSProperties = linha.gradiente
    ? { backgroundImage: `linear-gradient(180deg, ${linha.gradiente[0]} 35%, ${linha.gradiente[1]} 90%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingTop: "0.3em", marginTop: "-0.3em" }
    : { color: naCaixa ? linha.corNaCaixa ?? "#000" : linha.cor ?? cor };

  return (
    <div
      style={{
        position: "relative",
        fontSize: tamanho,
        transform: linha.rot ? `rotate(${linha.rot}deg)` : undefined,
        padding: naCaixa ? `${tamanho * 0.04}px ${tamanho * 0.18}px ${tamanho * 0.0}px` : undefined,
        margin: naCaixa ? `${tamanho * 0.06}px 0` : undefined,
      }}
    >
      {naCaixa && passada === "silhueta" ? (
        <div style={{ position: "absolute", inset: 0, background: linha.caixa, transform: "skewX(-6deg)", boxShadow: `0 ${altura * 0.01}px ${altura * 0.03}px rgba(0,0,0,0.5)`, borderRadius: tamanho * 0.06 }} />
      ) : null}
      {/* atrás: a silhueta (contorno por fora + bloco 3D + sombra) */}
      <span
        aria-hidden
        style={{
          position: "relative",
          visibility: passada === "silhueta" ? "visible" : "hidden", // na 2ª passada só ocupa o lugar
          color: naCaixa || !contorno ? "transparent" : contorno.cor,
          WebkitTextStroke: !naCaixa && contorno ? `${contorno.largura * 2}px ${contorno.cor}` : undefined,
          textShadow: naCaixa ? undefined : sombras.join(", "),
        }}
      >
        {linha.texto}
      </span>
      {/* na frente: o preenchimento */}
      {passada === "preenchimento" ? <span style={{ position: "absolute", left: naCaixa ? tamanho * 0.18 : 0, top: naCaixa ? tamanho * 0.04 : 0, ...preenchimento }}>{linha.texto}</span> : null}
    </div>
  );
};
