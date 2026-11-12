# Kit Mapas Animados: instruções para o Claude

Estúdio de vídeos de mapa em Remotion (vertical 9:16 e documentário 16:9): mapa SVG (d3-geo) sobre
satélite, dados oficiais, fotos em cartão e narração sincronizada palavra a palavra pelo Whisper.
**Quem usa geralmente não é programador**: você roda os comandos, edita os arquivos e mostra o
resultado no Studio; a pessoa conversa, aprova, troca fotos e renderiza.

**Use a skill `mapas-animados` para tudo** (instalar, configurar, vídeo novo, trocar imagens). A
skill `thumbnail-chamativa` faz as capas.

## Toda conversa nova
1. `npm run verificar`. Faltou algo → skill `mapas-animados`, `references/instalacao.md`.
2. `marca.json` com `"configurado": false` → configure primeiro (`references/configuracao.md`).

## Regras fixas
- **A marca da pessoa vem do `marca.json`** (canal, marca d'água, logo, cores, voz, trilha). Nada
  de marca escrita no código.
- **Pesquise e confira os dados antes do roteiro** (IBGE, TSE, fonte oficial); cada afirmação vai no
  `DATA_SOURCES.md` do vídeo. **Mostre o roteiro e espere a aprovação** antes da voz.
- **Voz**: gravada pela pessoa ou ElevenLabs, como está no `marca.json`. Não gere voz por IA sem a
  pessoa aprovar o texto.
- **Uma cena por vez** (mostre no Studio e espere o ok), salvo se a pessoa pedir tudo de uma vez.
- **Sem créditos/fontes na tela**: vão no `CREDITOS-<pasta>.md` (descrição do post). Texto mínimo no vídeo.
- **Render só quando a pessoa pedir** (`npm run render -- <Composicao>`); demora e pesa a máquina.
- **Chaves só no `.env`**: nunca no código, em `public/` ou repetidas na conversa.
- **O render é offline**: tudo o que o vídeo lê está em `public/` (satélite, fotos, sons), baixado
  antes por `npm run tiles`, `npm run dados`, `npm run sons`.
- **Licenças**: fotos de fontes livres (Wikimedia Commons) com crédito; satélite NASA + EOxCloudless
  2016 (CC BY 4.0) ou CBERS-4A (INPE, CC BY) — nunca Esri/Google; bandeira nunca por IA; a IA de
  imagem nunca faz texto, mapa, bandeira nem pessoa real.
- Textos, comentários e nomes em português, como o resto do código. `npm run typecheck` antes de entregar.

## Onde fica cada coisa
- `src/videos/exemplo-vertical/` — o MOLDE do Short ("Amazonas", 60 fps): copie para um vídeo novo.
- `src/videos/exemplo-horizontal/` — o MOLDE do documentário ("Estreito de Ormuz", cenas declarativas).
- `src/kit/` — as peças visuais (catálogo no `ESTILO.md` §4); peça nova e reutilizável vai para cá.
- `src/base/` — câmera, projeção, satélite e camadas base do mapa. `src/motor/` — formato, projeto, documentário.
- `src/Root.tsx` — o catálogo do Studio (uma linha por vídeo).
- `scripts/` — `instalar.mjs`, `sincronizar.py`, `narrar.ts`, `tiles.ts`, `dados-*.py`, `fotos.py`,
  `folha.mjs`, `render.mjs`, `sons.mjs`, `py.mjs` (roda Python do kit), `imagens/` (Gemini), `thumb/`,
  `mapas/` (IBGE/OSM). Tudo funciona igual no Windows (PowerShell), macOS e Linux: nunca escreva
  comando com caminho de venv (`bin/python`); use `node scripts/py.mjs <venv> …` ou os `npm run`.
- `public/` — satélite (`satelite/`), fotos (`assets/<pasta>/`), bandeiras, ícones 3D, sons, narração.

## Comandos
| | |
|---|---|
| `npm run dev` | abre o Studio no navegador (http://localhost:3000) |
| `npm run dados -- <pasta>` | malhas e dados do vídeo (scripts/dados-<pasta>.py) |
| `npm run voz -- <pasta>` | a voz gravada: pega o que está em `minha-voz/`, corta por fala e sincroniza |
| `npm run narrar -- <pasta>` | voz pela ElevenLabs (opcional) |
| `npm run sincronizar -- <pasta>` | Whisper → eventos da narração (rode sempre que a voz mudar) |
| `npm run fotos -- <pasta>` | mede as fotos depois de trocar |
| `npm run tiles -- <pasta>` | satélite que a câmera vê (rode sempre que a câmera mudar) |
| `npm run folha -- <Composicao>` | folha de contato (um quadro por segundo) |
| `npm run render -- <Composicao>` | o MP4 final em out/ |
| `npm run imagens -- …` / `npm run thumb -- <pasta>` / `npm run publicacao -- <pasta>` | imagens de IA, thumbnails, materiais do YouTube |
