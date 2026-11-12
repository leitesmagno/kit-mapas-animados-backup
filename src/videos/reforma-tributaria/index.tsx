import { AbsoluteFill, interpolate } from "remotion";
import { useMemo } from "react";
import { MapBackground } from "../../base/componentes/MapBackground";
import { MapaSvg, MapCamera, useMapa } from "../../base/componentes/MapCamera";
import { SatelliteLayer } from "../../base/componentes/SatelliteLayer";
import { CamadaGeo } from "../../base/componentes/StateBoundary";
import { BorraoRadial, TagNoMapa, entra, useQuadro } from "../../kit";
import { cameraDoVideo } from "../../base/geo/camera";
import { CENTRO_ESTADO, CENTRO_MUN, DESTINO, ESTADOS, GUERRA_DE, GUERRA_PARA, MUNICIPIOS, ORIGEM, PAISES, UF } from "./dados";
import { A1, A2, B, CHAVES, DURACAO, DUR_A1, INI_A2, INI_B, PASTA_TILES, ZOOM_MAX_TILES } from "./roteiro";

// ---------------------------------------------------------------------------
// "reforma-tributaria": os três trechos de mapa do vídeo 050 do Estúdio 3D (a reforma tributária).
// Sem legenda, sem marca d'água e sem som: o vídeo 3D põe tudo isso por cima.
//   A1 (CADA UM COM SUA LEI): os 27 estados acendem com um livrinho cada; os 5.570 municípios em onda.
//   A2 (GUERRA FISCAL): ILUSTRAÇÃO genérica: dois vizinhos com "-%" e uma fábrica pulando de um para o outro.
//   B (A GRANDE VIRADA): SP (fábrica) → BA (compra): a moeda do imposto vai para o destino; a barra da
//     divisão até 2077 (EC 132, ADCT art. 131: 80% retido 2029-2032, 90% em 2033, cai 1/45 por ano até 2077);
//     o fundo regional caindo em todos os estados.
// Cinza = sistema antigo; verde (#2FA36B, acento do perfil @eumagnoleite) = sistema novo.
// ---------------------------------------------------------------------------
const VERDE = "#2FA36B";
const CINZA = "#9AA3AD";
const OURO = "#E3B34A";
const ESCURO = "#1E2530";
const TRATAMENTO = "hue-rotate(-8deg) saturate(1.1) contrast(1.05) brightness(0.95)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const trecho = (f: number) => (f < INI_A2 ? "A1" : f < INI_B ? "A2" : "B");
const sorteio = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const Contorno: React.FC = () => <CamadaGeo dados={PAISES} stroke="#FFFFFF" strokeWidth={1.2} opacidade={0.35} />;

// os estados: cada trecho pinta do seu jeito
const Estados: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const t = trecho(f);
  return (
    <g>
      {ESTADOS.features.map((e, i) => {
        const sg = e.properties.sigla;
        let fill = "#FFFFFF";
        let op = 0.04;
        let sw = 1.6;
        if (t === "A1") {
          const k = entra(f, A1.n27 + i, 8);
          op = 0.04 + 0.14 * k;
          sw = 1.6 + 1.2 * k;
        }
        if (t === "A2") {
          const par = sg === GUERRA_DE || sg === GUERRA_PARA;
          const k = par ? entra(f, A2.desconto, 10) : 0;
          const pul = par ? Math.max(0, Math.sin(Math.max(0, f - A2.guerra) / 9)) * entra(f, A2.guerra, 8) : 0;
          fill = par ? CINZA : "#FFFFFF";
          op = 0.04 + 0.4 * k;
          sw = 1.6 + 2 * k + 2.5 * pul;
        }
        if (t === "B") {
          const sp = sg === ORIGEM ? entra(f, B.sp, 10) * (1 - entra(f, B.nenhum, 14)) : 0;
          const ba = sg === DESTINO ? entra(f, B.bahia, 10) * (1 - entra(f, B.nenhum, 14)) : 0;
          const todos = entra(f, B.nenhum, 14);
          const fundo = entra(f, B.uniao + (i % 9) * 2, 10);
          if (ba > 0.01) {
            fill = VERDE;
            op = 0.55 * ba;
          } else if (sp > 0.01) {
            fill = CINZA;
            op = 0.45 * sp;
          } else {
            fill = fundo > 0.01 ? VERDE : CINZA;
            op = 0.04 + 0.16 * todos * (1 - fundo) + 0.3 * fundo;
          }
          sw = 1.6 + 1.0 * todos;
        }
        return <path key={sg} d={caminho(e) ?? ""} fill={fill} fillOpacity={op} stroke="#FFFFFF" strokeWidth={sw} strokeOpacity={0.8} strokeLinejoin="round" />;
      })}
    </g>
  );
};

