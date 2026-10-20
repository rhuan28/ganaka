# Os dois modos de cálculo e as correções

## Os dois modos

O `core` calcula em um de dois modos, escolhido pela opção `fidelity`:

- **`pl9`** reproduz o Parashara's Light 9, inclusive onde ele erra. É o
  modo conferido contra os valores extraídos do programa: tudo o que
  `docs/relatorios/conformidade-posicoes.md` relata é deste modo.
- **`corrected`**, o padrão, é o mesmo cálculo com os defeitos comprovados
  do PL9 consertados.

Todo resultado traz o campo `fidelity`, que diz em que modo foi calculado.
As funções de baixo nível do `core`, que são a reprodução do PL9, usam
`pl9` quando o modo não é dado; `computePositions`, `computeChart` e a linha
de comando usam `corrected`.

## O critério

Só entra como correção um defeito que um teste demonstra sem depender de
opinião:

- um instante que deveria pôr o grau do Sol no horizonte e não põe;
- um resultado fora do conjunto de resultados possíveis;
- uma constante que difere da fonte que o próprio cálculo segue;
- uma tabela vencida.

Convenções e escolhas do autor do programa não são corrigidas, mesmo quando
outros programas fazem diferente: sem um critério externo, "melhor" seria
só preferência, e o resultado deixaria de coincidir com o que um usuário do
PL9 espera ver.

Cada correção abaixo tem um teste que mostra o defeito no modo `pl9` e o
conserto no modo `corrected`: os de efemérides em
`packages/oracle/test/corrections.test.ts`, o do D2 em
`packages/core/test/vargas.test.ts`, o do Mandi nos dois, o do D11-iyer no
`core`, os dos dashas em `packages/core/test/dashas.test.ts` e
`packages/core/test/kalachakra.test.ts`.

## As correções

### 1. Pôr do sol e nascer do sol seguinte

**O que o PL9 faz.** Procura esses instantes por uma busca que para quando
chega perto (a um milésimo de grau, medido contra uma posição aproximada do
Sol) e dá mais um passo. O nascer do sol sai certo a menos de um milésimo
de segundo. O pôr do sol e o nascer seguinte não: em 120 mapas de
referência, ficam até 0,015° fora do horizonte, o que são alguns segundos
de tempo.

Num caso raro — cerca de um mapa em vinte mil, em qualquer latitude — a
busca do pôr do sol termina na primeira passagem e o passo final usa uma
inclinação que sobrou da busca anterior. O pôr do sol sai a quase um grau
do horizonte, minutos de tempo.

**Por que é defeito.** O próprio programa define o pôr do sol como o
instante em que o grau do Sol está no horizonte oeste. O instante que ele
devolve não satisfaz essa definição.

**O que o modo `corrected` faz.** Acha as raízes de verdade, por varredura
e bisseção, até a resolução de um dia juliano (0,04 milissegundo). A
definição não muda.

**Efeito.** O Gulika, que é um Lagna num instante derivado do pôr do sol,
desloca-se em mais de dez minutos de arco nos dois mapas do caso raro. Nos
mapas comuns o deslocamento por esta correção é de segundos de arco; os
números da tabela do fim (mediana de 2,8", máxima de 12") somam o efeito
desta correção e o do Delta T.

O panchanga tem uma busca própria, com o Sol a andar a sua velocidade média, que
também para sem conferir: o nascer, o pôr e o nascer seguinte que ele imprime
são, no modo `corrected`, os exatos. Perto de 65° de latitude a busca do PL9 pode
parar a horas do horizonte (REF 0013: pôr do sol três horas e meia depois do
nascer; REF 0124: nascer seguinte 28 horas depois).

Testes: "the sunset when PL9's search settles at once"; "the sunset and
the next sunrise of an ordinary chart"; "in the corrected mode takes the exact
sunrise, sunset and next sunrise (corrections 1 and 2)".

### 2. Busca do nascer do sol em latitudes altas

**O que o PL9 faz.** A partir de cerca de 65° de latitude a busca deixa de
convergir em parte dos dias; o programa usa o que ela tiver dado. A 66°, em
87 de 120 instantes testados ao longo de um ano o resultado está a mais de
meio grau do horizonte ou é inutilizável.

