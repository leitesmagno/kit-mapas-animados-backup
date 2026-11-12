import type { CameraGlobo, ChaveGlobo } from "./cameraGlobo";
import type { Trajeto } from "./trajeto";

// ---------------------------------------------------------------------------
// A CÂMERA QUE ANDA PELA RUA (a do "Destino: Codó", agora no kit): a ponta da rota fica um
// pouco abaixo do meio da tela (dá para ver a rua que vem), e a tela gira para a rua apontar
// para cima — mas sem rodopiar a cada esquina: o "para cima" é o rumo GERAL da viagem e a
// câmera segue só uma parte (`seguir`) do quanto a rua desvia dele, suavizado em ~2 s.
// A linha (`RotaGeo`) e a câmera leem os mesmos `metros(f)`: andam juntas.
//
//   const cam = cameraNaRota({ trajeto: T, metros: (f) => ritmo(…), zoom: (m) => 16.4 });
//   chaves: [...desenrolarGiro(chavesDeFuncao(a, b, cam))]
// ---------------------------------------------------------------------------

const SENTIDO = -1; // o bearing do globo gira a tela no sentido contrário do rumo

export const cameraNaRota = ({
  trajeto,
  metros,
  zoom,
  alvo = [540, 1150],
  seguir = 0.5,
  janela = 30,
}: {
  trajeto: Trajeto;
  metros: (f: number) => number;
  zoom: (m: number, f: number) => number;
  alvo?: [number, number] | ((f: number) => [number, number]);
  seguir?: number; // 0 = norte fixo no rumo geral; 1 = a rua sempre para cima
  janela?: number; // quadros para cada lado na média do rumo (maior = vira a esquina mais devagar)
}) => {
  const [a, b] = [trajeto.ponto(0), trajeto.ponto(trajeto.total)];
  const geral = (Math.atan2((b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180), b[1] - a[1]) * 180) / Math.PI;
  const rumoSuave = (f: number) => {
    let x = 0;
    let y = 0;
    for (let k = -janela; k <= janela; k += 2) {
      const r = (trajeto.rumo(metros(f + k), 60, 160) * Math.PI) / 180;
      const w = 1 - Math.abs(k) / (janela + 2);
      x += Math.sin(r) * w;
      y += Math.cos(r) * w;
    }
    const rumo = (Math.atan2(x, y) * 180) / Math.PI;
    const desvio = ((rumo - geral + 540) % 360) - 180;
    return geral + seguir * desvio;
  };
  return (f: number): CameraGlobo => {
    const m = metros(f);
    const [lon, lat] = trajeto.ponto(m);
    return { lon, lat, zoom: zoom(m, f), bearing: SENTIDO * rumoSuave(f), alvo: typeof alvo === "function" ? alvo(f) : alvo };
  };
};

// Tira os pulos de 360° do giro numa sequência de chaves (a interpolação vai pelo caminho curto).
export const desenrolarGiro = (chaves: ChaveGlobo[], antes?: number) => {
  let anterior = antes;
  return chaves.map((c) => {
    let g = c.camera.bearing ?? 0;
    if (anterior !== undefined) {
      while (g - anterior > 180) g -= 360;
      while (g - anterior < -180) g += 360;
    }
    anterior = g;
    return { ...c, camera: { ...c.camera, bearing: g } };
  });
};
