# As imagens: Nano Banana + recorte

O motor é o de sempre (`scripts/imagens`, leia o `scripts/imagens/LEIA.md` se nunca usou). A
thumbnail usa o conjunto **`capa`**, guardado à parte das imagens do vídeo.

## O arquivo de pedidos (`src/videos/<doc>/capa/pedidos.json`)

```json
{
  "ficha": {
    "tema": "O Estreito de Ormuz e a rota do petróleo",
    "contexto": "passagem marítima estreita entre o Irã e Omã, costas áridas e montanhosas",
    "estilo": "bold high-click-through YouTube thumbnail, cinematic, punchy, realistic",
    "paleta": ["deep teal", "burning orange", "oil black"],
    "iluminacao": "strong golden backlight, rim light on the subjects",
    "evitar": ["explosions or combat"]
  },
  "imagens": [
    {
      "id": "fundo-estreito",
      "cena": "capa",
      "tipo": "fundo",
      "modelo": "alta",
      "descricao": "narrow sea passage between dark steep mountains at dusk, glowing orange sky right behind the center, deep teal water, haze",
      "proporcao": "16:9",
      "tamanho": "2K",
      "obrigatoria": false
    },
    {
      "id": "petroleiro",
      "cena": "capa",
      "tipo": "elemento",
      "modelo": "alta",
      "descricao": "a huge red-and-black crude oil tanker seen from a low front three-quarter angle, bow towards the camera, dramatic",
      "proporcao": "4:3",
      "tamanho": "2K",
      "restricoes": ["company names, flags or markings on the ship"],
      "obrigatoria": false
    }
  ]
}
```

- `fundo` (16:9 ou 9:16, o mesmo da thumb): o cenário SEM o assunto, com luz forte atrás do
  centro. Se o assunto faz parte do cenário (paisagem, satélite), use `thumbnail` com
  `espaco_para_texto`.
- `elemento`: uma peça por pedido, na proporção da peça (pessoa em pé → `2:3`/`3:4`; navio → `16:9`
  ou `4:3`; objeto → `1:1`). O prompt já pede o verde puro, o objeto inteiro com margem e sem verde
  nele. Evite pedir objeto verde (planta, garrafa verde): o recorte come a cor. Se precisar, peça
  em outro tom e corrija a cor no Remotion (`saturacao`, `tom`).
- Descreva **ângulo e luz** do elemento iguais aos do fundo (a luz vem do mesmo lado, mesma hora do
  dia). É isso que faz a montagem parecer uma foto só.
- Ângulo dramático vende: de baixo para cima, três-quartos, bem perto, com a frente virada para a
  câmera. Perfil chapado e vista de cima parecem ilustração de catálogo.
- `referencias` (até 14 imagens em `public/…`) para manter o estilo do vídeo, ex.: um quadro do
  próprio vídeo. Nunca imagem de pessoa real como referência.

## Custo (tabela de 2026-10-14)

| modelo | 1K | 2K |
|---|---|---|
| `padrao` (Nano Banana 2.1) | US$ 0,034 | US$ 0,050 |
| `alta` (Nano Banana Pro) | US$ 0,134 | US$ 0,134 |

Uma thumbnail típica (fundo + 2 elementos em `alta`) ≈ US$ 0,40. O cache não cobra duas vezes o
mesmo pedido; trocar a descrição gera de novo. Use `--sim` para ver prompt e custo.

## Comandos

```bash
npm run imagens -- gerar <doc> --conjunto capa --sim
npm run imagens -- gerar <doc> --conjunto capa [ids…]
npm run imagens -- status <doc> --conjunto capa
npm run imagens -- reprovar <doc> <id> --conjunto capa --nota "veio com texto no casco"
npm run imagens -- gerar <doc> <id> --conjunto capa --forcar     # outra versão
npm run imagens -- aprovar <doc> <id> --conjunto capa
npm run imagens -- recortes <doc> [ids…]                           # verde → PNG transparente
```

O caminho do fundo para a receita está no `manifesto.json` do conjunto
(`imagens.<id>.versoes.<versao>.arquivo`, relativo a `public/`). Os recortes ficam em
`imagens-ia/<doc>-capa/recortes/<id>.png`.

## Recorte

- **Do verde** (`recortes`): mede a cor do fundo na borda, transparência gradual, tira o verde que
  vaza na borda (despill) e corta justo no objeto, mantendo a proporção. É o melhor caminho.
- **De foto comum** (`recortar-foto <entrada> <saida.png>`): rembg com o modelo
  `isnet-general-use` (baixa ~170 MB na primeira vez). Para fotos com licença livre (Wikimedia,
  acervo do projeto) de construções, objetos, paisagens. Pessoa real não.
- Confira o recorte sobre fundo escuro E claro (abra o PNG): halo verde ou borda serrilhada
  aparecem no tamanho grande. O contorno branco do `Recorte` esconde pequenas imperfeições.

## Quando o problema é a imagem (gerar de novo) e quando não é (ajustar a receita)

| sintoma | onde resolver |
|---|---|
| texto/letras/logo inventados, dedos estranhos, objeto cortado na borda | gerar de novo (`reprovar` + `--forcar`) |
| luz do elemento contra a do fundo | gerar de novo com a luz descrita igual |
| assunto pequeno, mal posicionado, sem destaque | receita (`altura`, `x`, `y`, `brilho`) |
| cores apagadas ou diferentes entre camadas | receita (`saturacao`, `brilhoDaImagem`, `acabamento.tom`) |
| fundo disputa com o assunto | receita (`fundo.desfoque`, `fundo.brilho` < 1, vinheta) |