**Por que é defeito.** O grau do Sol cruza o horizonte todos os dias abaixo
do círculo polar; a raiz existe e a busca não a acha.

**O que o modo `corrected` faz.** A mesma varredura e bisseção do item 1,
que acha a raiz em qualquer latitude em que o Lagna se define. Nos mesmos
120 instantes, nenhuma falha.

**Efeito.** No modo `pl9`, o mapa volta sem Gulika e Prana Pada quando a
busca é inutilizável (ver "Pontos que não se definem"). Quando ela termina
sem convergir mas com instantes em ordem, o modo `pl9` devolve o que o PL9
devolveria — um Gulika e um Prana Pada que podem estar graus fora — só com
`verified` falso. No modo `corrected`, o mapa volta inteiro e certo até
meio milésimo de grau do círculo polar; mais perto que isso (cerca de 50
metros no terreno) a raiz pode não ser achada, e o mapa volta sem os dois
pontos.

Teste: "the sunrise search at high latitudes".

### 3. D2 a exatos 15° de um signo ímpar

**O que o PL9 faz.** Trata os 15° exatos como fim da primeira metade, e a
conta que faz nesse ponto dá Virgem.

**Por que é defeito.** O D2 só tem dois signos, Câncer e Leão.

**O que o modo `corrected` faz.** Dá Câncer: os 15° exatos são o início da
segunda metade, como nas outras vargas.

**Efeito.** Só existe para uma longitude exatamente igual a 15° de um signo
ímpar.

Teste (no `core`): "at exactly 15 degrees of an odd sign gives Virgo in D2
as PL9 does, and Cancer in the corrected mode".

### 4. Dois coeficientes da nutação do Lagna

**O que o PL9 faz.** Na série de treze termos que subtrai do Lagna e do
meio do céu, usa em dois lugares um coeficiente que não é o da série
publicada (ver `lagna.md`).

**Por que é defeito.** Os outros coeficientes são os da série; estes dois
coincidem com valores vizinhos da mesma tabela, o que indica troca na
transcrição.

**O que o modo `corrected` faz.** Usa os coeficientes publicados.

**Efeito.** Até 0,002" no Lagna.

Teste: "the nutation coefficients".

### 5. Delta T

**O que o PL9 faz.** Converte tempo universal em tempo dinâmico com uma
tabela que termina em 2014 e, daí em diante, extrapola (ver `delta-t.md`).

**Por que é defeito.** A extrapolação se afasta do Delta T observado. Contra
os valores publicados a partir de observação, o do PL9 já erra mais de 2
segundos em 2024, e o da biblioteca atual fica a menos de meio segundo de
2016 a 2024. A diferença entre os dois passa de 44 segundos em 2048.

**O que o modo `corrected` faz.** Usa o Delta T da versão atual da Swiss
Ephemeris.

**Efeito.** É a correção de maior efeito. Na Lua, nos mapas de referência:
mediana de 1,35" e até 2,9" antes de 1900; 0,19" de 1900 a 1950; 0,001" de
1950 a 2014; 13,6" depois de 2014, chegando a 26" em 2048. No Sol, 1,8" no
máximo. O Prana Pada, que amplifica qualquer deslocamento do nascer do sol,
muda até 47".

**O que está demonstrado e o que não está.** Demonstrado, por teste contra
valores observados: de 2016 a 2024 o Delta T da biblioteca atual é o certo e
o do PL9 não. **Não** demonstrado aqui: que antes de 1900 a tabela atual é
melhor que a do PL9. As duas diferem ali em alguns segundos (13,0 contra
18,2 em 1801) porque a biblioteca passou a usar uma reconstrução histórica
mais recente; o projeto adota a atual por ser a mais recente, sem prova
própria. Para datas futuras a tabela atual também é uma estimativa, e será
revista quando a biblioteca for atualizada.

Testes: três em "Delta T".

### 6. Mandi à noite, de quarta a sábado

**O que o PL9 faz.** Põe Mandi, à noite, no trigésimo 10, 6, 2, 28, 24, 20 e
16 da noite, de domingo a sábado.

