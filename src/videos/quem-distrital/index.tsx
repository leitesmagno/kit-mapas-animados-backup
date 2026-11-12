import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, ImagemNaForma, TagNoMapa, TextoDigitado, bandeira, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { BAHIA, CENTRO_BAHIA, CENTRO_ILHEUS, DISTRITOS, DISTRITO_ILHEUS, ESTADOS, PAISES, cidade } from "./dados";
import { A, B, CHAVES, DURACAO, DUR_A, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "quem-distrital": os dois trechos de mapa do vídeo 049 do Estúdio 3D (quem quer o distrital misto).
// Cópia do "distrital-bahia" (013), com os mesmos dados e satélite e os tempos da fala do 049.
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (HOJE): a Bahia inteira acende com a bandeira, "39 VAGAS", e marcadores de campanha pelo estado todo.
//   B (DISTRITOS): a Bahia se divide em ~20 distritos ILUSTRATIVOS; o de Ilhéus acende; três candidatos,
//      um ELEITO; recua e "20 DISTRITOS".
// O verde é o acento do perfil @eumagnoleite (#2FA36B), a cor do que muda com a proposta.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.2) contrast(1.05) brightness(1.08)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noB = (f: number) => f >= INI_B;

const Base: React.FC = () => {
  const { camera } = useMapa();
  const longe = Math.min(1, Math.max(0, (8.5 - camera.zoom) / 1.2));
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.6} opacidade={0.6 * longe} />
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.5 * longe} />
    </>
  );
};

// A: a Bahia acesa (bandeira dentro, contorno branco); B: o contorno da Bahia fica, a bandeira não
const Bahia: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(BAHIA) ?? "";
  const k = noB(f) ? 1 : entra(f, A.estado, 14);
  const brilho = noB(f) ? 0 : Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.inteiro) / 24)) * Math.PI));
  return <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={3 + 4 * brilho} strokeOpacity={k} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }} />;
};

// B: os distritos se desenham um a um em "cortado em distritos"; o de Ilhéus acende em "seu distrito"
const Distritos: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  if (!noB(f)) return null;
  const ilheus = entra(f, B.seuDistrito, 12);
  const apagaOutros = interpolate(f, [B.seuDistrito, B.seuDistrito + 12, B.naBahia, B.naBahia + 14], [1, 0.45, 0.45, 1], cl);
  return (
    <g>
      {DISTRITOS.map((dist, i) => {
        const a = B.cortado + i * 1.5;
        const k = entra(f, a, 10);
        if (k <= 0) return null;
        const eh = dist === DISTRITO_ILHEUS;
        const fill = eh ? VERDE : "#FFFFFF";
        const op = eh ? 0.16 + 0.42 * ilheus : 0.14 * apagaOutros;
        return (
          <path
            key={dist.properties.id}
            d={caminho(dist) ?? ""}
            fill={fill}
            fillOpacity={op * k}
            stroke={eh && ilheus > 0 ? "#E9FFF3" : "#FFFFFF"}
            strokeWidth={eh ? 2 + 3 * ilheus : 1.8}
            strokeOpacity={0.9 * k * (eh ? 1 : 0.6 + 0.4 * apagaOutros)}
            strokeLinejoin="round"
            style={eh && ilheus > 0 ? { filter: `drop-shadow(0 0 ${10 * ilheus}px ${VERDE})` } : undefined}
          />
        );
      })}
    </g>
  );
};

