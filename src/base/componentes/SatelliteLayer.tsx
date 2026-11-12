import { AbsoluteFill, Img, staticFile } from "remotion";
import { paraMundo } from "../geo/projecao";
import { niveisDaCamera, PASTA_TILES, tilesVisiveis } from "../geo/tiles";
import { useMapa } from "./MapCamera";

// O satélite: cada tile é um <Img> posicionado pela MESMA câmera que desenha fronteiras e
// rótulos (então tudo encaixa ao pixel). O <Img> do Remotion segura o quadro até a imagem
// carregar — nenhum quadro sai com buraco.
//
// `tratamento` é a correção de cor (o "grade" do documentário): mais saturação e contraste
// que o mosaico cru, um pouco mais escuro para o texto e as linhas respirarem por cima.
export const SatelliteLayer: React.FC<{ tratamento?: string; pasta?: string; zoomMax?: number }> = ({
  tratamento = "saturate(1.35) contrast(1.12) brightness(0.9)",
  pasta = PASTA_TILES, // outros vídeos passam a própria pasta de tiles
  zoomMax, // o nível mais fundo da pasta (padrão: o ZOOM_MAX de geo/tiles.ts)
}) => {
  const { camera, largura, altura } = useMapa();
  const [cx, cy] = paraMundo(camera.lon, camera.lat);
  const s = 256 * 2 ** camera.zoom;
  const b = (camera.bearing * Math.PI) / 180;
  return (
    <AbsoluteFill style={{ filter: tratamento, overflow: "hidden" }}>
      {niveisDaCamera(camera.zoom, zoomMax).map(({ z, opacidade }) =>
        opacidade <= 0 ? null : (
          <AbsoluteFill key={z} style={{ opacity: opacidade }}>
            {tilesVisiveis(camera, largura, altura, z).map(({ x, y }) => {
              const n = 2 ** z;
              const dx = (x / n - cx) * s;
              const dy = (y / n - cy) * s;
              const px = largura / 2 + dx * Math.cos(b) - dy * Math.sin(b);
              const py = altura / 2 + dx * Math.sin(b) + dy * Math.cos(b);
              // tamanho do tile na tela + 1 px de sobra: sem costura fina entre tiles
              const k = s / n / 256;
              return (
                <Img
                  key={`${z}/${x}/${y}`}
                  src={staticFile(`${pasta}/${z}/${x}/${y}.jpg`)}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 257,
                    height: 257,
                    transformOrigin: "0 0",
                    transform: `translate(${px}px, ${py}px) rotate(${camera.bearing}deg) scale(${k})`,
                  }}
                />
              );
            })}
          </AbsoluteFill>
        ),
      )}
    </AbsoluteFill>
  );
};