**Por que é defeito.** A regra que o PL9 segue para Mandi é a tabela
clássica de ghatis — de dia ele a reproduz em todos os dias, e de noite no
domingo, na segunda e na terça. A tabela dá 26, 22, 18 e 14 para as noites
de quarta a sábado; o PL9 dá dois trigésimos a mais em cada uma, como se a
contagem desse a volta em 30 em vez de recomeçar pela tabela. É uma
constante que difere da fonte que o próprio cálculo segue; o 28 da noite de
quarta, além disso, está fora de tudo o que a tabela dá (de 2 a 26).

A rotina do PL9 não foi lida: a fonte é deduzida de que o programa a segue
em todos os outros casos. A correção depende de o mantenedor aceitar essa
dedução.

**O que o modo `corrected` faz.** Usa a tabela clássica: 10, 6, 2, 26, 22,
18 e 14.

**Efeito.** Só nos nascimentos noturnos de quarta a sábado: Mandi fica dois
trigésimos de noite mais cedo, o que costuma mover o ponto alguns graus.

Medição: nos mapas impressos pelo PL9, as noites de quarta e de sexta caíram
exatamente em 28 e 20 trigésimos, e as de domingo e terça em 10 e 2; as de
quinta e de sábado, conferidas depois por toda a bancada, em 24 e 16. Teste: "correction: Mandi at night from Wednesday to Saturday".

### 7. D11-iyer a exatos 0° de um signo

**O que o PL9 faz.** Dá Touro.

**Por que é defeito.** Dentro de um signo, as onze partes do D11-iyer dão
Áries e depois Peixes, Aquário… até Gêmeos; Touro não é resultado possível
dessa varga.

**O que o modo `corrected` faz.** Dá Áries: os 0° exatos são o início da
primeira parte.

**Efeito.** Só existe para uma longitude exatamente igual a 0° de um signo.

Teste (no `core`): "at exactly 0 degrees of a sign gives Taurus in D11-iyer
as PL9 does, and Aries in the corrected mode".

### 8. O ano de dasha que o PL9 chama de 365,25

**O que o PL9 faz.** Na opção "Dasha year" de 365,25 dias, calcula com
365,2422 guardado em precisão simples, 365,2421875 dias.

**Por que é defeito.** A constante difere da que o próprio programa declara
na opção. Medido: com 365,2421875, as trocas de sookshma impressas caem no
minuto; com 365,25, erram por horas.

**O que o modo `corrected` faz.** Usa 365,25 dias. O ano de 365,2422 fica
disponível como opção própria (`365.2422`), nos dois modos.

**Efeito.** Todas as datas de dasha com essa opção, a padrão: 0,78 dia a
cada século contado do início do primeiro período.

Teste: "correction: the dasha year PL9 calls 365.25".

### 9. Shravana em primeiro no grupo de Saturno, no Ashtottari

**O que o PL9 faz.** No Ashtottari, o saldo no nascimento é a parte já
percorrida do grupo de nakshatras do regente: (posição no grupo + fração do
nakshatra) / tamanho do grupo. O grupo de Saturno é Purva Ashadha, Uttara
Ashadha, Abhijit e Shravana; o PL9 dá a Shravana a posição 0, e não 3.

**Por que é defeito.** Em todos os outros nakshatras, dos dois sistemas de
grupo, a posição é a ordem no grupo, a regra que o próprio cálculo segue. Com
a posição 0, quando a Lua passa de Abhijit para Shravana a parte percorrida
volta de 3/4 a quase 0: dois nascimentos com segundos de diferença têm
dashas com anos de diferença.

**O que o modo `corrected` faz.** Dá a Shravana a posição 3.

**Efeito.** Só no Ashtottari, e só com a Lua (ou o ponto de partida) em
Shravana: a Mahadasha de Saturno em curso no nascimento começa 7,5 anos
antes, e todas as datas seguintes com ela.

Teste: "correction: Shravana first in the group of Saturn in Ashtottari".

### 10. Shravana contado de 280°04'

**O que o PL9 faz.** Nos dois sistemas de grupo (Ashtottari e
Shastihayani), a fração percorrida de Shravana é contada de 280°04' a
293°20', embora Abhijit ocupe o arco até 280°53'20". O ponto de partida foi
medido nas datas impressas (entre 280,065° e 280,067°, em seis mapas).

**Por que é defeito.** Na saída de Abhijit, Shravana começa já com 6% de
fração: o arco de 280°04' a 280°53'20" é contado duas vezes, como Abhijit e
como Shravana, e o saldo salta na fronteira. Nenhuma Lua dá a Shravana uma
fração menor que 6%, um resultado fora do possível para a parte percorrida
de um nakshatra.

