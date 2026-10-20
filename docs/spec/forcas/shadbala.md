# Shadbala

Código: `packages/core/src/strengths/shadbala/` (`sthana.ts`, `kala.ts`,
`day.ts`, `cheshta.ts`, `index.ts`) e `strengths/compute.ts`
(`computeShadbala`, `shadbalaInputs`). Testes:
`packages/core/test/shadbala.test.ts`. Aspectos: `aspectos.md`.

As regras foram lidas no executável do PL9 e conferidas no relatório "Shad Bala
and Bhava Bala" dos mapas da bancada, com as opções padrão (abaixo). O modo
`corrected` difere em três pontos: a Lua nos três primeiros graus de Touro, o
dia além de 65° de latitude e o Cheshta fora das séries (`docs/spec/correcoes.md`,
19 a 21). Valores
em virupas (shashtiamshas); 60 virupas são um rupa.

## Sthana Bala

- **Uchcha**: a distância do planeta ao seu ponto de debilidade, dividida por
  3. Pontos: Sol 190°, Lua 213°, Marte 118°, Mercúrio 345°, Júpiter 275°,
  Vênus 177°, Saturno 20°.
- **Saptavargaja**: nas sete vargas D1, D2, D3, D7, D9, D12 e D30 (as do
  PL9), pelo senhor do signo em que o planeta cai:
  - signo próprio: 30; no D1, 45 dentro do moolatrikona (limites estritos:
    Sol Leão 0–20°, Lua Touro 3–30°, Marte Áries 0–12°, Mercúrio Virgem
    15–20°, Júpiter Sagitário 0–10°, Vênus Libra 0–15°, Saturno Aquário
    0–20°);
  - a Lua em Touro no D1: 45 depois de 3°, **0** nos três primeiros graus
    (assim no PL9);
  - nos outros casos, pela relação composta com o senhor (natural somada à
    temporária, esta pelos signos do D1): 22,5, 15, 7,5, 3,75 e 1,875, de
    grande amigo a grande inimigo.
- **Ojhayugma**: 15 no D1 e 15 no D9 quando o signo é ímpar (par para a Lua e
  Vênus).
- **Kendradi**: 60 em kendra do signo do Lagna, 30 em panaphara, 15 em
  apoklima.
- **Drekkana**: 15 no decanato do seu gênero: o primeiro para Sol, Marte e
  Júpiter; com "Parashara", o segundo para Mercúrio e Saturno e o terceiro
  para a Lua e Vênus; com "Hora Ratnam", o inverso.

## Dig Bala

A distância ao ponto onde o planeta é mais fraco, dividida por 3. Os pontos:
para o Sol e Marte, o meio da 4ª casa (Sripati); para a Lua e Vênus, o da 10ª;
para Mercúrio e Júpiter, o da 7ª; para Saturno, o da 1ª. Com a opção "kendras",
o Lagna mais 90° e menos 90° em vez dos meios da 4ª e da 10ª.

## Kala Bala

Soma de Nathonnatha, Paksha, Tribhaga, Varsha, Masa, Vara, Hora e Ayana. O
Yuddha sai na mesma tabela mas **não** entra na soma.

### O dia do Shadbala

O PL9 conta o dia do Shadbala por um nascer e um pôr do sol próprios, que não
são os do Gulika:

- o nascer é o instante em que o Lagna alcança o Sol; o pôr, em que o ponto
  oposto ao Lagna o alcança — o Sol tomado no seu lugar do nascimento e
  andando um grau por dia;
- o primeiro palpite do nascer é o nascimento mais o arco do Lagna ao Sol
  sobre 360, menos um dia (o nascer anterior); o do pôr, esse palpite mais
  meio dia;
- cada um é achado por secantes, a primeira inclinação de 360° por dia, até
  a diferença ficar abaixo de um milésimo de grau, em no máximo nove passos;
  no pôr, o ponto oposto e a inclinação em precisão simples;
- além de 65° de latitude, norte ou sul, a latitude é tomada como 60° norte
  (também no hemisfério sul); entre
  60° e 65°, a primeira inclinação, e as dos passos 2 e 3, são multiplicadas
  por 4;
- é noite quando o Sol está a menos de 180° à frente do Lagna.

### As partes

- **Nathonnatha**: meia-noite = (nascer + pôr) / 2 + (1 + 1/365,25) / 2. Com
  `d` = (nascimento − meia-noite) × 360, levado a 0–360, a força de noite é
  |d − 180| / 3; a Lua, Marte e Saturno a recebem, o Sol, Júpiter e Vênus o
  complemento a 60; Mercúrio, sempre 60.
