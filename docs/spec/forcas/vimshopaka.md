# Vimshopaka e dignidades nas vargas

Código: `packages/core/src/strengths/vimshopaka.ts` e `strengths/compute.ts`
(`computeVimshopaka`). Testes: `packages/core/test/vimshopaka.test.ts`.

Lido no executável do PL9 e conferido na worksheet "20. Vargavimshopaka" dos 135
mapas da bancada (modelo de impressão VIM). Para os nove planetas, Rahu e Ketu
incluídos.

## Pontos numa varga

O signo do planeta na varga dá os pontos pela relação do planeta com o senhor
desse signo (Escorpião Marte, Aquário Saturno):

- signo próprio: 20;
- grande amigo 18, amigo 15, neutro 10, inimigo 7, grande inimigo 5, pela relação
  composta: a natural (amigo, neutro, inimigo) somada à temporal. A temporal é
  sempre a do mapa natal (D1), em qualquer varga: amigo quando o senhor está a 2,
  3, 4, 10, 11 ou 12 signos do planeta; inimigo nos outros casos e no mesmo signo.

Não há pontos de exaltação nem de moolatrikona.

**Rahu e Ketu** não têm signo próprio aqui, e as suas relações naturais são:
Rahu amigo de Vênus, Júpiter e Saturno, neutro com Mercúrio, inimigo do Sol, da Lua
e de Marte; Ketu amigo de Marte e Vênus, neutro com Mercúrio e Júpiter, inimigo do
Sol, da Lua e de Saturno. Essas relações foram tiradas dos 135 mapas impressos
(explicam todos os valores dos nós): a tabela do executável dá outros valores aos
nós, que os relatórios do PL9 não mostram.

## Grupos

Cada grupo soma os pontos de cada varga vezes o seu peso e divide por 200 (o
máximo é 20):

| Grupo | Pesos |
|---|---|
| Shadvarga | D1 60, D2 20, D3 40, D9 50, D12 20, D30 10 |
| Saptavarga | D1 50, D2 20, D3 30, D7 10, D9 25, D12 45, D30 20 |
| Dashavarga | D1 30, D2 15, D3 15, D7 15, D9 15, D10 15, D12 15, D16 15, D30 15, D60 50 |
| Shodashavarga | D1 35, D2 10, D3 10, D4 5, D7 5, D9 30, D10 5, D12 5, D16 20, D20 5, D24 5, D27 5, D30 10, D40 5, D45 5, D60 40 |

No Saptavarga, os pesos do PL9 estão deslocados em relação aos clássicos (D7 2,5,
D9 4,5, D12 2, D30 1, em vintenas): ele dá 1 ao D7, 2,5 ao D9, 4,5 ao D12 e 2 ao
D30. No modo `corrected`, os pesos dos livros (`docs/spec/correcoes.md`, 22).

## Dignidades nas 16 vargas

A dignidade em nove níveis (1 exaltado, 2 moolatrikona, 3 próprio, 4 grande
amigo … 8 grande inimigo, 9 debilitado; a mesma do Saptavargaja e do Chara de
Parashara, `strengths/dignity.ts`), calculada na carta de cada varga: o signo do
planeta na varga, o grau dentro do signo vezes o número de partes da varga, e a
relação temporal pelas posições da própria varga. Na Trimshamsha, cujas partes
são desiguais, o grau é a fração já percorrida da parte, de 0 a 1 (a aritmética do
PL9), o que põe nas faixas de exaltação e moolatrikona que começam em 0° quase
todo planeta no signo delas.

## O relatório

Os pontos saem arredondados para inteiro. Quando o valor exato é um meio, o PL9
arredonda às vezes para cima, às vezes para baixo (pela sua aritmética de ponto
flutuante); a bancada aceita os dois.

## Conferência

`pnpm --filter @reverse/oracle verify`, seção "Vimshopaka": os quatro grupos e as
144 dignidades de cada mapa, nos 135 mapas.
