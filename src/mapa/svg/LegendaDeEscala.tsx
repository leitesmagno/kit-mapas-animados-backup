import { COLORS, FONT } from "../../tema";

type Props = {
  x: number;
  y: number;
  largura?: number;
  // O que está nas pontas da escala ("8 ANOS" → "14 ANOS").
  de: string;
  para: string;
  titulo?: string;
  // A unidade no meio da linha dos valores. Ocupa altura zero — é o jeito de descer a régua
  // quando ela já encostou no pé da área segura.
  unidade?: string;
  // Um recado curto sobre quem ficou fora (ex.: estados com poucos registros).
  nota?: string;
  // Uma marca na régua: onde um valor de referência cai (0 a 1) e como se chama.
  marca?: { pos: number; texto: string };
  opacidade?: number;
};

// A régua do mapa temático: sem ela, a cor não quer dizer nada. Fica pequena e no pé da
// tela, porque quem explica é o mapa.
export const LegendaDeEscala: React.FC<Props> = ({ x, y, largura = 520, de, para, titulo, unidade, nota, marca, opacidade = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: largura, opacity: opacidade, fontFamily: FONT }}>
    {titulo && <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: COLORS.creamSoft, marginBottom: marca ? 76 : 12 }}>{titulo}</div>}
    <div style={{ position: "relative" }}>
      <div style={{ height: 16, borderRadius: 8, background: `linear-gradient(90deg, rgba(255,114,0,0.25), ${COLORS.orange})` }} />
      {marca && (
        <div style={{ position: "absolute", left: largura * marca.pos, top: -46, transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "0.08em", color: COLORS.cream, whiteSpace: "nowrap" }}>{marca.texto}</div>
          <div style={{ width: 3, height: 26, margin: "4px auto 0", background: COLORS.cream, opacity: 0.8 }} />
        </div>
      )}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontWeight: 800, fontSize: 30, color: COLORS.cream }}>
      <span>{de}</span>
      {unidade && <span style={{ fontWeight: 700, fontSize: 24, letterSpacing: "0.18em", color: COLORS.creamSoft, alignSelf: "center" }}>{unidade}</span>}
      <span>{para}</span>
    </div>
    {nota && <div style={{ marginTop: 12, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: COLORS.creamSoft }}>{nota}</div>}
  </div>
);
