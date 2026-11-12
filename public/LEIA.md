Tudo o que o vídeo lê na hora do render mora aqui (o render não usa internet):

  marca/                   a sua logo
  assets/<vídeo>/          as fotos de cada vídeo (troque pondo um arquivo com o MESMO nome)
  assets/bandeiras/        bandeiras oficiais (UFs e países)
  assets/icones-3d/        ícones 3D (Fluent Emoji, MIT)
  audios/narracao/<vídeo>/ a narração, um mp3 por fala (<id>.mp3)
  audio/                   trilha e efeitos (baixados por `npm run sons`)
  satelite/<vídeo>/        o satélite que a câmera vê (baixado por `npm run tiles -- <vídeo>`)
  imagens-ia/<vídeo>/      imagens de apoio geradas (documentário) — no exemplo, quadros "IMAGEM DE APOIO"
