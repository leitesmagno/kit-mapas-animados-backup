# As receitas: camadas e layouts prontos

Uma receita é um JSON (`src/videos/<doc>/capa/thumb-<nome>.json`) que a composição `Thumb`
desenha. Os tipos completos estão em `src/kit/thumb/tipos.ts`, que é a fonte da verdade.

- `x`, `y`: fração do quadro (0–1). `altura`, `tamanho`, `raio`, `largura` das linhas: fração da
  ALTURA (vale igual no 16:9 e no 9:16). `largura` do texto: fração da LARGURA.
- Camadas na ordem da lista: a primeira fica atrás.
- `src`: relativo a `public/`.
- `"formato": "shorts"` usa 1080×1920; sem ele, 1280×720.

## Índice
1. Fundo, divisão e acabamento
2. As camadas
3. Layouts prontos (16:9 e 9:16)

## 1. Fundo, divisão e acabamento

```json
"fundo": { "src": "imagens-ia/<doc>-capa/fundo-x/<versao>.jpg", "foco": [0.6, 0.5], "zoom": 1.1,
           "desfoque": 0.004, "brilho": 0.85, "contraste": 1.15, "saturacao": 1.3, "espelhar": false },
"acabamento": { "vinheta": 0.5, "tom": "#ff7a00", "intensidadeDoTom": 0.3, "moldura": { "cor": "#FFD400", "largura": 0.014 } }
```
- `moldura`: borda colorida em volta da thumb inteira; numa série, a mesma cor em todas vira identidade.

- Sem imagem: `"fundo": { "gradiente": "radial-gradient(circle at 65% 45%, #ffcf5a, #b3261e 55%, #1a0505)" }`.
- Dividido (A × B): `"fundo": [ {…esquerda}, {…direita} ], "divisao": { "inclinacao": 0.08, "cor": "#fff", "largura": 0.014 }`.
- Padrões: contraste 1.1, saturação 1.2, vinheta 0.45. `desfoque` leve (0.003–0.006) no fundo
  separa o recorte nítido.

## 2. As camadas

**texto**: a manchete.
```json
{ "tipo": "texto", "x": 0.05, "y": 0.5, "ancora": "esquerda", "fonte": "Anton", "tamanho": 0.2, "largura": 0.55, "rot": -3,
  "linhas": [
    "20% DO",
    { "texto": "PETRÓLEO", "cor": "#FFD400", "escala": 1.25 },
    { "texto": "PASSA AQUI", "caixa": "#FF2D2D", "corNaCaixa": "#FFFFFF", "escala": 0.55 }
  ],
  "contorno": { "cor": "#000", "largura": 0.012 }, "extrusao": { "cor": "#000", "profundidade": 0.012, "angulo": 60 },
  "brilho": "#ff8a00" }
```
- `largura`: a linha encolhe até caber (nunca cresce além de `tamanho × escala`).
- `gradiente: ["#FFF27A", "#FF9A00"]` na linha = letra dourada/fogo. `caixa` = marcador atrás (sem contorno).
- `contorno: false` / `extrusao: false` desligam. Contorno 0.008–0.016; extrusão 0.008–0.02.
- Fontes: `Anton` (padrão, condensada), `Bebas Neue` (fina, elegante), `Archivo Black` (larga,
  palavra curta), `Montserrat` (900, geométrica), `Bangers` (quadrinho/humor), `Luckiest Guy`
  (arredondada/curioso). Acentos funcionam em todas.

**recorte**: a peça sem fundo (o assunto).
```json
{ "tipo": "recorte", "src": "imagens-ia/<doc>-capa/recortes/petroleiro.png", "x": 0.7, "y": 0.98, "ancora": "base",
  "altura": 0.75, "rot": 0, "espelhar": false, "contorno": { "cor": "#fff", "largura": 0.007 }, "brilho": "#ff8a00",
  "sombra": true, "saturacao": 1.2, "brilhoDaImagem": 1.05 }
```
- Atalhos: `"icone": "barril_de_petroleo"` (public/assets/icones-3d) ou `"bandeira": "ira"` (public/assets/bandeiras).
- `ancora: "base"` + `y` perto de 1 = o objeto "sai" do pé da imagem (corte corajoso, mais perto).
- Contorno branco (adesivo) é o padrão; `contorno: false` para algo integrado ao cenário.

**brilho**: luz atrás do assunto. `{ "tipo": "brilho", "x": 0.7, "y": 0.5, "raio": 0.5, "cor": "#FFB347", "intensidade": 0.7 }`

**raios**: explosão de raios (revelação, "achado"). `{ "tipo": "raios", "x": 0.5, "y": 0.55, "cor": "#FFD27A", "quantidade": 18, "opacidade": 0.22 }`

**seta**: `{ "tipo": "seta", "de": [0.48, 0.2], "para": [0.64, 0.42], "curva": -0.5, "cor": "#FF2D2D", "largura": 0.022, "contorno": "#fff" }`
- `curva` positiva/negativa escolhe o lado do arco. A ponta segue a curva. Aponte para o detalhe, sem tampá-lo.

**circulo** (à mão): `{ "tipo": "circulo", "x": 0.72, "y": 0.45, "rx": 0.12, "ry": 0.08, "cor": "#FF2D2D", "largura": 0.016, "rot": -8 }`

**selo**: `{ "tipo": "selo", "texto": "US$ 1 tri", "x": 0.85, "y": 0.18, "forma": "estrela", "cor": "#FFD400", "corTexto": "#111", "tamanho": 0.07, "fonte": "Anton", "rot": -6 }`
- `forma`: `pilula` (padrão), `retangulo`, `circulo`, `estrela` (explosão, cresce com o texto).