**O que o modo `corrected` faz.** Conta Shravana do fim de Abhijit, 280°53'20",
a 293°20'.

**Efeito.** Só com a Lua em Shravana, nos dois sistemas de grupo: o saldo
muda até 6% do nakshatra, menos de dois meses de período.

Teste: "correction: Shravana counted from 280°04' though Abhijit holds it until
280°53'20"".

### 11. Saldo "By time" ignorado nos sistemas de grupo

**O que o PL9 faz.** Com a opção de saldo "By time", calcula a fração
percorrida do nakshatra pelo tempo nos onze sistemas que contam nakshatras,
e continua pelo grau no Ashtottari e no Shastihayani.

**Por que é defeito.** A opção do próprio programa diz que o saldo é pelo
tempo, e ele a aplica em todos os outros sistemas. Medido: em 30 mapas
impressos com "By time", a fração deduzida das datas dos dois sistemas de
grupo é a do grau, e não a do tempo.

**O que o modo `corrected` faz.** Usa a fração pelo tempo também dentro dos
grupos: (posição no grupo + fração do nakshatra pelo tempo) / tamanho do
grupo.

**Efeito.** Só com "By time", no Ashtottari e no Shastihayani: o saldo muda
na diferença entre a fração pelo grau e pelo tempo, em geral alguns dias.

Teste: "correction: the balance by time ignored in the groups".

### 12. Kalachakra: mahadashas pela ordem do zodíaco

**O que o PL9 faz.** Com a opção "Continue mahadashas in following pada", as
mahadashas depois da que corre no nascimento seguem a ordem do zodíaco
(Câncer, Leão, Virgem…).

**Por que é defeito.** A opção diz que as mahadashas seguem para o pada
seguinte, e a sequência de signos que o próprio PL9 usa para achar a
mahadasha em curso e o saldo é a do pada. A continuação pelo zodíaco difere
das duas: é uma regra diferente da que o cálculo segue.

**O que o modo `corrected` faz.** Depois da mahadasha em curso, segue o
resto da sequência do pada da Lua e depois as sequências dos padas
seguintes, na ordem dos 108 padas.

**Efeito.** Quase sempre, todas as mahadashas depois da que corre no
nascimento, e os seus períodos: a maioria das sequências de pada não segue a
ordem do zodíaco (Ashwini 2: Capricórnio, Aquário, Peixes, Escorpião…). Nos
130 mapas de referência, 126 têm outra lista de mahadashas no modo
`corrected`. Só coincidem os padas cuja sequência anda pelo zodíaco (como
Ashwini 1, Áries a Sagitário), até o fim dela.

Teste: "correction: the mahadashas go on through the zodiac, not to the
following pada".

### 13. Kalachakra: "Cycle through mahadasha within the same pada"

**O que o PL9 faz.** Aceita o clique na opção, mas não a grava: ao reabrir as
preferências, "Continue mahadashas in following pada" volta marcado, com 9 ou
12 antardashas. A opção não pode ser usada.

**Por que é defeito.** Uma opção oferecida que o programa não guarda; não há
resultado do PL9 para conferir.

**O que o modo `corrected` faz.** Depois da mahadasha em curso, repete a
sequência do pada da Lua. No modo `pl9` a opção é recusada
(`NotImplementedOptionError`).

Teste: "correction: the mahadashas cycling within the same pada, an option PL9
does not keep".

### 14. Kalachakra: "9 Antar Dasha"

**O que o PL9 faz.** Os relatórios com a opção são incoerentes. Em 30 mapas,
em 268 mahadashas: 117 com o nome fora da sequência, 58 pares de períodos
sobrepostos, 80 em que as antardashas não somam a duração da mahadasha. As
antardashas são os nove signos do zodíaco a partir do da mahadasha, cada um
na proporção dos seus anos, mas a soma dos anos que divide é a da primeira
mahadasha, reaproveitada nas outras.

**Por que é defeito.** Períodos sobrepostos e subperíodos que não preenchem
o período são resultados fora do possível.

