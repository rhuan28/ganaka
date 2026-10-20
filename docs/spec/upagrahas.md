# Upagrahas derivados do Sol

## Regra

A partir da longitude sideral do Sol, todas as contas reduzidas a [0°, 360°):

| Ponto | Regra |
|---|---|
| Dhuma | Sol + 133°20' |
| Vyatipata | 360° − Dhuma |
| Parivesha | Vyatipata + 180° |
| Indrachapa | 360° − Parivesha |
| Upaketu | Indrachapa + 16°40' |

Consequência: Upaketu fica 30° antes do Sol.

## Origem

Regra clássica, de domínio comum. Confirmada contra a exportação do PL9 nos
290 mapas de referência: aplicada ao Sol exportado pelo próprio PL9,
reproduz os cinco pontos com erro abaixo de 0,0001".

## Conformidade

Calculados a partir do Sol do `core`, os cinco pontos herdam a diferença do
Sol, que é inferior a 0,0001".

## Bhrigu point

O PL9 mostra, quando ligado em "Special Points", o ponto "BP":

`Bhrigu point = Rahu + ((Lua − Rahu) mod 360°) / 2`

É o ponto médio do arco que vai de Rahu à Lua **no sentido dos signos**. O
outro ponto médio, a 180° deste, não é o que o PL9 mostra.

Origem: o manual do PL9 diz que é o ponto médio entre a Lua e Rahu; qual dos
dois pontos médios, **por medição** nos mapas impressos pelo programa, em que
o ponto aparece em graus e minutos. O PL9 não o exporta: a conferência é ao
minuto de arco, e o ponto herda a precisão da Lua e de Rahu, já conferidos a
0,5".

## Fora deste documento

Gulika e Prana Pada, que a exportação do PL9 também traz: ver `gulika.md`,
`prana-pada.md` e `nascer-do-sol.md`. Mandi: ver `mandi.md`.
