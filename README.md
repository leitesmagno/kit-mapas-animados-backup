# Kit Mapas Animados

Vídeos de mapa animados, prontos para postar, feitos **conversando com o Claude Code**:
Shorts/Reels/TikTok (9:16) e documentários para o YouTube (16:9). Você diz o tema, o Claude
pesquisa os dados, escreve o roteiro, monta as cenas e te mostra. Você aprova, troca as fotos,
grava (ou gera) a voz e renderiza.

- Satélite de verdade, claro e bonito (NASA + Sentinel-2, licenças abertas)
- Estado com a bandeira dentro, divisas com bandeiras, pinos, nomes e números digitados
- Fotos em cartão, mergulhos de câmera com borrão, textos de impacto
- Legenda karaokê sincronizada palavra a palavra com a sua voz (Whisper, no seu computador)
- A sua marca (marca d'água, logo, cores) em todos os vídeos

## Comece aqui

O passo a passo ilustrado está em **`docs/Guia-Kit-Mapas-Animados.pdf`**.

1. **Instale os programas** (Node.js, Python, FFmpeg; no Windows também o Git) e o **Claude Code**
   (app ou terminal; precisa do plano Pro do Claude). Funciona no Windows (PowerShell), Mac e Linux.
2. Diga: **"instala e configura o kit"**.
   O Claude confere o que falta no seu computador (Node.js, FFmpeg, Python), instala o kit, baixa
   os sons e o satélite dos exemplos e te faz algumas perguntas: nome do canal, @, logo, cor da
   legenda, voz (gravada ou ElevenLabs) e trilha.
3. Diga: **"abre o estúdio"** e veja os dois exemplos (o vertical "Amazonas" e o documentário
   "Estreito de Ormuz"). Eles vêm sem voz e com fotos "TROQUE ESTA FOTO" no lugar das imagens.
4. Peça o seu primeiro vídeo: **"faz um vídeo sobre o Pará"**.

## Pedidos que funcionam

| Você diz | O Claude faz |
|---|---|
| "faz um vídeo sobre a Chapada Diamantina" | pesquisa, roteiro para você aprovar, depois as cenas |
| "pus minhas fotos na pasta" / "troca a foto da cena 3" | encaixa as fotos sem cortar |
| "gravei a narração" | sincroniza a voz e o vídeo inteiro se ajusta |
| "muda a cor da legenda para verde" | atualiza a sua marca |
| "faz a thumbnail" | capa chamativa por camadas |
| "renderiza" | gera o MP4 em `out/` |

## Onde ficam as coisas

| Pasta | O que é |
|---|---|
| `marca.json` | a sua marca (o Claude preenche) |
| `public/marca/` | a sua logo |
| `public/assets/<vídeo>/` | as fotos de cada vídeo |
| `public/audios/narracao/<vídeo>/` | a sua narração (um arquivo por fala) |
| `out/` | os vídeos prontos |
| `src/videos/` | cada vídeo é uma pasta (o Claude cuida) |

## Requisitos

Computador com 8 GB de RAM ou mais (16 GB recomendado para renderizar), ~5 GB livres, internet
na instalação e para baixar satélite/dados de cada vídeo. Windows 10/11, macOS ou Linux.
Contas opcionais: ElevenLabs (voz por IA) e Google AI Studio (imagens de IA).

## Licenças

O código do kit é para uso de quem comprou (veja `LICENCAS.md`). Os vídeos que você faz são seus.
Satélite, sons, ícones e dados de terceiros têm as licenças listadas em `LICENCAS.md` — o Claude
monta os créditos de cada vídeo no `CREDITOS-<vídeo>.md` para você colar na descrição.
