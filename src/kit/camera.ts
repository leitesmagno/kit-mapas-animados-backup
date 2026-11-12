import type { Feature, FeatureCollection, Geometry } from "geojson";
import { geoBounds } from "d3-geo";
import { EASE, type Chave } from "../base/geo/camera";
import type { AreaDaTela } from "../motor/formato";
import { enquadrar, type Caixa, type Camera, type LonLat, type Ponto } from "../base/geo/projecao";

// ---------------------------------------------------------------------------
// A câmera "anda e para" dos estilos de referência, em cima do motor de câmera existente
// (voo van Wijk + deriva contínua do <MapCamera>).
//
// Uma PARADA = "a câmera CHEGA aqui no quadro X". O voo começa `voo` quadros antes e,
// entre uma parada e outra, a câmera segura (a deriva do motor mantém o quadro vivo).
// Para o ranking (estilo Ranking), intercale paradas `recuo` (a vista geral) a cada 2–3
// cidades: é o recuo que mostra os rótulos acumulados.
// ---------------------------------------------------------------------------

export type Parada = {
  chega: number; // quadro em que a câmera termina o voo (ancore na palavra: q("cidade", -0.2))
  camera: Camera;
  voo?: number; // quadros de voo (padrão 18 ≈ 0,6 s a 30 fps)
  curva?: (t: number) => number;
  rho?: number; // >1.4 = o voo "sobe" mais no meio (bom para distâncias grandes)
};

export const percurso = (paradas: Parada[]): Chave[] => {
  const chaves: Chave[] = [];
  paradas.forEach((p, i) => {
    if (i === 0) {
      chaves.push({ quadro: p.chega, camera: p.camera });
      return;
    }
    const anterior = chaves[chaves.length - 1];
    const inicio = Math.max(anterior.quadro + 1, p.chega - (p.voo ?? 18));
    if (inicio > anterior.quadro + 1) chaves.push({ quadro: inicio, camera: anterior.camera });
    chaves.push({ quadro: Math.max(inicio + 1, p.chega), camera: p.camera, easing: p.curva ?? EASE.cinema, rho: p.rho });
  });
  return chaves;
};

// A câmera que enquadra uma região (estado, município) com margem, empurrando o assunto
// na tela quando há texto/cartão ao lado (`deslocar` em px).
export const vistaDe = (
  regiao: Feature<Geometry> | FeatureCollection,
  largura: number,
  altura: number,
  opcoes: { margem?: number; deslocar?: Ponto; bearing?: number } = {},
): Camera => {
  const [[o, s], [l, n]] = geoBounds(regiao);
  return enquadrar(
    [
      [o, s],
      [l, n],
    ],
    largura,
    altura,
    { margem: opcoes.margem ?? 140, deslocar: opcoes.deslocar, bearing: opcoes.bearing },
  );
};

// A câmera centrada num ponto com um zoom dado (a visita de uma cidade).
export const vistaEm = (ponto: LonLat, zoom: number, bearing = 0): Camera => ({ lon: ponto[0], lat: ponto[1], zoom, bearing });

// A câmera que encaixa uma caixa geográfica numa ÁREA da tela (px): o zoom vem do tamanho da área e
// o centro da caixa cai no meio dela; o resto da tela fica livre para painel, título e legenda.
// É o "naFaixa" dos verticais generalizado: use a `areaDoAssunto` do formato (motor/formato.ts) —
// no horizontal, o assunto nos 2/3 direitos e os painéis no terço esquerdo.
export const enquadrarNaArea = (caixa: Caixa, area: AreaDaTela, largura: number, altura: number, margem = 40): Camera =>
  enquadrar(caixa, area.x1 - area.x0, area.y1 - area.y0, { margem, deslocar: [(area.x0 + area.x1) / 2 - largura / 2, (area.y0 + area.y1) / 2 - altura / 2] });
