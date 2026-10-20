# Trânsitos (etapa 5A)

O que o PL9 mostra dos trânsitos sobre um mapa natal, como o `core` o calcula
(`packages/core/src/transits/`) e de onde vem cada regra. Gabaritos: os PDFs TEMPO
(`packages/oracle/fixtures-transits/`), sobre as cópias dos mapas de referência com o
nascimento arredondado ao segundo (`packages/oracle/refset-tempo.json`).

## O segundo instante

O mapa de trânsito "agora" do PL9 toma o relógio da máquina como hora local do lugar
padrão da instalação (Jaipur, 26N55'00, 75E49'40, fuso −5:30) e calcula o Ascendente e as
casas nesse lugar, não no de nascimento (lido no executável). O `core` nunca usa o relógio:
`computeTransits(eph, natal, at)` recebe o instante em UT e o lugar em `at`
(`TransitInstant`); a linha de comando converte a hora local de Jaipur.

## Posições

As do mapa no instante e no lugar do trânsito, como em `computePositions`: os nove
planetas e o Ascendente, com signo, nakshatra e a marca de retrógrado (os nós nunca
marcados). O PL9 imprime graus, minutos e segundos truncados (dos dados).

## Senhores KP

O "Graphical ephemeris - 3 month overview" e as linhas do tempo imprimem, para cada ponto do
trânsito, o pada e três senhores ("3,Su/Sa/Ve"), lidos no executável (`kpLords`): o senhor do
nakshatra; o sub, achado estendendo os 120 anos do Vimshottari sobre os 13°20' do nakshatra a
partir do senhor dele, cada senhor com os seus anos; e o sub-sub, a mesma divisão do sub a partir
do senhor do sub. O PL9 conta os anos já andados inteiros, o que dá o mesmo que compará-los
exatos, porque os anos da tabela são inteiros. Para o sub-sub, ele estende a fração do sub sobre
um nakshatra multiplicando por 13,33333333 e somando 13,33333 menos isso; a diferença é de um
milésimo de segundo de arco e vale nos dois modos.

## Vargas do trânsito

O "Animated Transits - Vargas" desenha a D9 e a D10 do mapa de trânsito e, sob cada uma, uma
tabela por planeta (`vargaTable`). Tudo dos dados, em 270 instantes:

- grau na varga (a longitude vezes o número de partes, no signo), signo e dignidade em nove passos
  calculada com as posições da varga, como a dignidade do mapa;
- "AV": os bindus do planeta no Ashtakavarga montado com os signos da varga; Rahu mostra os da
  tabela do Lagna, Ketu nenhum;
- "Av3": acordado (Alr.) em exaltação, moolatrikona ou signo próprio; dormindo (Slp.) em debilidade
  ou no signo de um inimigo natural; sonhando (Drm.) nos outros casos, e os nós pela dignidade só;
- "Av5": o Baladi sobre o grau da varga (como no Muhurta);
- "Func.": a natureza funcional pelo signo do Lagna da varga, a lista de Parashara por Ascendente
  (os sete planetas, numa tabela fixa que os dados mostram sem conflito nos doze signos);
- "In": as casas contadas do Lagna, da Lua e do Sol da varga.

A natureza funcional dos nós não se achou: não segue o dono do signo nem uma regra só da casa,
e a tabela não está no executável nas formas procuradas. Ela é mostrada e não conferida.

## Kakshas

Cada signo se divide em oito kakshas de 3°45'; o kaksha é a parte inteira do grau no signo
dividido por 3,75, de modo que um grau exatamente no fim de uma parte cai na seguinte. Os
senhores, em ordem: Saturno, Júpiter, Marte, Sol, Vênus, Mercúrio, Lua, Ascendente (lido no
executável). Para cada planeta em trânsito (Sol a Saturno), no Ashtakavarga natal, sem
redução (lido no executável):

- o bindu do kaksha: se o senhor do kaksha dá bindu ao signo de trânsito no Bhinna natal do
  planeta em trânsito (0 ou 1);
- "Ash.": os bindus do Bhinna natal do planeta no signo de trânsito;
- "Sarv.": o Sarva natal (a soma dos sete Bhinnas, até 56) do signo de trânsito.

## Tarabala e Chandrabala

Da Lua natal à Lua em trânsito (lido no executável):

