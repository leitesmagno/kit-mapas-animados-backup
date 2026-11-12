# Configuração (a primeira conversa)

Quando o `marca.json` tem `"configurado": false`, configure ANTES do primeiro vídeo. Use o
**AskUserQuestion** (até 4 perguntas por vez, opções curtas, a recomendada primeiro) — a pessoa
responde clicando. Duas rodadas bastam.

## Rodada 1 — a identidade

1. **Nome do canal** e o **@** (texto livre → opção "Other"). Ex.: "GEO CURIOSO" e "@geocurioso".
2. **Marca d'água no vertical**: "Texto: NOME | @arroba" (recomendado) · "Minha logo (imagem)" · "Sem marca d'água".
3. **Logo**: "Tenho uma logo (vou pôr na pasta)" · "Ainda não tenho". Se tem: peça para pôr o
   arquivo em `public/marca/` (PNG com fundo transparente é o ideal) e diga o caminho exato da
   pasta. Depois prepare você mesmo (ver §Logo).
4. **Formato principal**: "Vertical (Shorts/Reels/TikTok)" · "Horizontal (YouTube longo)" · "Os dois".

## Rodada 2 — o som e a cor

1. **Voz**: "Vou gravar minha voz" · "ElevenLabs (voz por IA; o plano grátis dá 10 mil créditos/mês,
   para monetizar é preciso um plano pago)". Gravada: explique a pasta `minha-voz/`. Se ElevenLabs: peça a chave
   para o `.env` e a voz (o ID da voz na biblioteca da ElevenLabs; sem preferência = "Roger",
   `CwhRBWXzGAHq8TQ4Fs17`, a do exemplo).
2. **Cor da palavra falada na legenda**: "Amarelo (#FFD23F)" (recomendado) · "Verde-limão (#B6FF3B)" ·
   "Ciano (#3BE8FF)" · "Laranja (#FF9F1C)". (Ou a cor da marca dela, em hex.)
3. **Trilha de fundo**: "Sim, bem baixinha" (recomendado) · "Sem música, só a voz".
4. **Imagens de IA (Gemini)** para documentário e thumbnail: "Quero usar" (pede a chave) · "Agora não".

## Gravar no marca.json

```json
{
  "configurado": true,
  "canal": "GEO CURIOSO",
  "arroba": "@geocurioso",
  "marcaDagua": { "usar": "texto", "texto": "GEO CURIOSO | @geocurioso", "imagem": "", "larguraDaImagem": 170, "opacidade": 0.4 },
  "logoRedonda": "marca/logo-redonda.png",
  "cores": { "palavraFalada": "#FFD23F", "destaque": "#F2B45A" },
  "legenda": { "fonte": "Poppins", "peso": 800, "corpo": 42, "y": 1748 },
  "voz": { "tipo": "elevenlabs", "elevenlabsVozId": "CwhRBWXzGAHq8TQ4Fs17", "elevenlabsVozNome": "Roger" },
  "trilha": true,
  "formatoPadrao": "vertical"
}
```

- `marcaDagua.usar`: `"texto"` (o `|` vira um fio fino entre o nome e o @), `"imagem"` (a logo em
  `marcaDagua.imagem`, com `larguraDaImagem` em px) ou `"nenhuma"`.
- `logoRedonda`: o selo do horizontal (canto inferior direito) e da thumbnail. Vazio = sem selo.
- Quem lê: `src/marca.ts` → `MarcaDagua`, `LogoDoCanal`, a logo das thumbnails, a legenda e a voz
  (`projeto.ts` de cada vídeo). Mudou o `marca.json`, o Studio atualiza sozinho.

## Logo

A pessoa põe o arquivo em `public/marca/` com qualquer nome. Você:
1. confere o tamanho e se tem fundo transparente (PNG com alfa);
2. faz a **versão redonda** para o selo (`public/marca/logo-redonda.png`, 512×512, fundo
   transparente):
   ```bash
   node scripts/py.mjs venv-geo scripts/logo.py public/marca/<arquivo>
   ```
   (Se a logo já é redonda ou é um símbolo que não pode ser cortado, use-a como está.)
3. se a marca d'água for de imagem, aponte `marcaDagua.imagem` para a logo original.

## Depois de configurar

- Mostre o resultado: abra o Studio (`npm run dev`) no `ExemploVertical` — a marca d'água e a
  cor da legenda já aparecem nele.
- Diga em 2–3 linhas como pedir o primeiro vídeo ("é só dizer: faz um vídeo sobre o Pará").
- Para mudar depois, a pessoa só pede ("troca a cor da legenda para verde"): edite o `marca.json`.
