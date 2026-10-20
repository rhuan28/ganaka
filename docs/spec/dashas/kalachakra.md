# Kalachakra dasha

Código: `packages/core/src/dashas/kalachakra.ts`. Testes:
`packages/core/test/kalachakra.test.ts`.

## Regras

**Anos dos signos.** Áries 7, Touro 16, Gêmeos 9, Câncer 21, Leão 5, Virgem
9, Libra 16, Escorpião 7, Sagitário 10, Capricórnio 4, Aquário 4, Peixes 10.
A duração do ano é a do motor dos dashas de nakshatra (`dashaYearDays`).

**Sequências por pada.** Cada pada tem nove signos.

| Grupo | Nakshatras | Pada 1 | Pada 2 | Pada 3 | Pada 4 |
|---|---|---|---|---|---|
| Savya A | Ashwini, Krittika, Punarvasu, Ashlesha, Hasta, Swati, Mula, U. Ashadha, P. Bhadrapada, Revati | Ari Tau Gem Can Leo Vir Lib Sco Sag | Cap Aqu Pis Sco Lib Vir Can Leo Gem | Tau Ari Pis Aqu Cap Sag Ari Tau Gem | Can Leo Vir Lib Sco Sag Cap Aqu Pis |
| Savya B | Bharani, Pushya, Chitra, P. Ashadha, U. Bhadrapada | Sco Lib Vir Can Leo Gem Tau Ari Pis | Aqu Cap Sag Ari Tau Gem Can Leo Vir | Lib Sco Sag Cap Aqu Pis Sco Lib Vir | Can Leo Gem Tau Ari Pis Aqu Cap Sag |
| Apasavya B | Rohini, Magha, Vishakha, Shravana | inversa de B pada 4 | inversa de B pada 3 | inversa de B pada 2 | inversa de B pada 1 |
| Apasavya A | Mrigashira, Ardra, P. e U. Phalguni, Anuradha, Jyeshtha, Dhanishta, Shatabhisha | inversa de A pada 4 | inversa de A pada 3 | inversa de A pada 2 | inversa de A pada 1 |

**Deha e Jeeva.** Savya: Deha é o primeiro signo da sequência do pada da Lua,
Jeeva o último. Apasavya: Deha o último, Jeeva o primeiro.

**Saldo no nascimento.** A fração do pada da Lua já percorrida, pelo grau,
vezes a soma dos anos da sequência do pada, dá o que já decorreu da
sequência. A mahadasha em curso é o signo em que esse tempo cai; o que dele
já passou recua o seu início.

**Mahadashas seguintes** (opção do PL9 "Continue mahadashas in following
pada"). Seguem a **ordem do zodíaco** a partir do signo da mahadasha em
curso, cada uma com os anos do seu signo.

**Antardashas e pratyantardashas** (opção "12 Antar Dasha"). Cada período se
divide em 12 partes iguais, uma por signo. A primeira é o signo mais forte
entre o signo do período e o 7º a partir dele; a sequência anda para a
frente se o signo do período é ímpar (Áries, Gêmeos…) e para trás se é par.
Vale em todos os níveis.

**Signo mais forte** do eixo: a comparação de dois signos do próprio PL9,
descrita em `docs/spec/dashas/forca-signos.md`, com o signo da metade de
Áries a Virgem como primeiro, de modo que os dois signos de um eixo têm a
mesma resposta.

## Origem

Medido nos relatórios impressos pelo PL9 ("Kala Chakra - MD and AD" e "AD and
PD #1 a #5") de 130 mapas de referência (a Lua em 103 dos 108 padas), com as
opções observadas: as 135.447 datas de início de mahadasha, antardasha e
pratyantardasha batem com estas regras, com o ano de 365,2421875 dias. As sequências por pada e os anos são
os clássicos; a continuação pelo zodíaco, a divisão em 12 partes iguais e a
escolha do signo mais forte foram deduzidas dos relatórios. A escolha do signo mais
forte foi primeiro deduzida dos relatórios (quatro critérios, que erravam
num eixo de 780, o do REF 0169) e depois lida no executável: a regra lida
acerta os 780.

## Modo `corrected`

Difere do `pl9` em três pontos, aprovados pelo mantenedor e descritos em
`docs/spec/correcoes.md` (12 a 14): as mahadashas seguem as sequências dos
padas seguintes, e não o zodíaco; "Cycle through mahadasha within the same
pada", que o PL9 não grava, repete a sequência do pada; "9 Antar Dasha", que
sai incoerente no PL9, divide cada período entre os nove signos a partir do
seu, na proporção dos anos. No modo `pl9`, as duas opções são recusadas.

## O que não foi verificado

- As opções "9 Antar Dasha" e "Cycle through mahadasha within the same pada"
  no modo `pl9`: o PL9 não as entrega de forma utilizável (correções 13 e
  14); o modo `corrected` as calcula, sem gabarito externo.
- Os 5 padas sem mapa de referência.
