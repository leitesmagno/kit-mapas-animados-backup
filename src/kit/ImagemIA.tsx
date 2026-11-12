import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CURVA } from "./tempo";

// ---------------------------------------------------------------------------
// A IMAGEM GERADA POR IA numa cena (documentários horizontais): a imagem estática de alta
// resolução com movimento de câmera DETERMINÍSTICO (zoom, deslocamento, aproximação de um
// detalhe). Nada de vídeo gerado por IA.
//
// O manifesto vem do motor de imagens (scripts/imagens, `npm run imagens -- gerar <doc>`):
//   import manifesto from "./imagens/manifesto.json";
//   const img = imagemDoManifesto(manifesto, "petroleiros-no-estreito");
//   <ImagemIA imagem={img} movimento={{ de: { zoom: 1 }, ate: { zoom: 1.15, foco: [0.6, 0.45] } }} duracao={180} />
//
// O movimento é descrito por ZOOM (1 = a imagem cobrindo o quadro inteiro) e FOCO (o ponto da
// imagem, 0–1, que a câmera tenta centralizar). O deslocamento é SEMPRE limitado para a imagem
// cobrir o quadro: nunca aparece borda vazia, mesmo com foco no canto.
// ---------------------------------------------------------------------------

export type ImagemDoAcervo = {
  id: string;
  src: string; // relativo a public/
  largura: number;
  altura: number;
  ilustrativa: boolean; // gerada por IA = ilustração/reconstrução (nunca "foto do acontecimento")
  aprovada: boolean;
};

type VersaoNoManifesto = { arquivo: string; largura: number; altura: number };
type ImagemNoManifesto = { atual?: string; aprovada?: string | null; ilustrativa?: boolean; versoes?: Record<string, VersaoNoManifesto> };
export type ManifestoDeImagens = { documentario: string; imagens: Record<string, ImagemNoManifesto> };

// A versão em uso: a APROVADA; sem aprovação, a mais recente. Imagem ausente = erro claro (o render
// para em vez de sair com um buraco no quadro).
export const imagemDoManifesto = (manifesto: ManifestoDeImagens, id: string): ImagemDoAcervo => {
  const img = manifesto.imagens[id];
  const nome = img?.aprovada ?? img?.atual;
  const v = nome ? img?.versoes?.[nome] : undefined;
  if (!img || !v) throw new Error(`imagem "${id}" ainda não foi gerada (${manifesto.documentario}): rode npm run imagens -- gerar ${manifesto.documentario} ${id}`);
  return { id, src: v.arquivo, largura: v.largura, altura: v.altura, ilustrativa: img.ilustrativa ?? true, aprovada: !!img.aprovada };
};

export type Enquadramento = { zoom?: number; foco?: [number, number] };
export type MovimentoDeImagem = { de: Enquadramento; ate?: Enquadramento; curva?: (t: number) => number };

// Movimentos prontos (o foco padrão é o centro)
export const MOVIMENTOS = {
  aproximar: { de: { zoom: 1 }, ate: { zoom: 1.12 } },
  afastar: { de: { zoom: 1.12 }, ate: { zoom: 1 } },
  paraDireita: { de: { zoom: 1.1, foco: [0, 0.5] }, ate: { zoom: 1.1, foco: [1, 0.5] } },
  paraEsquerda: { de: { zoom: 1.1, foco: [1, 0.5] }, ate: { zoom: 1.1, foco: [0, 0.5] } },
  subir: { de: { zoom: 1.1, foco: [0.5, 1] }, ate: { zoom: 1.1, foco: [0.5, 0] } },
  descer: { de: { zoom: 1.1, foco: [0.5, 0] }, ate: { zoom: 1.1, foco: [0.5, 1] } },
  parada: { de: { zoom: 1 } },
} satisfies Record<string, MovimentoDeImagem>;

// A geometria (pura, testável): tamanho e posição da imagem para cobrir o quadro sem borda.
export const enquadrar = (quadro: { w: number; h: number }, imagem: { w: number; h: number }, zoom: number, foco: [number, number]) => {
  const z = Math.max(1, zoom); // abaixo de 1 apareceria borda
  const escala = Math.max(quadro.w / imagem.w, quadro.h / imagem.h) * z;
  const w = imagem.w * escala;
  const h = imagem.h * escala;
  // o foco vai para o centro do quadro…
  const x = quadro.w / 2 - foco[0] * w;
  const y = quadro.h / 2 - foco[1] * h;
  // …até onde a borda da imagem encosta na do quadro
  return { w, h, x: Math.min(0, Math.max(quadro.w - w, x)), y: Math.min(0, Math.max(quadro.h - h, y)) };
};

export const ImagemIA: React.FC<{
  imagem: ImagemDoAcervo;
  movimento?: MovimentoDeImagem;
  inicio?: number; // quadro em que o movimento começa (relativo à Sequence)
  duracao?: number; // quadros do movimento (padrão: a duração da Sequence)
  escurecer?: number; // 0–1: véu escuro para texto por cima
}> = ({ imagem, movimento = MOVIMENTOS.aproximar as MovimentoDeImagem, inicio = 0, duracao, escurecer = 0 }) => {
  const f = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const n = duracao ?? durationInFrames - inicio;
  const t = (movimento.curva ?? CURVA.suave)(interpolate(f, [inicio, inicio + Math.max(1, n)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const de = { zoom: 1, foco: [0.5, 0.5] as [number, number], ...movimento.de };
  const ate = { ...de, ...movimento.ate };
  const zoom = de.zoom + (ate.zoom - de.zoom) * t;
  const foco: [number, number] = [de.foco[0] + (ate.foco[0] - de.foco[0]) * t, de.foco[1] + (ate.foco[1] - de.foco[1]) * t];
  const q = enquadrar({ w: width, h: height }, { w: imagem.largura, h: imagem.altura }, zoom, foco);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(imagem.src)}
        style={{ position: "absolute", left: 0, top: 0, width: q.w, height: q.h, transform: `translate(${q.x}px, ${q.y}px)`, maxWidth: "none" }}
      />
      {escurecer > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} /> : null}
    </AbsoluteFill>
  );
};
