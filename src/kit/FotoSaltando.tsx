import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useId } from "react";
import { staticFile} from "remotion";
import { useMapa } from "../base/componentes/MapCamera";
import type { LonLat } from "../base/geo/projecao";
import { CURVA, boia, entra as entrar, idSvg, sai as sair, useQuadro } from "./tempo";

// ---------------------------------------------------------------------------
// A pessoa (ou objeto) que SALTA de dentro da região — o efeito mais chamativo do
// estilo Didático ("terra de talentos como Gisele Bündchen").
//
// A foto é um PNG SEM FUNDO (recorte). Ela nasce de dentro do estado: a parte de baixo é
// cortada pela borda da região (parece estar "dentro" do mapa) e a parte de cima passa
// por cima do contorno. O recorte é a UNIÃO de dois pedaços:
//   - o polígono da região (projetado no quadro), e
//   - tudo o que está ACIMA da `linhaDeCorte` da foto (a cabeça e os ombros).
//
// Tirar o fundo de uma foto: `python3 -m rembg i foto.jpg foto.png` (pip install rembg),
// ou qualquer removedor de fundo. Guarde em public/assets/<video>/.
// Vai DENTRO do <MapaSvg>, depois da RegiaoDestaque (fica por cima dela).
// ---------------------------------------------------------------------------

export const FotoSaltando: React.FC<{
  regiao: Feature<Geometry> | FeatureCollection;
  src: string; // PNG sem fundo, em public/
  ancora: LonLat; // onde fica a BASE (centro de baixo) da foto
  entra: number;
  sai?: number;
  altura?: number; // px de tela
  proporcao?: number; // largura / altura do PNG
  // fração da altura da foto (de cima) até onde ela pode sair da região: 0.55 = a metade
  // de cima escapa do mapa, a de baixo fica presa dentro do contorno.
  linhaDeCorte?: number;
  fase?: number; // para duas fotos não boiarem juntas
}> = ({ regiao, src, ancora, entra, sai = Infinity, altura = 520, proporcao = 0.8, linhaDeCorte = 0.6, fase = 0 }) => {
  const q = useQuadro();
  const { caminho, projetar, largura: telaL } = useMapa();
  const id = idSvg(useId());
  if (q < entra) return null;
  const fora = sair(q, sai, 10);
  if (fora <= 0) return null;
  const [bx, by] = projetar(ancora[0], ancora[1]);
  const sobe = entrar(q, entra, 16, CURVA.pop);
  const b = boia(q - entra, fase, 0.5);
  const larg = altura * proporcao;
  // a foto nasce de dentro: começa 60% abaixo da base e sobe até o lugar
  const topo = by - altura + (1 - sobe) * altura * 0.6 + b.y + (1 - fora) * altura * 0.4;
  const esquerda = bx - larg / 2 + b.x;
  const corte = topo + altura * linhaDeCorte;
  return (
    <g>
      <defs>
        <clipPath id={`salto${id}`}>
          <path d={caminho(regiao) ?? ""} />
          <rect x={-telaL} y={-5000} width={telaL * 3} height={corte + 5000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#salto${id})`}>
        <image
          href={staticFile(src)}
          x={esquerda}
          y={topo}
          width={larg}
          height={altura}
          preserveAspectRatio="xMidYMax meet"
          transform={`rotate(${b.giro * 0.5} ${bx} ${by})`}
          style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))" }}
        />
      </g>
    </g>
  );
};
