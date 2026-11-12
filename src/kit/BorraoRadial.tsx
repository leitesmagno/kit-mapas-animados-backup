import { AbsoluteFill } from "remotion";

// ---------------------------------------------------------------------------
// BORRÃO RADIAL — o "zoom blur" dos mergulhos e recuos de escala do estilo "Mapas Animados": N cópias do conteúdo empilhadas, cada uma um pouco maior (a partir do centro), com
// opacidade 1/(i+1) — a média das cópias é o rastro radial. Determinístico, sem shader.
//
// `intensidade` 0–1 (0 = uma cópia só, sem custo). Normalmente vem da VELOCIDADE do zoom da
// câmera (|Δzoom| por quadro): sobe no meio do mergulho e zera na chegada. `alcance` é o
// quanto a última cópia cresce (0,08 = 8%) na intensidade máxima.
//
// `rastro` [dx, dy] (px) soma o borrão de MOVIMENTO dos voos laterais: a última cópia fica
// deslocada esse tanto (para onde o mapa ESTAVA), as outras no meio do caminho. Vem da
// velocidade do centro da câmera na tela; [0, 0] = só o radial.
// ---------------------------------------------------------------------------

export const BorraoRadial: React.FC<{
  intensidade: number;
  copias?: number;
  alcance?: number;
  centro?: [number, number]; // origem do rastro, em % da tela
  rastro?: [number, number];
  children: React.ReactNode;
}> = ({ intensidade, copias = 10, alcance = 0.08, centro = [50, 50], rastro = [0, 0], children }) => {
  const k = Math.min(1, Math.max(0, intensidade));
  const r = Math.hypot(rastro[0], rastro[1]);
  // o movimento lateral também pede cópias (uma a cada ~10 px de rastro)
  const kr = Math.min(1, r / 90);
  if (k < 0.02 && r < 4) return <AbsoluteFill>{children}</AbsoluteFill>;
  const n = Math.max(2, Math.round(2 + (copias - 2) * Math.max(k, kr)));
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill
          key={i}
          style={{
            opacity: 1 / (i + 1),
            transform: `translate(${(rastro[0] * i) / (n - 1)}px, ${(rastro[1] * i) / (n - 1)}px) scale(${1 + (alcance * k * i) / (n - 1)})`,
            transformOrigin: `${centro[0]}% ${centro[1]}%`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
