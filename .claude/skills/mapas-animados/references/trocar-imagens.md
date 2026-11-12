# Trocar fotos e imagens

A regra de ouro: **o vídeo só conhece o NOME do arquivo**. Trocar uma imagem = pôr o arquivo novo
na mesma pasta com o mesmo nome (substituindo o antigo). Explique isso à pessoa com o caminho
exato da pasta e o nome de cada arquivo.

## Fotos de um vídeo vertical

Pasta: `public/assets/<pasta-do-video>/` (no exemplo: `public/assets/exemplo-vertical/`, onde cada
foto é um quadro "TROQUE ESTA FOTO" com o nome dela escrito).

1. Liste para a pessoa as fotos do vídeo **com o momento em que aparecem** (a cena e a frase).
   As fotos e onde entram estão nas cenas (`foto("manaus.jpg")`, `ImagemDeDrone src=…`).
2. Ela põe os arquivos na pasta com os mesmos nomes (jpg/png; o ideal é ≥ 1500 px no lado maior).
   Se o nome vier diferente, renomeie você (`mv`), conferindo pela imagem qual é qual.
3. Rode `npm run fotos -- <pasta>`: mede a proporção de cada foto (o cartão se ajusta e mostra a
   foto inteira) e avisa foto pequena demais.
4. No Studio, recarregue a página (F5) e mostre o trecho.

**Foto nova** (um lugar a mais): ponha o arquivo na pasta, rode `npm run fotos`, e use na cena
(`foto("novo-lugar.jpg")` no cartão certo).

**Baixar fotos livres para a pessoa**: Wikimedia Commons (licenças CC BY/CC BY-SA/domínio
público), anotando autor e licença no `CREDITOS-<pasta>.md` (o crédito vai na descrição do post,
nunca na tela). Nunca use foto de banco pago, do Google Imagens sem licença ou de outro canal.

## Bandeiras

`public/assets/bandeiras/<sigla ou país>.png` (as 27 UFs e vários países, desenho oficial). A
versão **centrada no contorno** de um estado (a que abre dentro dele) é gerada por script a partir
da oficial — moldes: `scripts/bandeira-estado.py` (estado) e `scripts/bandeira-pais.py` (país). Bandeira nunca por IA.

## Ícones 3D

`public/assets/icones-3d/` (Fluent Emoji 3D da Microsoft, licença MIT, + alguns gerados). O nome
do arquivo sem `.png` é o nome do ícone nas peças (`icone="cityscape"`). Ícone que não existe:
gere com o motor de imagens (`npm run imagens`, conjunto `icones`) ou procure um equivalente.
Nunca desenhe ícone em SVG à mão.

## Logo e marca d'água

`public/marca/` + `marca.json` (`references/configuracao.md` §Logo).

## Imagens de apoio do documentário (horizontal)

Vêm do motor de imagens (Gemini), com manifesto: `src/videos/<doc>/imagens/pedidos.json` (o que
cada imagem deve mostrar) → `npm run imagens -- gerar <doc>` → revisar → `aprovar`. Instruções em
`scripts/imagens/LEIA.md`. No exemplo horizontal as imagens são quadros "IMAGEM DE APOIO" no lugar
das geradas: para ver o exemplo com imagens de verdade, a pessoa põe a `GEMINI_API_KEY` no `.env` e
você roda `npm run imagens -- gerar exemplo-horizontal`.

Para usar uma **imagem própria** no lugar de uma gerada: ponha o arquivo por cima do caminho que
o manifesto aponta (`public/imagens-ia/<doc>/<id>/<versão>.jpg`), com a mesma proporção (16:9).

## Thumbnails

As camadas (fundo, recortes) também têm manifesto (`capa/`); a receita é um JSON
(`src/videos/<doc>/capa/thumb-*.json`) e cada uma aparece no Studio na pasta `Thumbs-<doc>`. Veja
a skill `thumbnail-chamativa`.
