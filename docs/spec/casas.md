# Casas

## O que o PL9 oferece

O PL9 mostra o mapa por signo e, como referenciais alternativos, dois
sistemas de casas: **Bhava (Sripati)** e **Bhava (equal)**. O `core` calcula
os dois. Em ambos o Lagna é o **meio** da primeira casa, não o seu início.

## Meio do céu

Calculado pelas mesmas fórmulas fechadas do Lagna (ver `lagna.md`):
`atan2(sen θ, cos θ cos ε)`, menos a nutação longa, menos o ayanamsha, onde
`θ` é o tempo sideral local e `ε` a obliquidade média. Não depende da
latitude.

## Casas iguais

Doze casas de 30°. O meio da casa `k` é o Lagna mais `30° × (k − 1)`.

## Sripati

- O meio da casa 1 é o Lagna; o da casa 10 é o meio do céu; o da casa 7 e o
  da casa 4 são os pontos opostos.
- O arco do meio do céu ao Lagna, no sentido dos signos, é dividido em três
  partes iguais: os pontos de divisão são os meios das casas 11 e 12.
- O arco do Lagna ao ponto oposto ao meio do céu é dividido em três partes
  iguais: os pontos de divisão são os meios das casas 2 e 3.
- Os meios das casas 5, 6, 8 e 9 são os pontos opostos aos das casas 11, 12,
  2 e 3.

## Onde uma casa começa

Nos dois sistemas, uma casa começa no ponto médio entre o meio da casa
anterior e o seu próprio meio, e vai até o início da seguinte. O ponto
exatamente sobre o início pertence à casa que começa.

## Exemplo

Lagna a 100° e meio do céu a 5°, em Sripati:

| Casa | Meio | Início |
|---|---|---|
| 1 | 100,0000° | 84,1667° |
| 2 | 128,3333° | 114,1667° |
| 3 | 156,6667° | 142,5000° |
| 4 | 185,0000° | 170,8333° |
| 5 | 216,6667° | 200,8333° |
| 6 | 248,3333° | 232,5000° |
| 7 | 280,0000° | 264,1667° |
| 8 | 308,3333° | 294,1667° |
| 9 | 336,6667° | 322,5000° |
| 10 | 5,0000° | 350,8333° |
| 11 | 36,6667° | 20,8333° |
| 12 | 68,3333° | 52,5000° |

## Origem

- Fórmula do meio do céu: **lida na rotina do PL9**, a mesma do Lagna.
- Construção das casas Sripati e iguais, com o Lagna no meio da casa:
  descrita no manual do PL9 e clássica; **confirmada nas telas do PL9**.
- Início de cada casa no ponto médio entre dois meios: construção clássica,
  **confirmada nas telas do PL9** (coluna "Sandhi, from" da tabela "House
  cusp details").

## Conferência contra o PL9

Em 70 mapas, de 1801 a 2047 e até 65° de latitude, o meio ("Madhya") e o
início ("Sandhi, from") das doze casas foram lidos da tabela "House cusp
details" do PL9, nos referenciais Bhava (Sripati) e Bhava (equal): 3360
valores. O PL9 os mostra arredondados ao segundo de arco; a maior diferença
contra o `core` é de 0,50", isto é, o próprio arredondamento.

A casa de cada ponto decorre dos inícios das casas. Num mapa, as casas dos
nove grahas no desenho do PL9 em Bhava (Sripati) foram conferidas a olho e
coincidem com as do `core`.

## O que não foi verificado

- A casa de cada ponto, de forma sistemática: o PL9 a mostra só no desenho
  do mapa, que não foi lido por programa.
- Um ponto exatamente sobre o início de uma casa.
- Qual referencial a tela de mapa natal usa por padrão para pôr os planetas
  nas casas.
- As cúspides Placidus da tela Krishnamurti ("Cusp (KP)" na mesma tabela),
  que o PL9 também calcula.
