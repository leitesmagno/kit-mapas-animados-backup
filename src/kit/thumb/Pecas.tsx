import { MARCA } from "../../marca";
import React, { useId } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import type { CamadaBrilho, CamadaCirculo, CamadaLogo, CamadaRaios, CamadaRecorte, CamadaSelo, CamadaSeta, Ponto } from "./tipos";

// ---------------------------------------------------------------------------
// As PEÇAS da thumbnail além do título: o recorte com contorno de adesivo, a seta grossa, o círculo
// feito à mão, o selo, o brilho atrás do assunto, os raios e a logo. Tudo em fração do quadro.
// ---------------------------------------------------------------------------

// ---- o recorte: PNG transparente com contorno (dilatação do alfa), halo colorido e sombra ----------
export const Recorte: React.FC<{ camada: CamadaRecorte }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const id = useId().replace(/:/g, "");
  const src = c.src ?? (c.icone ? `assets/icones-3d/${c.icone}.png` : c.bandeira ? `assets/bandeiras/${c.bandeira}.png` : undefined);
  if (!src) throw new Error("recorte sem src, icone ou bandeira");
  const alt = c.altura * height;
  const contorno = c.contorno === false ? null : { cor: c.contorno?.cor ?? "#FFFFFF", largura: (c.contorno?.largura ?? 0.007) * height };
  const filtros = [
    contorno || c.brilho ? `url(#${id})` : "",
    c.sombra === false ? "" : `drop-shadow(0 ${height * 0.014}px ${height * 0.022}px rgba(0,0,0,0.65))`,
    c.brilhoDaImagem ? `brightness(${c.brilhoDaImagem})` : "",
    c.saturacao ? `saturate(${c.saturacao})` : "",
  ].join(" ");
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius={contorno?.largura ?? 0} result="dilatado" />
            {c.brilho ? (
              <>
                <feGaussianBlur in="dilatado" stdDeviation={height * 0.03} result="borrado" />
                <feFlood floodColor={c.brilho} />
                <feComposite in2="borrado" operator="in" result="halo" />
              </>
            ) : null}
            <feFlood floodColor={contorno?.cor ?? "transparent"} />
            <feComposite in2="dilatado" operator="in" result="borda" />
            <feMerge>
              {c.brilho ? <feMergeNode in="halo" /> : null}
              {c.brilho ? <feMergeNode in="halo" /> : null}
              <feMergeNode in="borda" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: c.x * width,
          top: c.y * height,
          height: alt,
          width: "auto",
          transform: `translate(-50%, ${c.ancora === "base" ? "-100%" : "-50%"}) rotate(${c.rot ?? 0}deg) scaleX(${c.espelhar ? -1 : 1})`,
          filter: filtros,
        }}
      />
    </>
  );
};

// ---- a seta grossa e curva (contorno + cor), com a ponta na direção da curva ------------------------
export const Seta: React.FC<{ camada: CamadaSeta }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const p0: Ponto = [c.de[0] * width, c.de[1] * height];
  const p2: Ponto = [c.para[0] * width, c.para[1] * height];
  const [dx, dy] = [p2[0] - p0[0], p2[1] - p0[1]];
  const comp = Math.hypot(dx, dy);
  const curva = c.curva ?? 0.3;
  const p1: Ponto = [(p0[0] + p2[0]) / 2 - (dy / comp) * comp * curva * 0.5, (p0[1] + p2[1]) / 2 + (dx / comp) * comp * curva * 0.5];
  const larg = (c.largura ?? 0.022) * height;
  const cabeca = larg * 2.6;
  // a direção da ponta = a tangente no fim da curva (de p1 para p2)
  const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const base: Ponto = [p2[0] - Math.cos(ang) * cabeca * 0.85, p2[1] - Math.sin(ang) * cabeca * 0.85];
  const ponta = (escala: number) => {
    const t = cabeca * escala;
    const pts: Ponto[] = [
      [p2[0] + Math.cos(ang) * (escala - 1) * cabeca * 0.6, p2[1] + Math.sin(ang) * (escala - 1) * cabeca * 0.6],
      [p2[0] - Math.cos(ang) * t + Math.cos(ang + Math.PI / 2) * t * 0.62, p2[1] - Math.sin(ang) * t + Math.sin(ang + Math.PI / 2) * t * 0.62],
      [p2[0] - Math.cos(ang) * t + Math.cos(ang - Math.PI / 2) * t * 0.62, p2[1] - Math.sin(ang) * t + Math.sin(ang - Math.PI / 2) * t * 0.62],
    ];
    return pts.map((p) => p.join(",")).join(" ");
  };
  const caminho = `M ${p0.join(" ")} Q ${p1.join(" ")} ${base.join(" ")}`;
  const cor = c.cor ?? "#FF2D2D";
  const borda = c.contorno === false ? null : c.contorno ?? "#FFFFFF";
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible", filter: `drop-shadow(0 ${height * 0.01}px ${height * 0.016}px rgba(0,0,0,0.6))` }}>
      {borda ? (
        <>
          <path d={caminho} fill="none" stroke={borda} strokeWidth={larg + height * 0.014} strokeLinecap="round" />
          <polygon points={ponta(1.28)} fill={borda} stroke={borda} strokeWidth={height * 0.006} strokeLinejoin="round" />
        </>
      ) : null}
      <path d={caminho} fill="none" stroke={cor} strokeWidth={larg} strokeLinecap="round" />
      <polygon points={ponta(1)} fill={cor} stroke={cor} strokeWidth={height * 0.004} strokeLinejoin="round" />
    </svg>
  );
};