- Tarabala: os nakshatras entre elas, em ciclos de nove, 1 a 9 — Janma, Sampat, Vipat,
  Kshema, Pratyak, Sadhaka, Vadha, Mitra, Atimitra; boas as taras 2, 4, 6, 8 e 9. O PL9
  imprime o nome seguido de uma descrição cortada pela largura da coluna ("Mitra: Good");
  os nomes vêm dos PDFs.
- Chandrabala: a casa do signo da Lua em trânsito contada do signo da Lua natal; "Inauspicious"
  nas casas 6, 8 e 12, "Auspicious" nas outras, sem depender da fase da Lua.

## Shadbala dos trânsitos

O que o PL9 imprime para os planetas em trânsito é o Shadbala completo do mapa de trânsito
(no instante e no lugar do trânsito) dividido pelo mínimo exigido de cada planeta (390, 360,
300, 420, 390, 330, 300), com duas casas — o `ratio` do Shadbala da etapa 4. A tabela
impressa foi achada no executável; a divisão pelo mínimo vem dos dados (bate nos 270
instantes conferidos).

## Dashas no instante

O PL9 imprime nos "Gochara data" quatro dashas no instante, cinco níveis cada, com os
senhores em duas letras ligadas por "-" ("Ra-Me-Ve-Ve-Ra"): Vimshottari, Yogini e
Ashtottari com planetas (as Yoginis pelo planeta de cada uma: Mangala Mo, Pingala Su,
Dhanya Ju, Bhramari Ma, Bhadrika Me, Ulka Sa, Siddha Ve, Sankata Ra) e Narayana com signos
(Ar Ta Ge Ca Le Vi Li Sc Sa Cp Aq Pi). O formato foi lido no executável. `dashasAt` dá os
três primeiros com o motor da etapa 3. Um instante anterior ao nascimento toma o primeiro
período de cada nível, de modo que o PL9 imprime o primeiro senhor cinco vezes
("Ke-Ke-Ke-Ke-Ke"); isso veio dos dados.

O Narayana no instante (`narayanaChainAt`), lido no executável: as mahadashas seguem a ordem
e os anos do Narayana (`docs/spec/dashas/rashi.md`), e cada volta par dá a cada signo 12 anos
menos os da primeira (a terceira repete a primeira); cada período se divide em doze partes,
na ordem das antardashas do signo do período de cima, até o quinto nível. Abaixo da mahadasha,
o PL9 mede as partes pelos anos que a mahadasha teria na volta contada pelas partes do
próprio nível: as doze primeiras partes de um nível com os anos da primeira volta, as doze
seguintes com os da segunda, e assim por diante. Na primeira volta isso dá doze partes iguais;
numa volta par as partes não preenchem a mahadasha ou passam dela (correção 26: o modo
`corrected` divide cada período em doze partes iguais). O ano é o dos outros dashas. Antes do
nascimento, o primeiro signo nos cinco níveis, como nos outros, mesmo que ele tenha 0 anos (o
laço do PL9 desce no primeiro período antes de somar a sua duração; as tabelas pulam esse signo).
Num instante exatamente na divisa entre dois períodos, o que começa ali. Sem Lagna (além do círculo
polar), `dashasAt` dá `null` no Narayana.

A página "Events 1-10" mostra, para os eventos "Today" e "Muhurta", Vimshottari, Yogini, Ashtottari e
"Chara (As)" em cinco níveis. O Chara, lido no executável, desce pela mesma rotina do Narayana
(`rashiChainAt`), com a ordem e os anos do Chara da etapa 3, os mesmos anos em toda volta e as
partes iguais: abaixo da mahadasha, cada período começa no signo vizinho do de cima, para a frente
ou para trás conforme a direção dada por ele, como as antardashas. Dos dados: a página calcula os
eventos na hora gravada (06:00) tomada como UT, não como a hora de Jaipur do evento; nessa hora os
quatro sistemas batem nos 270 casos, e na hora de Jaipur não. Sem Lagna, o Chara também sai `null`.

## Entradas em signos

O "Yearly transit overview" mostra, para o ano do instante, os períodos de cada planeta em
cada signo, com o dia de entrada e de saída. A busca do PL9, lida no executável, amostra as
longitudes a cada meio dia e põe o cruzamento por interpolação linear entre as duas
amostras (`crossings`, `signIngresses`). O dia impresso é o do calendário em UT nos mapas de
referência, que têm todos o fuso 0, e por isso não dá para saber se o PL9 usa UT ou o fuso
do mapa: a conferência é em UT, e essa escolha é uma ambiguidade dos dados, não uma leitura. A página corta pela borda algumas linhas longas, perdendo o
planeta ("R: Nov 5 to (D) Nov 22"); essas ficam sem conferência.

