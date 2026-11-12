import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, ImagemNaForma, TagNoMapa, TextoDigitado, bandeira, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, CENTRO_BAHIA, CENTRO_DISTRITO, DISTRITOS, DISTRITO_EXEMPLO, ESTADOS_BR, ESTADOS_EUA, PAISES } from "./dados";
import { A, B, C, CHAVES, DURACAO, INI_B, INI_C, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "eleicao-eua": os três trechos de mapa do vídeo 015 do Estúdio 3D (as midterms de 2026 x Brasil).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (EM JOGO): os 35 estados com Senado em jogo; depois os 36 que escolhem governador.
//   B (DISTRITOS): os 435 distritos da Câmara se desenham; mergulho num distrito; um candidato ELEITO.
//   C (PROPORCIONAL): o Brasil; a Bahia acende inteira (sem distrito) e as 39 vagas se repartem entre partidos.
// O verde é o acento do perfil @eumagnoleite (#2FA36B). Partidos do exemplo em tons neutros, sem sigla.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const TONS_PARTIDOS = ["#E3B34A", "#5B8DEF", "#C9CED6", "#8A6FD1"];
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.2) contrast(1.05) brightness(1.08)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : f < INI_C ? "B" : "C");

const Base: React.FC = () => {
  const f = useQuadro();
  const t = trecho(f);
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.4} opacidade={0.5} />
      {t !== "C" ? ESTADOS_EUA.map((e) => <CamadaGeo key={e.properties.uf} dados={e} stroke="#FFFFFF" strokeWidth={t === "B" ? 1.6 : 1.2} opacidade={0.75} />) : null}
      {t === "C" ? <CamadaGeo dados={ESTADOS_BR} stroke="#FFFFFF" strokeWidth={1.3} opacidade={0.6 * entra(f, INI_C + 4, 14)} /> : null}
    </>
  );
};

// A: Senado (branco) e depois governador (verde), estado por estado de oeste para leste
const EmJogo: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "A") return null;
  const ordem = [...ESTADOS_EUA].sort((a, b) => caminho(a)!.length - caminho(b)!.length);
  const recua = interpolate(f, [A.n36, A.n36 + 12], [1, 0.25], cl);
  return (
    <g>
      {ordem.map((e, i) => {
        const p = e.properties;
        const kS = p.senado ? entra(f, A.n35 + (i % 18), 8) * recua : 0;
        const kG = p.governador ? entra(f, A.n36 + (i % 18), 8) : 0;
        if (kS <= 0 && kG <= 0) return null;
        const fill = kG > 0 ? VERDE : "#FFFFFF";
        return <path key={p.uf} d={caminho(e) ?? ""} fill={fill} fillOpacity={kG > 0 ? 0.5 * kG : 0.42 * kS} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.9 * Math.max(kS, kG)} strokeLinejoin="round" />;
      })}
    </g>
  );
};

// B: os 435 distritos se desenham em onda de oeste para leste; o do exemplo acende em "Cada distrito"
const Distritos: React.FC = () => {
  const f = useQuadro();
  const { caminho, projetar } = useMapa();
  if (trecho(f) !== "B" || f < B.cortado) return null;
  const destaque = entra(f, B.cada, 12);
  const apaga = interpolate(f, [B.cada, B.cada + 14], [1, 0.4], cl);
  return (
    <g>
      {DISTRITOS.map((dist) => {
        const eh = dist === DISTRITO_EXEMPLO;
        const [x] = projetar(...(dist.geometry.type === "Polygon" ? (dist.geometry.coordinates[0][0] as [number, number]) : (dist.geometry.coordinates[0][0][0] as [number, number])));
        const k = entra(f, B.cortado + Math.max(0, Math.min(16, (x / 1080) * 16)), 8);
        if (k <= 0) return null;
        return (
          <path
            key={dist.properties.id}
            d={caminho(dist) ?? ""}
            fill={eh ? VERDE : "#FFFFFF"}
            fillOpacity={(eh ? 0.12 + 0.5 * destaque : 0.1 * apaga) * k}
            stroke={eh && destaque > 0 ? "#E9FFF3" : "#FFFFFF"}
            strokeWidth={eh ? 1.4 + 3.6 * destaque : 1.1}
            strokeOpacity={0.85 * k * (eh ? 1 : 0.5 + 0.5 * apaga)}
            strokeLinejoin="round"
            style={eh && destaque > 0 ? { filter: `drop-shadow(0 0 ${10 * destaque}px ${VERDE})` } : undefined}
          />
        );
      })}
    </g>
  );
};