// ---- o círculo "à mão": pouco mais de uma volta, raio oscilando de leve (determinístico) -----------
export const Circulo: React.FC<{ camada: CamadaCirculo }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const [cx, cy, rx, ry] = [c.x * width, c.y * height, c.rx * height, c.ry * height];
  const pts: string[] = [];
  const voltas = 1.12;
  for (let i = 0; i <= 90; i++) {
    const t = (i / 90) * voltas * Math.PI * 2 - Math.PI * 0.6;
    const osc = 1 + 0.035 * Math.sin(t * 3.1) + 0.05 * (i / 90);
    pts.push(`${(cx + Math.cos(t) * rx * osc).toFixed(1)},${(cy + Math.sin(t) * ry * osc).toFixed(1)}`);
  }
  const larg = (c.largura ?? 0.016) * height;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, transform: `rotate(${c.rot ?? -8}deg)`, transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 ${height * 0.006}px ${height * 0.01}px rgba(0,0,0,0.55))` }}>
      <polyline points={pts.join(" ")} fill="none" stroke={c.cor ?? "#FF2D2D"} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ---- o selo: pílula, retângulo, círculo ou estrela explodindo, com o texto dentro --------------------
export const Selo: React.FC<{ camada: CamadaSelo }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const corpo = (c.tamanho ?? 0.07) * height;
  const forma = c.forma ?? "pilula";
  const cor = c.cor ?? "#FFD400";
  const texto = (
    <span style={{ position: "relative", fontFamily: `"${c.fonte ?? "Anton"}"`, fontWeight: c.fonte === "Montserrat" ? 900 : 400, fontSize: corpo, color: c.corTexto ?? "#111", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, letterSpacing: "0.02em" }}>
      {c.texto}
    </span>
  );
  const comum: React.CSSProperties = {
    position: "absolute",
    left: c.x * width,
    top: c.y * height,
    transform: `translate(-50%, -50%) rotate(${c.rot ?? -6}deg)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: `drop-shadow(0 ${height * 0.01}px ${height * 0.018}px rgba(0,0,0,0.6))`,
  };
  if (forma === "estrela") {
    // o texto (≈0,48 em por letra) tem de caber no raio interno da estrela (40% do lado)
    const lado = Math.max(corpo * 2.6, (corpo * 0.48 * c.texto.length) / 0.7);
    const n = 16;
    const pts = Array.from({ length: n * 2 }, (_, i) => {
      const r = i % 2 === 0 ? 0.5 : 0.4;
      const t = (i / (n * 2)) * Math.PI * 2;
      return `${50 + Math.cos(t) * r * 100},${50 + Math.sin(t) * r * 100}`;
    }).join(" ");
    return (
      <div style={{ ...comum, width: lado, height: lado }}>
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <polygon points={pts} fill="#FFFFFF" transform="translate(50 50) scale(1.06) translate(-50 -50)" />
          <polygon points={pts} fill={cor} />
        </svg>
        {texto}
      </div>
    );
  }
  const raio = forma === "pilula" ? corpo : forma === "circulo" ? "50%" : corpo * 0.12;
  const lado = forma === "circulo" ? corpo * 2.4 : undefined;
  return (
    <div style={{ ...comum, background: cor, border: `${height * 0.006}px solid #FFFFFF`, borderRadius: raio, padding: forma === "circulo" ? 0 : `${corpo * 0.22}px ${corpo * 0.42}px`, width: lado, height: lado }}>
      {texto}
    </div>
  );
};

// ---- o brilho atrás do assunto (separa o recorte do fundo) e os raios de "revelação" ---------------
export const Brilho: React.FC<{ camada: CamadaBrilho }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const r = c.raio * height;
  return (
    <div
      style={{
        position: "absolute",
        left: c.x * width - r,
        top: c.y * height - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${c.cor ?? "#FFE08A"} 0%, transparent 70%)`,
        opacity: c.intensidade ?? 0.85,
        mixBlendMode: "screen",
      }}
    />
  );
};

export const Raios: React.FC<{ camada: CamadaRaios }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const n = c.quantidade ?? 18;
  const passo = 360 / n;
  const cor = c.cor ?? "#FFFFFF";
  const raio = (c.raio ?? 1.2) * height;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-conic-gradient(from 0deg at ${c.x * 100}% ${c.y * 100}%, ${cor} 0deg ${passo * 0.42}deg, transparent ${passo * 0.42}deg ${passo}deg)`,
        WebkitMaskImage: `radial-gradient(circle ${raio}px at ${c.x * width}px ${c.y * height}px, black 0%, transparent 100%)`,
        maskImage: `radial-gradient(circle ${raio}px at ${c.x * width}px ${c.y * height}px, black 0%, transparent 100%)`,
        opacity: c.opacidade ?? 0.22,
        mixBlendMode: "screen",
      }}
    />
  );
};

export const Logo: React.FC<{ camada: CamadaLogo }> = ({ camada: c }) => {
  const { width, height } = useVideoConfig();
  const lado = (c.altura ?? 0.13) * height;
  const src = c.src ?? MARCA.logoRedonda;
  if (!src) return null;
  return (
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", left: c.x * width - lado / 2, top: c.y * height - lado / 2, height: lado, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
    />
  );
};
