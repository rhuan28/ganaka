# Varshaphala (etapa 5C)

O mapa anual (retorno solar) e o que o PL9 tira dele, como o `core` o calcula
(`packages/core/src/varshaphala/`) e de onde vem cada regra. Gabaritos: os relatórios do
Varshaphala dos PDFs TEMPO nos 135 mapas de referência (`packages/oracle/fixtures-varshaphala/`,
a idade respondida em cada data de referência), os 72 retornos dos "Varshaphala Charts" e a
alternativa "Mean solar return" em 30 mapas (`fixtures-varshaphala-options/mean/`).

## O ano de idade e o retorno

Lido no executável:

- O ano de idade de uma data são os anos siderais médios (365,25636 dias) inteiros do
  nascimento até ela, também no modo do retorno verdadeiro; antes do nascimento, 0.
- O retorno verdadeiro (o padrão): a partir do nascimento mais 365,2422 dias por ano (os meses
  contados como doze avos e os dias como 360 avos do ano), calculado em precisão simples, três
  passos de um dia por grau que o Sol está fora da sua longitude natal (mais 30° por mês e 1° por
  dia nos retornos mensal e diário), sem teste de tolerância. Como o ponto de partida tem a
  precisão simples (um quarto de dia nas datas de hoje) e os passos são fixos, o `core`
  reproduz os dois.
- O retorno médio: o nascimento mais 365,25636 dias por ano, 30,43803 por mês e 1,01460 por dia.
- O mapa anual é levantado no local de nascimento (as variantes "(L)", no do evento "Today").

Dos dados: o retorno do ano 0 é o próprio nascimento. Os relatórios aceitam idades até 120;
acima disso, o cabeçalho escreve a idade pedida mas o mapa é o de um instante perto do
nascimento, que não se identificou. O `core` calcula a idade pedida (correção 25); a conferência compara,
nesses relatórios, só os 72 retornos (que não dependem da data) e deixa o resto de fora.

Sem Lagna (além do círculo polar), o mapa anual não tem casas nem dia e noite: o `core` dá os
planetas, a Panchavargeeya e os Mudda, e diz o que falta — a Harsha, o senhor do ano, os
Sahams, o Patyayini, o Tripataki, e os yogas que pedem casas (Iqabala, Induvara, Kutta) não se formam. Com
o nascimento além do círculo polar falta também a Muntha.

## A Muntha

