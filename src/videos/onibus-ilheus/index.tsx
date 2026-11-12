import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { BorraoRadial, TagNoMapa, TextoDigitado, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAIRROS, DISTRITOS, ILHEUS, RAIO_CIDADE, SEDE_ILHEUS } from "./dados";
import { A, B, C, CHAVES, DURACAO, DUR_A, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "onibus-ilheus": os três trechos de mapa do vídeo 016 do Estúdio 3D (o ônibus de Ilhéus).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (O SALTO): Ilhéus; "2026 (ATÉ AGOSTO): R$ 32 MI", "10×", "2024 (ANO INTEIRO): R$ 3 MI".
//      Fonte: RREO da prefeitura, dez/2024 p. 6 e ago/2026 p. 8.
//   B (QUEM FICA COM O QUÊ): a cidade acende (Viametro, 30 ônibus novos) e os distritos
//      acendem (zona rural: Brisa). Fonte: anúncio da prefeitura, 01/11/2026.
//   C (SEU BAIRRO): a cidade; pontinhos nas ruas; "E AÍ, MELHOROU?".
// O verde é o acento do perfil @eumagnoleite (#2FA36B).
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const CINZA = "#9AA6B2";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.06)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : f < INI_C ? "B" : "C");

// o município de Ilhéus: contorno verde em todos os trechos
const Ilheus: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.gastou - 6, 14) : 1;
  const preench = tr === "A" ? 0.08 + 0.14 * entra(f, A.gastou, 14) : tr === "B" ? 0.06 : 0.04;
  return <path d={caminho(ILHEUS) ?? ""} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={tr === "C" ? 4 : 3} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${VERDE})` }} />;
};

// B: a cidade (mancha suave em volta da sede) e os pinos dos distritos
const CidadeEDistritos: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "B") return null;
  const [cx, cy] = projetar(SEDE_ILHEUS[0], SEDE_ILHEUS[1]);
  const [rx] = projetar(SEDE_ILHEUS[0] + RAIO_CIDADE, SEDE_ILHEUS[1]);
  const r = Math.abs(rx - cx);
  const kc = entra(f, B.assume, 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="cidade016">
          <stop offset="0%" stopColor={VERDE} stopOpacity={0.9} />
          <stop offset="70%" stopColor={VERDE} stopOpacity={0.55} />
          <stop offset="100%" stopColor={VERDE} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * (0.7 + 0.3 * kc)} fill="url(#cidade016)" opacity={kc} />
      {DISTRITOS.map((p, i) => {
        const k = entra(f, B.brisa + i * 2, 9);
        const [x, y] = projetar(p.lon, p.lat);
        return (
          <g key={p.nome} opacity={k}>
            <circle cx={x} cy={y} r={15 * k} fill="#FFFFFF" stroke={ESCURO} strokeWidth={3} />
            <circle cx={x} cy={y} r={7 * k} fill={CINZA} />
          </g>
        );
      })}
    </svg>
  );
};

// C: os pontinhos de "seu bairro", um de cada vez
const Bairros: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "C") return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {BAIRROS.map((p, i) => {
        const k = entra(f, C.bairro + i * 4, 10);
        const [x, y] = projetar(p[0], p[1]);
        return <circle key={i} cx={x} cy={y} r={13 * k} fill={VERDE} stroke="#E9FFF3" strokeWidth={3} opacity={0.9 * k} style={{ filter: `drop-shadow(0 0 6px ${VERDE})` }} />;
      })}
    </svg>
  );
};

export const OnibusIlheus: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const corte = f === INI_B || f === INI_C;
  const borrao = corte ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const dez = interpolate(f, [A.dez, A.dez + 8], [0.6, 1], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Ilheus />
          </MapaSvg>
        </BorraoRadial>
        <CidadeEDistritos />
        <Bairros />
        {/* A: o salto (tudo na faixa D, de y 640 a 1340) */}
        {tr === "A" ? <TagNoMapa texto="2026 (ATÉ AGOSTO)" entra={A.meses} sai={DUR_A + 30} x={540} y={690} cor={VERDE} corpo={34} /> : null}
        {tr === "A" ? <TextoDigitado texto="R$ 32" unidade=" MI" entra={A.meses + 4} sai={DUR_A + 30} x={540} y={790} corpo={92} brilho={VERDE} /> : null}
        {tr === "A" && f >= A.dez ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", fontFamily: "Inter, Montserrat, sans-serif", fontWeight: 900, fontSize: 170, color: "#FFFFFF", opacity: entra(f, A.dez, 8), transform: `scale(${dez})`, textShadow: `0 0 30px ${VERDE}, 0 6px 18px rgba(0,0,0,0.7)` }}>10×</div>
        ) : null}
        {tr === "A" ? <TagNoMapa texto="2024 (ANO INTEIRO): R$ 3 MI" entra={A.de2024} sai={DUR_A + 30} x={540} y={1250} cor={ESCURO} corpo={34} /> : null}
        {/* B: quem fica com o quê (segundo a prefeitura) */}
        {tr === "B" ? <TagNoMapa texto="CIDADE: VIAMETRO" entra={B.assume} sai={INI_C + 30} ponto={SEDE_ILHEUS} dx={-60} dy={-170} cor={VERDE} corpo={34} /> : null}
        {tr === "B" ? <TagNoMapa texto="30 ÔNIBUS NOVOS" entra={B.trinta} sai={INI_C + 30} ponto={SEDE_ILHEUS} dx={-60} dy={-110} cor={ESCURO} corpo={30} /> : null}
        {tr === "B" ? <TagNoMapa texto="ZONA RURAL: BRISA" entra={B.brisa + 6} sai={INI_C + 30} x={540} y={1280} cor={ESCURO} corpo={34} /> : null}
        {/* C: seu bairro */}
        {tr === "C" ? <TagNoMapa texto="E AÍ, MELHOROU?" entra={C.meConta} sai={DURACAO + 30} x={540} y={1200} cor={VERDE} corpo={44} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