**O que o modo `corrected` faz.** Os nove signos a partir do signo do
período, pela ordem do zodíaco, cada um com `duração do período × anos do
signo / soma dos anos dos nove`, a soma refeita para cada período, em todos
os níveis. No modo `pl9` a opção é recusada (`NotImplementedOptionError`).

Teste: "correction: nine antardashas, inconsistent in PL9".

### 15. Drig: a conta do signo cortada a oito bits

**O que o PL9 faz.** Ao montar a ordem do Drig, quando a conta do signo fica
abaixo de 1, o número é cortado a oito bits antes de voltar a 1..12, e o
signo sai quatro adiante. Com o Lagna em Virgem, Libra, Escorpião, Sagitário
ou Capricórnio, a ordem repete signos e deixa outros de fora.

**Por que é defeito.** A regra do Drig dá, depois do 9º, do 10º e do 11º, os
três signos que cada um aspecta; o signo quatro adiante não é aspectado por
ele, e um dasha de signo que repete signos e esquece outros não cobre o
zodíaco.

**O que o modo `corrected` faz.** Volta a conta a 1..12 como ela é: cada um
dos três signos é seguido exatamente dos três que ele aspecta.

**Efeito.** A ordem do Drig, e as datas desde o primeiro signo trocado, nos
mapas com o Lagna num desses cinco signos.

Teste: "correction: the Drig order cut to eight bits".

### 16. Segunda volta do Narayana, do Lagna Kendradi e do Drig

**O que o PL9 faz.** Nas páginas #2 dos relatórios a segunda volta sai
embaralhada: períodos fora de ordem e durações que não fecham. Nas células da
worksheet ela parece ordenada, mas a maioria das mahadashas tem os anos da
primeira volta, algumas 12 menos esses anos, e algumas nenhum dos dois.

**Por que é defeito.** Períodos fora de ordem e subperíodos que não
preenchem o período são resultados fora do possível, e os anos não seguem
nenhuma regra.

**O que o modo `corrected` faz.** A regra clássica: na segunda volta cada
signo tem 12 anos menos os da primeira (um signo que fica com 0 é pulado);
a terceira repete a primeira, e assim por diante. Por padrão, tantas voltas
quantas cobrem 120 anos. No modo `pl9`, só a primeira volta, e pedir mais de
uma é recusado (`NotImplementedOptionError`).

Teste: "correction: the second run of the Narayana, Kendradi and Drig, 12
years less those of the first"; "the second run in the corrected mode".

### 17. Relatório "Niryaana Shoola Dasha"

**O que o PL9 faz.** O relatório com esse nome imprime o Drig.

**Por que é defeito.** O relatório não traz o dasha que nomeia.

**O que os modos fazem.** Nos dois, o Niryaana Shoola como a célula da
worksheet o dá (do mais forte entre o 2º e o 8º). O defeito é só do
relatório e não muda o cálculo; fica registrado porque a bancada pula essas
páginas.

### 18. Ashtakavarga: os nomes do método trocados

**O que o PL9 faz.** Com a opção "Ashtakavarga: Varamihira", o padrão, o PL9
calcula as casas de Parashara: Júpiter dá bindu no quadro da Lua na 12ª casa a
partir dele, e não na 2ª; Marte, no de Vênus, na 5ª e não na 4ª. Com
"Parashara", as de Varahamihira. Confirmado imprimindo com cada uma.

**Por que é defeito.** O nome da opção diz uma escola e o cálculo faz a
outra.

**O que o modo `corrected` faz.** Cada opção dá as casas da escola que ela
nomeia: "Varamihira" (o padrão, `method: 'varahamihira'`) as de Varahamihira,
"Parashara" as de Parashara.

**Efeito.** No padrão, o quadro da Lua e o de Vênus, a soma deles no
Sarvashtakavarga, as reduções e os pindas desses quadros, em quase todo mapa.

Teste: "correction: the names of the method the right way round".

### 19. Saptavargaja da Lua nos três primeiros graus de Touro

**O que o PL9 faz.** No D1, a Lua em Touro recebe 45 (moolatrikona) depois de
3° e **0** antes.

**Por que é defeito.** 0 está fora dos valores possíveis da parte (45, 30,
22,5, 15, 7,5, 3,75, 1,875).

**O que o modo `corrected` faz.** Nos três primeiros graus, os pontos da
relação composta da Lua com Vênus, o senhor de Touro, como em qualquer signo
alheio. No mesmo modo, o Saptavargaja e o Ojhayugma usam as vargas corrigidas
(correção 3, D2 a exatos 15°).

