import { interpolate} from "remotion";
import { useQuadro } from "./tempo";
import { CURVA_GLOBO, type CameraGlobo, type ChaveGlobo } from "./cameraGlobo";
import { PontoGeo, type TipoDePonto } from "./PontoGeo";
import { TituloCinema } from "./TituloCinema";
import { metrosEntre } from "./trajeto";

// ---------------------------------------------------------------------------
// O PASSEIO BAIRRO POR BAIRRO: a câmera chega a um bairro, o território dele acende, o nome
// aparece, o ponto de referência (se houver) surge no lugar, e a câmera sai para o próximo —
// sem código repetido por bairro. Três partes:
//
//   planejarJornada(paradas, {…})  → as janelas de cada bairro + as chaves da câmera
//                                     (ritmo fixo, ou `chegadas`: o quadro em que a câmera
//                                     chega em cada um — a palavra da narração)
//   <JornadaDeBairros janelas={…} /> → os nomes e os pontos de referência (dentro da câmera)
//   destaqueDaJornada(janelas, f)  → { nome, forca } do bairro da vez, para o MapaUrbano
//                                     acender os endereços dele
//
// O enquadramento de cada bairro sai da extensão dele (`caixa`): bairro grande, câmera mais
// alta; bairro pequeno, mais perto. A tela gira de leve de um bairro para o outro.
// ---------------------------------------------------------------------------

export type ParadaDaJornada = {
  nome: string;
  coordinates: [number, number];
  caixa?: [number, number, number, number]; // oeste, sul, leste, norte
  ponto?: { nome: string; tipo: TipoDePonto; coordinates: [number, number] };
};

export type JanelaDaJornada = ParadaDaJornada & {
  parte: number; // quadro em que a câmera sai do bairro anterior
  chega: number; // quadro em que a câmera chega
  sai: number; // quadro em que a câmera começa a sair
  camera: CameraGlobo;
};

export const planejarJornada = (
  paradas: ParadaDaJornada[],
  {
    inicio,
    viagem,
    pausa,
    ocupa = 700,
    zoom = [14.8, 16.2],
    alvo = [540, 1060],
    giro = 6,
    chegadas,
    fim: fimDado,
  }: {
    inicio: number;
    viagem: number; // quadros de voo entre dois bairros (com `chegadas`: o máximo)
    pausa: number; // quadros parado (com deriva) em cada bairro (sem `chegadas`)
    chegadas?: number[]; // o quadro de chegada em cada bairro (a narração manda)
    fim?: number; // com `chegadas`: quando a câmera sai do último
    ocupa?: number; // px de tela que o bairro ocupa
    zoom?: [number, number];
    alvo?: [number, number];
    giro?: number; // graus de giro alternado da tela
  },
) => {
  // o horário de cada bairro: fixo, ou preso à narração (o voo ocupa até 55% do intervalo)
  const horario = paradas.map((_, i) => {
    if (!chegadas) return { parte: inicio + i * (viagem + pausa), chega: inicio + i * (viagem + pausa) + viagem, sai: inicio + i * (viagem + pausa) + viagem + pausa };
    const chega = chegadas[i];
    const antes = i ? chegadas[i - 1] : inicio;
    const voo = Math.min(viagem, Math.round((chega - antes) * 0.55));
    const prox = chegadas[i + 1];
    const vooSeguinte = prox === undefined ? 0 : Math.min(viagem, Math.round((prox - chega) * 0.55));
    return { parte: chega - voo, chega, sai: prox === undefined ? (fimDado ?? chega + pausa) : Math.max(chega + 2, prox - vooSeguinte) };
  });
  const janelas: JanelaDaJornada[] = paradas.map((p, i) => {
    const { parte, chega, sai } = horario[i];
    const [lon, lat] = p.coordinates;
    let z = zoom[1];
    if (p.caixa) {
      const [o, s, l, n] = p.caixa;
      const w = metrosEntre([o, lat], [l, lat]);
      const h = metrosEntre([lon, s], [lon, n]);
      const mpp = Math.max(w / ocupa, h / (ocupa * 1.35), 1e-3);
      z = Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180)) / mpp);
    }
    z = Math.max(zoom[0], Math.min(zoom[1], z));
    // o ponto de referência entra no quadro: a câmera mira entre o bairro e ele
    const alvoLon = p.ponto ? lon * 0.65 + p.ponto.coordinates[0] * 0.35 : lon;
    const alvoLat = p.ponto ? lat * 0.65 + p.ponto.coordinates[1] * 0.35 : lat;
    return {
      ...p,
      parte,
      chega,
      sai,
      camera: { lon: alvoLon, lat: alvoLat, zoom: z, alvo, bearing: (i % 2 ? 1 : -1) * giro },
    };
  });
  const chaves: ChaveGlobo[] = janelas.flatMap((j) => [
    { quadro: j.chega, camera: j.camera, easing: CURVA_GLOBO.cinema, rho: 1.15 },
    { quadro: j.sai, camera: { ...j.camera, zoom: j.camera.zoom + 0.12, bearing: (j.camera.bearing ?? 0) * 1.3 }, easing: CURVA_GLOBO.deriva },
  ]);
  const fim = janelas.length ? janelas[janelas.length - 1].sai : inicio;
  return { janelas, chaves, fim };
};

// O bairro que está em destaque no quadro e quanto (acende na chegada, apaga na saída).
export const destaqueDaJornada = (janelas: JanelaDaJornada[], f: number) => {
  for (const j of janelas) {
    const meio = (j.chega - j.parte) * 0.5;
    if (f >= j.chega - meio && f <= j.sai + meio) {
      const forca = interpolate(f, [j.chega - meio, j.chega + 6, j.sai, j.sai + meio], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { nome: j.nome, forca };
    }
  }
  return null;
};

// Os nomes (título de documentário, sempre na mesma altura: o olho sabe onde procurar) e os
// pontos de referência, cada um na janela do seu bairro.
export const JornadaDeBairros: React.FC<{ janelas: JanelaDaJornada[]; y?: number; cor?: string; corpo?: number }> = ({ janelas, y = 400, cor = "#F2B45A", corpo = 76 }) => {
  const f = useQuadro();
  return (
    <>
      {janelas
        .filter((j) => f >= j.chega - 12 && f <= j.sai + 24)
        .map((j) => (
          <div key={j.nome}>
            <TituloCinema texto={j.nome} entra={j.chega - 8} sai={j.sai - 6} y={y} corpo={corpo} peso={800} espaco={0.16} fio corDoFio={cor} />
            {j.ponto && <PontoGeo ponto={j.ponto.coordinates} tipo={j.ponto.tipo} nome={j.ponto.nome} entra={j.chega + 6} sai={j.sai - 4} cor={cor} corpo={30} />}
          </div>
        ))}
    </>
  );
};
