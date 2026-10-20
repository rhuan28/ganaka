# Mandi

## Regra

1. Determina-se se o instante é **de dia ou de noite**, e os instantes de
   nascer do sol, pôr do sol e nascer do sol seguinte, como em
   `nascer-do-sol.md`.
2. O intervalo (de dia, do nascer ao pôr do sol; de noite, do pôr do sol ao
   nascer seguinte) é dividido em **trinta partes iguais**.
3. Mandi é o **Lagna no instante em que termina a parte de número `g`**, a
   contar do início do intervalo, com `g` dado pelo dia da semana:

   | | Domingo | Segunda | Terça | Quarta | Quinta | Sexta | Sábado |
   |---|---|---|---|---|---|---|---|
   | De dia | 26 | 22 | 18 | 14 | 10 | 6 | 2 |
   | De noite, modo `pl9` | 10 | 6 | 2 | 28 | 24 | 20 | 16 |
   | De noite, modo `corrected` | 10 | 6 | 2 | 26 | 22 | 18 | 14 |

   A linha do modo `corrected` é a tabela clássica. O PL9 se afasta dela nas
   noites de quarta a sábado; ver a correção 6 de `correcoes.md`.

O dia da semana é contado como no Gulika (ver `gulika.md`): de dia, o da
data do instante; de noite, o da data de doze horas antes; a data é a do
relógio em que o mapa está escrito.

Num dia de trinta ghatis, `g` é o número de ghatis depois do nascer do sol
em que Mandi nasce, pela regra clássica.

## Relação com o Gulika

No PL9, Gulika e Mandi são pontos diferentes: o Gulika vem da divisão do
intervalo em oito partes, Mandi da divisão em trinta. Num sábado de dia, o
Gulika é o Lagna a 1/8 do dia, e Mandi o Lagna a 2/30 do dia.

## Origem

- A regra é a clássica, de domínio comum, e serviu de hipótese; o manual do
  PL9 só diz que Mandi usa uma divisão em trinta partes.
- **Confirmada por medição** contra os mapas impressos pelo PL9, em que
  Mandi aparece no desenho do mapa em graus e minutos. Invertendo o valor
  exibido para o instante em que o Lagna o tem, a fração do dia ou da noite
  cai num número inteiro de trigésimos, dentro de 0,01. De dia e nas noites
  de domingo a terça, é o da tabela clássica; nas noites de quarta e de
  sexta, dois a mais. Os valores do PL9 para as noites de quinta e de sábado
  (24 e 16) seguem o mesmo padrão e são conferidos pela bancada.
- A rotina do PL9 que calcula Mandi **não foi lida**.

## Conformidade

Os números atuais estão em `docs/relatorios/conformidade-posicoes.md`. A
conferência é ao minuto de arco: o valor do `core`, truncado ao minuto, tem
de ser o que o PL9 exibe.

## A opção "Gulik method"

Não altera Mandi. Em 14 de outubro de 2026 a opção foi posta em "Beginning
of portion" e três mapas foram impressos de novo (um de dia, uma noite de
sexta, uma de terça): Mandi em graus, o signo de Mandi nas 45 vargas e o
resto do que a bancada lê saíram idênticos aos impressos com "Ending of
portion". A opção foi restaurada e conferida por exportação.

## O que não foi verificado

- A precisão abaixo de um minuto de arco: o PL9 não mostra nem exporta
  Mandi com segundos.
- Com a opção "Sunrise: Edge of Sun".
