import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useId } from "react";
import { staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { FONTE } from "../base/estilo";
import type { NomeDaBandeira } from "./assets";
import { CURVA, entra as entrar, idSvg, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// Uma imagem RECORTADA no formato da região: a bandeira dentro do estado (estilo Didático,
// Mapas Animados), ou uma foto/textura dentro de um município.
//
// - O recorte é o contorno projetado pela câmera do quadro: a bandeira anda e dá zoom
//   junto com o mapa.
// - Entra por uma "onda" circular que abre do centro da região; a imagem vem com um
//   leve zoom por dentro (não fica chapada).
// - `sigla` põe o texto gigante por cima ("PR", "SC", "RS") com pop.
// Vai DENTRO do <MapaSvg>.
// ---------------------------------------------------------------------------

export const bandeira = (nome: NomeDaBandeira) => `assets/bandeiras/${nome}.png`;

export const ImagemNaForma: React.FC<{
  regiao: Feature<Geometry> | FeatureCollection;
  src: string; // caminho em public/ — use bandeira("pr") para as bandeiras
  entra: number;
  sai?: number;
  opacidade?: number;
  sigla?: string;
  corpoSigla?: number; // px na tela
  // onde a sigla fica (lon/lat); padrão: o centro da região. Use quando a sigla cai em cima
  // de um texto da bandeira (o "NEGO" da Paraíba).
  posSigla?: LonLat;
  borda?: string | null; // contorno por cima (null = sem)
  // "slice" cobre a região inteira cortando a imagem; "meet" mostra a imagem inteira
  ajuste?: "slice" | "meet" | "none"; // "none": a imagem estica para cobrir a caixa (uma imagem feita sob medida para ela)
  // onde a imagem é desenhada ([[oeste, sul], [leste, norte]]); padrão: a caixa da região.
  // Use para a parte que importa da bandeira (a estrela do Piauí) cair dentro do trecho
  // visível do estado, em vez de ser cortada.
  caixaImagem?: [LonLat, LonLat];
  // o alinhamento do preserveAspectRatio ("xMinYMin" = presa no canto de cima à esquerda)
  alinhar?: string;
  // true = a imagem fica parada dentro da forma (sem o zoom lento de "respiração")
  parada?: boolean;
  // false = sem a sombra interna (numa forma estreita, como a Itália, ela escurece a bandeira inteira)
  sombra?: boolean;
}> = ({ regiao, src, entra, sai = Infinity, opacidade = 1, sigla, corpoSigla = 120, posSigla, borda = "#FFFFFF", ajuste = "slice", caixaImagem, alinhar = "xMidYMid", parada = false, sombra = true }) => {
  const q = useQuadro();
  const { caminho, projetar } = useMapa();
  const id = idSvg(useId());
  if (q < entra) return null;
  const fora = sair(q, sai, 10);
  if (fora <= 0) return null;
  const d = caminho(regiao) ?? "";
  const [[rx0, ry0], [rx1, ry1]] = caminho.bounds(regiao);
  const [cx, cy] = caminho.centroid(regiao);
  const cantos = caixaImagem
    ? [projetar(caixaImagem[0][0], caixaImagem[0][1]), projetar(caixaImagem[1][0], caixaImagem[1][1])]
    : [[rx0, ry0], [rx1, ry1]];
  const x0 = Math.min(cantos[0][0], cantos[1][0]);
  const y0 = Math.min(cantos[0][1], cantos[1][1]);
  const w = Math.abs(cantos[1][0] - cantos[0][0]);
  const h = Math.abs(cantos[1][1] - cantos[0][1]);
  const onda = entrar(q, entra, 16);
  const raio = Math.hypot(rx1 - rx0, ry1 - ry0) * 0.6 * onda;
  const zoom = parada ? 1 : 1.12 - 0.08 * entrar(q, entra, 60, CURVA.suave);
  const s = sigla ? entrar(q, entra + 8, 12, CURVA.pop) : 0;
  const [sx, sy] = posSigla ? projetar(posSigla[0], posSigla[1]) : [cx, cy];
  return (
    <g opacity={fora}>
      <defs>
        <clipPath id={`forma${id}`}>
          <path d={d} />
        </clipPath>
        <clipPath id={`onda${id}`}>
          <circle cx={cx} cy={cy} r={raio} />
        </clipPath>
      </defs>
      <g clipPath={`url(#forma${id})`}>
        <g clipPath={`url(#onda${id})`}>
          <image
            href={staticFile(src)}
            x={x0}
            y={y0}
            width={w}
            height={h}
            preserveAspectRatio={ajuste === "none" ? "none" : `${alinhar} ${ajuste}`}
            opacity={opacidade}
            transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}
          />
          {/* sombra interna: a bandeira "afunda" no mapa em vez de parecer adesivo */}
          {sombra && <path d={d} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={18} filter="url(#brilho)" />}
        </g>
      </g>
      {borda && <path d={d} fill="none" stroke={borda} strokeWidth={2.4} strokeLinejoin="round" opacity={onda} />}
      {sigla && s > 0 && (
        <text
          x={sx}
          y={sy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONTE}
          fontWeight={800}
          fontSize={corpoSigla}
          letterSpacing="-0.02em"
          fill="#FFFFFF"
          stroke="#0B1220"
          strokeWidth={corpoSigla * 0.07}
          paintOrder="stroke"
          opacity={Math.min(1, s * 1.5)}
          transform={`translate(${sx} ${sy}) scale(${s}) translate(${-sx} ${-sy})`}
          style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}
        >
          {sigla}
        </text>
      )}
    </g>
  );
};
