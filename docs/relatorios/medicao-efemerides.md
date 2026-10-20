# Medição: PL9 contra Swiss Ephemeris, 1801–2048

Gerado por `pnpm --filter @reverse/oracle measure` a partir de 290 gabaritos.
Valores em segundos de arco. "Deslocamento" é a mediana de (PL9 − Swiss Ephemeris com Lahiri) sobre Sol, Marte, Júpiter e Saturno de cada mapa. "Resíduo" é o que sobra em cada corpo depois de retirado o deslocamento do mapa.

## Deslocamento comum

Mínimo 0.04, mediana 0.14, máximo 0.90.

## Por década

| Década | Mapas | Deslocamento mediano | Resíduo máx. sun | Resíduo máx. moon | Resíduo máx. mars | Resíduo máx. mercury | Resíduo máx. jupiter | Resíduo máx. venus | Resíduo máx. saturn | Resíduo máx. rahu |
|---|---|---|---|---|---|---|---|---|---|---|
| 1800 | 11 | 0.10 | 0.16 | 2.78 | 0.05 | 0.33 | 0.06 | 0.20 | 0.07 | 0.43 |
| 1810 | 10 | 0.08 | 0.17 | 2.88 | 0.06 | 0.34 | 0.08 | 0.21 | 0.07 | 0.54 |
| 1820 | 20 | 0.07 | 0.16 | 2.70 | 0.07 | 0.37 | 0.09 | 0.20 | 0.09 | 0.40 |
| 1830 | 16 | 0.10 | 0.12 | 2.06 | 0.04 | 0.17 | 0.06 | 0.15 | 0.06 | 0.52 |
| 1840 | 16 | 0.10 | 0.09 | 1.19 | 0.03 | 0.13 | 0.04 | 0.12 | 0.03 | 0.43 |
| 1850 | 7 | 0.10 | 0.11 | 1.69 | 0.06 | 0.22 | 0.06 | 0.09 | 0.05 | 0.46 |
| 1860 | 6 | 0.11 | 0.07 | 1.19 | 0.02 | 0.13 | 0.04 | 0.09 | 0.03 | 0.44 |
| 1870 | 9 | 0.11 | 0.08 | 1.32 | 0.03 | 0.18 | 0.04 | 0.10 | 0.04 | 0.49 |
| 1880 | 12 | 0.11 | 0.06 | 1.10 | 0.03 | 0.15 | 0.03 | 0.08 | 0.04 | 0.49 |
| 1890 | 7 | 0.12 | 0.08 | 1.12 | 0.02 | 0.10 | 0.02 | 0.10 | 0.03 | 0.48 |
| 1900 | 13 | 0.13 | 0.03 | 0.64 | 0.02 | 0.08 | 0.02 | 0.04 | 0.02 | 0.50 |
| 1910 | 7 | 0.13 | 0.01 | 0.24 | 0.00 | 0.02 | 0.00 | 0.01 | 0.01 | 0.46 |
| 1920 | 5 | 0.14 | 0.01 | 0.23 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 | 0.46 |
| 1930 | 3 | 0.14 | 0.02 | 0.25 | 0.01 | 0.02 | 0.01 | 0.01 | 0.01 | 0.31 |
| 1940 | 12 | 0.14 | 0.01 | 0.13 | 0.00 | 0.01 | 0.00 | 0.01 | 0.00 | 0.45 |
| 1950 | 8 | 0.14 | 0.01 | 0.14 | 0.00 | 0.02 | 0.00 | 0.01 | 0.00 | 0.44 |
| 1960 | 9 | 0.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.47 |
| 1970 | 7 | 0.14 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.46 |
| 1980 | 14 | 0.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.48 |
| 1990 | 7 | 0.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.45 |
| 2000 | 17 | 0.14 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.43 |
| 2010 | 14 | 0.14 | 0.04 | 0.86 | 0.02 | 0.03 | 0.02 | 0.06 | 0.02 | 0.47 |
| 2020 | 20 | 0.28 | 0.54 | 10.26 | 0.20 | 1.00 | 0.20 | 0.67 | 0.39 | 0.83 |
| 2030 | 25 | 0.51 | 1.26 | 18.23 | 0.50 | 2.31 | 0.61 | 1.39 | 0.57 | 0.93 |
| 2040 | 15 | 0.72 | 1.51 | 25.37 | 0.83 | 2.58 | 0.75 | 1.80 | 0.72 | 1.05 |

