import { TextoImpacto, type NomeDoIcone } from "../../../kit";
import type { LonLat } from "../../../base/geo/projecao";
import { LUGAR } from "../dados";
import { COR } from "../estilo";
import { CENA18 } from "../roteiro";
import { FotoComFio } from "./comum";

// CENA 18 — O FECHO (e o loop). "Do encontro das águas ao Pico da Neblina, o Amazonas é cheio de lugares
// para descobrir. Qual desses lugares você já conhecia?"
// O cartão sai e a câmera assenta no estado inteiro → "Do encontro das águas…": a fotinha do Encontro pousa
// fora do estado, numa janelinha presa ao lugar por um fio → "…ao Pico da Neblina": a do pico → "…cheio de
// lugares…": a bandeira fica mais forte (Estado.tsx) e o Teatro, as Anavilhanas, Presidente Figueiredo e
// Parintins pousam → "…para descobrir": tudo sai e a
// câmera recua até o Brasil → "Qual desses lugares…?": a pergunta; o último quadro é o primeiro.

// [foto, nome, ícone, lugar, cor, quando, x, y na tela] — o estado fica no meio (y ~600–1320): SEIS janelinhas
// menores (pedido do usuário: "diminuir… e bota mais algumas"), três em cima e três embaixo, fora dele; depois
// do Encontro e do Pico, as outras pousam uma a uma até "…para descobrir"
const L = 310;
const COLUNA = [185, 540, 895];
const CIMA = 400;
const BAIXO = 1450;
const LUGARES: [string, string, NomeDoIcone, LonLat, string, number, number, number][] = [
  ["fecho-encontro.jpg", "ENCONTRO DAS ÁGUAS", "water_wave", LUGAR.encontro, COR.rio, CENA18.encontro, COLUNA[1], BAIXO],
  ["fecho-neblina.jpg", "PICO DA NEBLINA", "mountain", LUGAR.picoDaNeblina, COR.floresta, CENA18.neblina, COLUNA[0], CIMA],
  ["fecho-teatro.jpg", "TEATRO AMAZONAS", "classical_building", LUGAR.teatro, COR.cidade, CENA18.neblina + 15, COLUNA[0], BAIXO],
  ["anavilhanas.jpg", "ANAVILHANAS", "desert_island", LUGAR.anavilhanas, COR.floresta, CENA18.neblina + 25, COLUNA[1], CIMA],
  ["cachoeira-santuario.jpg", "CACHOEIRAS", "water_wave", LUGAR.santuario, COR.floresta, CENA18.neblina + 35, COLUNA[2], CIMA],
  ["garantido.jpg", "PARINTINS", "party_popper", LUGAR.parintins, COR.cidade, CENA18.neblina + 45, COLUNA[2], BAIXO],
];

export const Scene18Textos: React.FC = () => (
  <>
    {LUGARES.map(([arquivo, nome, icone, ponto, cor, entra, x, y]) => (
      <FotoComFio key={arquivo} arquivo={arquivo} nome={nome} icone={icone} ponto={ponto} entra={entra} sai={CENA18.saem} x={x} y={y} cor={cor} largura={L} />
    ))}
  </>
);

export const Scene18Fotos: React.FC = () => <TextoImpacto linhas={["QUAL DESSES LUGARES", "VOCÊ JÁ CONHECIA?"]} entra={CENA18.qual} y={360} corpo={62} />;