// A1: municípios em onda do Norte para o Sul (só as linhas finas e um verde de leve)
const Municipios: React.FC = () => {
  const f = useQuadro();
  const { caminho } = useMapa();
  const ys = useMemo(() => CENTRO_MUN.map((c) => c[1]), []);
  if (trecho(f) !== "A1" || f < A1.mil - 4) return null;
  const base = entra(f, A1.mil - 4, 8);
  return (
    <g>
      {MUNICIPIOS.features.map((m, i) => {
        const atraso = interpolate(ys[i], [-33, 5], [20, 0], cl);
        const onda = entra(f, A1.mil + atraso, 8);
        return <path key={i} d={caminho(m) ?? ""} fill={VERDE} fillOpacity={0.32 * onda} stroke="#FFFFFF" strokeWidth={0.5} strokeOpacity={0.3 * base} />;
      })}
    </g>
  );
};

// ícones em tela (seguem o mapa pelo projetar)
const Livro: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x},${y}) scale(${k})`} opacity={k}>
    <rect x={-10} y={-12} width={20} height={24} rx={2} fill="#E9EEF2" stroke="#0E1A14" strokeWidth={1.6} />
    <line x1={-5} y1={-5} x2={6} y2={-5} stroke="#0E1A14" strokeWidth={1.6} />
    <line x1={-5} y1={0} x2={6} y2={0} stroke="#0E1A14" strokeWidth={1.6} />
    <line x1={-5} y1={5} x2={3} y2={5} stroke="#0E1A14" strokeWidth={1.6} />
  </g>
);
const Fabrica: React.FC<{ x: number; y: number; k: number; cor?: string }> = ({ x, y, k, cor = "#E9EEF2" }) => (
  <g transform={`translate(${x},${y}) scale(${1.6 * k})`} opacity={Math.min(1, k)}>
    <path d="M-18,12 L-18,-4 L-8,-10 L-8,-4 L2,-10 L2,-4 L12,-10 L12,12 Z" fill={cor} stroke="#0E1A14" strokeWidth={1.6} strokeLinejoin="round" />
    <rect x={12} y={-20} width={6} height={32} fill={cor} stroke="#0E1A14" strokeWidth={1.6} />
    <rect x={-13} y={2} width={5} height={5} fill="#0E1A14" />
    <rect x={-3} y={2} width={5} height={5} fill="#0E1A14" />
  </g>
);
const Carrinho: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x},${y}) scale(${1.6 * k})`} opacity={Math.min(1, k)}>
    <path d="M-20,-14 L-14,-14 L-9,8 L14,8 L18,-8 L-12,-8" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M-20,-14 L-14,-14 L-9,8 L14,8 L18,-8 L-12,-8" fill="none" stroke={VERDE} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
    <circle cx={-6} cy={15} r={3.6} fill={VERDE} stroke="#FFFFFF" strokeWidth={1.5} />
    <circle cx={11} cy={15} r={3.6} fill={VERDE} stroke="#FFFFFF" strokeWidth={1.5} />
  </g>
);
const Moeda: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 14 }) =>
  k > 0.01 ? (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k)}>
      <circle r={r} fill={OURO} stroke="#0E1A14" strokeWidth={2} />
      <circle r={r * 0.62} fill="none" stroke="#0E1A14" strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  ) : null;