Dos dados (97% dos 9720 retornos ao segundo, o resto a 1"): o Lagna natal mais 30° por ano
sideral médio decorrido do nascimento até o retorno — por isso os segundos variam de um ano
para outro, e a Muntha dos mapas mensais avança cerca de 2,5° por mês.

## As relações Tajika

Lidas no executável. Tudo se conta pelos signos: o signo de um planeta contado a partir do
signo do outro (1 a 12). Há aspecto em todas as posições menos a 2ª, a 6ª, a 8ª e a 12ª. A
relação é de amigo na 3ª, 5ª, 9ª e 11ª, de inimigo na 1ª, 4ª, 7ª e 10ª, e neutra nas outras.

Ithasala: os dois signos em aspecto; o planeta mais rápido (na ordem Lua, Mercúrio, Vênus, Sol,
Marte, Júpiter, Saturno), não retrógrado, atrás do mais lento pelo grau dentro do signo, a menos
da metade da soma dos orbes (Sol 15°, Lua 12°, Marte 8°, Mercúrio 7°, Júpiter 9°, Vênus 7°,
Saturno 9°).

Um planeta mais rápido retrógrado atrás do mais lento não está em Ithasala nem em Esharpha
(que pede o mais rápido à frente): o PL9 não inverte os papéis pela retrogradação, e o `core`
faz o mesmo.

## As forças

Lidas no executável.

- Panchavargeeya: cinco forças, cada uma (menos a Uchcha) pelo senhor da divisão em que o
  planeta está — o próprio planeta, um amigo, um neutro ou um inimigo pela relação Tajika dos
  signos: Graha (o signo) 30/22,5/15/7,5; Hudda (os termos Tajika, cinco por signo, com o fim de
  cada termo pertencendo a ele) 15/11,25/7,5/3,75; Drekkana (os senhores na ordem dos dias da
  semana) 10/7,5/5/2,5; Navamsha 5/3,75/2,5/1,25; e a Uchcha, a distância ao ponto de
  debilitação (Sol 190°, Lua 213°, Marte 118°, Mercúrio 345°, Júpiter 275°, Vênus 177°,
  Saturno 20°) dividida por 9. O total é a soma vezes 0,25.
- Harsha: 5 para cada uma de quatro condições — o planeta na sua casa (Sol 9, Lua 3, Marte 6,
  Mercúrio 1, Júpiter 11, Vênus 5, Saturno 12); exaltado, em moolatrikona ou no próprio signo;
  um planeta feminino (Lua, Mercúrio, Vênus, Saturno) nas casas 1 a 3 e 7 a 9, ou um masculino
  nas outras; um feminino num mapa de noite, ou um masculino num de dia. As casas são contadas
  por signo a partir do Lagna anual (dos dados: 2099 de 2100).

## O senhor do ano

Lido no executável. Os cinco ofícios: os senhores da Muntha, do Lagna natal e do Lagna anual, o
Trirashi Pati (por signo do Lagna anual, de dia e de noite) e o Dina-Ratri Pati (o senhor do
signo do Sol de dia, o da Lua de noite). O mapa é de dia quando o Sol está a mais de 180° à
frente do Lagna. Dos ofícios que não são a Lua e cujo signo aspecta o Lagna anual, o mais forte
(o total do Panchavargeeya; no empate, o primeiro na ordem do Sol a Saturno), se a força chega a
5; senão, e quando nenhum aspecta, o Muntha Pati. Quando a Lua é ofício e só ela aspecta, o PL9
fica com o Muntha Pati (dos dados: 140 de 140 retornos assim): o ramo que daria o planeta mais
forte em Ithasala com a Lua tem uma condição que nunca se cumpre. O modo `corrected` segue esse
ramo como o seu texto diz (correção 24 em `docs/spec/correcoes.md`).

## Os yogas Tajika

Lidos no executável: 22 regras sobre pares (ou trios) de planetas, que o relatório agrupa nos 16
nomes que imprime — Iqabala (todos os planetas em kendra ou panaphara) e Induvara (todos em
apoklima); Ithasala de quatro modos (o comum a mais de 1°, o completo a menos de 1°, o do
planeta no último grau rumo ao signo seguinte e o que atravessa a fronteira); Esharpha (o mais
rápido à frente, entre 1° e 30°, dentro dos orbes); Manua (Ithasala com Marte ou Saturno em
aspecto com o mais rápido); Kamboola (Ithasala e a Lua em Ithasala com um dos dois); Gairi-
Kamboola e Khallsara (a Lua sem qualificação); Rudda (Ithasala e um dos dois combusto,
debilitado, nas casas 6, 8 ou 12, ou com Marte ou Saturno em aspecto); Duphali-Kutta;
Dutthotta-Daivira; Tambira; Kutta; Durupha (os dois nas casas 6, 8 ou 12, retrógrados e
combustos).

Dos dados:

- O relatório nomeia cada par com o mais rápido primeiro, e nunca toma Júpiter como o primeiro,
  salvo no Ithasala (Júpiter e Saturno aparecem 25 vezes no Ithasala e nunca nos yogas
  construídos sobre ele). As regras aceitam o par e as rotinas que percorrem os pares cobrem os
  sete planetas: a omissão vem do modelo do relatório ("O que não é corrigido" em
  `docs/spec/correcoes.md`).
- Nakata e Yamaya nunca aparecem (0 em 600 relatórios), embora as suas regras, com os orbes de
  todos os planetas, se formem em muitos mapas; o `core` não os conta, nos dois modos ("O que não é
  corrigido" em `docs/spec/correcoes.md`).
- A combustão: dentro de 17° do Sol para Marte, 14° (12° retrógrado) para Mercúrio, 11° para
  Júpiter, 10° (8° retrógrado) para Vênus e 15° para Saturno; a Lua nunca (270 de 270 mapas
  por planeta).
- Pendentes: os pares que o relatório omite em 15 de 161 Manuas e 5 de 161 Kamboolas (a regra
  lida no executável os daria), e o Kutta e o Tambira. As duas regras estão lidas e recebem um
  par de planetas; o par vem do modelo do relatório (dados do programa, não código), e nenhuma
  combinação de papéis (ofícios, senhor do ano, senhores das casas do Lagna anual, do natal e da
  Muntha, os planetas) reproduz o que o relatório imprime (o melhor, no Kutta, acerta 130 de 161,
  contra 128 de "nunca"). O `core` os calcula para o par dado.

## O Tripataki Chakra

Lido no executável e conferido nos dados. Cada ponto sai do seu signo natal e anda, a cada ano
completo, um signo: a Lua num ciclo de 9, Marte num de 6, o Sol, Mercúrio, Júpiter, Vênus e
Saturno num de 4; Rahu e Ketu andam para trás num ciclo de 6; o Lagna fica no signo natal. O
chakra mostra o signo de cada planeta (o PL9 não imprime um planeta desenhado sobre outro).

As vedhas: contadas as casas a partir do Lagna anual (1 = o Lagna), um planeta faz vedha num
ponto quando a sua casa está no conjunto da casa do ponto: as casas 1, 4, 7 e 10 entre si;
2 com 2, 3, 6, 9; 3 com 2, 3, 8, 11; 5 com 5, 6, 9, 12; 6 com 3, 5, 6, 11; 8 com 3, 8, 9, 12;
9 com 2, 5, 8, 9; 11 com 5, 6, 11, 12; 12 com 5, 8, 11, 12. O relatório lista as vedhas do
Lagna e dos sete planetas.

Conferência: as casas impressas e as listas de vedha dos 172 relatórios até 120 anos, 2918
valores, todos iguais.

## Os Sahams

A regra não se achou no executável (os nomes estão cifrados); as fórmulas vêm dos dados, cada uma
procurada entre todas as combinações de pontos e conferida nos 161 mapas anuais até 120 anos.
Todo Saham é A − B + C, somando 30° quando C não está entre B e A (contando de B para a frente);
em parte deles A e B trocam de lugar à noite. Os pontos: o Lagna, os planetas, o Punya e o Vidya,
15° de Câncer, o meio das casas (Sripati) e o lugar do senhor do signo de uma casa. O Samartha usa
Júpiter − Marte quando Marte rege o Lagna; o Karyasiddhi é Saturno − Sol + o senhor do signo do
Sol de dia, Saturno − Lua + o senhor do signo da Lua de noite. A tabela completa está em
`packages/core/src/varshaphala/sahams.ts`.

Conferência: os Sahams sem o Lagna batem ao segundo (Gaurava, Sastra, Jadya: 172 de 172); os
outros, a menos de 30" (o Lagna anda 15" por segundo de tempo, e o retorno é conhecido a um
segundo). Pendentes: 9 Karyesiddhis a 30° (a regra dos 30° neles não se fechou) e um ou dois
casos em Yasa, Mahatmya, Paradesa, Artha, Bandhana, Apamrityu e Labha.

## Os dashas anuais

Sem âncora de texto no executável; as regras vêm dos dados, nos quatro relatórios de 161 anos.
O ano dos dashas tem 365,2422 dias.

- Mudda: a ordem do Vimshottari, cada período (anos do senhor) / 120 do ano e os subperíodos na
  mesma proporção a partir do próprio senhor. Começa pelo senhor do nakshatra natal contado
  adiante pelos anos completos (o nakshatra da Lua natal mais os anos). Com o saldo da Lua ao
  nascer, o primeiro período começou antes do retorno pela parte que a Lua natal já percorrera
  do seu nakshatra; o relatório mostra os subperíodos a partir do que corre no retorno.
- Mudda (Kalidasa), "balance based on moon in Varshaphala": o mesmo, a partir do senhor do
  nakshatra da Lua anual e com o saldo dela.
- Mudda sem saldo: começa no retorno, com o período inteiro.
- Os períodos seguem até cobrir o ano; o que começa no fim dele também é listado.
- Patyayini: os sete planetas e o Lagna na ordem dos graus dentro do signo; cada período é o
  avanço do seu grau sobre o anterior (o primeiro, o próprio grau) como fração do maior, vezes o
  ano; os subperíodos, as mesmas frações de cada período, a partir do próprio senhor.
- A impressão da Patyayini (dos dados; quem desenha a tabela é o modelo do relatório, não o
  executável): as linhas dos subperíodos uma após a outra, ciclo após ciclo, sem as de menos de
  5 minutos (as mais longas omitidas têm 4,85 minutos; as mais curtas mostradas, 5,12), oito por
  período; cada período leva o senhor do período da sua primeira linha, do início dela ao fim
  da última. Quando a primeira linha do ano é omitida, o primeiro período sai inteiro (três
  relatórios). Assim uma linha curta empurra as seguintes um período para trás, e o último
  período termina com linhas do ciclo seguinte. O modo `corrected` dá a cada período os seus
  próprios subperíodos (`docs/spec/correcoes.md`, 27).
- As horas são cortadas no minuto.

Conferência (até 120 anos, 2 datas): os senhores e as datas de fim de todos os períodos do Mudda,
nos três modos (1610 de 1610 cada); as horas dos subperíodos a um minuto (as do Kalidasa ficam até
um minuto antes: a Lua anual, que anda 0,5" por segundo de tempo, fixa o início). Patyayini: a
rotina dos períodos, lida no executável, é a do `core` (a ordem pelo grau no signo, com o Lagna;
cada período, o avanço sobre o anterior como fração do maior grau; o ano de 365,2422 dias). Com a
regra da impressão acima, os 21 relatórios que antes divergiam caem para 3 (REF 0003, 0268 e 0272
em 2000), pendentes: no REF 0003 o PL9 omite uma linha de 13 horas, e nos outros dois mostra, no
ciclo seguinte, uma linha de 1,7 minuto dentro de um período de 8 minutos. Uma hipótese testada
e descartada: tempos em precisão simples (dias desde 1899, resolução de 5,6 minutos) com a
linha omitida quando início e fim coincidem; ela explica 51 das 69 linhas omitidas, contra 68 da
regra dos 5 minutos.

## Impressão

As horas e os graus dos "Varshaphala Charts" e dos mapas mensais são arredondados ao segundo e
mostrados até o minuto (dos dados: com o arredondamento direto ao minuto, dezenas de horas
diferem).

## Conferência

Na bancada (`pnpm --filter @reverse/oracle verify`, seção "Varshaphala"): os relatórios até 120
anos nas duas datas e os 30 do retorno médio (172 relatórios), mais os 72 retornos dos 65
relatórios de 2030 acima de 120 anos, 334 mil valores; os pendentes, listados por relatório (os
pares que alguns yogas omitem ou a mais, a Patyayini em 3 relatórios e alguns Sahams), não
falham. Não comparados: o Kutta e o Tambira, e o SB (o Shadbala do mapa
anual, que bate com o do `core` em 389 de 490 valores, com a mediana da diferença em zero: uma
componente difere e não se achou qual).

## Os worksheets do ano do relógio

Os worksheets 64 a 92 mostram o ano de idade em que está o relógio da impressão (no lugar de
nascimento; 67 no lugar do evento "Today"). Conferidos nos 270 PDFs (`verifyVarshaClock`):

- o ano e o retorno (64), ao segundo; o ano é o do `core` no relógio da impressão (`ageAt`: os anos siderais
  médios inteiros, 0 antes do nascimento), como os anos, meses e dias dos retornos mensal e diário (75, 81:
  os doze avos e os 360 avos inteiros do ano no resto), conferidos com eles;
- a tabela do mapa anual (66): grau, signo, nakshatra, senhores KP, R/c, dignidade, SB%, e onde a
  linha sai inteira, SB#, VB, os bindus e a Avastha. As colunas contadas e a Avastha são cortadas de
  um jeito em cada mapa (dos dados: o mesmo mapa nas duas datas, mapas diferentes de jeitos
  diferentes), e só se conferem onde a linha do Sol traz todas. Os bindus são os do Ashtakavarga do
  próprio mapa anual (Rahu os do Lagna, Ketu nenhum), como nas vargas dos trânsitos. A Lua sai
  combusta a menos de 12° do Sol (`combustInTable`), o que os relatórios nunca mostram. O SB% aqui
  é o do Shadbala do mapa anual no lugar de nascimento, igual ao do `core` (com meio centésimo de
  folga nos valores exatamente na metade);
- os kakshas dos planetas anuais no Ashtakavarga natal (66), como os dos trânsitos;
- a Panchavargeeya a uma casa, os cinco ofícios com a força a duas, o senhor do ano e a Muntha
  arredondada ao segundo e mostrada até o minuto (65);
- os 37 Sahams do mapa natal e os 37 do anual (74), com as pendências dos relatórios.

O VB dos nós fica pendente, como no Muhurta. Não lidos: os mapas desenhados (a D9, os oito mapas
de 70, os de 91 e 92, que não trazem os yogas nem o Tripataki em texto) e a variante (L) de 67,
que repete 64 no lugar do evento.

### As listas de dashas (64, 65, 75, 81 e 89)

Doze listas de 15 linhas (cadeia de senhores, dia da semana e data do início), conferidas nos 270
PDFs (`worksheetDashaLists`, `verifyVarshaLists`):

- 89: a Patyayini, o Mudda, o Mudda (Kalidasa) e o Mudda sem saldo em três níveis, e o Vimshottari
  natal em três; 64: o Kalidasa e o natal em três; 65: o Kalidasa em quatro; 75 e 81: o dasha do
  retorno mensal e do diário, e o natal outra vez.
- O início: a linha que corre no relógio da impressão lido como UT (o relógio + 5h30, como nas
  outras páginas do relógio), ou o retorno quando ele vem depois; a lista diária começa sempre no
  seu retorno, e a natal no relógio ou no primeiro período.
- Os níveis abaixo dos períodos anuais (`deepenAnnual`): no Mudda, os anos do Vimshottari / 120 a
  partir do próprio senhor; na Patyayini, as frações dos subperíodos do primeiro período a partir
  do próprio senhor, sobre os períodos verdadeiros (os do modo `corrected`), ciclo após ciclo.
- As partes de menos de 5 minutos saem, menos a primeira do ano (a regra da Patyayini dos
  relatórios; o Kalidasa em quatro níveis também perde partes de 3,8 minutos).
- Os retornos mensal e diário: o mapa do retorno (75: anos e meses; 81: anos, meses e dias) e o
  Mudda da Lua dele (`moonMudda`), a partir do senhor do nakshatra da Lua com o saldo dela, sobre
  365,2422/12 dias no mensal (três níveis) e 365,2422/360 no diário (um nível). O cabeçalho do
  retorno é conferido a 25 segundos: o PL9 o dá até 20 segundos antes do `core` (causa não achada).
- As datas no relógio do nascimento, com 15 segundos de folga na meia-noite (60 nas listas do
  Kalidasa, cujo início a Lua anual fixa até um minuto antes).

Resultado: 49140 valores, 0 problemas. Casos de borda: sete listas que o PL9 começa uma linha
depois, todas com um período que começa menos de um minuto após o relógio (a bancada só aceita a
linha adiante nessa condição). A idade no relógio: 1620 valores; um dia de idade (REF
0037) vira 53 segundos depois do relógio e é caso de borda. Pendentes: a Patyayini
de oito mapas (as mesmas nas duas datas), onde o PL9 omite ou troca linhas sem regra achada (no
REF 0269 mostra partes de 4,57 e 4,44 minutos e omite a de 4,60 entre elas; nos REF 0010, 0269 e
0270 mantém só as últimas partes de um subperíodo curto). Como os pendentes dos relatórios, quem
desenha essas linhas é o modelo do relatório. Testada e descartada: tempos em precisão simples
(224 de 270 listas, contra 254 com a regra dos 5 minutos).


Os 72 retornos dos 135 mapas: datas 9720 de 9720; horas 9695, as outras 25 a um segundo da
virada do minuto; graus 87123 de 87480, os outros do Lagna (que anda 15" por segundo de tempo)
na virada do minuto. O retorno do ano nos relatórios até 120 anos: 161 de 161 a um segundo, os
planetas a menos de 1". Os mapas mensais: 2063 de 2064 horas. O senhor do ano: 9720 de 9720 nos
retornos, 299 de 300 nos relatórios. Harsha 2099 de 2100, Panchavargeeya 2078 de 2100 (as
diferenças nos relatórios acima de 120 anos), os ofícios 1499 de 1500.
