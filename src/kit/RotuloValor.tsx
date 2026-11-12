import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import { PALETAS, type NomeDaPaleta } from "./paleta";
import { entra as entrar, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// O rótulo de ranking ("SÃO JOSÉ DO BREJO DO CRUZ / R$36,3M"), preso ao chão.
//
// - O nome entra letra a letra (desfoque → nítido), o valor entra depois, com pop.
// - O tamanho acompanha a câmera: em `zoomBase` é 100%; quando a câmera se afasta, o
//   rótulo encolhe junto (até `minimo`) — é assim que os rótulos se ACUMULAM no mapa sem
//   virar sopa de letras quando o vídeo abre para mostrar todos.
// - Fica na tela até `sai` (padrão: nunca): o acúmulo é o ponto do estilo.
// Vai FORA do <MapaSvg> (é HTML), dentro do <MapCamera>.
// ---------------------------------------------------------------------------

export const RotuloValor: React.FC<{
  ponto: LonLat;
  nome: string;
  valor?: string;
  entra: number;
  sai?: number;
  paleta?: NomeDaPaleta;
  zoomBase?: number; // zoom da câmera em que o rótulo tem o tamanho cheio
  corpo?: number; // px do nome no tamanho cheio
  minimo?: number; // menor escala quando a câmera se afasta
  deslocar?: [number, number]; // px de tela em relação ao ponto (o rótulo costuma ir abaixo da mancha)
  largura?: number; // quebra o nome em linhas
}> = ({ ponto, nome, valor, entra, sai = Infinity, paleta = "roxo", zoomBase, corpo = 40, minimo = 0.32, deslocar = [0, 18], largura = 420 }) => {
  const q = useQuadro();
  const { projetar, camera } = useMapa();
  if (q < entra) return null;
  const fora = sair(q, sai, 8);
  if (fora <= 0) return null;
  const p = PALETAS[paleta];
  const [x, y] = projetar(ponto[0], ponto[1]);
  const escala = zoomBase === undefined ? 1 : Math.max(minimo, Math.min(1, 2 ** (camera.zoom - zoomBase)));
  const letras = [...nome.toUpperCase()];
  const passo = Math.max(0.6, Math.min(1.4, 18 / letras.length)); // nome longo não demora a entrar
  const fimDoNome = entra + letras.length * passo;
  const v = valor ? entrar(q, fimDoNome - 2, 10, (t) => 1 - (1 - t) ** 3) : 0;
  const popValor = valor ? 1 + 0.18 * Math.max(0, 1 - Math.abs(q - (fimDoNome + 6)) / 6) : 1;
  const sombra = "0 2px 3px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.55)";
  return (
    <div
      style={{
        position: "absolute",
        left: x + deslocar[0] * escala,
        top: y + deslocar[1] * escala,
        width: largura,
        transform: `translateX(-50%) scale(${escala})`,
        transformOrigin: "50% 0%",
        opacity: fora,
        textAlign: "center",
        fontFamily: FONTE,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: corpo, fontWeight: 800, lineHeight: 1.02, letterSpacing: "0.01em", color: p.tinta, textShadow: sombra }}>
        {letras.map((ch, i) => {
          const t = entrar(q, entra + i * passo, 6);
          return (
            <span key={i} style={{ opacity: t, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined, display: ch === " " ? "inline" : "inline-block", transform: `translateY(${(1 - t) * 8}px)` }}>
              {ch}
            </span>
          );
        })}
      </div>
      {valor && (
        <div
          style={{
            marginTop: corpo * 0.12,
            fontSize: corpo * 0.95,
            fontWeight: 800,
            color: p.valor,
            textShadow: sombra,
            opacity: v,
            transform: `translateY(${(1 - v) * 10}px) scale(${popValor})`,
            display: "inline-block",
          }}
        >
          {valor}
        </div>
      )}
    </div>
  );
};
