// ---------------------------------------------------------------------------
// O TRAJETO: uma rota de verdade (a linha que o OSRM traça pelas ruas) medida em METROS —
// onde está o ponto a 740 m do começo, para onde a rua aponta ali, que pedaço já foi
// percorrido. É a base da `RotaGeo` (a linha que se desenha) e da câmera que acompanha a rota
// (`cameraNaRota`), para que as duas andem juntas.
//
// E o RITMO da viagem: a velocidade não é constante — freia nas curvas (a câmera "vira a
// esquina"), solta nas retas, sai devagar e pousa no fim. Tudo calculado da própria geometria,
// determinístico.
// ---------------------------------------------------------------------------

export type Ponto = [number, number];

const RAD = Math.PI / 180;

// metros entre dois pontos próximos (plano local; erro desprezível numa cidade)
export const metrosEntre = (a: Ponto, b: Ponto) => {
  const k = Math.cos(((a[1] + b[1]) / 2) * RAD);
  return Math.hypot((b[0] - a[0]) * 111320 * k, (b[1] - a[1]) * 110574);
};

export type Trajeto = {
  coordenadas: Ponto[];
  total: number; // metros
  acumulado: number[];
  ponto: (m: number) => Ponto;
  // o rumo (graus a partir do norte, sentido horário) médio entre m - atras e m + frente
  rumo: (m: number, atras?: number, frente?: number) => number;
  // o pedaço do trajeto entre m0 e m1 (para desenhar a parte já percorrida)
  trecho: (m0: number, m1: number) => Ponto[];
};

export const trajeto = (coordenadas: Ponto[]): Trajeto => {
  const acumulado = [0];
  for (let i = 1; i < coordenadas.length; i++) acumulado.push(acumulado[i - 1] + metrosEntre(coordenadas[i - 1], coordenadas[i]));
  const total = acumulado[acumulado.length - 1];
  const indice = (m: number) => {
    let a = 0;
    let b = acumulado.length - 1;
    while (b - a > 1) {
      const c = (a + b) >> 1;
      if (acumulado[c] <= m) a = c;
      else b = c;
    }
    return a;
  };
  const ponto = (m: number): Ponto => {
    const x = Math.max(0, Math.min(total, m));
    const i = indice(x);
    const seg = acumulado[i + 1] - acumulado[i] || 1;
    const t = (x - acumulado[i]) / seg;
    const [a, b] = [coordenadas[i], coordenadas[i + 1] ?? coordenadas[i]];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  const rumo = (m: number, atras = 25, frente = 60) => {
    // a média dos vetores de direção ao longo da janela (uma esquina vira aos poucos)
    let x = 0;
    let y = 0;
    const passo = 5;
    for (let s = m - atras; s < m + frente; s += passo) {
      const a = ponto(s);
      const b = ponto(s + passo);
      const k = Math.cos(a[1] * RAD);
      x += (b[0] - a[0]) * k;
      y += b[1] - a[1];
    }
    return Math.atan2(x, y) / RAD;
  };
  const trecho = (m0: number, m1: number): Ponto[] => {
    if (m1 <= m0) return [];
    const i0 = indice(m0);
    const i1 = indice(m1);
    return [ponto(m0), ...coordenadas.slice(i0 + 1, i1 + 1), ponto(m1)];
  };
  return { coordenadas, total, acumulado, ponto, rumo, trecho };
};

// Quanto a rua vira em volta de m (graus por 100 m).
const curvatura = (t: Trajeto, m: number, janela = 30) => {
  const a = t.rumo(m - janela, 10, 10);
  const b = t.rumo(m + janela, 10, 10);
  const d = Math.abs(((b - a + 540) % 360) - 180);
  return (d / (2 * janela)) * 100;
};

// O RITMO: devolve uma função u (0–1 do tempo da viagem) → metros percorridos.
//  freioNasCurvas: quanto a câmera desacelera numa esquina de 90° (0 = nada, 0,6 = bem)
//  saida / pouso:  metros de aceleração no começo e de frenagem no fim
export const ritmoDoTrajeto = (t: Trajeto, { freioNasCurvas = 0.55, saida = 140, pouso = 320, pousoMinimo = 0.12 }: { freioNasCurvas?: number; saida?: number; pouso?: number; pousoMinimo?: number } = {}) => {
  const passo = 2;
  const n = Math.ceil(t.total / passo);
  const tempo = [0];
  const suave = (x: number) => x * x * (3 - 2 * x);
  for (let i = 1; i <= n; i++) {
    const m = Math.min(t.total, i * passo);
    const curva = Math.min(1, curvatura(t, m) / 150);
    let v = 1 - freioNasCurvas * curva;
    v *= 0.18 + 0.82 * suave(Math.min(1, m / saida));
    // a frenagem começa cedo e aperta perto do fim (a câmera "chegando")
    v *= pousoMinimo + (1 - pousoMinimo) * Math.pow(Math.min(1, (t.total - m) / pouso), 1.15);
    tempo.push(tempo[i - 1] + passo / Math.max(0.03, v));
  }
  const fim = tempo[n];
  return (u: number) => {
    const alvo = Math.max(0, Math.min(1, u)) * fim;
    let a = 0;
    let b = n;
    while (b - a > 1) {
      const c = (a + b) >> 1;
      if (tempo[c] <= alvo) a = c;
      else b = c;
    }
    const k = (alvo - tempo[a]) / (tempo[b] - tempo[a] || 1);
    return Math.min(t.total, (a + k) * passo);
  };
};
