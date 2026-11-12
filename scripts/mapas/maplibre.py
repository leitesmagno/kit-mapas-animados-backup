"""O worker do MapLibre em public/ — o que mantém o render offline.

O MapLibre 6 é só-ESM e carrega o worker de um arquivo à parte, que por sua vez importa
./maplibre-gl-shared.mjs. Os dois vão para public/maplibre/, e o componente aponta para lá
com staticFile. Sem isso, o jeito "padrão" é puxar o worker de uma CDN — e aí o render
depende de internet, que é exatamente o que este projeto não faz.
"""
import os
import shutil

from .comum import PUBLICO, RAIZ


def copiar_worker():
    destino = os.path.join(PUBLICO, "maplibre")
    os.makedirs(destino, exist_ok=True)
    origem = os.path.join(RAIZ, "node_modules", "maplibre-gl", "dist")
    for f in ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]:
        shutil.copy(os.path.join(origem, f), destino)
    print("MapLibre · worker copiado para public/maplibre/")