const Icones: React.FC = () => {
  const f = useQuadro();
  const { projetar } = useMapa();
  const t = trecho(f);
  const P = (sg: string) => projetar(...CENTRO_ESTADO[sg]);
  if (t === "A1") {
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {ESTADOS.features.map((e, i) => {
          const [x, y] = P(e.properties.sigla);
          return <Livro key={i} x={x} y={y} k={entra(f, A1.n27 + i, 8) * (1 - entra(f, A1.mil, 10) * 0.6)} />;
        })}
      </svg>
    );
  }
  if (t === "A2") {
    const [x0, y0] = P(GUERRA_DE);
    const [x1, y1] = P(GUERRA_PARA);
    const u = interpolate(f, [A2.roubar, A2.roubar + 20], [0, 1], cl);
    const e = u * u * (3 - 2 * u);
    const x = x0 + (x1 - x0) * e;
    const y = y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * 120;
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Fabrica x={x} y={y} k={entra(f, INI_A2 + 4, 10)} />
      </svg>
    );
  }
  // B
  const [sx, sy] = P(ORIGEM);
  const [bx, by] = P(DESTINO);
  const kFab = entra(f, B.fabrica, 10) * (1 - entra(f, B.nenhum, 12));
  const kCar = entra(f, B.compra, 10) * (1 - entra(f, B.nenhum, 12));
  const u = interpolate(f, [B.vai, B.vai + 26], [0, 1], cl);
  const e = u * u * (3 - 2 * u);
  const mx = sx + (bx - sx) * e;
  const my = sy + (by - sy) * e - Math.sin(Math.PI * e) * 160;
  const kMoeda = entra(f, B.vai - 4, 6) * (1 - entra(f, B.nenhum, 10));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Fabrica x={sx - 10} y={sy + 6} k={kFab} cor={CINZA} />
      <Carrinho x={bx + 6} y={by + 4} k={kCar} />
      {u > 0 && u < 1 ? <path d={`M${sx},${sy} Q${(sx + bx) / 2},${Math.min(sy, by) - 320} ${mx},${my}`} fill="none" stroke={VERDE} strokeWidth={5} strokeDasharray="10 12" strokeOpacity={0.9 * kMoeda} /> : null}
      <Moeda x={mx} y={my} k={kMoeda} r={18} />
      {/* fundo regional: moedas caem em cada estado */}
      {ESTADOS.features.map((est, i) => {
        if (f < B.uniao) return null;
        const [x, y] = P(est.properties.sigla);
        const a = B.uniao + (i % 9) * 2 + Math.floor(sorteio(i) * 8);
        const q = interpolate(f, [a, a + 14], [0, 1], cl);
        const k = entra(f, a, 6) * (1 - entra(f, a + 34, 10));
        return <Moeda key={i} x={x} y={y - 90 * (1 - q * q)} k={k} r={10} />;
      })}
    </svg>
  );
};

// B: a barra da divisão do IBS entre estados e cidades (EC 132, ADCT art. 131), em tela
// parte que ainda segue a arrecadação antiga: 80% (2029-2032), 90% (2033), cai 1/45 por ano até 2077 (2%), 0 em 2078
const retido = (ano: number) => (ano < 2033 ? 80 : ano < 2034 ? 90 : Math.max(0, 90 - (ano - 2033) * 2));
const BarraTransicao: React.FC = () => {
  const f = useQuadro();
  if (trecho(f) !== "B" || f < B.devagar) return null;
  const k = entra(f, B.devagar, 10) * (1 - entra(f, B.uniao - 4, 10));
  if (k <= 0.01) return null;
  const ano = Math.round(interpolate(f, [B.a2077, DURACAO - 6], [2029, 2077], cl));
  const r = retido(ano) / 100;
  const X = 150;
  const L = 780;
  const Y = 1196;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={k}>
      <rect x={X - 18} y={Y - 64} width={L + 36} height={124} rx={22} fill={ESCURO} fillOpacity={0.88} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} />
      <text x={X} y={Y - 26} fill="#FFFFFF" fontFamily="Inter, system-ui" fontWeight={800} fontSize={26} letterSpacing={1}>
        {`ANO ${ano}`}
      </text>
      <text x={X + L} y={Y - 26} fill="#FFFFFF" fillOpacity={0.8} textAnchor="end" fontFamily="Inter, system-ui" fontWeight={700} fontSize={20} letterSpacing={2}>
        DIVISÃO DO IBS
      </text>
      <rect x={X} y={Y - 6} width={L} height={34} rx={10} fill={VERDE} />
      <rect x={X} y={Y - 6} width={Math.max(0.001, L * r)} height={34} rx={10} fill={CINZA} />
      <text x={X + 10} y={Y + 46} fill={CINZA} fontFamily="Inter, system-ui" fontWeight={800} fontSize={19} letterSpacing={1.5}>
        {`ANTIGA ${Math.round(r * 100)}%`}
      </text>
      <text x={X + L - 10} y={Y + 46} fill={VERDE} textAnchor="end" fontFamily="Inter, system-ui" fontWeight={800} fontSize={19} letterSpacing={1.5}>
        {`DESTINO ${100 - Math.round(r * 100)}%`}
      </text>
    </svg>
  );
};

