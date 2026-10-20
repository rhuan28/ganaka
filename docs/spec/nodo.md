# Rahu e Ketu

## Regra

Com a opção de nodo verdadeiro, que é a da instalação examinada:

1. Avaliar o nodo verdadeiro (osculador) da Lua na Swiss Ephemeris, referido
   ao equinócio médio da data (sem nutação), no instante do PL9 (ver
   `delta-t.md`). Seja `Ω` essa longitude.
2. Referir `Ω` ao equinócio de J2000, subtraindo a precessão geral em
   longitude acumulada desde J2000:
   `p = (5028,796195 T + 1,1054348 T²) / 3600` graus, com `T` em séculos
   julianos desde J2000. Seja `Ω₀ = Ω − p`.
3. Somar a `Ω` o termo `0,4653" × sen(Ω₀)`.
4. Subtrair o ayanamsha.

Ketu é Rahu mais 180°.

A velocidade devolvida é a do nodo verdadeiro da biblioteca; Ketu tem a
mesma.

## Origem

- Passos 1 e 4: mesma construção das posições planetárias.
- Passo 3: **medido**. A diferença entre o Rahu exportado pelo PL9 e o nodo
  verdadeiro da Swiss Ephemeris 2.10, nos 290 mapas de referência, foi
  ajustada a senos e cossenos de combinações dos argumentos lunares; uma
  única combinação explica 99,9% dela, e essa combinação equivale à
  longitude do próprio nodo.
- Ketu oposto a Rahu: confirmado nos 290 mapas, com erro abaixo de 0,001".

## Candidatos comparados

Diferença contra o Rahu do PL9, nos 290 mapas:

| Candidato | Máxima | Mediana |
|---|---|---|
| Nodo verdadeiro, instante do PL9, sem nutação | 0,479" | 0,317" |
| Nodo verdadeiro, instante original, sem nutação | 0,596" | 0,317" |
| Nodo verdadeiro, instante do PL9, com nutação | 19,2" | 12,5" |
| Nodo médio | 6787" | 4008" |

Ajuste do resíduo do primeiro candidato a `a sen(x) + b cos(x)`:

| Argumento `x` | a | b | Resíduo máximo |
|---|---|---|---|
| Nodo verdadeiro, equinócio da data | 0,4645 | 0,0069 | 0,020" |
| **Nodo verdadeiro, equinócio de J2000** | **0,4653** | **−0,0001** | **0,015"** |
| Nodo médio, equinócio de J2000 | 0,4647 | −0,0004 | 0,016" |

O termo em cosseno é nulo no referencial de J2000, e por isso a regra usa só
o seno. Não se encontrou quantização nos valores do PL9.

## Interpretação (hipótese)

Um termo proporcional ao seno da longitude do nodo no referencial de J2000 é
o que resulta de calcular o nodo sobre uma eclíptica inclinada de um ângulo
pequeno em torno da linha dos equinócios. A inclinação correspondente é
`0,4653" × tan(5,145°) ≈ 0,042"`, que é a diferença entre a obliquidade de
J2000 no modelo de precessão antigo (84381,448") e no atual (84381,406"). A
hipótese é que a versão da Swiss Ephemeris usada pelo PL9 calculava o nodo
osculador com a obliquidade antiga. Não foi verificada no código.

O resíduo de 0,015" é compatível com a variação da inclinação da órbita
lunar, que a regra trata como constante.

## Conformidade

Rahu e Ketu ficam a no máximo 0,015" do PL9 nos 290 mapas.

## O que não foi verificado

- A velocidade do nodo: a exportação do PL9 não a traz.
- A opção de nodo médio, que o `core` não implementa.

## Retrogradação

O PL9 não marca os nodos como retrógrados em nenhuma tela, embora o nodo
verdadeiro ande para trás quase sempre. O `core` devolve `retrograde: false`
para Rahu e Ketu, nos dois modos; a velocidade continua no resultado.
