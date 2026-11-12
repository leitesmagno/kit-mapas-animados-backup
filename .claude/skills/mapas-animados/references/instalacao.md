# Instalação do kit

Funciona direto no **Windows (PowerShell)**, no **macOS** e no **Linux**, sem WSL. Quem roda os
comandos é você (o Claude). A pessoa só faz o que pede senha de administrador ou clique.

## 1. Conferir

```bash
npm run verificar
```

Lista com ✓/✗ o que o computador tem e o que falta do kit, com o comando de cada coisa.

## 2. O que o computador precisa ter (você instala o que faltar)

Rode os comandos você mesmo, pelo sistema detectado. No Windows, o `winget` pode pedir para aceitar
os termos (`--accept-source-agreements --accept-package-agreements` evita a pergunta). Depois de
instalar, o PATH só vale num terminal novo: avise a pessoa para fechar e abrir o Claude Code (ou,
no Windows, use o caminho completo na mesma sessão).

| Programa | Windows (PowerShell) | macOS | Linux (Ubuntu/Debian) |
|---|---|---|---|
| **Node.js LTS** | `winget install OpenJS.NodeJS.LTS` | `brew install node` | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt install -y nodejs` |
| **Python 3.9+** | `winget install Python.Python.3.12` | `brew install python` | `sudo apt install -y python3 python3-venv` |
| **FFmpeg** | `winget install Gyan.FFmpeg` | `brew install ffmpeg` | `sudo apt install -y ffmpeg` |
| **Git** (o Claude Code no Windows precisa) | `winget install Git.Git` | já vem | `sudo apt install -y git` |

- Sem `winget` no Windows: instaladores de https://nodejs.org, https://python.org (marcar **"Add
  python.exe to PATH"**) e https://www.gyan.dev/ffmpeg/builds.
- Sem Homebrew no Mac: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.
- **Depois de instalar, feche e abra o terminal** (e o Claude Code) para o PATH valer.
- Windows: se `python` abrir a Microsoft Store, desligue em Configurações → Aplicativos → Aliases
  de execução de aplicativo (python.exe e python3.exe).

## 3. Skills

As skills do kit (`mapas-animados` e `thumbnail-chamativa`) já estão em `.claude/skills/`: o Claude
Code carrega sozinho quando é aberto na pasta do kit. As skills oficiais do Remotion ajudam em
dúvidas do motor; instale na pasta do kit:

```bash
npx skills add remotion-dev/skills
```

Rode você mesmo (é interativo: use `-y`/as opções de "todas" quando a CLI oferecer; se travar,
peça para a pessoa rodar no terminal dela e marcar todas + Claude Code). Confira com `/`.

## 4. Instalar o kit

```bash
npm run instalar
```

Faz, nesta ordem (pulando o que já existe; pode rodar de novo):
1. `npm install`;
2. **Whisper local** (`venv-whisper`: faster-whisper, modelo `small` ≈ 480 MB, roda no processador);
3. **Python de imagem** (`venv-geo`: numpy, pillow, shapely);
4. **Python das imagens de IA** (`venv-imagens`: google-genai);
5. o **Chrome do Remotion**;
6. `.env` a partir do `.env.example`;
7. **trilha e efeitos** do Mixkit (`npm run sons`);
8. **satélite dos dois exemplos** (`npm run tiles -- …`, alguns minutos).

Os Python do kit rodam sempre por `node scripts/py.mjs <venv> …` (ou pelos `npm run`), que acha
o executável certo em cada sistema. Nunca escreva caminho de venv à mão.

## 5. Erros comuns

| Sintoma | Saída |
|---|---|
| `'node'`/`'ffmpeg'`/`'python'` não é reconhecido | instalou mas não reabriu o terminal; feche e abra (no Windows, às vezes reiniciar) |
| `npm` bloqueado no PowerShell ("execução de scripts desabilitada") | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e confirme |
| `fetch failed` no satélite | rede instável: rode `npm run tiles -- <pasta>` de novo, ele continua |
| `ensurepip is not available` (Linux) | `sudo apt install -y python3-venv` |
| Studio em branco | use o Chrome em http://localhost:3000 |
| Render sem memória | `NUCLEOS=2 npm run render -- <Composicao>` (no PowerShell: `$env:NUCLEOS=2; npm run render -- …`) |

## 6. Chaves (opcionais)

Só no `.env` (nunca no código, em `public/` ou repetidas na conversa):
- `ELEVENLABS_API_KEY` — voz por IA (elevenlabs.io → Profile → API Keys, permissão "Text to Speech").
- `GEMINI_API_KEY` — imagens de apoio e camadas de thumbnail (aistudio.google.com/apikey).

Peça para a pessoa colar a chave no `.env` ela mesma; se mandar na conversa, grave e não repita.