**Efeito.** Mapas com a Lua entre 0° e 3° de Touro: o Saptavargaja, o Sthana
e o total da Lua.

Teste: "correction: the Moon in the first three degrees of Taurus takes its
relationship with Venus in the Saptavargaja".

### 20. Dia do Shadbala além de 65° de latitude

**O que o PL9 faz.** Além de 65°, norte ou sul, conta o dia do Shadbala
(Nathonnatha, Tribhaga, a hora, o lado dia/noite dos senhores) como se o
lugar estivesse a 60° norte — no hemisfério sul, com as estações trocadas.

**Por que é defeito.** O instante que ele dá como nascer do sol não põe o Sol
no horizonte do lugar (primeiro critério).

**O que o modo `corrected` faz.** Usa a latitude do lugar. Onde a busca do PL9
(secantes) não assenta, como perto dos equinócios além de 65°, acha o
cruzamento mais próximo do palpite numa varredura de três em três minutos,
com bisseção. Nos testes de ±64° e ±66° em quatro datas do ano, o nascer e o
pôr ficaram a menos de 0,2 minuto do nascer do sol do `core`. Se nem assim há
cruzamento, o Shadbala é recusado com `SunriseUndefinedError`.

**Efeito.** Só mapas além de 65° de latitude: Nathonnatha, Tribhaga, Hora e
os totais.

Teste: "correction: the day of the Shadbala at the latitude of the place, past
65 degrees too".

### 21. Cheshta fora das séries de ciclos

**O que o PL9 faz.** Para nascimentos antes de cerca de 1806 ou depois de cerca
de 2045 (conforme o planeta), o índice do ciclo cai fora das séries do PL9, que
usa a data 0; a sua efeméride não a calcula, e o Cheshta sai arbitrário.

**Por que é defeito.** O valor não depende do mapa (segundo critério).

**O que o modo `corrected` faz.** Leva as mesmas séries adiante, para qualquer
índice, e o topo de Mercúrio a Saturno é sempre o do índice anterior (o PL9 o
toma do mesmo índice no primeiro ciclo). Conferidos contra a efeméride, os
zeros e topos extrapolados de 1800 a 2400 erram por poucos graus de elongação,
como os de dentro das séries.

**Efeito.** Só mapas fora das séries: o Cheshta de Marte a Saturno e o que dele
depende (totais, razões, classificação, Ishta e Kashta). Esses mapas deixam de
aparecer em `cheshtaOutsideSeries`.

Teste: "correction: the Cheshta past PL9's series, by the same series carried
on".

### 22. Pesos do Saptavarga deslocados

**O que o PL9 faz.** No Vimshopaka do Saptavarga, dá ao D7 o peso 1, ao D9 2,5,
ao D12 4,5 e ao D30 2 (em vintenas), os pesos dos livros deslocados uma varga
adiante.

**Por que é defeito.** Uma constante que difere da fonte que o próprio cálculo
segue (terceiro critério): o Shadvarga, o Dashavarga e o Shodashavarga do PL9 usam
os pesos dos livros.

**O que o modo `corrected` faz.** Os pesos dos livros: D1 5, D2 2, D3 3, D7 2,5,
D9 4,5, D12 2, D30 1.

**Efeito.** O Saptavarga de quase todo planeta; os outros grupos não mudam.

Teste: "correction: the Saptavarga weighed with the weights of the books in the
corrected mode".

### 23. Dia da semana repetido na impressão Panchang

**O que o PL9 faz.** No Print → Panchang, no dia seguinte a um tithi cujo fim passa
do nascer do sol seguinte (impresso "..."), repete o dia da semana da linha de cima:
10 de janeiro de 2026, um sábado, sai "Fri" (as três impressões de janeiro).

**Por que é defeito.** Um resultado impossível (segundo critério): a data da
mesma linha é um sábado.

**O que o modo `corrected` faz.** O dia da semana da data.

**Efeito.** Um dia em cada tithi que dura dois nasceres, só na tabela do Panchang;
os elementos, as horas e a página de nascimento não mudam.

Teste: "correction: the weekday of the Panchang table".

### 24. O senhor do ano quando só a Lua aspecta o Lagna

