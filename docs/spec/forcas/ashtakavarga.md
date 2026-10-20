# Ashtakavarga

Código: `packages/core/src/strengths/ashtakavarga.ts` e `compute.ts`. Testes:
`packages/core/test/ashtakavarga.test.ts`.

Com as opções observadas na instalação examinada ("Ashtakavarga:
Varamihira", "Ekhadipatya reductions: Parashara", "Rashi multiplier for
Virgo: 6 points"); as outras em "Opções".

## Bindus

Oito quadros: os dos sete planetas e o do Lagna. Em cada um, cada um dos oito
contribuintes (os sete planetas e o Lagna) dá um bindu nas casas, contadas a
partir do seu signo, da tabela abaixo, a de Varahamihira. No modo `pl9`, com a
opção "Ashtakavarga: Varamihira", o padrão, o PL9 usa as casas de Parashara:
as da tabela, menos duas — Júpiter no quadro da Lua dá bindu na 12ª e não na
2ª; Marte no de Vênus, na 5ª e não na 4ª; e com "Parashara", a tabela. No modo
`corrected`, cada opção dá a escola que nomeia (`docs/spec/correcoes.md`, 18).


| Quadro | Sol | Lua | Marte | Mercúrio | Júpiter | Vênus | Saturno | Lagna |
|---|---|---|---|---|---|---|---|---|
| Sol | 1 2 4 7 8 9 10 11 | 3 6 10 11 | 1 2 4 7 8 9 10 11 | 3 5 6 9 10 11 12 | 5 6 9 11 | 6 7 12 | 1 2 4 7 8 9 10 11 | 3 4 6 10 11 12 |
| Lua | 3 6 7 8 10 11 | 1 3 6 7 10 11 | 2 3 5 6 9 10 11 | 1 3 4 5 7 8 10 11 | 1 2 4 7 8 10 11 | 3 4 5 7 9 10 11 | 3 5 6 11 | 3 6 10 11 |
| Marte | 3 5 6 10 11 | 3 6 11 | 1 2 4 7 8 10 11 | 3 5 6 11 | 6 10 11 12 | 6 8 11 12 | 1 4 7 8 9 10 11 | 1 3 6 10 11 |
| Mercúrio | 5 6 9 11 12 | 2 4 6 8 10 11 | 1 2 4 7 8 9 10 11 | 1 3 5 6 9 10 11 12 | 6 8 11 12 | 1 2 3 4 5 8 9 11 | 1 2 4 7 8 9 10 11 | 1 2 4 6 8 10 11 |
| Júpiter | 1 2 3 4 7 8 9 10 11 | 2 5 7 9 11 | 1 2 4 7 8 10 11 | 1 2 4 5 6 9 10 11 | 1 2 3 4 7 8 10 11 | 2 5 6 9 10 11 | 3 5 6 12 | 1 2 4 5 6 7 9 10 11 |
| Vênus | 8 11 12 | 1 2 3 4 5 8 9 11 12 | 3 4 6 9 11 12 | 3 5 6 9 11 | 5 8 9 10 11 | 1 2 3 4 5 8 9 10 11 | 3 4 5 8 9 10 11 | 1 2 3 4 5 8 9 11 |
| Saturno | 1 2 4 7 8 10 11 | 3 6 11 | 3 5 6 10 11 12 | 6 8 9 10 11 12 | 5 6 11 12 | 6 11 12 | 3 5 6 11 | 1 3 4 6 10 11 |
| Lagna | 3 4 6 10 11 12 | 3 6 10 11 12 | 1 3 6 10 11 | 1 2 4 6 8 10 11 | 1 2 4 5 6 7 9 10 11 | 1 2 3 4 5 8 9 | 1 3 4 6 10 11 | 3 6 10 11 |

Totais: 48, 49, 39, 54, 56, 52 e 39 nos quadros dos planetas (337), 49 no do
Lagna. O Prastarashtakavarga é o bindu de cada contribuinte em cada signo; o
Bhinnashtakavarga, a soma por signo; o Sarvashtakavarga, a soma dos quadros
dos sete planetas.

## Reduções

Em cada um dos oito quadros, o do Lagna incluído, na ordem:

1. **Trikona:** em cada triângulo de signos (Áries, Leão, Sagitário; Touro,
   Virgem, Capricórnio; Gêmeos, Libra, Aquário; Câncer, Escorpião, Peixes),
   cada um menos o menor dos três.
2. **Ekadhipatya:** para os dois signos de cada regente, na ordem Marte
   (Áries, Escorpião), Vênus (Touro, Libra), Mercúrio (Gêmeos, Virgem),
   Júpiter (Sagitário, Peixes), Saturno (Capricórnio, Aquário). Um signo
   ocupado é o de um planeta ou do Lagna. Nada muda se um dos dois tem 0
   bindus ou se os dois estão ocupados. Os dois vazios: iguais, os dois ficam
   com 0; diferentes, os dois ficam com o menor. Um ocupado: o vazio fica com
   o que tem a mais que o ocupado, ou com 0.

## Pindas

Depois das duas reduções:

- **Rashi Pinda:** a soma, por signo, dos bindus vezes 7, 10, 8, 4, 10, 6,
  7, 8, 9, 5, 11, 12 (Áries a Peixes).
- **Graha Pinda:** a soma, por planeta, dos bindus do signo em que ele está
  vezes 5 (Sol), 5 (Lua), 8 (Marte), 5 (Mercúrio), 10 (Júpiter), 7 (Vênus),
  5 (Saturno).
- **Sodhya Pinda:** a soma dos dois.

## Opções

- **Ashtakavarga: Parashara** (`method: 'parashara'`): no modo `pl9`, as
  casas de Varahamihira (a tabela acima, sem as duas trocas), como o PL9; no
  `corrected`, as de Parashara.
- **Ekhadipatya reductions: other** (`ekadhipatya: 'other'`): com os dois
  signos vazios e diferentes, os dois perdem o menor (um fica com 0).
- **Rashi multiplier for Virgo: 5 points** (`virgoMultiplier: 5`).

## Origem

Lido no executável do PL9 (a tabela de bindus, as duas reduções, os
multiplicadores e as três opções). Conferido nos relatórios impressos em 135
mapas, e em 30 para cada alternativa das opções, sem diferença em nenhum valor:
ver `docs/relatorios/conformidade-posicoes.md`.

## O que não foi verificado

- O Sodhya Pinda multiplicado pelos bindus de uma casa, que o PL9 calcula mas
  nenhum relatório mostra: o `core` não o dá.
- Mapas com o Lagna indefinido (além do círculo polar): recusados.
