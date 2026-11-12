# Áudio do estilo Mapas Animados

## 1. Voz

| | Medido |
|---|---|
| Narrador | masculino, registro médio-grave: F0 mediano **123–152 Hz** (p10 ~105, p90 ~155–205) |
| Entonação | estável, de documentário: variação de altura pequena; os vídeos de ficha/mistério (ref. 02, ref. 04, ref. 08) são um pouco mais expressivos |
| Velocidade | **120–157 palavras/min**, média 139 (fala corrida, firme, sem pressa nem euforia) |
| Timbre | limpo, sem ambiente de sala, comprimido e "na cara" (característico de TTS de alta qualidade ou de voz gravada e tratada) |
| Pronúncia | nomes estrangeiros aportuguesados ("Iacútia", "Iakutsk", "Oimiakon") |

No kit: a voz é **da pessoa** (gravada) ou ElevenLabs, como está no `marca.json`. Para chegar perto do canal no ElevenLabs: voz masculina pt-BR de narração,
estabilidade alta (~0,6–0,7), estilo baixo (0–0,15), velocidade 1,05–1,1. Na gravação:
ler de pé, ritmo constante, terminar as frases sem cair o tom.

## 2. Edição da fala

- **A voz começa no quadro 0.** Nada de silêncio inicial.
- **Pausas cortadas**: entre frases e vírgulas sobram só **0,2–0,35 s** (mediana medida
  0,17–0,34 s; máximo 0,44–0,80 s). Cada vídeo tem 18–31 pausas, somando 4,6–8,7 s.
  Pausa maior que 0,6 s só antes da virada ("Mas existe um detalhe.").
- No projeto: `python3 scripts/pausas.py entrada.wav saida.wav 0.4` (pausa máxima de
  0,4 s; ele detecta silêncios a partir de 0,3 s e nivela em −16 LUFS) **antes** de
  sincronizar, e só então `npm run sincronizar -- <pasta>`. Para chegar nos −14 LUFS do canal,
  ajustar o alvo do loudnorm no fim (ou subir 2 dB na `Mixagem`).

## 3. Trilha e efeitos

- **Nos vídeos de referência, sem música de fundo.** Nos espectrogramas, as pausas são silêncio digital (abaixo de
  −100 dB) em todos os 10 vídeos. É uma escolha do canal: o vídeo soa como "documentário
  falado", e a voz nunca briga com a trilha.
- **Efeitos raros**: um whoosh/impacto de banda larga no gancho (primeiros 0,2–1 s) e em
  1–3 mergulhos/recuos grandes por vídeo. Nada de "pop" em cada rótulo, nada de clique de
  digitação.
- O padrão do kit é trilha bem baixa por baixo da voz (`"trilha": true` no `marca.json`): a
  `Mixagem` do kit com a música a ~−30 LUFS sob a voz e ducking forte. Sem trilha: `"trilha": false`.

## 4. Master

- Loudness integrado medido: **−13,3 a −15,1 LUFS** (média −14,1). Alvo: **−14 LUFS**,
  pico real ≤ −1 dBTP.
- Áudio 48 kHz estéreo (a voz é mono duplicada).
