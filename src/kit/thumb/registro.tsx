import React from "react";
import { Folder, Still } from "remotion";
import { Thumb } from "./Thumb";
import type { ReceitaDeThumb } from "./tipos";

// ---------------------------------------------------------------------------
// TODA receita src/videos/<doc>/capa/thumb-*.json vira uma composição no Studio, sozinha: uma pasta
// "Thumbs-<doc>" com um Still por receita (Thumb-<doc>-<nome>), no tamanho do `formato`. Receita
// nova ou editada aparece na hora (o webpack observa a pasta). É dali que o usuário vê e renderiza.
// ---------------------------------------------------------------------------

type Contexto = { keys(): string[]; (chave: string): unknown };
declare global {
  interface ImportMeta {
    webpackContext(pasta: string, opcoes: { recursive: boolean; regExp: RegExp }): Contexto;
  }
}

const contexto = import.meta.webpackContext("../../videos", { recursive: true, regExp: /\/capa\/thumb-[^/]+\.json$/ });

type Item = { doc: string; nome: string; receita: ReceitaDeThumb };

const itens: Item[] = contexto
  .keys()
  // "./exemplo-horizontal/capa/thumb-1-um-em-cinco.json" (o contexto também lista "videos/…": fica só um)
  .filter((k) => k.startsWith("./"))
  .map((k) => {
    const [, doc, arquivo] = k.match(/^\.\/([^/]+)\/capa\/(thumb-[^/]+)\.json$/) ?? [];
    return { doc, nome: arquivo.replace(/^thumb-/, ""), receita: contexto(k) as ReceitaDeThumb };
  })
  .sort((a, b) => (a.doc + a.nome).localeCompare(b.doc + b.nome));

// o id do Remotion só aceita letras, números e hífen
const limpar = (s: string) => s.replace(/[^a-zA-Z0-9-]/g, "-");

export const ThumbsDosVideos: React.FC = () => {
  const docs = [...new Set(itens.map((i) => i.doc))];
  return (
    <>
      {docs.map((doc) => (
        <Folder key={doc} name={limpar(`Thumbs-${doc}`)}>
          {itens
            .filter((i) => i.doc === doc)
            .map((i) => {
              const shorts = i.receita.formato === "shorts";
              return (
                <Still
                  key={i.nome}
                  id={limpar(`Thumb-${doc}-${i.nome}`)}
                  component={Thumb}
                  width={shorts ? 1080 : 1280}
                  height={shorts ? 1920 : 720}
                  defaultProps={i.receita}
                />
              );
            })}
        </Folder>
      ))}
    </>
  );
};
