import { AbsoluteFill, interpolate } from "remotion";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, TextoDigitado, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { MUNICIPIO_GEO, ESTADOS, PAISES, SEDE } from "./dados";
import { A, B, CHAVES, DURACAO, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "orcamento-abaira": os dois trechos de mapa do vídeo 132 do Estúdio 3D (o orçamento de Abaíra). Molde: orcamento-senhor-do-bonfim (125).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A (ABAÍRA): do Brasil até a cidade; as três receitas, as contas de prefeitura e Câmara no TCM-BA e a receita de 2025.
//   B (ARRECADOU 2024): 2024 e R$ 37,0 MI · ARRECADOU EM 2024, na cidade; o município acende.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.15) contrast(1.05) brightness(1.06)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_B ? "A" : "B");

const Base: React.FC = () => {
  const { camera } = useMapa();
  const longe = Math.min(1, Math.max(0, (9 - camera.zoom) / 1.4));
  return (
    <>
      <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.6} opacidade={0.55 * longe} />
      <CamadaGeo dados={ESTADOS} stroke="#FFFFFF" strokeWidth={1.1} opacidade={0.45 * longe} />
    </>
  );
};

// o município: contorno verde e preenchimento leve que acende nas palavras
const Municipio: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const d = caminho(MUNICIPIO_GEO) ?? "";
  const tr = trecho(f);
  const ini = tr === "A" ? entra(f, A.inicio + 40, 14) : 1;
  const pulsoA = tr === "A" ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - A.abri) / 16)) * Math.PI)) : 0;
  const acendeB = tr === "B" ? interpolate(f, [B.arrecadou, B.arrecadou + 12], [0, 1], cl) : 0;
  const preench = 0.1 + 0.22 * pulsoA + 0.35 * acendeB;
  return (
    <path d={d} fill={VERDE} fillOpacity={preench * ini} stroke="#E9FFF3" strokeWidth={3 + 3 * pulsoA + 2 * acendeB} strokeOpacity={0.95 * ini} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * pulsoA}px ${VERDE})` }} />
  );
};

export const OrcamentoAbaira: React.FC = () => {
  const f = useQuadro();
  const tr = trecho(f);
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const fim = DURACAO + 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Base />
            <Municipio />
          </MapaSvg>
        </BorraoRadial>
        {/* A: as três receitas, as contas no Tribunal e a receita de 2025 */}
        {tr === "A" ? <TextoDigitado texto="ABAÍRA" entra={A.inicio + 150} sai={INI_B + 6} ponto={SEDE} ancora="base" seta corpo={34} dy={-10} dx={70} /> : null}
        {tr === "A" ? <TagNoMapa texto="ARRECADOU R$ 37,0 MI · 2024" entra={A.r24} sai={A.abri - 4} x={540} y={640} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TagNoMapa texto="R$ 41,6 MI · 2025" entra={A.r25} sai={A.abri - 4} x={540} y={720} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TagNoMapa texto="R$ 37,2 MI · 2026 ATÉ SETEMBRO" entra={A.r26} sai={A.abri - 4} x={540} y={800} cor={ESCURO} corpo={34} /> : null}
        {tr === "A" ? <TagNoMapa texto="PREFEITURA E CÂMARA DE ABAÍRA" entra={A.abri + 10} sai={A.fora - 4} x={540} y={1380} cor={VERDE} corpo={24} /> : null}
        {tr === "A" ? <TagNoMapa texto="TCM-BA · TRIBUNAL DE CONTAS" entra={A.tribunal} sai={A.fora - 4} x={540} y={680} cor={ESCURO} corpo={32} /> : null}
        {tr === "A" ? <TagNoMapa texto="RECEITA DE 2025" entra={A.fora} sai={A.ano - 6} x={700} y={560} cor={ESCURO} corpo={32} /> : null}
        {tr === "A" ? <TagNoMapa texto="FPM: R$ 17,6 MI" entra={A.fpm} sai={A.ano - 6} x={700} y={625} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="SUS: R$ 7,2 MI" entra={A.sus} sai={A.ano - 6} x={700} y={690} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="FUNDEB: R$ 4,95 MI" entra={A.fundeb} sai={A.ano - 6} x={700} y={755} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="UNIÃO NO FUNDEB: R$ 2,3 MI" entra={A.compl} sai={A.ano - 6} x={700} y={820} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="IMPOSTOS E TAXAS: R$ 1,8 MI" entra={A.proprios} sai={A.ano - 6} x={700} y={885} cor={VERDE} corpo={30} /> : null}
        {tr === "A" ? <TagNoMapa texto="SÓ O IPTU: R$ 47 MIL" entra={A.iptu} sai={A.ano - 6} x={700} y={950} cor="#C0392B" corpo={30} /> : null}

        {/* B: 2024, o que a prefeitura declarou ao TCM */}
        {tr === "B" ? <TagNoMapa texto="2024" entra={B.ano} sai={B.n37 - 4} x={660} y={600} cor={ESCURO} corpo={40} /> : null}
        {tr === "B" ? <TextoDigitado texto="R$ 37,0" unidade=" MI" entra={B.n37} sai={fim} x={660} y={600} corpo={100} brilho={VERDE} /> : null}
        {tr === "B" ? <TagNoMapa texto="ARRECADOU EM 2024" entra={B.arrecadou} sai={fim} x={660} y={700} cor={ESCURO} corpo={32} /> : null}
      </MapCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