**O que o PL9 faz.** Quando nenhum outro ofício aspecta o Lagna anual e a Lua, um dos ofícios, o
aspecta, o programa tem um ramo cujo texto diz que, sendo a Lua mais forte que os outros
candidatos, o planeta mais forte em Ithasala com ela será o senhor do ano. A condição do ramo,
porém, foi escrita como "a Lua não é um dos ofícios", o contrário do que leva até ali: o ramo
nunca roda, e o senhor do ano fica o Muntha Pati.

**Por que é defeito.** Uma condição que contradiz a própria entrada do ramo (segundo
critério): o resultado não pode ser o que o texto do programa descreve.

**O que o modo `corrected` faz.** O ramo como o texto diz: se a força Panchavargeeya da Lua é
maior que a de todos os outros ofícios, o mais forte dos sete planetas em Ithasala com a Lua (no
empate, o primeiro na ordem do Sol a Saturno; o código morto do PL9 começaria a busca pelo Sol
mesmo fora do Ithasala); nenhum em Ithasala, o senhor do signo da Lua. Se a Lua não é a mais
forte, o Muntha Pati, como no PL9. O ramo não pede força mínima (o texto do PL9 não a pede, ao
contrário do ramo principal, que pede 5), e o Ithasala é o de `tajika.ts`: os dois signos em
aspecto, o mais rápido atrás do mais lento dentro do orbe, sem cruzar o fim do signo.

**Efeito.** O senhor do ano (e o do mês, que segue a mesma regra) nesse caso; os nós ficam de
fora, porque o PL9 não lhes dá velocidade Tajika.

Teste: "correction: the year lord the Moon's Ithasala names".

### 25. Relatórios acima de 120 anos

**O que o PL9 faz.** Pedida uma idade acima de 120, o cabeçalho escreve essa idade, mas o mapa
e tudo o que sai dele são de um instante perto do nascimento.

**Por que é defeito.** Um resultado que contradiz o próprio cabeçalho (segundo critério).

**O que o modo `corrected` faz.** O mapa da idade pedida.

**Efeito.** Os relatórios acima de 120 anos. O `core` calcula a idade pedida também no modo
`pl9`, que aqui não reproduz o PL9: o instante que ele usa não se identificou. A conferência
compara, nesses relatórios, só os 72 retornos.

Teste: "computes the age asked above 120 (correction 25: PL9 prints a chart near the birth)".

### 26. Partes da volta par na cadeia do Narayana

**O que o PL9 faz.** Na cadeia do Narayana no instante ("Gochara data", nos trânsitos e no
Muhurta), as mahadashas de uma volta par têm 12 anos menos os da primeira volta, mas as partes
abaixo delas são medidas pelos anos da primeira volta: uma mahadasha de 7 anos (5 na primeira
volta) tem doze partes de 5/12 de ano, e depois delas partes de 7/12. O PL9 conta a volta
pelas partes do nível em que está, não pelas mahadashas.

**Por que é defeito.** Partes que não preenchem o período, ou que passam dele, são resultados
fora do possível (primeiro critério), como na correção 16.

**O que o modo `corrected` faz.** Cada período em doze partes iguais, em todos os níveis.

**Efeito.** Os instantes de uma volta par, abaixo da mahadasha: nos 540 instantes conferidos dos
trânsitos, 113 cadeias diferem entre os modos (107 já no segundo nível), todas de mapas com mais
de uma volta de idade.

Teste: "the corrected mode divides the mahadasha of the second run in twelve equal parts".

### 27. Linhas da Patyayini sob o período errado

**O que o PL9 faz.** A tabela da Patyayini omite os subperíodos de menos de 5 minutos e
preenche cada período com as oito linhas seguintes da lista corrida: depois de uma linha
omitida, cada período começa no seu segundo subperíodo e termina com o primeiro do período
seguinte, e o último período termina com linhas do ciclo seguinte. Quando a primeira linha do
ano é omitida, o primeiro período inteiro some e o ano termina com um período do ciclo seguinte.

**Por que é defeito.** Subperíodos fora do período que os contém (primeiro critério): a tabela
põe sob um período linhas que começam depois do fim dele.

**O que o modo `corrected` faz.** Cada período com os seus oito subperíodos, por curtos que
sejam.

