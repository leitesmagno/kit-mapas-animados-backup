import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import { CURVA, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O DESTINO do formato comercial (geostorytelling): o lugar a que a viagem leva — uma casa,
// um hotel, um restaurante. Os DADOS ficam num objeto só (`DestinoGeo`), para o mesmo vídeo
// servir a outro cliente trocando só ele (e os recortes de satélite/dados da cidade).
//
// As peças:
//   <FotoDoDestino>  a foto NASCE do ponto do mapa (íris a partir do marcador), cobre a tela,
//                    assenta num cartão com moldura (zoom lento 100→106%) e depois volta para
//                    o ponto — "foi exatamente aqui que chegamos"
//   <PainelFinal>    o fechamento: foto em cima, o mapa (a própria câmera, recortada) embaixo
//   recorteDoMapa()  o clip-path que encolhe o mapa para o cartão de baixo do painel
// ---------------------------------------------------------------------------

export type DestinoGeo = {
  titulo: string; // o que o lugar é ("Residência", "Pousada Tal")
  endereco: string; // como aparece na tela
  bairro: string | null;
  cidade: string;
  uf: string; // sigla
  estado: string;
  pais: string;
  coordenadas: [number, number]; // [lon, lat] da porta
  imagem: { src: string; foco?: string } | null; // a foto da fachada (public/…)
  tipo?: "casa" | "hotel" | "restaurante" | "empresa" | "turismo" | "ponto";
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONTE = "Montserrat, Inter, sans-serif";

// A foto — ou, enquanto ela não existe, um espaço reservado sóbrio (para o preview; a cena
// fica pronta e a foto entra sozinha quando `imagem` for preenchida no destino).
export const FotoOuEspaco: React.FC<{ destino: DestinoGeo; escala?: number; desfoque?: number; style?: React.CSSProperties }> = ({ destino, escala = 1, desfoque = 0, style }) => {
  if (destino.imagem)
    return (
      <Img
        src={staticFile(destino.imagem.src)}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: destino.imagem.foco ?? "50% 50%", transform: `scale(${escala})`, filter: desfoque ? `blur(${desfoque}px)` : undefined, ...style }}
      />
    );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${escala})`,
        background: "radial-gradient(ellipse 90% 70% at 50% 40%, #2A3342 0%, #151B25 55%, #0B0F16 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        filter: desfoque ? `blur(${desfoque}px)` : undefined,
        ...style,
      }}
    >
      <svg width={150} height={150} viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
        <path d="M3.5 11.2 12 4l8.5 7.2M6 9.6V20h4.4v-5.4h3.2V20H18V9.6" fill="none" stroke="#F2B45A" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontFamily: FONTE, fontSize: 30, fontWeight: 700, letterSpacing: "0.3em", color: "rgba(255,255,255,0.55)" }}>FOTO DA FACHADA</div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: "rgba(255,255,255,0.32)" }}>aguardando a imagem do imóvel</div>
    </div>
  );
};

// O cartão da foto (retângulo na tela) para cada fase.
type Caixa = { x: number; y: number; l: number; a: number; raio: number };
const misturaCaixa = (a: Caixa, b: Caixa, t: number): Caixa => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, l: a.l + (b.l - a.l) * t, a: a.a + (b.a - a.a) * t, raio: a.raio + (b.raio - a.raio) * t });

export const FotoDoDestino: React.FC<{
  destino: DestinoGeo;
  abre: number; // a íris começa a abrir no marcador
  assenta: number; // a foto (tela cheia) assenta no cartão
  fecha: number; // o cartão volta para o ponto
  cartao?: Caixa; // onde o cartão fica (px)
  legenda?: string; // uma linha discreta embaixo do cartão
  cor?: string;
}> = ({ destino, abre, assenta, fecha, cartao, legenda, cor = "#F2B45A" }) => {
  const f = useQuadro();
  const { width, height } = useVideoConfig();
  const { projetar } = useMapa();
  const DUR_ABRE = 26;
  const DUR_FECHA = 30;
  if (f < abre || f > fecha + DUR_FECHA) return null;
  let [px, py] = projetar(destino.coordenadas[0], destino.coordenadas[1]);
  if (px < -5000) [px, py] = [width / 2, height / 2];
  const caixa: Caixa = cartao ?? { x: 64, y: 300, l: width - 128, a: 1190, raio: 30 };
  const cheia: Caixa = { x: 0, y: 0, l: width, a: height, raio: 0 };

  // 1) a íris: um círculo que cresce a partir do marcador até cobrir a tela
  const t1 = interpolate(f, [abre, abre + DUR_ABRE], [0, 1], { ...cl, easing: CURVA.pouso });
  const maxR = Math.hypot(Math.max(px, width - px), Math.max(py, height - py)) + 40;
  const r = 24 + (maxR - 24) * t1;
  // 2) a foto assenta no cartão
  const t2 = interpolate(f, [assenta, assenta + 28], [0, 1], { ...cl, easing: CURVA.suave });
  // 3) o cartão volta para o ponto (encolhe até ele, arredondando em círculo)
  const t3 = interpolate(f, [fecha, fecha + DUR_FECHA], [0, 1], { ...cl, easing: Easing3 });
  const lado = 36;
  const ponto: Caixa = { x: px - lado / 2, y: py - lado / 2, l: lado, a: lado, raio: lado / 2 };
  let c = misturaCaixa(cheia, caixa, t2);
  c = misturaCaixa(c, ponto, t3);
  // o zoom lento da fachada (100 → 106%) a vida inteira do cartão, e a entrada um pouco maior
  const vida = interpolate(f, [abre, fecha], [0, 1], cl);
  const escala = 1.1 - 0.1 * CURVA.pouso(Math.min(1, t1)) + 0.06 * CURVA.suave(vida);
  const foco = (1 - t1) * 10 + t3 * 4;
  const mascara = t2 <= 0 ? `radial-gradient(circle ${r}px at ${px}px ${py}px, #000 ${Math.max(0, r - 50)}px, transparent ${r}px)` : undefined;
  // o fundo (o mapa) escurece enquanto a foto está na tela
  const veu = Math.min(t1, 1 - t3) * 0.62;
  const moldura = t2 * (1 - t3);
  const legendaVis = interpolate(f, [assenta + 22, assenta + 40], [0, 1], cl) * interpolate(f, [fecha - 12, fecha], [1, 0], cl);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: `rgba(3,5,9,${veu})` }} />
      <div
        style={{
          position: "absolute",
          left: c.x,
          top: c.y,
          width: c.l,
          height: c.a,
          borderRadius: c.raio,
          overflow: "hidden",
          maskImage: mascara,
          WebkitMaskImage: mascara,
          boxShadow: moldura > 0 ? `0 40px 90px rgba(0,0,0,${0.7 * moldura}), 0 0 0 1.5px ${cor}${Math.round(0x70 * moldura).toString(16).padStart(2, "0")}` : undefined,
          opacity: t3 > 0.85 ? interpolate(t3, [0.85, 1], [1, 0]) : 1,
        }}
      >
        {/* a foto ocupa sempre a tela inteira por dentro (o cartão só recorta): sem pulo de enquadramento */}
        <div style={{ position: "absolute", left: -c.x, top: -c.y, width, height }}>
          <FotoOuEspaco destino={destino} escala={escala} desfoque={foco} />
          {/* um leve gradiente embaixo: profundidade, e onde a legenda assenta */}
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45) 100%)" }} />
        </div>
      </div>
      {/* o anel de luz na borda da íris */}
      {t1 > 0.02 && t1 < 0.98 && t2 <= 0 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <circle cx={px} cy={py} r={Math.max(0, r - 26)} fill="none" stroke={cor} strokeWidth={3} strokeOpacity={0.85 * Math.sin(Math.PI * t1)} />
        </svg>
      )}
      {legenda && legendaVis > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: caixa.y + caixa.a + 44, textAlign: "center", opacity: legendaVis * (1 - t3), transform: `translateY(${(1 - legendaVis) * 10}px)` }}>
          <div style={{ display: "inline-block", width: 44, height: 2, background: cor, boxShadow: `0 0 10px ${cor}`, marginBottom: 18 }} />
          <div style={{ fontFamily: FONTE, fontSize: 36, fontWeight: 800, letterSpacing: "0.08em", color: "#FFFFFF", textShadow: "0 3px 18px rgba(0,0,0,0.8)" }}>{legenda}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// a curva do "voltar para o ponto": começa firme e pousa
