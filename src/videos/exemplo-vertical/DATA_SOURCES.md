# Amazonas (v31): fontes de cada afirmação

Conferido em 2026-10-23.

| Fala | Afirmação | Fonte |
|---|---|---|
| am-01 | O Amazonas é o maior rio do mundo em volume; não há ponte sobre o Solimões/Amazonas (a Ponte Rio Negro, de 2011, cruza o Negro) | ANA; DNIT |
| am-02 | Maior estado do Brasil: 1.559.255 km² (1.566.118 km² pelo contorno da malha) | IBGE, áreas territoriais; dados/am.json |
| am-03 | Região Norte; divisa com RR, PA, MT, RO e AC; fronteira com Venezuela, Colômbia e Peru | IBGE, malha estadual; Natural Earth |
| am-04 | 62 municípios; 4.360.926 habitantes ("mais de quatro milhões", estimativa 2026); Manaus 2.327.101 (53,4%: "metade"); a maior cidade do Norte | IBGE, API de localidades; SIDRA 6579 (dados/cidades.json) |
| am-05 | Acesso a Manaus quase só por avião ou barco; BR-319 com 886 km (Manaus–Porto Velho, medida no OSM) e o "trecho do meio" de ~405 km sem asfalto (km 250–655) | DNIT; OSM (dados/br319.json) |
| am-06 | Ciclo da borracha (1879–1912); Manaus "Paris dos Trópicos"; Teatro Amazonas (inaugurado em 1896) com materiais trazidos da Europa | IPHAN; Governo do Amazonas (Teatro Amazonas) |
| am-07 | Henry Wickham levou ~70 mil sementes de seringueira (1876) para Kew (Londres); as mudas foram para as colônias britânicas na Ásia (Ceilão, Malásia), cuja borracha derrubou o preço da amazônica | Kew Royal Botanic Gardens; bibliografia do ciclo da borracha |
| am-08 | Zona Franca de Manaus (Decreto-Lei 288/1967); a produção de motos do país fica quase toda no Polo Industrial de Manaus (1.748.317 motos em 2024) | Suframa; Abraciclo |
| am-09 | Mercado Municipal Adolpho Lisboa (1883); Praia da Ponta Negra | IPHAN; OSM |
| am-10 | Encontro das Águas: o Negro (escuro) e o Solimões (barrento) correm lado a lado por quilômetros antes de se misturar e formar o Amazonas | IPHAN (tombamento de 2010) |
| am-12 | Lago do Janauari (Iranduba, em frente a Manaus); a folha da vitória-régia passa de 2 m (até ~2,5 m) | ICMBio; OSM |
| am-13 | Anavilhanas: cerca de 400 ilhas (Parque Nacional, ~3.500 km²), em Novo Airão, com botos | ICMBio |
| am-14 | Presidente Figueiredo: mais de 100 cachoeiras; Cachoeira do Santuário e Caverna do Maroaga | Prefeitura de Presidente Figueiredo; OSM |
| am-15 | Parintins, na Ilha Tupinambarana; o Festival Folclórico (Bumbódromo) entre Garantido e Caprichoso | Governo do Amazonas; OSM |
| am-16 | Maués, a terra do guaraná; os Sateré-Mawé domesticaram o guaraná; a lenda: o guaraná nasceu dos olhos de um menino ("para os Sateré-Mawé") | ISA (Povos Indígenas no Brasil: Sateré-Mawé) |
| am-17 | 490.854 indígenas, a maior população indígena entre as UFs; o Vale do Javari (85.444 km²) tem povos isolados | IBGE, Censo 2022; FUNAI |
| am-18 | Pico da Neblina, 2.995,30 m, o ponto mais alto do Brasil, na fronteira com a Venezuela | IBGE (2016) |

## Geometrias no mapa
- O Amazonas e os 62 municípios: IBGE, malha intermediária (`npm run dados -- exemplo-vertical`).
- O Rio Amazonas (do Peru até perto da foz) e os afluentes: Natural Earth 10m (traçado aproximado; some de perto).
- BR-319 (Overpass), Parque Nacional de Anavilhanas (rel. 3425635) e TI Vale do Javari (rel. 3816970): © OpenStreetMap contributors (ODbL).
- As rotas das sementes (Manaus → Kew → Kuala Lumpur) em grande círculo: ilustrativas.
- A bandeira do Amazonas centrada no estado: scripts/bandeira-estado.py.

## Fotos
no kit, as fotos são quadros "TROQUE ESTA FOTO" (`public/assets/exemplo-vertical/`); as suas, com autor e licença, vão no CREDITOS-<pasta>.md (descrição, nunca na tela).
