# Signo, nakshatra e pada

## Regra

Para uma longitude sideral reduzida ao intervalo de 0° (inclusive) a 360°
(exclusive):

- **Signo:** parte inteira da longitude dividida por 30. De 0 (Áries) a 11
  (Peixes).
- **Nakshatra:** parte inteira da longitude dividida por 13°20' (360/27). De
  0 (Ashwini) a 26 (Revati).
- **Pada:** dentro do nakshatra, parte inteira da distância ao início do
  nakshatra dividida por 3°20' (um quarto do nakshatra), mais um. De 1 a 4.

O limite inferior de cada divisão pertence à divisão que começa: 30°
exatos é o início do segundo signo.

## Arredondamento

A redução a [0, 360) trata um valor negativo minúsculo, cuja soma com 360
arredondaria para 360 exatos, como 0.

Signo, nakshatra e pada derivam de um único índice: o do quarto de nakshatra
(3°20'), de 0 a 107. O signo é esse índice dividido por 9, o nakshatra é ele
dividido por 4, e o pada é o resto da divisão por 4, mais um. Assim os três
nunca se contradizem numa fronteira, e nenhum sai da faixa por erro de ponto
flutuante.

## Origem

Definições clássicas, de domínio comum.

## Conferência contra o PL9

Feita de duas formas.

**Pelas longitudes.** Em todos os mapas de referência, o signo, o nakshatra
e o pada do `core` são iguais aos que a mesma regra dá para a longitude
exportada pelo PL9. Isso mostra que as duas longitudes caem na mesma
divisão.

**Pelas telas do PL9.** Em 72 mapas, o signo, o nakshatra e o pada do Lagna
e dos nove grahas foram lidos da tela do programa e coincidem com os do `core` em todos os
720 valores de cada tipo. O ponto mais próximo de uma fronteira entre esses
mapas está a cerca de 1,5" dela: a regra da fronteira exata não foi posta à
prova.