const Easing3 = (t: number) => 1 - Math.pow(1 - t, 3);

// ---------------------------------------------------------------------------
// O FECHAMENTO: o mapa encolhe para o cartão de baixo (recorteDoMapa, aplicado por quem monta
// o vídeo em volta da câmera) e a foto desce para o cartão de cima, com o endereço.
// ---------------------------------------------------------------------------

export const LAYOUT_FINAL = {
  foto: { x: 64, y: 190, l: 952, a: 800, raio: 30 },
  mapa: { x: 64, y: 1036, l: 952, a: 640, raio: 30 },
};

// 0 → tela cheia; 1 → o cartão de baixo
export const recorteDoMapa = (t: number, largura = 1080, altura = 1920) => {
  const m = LAYOUT_FINAL.mapa;
  const topo = m.y * t;
  const esq = m.x * t;
  const dir = (largura - m.x - m.l) * t;
  const base = (altura - m.y - m.a) * t;
  return `inset(${topo}px ${dir}px ${base}px ${esq}px round ${m.raio * t}px)`;
};

export const PainelFinal: React.FC<{
  destino: DestinoGeo;
  entra: number;
  cor?: string;
  sobretitulo?: string;
}> = ({ destino, entra, cor = "#F2B45A", sobretitulo = "DESTINO" }) => {
  const f = useQuadro();
  if (f < entra) return null;
  const { foto, mapa } = LAYOUT_FINAL;
  const t = f - entra;
  const mapaPronto = interpolate(t, [0, 30], [0, 1], { ...cl, easing: CURVA.suave });
  const fotoEntra = interpolate(t, [14, 42], [0, 1], { ...cl, easing: CURVA.pouso });
  const texto = interpolate(t, [34, 54], [0, 1], { ...cl, easing: CURVA.pouso });
  const zoom = 1.06 - 0.06 * fotoEntra + 0.03 * interpolate(t, [40, 300], [0, 1], cl);
  const local = [destino.bairro, `${destino.cidade} – ${destino.uf}`].filter(Boolean).join("  ·  ");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* a moldura do mapa (o mapa em si é a câmera, recortada por fora) */}
      <div style={{ position: "absolute", left: mapa.x, top: mapa.y, width: mapa.l, height: mapa.a, borderRadius: mapa.raio, boxShadow: `inset 0 0 0 1.5px ${cor}${Math.round(0x66 * mapaPronto).toString(16).padStart(2, "0")}, inset 0 0 60px rgba(0,0,0,${0.5 * mapaPronto})` }} />
      {/* a foto */}
      <div
        style={{
          position: "absolute",
          left: foto.x,
          top: foto.y,
          width: foto.l,
          height: foto.a,
          borderRadius: foto.raio,
          overflow: "hidden",
          opacity: fotoEntra,
          transform: `translateY(${(1 - fotoEntra) * -40}px)`,
          boxShadow: `0 36px 80px rgba(0,0,0,0.7), 0 0 0 1.5px ${cor}66`,
          filter: `blur(${(1 - fotoEntra) * 8}px)`,
        }}
      >
        <FotoOuEspaco destino={destino} escala={zoom} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(4,6,10,0.88) 100%)" }} />
        <div style={{ position: "absolute", left: 48, right: 48, bottom: 44, opacity: texto, transform: `translateY(${(1 - texto) * 14}px)` }}>
          <div style={{ fontFamily: FONTE, fontSize: 24, fontWeight: 700, letterSpacing: "0.34em", color: cor }}>{sobretitulo}</div>
          <div style={{ marginTop: 10, fontFamily: FONTE, fontSize: 46, fontWeight: 800, letterSpacing: "0.02em", color: "#FFFFFF" }}>{destino.endereco.toUpperCase()}</div>
          <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(255,255,255,0.75)" }}>{local.toUpperCase()}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