**Efeito.** Os anos com um subperíodo de menos de 5 minutos: 21 dos 172 relatórios
conferidos.

Teste: "prints the Patyayini as PL9 does: a part shorter than five minutes left out, the rows
moving on, eight to a period".

## O que não é corrigido

| Escolha do PL9 | Por que fica |
|---|---|
| Nascer do sol como o grau do Sol no horizonte, sem refração nem semidiâmetro | É uma definição, e tradicional |
| Constantes dos nove ayanamshas | Cada ayanamsha é uma convenção |
| Dia da semana do Gulika pelo relógio local, e pela data de doze horas antes à noite | Regra do programa, sem certo ou errado demonstrável |
| Modelo do nodo verdadeiro | Não se identificou de que fonte ele difere |
| Limites do D30 pertencendo à parte que termina | Convenção de fronteira |
| Lagna com nutação curta de quatro termos no tempo sideral e obliquidade média | Escolha de precisão do autor: não há constante trocada nem resultado impossível |
| Nodos nunca marcados como retrógrados | Convenção de exibição |
| Nakata e Yamaya nunca mostrados no Varshaphala, embora as regras (lidas no executável) se formem em muitos mapas | A escolha está no modelo do relatório, que não foi lido, e há leitura inocente (o par senhor do Lagna e do assunto); reabrir se o modelo for lido |
| Júpiter nunca o primeiro planeta de um par nos yogas construídos sobre o Ithasala, embora as regras aceitem o par | Também do modelo do relatório, não do código: suspeita, não demonstração; reabrir se o modelo for lido |

## Pontos que não se definem

Nos dois modos, um ponto que não se define no lugar dado fica fora do
resultado, e a lista `missing` diz qual e por quê; o resto do mapa volta.

| Situação | Falta | Motivo |
|---|---|---|
| Além do círculo polar (a partir de 90° menos a obliquidade) | Lagna, Gulika, Prana Pada, Mandi, casas | `beyondPolarCircle` |
| Busca do nascer do sol sem resultado utilizável: modo `pl9` a partir de 65°; qualquer modo a menos de meio milésimo de grau do círculo polar ou a cerca de um dia do fim dos dados de efemérides | Gulika, Prana Pada, Mandi | `sunriseNotFound` |

## Diferença entre os modos nos mapas de referência

Diferença absoluta entre `corrected` e `pl9`, em segundos de arco, nos 380
mapas de referência (1801 a 2047). Gerada em 2026-10-13 por
`pnpm --filter @reverse/oracle compare-modes`.

| Ponto | Mediana | Percentil 95 | Máxima |
|---|---|---|---|
| Sol | 0,078 | 1,315 | 1,786 |
| Lua | 1,025 | 18,330 | 25,847 |
| Marte | 0,037 | 0,863 | 1,348 |
| Mercúrio | 0,090 | 2,172 | 2,867 |
| Júpiter | 0,009 | 0,253 | 0,399 |
| Vênus | 0,076 | 1,465 | 2,166 |
| Saturno | 0,004 | 0,089 | 0,163 |
| Rahu e Ketu | 0,002 | 0,085 | 0,295 |
| Urano | 0,002 | 0,054 | 0,105 |
| Netuno | 0,002 | 0,040 | 0,062 |
| Plutão | 0,001 | 0,029 | 0,050 |
| Dhuma a Upaketu | 0,078 | 1,315 | 1,786 |
| Gulika | 2,825 | 9,262 | 12,055 |
| Prana Pada | 2,646 | 28,462 | 46,634 |
| Lagna | 0,000 | 0,002 | 0,002 |

Quase toda a diferença nos planetas vem do Delta T, e se concentra nos
mapas anteriores a 1900 e posteriores a 2014.

## O que o modo corrigido não tem

Gabarito externo. O campo `verified` do resultado diz só que o mapa está na
faixa de datas e latitudes em que o modo `pl9` foi conferido; não diz que os
números do modo `corrected` coincidem com os do PL9. O modo `pl9` é conferido contra o PL9; o modo `corrected`
é conferido por coerência interna — o grau do Sol está no horizonte, o
coeficiente é o da série publicada — e não contra outro programa. Onde os
dois modos coincidem, a conferência do modo `pl9` vale para os dois; onde
diferem, vale o teste da correção e nada mais.
