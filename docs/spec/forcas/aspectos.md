# Aspectos graduados

Código: `packages/core/src/strengths/aspects.ts`. Testes:
`packages/core/test/aspects.test.ts`.

O valor, de 0 a 60 virupas, que um planeta lança sobre um ponto, usado pelo PL9
no Drik Bala (e no Bhava Bala). O ângulo é contado do planeta ao ponto, no
sentido dos signos. Regras lidas no executável do PL9 e conferidas nos
relatórios de aspectos e no Drik Bala impresso.

## A curva comum

Todos os planetas lançam, pelo ângulo `k`:

| `k` | valor |
|---|---|
| até 30° | 0 |
| 30° a 60° | sobe meio virupa por grau, até 15 |
| 60° a 90° | sobe um por grau, até 45 |
| 90° a 120° | cai meio por grau, até 30 |
| 120° a 150° | cai um por grau, até 0 |
| 150° a 180° | sobe dois por grau, até 60 |
| 180° a 300° | cai meio por grau, até 0 |
| de 300° em diante | 0 |

## Os aspectos especiais

Marte, Júpiter, Saturno, Rahu e Ketu têm picos de 60 próprios; o valor é o
maior entre a curva comum e os picos. Em volta de cada pico, por trinta graus de
cada lado, o valor sobe até ele e cai depois dele à razão dada, por grau:

| Planeta | Pico | Antes | Depois |
|---|---|---|---|
| Marte | 90° | 1,5 | 1 |
| Marte | 210° | platô de 60 desde 180° | 1 |
| Júpiter, Rahu, Ketu | 120° e 240° | 0,5 | 1 |
| Saturno | 60° | 2 | 0,5 |
| Saturno | 270° | 1 | 2 |

O valor nunca fica abaixo de zero.
