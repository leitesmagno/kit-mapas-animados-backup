# O que deu certo (e o que foi reprovado)

Regras tiradas de dezenas de vídeos de mapa produzidos e publicados com este motor — os que
passaram de centenas de milhares de visualizações seguiam todas. Cada regra tem o porquê: quando
um pedido da pessoa conflitar com uma delas, **o pedido vence**, mas avise em uma linha.

## 1. Estrutura e texto

- **Copie a estrutura que funcionou** (o exemplo vertical): gancho com superlativo ou surpresa
  ("O maior rio do mundo… e não existe uma única ponte") → "e ainda guarda…" (3 fotos em corte
  seco) → divisas → números → capital → história → lugares (um por frase) → virada ("Mas é saindo
  de X que…") → fecho ("Do X ao Y, o estado é cheio de lugares para descobrir") → pergunta ("Qual
  desses lugares você já conhecia?"). Não invente fecho novo: repita a forma.
- Frases de 6–12 palavras, números por extenso no texto da voz (a ElevenLabs lê algarismo em
  inglês às vezes), na legenda o algarismo.
- **Número não se arredonda para cima**: 0,598 é "zero vírgula cinquenta e nove"; 74,66 % é
  "quase setenta e cinco". A voz e a tela contam a mesma coisa.
- Assunto pesado (massacre, guerra) fica fora de vídeo de turismo, salvo pedido.

## 2. O estado / a cidade em foco

- **Bandeira centrada dentro do contorno** (`ImagemNaForma` com a versão recomposta para a forma),
  meio apagada (~0,58) do momento em que o estado aparece até o fim; mais forte na revelação e no
  fecho, mais fraca de perto. **Cor chapada sozinha "não está no padrão".**
- Revelação: a câmera pousa, a bandeira abre dentro, o nome sobe por trás da máscara
  (`TituloDeLugar`), o contorno pulsa.
- Divisas: cada vizinho ganha a **própria bandeira** recortada + a sigla **no instante em que a voz
  diz o nome**; depois saem. O "buraco" dentro do estado (DF em Goiás) leva a bandeira dele.
- **Comparação** (estado × estado, ilha × estado): o comparado com a bandeira centrada, parada,
  entrando suave; nenhuma linha (rio, divisa) passando por cima; nome e área em cima, não no centro.
- Ranking por estado: **todos os estados aparecem pintados** em algum momento, mesmo os que a voz
  não cita (encaixe-os numa onda ancorada numa palavra próxima).

## 3. Lugares e pinos

- Marcador de cidade/lugar = **pino vermelho de localização** (o `Pino` do exemplo). Não invente
  seta, ponto brilhante ou ícone no lugar dele. Lugar sem cidade (cachoeira, parque) também ganha pino.
- Câmera **bem perto e centrada** no lugar (zoom ~10–12,5), o **município demarcado** (contorno
  aceso) e o pino no ponto exato (Nominatim).
- **Um pino por vez**: o anterior sai ~8 quadros antes do próximo cair.
- Com cartão de foto (que já traz nome e ícone), o pino vai **sem nome e sem ícone** em cima.
- **Sem "mapinha de localização"** no canto (`MapaDeLocalizacao` foi reprovado): a referência de
  lugar é o contorno + o pino.
- Um elemento gráfico por ideia, um ponto de origem. Nada de diagrama geométrico que precise de
  explicação (retas, ângulos).

## 4. Fotos

- **Inteiras, na proporção do arquivo** (o cartão se adapta; foto em pé = cartão estreito, com
  `alturaMaxima`), zoom interno no máximo ~3 %. Meça com `npm run fotos -- <pasta>`.
- Cartão com **etiqueta do lugar e ícone 3D no canto**; entra por chicote, assenta com um clique de
  câmera, sai por chicote. O fio do cartão nasce no ponto exato e passa **por trás** do pino.
- Onde a fala cita lugares sem foto própria, use a foto do lugar (cartão), não ícone com fio.
- Quando a pessoa puser fotos numa pasta, use **só** as que ela mandar.

## 5. Câmera

- **Nunca para.** Entre voos, chaves com easing **linear** e zoom +3–5 %/s (mais um passeio lateral
  leve); a curva (`VOO`) só nos voos e mergulhos. Easing suave em cada chave = "tá travando".
- Deriva senoidal desligada (`DERIVA = 0`): ela balança o mapa e tudo preso a ele "treme".
- Borrão radial dos mergulhos **limitado** (máx. ~0,85; ~0,35 no horizontal): sem teto, nos
  mergulhos longos "fica tudo borrado".
- Satélite sempre em pirâmide que cubra a tela inteira (costura de recorte = "cortando o mapa").

## 6. Sincronia e legenda

- Imagem, efeito e fala **juntos**: nada aparece antes da palavra (só a câmera sai antes, para
  chegar nela). O elemento começa ~0,05 s antes da voz, nunca 0,25 s.
- **Legenda karaokê**: linhas de até 30 letras montadas à mão por pedaços que não se cortam
  (`BLOCOS_DA_LEGENDA`: nome próprio e locução juntos), embaixo (y 1748), Poppins 800 com contorno
  preto, a palavra falada acesa. Nunca "de São / Paulo".

## 7. Som

- Trilha de fundo **bem baixa** (~−31 LUFS sob a voz de −16; ~−25 nos respiros). Volumes baixos
  demais também são problema ("não tem música nem efeito").
- Efeitos com o **pico do arquivo no evento** (whoosh no quadro de velocidade máxima do voo, clique
  quando a foto assenta). Só efeitos "de edição": nada tonal (piano, carrilhão) nem natureza com
  pássaros ao fundo.
- **Sem "tique" por cidade/rótulo**: em sequência sobre a voz vira chiado.

## 8. Problemas já resolvidos

| Sintoma | Causa e saída |
|---|---|
| Elemento "na frente da voz" | Whisper adiantado em lista rápida: o sincronizar mede o início no áudio; se não bastar, `ajustes` no sincronia.json |
| Cena "travando" | easing suave em cada chave da câmera → linear entre voos |
| Mapa/bandeira "tremendo" | deriva senoidal ligada ou zoom interno na bandeira → `DERIVA = 0`, bandeira parada |
| "Tá tudo borrado" | borrão radial sem teto → limite no index (`Math.min(0.85, …)`) |
| Studio travando | centenas de `<path>` com filtro de blur cada um → junte em poucos paths e um filtro por camada; memoize |
| Bandeira cortada no estado | use a versão centrada (recomposta para a caixa do contorno), não a oficial esticada |
| Satélite de perto borrado | passou do nível dos tiles (13): aproxime menos ou use imagem de alta resolução de licença aberta |
| Legenda "quebrando" nome | escreva o bloco à mão em `BLOCOS_DA_LEGENDA` |
| 60 fps com tudo no dobro da velocidade | a decupagem é em quadros de 30: use `useQuadro()` nas cenas; só sons e trilha são convertidos ×2 no index |
