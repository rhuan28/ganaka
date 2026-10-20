# Delta T do PL9

## Regra

O PL9 usa, de 1801 a 2048, o Delta T da **Swiss Ephemeris 2.00.00**. O `core`
o reproduz com a mesma tabela e o mesmo algoritmo.

Seja `ano = 2000 + (dia juliano UT − 2451545) / 365,2425`.

**De 1620 a 2019** (dentro da tabela):

1. Tabela de um valor por ano, em segundos, de 1620,0 a 2019,0. Os valores
   até 2013 são observados; os de 2014 a 2019 (67,267; 67,90; 68,40; 69,00;
   69,50; 70,00) eram a extrapolação daquela versão.
2. Interpolação de Bessel sobre os valores anuais, até diferenças de quarta
   ordem quando há vizinhos suficientes na tabela; nas pontas a ordem cai.
3. Para `ano < 1955`, soma-se `−0,000091 × (n + 26) × (ano − 1955)²`, com
   `n = −25,82`, a aceleração secular de maré da Lua adotada naquela versão.
   A tabela anterior a 1955 pressupõe `n = −26`.

**Depois de 2019:**

    b  = (ano − 1820) / 100
    ΔT = −20 + 31 b²

e, até 2119, soma-se um termo linear que une a parábola ao último valor da
tabela sem salto:

    b₂ = (2019 − 1820) / 100
    ΔT += (−20 + 31 b₂² − 70,00) × (ano − 2119) / 100

**Antes de 1620** o `core` não calcula: recusa a data. Está fora dos dados de
efemérides do projeto.

## Valores de referência

| Instante (UT) | ΔT (s) |
|---|---|
| 21 mar 1805, 0h | 12,2075 |
| 1 jan 1850, 0h | 6,9193 |
| 1 jan 1900, 0h | −2,7703 |
| 5 abr 1950, 0h | 29,2593 |
| 1 jul 2000, 12h | 63,9686 |
| 1 jul 2018, 0h | 69,7480 |
| 1 jan 2020, 0h | 71,5630 |
| 1 jul 2044, 0h | 111,8285 |

## Origem

Código-fonte público da Swiss Ephemeris 2.00.00 (licença AGPL), arquivo
`swephlib.c`, função de Delta T para datas a partir de 1620, e a constante de
maré padrão do arquivo `sweph.h` da mesma versão. O código do `core` é uma
reescrita em TypeScript desse algoritmo; a tabela de valores anuais é a
mesma.

A fonte usada foi a cópia desse código distribuída junto a um pacote público
de ligação para Node (`swisseph` 0.5.3, que se declara versão 2.00.00). As
etiquetas de versão do repositório oficial no GitHub não serviram: os
arquivos marcados de 2.00 a 2.04 são idênticos entre si e trazem uma tabela
mais antiga.

## Como se chegou à versão

Para cada um dos 290 mapas de referência, o Delta T efetivo do PL9 foi
obtido como o Delta T da Swiss Ephemeris 2.10 mais o deslocamento de tempo
do ajuste descrito em `docs/relatorios/medicao-efemerides.md`. Comparações:

| Candidato | Maior diferença nos 290 mapas |
|---|---|
| Tabela de Delta T em texto que acompanha o PL9 | 1,24 s (até 1993, onde ela termina) |
| Algoritmo acima com a tabela da versão 2.07 e n = −25,80 | 0,50 s (depois de 2014) |
| Algoritmo acima com a tabela da versão 2.00.00 e n = −25,826 | 0,016 s |
| **Algoritmo acima com a tabela da versão 2.00.00 e n = −25,82** | **0,008 s** |

A diferença de 0,008 s está dentro da incerteza do próprio ajuste e equivale
a 0,004" na Lua.

O indício da versão são os valores extrapolados de 2014 a 2019, que mudam
a cada versão da biblioteca.

## Consequência

Para um instante em tempo universal, o PL9 e a Swiss Ephemeris atual
calculam tempos dinâmicos diferentes. O `core` avalia as efemérides no
instante

    UT + (ΔT do PL9 − ΔT da biblioteca) / 86400 dias

que leva ao mesmo tempo dinâmico que o PL9 usa.

## O que não foi verificado

- Que a efeméride própria do PL9 foi de fato gerada com a Swiss Ephemeris
  2.00.00. O que se mostrou é que o Delta T coincide.
- O comportamento do PL9 fora de 1801–2048, onde ele usa outro caminho de
  cálculo.

## No modo corrigido

O modo `corrected` não usa este Delta T: avalia as efemérides no instante
dado, com o Delta T da versão atual da biblioteca. A tabela do PL9 termina
em 2014, e a extrapolação dele se afasta da atual em mais de 44 segundos em
2048, o que desloca a Lua em 26". De 1950 a 2010 a diferença na Lua não
passa de 0,15". Ver `correcoes.md`.
