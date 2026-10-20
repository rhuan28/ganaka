# Nascer e pôr do sol

Vale para a opção "Sunrise: Centre of Sun", a observada na instalação
examinada. A opção "Edge of Sun" não é reproduzida.

## Definição

No PL9, o Sol nasce no instante em que o **Lagna é igual à longitude do
Sol**, e se põe quando o ponto oposto ao Lagna (Lagna + 180°) é igual à
longitude do Sol. As duas longitudes são as siderais que o programa mostra
(ver `lagna.md` e `ephemeris-fonte.md`).

Isso é o nascer do **grau do Sol** na eclíptica, não do Sol visível:

- não há refração nem semidiâmetro;
- a latitude eclíptica do Sol, sempre de poucos segundos de arco, não entra;
- abaixo do círculo polar o grau do Sol cruza o horizonte todos os dias,
  mesmo nos dias em que o Sol visível não se põe ou não nasce.

Por isso os instantes diferem do nascer do sol dos almanaques em alguns
minutos, e mais em latitudes altas.

## Qual nascer do sol vale para um instante

O programa parte de um palpite e procura a raiz mais próxima. O palpite
depende de duas coisas: se o Sol está acima do horizonte no instante dado, e
em que quarto do dia o instante cai, contando o dia a partir das 6 h de
tempo local médio (`dia juliano + longitude leste / 360 + 0,25`).

O Sol está **acima do horizonte** quando a longitude do Sol menos o Lagna,
reduzida a [0°, 360°), é 180° ou mais, ou é zero.

| Sol | Quarto do dia (tempo local médio) | Palpite |
|---|---|---|
| abaixo | 6 h às 12 h | um dia antes do instante |
| acima | 0 h às 6 h | as 6 h seguintes |
| qualquer outro caso | | as 6 h anteriores |

Consequência: para quem nasce de madrugada, antes do nascer do sol, vale o
nascer do sol da véspera; depois do nascer do sol, o do próprio dia.

O palpite do pôr do sol é o palpite do nascer mais meio dia.

## A busca

A busca é reproduzida passo a passo, porque o programa a encerra com uma
tolerância frouxa e o resultado depende do caminho. Chamando `t` a
estimativa corrente:

1. Calcula-se o Lagna em `t` e o erro: longitude-alvo do Sol menos o Lagna
   (ou menos Lagna + 180°, no pôr do sol), reduzido a (−180°, 180°].
2. A longitude-alvo, durante a busca, é uma **extrapolação linear**: a
   longitude do Sol no instante dado mais 0,985653° por dia. No nascer do
   sol, os dias contam-se até `t`; no pôr do sol, até o nascer do sol já
   encontrado (e não até `t`).
3. Na primeira passagem, a correção é o erro dividido por 360° por dia. Nas
   seguintes, o erro dividido pela inclinação medida entre as duas últimas
   estimativas (método da secante).
4. Em latitudes além de 60°, a inclinação é dobrada na primeira passagem e
   nas duas seguintes.
5. A busca termina quando o erro fica abaixo de 0,0005° (nascer) ou 0,001°
   (pôr), ou na nona passagem. Na passagem em que termina, o erro é
   recalculado com a longitude **verdadeira** do Sol naquele instante, e
   aplica-se uma última correção pela secante.

O nascer do sol **seguinte**, usado para medir a noite, é procurado a partir
de um instante 1,1 dia depois do nascer do sol, pelo mesmo processo, mas sem
o recálculo final com a longitude verdadeira do Sol.

Efeito da tolerância: o nascer do sol fica a menos de um milésimo de segundo
da raiz exata; o pôr do sol e o nascer seguinte podem ficar a alguns
segundos dela, e mais em latitudes altas. O `core` reproduz esses desvios,
porque o Gulika depende deles.

### Quando a busca do pôr do sol termina na primeira passagem

Se o palpite do pôr do sol já cai dentro da tolerância, a correção final usa
a inclinação que sobrou da busca do **nascer** do sol, que não serve para o
pôr do sol. O resultado fica a cerca de um grau do horizonte — alguns
minutos de tempo. Acontece em cerca de um mapa em vinte mil, em qualquer
latitude. O `core` reproduz: dois mapas nessa situação foram exportados do
PL9, e o Gulika deles coincide com o do `core` e fica a mais de dez minutos
de arco do que um pôr do sol correto daria.

Se a busca do **nascer** do sol terminasse na primeira passagem, não haveria
inclinação anterior; o `core` usa então 360° por dia. Esse caso não foi
observado no PL9.

## No modo corrigido

A definição é a mesma; os instantes são as raízes de verdade:

- o **nascer do sol** é a última passagem do grau do Sol pelo horizonte
  leste em ou antes do instante dado;
- o **pôr do sol** é a primeira passagem pelo horizonte oeste depois dela;
- o **nascer do sol seguinte** é a passagem seguinte pelo leste;
- é dia enquanto o instante for anterior ao pôr do sol.

As raízes são achadas por varredura e bisseção, até a resolução de um dia
juliano (0,04 milissegundo). A varredura usa um Sol em movimento uniforme,
que dispensa a efeméride, e cada raiz achada assim é refinada contra o Sol
verdadeiro. Isso funciona até meio milésimo de grau do círculo polar; mais
perto que isso o Lagna varre meio zodíaco em instantes e a raiz pode não
ser achada. Ver `correcoes.md`.

## Onde não funciona (modo `pl9`)

- Além do círculo polar o Lagna não se define (ver `lagna.md`).
- A partir de cerca de 65° de latitude a busca do PL9 deixa de convergir em
  parte dos dias do ano. O PL9 não detecta isso e usa o que a busca tiver
  dado. O modo `pl9` faz o mesmo; quando o resultado não
  pode ser usado, o mapa volta sem Gulika e Prana Pada: quando a estimativa se afasta mais de três dias, ou quando
  os três instantes saem fora de ordem.

  Em instantes de teste ao longo de um ano: até 64°, nenhum erro e nenhum
  resultado a mais de meio grau do horizonte; a 65°, erro em 1% e resultado
  a mais de meio grau do horizonte em 12%; a 66°, erro em 64%.

  Os mapas de referência vão até 64,98°. Acima disso nada foi conferido
  contra o PL9, e o `core` marca o resultado como não conferido a partir de
  65°.
- As funções trigonométricas não dão exatamente o mesmo último dígito em
  todos os ambientes de execução. Como a busca termina por tolerância, uma
  diferença no último dígito pode, em casos raros, mudar o número de
  passagens e deslocar o pôr do sol em frações de segundo.

## Origem

**Lida na rotina do PL9**: a definição, a tabela de palpites, a
extrapolação linear, as tolerâncias, o limite de nove passagens, o
tratamento das latitudes além de 60° e o ponto de partida do nascer do sol
seguinte. **Confirmada por medição**: o nascer do sol calculado assim
coincide com o que o Prana Pada exportado pelo PL9 implica, com diferença
abaixo de 0,04 milissegundo nos 290 mapas iniciais.

Dois pontos da leitura foram decididos pela medição, porque o código
admitia duas interpretações: o quarto do dia é obtido por truncamento, e não
por arredondamento; e a passagem final usa a longitude verdadeira do Sol.

## O que não foi verificado

- A opção "Edge of Sun".
- O comportamento do PL9 onde a busca não converge, a partir de 65°.
