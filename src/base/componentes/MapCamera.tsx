import { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useQuadro } from "../../kit/tempo";
import { cameraDoVideo, type Chave } from "../geo/camera";
import { criarCaminho, criarProjetor, type Camera, type Projetor } from "../geo/projecao";

// A câmera do vídeo: calcula, para o quadro atual, onde ela está (chaves + deriva) e
// entrega aos filhos o projetor lon/lat → tela e o gerador de caminhos SVG. Todo
// componente de mapa lê daqui, então tudo anda junto — geometria, rótulos, marcadores.

export type Mapa = {
  camera: Camera;
  projetar: Projetor;
  caminho: ReturnType<typeof criarCaminho>;
  largura: number;
  altura: number;
};

const Contexto = createContext<Mapa | null>(null);
// Outra câmera (o globo do kit) alimenta as MESMAS peças por aqui.
export const ProvedorDoMapa = Contexto.Provider;

export const useMapa = (): Mapa => {
  const m = useContext(Contexto);
  if (!m) throw new Error("useMapa fora de <MapCamera>");
  return m;
};

// A mesma coisa, sem exigir a câmera: devolve null fora dela (peças que funcionam nos dois
// lugares, como o ícone 3D com posição de tela).
export const useMapaOpcional = (): Mapa | null => useContext(Contexto);

export const MapCamera: React.FC<{ chaves: Chave[]; deriva?: number; children: React.ReactNode }> = ({
  chaves,
  deriva: forca = 1,
  children,
}) => {
  const quadro = useQuadro();
  const { width, height } = useVideoConfig();
  const mapa = useMemo(() => {
    const camera = cameraDoVideo(chaves, quadro, width, forca);
    const projetar = criarProjetor(camera, width, height);
    return { camera, projetar, caminho: criarCaminho(projetar), largura: width, altura: height };
  }, [chaves, quadro, width, height, forca]);
  return (
    <Contexto.Provider value={mapa}>
      <AbsoluteFill>{children}</AbsoluteFill>
    </Contexto.Provider>
  );
};

// A folha SVG onde as camadas geográficas desenham.
export const MapaSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { largura, altura } = useMapa();
  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="brilho" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="brilhoForte" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {children}
    </svg>
  );
};
