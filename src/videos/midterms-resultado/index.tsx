import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { ESTADOS_EUA, PAISES, centroDe, estadoUF } from "./dados";
import { CHAVES, DURACAO, E, PASTA_TILES, VIRADAS, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "midterms-resultado": o trecho de mapa do vídeo 019 do Estúdio 3D (o resultado das midterms de 2026).
// Os EUA à noite; as 7 cadeiras do Senado que os democratas tomaram dos republicanos acendem uma a uma
// (primeiro douradas, depois viram azuis), com a sigla no estado, o nome por extenso embaixo e o contador.
// Depois a câmera chega no Texas (MAIS DE 30 ANOS) e voa para o Kansas (MAIS DE 90 ANOS).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
// Cores iguais às do 3D (tema do perfil @eumagnoleite): democratas no azul, republicanos no dourado.
// ---------------------------------------------------------------------------
const AZUL = "#3F6FB5";
const DOURADO = "#D9A441";
const CARTAO = "#14201A";
const TRATAMENTO = "hue-rotate(-12deg) saturate(0.9) contrast(1.05) brightness(0.62)";
const MONTSERRAT = "Montserrat, Inter, system-ui, sans-serif";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const mistura = (a: string, b: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("")}`;
};

const Base: React.FC = () => (
  <>
    <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.4} opacidade={0.4} />
    {ESTADOS_EUA.map((e) => (
      <CamadaGeo key={e.properties.uf} dados={e} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.6} />
    ))}
  </>
);

// os 7 estados: nascem dourados (a cadeira era republicana) e viram azuis em 0,4 s
const Viradas: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  return (
    <g>
      {VIRADAS.map((v) => {
        const k = entra(f, v.q - 4, 8);
        if (k <= 0) return null;
        const vira = interpolate(f, [v.q + 4, v.q + 16], [0, 1], cl);
        const foco = v.uf === "TX" ? interpolate(f, [E.texas, E.texas + 12, E.kansas, E.kansas + 12], [0, 1, 1, 0], cl) : v.uf === "KS" ? interpolate(f, [E.kansas, E.kansas + 12], [0, 1], cl) : 0;
        const cor = mistura(DOURADO, AZUL, vira);
        return (
          <path
            key={v.uf}
            d={caminho(estadoUF(v.uf)) ?? ""}
            fill={cor}
            fillOpacity={(0.55 + 0.15 * foco) * k}
            stroke="#FFFFFF"
            strokeWidth={2 + 2.5 * foco}
            strokeOpacity={0.95 * k}
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 ${6 + 8 * foco}px ${cor})` }}
          />
        );
      })}
    </g>
  );
};

// contador "N CADEIRAS VIRADAS" e o nome do último estado, embaixo do mapa
const Contador: React.FC = () => {
  const f = useQuadro();
  const k = entra(f, E.lista, 10) * interpolate(f, [E.texas, E.texas + 10], [1, 0], cl);
  if (k <= 0.01) return null;
  const n = VIRADAS.filter((v) => f >= v.q).length;
  const ultimo = [...VIRADAS].reverse().find((v) => f >= v.q);
  const pulo = ultimo ? interpolate(f, [ultimo.q, ultimo.q + 4, ultimo.q + 10], [1, 1.12, 1], cl) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1190, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "10px 30px 14px", borderRadius: 20, background: CARTAO, border: `3px solid ${n > 0 ? AZUL : "#FFFFFF55"}`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>
        <span style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 92, lineHeight: 1, color: "#FFFFFF", transform: `scale(${pulo})`, display: "inline-block" }}>{n}</span>
        <span style={{ fontFamily: MONTSERRAT, fontWeight: 800, fontSize: 30, letterSpacing: "0.06em", color: "#DDE6F5" }}>{n === 1 ? "CADEIRA VIRADA" : "CADEIRAS VIRADAS"}</span>
      </div>
    </div>
  );
};

export const MidtermsResultado: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.7, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#02101A" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Viradas />
          </MapaSvg>
        </BorraoRadial>
        {/* as siglas nos estados (no plano dos EUA inteiros) */}
        {VIRADAS.map((v) => (
          <TagNoMapa key={v.uf} texto={v.uf} entra={v.q} sai={E.texas - 4} ponto={centroDe(v.uf)} dy={v.uf === "SC" ? 22 : v.uf === "NC" ? -16 : 0} cor={AZUL} corpo={26} saida="pop" />
        ))}
        {/* o nome por extenso do último estado */}
        {VIRADAS.map((v, i) => (
          <TagNoMapa key={`n${v.uf}`} texto={v.nome} entra={v.q} sai={i + 1 < VIRADAS.length ? VIRADAS[i + 1].q - 6 : E.texas - 4} x={540} y={1150} cor={CARTAO} borda={AZUL} corpo={34} passo={0.3} saida="pop" />
        ))}
        {/* Texas e Kansas */}
        <TagNoMapa texto="TEXAS" entra={E.texas + 18} sai={E.kansas - 2} ponto={centroDe("TX")} dy={-150} cor={AZUL} corpo={46} saida="pop" />
        <TagNoMapa texto="MAIS DE 30 ANOS" entra={E.anos30} sai={E.kansas - 2} ponto={centroDe("TX")} dy={-70} cor={CARTAO} borda={AZUL} corpo={40} passo={0.6} saida="pop" />
        <TagNoMapa texto="KANSAS" entra={E.kansas + 16} sai={DURACAO + 30} ponto={centroDe("KS")} dy={-160} cor={AZUL} corpo={46} />
        <TagNoMapa texto="MAIS DE 90 ANOS" entra={E.anos90} sai={DURACAO + 30} ponto={centroDe("KS")} dy={-80} cor={CARTAO} borda={AZUL} corpo={40} passo={0.6} />
        <Contador />
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
