import { Img, random, staticFile} from "remotion";
import { useMapaOpcional } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import type { NomeDoIcone } from "./assets";
import { CURVA, boia, entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Os "adesivos" 3D do estilo estilo Didático (sol, nuvem, cacto, árvore, emoji…).
//
// Entrada em POP (nasce de 0, passa do tamanho e assenta, girando um pouco), depois
// BOIA devagar — nunca fica parado. Saída encolhendo.
// Posição: `ponto` (lon/lat, anda com a câmera) OU `x`/`y` (fixo na tela).
// O banco está em public/assets/icones-3d (Fluent Emoji 3D, MIT). Ícone novo: ponha o PNG
// lá e o nome em assets.ts. Vai FORA do <MapaSvg>.
// ---------------------------------------------------------------------------

type Posicao = { ponto: LonLat; x?: never; y?: never } | { ponto?: never; x: number; y: number };

// Com `x`/`y` (tela) o ícone funciona em qualquer camada, dentro ou fora da câmera; com `ponto`
// (lon/lat) ele precisa da câmera.
const usePosicao = (pos: Posicao): [number, number] => {
  const mapa = useMapaOpcional();
  if (!pos.ponto) return [pos.x, pos.y];
  if (!mapa) throw new Error("Icone3D com `ponto` precisa estar dentro da câmera (<MapCamera>/<CameraGlobo>)");
  return mapa.projetar(pos.ponto[0], pos.ponto[1]);
};

export const icone = (nome: NomeDoIcone) => `assets/icones-3d/${nome}.png`;

export const Icone3D: React.FC<
  Posicao & {
    nome: NomeDoIcone;
    entra: number;
    sai?: number;
    tamanho?: number; // px
    fase?: number;
    giro?: number; // graus de giro na entrada
    brilho?: string; // halo atrás (o sol "queimando")
    balanco?: number; // 0 = parado, 1 = boia normal, 2 = agitado
  }
> = ({ nome, entra, sai = Infinity, tamanho = 180, fase, giro = -18, brilho, balanco = 1, ...pos }) => {
  const q = useQuadro();
  const [x, y] = usePosicao(pos as Posicao);
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const f = fase ?? random(`icone-${nome}-${entra}`) * 10;
  const e = entrar(q, entra, 14, CURVA.pop);
  const b = boia(q, f, balanco);
  const escala = e * (0.2 + 0.8 * fora);
  const pulsoBrilho = brilho ? 0.75 + 0.25 * Math.sin(q / 9 + f) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x + b.x,
        top: y + b.y,
        width: tamanho,
        height: tamanho,
        transform: `translate(-50%, -50%) scale(${escala}) rotate(${(1 - e) * giro + b.giro}deg)`,
        opacity: Math.min(1, e * 2),
        pointerEvents: "none",
      }}
    >
      {brilho && (
        <div
          style={{
            position: "absolute",
            inset: -tamanho * 0.45,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${brilho}CC 0%, ${brilho}55 38%, ${brilho}00 70%)`,
            opacity: pulsoBrilho,
            mixBlendMode: "screen",
          }}
        />
      )}
      <Img src={staticFile(icone(nome))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))" }} />
    </div>
  );
};

// Um punhado de ícones iguais espalhados numa região (cactos no sertão, árvores na
// Amazônia), cada um entrando um pouco depois do outro.
export const IconesEspalhados: React.FC<{
  nome: NomeDoIcone;
  pontos: LonLat[];
  entra: number;
  sai?: number;
  intervalo?: number; // quadros entre um e outro
  tamanho?: number | number[];
}> = ({ nome, pontos, entra, sai, intervalo = 3, tamanho = 120 }) => (
  <>
    {pontos.map((p, i) => (
      <Icone3D key={i} nome={nome} ponto={p} entra={entra + i * intervalo} sai={sai} tamanho={Array.isArray(tamanho) ? tamanho[i % tamanho.length] : tamanho} fase={i * 1.9} />
    ))}
  </>
);

// Chuva ou neve caindo de um ponto (embaixo de uma nuvem) — partículas determinísticas.
export const Precipitacao: React.FC<
  Posicao & {
    entra: number;
    sai?: number;
    tipo?: "chuva" | "neve";
    largura?: number; // px da faixa que cai
    altura?: number; // px de queda
    quantidade?: number;
  }
> = ({ entra, sai = Infinity, tipo = "chuva", largura = 160, altura = 160, quantidade = 14, ...pos }) => {
  const q = useQuadro();
  const [x, y] = usePosicao(pos as Posicao);
  if (q < entra) return null;
  const fora = Math.min(entrar(q, entra, 8), sair(q, sai, 8));
  if (fora <= 0) return null;
  const periodo = tipo === "chuva" ? 16 : 48;
  return (
    <svg style={{ position: "absolute", left: x - largura / 2, top: y, overflow: "visible", opacity: fora, pointerEvents: "none" }} width={largura} height={altura}>
      {Array.from({ length: quantidade }, (_, i) => {
        const r = random(`gota-${i}`);
        const t = (((q - entra) / periodo + r) % 1 + 1) % 1;
        const gx = random(`gx-${i}`) * largura + (tipo === "neve" ? 8 * Math.sin((q + i * 13) / 11) : 0);
        const gy = t * altura;
        const o = Math.sin(t * Math.PI);
        return tipo === "chuva" ? (
          <path key={i} d={`M${gx},${gy} c -6,9 -6,15 0,15 c 6,0 6,-6 0,-15 z`} fill="#4FA8FF" stroke="#2F7FE0" strokeWidth={1} opacity={o} />
        ) : (
          <circle key={i} cx={gx} cy={gy} r={3 + 2 * random(`gr-${i}`)} fill="#FFFFFF" opacity={0.9 * o} />
        );
      })}
    </svg>
  );
};

// O balão de fala ("Calor da Peste") com pop, preso a um ponto do mapa ou da tela.
export const BalaoDeFala: React.FC<
  Posicao & {
    texto: string;
    entra: number;
    sai?: number;
    corpo?: number;
    lado?: "esquerda" | "direita"; // para onde aponta o rabinho
  }
> = ({ texto, entra, sai = Infinity, corpo = 34, lado = "esquerda", ...pos }) => {
  const q = useQuadro();
  const [x, y] = usePosicao(pos as Posicao);
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const e = entrar(q, entra, 12, CURVA.pop);
  const letras = Math.round(entrar(q, entra + 4, Math.max(6, texto.length * 1.2)) * texto.length);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${e * fora})`,
        transformOrigin: lado === "esquerda" ? "20% 100%" : "80% 100%",
        background: "#FFFFFF",
        color: "#111",
        fontFamily: FONTE,
        fontWeight: 800,
        fontSize: corpo,
        lineHeight: 1.05,
        padding: `${corpo * 0.45}px ${corpo * 0.6}px`,
        borderRadius: corpo * 1.2,
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        whiteSpace: "pre",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <span>{texto.slice(0, letras)}</span>
      <span style={{ opacity: 0 }}>{texto.slice(letras)}</span>
      <div
        style={{
          position: "absolute",
          bottom: -corpo * 0.5,
          [lado === "esquerda" ? "left" : "right"]: corpo * 0.9,
          width: 0,
          height: 0,
          borderLeft: `${corpo * 0.35}px solid transparent`,
          borderRight: `${corpo * 0.35}px solid transparent`,
          borderTop: `${corpo * 0.6}px solid #FFFFFF`,
        }}
      />
    </div>
  );
};