**logo**: `{ "tipo": "logo", "x": 0.08, "y": 0.12, "altura": 0.13 }` (padrão: a `logoRedonda` do `marca.json`; `src` para outra, ex. a do cliente).

## 3. Layouts prontos

Copie o mais próximo e ajuste. Medidas pensadas para os elementos típicos; confira na folha.

### A. Número gigante (16:9)
Foco à direita, número enorme à esquerda.
```json
{ "fundo": { "src": "…", "foco": [0.65, 0.5], "brilho": 0.8, "desfoque": 0.004 },
  "acabamento": { "vinheta": 0.55 },
  "camadas": [
    { "tipo": "brilho", "x": 0.72, "y": 0.55, "raio": 0.55, "cor": "#FFB347", "intensidade": 0.7 },
    { "tipo": "recorte", "src": "…/recortes/assunto.png", "x": 0.72, "y": 1.0, "ancora": "base", "altura": 0.85, "brilho": "#FF8A00" },
    { "tipo": "texto", "x": 0.05, "y": 0.45, "ancora": "esquerda", "tamanho": 0.42, "largura": 0.5, "rot": -4,
      "linhas": [ { "texto": "39 KM", "gradiente": ["#FFF27A", "#FF9A00"] }, { "texto": "DE LARGURA", "escala": 0.3, "caixa": "#FF2D2D", "corNaCaixa": "#fff" } ] }
  ] }
```

### B. "O que é isso?" (16:9)
Foto/satélite inteiro, círculo + seta no detalhe, texto curto com "?".
```json
{ "fundo": { "src": "…satelite.jpg", "zoom": 1.2, "foco": [0.6, 0.45], "contraste": 1.2 },
  "camadas": [
    { "tipo": "circulo", "x": 0.66, "y": 0.48, "rx": 0.13, "ry": 0.1 },
    { "tipo": "seta", "de": [0.36, 0.72], "para": [0.56, 0.55], "curva": 0.4 },
    { "tipo": "texto", "x": 0.05, "y": 0.22, "ancora": "esquerda", "tamanho": 0.17, "largura": 0.5, "linhas": [ { "texto": "O QUE É", "cor": "#fff" }, { "texto": "ISSO?", "cor": "#FFD400", "escala": 1.3 } ] }
  ] }
```

### C. A × B (16:9)
Dois fundos, dois recortes ou bandeiras, "VS" no meio.
```json
{ "fundo": [ { "gradiente": "linear-gradient(135deg,#0b3d91,#06142e)" }, { "gradiente": "linear-gradient(135deg,#b3261e,#2e0606)" } ],
  "divisao": { "inclinacao": 0.1 },
  "camadas": [
    { "tipo": "recorte", "bandeira": "sc", "x": 0.25, "y": 0.42, "altura": 0.38, "rot": -6 },
    { "tipo": "recorte", "bandeira": "sp", "x": 0.75, "y": 0.42, "altura": 0.38, "rot": 6 },
    { "tipo": "selo", "texto": "VS", "x": 0.5, "y": 0.45, "forma": "circulo", "cor": "#FFD400", "tamanho": 0.12 },
    { "tipo": "texto", "x": 0.5, "y": 0.83, "tamanho": 0.15, "largura": 0.9, "linhas": [ { "texto": "QUEM GANHOU?", "cor": "#fff" } ] }
  ] }
```
(Confira o nome do arquivo da bandeira em `public/assets/bandeiras/`.)

### D. Revelação / achado (16:9)
Assunto no centro-direita, raios e brilho, título com marcador.
```json
{ "fundo": { "src": "…", "brilho": 0.7, "desfoque": 0.006 },
  "camadas": [
    { "tipo": "raios", "x": 0.68, "y": 0.5, "cor": "#FFE7A0", "opacidade": 0.25 },
    { "tipo": "brilho", "x": 0.68, "y": 0.5, "raio": 0.45, "cor": "#FFD27A" },
    { "tipo": "recorte", "src": "…", "x": 0.68, "y": 0.52, "altura": 0.7, "rot": -5 },
    { "tipo": "texto", "x": 0.05, "y": 0.5, "ancora": "esquerda", "tamanho": 0.15, "largura": 0.45, "rot": -3,
      "linhas": [ "ACHARAM", { "texto": "ISSO AQUI", "caixa": "#FFD400", "corNaCaixa": "#111" } ] },
    { "tipo": "selo", "texto": "PROIBIDO", "x": 0.86, "y": 0.15, "forma": "retangulo", "cor": "#FF2D2D", "corTexto": "#fff", "tamanho": 0.06 }
  ] }
```

### E. Capa do Shorts (9:16)
Texto no terço de cima, assunto no meio, pé (20%) e lateral direita livres.
```json
{ "formato": "shorts",
  "fundo": { "src": "…", "foco": [0.5, 0.5] },
  "camadas": [
    { "tipo": "raios", "x": 0.5, "y": 0.55, "cor": "#FFD27A", "opacidade": 0.2 },
    { "tipo": "brilho", "x": 0.5, "y": 0.56, "raio": 0.3, "cor": "#FFB347" },
    { "tipo": "recorte", "src": "…", "x": 0.47, "y": 0.58, "altura": 0.32, "brilho": "#FF8A00" },
    { "tipo": "texto", "x": 0.47, "y": 0.2, "tamanho": 0.09, "largura": 0.82,
      "linhas": [ { "texto": "O CORREDOR", "escala": 0.7 }, { "texto": "DO PETRÓLEO", "gradiente": ["#FFF27A", "#FF9A00"] } ] },
    { "tipo": "selo", "texto": "20% do mundo", "x": 0.47, "y": 0.36, "cor": "#FF2D2D", "corTexto": "#fff", "tamanho": 0.04, "fonte": "Montserrat" }
  ] }
```
