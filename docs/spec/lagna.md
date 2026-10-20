# Lagna

## Regra

O PL9 calcula o Lagna por fórmulas fechadas, sem passar pelas efemérides.
Com `T` em séculos julianos desde J2000, contados no tempo universal dado:

1. **Tempo sideral médio de Greenwich**, em graus:
   `280,46061837 + 360,98564736629 × (dia juliano − 2451545) + 0,000387933 T² − T³ / 38710000`.
2. **Obliquidade média**, em graus:
   `23,4392911111 + (−46,815 T − 0,00059 T² + 0,001813 T³) / 3600`.
3. **Nutação curta**, em segundos de arco, com quatro termos:
   `−17,2 sen Ω − 1,322 sen 2L − 0,23 sen 2L' + 0,21 sen 2Ω`, onde
   `Ω = 125,04452 − 1934,136261 T + 0,0020708 T² + T³ / 450000`,
   `L = 280,4665 + 36000,7698 T` e `L' = 218,3165 + 481267,8813 T`, em graus.
4. **Tempo sideral local**: tempo sideral médio, mais a nutação curta vezes o
   cosseno da obliquidade média, mais a longitude geográfica (leste
   positiva).
5. **Ascendente**, com a obliquidade **média**:
   `atan2(cos θ, −(sen θ cos ε + tan φ sen ε))`, onde `θ` é o tempo sideral
   local, `ε` a obliquidade e `φ` a latitude geográfica.
6. **Lagna** = ascendente − nutação longa − ayanamsha.

A **nutação longa** do passo 6 não é a do passo 3. É uma série de treze
termos, em unidades de 0,0001", com os argumentos em graus:

| Argumento | Coeficiente |
|---|---|
| Ω | −171996 − 174,2 T |
| 2F − 2D + 2Ω | −13187 − 1,6 T |
| 2F + 2Ω | −2274 − 0,02 T |
| 2Ω | 2062 + 0,2 T |
| M | 1426 − 3,4 T |
| M' | 712 + 0,1 T |
| M + 2F − 2D + 2Ω | −517 + 1,2 T |
| 2F + Ω | −386 − 0,4 T |
| M' + 2F + 2Ω | −301 |
| −M + 2F − 2D + 2Ω | 217 − 0,5 T |
| M' − 2D | −158 |
| 2F − 2D + Ω | 129 + 0,1 T |
| −M' + 2F + 2Ω | 123 |

com

- `M = 357,52772 + 35999,05034 T − 0,0001603 T² − T³ / 300000` (anomalia média do Sol),
- `M' = 134,96298 + 477198,867398 T + 0,0086972 T² + T³ / 56250` (anomalia média da Lua),
- `D = 297,85036 + 445267,11148 T − 0,0019142 T² + T³ / 189474` (elongação média),
- `F = 93,27191 + 483202,017538 T + 0,0086972 T² + T³ / 327270` (argumento de latitude),
- `Ω` como no passo 3.

São os treze maiores termos da série de nutação de 1980, na forma em que
aparecem em tabelas de livros de algoritmos astronômicos. Em dois pontos o
PL9 difere da série publicada, e o `core` reproduz o PL9:

- o coeficiente de `T²` em `F` é o de `M'` (0,0086972), e não −0,0036825;
- o coeficiente de `T` no termo `2F + 2Ω` é 0,02, e não 0,2.

O efeito dessas duas diferenças no Lagna chega a 0,002". O modo `corrected`
usa os coeficientes da série publicada (ver `correcoes.md`).

O ayanamsha é o mesmo das posições planetárias (ver `ayanamsha.md`). O
instante é o tempo universal dado, sem o deslocamento de Delta T das
posições planetárias.

### Com "None (Sayana)"

O PL9 não subtrai nada: o Lagna é o ascendente do passo 5.

## Meio do céu

A mesma rotina dá o meio do céu, usado nas casas (ver `casas.md`):
`atan2(sen θ, cos θ cos ε)`, menos a nutação longa, menos o ayanamsha.

## Exemplo

Dia juliano 2448000,25 (tempo universal), latitude 28,6° N, longitude
77,2° E, ayanamsha 23,5°:

| Grandeza | Valor |
|---|---|
| T | −0,0970499658 |
| Nutação curta | 11,5902" |
| Obliquidade média | 23,4405531630° |
| Tempo sideral local | 193,7900741727° |
| Ascendente | 270,1066390964° |
| Nutação longa | 11,6454" |
| **Lagna** | **246,6034042587°** |
| Meio do céu (antes da nutação e do ayanamsha) | 194,9769034890° |

## Onde não se define

Em latitudes a partir de 90° menos a obliquidade (cerca de 66,56°) há
instantes em que a eclíptica coincide com o horizonte. O `core` recusa essas
latitudes com erro tipado. O conjunto de referência vai até 65°.

## Origem

**Lida na rotina do PL9.** As fórmulas, as constantes, o uso de duas séries
de nutação diferentes e o caso "None (Sayana)" vêm da leitura da rotina de
ascendente do programa. O instante (tempo universal, não o tempo dinâmico)
foi confirmado por medição.

Antes da leitura, a regra tinha sido aproximada por comparação, usando a
nutação curta nos dois lugares; isso deixava um resíduo de até 0,285", que
era a diferença entre as duas séries.

## Conformidade

Diferença máxima de 0,0001" nos mapas de referência com Lahiri, e o mesmo
com os outros ayanamshas e com "None (Sayana)". Com True Chitra a diferença
é a do próprio ayanamsha (até 0,05", ver `ayanamsha.md`). Os números atuais
estão em `docs/relatorios/conformidade-posicoes.md`.

## O que não foi verificado

- Latitudes acima de 65°.
- O deslocamento manual combinado com "None (Sayana)".