## Calendário de kakshas

O "Kaksha and dasha calendar" desenha, para cada planeta de Sol a Saturno, uma barra por
kaksha ao longo do mês: o kaksha do início do mês e cada um em que o planeta entra
(`kakshaCalendar`, com a mesma busca, fronteiras de 3°45'), com o senhor e o bindu como nos
kakshas acima. Sob o rótulo de cada barra o PL9 imprime os bindus do signo em que o planeta
está quando sai do kaksha (o do trecho seguinte), ou do próprio trecho se o mês acaba antes
(`shownAsh`); isso veio dos dados, como a posição do rótulo, entre 17% e 47% da altura da
barra, e as barras que o PL9 não rotula (as curtas no começo e no fim do mês e as da Lua).

## Kota Chakra

O worksheet "Kota Chakra" numera os 28 nakshatras, Abhijit entre Uttara Ashadha e Shravana, a partir
do nakshatra natal da Lua, e põe cada planeta em trânsito no seu (`kotaChakra`, dos dados: as 2430
posições impressas). Imprime também uma pontuação ("Score: -4.5") cuja regra não se achou: os textos
do chakra estão cifrados, e as 270 impressões, todas no mesmo céu, não bastam para tirá-la dos
dados (só o nakshatra natal muda de uma para outra). A pontuação é lida e não conferida.

## Sanghatta, Sarvatobhadra e o Ishta/Kashta dos trânsitos (não conferidos)

As páginas 115 (Sanghatta Chakra) e 116 (Sarvatobhadra Chakra) são desenhos: põem cada planeta, os
natais por dentro e os do trânsito por fora no Sanghatta e os do trânsito nas casas da grade no
Sarvatobhadra, no seu nakshatra (o que as tabelas de trânsito e o Kota Chakra já conferem), e traçam
as linhas de vedha. Nenhuma das duas imprime número. No executável, a "Sarvatobhadrachakra score" e
as células do Ishta/Kashta dos trânsitos (pontuação, fase e posição) estão registradas numa tabela de
células, mas a rotina que as avalia não foi achada, e nenhuma página impressa as mostra. Ficam para a
etapa 6, com o desenho dos chakras.

## Calendário do mês

O worksheet "Calendar" lista, dia a dia, os eventos do mês do relógio, na hora de Jaipur
(`monthEvents`). Que eventos entram é configuração do PL9, não regra fixa: o preset de trânsitos
"Worksheet Calendar" das opções (lido no PL9) marca os nove planetas em trânsito, sete tipos de
evento e os alvos — os nove planetas natais, o Ascendente, as cúspides 4, 7 e 10 e os nakshatras e
signos. Os eventos:

- a entrada de cada planeta num nakshatra e num signo;
- conjunção, oposição e trígono (os dois, a 120° de cada lado) com os planetas natais, o Ascendente
  e as cúspides 4, 7 e 10, que são os meios das casas iguais: o Ascendente mais 90°, 180° e 270°
  (dos dados; as casas de Sripati não batem);
- as estações de Marte a Saturno ("R or D As");
- cada novo período do quinto nível do Vimshottari natal, a partir das 0h UT do primeiro dia (dos
  dados: as trocas antes das 05:30 do dia 1, na hora de Jaipur, nunca aparecem; os aspectos sim).

A busca é a dos ingressos (amostras de meio em meio dia, retas entre elas); a hora é cortada no
minuto. O símbolo do planeta leva "M" quando ele anda para trás; nos trígonos isso vale em quase
todos os casos (109 de 4785 impressos divergem, regra não achada, e ali o "M" não é comparado). A
hora das estações e a das trocas de dasha não saíram da rotina do PL9: o `core` dá a estação no
instante em que a velocidade zera, a até um minuto da impressa, e as trocas de dasha saem a até 3
minutos. A célula de cada dia corta as últimas linhas quando não cabem (de 5 a 9 linhas, pela
largura dos textos): um evento só falta se vem antes da última linha impressa do dia. A linha
"-------" marca o relógio da impressão, lido como UT e mostrado na hora de Jaipur (dos dados).

## "Time of transits"

Research → "Time of transits" dá o primeiro momento, depois de uma data, em que um planeta
em trânsito faz um evento com um ponto natal, ao segundo e na hora de Jaipur (o "Yearly
transit overview" data em UT). A rotina é a mesma das entradas em signos (lido no
executável); cada evento é o cruzamento de uma longitude, num sentido
(`timeOfTransit`):

- "Transits": o grau natal, em qualquer sentido;
- "Fully aspects": o grau natal menos 30 × (casa − 1) para cada casa de aspecto pleno — a 7ª
  para todos, e também a 4ª e a 8ª de Marte, a 5ª e a 9ª de Júpiter, a 3ª e a 10ª de
  Saturno; os nós só a 7ª (isso veio dos dados: Rahu em 2032 exatamente oposto a Vênus);
- "gets in" / "leaves the same sign as": o começo e o fim do signo do ponto, conforme o
  sentido; o mesmo com o nakshatra;
- "gets within 45 degrees of" / "leaves the 45 degree orb of": o grau natal menos e mais 45°,
  conforme o sentido.

O PL9 arredonda os segundos (dos dados) e marca "R" quando o planeta chega retrógrado. O "Transit/dasha
Report" do menu Print usa a mesma busca e não foi impresso à parte.

## Opções

As opções que mudam os números desta página já têm gabaritos nas etapas anteriores: a
ayanamsha e os nós (etapa 2), a tabela de bindus do Ashtakavarga e as cinco opções do
Shadbala (etapa 4). O `core` as repassa (`computeTransits`, `transitKakshas`); o PL9 não tem
opção própria dos trânsitos que mude um número.

## Conferência

- Os 270 instantes de referência (a página do Muhurta, 1/1/2000 12:00 e 15/6/2030 06:00 em
  Jaipur, nos 135 mapas): posições, marcas R, kakshas com bindu, Ash. e Sarv., Shadbala,
  Tarabala e Chandrabala iguais aos do PL9 no modo `pl9`.
- Os 540 instantes (os 270 de referência e os 270 "agora"): Vimshottari, Narayana, Yogini e
  Ashtottari iguais. No Narayana, 168 instantes caem na primeira volta, 296 depois dela e 76
  antes do nascimento.
- As posições do Kota Chakra nos 270 PDFs (2430 valores): iguais; a pontuação não é conferida.
- O calendário de outubro de 2026 nos 270 PDFs (42.409 linhas e marcas): iguais. Cada dia imprime
  ao menos cinco linhas, ou todos os eventos do `core` desse dia quando são menos (a capacidade mínima
  da célula): um dia com menos linhas falha.
- As tabelas da D9 e da D10 do trânsito nos 270 instantes "agora" (37.800 valores): iguais.
- A página Events nos 270 casos: a data e os quatro dashas dos dois eventos (2430 valores): iguais.
- Os senhores KP dos dez pontos nos 270 instantes "agora" (2700 valores): iguais.
- As duas últimas colunas da tabela do trânsito do worksheet 106 são o SB# (quantas forças do
  Shadbala do mapa de trânsito são fortes) e o VB (o Vimshopaka Shadvarga), como no Muhurta
  (`computeTransits`: `shadbalaStrong`, `vimshopaka`). A tabela é cortada de um jeito em cada mapa
  (32 sem o VB). Nos 270 instantes "agora": SB# 1890 de 1890, o VB dos planetas 1666 de 1666 (à
  unidade); o VB dos nós difere em 238 de 476 e fica pendente, como no Muhurta.
- As 49 entradas em signos de 2026 com dia legível: iguais.
- Os 3780 rótulos do calendário de outubro de 2026 (135 mapas): o senhor de cada um num
  trecho calculado, na ordem, e os 3645 números impressos sob eles, iguais.
- Um caso de fronteira: no REF 0170 (2030), a página "agora" foi impressa às 06:30:55 de
  Jaipur, segundos antes da troca do senhor da hora do Shadbala ao nascer do sol, e o PL9
  imprimiu Marte já depois dela e Saturno ainda antes. As páginas "agora" são desenhadas
  com o relógio correndo; a bancada aceita um Shadbala igual ao do `core` 30 s antes ou
  depois e o lista como caso de fronteira.
- As 17 consultas de "Time of transits" no REF 0010 (os oito tipos de evento, planetas
  diretos e retrógrados, os nós): iguais ao segundo exibido, aceitando 1 s para cada lado pelo
  arredondamento (até 1,5 s do instante calculado).
