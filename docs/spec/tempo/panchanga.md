# Panchanga (etapa 5B)

O panchanga que o PL9 mostra para um instante e lugar e o que ele imprime para o
nascimento ("Panchanga Details" e "Basic Calculations"), como o `core` o calcula
(`packages/core/src/panchanga/`) e de onde vem cada regra. Gabaritos: as páginas de
nascimento dos 135 mapas de referência (`packages/oracle/fixtures-panchanga/`, sobre as
cópias com o nascimento arredondado ao segundo, `refset-tempo.json`) e os tithi, karana e
yoga dos 540 instantes dos trânsitos (`fixtures-transits/`) e as seis impressões Print → Panchang
do REF 0010 (`fixtures-panchanga/panchang/`).

## Os elementos

Lidos no executável. Com E = Lua − Sol (siderais), o tithi é a parte inteira de E / 12 mais 1
(1 a 30), o karana a de E / 6 mais 1 (1 a 60), o nakshatra a da Lua / 13°20' mais 1, o yoga a
de (Sol + Lua + 93°20') / 13°20' — o mesmo que contar a soma em partes de 13°20', pois 93°20'
são sete partes. Os 60 karanas têm 11 nomes: Kimstughna no primeiro, os sete móveis
repetidos oito vezes, e Shakuni, Chatushpada e Naga nos três últimos. Os nomes vêm dos PDFs
(no executável são texto cifrado); o PL9 escreve Vishti nas páginas de nascimento e Visthi
nos "Gochara data", e o nakshatra das páginas de nascimento com outra grafia que a das
páginas de trânsito ("Mrigasira", "Poorva Phalg.").

## Nascer e pôr do sol

O que a página imprime (lido no executável): o momento em que o Lagna (o ponto oposto, no
pôr) alcança um Sol que anda 0,985653° por dia a partir do seu lugar verdadeiro no
instante, por secantes a partir de uma inclinação de 360° por dia (o dobro além de 60° de
latitude nos três primeiros passos), até 0,0005° no nascer e 0,001° no pôr, em no máximo
nove passos; depois, um passo a mais sobre o Sol verdadeiro, sem conferir. O pôr parte do
palpite do nascer mais meio dia e mantém o Sol onde o Sol linear estava no nascer. O nascer
seguinte é procurado do mesmo modo a partir de 1,1 dia depois, sem o último passo. A hora é
arredondada ao segundo. No modo `corrected`, os instantes exatos (correções 1 e 2 em
`docs/spec/correcoes.md`). Onde o Sol não nasce (além do círculo polar, ou sem raiz achada),
o panchanga dá o que não depende do nascer — os elementos no instante, os calendários, o
Avakhada sem o Rashi Paya, o Ghat Chakra, Bhayat e Bhabhog — e diz em `missing` o que falta;
o nascer, o pôr, os elementos ao nascer do sol, o dia da semana védico e o Ishtkaal ficam
nulos.

## Os fins

Lidos no executável. Cada fim é procurado com um número fixo de passos em linha reta sobre a
velocidade em cada passo, sem testar se chegou: quatro para o tithi, três para o karana, o
yoga e o nakshatra. A busca parte do nascer do sol do Shadbala (o Sol a 1° por dia, etapa 4),
não do nascer impresso — como os passos são fixos, o ponto de partida aparece no resultado,
e é com ele que os fins batem. O yoga fica um segundo depois do do PL9 em 13 dos 135
nascimentos, sem causa achada; a bancada aceita um segundo para cada lado nos fins.

Ghatis (de 24 minutos), vighatis e palas: cada um truncado, os ghatis sem volta em 60
("62:14:45"); o Ishtkaal conta do nascer ao nascimento, o Bhayat da entrada da Lua no
nakshatra ao nascimento, o Bhabhog da entrada à saída.

## Calendários

Lidos no executável:

- O mês lunar: o de uma lua nova é o signo do Sol nela (Peixes dá Chaitra). Três modos
  ("Indian Calendar"): Krishnadi (purnimanta: o paksha escuro é do mês da lua nova seguinte,
  o padrão), Shukladi (amanta: do mês da lua nova anterior) e Krishnadi 1/2 (como o
  Krishnadi). O mês é intercalar quando, no Krishnadi e no Shukladi, o mês amanta que contém
  a data tem as duas luas novas com o Sol no mesmo signo (não há sankranti entre elas), e,
  no Krishnadi 1/2, quando a lua nova que dá o nome e a anterior a ela têm. O PL9 escreve
  "Adhik" antes do nome, e "First" no Krishnadi 1/2 (este, das impressões: junho de 2026).
  Na página de nascimento, o sistema Chaitradi usa o purnimanta e o Kartikadi o amanta,
  qualquer que seja a opção.
- O ano Vikram: Chaitradi, o ano civil mais 57; mais 56 de janeiro a maio em Pausha, Magha
  ou Phalguna, e em Chaitra enquanto corre o seu paksha escuro. Kartikadi, mais 56; mais 57
  de julho a dezembro, de Kartika a Magha (no modo amanta). O Saka é o Vikram Chaitradi menos
  135.

Dos dados: a estação, a ayana e a gola seguem o Sol tropical (estações de dois signos a
partir de Vasant em Peixes e Áries; Uttarayan de Capricórnio a Gêmeos; Uttar de Áries a
Virgem). O PL9 calcula as luas novas e cheias de modo aproximado: em 4 dos 135 nascimentos,
a horas de uma lua cheia ou com o Sol a um fio da mudança de signo, o mês Chaitradi dele é
outro (pendente na bancada).

O dia da semana védico: o código do PL9 não foi achado. O `core` toma o dia do instante na
hora média local (pela longitude), um a menos antes do nascer desse dia; isso dá 118 dos 135
dias do PL9 (os outros, pendentes na bancada).

O calendário tâmil não é calculado pelo PL9: ele o lê de um almanaque em arquivo, que cobre
de 1941 a 2020 (fora disso imprime "NA"). Uma regra calculada acerta 33 dos 46 mapas dentro
do intervalo; o `core` não o reproduz.

## Avakhada e Ghat Chakra

As tabelas estão no executável, com os nomes cifrados; vêm por isso dos PDFs
(`tables.ts`, geradas dos 135 nascimentos): yoni, gana, nadi, yunja e paya pelo nakshatra;
varna, tattva e senhor pelo signo da Lua; a sílaba do nome e a varga pelo pada (103 dos 108
padas observados; os outros cinco ficam sem valor); o Ghat Chakra pelo signo da Lua. A
Vashya muda aos 15° de Sagitário e de Capricórnio (lido no executável). O Paya do signo é pela
casa da Lua a partir do Lagna: ouro nas 1, 6 e 11, prata nas 2, 5 e 9, cobre nas 3, 7 e 10,
ferro nas 4, 8 e 12 (dos dados, 135 de 135).

## Horas

A correção da hora média local é a longitude leste / 15 menos o fuso; a hora sideral, a de
Greenwich mais a longitude / 15, sem volta em 24 (lidos no executável). O PL9 perde o "vai um"
quando os segundos arredondam para 60 num minuto exato (69° de longitude, 4,6 horas,
impresso "04:35:00").

## Tithi Pravesh

Lido no executável: para o ano de idade que contém uma data, os anos siderais médios
(365,25636 dias) inteiros do nascimento até ela; a partir do nascimento mais esse número de
anos de 365,2422 dias, o Sol levado ao começo do seu signo natal, e então três passos em linha
reta para a frente até o ângulo Lua − Sol do nascimento. A variante (L) é o mesmo instante
mostrado no lugar e no fuso do evento "Today". Dos dados: uma data antes do nascimento conta
como idade 0, o que pode dar um momento antes do nascimento. Nos 135 mapas (na data impressa
em cada PDF): 135 iguais ao segundo, nas duas variantes.

## Mapa do nascer do sol

O worksheet "Sunrise chart" mostra o mapa no nascer do sol que abre o dia do nascimento, no
lugar do nascimento (`computeSunriseChart`): o mesmo nascer do sol do panchanga de nascimento.
O título do mapa vem do modelo do relatório; o instante saiu dos dados, igual ao minuto nos 135
mapas, com os graus arredondados ao segundo e mostrados até o minuto, como nas páginas do Varshaphala
(dos dados: o corte direto deixa 8 pontos um minuto abaixo, o arredondamento ao minuto erra em todos). Ao lado, 15 linhas do Vimshottari desse mapa, em dois níveis (da Lua no nascer do sol),
a partir da antardasha em curso no relógio da impressão lido como UT (ou a seguinte, se começa menos de um
minuto depois; ou a primeira, num nascimento depois do relógio; conferido nos 270), com o dia da semana e a data no relógio
do nascimento (um início a menos de 15 segundos da meia-noite pode sair em qualquer dos dois dias:
REF 0278, 9,5 s antes). Sem nascer do sol nesse dia, não há mapa. Conferido nos 135 mapas, nas
duas datas: as dez posições e as 15 linhas, 6750 valores. A D9 desenhada não é conferida à parte:
é a varga da etapa 2 sobre as mesmas posições.

## Panch Pakshi (worksheet 39)

Lido no executável (`panchPakshi`, `panchPakshiDay`):

- Os cinco pássaros, nesta numeração: Vulture, Owl, Crow, Cock, Peacock; as cinco atividades: Eating,
  Walking, Ruling, Sleeping, Dying.
- O pássaro do nativo: a Lua natal em cinco faixas de nakshatras (até 66°40', 146°40', 213°20', 280° e o
  resto: 5, 6, 5, 5 e 6 nakshatras), contado ao contrário (6 − n) quando a Lua passou da oposição do Sol.
- A quinzena: clara com o tithi do instante abaixo de 16.
- O dia: do nascer do sol antes do instante ao seguinte (os do panchanga), no lugar do evento; o dia e a
  noite em cinco yamas iguais. As tabelas usam o dia da semana védico desse nascer (Domingo = 1): um relógio
  às 04:06 de um sábado toma as de sexta. O cabeçalho imprime o dia civil.
- Por quinzena e dia/noite: o próximo pássaro (de noite o anterior; de dia, na clara o seguinte e na escura
  três adiante), a próxima atividade (uma, duas, três ou quatro adiante: clara de dia, clara de noite,
  escura de dia, escura de noite), as partes de cada atividade num yama (em 24 avos, Eating a Dying: clara
  de dia 5 6 8 3 2; clara de noite 5 5 4 4 6; escura de dia 8 6 3 2 5; escura de noite 7 7 3 3 4) e o primeiro
  pássaro de cada dia da semana, que rege o primeiro yama.
- No primeiro yama, o pássaro do nativo faz a atividade a que se chega andando pássaros e atividades a
  partir do primeiro pássaro do dia em Ruling; cada yama seguinte, a próxima atividade. Cada yama em cinco
  partes, a partir do pássaro do nativo e da atividade do yama, cada uma pela sua fração.
- O "Ruling bird": o pássaro a que se chega, a partir do primeiro do dia em Ruling, quando a atividade
  chega a Eating (de dia e de noite). O "Dying bird": uma tabela por dia da semana e quinzena.
- A relação ao pássaro do nativo: o próprio; amigos Vulture–Peacock, Owl–Crow, Cock–Peacock, e na
  quinzena clara Vulture–Owl e Crow–Cock, na escura Vulture–Crow e Owl–Cock; os outros, inimigos.

Conferência (270 PDFs, Jaipur, horas a 2 segundos): o cabeçalho, os dez yamas e as 50 partes, 63720 de
63720 valores. Os 270 relógios são de 17 de outubro de 2026 (um sábado), entre 00:51 e 07:54: as
tabelas por dia da semana só se exercem em sexta e sábado (antes e depois do nascer do sol), e só
na quinzena clara. As linhas dos outros cinco dias e as regras da quinzena escura vêm só do
executável, sem conferência. Num lugar sem nascer do sol nesse dia (o lugar do evento, não o do
nascimento) não há Panch Pakshi.

## A impressão Panchang

Print → Panchang imprime, para quinze dias a partir de um domingo, no lugar do evento
"Today" (Jaipur nos mapas de referência), uma linha por dia civil. O `core` a reproduz em
`computePanchangTable` (linha de comando: `panchanga --at … --days n --calendar …`).

- O diálogo segue o ano do relógio da máquina: a caixa do ano muda o texto mas não a lista
  das quinzenas nem a tabela. As impressões são por isso de 2026 (28 de dezembro de 2025 e
  14 de junho de 2026, esta com o Adhik Jyeshtha), nos três modos do calendário.
- Cada linha: o nascer e o pôr do sol, a duração do dia, e o tithi, o nakshatra, o yoga e o
  karana ao nascer do sol com os seus fins, como na página de nascimento (os fins contados
  da meia-noite do dia, além de 24 horas quando passam dela, e "..." quando passam do nascer
  seguinte). O tithi leva o nome do paksha só onde ele muda. Um tithi que começa e termina
  entre dois nasceres ganha uma linha própria, com o seu fim.
- O fim do nakshatra é achado de outro modo que o da página de nascimento: a Lua a cada meio
  dia de tempo universal, o cruzamento posto em linha reta entre as duas amostras, a busca
  das tabelas de trânsito (dos dados: 83 de 84 dias ao segundo, um a um segundo).
- O cabeçalho: o mês e o paksha do primeiro nascer do sol no modo escolhido, o ano Vikram
  Chaitradi (Krishnadi e Krishnadi 1/2) ou Kartikadi (Shukladi), o Saka, e a ayanamsha
  verdadeira, com a nutação (dos dados, ao segundo de arco).
- No dia seguinte a um tithi impresso "...", o PL9 repete o dia da semana da linha de cima
  (10 de janeiro de 2026, um sábado, sai "Fri"). O modo `pl9` reproduz a repetição; o
  `corrected` dá o dia da data (correção 23 em `docs/spec/correcoes.md`).
- Não reproduzidos: o nascer e o pôr da Lua (o PL9 repete o da véspera quando a Lua não se
  põe no dia), os trânsitos e a marca de auspicioso de cada dia, o Ratriman do cabeçalho
  (não é a noite de nenhum dos dias impressos) e a tabela da hora em que cada signo nasce,
  com os dois mapas do nascer do sol.

## Conferência

Nos 135 nascimentos: 8235 valores, nenhuma falha; 42 pendentes (o dia da semana védico, o mês
Chaitradi perto de uma lua cheia, e 4 pores ou nasceres seguintes em que a busca do `core`
chega a outro cruzamento). Nas seis impressões Panchang: 84 dias e os cabeçalhos, nenhuma
falha nem pendente.
