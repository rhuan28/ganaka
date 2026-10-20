# Força dos signos

Código: `packages/core/src/dashas/strength.ts` e `points.ts`. Testes:
`packages/core/test/strength.test.ts`, `packages/core/test/rashi.test.ts`.

O PL9 decide qual de dois signos é o mais forte (no Kalachakra, o signo e o
7º, para a primeira subdivisão de cada período; nos dashas de signo, onde a
regra pede o "mais forte entre o 1º e o 7º") por esta comparação, critério a
critério, até um desempatar:

1. mais planetas no signo (os nove grahas, Rahu e Ketu incluídos);
2. mais aspectos de signo (jaimini) ou conjunções de Júpiter, de Mercúrio e
   do regente do signo; um regente que seja Júpiter ou Mercúrio conta de
   novo;
3. mais planetas exaltados no signo (abaixo);
4. signo duplo antes de fixo, fixo antes de móvel;
5. o regente num signo de paridade diferente da do signo;
6. o regente com maior grau dentro do seu signo, sendo o regente de Escorpião
   e de Aquário o escolhido abaixo;
7. empate total: o segundo signo.

**Exaltação.** Um planeta conta como exaltado em todo o signo de exaltação,
estritamente acima de 0°, menos Mercúrio, só abaixo de 15° de Virgem. Rahu é
exaltado em Gêmeos e Ketu em Sagitário, cada um debilitado no signo do outro
(nesta comparação, qualquer que seja a opção "Rahu's Exaltation sign"); fora
desses dois signos, vale a dignidade em nove níveis (abaixo): Rahu exaltado em
Touro e debilitado em Escorpião, Ketu o contrário. Debilitado, para os outros:
no signo oposto ao da exaltação.

**Regente de Escorpião e de Aquário.** Os dois regentes, Marte e Ketu,
Saturno e Rahu: se um deles está no signo, vale o outro; senão, o que tem
mais planetas no mesmo signo; depois o aspectado por mais de Júpiter,
Mercúrio e o regente do signo em que está (sem contar ele mesmo; um regente
que seja Júpiter ou Mercúrio conta de novo); depois o de melhor dignidade
(exaltado, nem uma coisa nem outra, debilitado); depois o mais distante do
signo, contando para a frente a partir de um signo ímpar e para trás a partir
de um par; empate: Marte ou Saturno.

## Pontos (Chara de Parashara e Sthira)

Outra comparação, que o PL9 usa no Chara de Parashara e para achar o Brahma
do Sthira, soma pontos.

**Pontos de um signo:** 15 se móvel, 30 se fixo, 60 se duplo; 60 por cada um
de Mercúrio, Júpiter e o regente do signo cujo signo o aspecta (aspecto de
signo, sem contar a conjunção); 15 por planeta no signo, do Sol a Rahu (Ketu
não conta), e mais 45 se houver algum.

**Pontos de um planeta:** pela dignidade em nove níveis (abaixo): 60, 45, 30,
22,5, 22,5, 15, 7,5, 7,5 e 3,75; pela posição entre os chara karakas (com a
opção de 7 ou 8 karakas): 60 o Atmakaraka, depois 45, 30, 22,5, 15, 7,5 e
3,75, nada além do sétimo; e pela casa a partir do signo do Atmakaraka: 60 numa
kendra, 30 numa panaphara, 15 numa apoklima.

**Dignidade em nove níveis:** 1 exaltado (Sol em Áries, Lua em Touro, Marte em
Capricórnio, Mercúrio em Virgem até 15°, Júpiter em Câncer, Vênus em Peixes,
Saturno em Libra, Rahu em Touro, Ketu em Escorpião); 2 moolatrikona (Sol em
Leão até 20°, Lua em Touro de 3° a 30°, Marte em Áries até 12°, Mercúrio em
Virgem de 15° a 20°, Júpiter em Sagitário até 10°, Vênus em Libra até 15°,
Saturno em Aquário até 20°, Rahu em Gêmeos, Ketu em Sagitário), as faixas
estritas; 3 no próprio signo (Rahu em Aquário e Virgem, Ketu em Escorpião e
Peixes); 9 debilitado (o signo oposto ao da exaltação). Os outros, do Sol a
Saturno, recebem 7 menos a amizade natural com o regente do signo (2 amigo, 1
neutro, 0 inimigo) menos a temporal (+1 se o regente está a 2, 3, 4, 10, 11 ou
12 signos, −1 se não, inclusive no mesmo signo): de 4, grande amigo, a 8,
grande inimigo. Rahu e Ketu, fora disso, 6.

**Mais forte por pontos:** de dois signos, o que somar mais pontos de signo e
pontos do seu regente (Marte para Escorpião, Saturno para Aquário),
arredondados ao inteiro mais próximo, as metades ao par; empate, o segundo.

## Origem

Lida no executável do PL9 (a rotina que o programa também usa para o item de
pesquisa "strongest of first and seventh" do Narayana), e conferida nos
relatórios do Kalachakra: acerta as 780 escolhas de eixo de 130 mapas. Uma
dedução anterior, só pelos relatórios, tinha quatro critérios e errava um eixo
(o do REF 0169, decidido por Ketu exaltado em Sagitário). As faixas de
exaltação e os pontos foram lidos nas tabelas do executável; os pontos são
conferidos pelo Sthira (130 mapas) e pelo Chara de Parashara (31 mapas).
A exaltação no signo inteiro foi conferida em cinco mapas em que ela decide
(REF 0042, 0127, 0140, 0191 e 0223): com as faixas de grau que o `core` usava
antes, o Kalachakra e os dashas de signo desses mapas falham.

## O que não foi verificado

- O critério 7 (empate total) e a ordem dos dois signos nele.
- Os pontos com 8 karakas: a opção não foi trocada no PL9.
