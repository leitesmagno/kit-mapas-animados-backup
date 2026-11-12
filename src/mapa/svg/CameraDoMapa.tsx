import { HEIGHT, WIDTH } from "../../tema";
import { mix } from "../../componentes/motion";
import { centroDoEstado, projetar, zoomPara } from "./projecao";

// Um enquadramento: para onde a câmera olha e quanto ela amplia.
//   { em: "BR" }                  o Brasil inteiro
//   { em: ["BA"] }                a Bahia ocupando a tela
//   { em: ["BA", "MG", "PE"] }    o conjunto cabendo na tela
//   { em: [-38.5, -12.97], zoom: 9 }   um ponto (lon, lat) com zoom dado
export type Enquadramento = { em: "BR" | string[] | [number, number]; zoom?: number; sobe?: number };

const resolver = (e: Enquadramento): { centro: [number, number]; zoom: number } => {
  if (e.em === "BR") return { centro: [WIDTH / 2, HEIGHT / 2], zoom: e.zoom ?? 1 };
  if (Array.isArray(e.em) && typeof e.em[0] === "number") {
    const [lon, lat] = e.em as [number, number];
    return { centro: projetar(lon, lat), zoom: e.zoom ?? 6 };
  }
  const siglas = e.em as string[];
  if (e.zoom !== undefined) return { centro: centroDoEstado(siglas[0]), zoom: e.zoom };
  return zoomPara(siglas);
};

// A câmera virtual: um transform no grupo do mapa. O zoom anda em escala logarítmica —
// é assim que um zoom parece constante para o olho, em vez de acelerar no fim.
export const transformDaCamera = (de: Enquadramento, para: Enquadramento, p: number) => {
  const a = resolver(de);
  const b = resolver(para);
  const zoom = Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), p));
  const cx = mix(a.centro[0], b.centro[0], p);
  const cy = mix(a.centro[1], b.centro[1], p);
  const sobe = mix(de.sobe ?? 0, para.sobe ?? 0, p);
  return `translate(${WIDTH / 2 - cx * zoom} ${HEIGHT / 2 - cy * zoom + sobe}) scale(${zoom})`;
};

// Onde um ponto do mapa cai na TELA, com a câmera no estado atual. É por isso que rótulo
// e marcador de cidade não moram dentro do grupo da câmera: lá eles cresceriam junto com o
// zoom, ficariam gigantes e sairiam do quadro. A geometria escala; a tipografia, não.
export const telaDe = (ponto: [number, number], de: Enquadramento, para: Enquadramento = de, p = 0): [number, number] => {
  const a = resolver(de);
  const b = resolver(para);
  const zoom = Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), p));
  const cx = mix(a.centro[0], b.centro[0], p);
  const cy = mix(a.centro[1], b.centro[1], p);
  const sobe = mix(de.sobe ?? 0, para.sobe ?? 0, p);
  return [WIDTH / 2 + (ponto[0] - cx) * zoom, HEIGHT / 2 + (ponto[1] - cy) * zoom + sobe];
};

type Props = { de: Enquadramento; para?: Enquadramento; p?: number; children: React.ReactNode };

// Envolve o mapa e aplica o enquadramento. Sem `para`, a câmera fica parada em `de`.
export const CameraDoMapa: React.FC<Props> = ({ de, para, p = 0, children }) => (
  <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
    <g transform={transformDaCamera(de, para ?? de, para ? p : 0)}>{children}</g>
  </svg>
);