## Maior resíduo por corpo, em toda a faixa

| sun | moon | mars | mercury | jupiter | venus | saturn | rahu |
|---|---|---|---|---|---|---|---|
| 1.51 | 25.37 | 0.83 | 2.58 | 0.75 | 1.80 | 0.72 | 1.05 |

## Ajuste por mapa: deslocamento angular e deslocamento de tempo

Para cada mapa, as diferenças de Sol a Saturno são ajustadas a `a + velocidade × dt`; `a` em segundos de arco, `dt` em segundos de tempo.

Maior resíduo depois do ajuste, em todos os mapas: 0.00040". Valores de a: mínimo 0.1380, máximo 0.1385.

| Década | Mapas | a mediano | dt mediano | dt mínimo | dt máximo |
|---|---|---|---|---|---|
| 1800 | 11 | 0.138 | -4.02 | -5.09 | -3.01 |
| 1810 | 10 | 0.138 | -4.19 | -4.87 | -3.05 |
| 1820 | 20 | 0.138 | -4.49 | -4.94 | -3.46 |
| 1830 | 16 | 0.138 | -2.95 | -3.40 | -2.13 |
| 1840 | 16 | 0.138 | -1.95 | -2.34 | -1.82 |
| 1850 | 7 | 0.138 | -2.44 | -3.00 | -1.32 |
| 1860 | 6 | 0.138 | -2.01 | -2.13 | -1.54 |
| 1870 | 9 | 0.138 | -2.33 | -2.41 | -1.40 |
| 1880 | 12 | 0.138 | -1.81 | -2.14 | -1.42 |
| 1890 | 7 | 0.138 | -1.52 | -2.05 | -1.31 |
| 1900 | 13 | 0.138 | -0.94 | -1.19 | -0.74 |
| 1910 | 7 | 0.138 | -0.30 | -0.41 | 0.05 |
| 1920 | 5 | 0.138 | -0.00 | -0.40 | 0.17 |
| 1930 | 3 | 0.138 | -0.41 | -0.42 | -0.16 |
| 1940 | 12 | 0.138 | -0.01 | -0.26 | 0.16 |
| 1950 | 8 | 0.138 | 0.06 | 0.00 | 0.25 |
| 1960 | 9 | 0.138 | -0.00 | -0.01 | 0.00 |
| 1970 | 7 | 0.138 | 0.01 | -0.00 | 0.01 |
| 1980 | 14 | 0.138 | -0.00 | -0.01 | 0.01 |
| 1990 | 7 | 0.138 | -0.00 | -0.01 | 0.01 |
| 2000 | 17 | 0.138 | 0.00 | -0.01 | 0.01 |
| 2010 | 14 | 0.138 | 0.00 | -0.02 | 1.47 |
| 2020 | 20 | 0.138 | 10.78 | 2.27 | 17.97 |
| 2030 | 25 | 0.138 | 26.02 | 18.62 | 31.79 |
| 2040 | 15 | 0.138 | 37.02 | 32.69 | 41.84 |

## Dez mapas com maior resíduo planetário

| Mapa | Ano | Resíduo máximo |
|---|---|---|
| ref-0082 | 2046 | 25.37 |
| ref-0214 | 2046 | 24.88 |
| ref-0180 | 2046 | 23.89 |
| ref-0201 | 2045 | 23.44 |
| ref-0048 | 2044 | 21.88 |
| ref-0236 | 2042 | 20.47 |
| ref-0089 | 2045 | 20.07 |
| ref-0213 | 2041 | 20.07 |
| ref-0223 | 2043 | 20.03 |
| ref-0102 | 2043 | 19.77 |

## Leitura

Esta seção é escrita à mão e preservada quando o relatório é regenerado.

A medição aciona o portão: sem correção, há resíduos acima de 0,5" na Lua
até a década de 1900 e de novo a partir de 2019, e em todos os corpos a
partir de 2020. A tabela "Ajuste por mapa" mostra que isso tem uma causa
única e reproduzível.

### Fatos medidos

- Ajustando, em cada um dos 290 mapas, as diferenças de Sol a Saturno ao
  modelo `a + velocidade × dt`, o maior resíduo que sobra é de 0,0004".
