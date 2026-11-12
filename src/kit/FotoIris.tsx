import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A FOTO QUE SAI DO LUGAR: a imagem real abre como uma íris a partir do ponto exato do mapa
// (lon/lat, ou um ponto da tela) até cobrir a tela, e na saída fecha de volta para o ponto
// (ou se dissolve). Enquanto está na tela ela anda (zoom e pan lentos): nunca foto parada.
// Um anel fino de luz acompanha a borda da íris. Vai FORA do <MapaSvg>, dentro da câmera.
// Com `raio`, a íris para nesse tamanho: vira uma LENTE redonda (a foto enquadrada dentro
// dela, o mapa continua em volta, o anel fica enquanto ela está aberta). Com `destino` (px de
// tela), a lente nasce do ponto e flutua até lá, presa ao lugar por um fio; ao fechar, volta.
// ---------------------------------------------------------------------------

export type FotoDaIris = { src: string; foco?: string };

export const FotoIris: React.FC<{
  foto: FotoDaIris;
  entra: number;
  sai: number;
  ponto?: [number, number]; // lon/lat de onde a íris nasce
  tela?: [number, number]; // ou um ponto da tela
  zoom?: readonly [number, number];
  pan?: readonly [[number, number], [number, number]];
  abertura?: number;
  fechamento?: "iris" | "dissolve";
  filtro?: string;
  cor?: string;
  raio?: number; // px: a lente (sem raio = cobre a tela)
  destino?: [number, number]; // px de tela: onde a lente assenta (padrão: sobre o ponto)
  children?: React.ReactNode; // o que vai por cima da foto (brilhos, textos presos a ela)
}> = ({ foto, entra, sai, ponto, tela, zoom = [1.12, 1.02], pan = [[0, 0], [0, 0]], abertura = 20, fechamento = "iris", filtro = "", cor = "#F2B45A", raio, destino, children }) => {
  const f = useQuadro();
  const { width, height } = useVideoConfig();
  const { projetar } = useMapa();
  if (f < entra || f > sai + abertura) return null;
  let [px, py] = tela ?? (ponto ? projetar(ponto[0], ponto[1]) : [width / 2, height / 2]);
  if (px < -5000) [px, py] = [width / 2, height / 2];
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const abre = interpolate(f, [entra, entra + abertura], [0, 1], { ...cl, easing: CURVA.pouso });
  const fecha = interpolate(f, [sai, sai + abertura], [0, 1], { ...cl, easing: CURVA.saida });
  if (raio) return <Lente {...{ foto, px, py, raio, destino, f, entra, sai, abertura, fechamento, zoom, pan, filtro, cor }} />;
  const maxR = Math.max(Math.hypot(px, py), Math.hypot(width - px, py), Math.hypot(px, height - py), Math.hypot(width - px, height - py)) + 80;
  const t = fechamento === "iris" ? abre * (1 - fecha) : abre;
  const r = 20 + (maxR - 20) * t;
  const opacidade = fechamento === "dissolve" ? 1 - fecha : 1;
  const vida = interpolate(f, [entra, sai + abertura], [0, 1], cl);
  const k = zoom[0] + (zoom[1] - zoom[0]) * CURVA.suave(vida);
  const dx = pan[0][0] + (pan[1][0] - pan[0][0]) * vida;
  const dy = pan[0][1] + (pan[1][1] - pan[0][1]) * vida;
  const foco = interpolate(abre, [0, 1], [8, 0]) + (fechamento === "iris" ? interpolate(fecha, [0, 1], [0, 6]) : 0);
  const mascara = `radial-gradient(circle ${r}px at ${px}px ${py}px, #000 ${Math.max(0, r - 60)}px, transparent ${r}px)`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacidade }}>
      <AbsoluteFill style={{ maskImage: mascara, WebkitMaskImage: mascara, overflow: "hidden" }}>
        <Img
          src={staticFile(foto.src)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: foto.foco ?? "50% 50%",
            transform: `translate(${dx}px, ${dy}px) scale(${k})`,
            filter: `blur(${foco}px) ${filtro}`,
          }}
        />
        {children}
      </AbsoluteFill>
      {t > 0.02 && t < 0.98 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <circle cx={px} cy={py} r={Math.max(0, r - 30)} fill="none" stroke={cor} strokeWidth={3} strokeOpacity={0.8 * Math.sin(Math.PI * t)} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// A LENTE: a íris que para num raio. A foto fica enquadrada no círculo (cover + foco), anda
// devagar por dentro; uma sombra solta o círculo do mapa e o anel de luz contorna.
const Lente: React.FC<{
  foto: FotoDaIris;
  px: number;
  py: number;
  raio: number;
  destino?: [number, number];
  f: number;
  entra: number;
  sai: number;
  abertura: number;
  fechamento: "iris" | "dissolve";
  zoom: readonly [number, number];
  pan: readonly [[number, number], [number, number]];
  filtro: string;
  cor: string;
}> = ({ foto, px: lx, py: ly, raio, destino, f, entra, sai, abertura, fechamento, zoom, pan, filtro, cor }) => {
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const abre = interpolate(f, [entra, entra + abertura], [0, 1], { ...cl, easing: CURVA.pouso });
  const fecha = interpolate(f, [sai, sai + abertura], [0, 1], { ...cl, easing: CURVA.saida });
  const t = fechamento === "iris" ? abre * (1 - fecha) : abre;
  const r = 6 + (raio - 6) * t;
  // o centro anda do lugar até o destino (e volta ao fechar)
  const [ax, ay] = destino ?? [lx, ly];
  const px = lx + (ax - lx) * t;
  const py = ly + (ay - ly) * t;
  const dist = Math.hypot(px - lx, py - ly);
  const opacidade = fechamento === "dissolve" ? 1 - fecha : 1;
  if (r < 7 || opacidade <= 0) return null;
  const vida = interpolate(f, [entra, sai + abertura], [0, 1], cl);
  const k = zoom[0] + (zoom[1] - zoom[0]) * CURVA.suave(vida);
  const dx = pan[0][0] + (pan[1][0] - pan[0][0]) * vida;
  const dy = pan[0][1] + (pan[1][1] - pan[0][1]) * vida;
  const foco = interpolate(abre, [0, 1], [6, 0]) + (fechamento === "iris" ? interpolate(fecha, [0, 1], [0, 5]) : 0);
  // a foto é enquadrada no tamanho FINAL da lente (não muda de enquadramento ao abrir)
  const lado = raio * 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacidade }}>
      <div style={{ position: "absolute", left: px - r, top: py - r, width: 2 * r, height: 2 * r, borderRadius: "50%", boxShadow: `0 18px 60px rgba(0,0,0,${0.6 * t}), 0 0 0 1px rgba(0,0,0,0.4)` }} />
      <div style={{ position: "absolute", left: px - r, top: py - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden" }}>
        <Img
          src={staticFile(foto.src)}
          style={{
            position: "absolute",
            left: r - raio,
            top: r - raio,
            width: lado,
            height: lado,
            objectFit: "cover",
            objectPosition: foto.foco ?? "50% 50%",
            transform: `translate(${dx}px, ${dy}px) scale(${k})`,
            filter: `blur(${foco}px) ${filtro}`,
          }}
        />
      </div>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {dist > r + 4 && (
          <g strokeLinecap="round">
            <line x1={lx} y1={ly} x2={px - ((px - lx) / dist) * r} y2={py - ((py - ly) / dist) * r} stroke="#000" strokeWidth={4} strokeOpacity={0.3 * t} />
            <line x1={lx} y1={ly} x2={px - ((px - lx) / dist) * r} y2={py - ((py - ly) / dist) * r} stroke="#FFF3DC" strokeWidth={1.8} strokeOpacity={0.85 * t} />
          </g>
        )}
        <circle cx={px} cy={py} r={r} fill="none" stroke={cor} strokeWidth={10} strokeOpacity={0.25 * t} />
        <circle cx={px} cy={py} r={r} fill="none" stroke="#FFF3DC" strokeWidth={2.4} strokeOpacity={0.9 * t} />
      </svg>
    </AbsoluteFill>
  );
};
