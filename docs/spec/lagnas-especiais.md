# Lagnas especiais

## Regras

`Δ` é o tempo, em dias, desde o nascer do sol que vale para o instante (ver
`nascer-do-sol.md`); `Sol₀` é a longitude sideral do Sol no instante desse
nascer do sol.

| Lagna | Longitude | Ritmo |
|---|---|---|
| Bhava Lagna | `Sol₀ + 360°·Δ` | um signo a cada 2 horas |
| Hora Lagna | `Sol₀ + 720°·Δ` | um signo a cada hora |
| Ghatika Lagna | `Sol₀ + 1800°·Δ` | um signo a cada ghati (24 minutos) |

**Jaimini Hora Lagna:** se o Lagna está num signo ímpar (Áries, Gêmeos…), é
o próprio Hora Lagna; se está num signo par, é `Lagna + 720°·Δ`, contado a
partir do Lagna do instante.

**Indu Lagna** (só o signo): cada planeta tem um número de kalas — Sol 30,
Lua 16, Marte 6, Mercúrio 8, Júpiter 10, Vênus 12, Saturno 1. Somam-se os
kalas do regente do 9º signo a partir do Lagna e do regente do 9º signo a
partir da Lua; o resto da divisão por 12 (0 vale 12) é o número de signos
contados a partir do signo da Lua, que conta como o primeiro.

## Origem

As regras de Bhava, Hora e Ghatika Lagna e do Indu Lagna são clássicas e
serviram de hipótese; a do Jaimini Hora Lagna foi **deduzida dos números**.
Todas foram **confirmadas por medição** contra os 72 mapas de referência
impressos pelo PL9, sem exceção. O PL9 mostra as três primeiras e o Jaimini
Hora Lagna em graus com segundos arredondados; a maior diferença medida foi
de 0,76". A rotina do PL9 não foi lida.

## Sensibilidade

Um segundo de tempo no nascer do sol desloca o Ghatika Lagna em 0,0208°
(75"); um milésimo de segundo, em 0,075". Por isso a conferência dessas
longitudes usa a tolerância de 1".

## O que não foi verificado

- Com a opção "Sunrise: Edge of Sun".
- Além do círculo polar e onde o nascer do sol não se encontra: essas
  lagnas ficam ausentes do resultado, como o Gulika.