- `a` fica entre 0,1380" e 0,1385" em todos os mapas, de 1801 a 2048.
- `dt` depende só da data: perto de −4 s no começo do século XIX, subindo
  até zero por volta de 1920–1960, zero de 1960 a cerca de 2015, e crescendo
  até cerca de 40 s em 2048.
- O ajuste é feito por `fitChart`, tem teste que roda sobre todos os
  gabaritos, e a tabela é regenerada pelo comando de medição.
- O mesmo par (`a`, `dt`) de cada mapa também explica Urano, Netuno e
  Plutão; isso foi conferido na revisão do código, não está na tabela.
- O nodo verdadeiro, retirado `a`, difere em até cerca de 0,5", com sinal
  variando de década para década e sem relação com `dt`.
- Os dez mapas de maior resíduo bruto são todos de 2041 a 2046, do tipo
  aleatório ou recente; nenhum é caso de estação ou de fronteira.

### Interpretação (hipóteses, não verificadas no executável)

- **Delta T.** Um deslocamento de tempo que depende só da data é o que uma
  tabela de Delta T diferente produz: zero onde as duas usam valores
  observados iguais, poucos segundos no século XIX, dezenas de segundos no
  futuro, onde cada uma extrapola a seu modo. É a explicação adotada.
- **Ayanamsha.** Resolvido depois, pela extração com os outros ayanamshas:
  o deslocamento de 0,138" é próprio do Lahiri. Yukteshwar e Bhasin não têm
  deslocamento, e Raman, Fagan e Krishnamurti têm constantes diferentes. Ver
  `docs/spec/ayanamsha.md`.
- **Delta T.** Confirmado depois: o Delta T do PL9 é o da Swiss Ephemeris
  2.00.00, a menos de 0,008 s nos 290 mapas. Ver `docs/spec/delta-t.md`.
- **Origem.** A explicação mais simples para os dois fatos é que a
  efeméride própria do PL9 foi gerada com uma versão anterior da Swiss
  Ephemeris, com o Delta T e o Lahiri daquela versão.

### Respostas às perguntas do plano

1. **O deslocamento comum é constante?** Sim, 0,138", depois de separado o
   efeito do tempo. A coluna "Deslocamento mediano" da tabela "Por década"
   varia porque usa uma mediana simples que inclui o Sol e mistura os dois
   efeitos; os resíduos de Marte, Júpiter e Saturno nessa tabela ficam
   inflados pelo mesmo motivo.
2. **Os resíduos dos planetas lentos ficam abaixo de 0,5"?** Sem corrigir o
   tempo, não depois de 2020. Corrigido, ficam abaixo de 0,001".
3. **O resíduo da Lua cresce em alguma ponta?** Nas duas: cerca de 2,8" em
   1800–1830 e até 25" em 2040–2048. É `dt` multiplicado pela velocidade da
   Lua.
4. **Nodo.** Até cerca de 0,5", sem acompanhar `dt`. O modelo do nodo é
   outro e fica por investigar.
5. **Piores mapas.** Ver "Fatos medidos".

### Consequência para o critério de 0,5"

O critério é atingível com folga de Sol a Plutão se o `core` reproduzir o
`dt` do PL9 em função da data e somar 0,138". Falta determinar, no plano 2B:
a função `dt(data)` em toda a faixa, a natureza do deslocamento de 0,138",
e o modelo do nodo verdadeiro. O Lagna e os pontos derivados ainda não
foram medidos.

### Cobertura do conjunto de referência

- O design pede casos construídos de "Lua perto dos nodos" e de nascimento
  junto ao nascer e ao pôr do sol. Nenhum dos dois está neste conjunto; os
  dois ficam para o plano 2B.
- Os pares de fronteira foram posicionados a 1,5" da fronteira segundo a
  Swiss Ephemeris. Como a Lua do PL9 difere dela em até 2,9" antes de 1900
  e em até 25" depois de 2020, um par da Lua nessas épocas pode cair inteiro
  de um lado só no PL9. Os pares atuais ficam de lados opostos também no
  PL9, e há teste para isso; pares novos devem ser posicionados com `dt`
  aplicado.
- Nenhum dos pares de fronteira atuais pega um corpo retrógrado.