// A: "todo candidato pode pedir voto no estado todo": marcadores de campanha caem em cidades longe umas das outras
const CIDADES_CAMPANHA = ["Barreiras", "Juazeiro", "Paulo Afonso", "Vitória da Conquista", "Feira de Santana", "Salvador", "Ilhéus", "Teixeira de Freitas", "Bom Jesus da Lapa", "Irecê"];
const Campanha: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  if (noB(f) || f < A.todos) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {CIDADES_CAMPANHA.map((nome, i) => {
        const c = cidade(nome);
        if (!c) return null;
        const a = A.todos + i * 3;
        const k = entra(f, a, 8);
        if (k <= 0) return null;
        const [x, y] = projetar(c.meio[0], c.meio[1]);
        const onda = interpolate(f, [a, a + 18], [0, 1], cl);
        return (
          <g key={nome} transform={`translate(${x},${y})`}>
            <circle r={8 + 34 * onda} fill="none" stroke="#FFFFFF" strokeOpacity={0.8 * (1 - onda)} strokeWidth={3} />
            <g transform={`translate(0,${-26 * (1 - k)}) scale(${0.6 + 0.4 * k})`} opacity={k}>
              <path d="M0 0 L-13 -22 A16 16 0 1 1 13 -22 Z" fill="#FFFFFF" stroke="#0E1A14" strokeWidth={2} />
              <rect x={-7} y={-39} width={14} height={11} rx={2} fill="#0E1A14" />
              <rect x={-4} y={-37} width={8} height={2.5} fill="#FFFFFF" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// B: três candidatos no distrito de Ilhéus; o mais votado leva a vaga, os outros apagam ("Sem puxador")
const Candidatos: React.FC = () => {
  const f = useQuadro();
  if (!noB(f) || f < B.maisVotos) return null;
  const sai = B.naBahia;
  const nomes = ["CANDIDATO A", "CANDIDATO B", "CANDIDATO C"];
  return (
    <>
      {nomes.map((n, i) => (
        <TagNoMapa key={n} texto={n} entra={B.maisVotos + i * 5} sai={i === 0 ? sai : B.semPuxador + 2} ponto={CENTRO_ILHEUS} dy={-190 + i * 80} dx={-60} cor={i === 0 && f >= B.levaVaga ? VERDE : "#3B4250"} corpo={30} saida={i === 0 ? "apaga" : "pop"} />
      ))}
      <TagNoMapa texto="ELEITO" entra={B.levaVaga} sai={sai} ponto={CENTRO_ILHEUS} dx={-60} dy={-250} cor={VERDE} corpo={30} />
    </>
  );
};

export const QuemDistritalBahia: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_B ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const ilheus = cidade("Ilhéus");
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            {!noB(f) && f >= A.estado ? <ImagemNaForma regiao={BAHIA} src={bandeira("ba")} entra={A.estado} sai={DUR_A + 30} opacidade={0.55} borda={null} /> : null}
            <Distritos />
            <Bahia />
          </MapaSvg>
        </BorraoRadial>
        <Campanha />
        {/* A: o número das vagas no meio do estado; e o recado do trecho */}
        {!noB(f) ? <TextoDigitado texto="39" unidade=" VAGAS" entra={A.n39} sai={DUR_A + 30} ponto={CENTRO_BAHIA} corpo={120} brilho={VERDE} /> : null}
        {!noB(f) ? <TagNoMapa texto="UMA DISPUTA SÓ" entra={A.inteiro + 4} sai={A.partido} x={540} y={1250} cor="#1E2530" corpo={30} /> : null}
        {!noB(f) ? <TagNoMapa texto="CANDIDATO + PARTIDO" entra={A.partido + 4} sai={DUR_A + 30} x={540} y={1250} cor="#1E2530" corpo={28} /> : null}
        {/* B */}
        {noB(f) ? <TagNoMapa texto="DISTRITOS ILUSTRATIVOS" entra={B.cortado + 6} sai={DURACAO + 30} x={540} y={1250} cor="#1E2530" corpo={28} /> : null}
        {noB(f) && ilheus ? <TextoDigitado texto="ILHÉUS" entra={B.seuDistrito + 8} sai={B.naBahia} ponto={ilheus.meio} ancora="base" seta corpo={34} brilho={VERDE} /> : null}
        <Candidatos />
        {noB(f) ? <TextoDigitado texto="20" unidade=" DISTRITOS" entra={B.vinte} sai={B.seuDistrito + 6} ponto={CENTRO_BAHIA} corpo={110} brilho={VERDE} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