- **Paksha**: a distância da Lua ao Sol, dividida por 3, para os benéficos; o
  complemento a 60 para o Sol, Marte, Saturno e Mercúrio quando maléfico
  (Mercúrio é maléfico no signo do Sol, Marte, Saturno, Rahu ou Ketu; com a
  opção "benefic", nunca).
- **Tribhaga**: 60 ao senhor do terço do dia (Mercúrio, Sol, Saturno) ou da
  noite (Lua, Vênus, Marte) em que cai o nascimento; Júpiter, sempre 60.
- **Varsha, Masa, Vara e Hora**: 15, 30, 45 e 60 aos senhores do ano, do mês,
  do dia e da hora. Os dias são contados do dia juliano
  2380557,5 até o instante local (o dia juliano mais a longitude / 360), um a
  menos quando se nasce de noite antes do meio-dia local (fração do dia local
  abaixo de meio); o ano tem 360 dias e o mês 30. Com dia da semana numerado de
  1 (domingo) a 7: o do ano é o de (⌊dias / 360⌋ × 3 + 1), o do mês o de
  (⌊dias / 30⌋ × 2 + 1), o do dia o de (dias mod 7), e o da hora o do dia mais
  5 por hora inteira desde o nascer.
- **Ayana**: ((d + 23,45) / 46,9) × 60, com a declinação d tomada como
  23,45 × sen(longitude tropical) (a latitude não entra); invertida para a Lua
  e Saturno; para Mercúrio, |d|. A longitude tropical é a verdadeira (com
  nutação), no instante em que o PL9 avalia a efeméride (o seu ΔT), como a
  do Sol no Ishta e as latitudes da guerra.

## Cheshta Bala

- O do Sol é o seu Ayana; o da Lua, o seu Paksha.
- De Marte a Saturno, o PL9 toma os instantes de cada ciclo de movimento de
  séries aproximadas do seu próprio código: o "zero" e o "topo" de cada ciclo,
  dias julianos em função do número inteiro `k` do ciclo (abaixo).
- O ciclo: `i` é o primeiro índice com zero(i) não anterior ao nascimento; o
  topo é o de índice `i` (Marte) ou `i − 1` (os outros, se `i > 0`); se o
  nascimento é antes do topo, vale o zero `i − 1`, senão o zero `i`.
- A estação: a partir do topo menos (antes do topo) ou mais (depois) uma
  distância por planeta (Marte 30 dias, Mercúrio 10, Júpiter 55, Vênus 21,
  Saturno 60), um dia de cada vez na direção em que o movimento leva, até o
  sinal da velocidade mudar, em **no máximo 12 olhadas**; vale a longitude da
  última. A velocidade cujo sinal se lê é a verdadeira (com a nutação); perto
  da estação ela pode ter sinal diferente da velocidade sem nutação.
- As longitudes (siderais) de zero `la`, topo `lb`, estação `ls` e nascimento
  `lc` são as da carta, calculadas como as posições do mapa. Com
  orientado(x, y) = (y − x) mod 360 e mínimo a menor distância:
  - se o zero vem depois do topo: direto = orientado(ls, la) e
    parcial = orientado(lc, la); senão, orientado(la, ls) e orientado(la, lc);
  - total = direto + mínimo(lb, ls); parcial acima de 300 vira 360 − parcial;
  - planeta retrógrado (velocidade ≤ 0) no nascimento: parcial = direto +
    mínimo(lc, ls);
  - Cheshta = 60 × min(parcial, total) / total.

As séries (u em radianos):

| Planeta | zero(k) | topo(k) | último k |
|---|---|---|---|
| Marte | 2380725 + 779,9307k + 8,3717 + 17,4314 sen(0,8549k) − 10,8387 cos(0,8549k) | 2380350 + 779,9449k − 7,9668 − 19,0764 sen(0,8549k) + 16,1501 cos(0,8549k) | 113 |
| Mercúrio | 2380632 + 115,8775k + 4,5231 + a sen(0,09973k) + b cos(0,09973k) | 2380691 + 115,8776k + 3,5036 + c sen(0,09973k) + d cos(0,09973k) | 766 |
| Júpiter | 2380665 + 398,8825k + 4,8226 − 3,5836 sen(0,57776k) − 5,5003 cos(0,57776k) | 2380863 + 398,8815k + 6,1374 + 1,3601 sen(0,5791k) − 6,2723 cos(0,5791k) | 222 |
| Vênus | 2380469 + 583,9214k − 3,1004 | 2380760 + 583,9210k − 2,1953 | 152 |
| Saturno | 2380607 + 378,0963k − 8,5965 − 1,4827 sen(0,2209k) + 8,3813 cos(0,2209k) | 2380792 + 378,0954k − 4,4261 − 3,2208 sen(0,21726k) + 2,9859 cos(0,21726k) | 235 |