export const ReformaTributaria: React.FC = () => {
  const f = useQuadro();
  const anterior = Math.max(0, f - 1);
  const z = (q: number) => cameraDoVideo(CHAVES, q, 1080, 0).zoom;
  const borrao = f === INI_A2 || f === INI_B ? 0 : Math.min(0.8, Math.max(0, (Math.abs(z(f) - z(anterior)) - 0.04) / 0.2));
  const t = trecho(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04202B" }}>
      <MapCamera chaves={CHAVES} deriva={0}>
        <BorraoRadial intensidade={borrao} copias={7}>
          <MapBackground />
          <SatelliteLayer pasta={PASTA_TILES} zoomMax={ZOOM_MAX_TILES} tratamento={TRATAMENTO} />
          <MapaSvg>
            <Contorno />
            <Municipios />
            <Estados />
          </MapaSvg>
        </BorraoRadial>
        <Icones />
        {/* A1 */}
        {t === "A1" ? <TagNoMapa texto="27 LEIS DE ICMS" entra={A1.icms} sai={A1.mil} x={540} y={1230} cor={ESCURO} corpo={34} /> : null}
        {t === "A1" ? <TagNoMapa texto="5.570 LEIS DE ISS" entra={A1.iss} sai={DUR_A1 + 30} x={540} y={1230} cor={ESCURO} corpo={34} /> : null}
        {/* A2 */}
        {t === "A2" ? <TagNoMapa texto="-%" entra={A2.desconto} sai={INI_B + 30} ponto={CENTRO_ESTADO[GUERRA_DE]} dy={-80} cor={ESCURO} corpo={34} /> : null}
        {t === "A2" ? <TagNoMapa texto="-%" entra={A2.desconto + 4} sai={INI_B + 30} ponto={CENTRO_ESTADO[GUERRA_PARA]} dy={-80} cor={ESCURO} corpo={34} /> : null}
        {t === "A2" ? <TagNoMapa texto="GUERRA FISCAL" entra={A2.guerra} sai={INI_B + 30} x={540} y={1230} cor={ESCURO} corpo={36} /> : null}
        {/* B */}
        {t === "B" ? <TagNoMapa texto="FÁBRICA" entra={B.sp} sai={B.nenhum} ponto={CENTRO_ESTADO[ORIGEM]} dy={-64} cor={ESCURO} corpo={26} saida="pop" /> : null}
        {t === "B" ? <TagNoMapa texto="COMPRA" entra={B.bahia} sai={B.nenhum} ponto={CENTRO_ESTADO[DESTINO]} dy={70} cor={VERDE} corpo={26} saida="pop" /> : null}
        {t === "B" ? <TagNoMapa texto="IMPOSTO FICA NO DESTINO" entra={B.vai + 10} sai={B.devagar - 4} x={540} y={1300} cor={VERDE} corpo={32} /> : null}
        {t === "B" ? <TagNoMapa texto="-%" entra={B.sentido} sai={B.sentido + 22} ponto={CENTRO_ESTADO[GUERRA_DE]} dy={-70} cor={ESCURO} corpo={30} saida="pop" /> : null}
        {t === "B" ? <TagNoMapa texto="-%" entra={B.sentido + 3} sai={B.sentido + 25} ponto={CENTRO_ESTADO[GUERRA_PARA]} dy={-70} cor={ESCURO} corpo={30} saida="pop" /> : null}
        {t === "B" ? <TagNoMapa texto="ATÉ 2077, PARTE SEGUE O SISTEMA ANTIGO" entra={B.a2077 + 6} sai={DURACAO + 30} x={540} y={1060} cor={ESCURO} corpo={24} /> : null}
        {t === "B" ? <TagNoMapa texto="FUNDO REGIONAL" entra={B.fundo} sai={DURACAO + 30} x={540} y={1236} cor={VERDE} corpo={32} /> : null}
        {t === "B" ? <TagNoMapa texto="ATÉ R$ 60 BI POR ANO" entra={B.n60} sai={DURACAO + 30} x={540} y={1302} cor={ESCURO} corpo={28} /> : null}
      </MapCamera>
      <BarraTransicao />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// usado no Estúdio para conferir: a UF existe
export const _confere = UF(DESTINO);

export { DURACAO_NO_VIDEO, FPS_DO_VIDEO, LARGURA, ALTURA } from "./roteiro";
