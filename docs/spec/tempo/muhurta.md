# Muhurta

O que o PL9 mostra nas páginas "127. Muhurta", "128. Muhurta - dashas and balas" e "129. Muhurta
vargas" do modelo TEMPO, e como o `core` o reproduz (`computeMuhurta` em
`packages/core/src/muhurta/`). O PL9 não busca momentos: o Muhurta é a avaliação de um instante dado
(o evento "Muhurta" do mapa) para um nativo. Gabaritos: os 135 mapas de referência com o evento nas
duas datas de referência, em Jaipur (`packages/oracle/fixtures-muhurta/`).

## O instante e o lugar

Entradas explícitas: o instante (UT), o lugar e o relógio do lugar (`utcOffsetHours`, que dá o dia da
semana). Nos gabaritos: 01/01/2000 12:00 e 15/06/2030 06:00, hora de Jaipur, em Jaipur. O mapa do
Muhurta é o mesmo para todos os nativos de uma data; o que muda de um nativo para outro é o que se
conta da Lua natal e do mapa natal.

## O que vem das etapas anteriores

O mapa do Muhurta e as vargas desenhadas (D9, D10, D16, D24, D60), as posições com nakshatra e sílaba,
a dignidade, o Shadbala sobre o mínimo (SB%), a Bhava Bala e a Vimshopaka são os cálculos das etapas 3
e 4 sobre o instante do Muhurta. Os kakshas são os dos trânsitos (etapa 5A): os planetas do Muhurta no
Ashtakavarga natal; a coluna "Kaks." imprime o bindu do senhor do kaksha (0 ou 1) e o senhor. Tarabala
e Chandrabala, contados da Lua natal, e as cadeias de dasha do nativo no instante (Vimshottari, Narayana,
Yogini, Ashtottari) também são os dos trânsitos; antes do nascimento o PL9 imprime a cadeia como nos trânsitos.
Tithi, karana e yoga são os do panchanga (etapa 5B) no instante.

Dos dados:

- SB# é quantas das seis forças do Shadbala passam do seu mínimo.
- VB é a Vimshopaka do Shadvarga, arredondada à unidade (e com uma casa na página 128).
- Os doze números da página 128 são a Bhava Bala total de cada casa, escritos junto da casa.
- O "Muhurta Vimshottari" é o Vimshottari do próprio mapa do Muhurta (a partir da sua Lua): duas
  listas, em dois e em quatro níveis. A lista do Vimshottari do nativo, em quatro níveis, e as do Muhurta
  começam no período em curso na data do relógio da máquina que imprimiu (ou no primeiro, se começa
  depois); a conferência parte da primeira linha impressa.

## A Avastha

Dos dados (18 de 18 posições nos dois mapas do Muhurta; a rotina não se achou no executável): a
Baladi, em faixas de 6° do signo, na ordem infante, "Youth.", "Adoles.", velho e morto nos signos
ímpares (Áries, Gêmeos…) e na ordem inversa nos pares. O PL9 chama a segunda faixa (Kumara) de
"Youth." e a terceira (Yuva) de "Adoles."; o `core` usa os mesmos nomes (`youth`, `adolescent`). A
borda de cada faixa pertence à faixa de cima.

## O termômetro do panchang

Lido no executável. A cada elemento cabe uma nota 1 (ruim), 2 ou 3 (bom), multiplicada pelo seu peso:

- o Tarabala, peso 1 (bom: Sampat, Kshema, Sadhana, Mitra e Parama Mitra);
- o karana, peso 0,5 (ruim: Kimstughna, os oito Vishti, Shakuni, Chatushpada e Naga);
- o yoga, peso 0,5, contado do ponto Yogi — o Sol e a Lua tropicais mais 93°20′ (as longitudes
  tropicais vêm dos dados: com as siderais os 270 níveis não fecham) — ruim nas partes 1, 6, 8, 9, 10,
  13, 15, 17 e 19;
- o Chandrabala, peso 0,5 (ruim nas casas 6, 8 e 12);
- e, por atividade, a nakshatra da Lua do Muhurta (peso 1), o dia da semana e o tithi (0,5 cada), cada
  um com a sua tabela. O dia da semana é o do calendário civil no relógio do lugar (lido no
  executável), não o dia védico contado do nascer do sol do panchanga: entre a meia-noite e o nascer
  os dois diferem.

A coluna é desenhada cheia até a soma sobre 13,5, o máximo das notas. Conferência: os 270 níveis lidos
no desenho, a menos de 0,0012. Como o mapa do Muhurta é o mesmo para todos os nativos de uma data, o
yoga, o karana, o tithi, a nakshatra e o dia da semana foram vistos em dois instantes só (os 270 níveis
variam pelo Tarabala e pelo Chandrabala); a escolha das longitudes tropicais para o yoga se apoia nesses
dois instantes (2030 pede um yoga ruim, 2000 um bom).

As atividades, na ordem do PL9: geral ("General Auspicious Events"), viagem ("Travelling") e casamento
("Marriage"). A atividade é a da worksheet do Muhurta do mapa aberto: um clique no fim da linha do título
da célula passa à seguinte, e cada mapa abre com a atividade gravada. O modelo TEMPO saiu em viagem,
conferida nos 270 mapas. Geral e casamento foram impressos à parte (só a worksheet do Muhurta, o evento
em 02/07/2030 12:00 em Jaipur, um dia em que as três atividades dão notas diferentes): 30 mapas cada,
conferidos como os outros.

## O que não entra

Os textos de "Nakshatra & Tithi Activities" e a nota do termômetro (interpretações): o `core` diz a
que nakshatra e tithi os textos se referem. Mandi, "BP" e "eM" nos desenhos.

## Conferência

Na bancada (`pnpm --filter @reverse/oracle verify`, seção "Muhurta"): as 270 impressões do modelo TEMPO
(os 135 mapas nas duas datas) e as 30 de cada uma das atividades geral e casamento
(`packages/oracle/fixtures-muhurta-options/`), 0 falhas. Pendente: a VB de Rahu e de Ketu, que não é a
Vimshopaka do Shadvarga do `core` (que confere nos sete planetas).