// C: a Bahia inteira acesa, sem distrito
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (trecho(f) !== "C") return null;
  const k = entra(f, C.estado, 12);
  return <path d={caminho(BAHIA) ?? ""} fill="none" stroke="#FFFFFF" strokeWidth={2 + 4 * k} strokeOpacity={k} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }} />;
};

// C: as 39 vagas da Bahia viram cadeirinhas e se repartem entre partidos de exemplo (A, B, C, D)
const REPARTE = [14, 11, 8, 6];
const Cadeiras: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (trecho(f) !== "C" || f < C.dividem) return null;
  const [cx, cy] = projetar(...CENTRO_BAHIA);
  const cols = 8;
  const passo = 46;
  const cores = REPARTE.flatMap((n, i) => Array.from({ length: n }, () => TONS_PARTIDOS[i]));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {cores.map((cor, i) => {
        const k = entra(f, C.dividem + i * 0.5, 7);
        if (k <= 0) return null;
        const col = i % cols;
        const lin = Math.floor(i / cols);
        const x = cx + (col - (cols - 1) / 2) * passo;
        const y = cy - 40 + (lin - 2) * passo;
        return (
          <g key={i} transform={`translate(${x},${y - 18 * (1 - k)}) scale(${0.6 + 0.4 * k})`} opacity={k}>
            <rect x={-14} y={-20} width={28} height={22} rx={5} fill={cor} stroke="#0E1A14" strokeWidth={2} />
            <rect x={-17} y={2} width={34} height={9} rx={3} fill={cor} stroke="#0E1A14" strokeWidth={2} />
            <rect x={-13} y={11} width={5} height={9} fill="#0E1A14" />
            <rect x={8} y={11} width={5} height={9} fill="#0E1A14" />
          </g>
        );
      })}
    </svg>
  );
};

// B: dois candidatos genéricos no distrito; o mais votado leva
const Candidatos: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B" || f < B.maisVotos) return null;
  return (
    <>
      <TagNoMapa texto="CANDIDATO A" entra={B.maisVotos} sai={INI_C} ponto={CENTRO_DISTRITO} dy={-200} cor={f >= B.leva ? VERDE : "#3B4250"} corpo={30} />
      <TagNoMapa texto="CANDIDATO B" entra={B.maisVotos + 5} sai={B.leva + 4} ponto={CENTRO_DISTRITO} dy={-120} cor="#3B4250" corpo={30} saida="pop" />
      <TagNoMapa texto="ELEITO" entra={B.leva} sai={INI_C} ponto={CENTRO_DISTRITO} dy={-270} cor={VERDE} corpo={30} />
    </>
  );
};

export const EleicaoEua: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_B || f === INI_C ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <EmJogo />
            <Distritos />
            {t === "C" && f >= C.estado ? <ImagemNaForma regiao={BAHIA} src={bandeira("ba")} entra={C.estado} sai={DURACAO + 30} opacidade={0.5} borda={null} /> : null}
            <Bahia />
          </MapaSvg>
        </BorraoRadial>
        {/* A */}
        {t === "A" ? <TextoDigitado texto="35" unidade=" DE 100 NO SENADO" entra={A.n35} sai={A.n36 - 4} x={540} y={880} corpo={64} brilho="#3B4250" /> : null}
        {t === "A" ? <TextoDigitado texto="36" unidade=" GOVERNADORES" entra={A.n36} sai={INI_B + 30} x={540} y={880} corpo={64} brilho={VERDE} /> : null}
        {/* B */}
        {t === "B" ? <TextoDigitado texto="435" unidade=" DISTRITOS" entra={B.n435} sai={B.cada + 6} x={540} y={880} corpo={70} brilho={VERDE} /> : null}
        {t === "B" ? <TagNoMapa texto="1 DISTRITO = 1 DEPUTADO" entra={B.umSo - 8} sai={INI_C} x={540} y={1260} cor="#1E2530" corpo={32} /> : null}
        <Candidatos />
        {/* C */}
        {t === "C" ? <TagNoMapa texto="VOTO PROPORCIONAL" entra={C.proporcional} sai={DURACAO + 30} x={540} y={1260} cor="#1E2530" corpo={32} /> : null}
        {t === "C" ? <TextoDigitado texto="O ESTADO TODO" entra={C.estado} sai={C.dividem + 2} ponto={CENTRO_BAHIA} corpo={58} brilho={VERDE} /> : null}
        <Cadeiras />
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