Mercúrio, por k mod 3 = 0, 1, 2: (a, b, c, d) = (−4,363, −6,4117, 6,6144,
−0,7605), (−3,2831, 6,9952, −3,9994, −5,4142), (7,6603, −0,6195, −2,68848,
6,1661).

**Fora das séries** (nascimentos antes de cerca de 1806 ou depois de cerca de
2045, conforme o planeta), o índice cai fora e o PL9 toma a data 0, que a sua
efeméride não calcula: o valor que ele imprime não é reproduzível. O `core`
devolve um número — com a posição zerada antes das séries, e 0 depois delas,
onde não sobra arco algum — e lista os planetas em `cheshtaOutsideSeries`;
esses mapas não são conferidos. No modo `corrected`, as séries continuam
adiante e o Cheshta desses mapas é calculado (`docs/spec/correcoes.md`, 21).

## Naisargika

60 × (1; 0,857; 0,286; 0,429; 0,571; 0,714; 0,143) para Sol, Lua, Marte,
Mercúrio, Júpiter, Vênus e Saturno.

## Drik Bala

Os aspectos graduados (`aspectos.md`) dos outros seis planetas sobre o planeta,
somados os dos benéficos e subtraídos os dos maléficos, cada um com um quarto
do seu valor; os de Júpiter e Mercúrio inteiros (opção "full"; com "quarter",
um quarto também). Benéficos: Júpiter, Vênus, a Lua crescente (a menos de 180°
à frente do Sol) e Mercúrio, salvo quando maléfico pela regra do Paksha (opção
própria do Drik). Pode ser negativo, e o total também.

## Total, classificação e Ishta/Kashta

- Total = Sthana + Dig + Kala + Cheshta + Naisargika + Drik; rupas = total / 60.
- Mínimos: Sol 390, Lua 360, Marte 300, Mercúrio 420, Júpiter 390, Vênus 330,
  Saturno 300; razão = total / mínimo.
- Classificação: 1 para a maior razão, como o PL9 a guarda na memória e como a
  dá a sua chave de relatório de classificação. **Pendente**: a página impressa
  classifica a razão arredondada a duas casas, e quando duas razões empatam
  assim desempata por uma regra ainda não achada; o `core` segue a razão exata.
- Forças fortes: quantas de Sthana, Dig, Kala, Ayana e Cheshta alcançam o
  mínimo do grupo do planeta (Sol, Júpiter e Mercúrio; Lua e Vênus; Marte e
  Saturno): Sthana 165/133/96, Dig 35/50/30, Kala 112/100/67, Ayana
  30/40/20, Cheshta 50/30/40.
- Ishta = (distância ao ponto de debilidade + kendra do movimento) / 6, o
  kendra sendo, para o Sol, a longitude tropical do Sol mais 90° dobrada a
  0–180; para a Lua, a sua distância ao Sol; para os outros, 3 × Cheshta
  dobrado a 0–180. Kashta = 60 − Ishta.

## Guerra planetária

Para cada um de Marte a Saturno, o último dos outros (na ordem Marte, Mercúrio,
Júpiter, Vênus, Saturno) a menos de 1° dele é o adversário. Vence quem está mais
ao norte (maior latitude eclíptica), mas Vênus sempre vence. O Yuddha é a
diferença dos totais, positivo para o vencedor e negativo para o vencido.

## Opções

| Opção do PL9 | Valores (`ShadbalaOptions`) | Padrão |
|---|---|---|
| Drekkana Bala method | `drekkana`: `parashara`, `horaRatnam` | `parashara` |
| 4th/10th house in Dig bala | `digBala`: `cusps`, `kendras` | `cusps` |
| Mercury's nature for Paksha Bala | `mercuryPaksha`: `withMalefics`, `benefic` | `withMalefics` |
| Mercury nature in Drig bala | `mercuryDrik`: `withMalefics`, `benefic` | `withMalefics` |
| Jup & Merc in Drig bala | `jupiterMercuryDrik`: `full`, `quarter` | `full` |

## Conferência

`pnpm --filter @reverse/oracle verify`, seção "Shadbala":

- cada parte impressa de cada planeta a meio centésimo do PL9 (mais 1e-5, o
  erro do `core` medido na memória), mínimos e forças fortes iguais;
- a classificação, igual, salvo onde a razão impressa empata com a de outro
  planeta: aí, listada à parte como pendente;
- os mapas fora das séries do Cheshta, listados e não conferidos;
- cada alternativa das cinco opções, impressa no PL9 em 30 mapas que ela
  afeta (`fixtures-shadbala-options/<opção>-<valor>`), com a mesma tolerância;
  falta de um conjunto é falha;
- a tabela lida da memória do PL9 em execução em 11 mapas (`fixtures-shadbala-memory`),
  cada parte a 1e-4; o maior
  desvio medido foi 1e-5.
