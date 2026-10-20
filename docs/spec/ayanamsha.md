# Ayanamshas do PL9

## Regra geral

O `core` trabalha com a longitude referida ao equinócio médio da data (sem
nutação) e dela subtrai o ayanamsha. Cada ayanamsha do PL9 é o ayanamsha
médio de um modo da Swiss Ephemeris atual mais uma constante:

| Opção no PL9 | Modo da biblioteca | Constante (PL9 − biblioteca) | Valor em J2000 |
|---|---|---|---|
| Lahiri | Lahiri | −0,1382" | 23°51'25,39" |
| Yukteshwar | Yukteshwar | 0 | 22°28'43,69" |
| Raman | Raman | +0,8280" | 22°24'39,68" |
| Bhasin | J.N. Bhasin | 0 | 22°45'43,69" |
| Fagan | Fagan/Bradley | +0,4021" | 24°44'25,48" |
| Krishnamurti | Krishnamurti | +0,8280" | 23°45'37,69" |
| Krishnamurti New | Krishnamurti | +322,8280" | 23°50'59,69" |
| True Chitra | True Citra | 0 | 23°50'24,06" |

O ayanamsha da biblioteca é avaliado no tempo universal dado. Avaliá-lo no
instante deslocado por Delta T não faz diferença mensurável.

## None (Sayana)

Com esta opção o PL9 dá a longitude tropical **aparente**, com nutação. No
esquema do `core` isso equivale a um "ayanamsha" igual a menos a nutação em
longitude, tomada da biblioteca no instante do PL9 (ver `delta-t.md`).

## Deslocamento manual ("Specify offset")

O valor informado é **subtraído** do ayanamsha: um deslocamento positivo de
1° aumenta todas as longitudes siderais em 1°.

## Origem

**Medida.** Para cada opção, trinta mapas espalhados de 1801 a 2048 foram
exportados do PL9 com a opção selecionada. O ayanamsha implícito de cada
mapa é a longitude do Sol referida ao equinócio médio, no instante do PL9,
menos a longitude exportada. Esse valor foi comparado com cada modo da
biblioteca.

| Opção | Melhor modo | Diferença média | Variação nos 30 mapas |
|---|---|---|---|
| Lahiri (290 mapas) | Lahiri | −0,1382" | 0,0005" |
| Yukteshwar | Yukteshwar | 0,0000" | 0,0001" |
| Raman | Raman | +0,8280" | 0,0001" |
| Bhasin | J.N. Bhasin | 0,0000" | 0,0001" |
| Fagan | Fagan/Bradley | +0,4021" | 0,0001" |
| Krishnamurti | Krishnamurti | +0,8280" | 0,0001" |
| Krishnamurti New | Krishnamurti | +322,8280" | 0,0001" |
| True Chitra | True Citra | −0,015" | 0,063" |

Em todos, o ayanamsha implícito é o mesmo para Sol, Lua, Marte, Júpiter e
Saturno do mesmo mapa, a menos de 0,004".

Observações:

- A diferença é constante no tempo em todos menos True Chitra. Uma
  constante exclui diferença de taxa de precessão.
- "Krishnamurti New" fica exatamente 322" (5'22") acima de "Krishnamurti".
  O modo mais recente da biblioteca com nome parecido não corresponde: fica
  a 250" e com variação maior.
- True Chitra acompanha o modo da biblioteca, que depende da posição da
  estrela na data, com diferença de até cerca de 0,05". A regra não aplica
  correção.
- Para "None (Sayana)", a longitude exportada coincide com a longitude
  aparente da biblioteca com diferença abaixo de 0,004" e difere da
  longitude sem nutação em até 17".
- Para o deslocamento manual, o Sol de um mesmo mapa passou de 5,0837° para
  6,0837° com deslocamento de 01:00:00.

## O deslocamento de 0,138" do Lahiri

A medição das efemérides deixou em aberto se esse deslocamento era do
Lahiri ou comum a todos os ayanamshas. É do Lahiri: Yukteshwar e Bhasin não
têm deslocamento nenhum, e Raman, Fagan e Krishnamurti têm constantes
próprias e diferentes.

Hipótese, não verificada: as constantes refletem mudanças na definição
desses ayanamshas entre a versão 2.00 da Swiss Ephemeris e a atual.

## Conformidade

Com estas regras, as longitudes de Sol a Plutão ficam dentro de 0,5" do PL9
nos trinta mapas de cada opção. Os valores por ponto estão em
`docs/relatorios/conformidade-posicoes.md`.

## O que não foi verificado

- O deslocamento manual combinado com ayanamshas que não o Lahiri, e com
  "None (Sayana)".
- Deslocamentos negativos: o campo do PL9 foi testado só com valor positivo.
- O Lagna com cada ayanamsha além do que o relatório de conformidade mostra.
- Mais de trinta mapas por opção.
