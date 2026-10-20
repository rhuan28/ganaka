# Prana Pada

## Regra

1. Toma-se o **nascer do sol** que vale para o instante (ver
   `nascer-do-sol.md`) e o tempo decorrido desde ele.
2. Esse tempo é convertido em arco à razão de **um signo a cada seis
   minutos** (7200° por dia).
3. O arco é somado a um ponto de partida que depende do signo sideral em que
   o Sol está **no instante dado**:

   | Signo do Sol | Ponto de partida |
   |---|---|
   | Móvel (Áries, Câncer, Libra, Capricórnio) | Sol |
   | Fixo (Touro, Leão, Escorpião, Aquário) | Sol + 240° |
   | Dual (Gêmeos, Virgem, Sagitário, Peixes) | Sol + 120° |

4. O resultado é reduzido a [0°, 360°).

A longitude do Sol é a do instante dado, não a do nascer do sol.

## Sensibilidade

Um segundo de tempo no nascer do sol desloca o Prana Pada em 5 minutos de
arco. Meio segundo de arco de Prana Pada equivale a 2 milésimos de segundo
no nascer do sol.

## Origem

A regra é a clássica, de domínio comum, e serviu de hipótese. **Confirmada
por medição** contra a exportação do PL9: com o nascer do sol do PL9, ela
reproduz o Prana Pada exportado. A variante com o Sol tomado no instante do
nascer do sol foi testada e descartada (diferença de vários segundos de
tempo).

A rotina do PL9 que calcula o Prana Pada não foi lida; a do nascer do sol
foi.

## Conformidade

Diferença máxima de 0,012" nos mapas de referência com Lahiri. Os números
atuais, por conjunto, estão em `docs/relatorios/conformidade-posicoes.md`.

## O que não foi verificado

- Com a opção "Sunrise: Edge of Sun".
