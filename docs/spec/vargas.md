# As vargas

## Convenções

- Entrada: longitude sideral. Saída: o signo (0 = Áries … 11 = Peixes) que o
  ponto ocupa na varga.
- "Signo ímpar" e "signo par" contam os signos a partir de Áries = 1: Áries,
  Gêmeos, Leão… são ímpares.
- Cada signo é dividido em `N` partes iguais de `30°/N`, numeradas de 0 a
  `N − 1`, exceto no D30, cujas partes são desiguais.
- Numa fronteira entre partes iguais, o ponto pertence à parte que começa.

## Regras das dezesseis vargas clássicas

| Varga | Partes | Signo da parte `p` (de 0 a N − 1) no signo `s` (de 0 a 11) |
|---|---|---|
| D1 | 1 | `s` |
| D2 | 2 | Signo ímpar: primeira metade Leão, segunda Câncer. Signo par: primeira Câncer, segunda Leão. |
| D3 | 3 | `s + 4p`: o próprio signo, o quinto e o nono |
| D4 | 4 | `s + 3p`: o próprio signo, o quarto, o sétimo e o décimo |
| D7 | 7 | contagem contínua: `7s + p` |
| D9 | 9 | contagem contínua: `9s + p` |
| D10 | 10 | Signo ímpar: `s + p`. Signo par: `s + 8 + p` (a partir do nono signo). |
| D12 | 12 | `s + p` |
| D16 | 16 | contagem contínua: `16s + p` |
| D20 | 20 | contagem contínua: `20s + p` |
| D24 | 24 | Signo ímpar: a partir de Leão (`4 + p`). Signo par: a partir de Câncer (`3 + p`). |
| D27 | 27 | contagem contínua: `27s + p` |
| D30 | — | ver abaixo |
| D40 | 40 | Signo ímpar: a partir de Áries (`p`). Signo par: a partir de Libra (`6 + p`). |
| D45 | 45 | Signo móvel: a partir de Áries (`p`). Fixo: de Leão (`4 + p`). Dual: de Sagitário (`8 + p`). |
| D60 | 60 | `s + p` |

Todos os resultados são tomados módulo 12.

"Contagem contínua" quer dizer que a varga é a longitude multiplicada por
`N`: as partes seguem a ordem dos signos sem recomeçar a cada signo. Para
D7, D9, D16, D20 e D27 isso coincide com as regras usuais ("signos pares
começam do sétimo", "móveis de Áries, fixos de Leão, duais de Sagitário" e
assim por diante).

### D30

| Signo | Graus dentro do signo | Signo no D30 |
|---|---|---|
| Ímpar | até 5° | Áries |
| | de 5° a 10° | Aquário |
| | de 10° a 18° | Sagitário |
| | de 18° a 25° | Gêmeos |
| | de 25° a 30° | Libra |
| Par | até 5° | Touro |
| | de 5° a 12° | Virgem |
| | de 12° a 20° | Peixes |
| | de 20° a 25° | Capricórnio |
| | de 25° a 30° | Escorpião |

No D30 o limite pertence à parte que **termina**: 5° exatos de um signo
ímpar ainda são Áries. É como o PL9 faz.

## D2 a exatos 15° de um signo ímpar

O PL9 trata os 15° exatos de um signo ímpar como fim da primeira metade, e a
conta que faz nesse único ponto resulta em Virgem, que não é um signo de
hora. O modo `pl9` reproduz isso. O modo `corrected` dá Câncer, tratando os
15° exatos como início da segunda metade, como nas outras vargas. A
diferença só existe para uma longitude exatamente igual a 15° de um signo
ímpar. Ver `correcoes.md`.

## Exemplos

| Longitude | D2 | D3 | D4 | D7 | D9 | D10 | D12 | D16 | D20 | D24 | D27 | D30 | D40 | D45 | D60 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 15° de Áries (15°), modo `pl9` | Vir | Leo | Lib | Can | Leo | Vir | Lib | Sag | Aqu | Leo | Tau | Sag | Sag | Aqu | Lib |
| 25° de Touro (55°) | Leo | Cap | Aqu | Ari | Leo | Vir | Pis | Vir | Ari | Pis | Tau | Cap | Can | Vir | Can |
| 29°30' de Peixes (359,5°) | Leo | Sco | Sag | Pis | Pis | Leo | Aqu | Pis | Pis | Gem | Pis | Sco | Cap | Leo | Aqu |

## As outras 29 vargas do PL9

O PL9 oferece 45 vargas. Além das dezesseis clássicas, o `core` calcula as
29 abaixo, com estes nomes:

| Nome no `core` | Nome no PL9 | Partes |
|---|---|---|
| `D5` | Panchamsha 1/5 | 5 |
| `D6` | Shashtamsha 1/6 | 6 |
| `D8` | Ashtamsha 1/8 | 8 |
| `D11` | Ekadashamsha 1/11 | 11 |
| `D150` | Nadiamsha 1/150 | 150 |
| `D2-parivritti` | Parivriti dvaya Hora | 2 |
| `D2-samasaptaka` | Samasaptaka Hora | 2 |
| `D3-parivritti` | Parivriti Traya Dreshkana | 3 |
| `D4-parivritti` | Chaturthamsha 123 | 4 |
| `D10-parivritti` | Dashamasha 123 | 10 |
| `D12-parivritti` | Dvadashamsha 123 | 12 |
| `D30-parivritti` | Trimshamsha 123 | 30 |
| `D5-parivritti` | Panchamamsha | 5 |
| `D16-iyer` | Shodashamsha Iyer | 16 |
| `D11-iyer` | Ekadashamsha 1/11 Iyer | 11 |
| `D108-nd` | Astottaramsa ND | 108 |
| `D108-dn` | Astottaramsa DN | 108 |
| `D2-kashinatha` | Kashinatha Hora | 2 |
| `D2-somanatha` | Somanatha Hora | 2 |
| `D3-jagannatha` | Jagannatha Drekkana | 3 |
| `D3-somanatha` | Somanatha Drekkana | 3 |
| `D4-vedamsha` | Vedamsha | 4 |
| `D6-kaulaka` | Kaulaka | 6 |
| `D9-pada` | Pada Navamsha | 9 |
| `D9-nadi` | Nadi Navamsha | 9 |
| `D9-somanatha` | Somanatha Navamsha | 9 |
| `D24-parasiddhamsha` | Para Siddhamsha | 24 |
| `D24-siddhamsha` | Siddhamsha (alt) | 24 |
| `D30-venkatesha` | Venkatesha Trimshamsha | 30 |

O PL9 chama de "Iyer", nas suas telas de mapas, as vargas aqui nomeadas
`-parivritti`.

### Regras

`s` = signo de 0 a 11; `d` = graus dentro do signo; `p` = parte de 0 a N − 1 (`p = ⌊d·N/30⌋`); `f = d·N/30` sem truncar; "ímpar" = Áries, Gêmeos… (`s` par). Tudo módulo 12.

- **Contagem contínua** (a longitude multiplicada por N): `D150`, `D2-parivritti`, `D3-parivritti`, `D4-parivritti`, `D10-parivritti`, `D12-parivritti`, `D30-parivritti`, `D5-parivritti`, `D6-kaulaka`. Signo = `(N·s + p) mod 12`.
- **D5:** signo ímpar: Áries, Aquário, Sagitário, Gêmeos, Libra; signo par: Touro, Virgem, Peixes, Capricórnio, Escorpião (as partes, na ordem).
- **D6:** ímpar: a partir de Áries (`p`); par: a partir de Libra (`6 + p`).
- **D8:** móvel: a partir de Áries (`p`); fixo: de Sagitário (`8 + p`); dual: de Leão (`4 + p`).
- **D11:** `p − s`.
- **D2-samasaptaka:** as duas metades de um signo vão para os dois signos do
  seu eixo (o signo e o sétimo), e a primeira metade vai, para os dois signos
  do eixo, sempre ao mesmo: Libra no eixo Áries–Libra, Touro no eixo
  Touro–Escorpião, Sagitário em Gêmeos–Sagitário, Capricórnio em
  Câncer–Capricórnio, Leão em Leão–Aquário e Peixes em Virgem–Peixes.
- **D2-kashinatha:** as duas metades vão para os dois signos do regente do signo. Nos signos de Marte, Mercúrio e Júpiter: primeira metade no outro signo do regente, segunda no próprio. Nos de Vênus e Saturno, e em Câncer e Leão (que fazem par entre si): primeira no próprio, segunda no outro.
- **D2-somanatha:** ímpar: o próprio signo, depois o seguinte; par: o próprio, depois o anterior.
- **D3-jagannatha:** os três signos do elemento do signo, começando pelo móvel: fogo de Áries, terra de Capricórnio, ar de Libra, água de Câncer; passo de quatro signos.
- **D3-somanatha:** `k = ⌊s/2⌋`. Ímpar: `3k + p`. Par: `11 − 3k − p`.
- **D4-vedamsha:** móvel: de Áries; fixo: de Leão; dual: de Sagitário; passo de três signos (`início + 3p`).
- **D9-pada:** início como no Navamsha (fogo de Áries, terra de Capricórnio, ar de Libra, água de Câncer). Para a frente nos signos de Áries a Gêmeos e de Libra a Sagitário; para trás nos demais.
- **D9-nadi:** mesmo início; para a frente nos signos ímpares, para trás nos pares.
- **D9-somanatha:** `k = ⌊s/2⌋`. Ímpar: `9k + p`. Par: `2 − 3k − p`.
- **D16-iyer:** ímpar: `s + p`. Par: `⌊s + 4 − f⌋`.
- **D11-iyer:** `⌊1 − f⌋`.
- **D24-parasiddhamsha:** ímpar: `4 + p`. Par: `⌊4 − f⌋`.
- **D24-siddhamsha:** ímpar: `⌊5 − f⌋`. Par: `⌊4 − f⌋`.
- **D30-venkatesha:** `s + p` (cada grau, um signo, a partir do próprio signo).
- **D108-nd:** toma-se a longitude no Navamsha (`9·L mod 360`) e aplica-se a ela o D12.
- **D108-dn:** toma-se a longitude no D12 (`(s + d/2,5)·30`) e aplica-se a ela o Navamsha.

Nas contagens invertidas (`⌊base − f⌋`), uma fronteira exata **dentro** do
signo pertence à parte que termina; é o que a fórmula dá e o que o PL9 faz.
No início do signo (`f = 0`) a fórmula dá o valor que viria antes da
primeira parte. No D11-iyer esse valor é Touro, que essa varga não dá em
nenhum outro ponto: o modo `pl9` o reproduz, e o modo `corrected` dá Áries,
a primeira parte (correção 7 de `correcoes.md`). O `core` faz essas contas
em precisão dupla, sem tratar como exatos os limites que não são
representáveis; a menos de um bilionésimo de grau de um desses limites, o
resultado pode ser o da parte vizinha.

Sete dessas vargas (Samasaptaka Hora, Kashinatha Hora, Somanatha Hora,
Somanatha Drekkana, Pada Navamsha, Nadi Navamsha e Somanatha Navamsha) estão
descritas aqui pelo signo de partida e pelo sentido da contagem em cada
signo, ou em cada eixo, que é a forma
como a regra se enuncia; o resultado é o mesmo que o do programa.

## Origem

**Lidas no PL9.** As regras acima descrevem o que o programa calcula para
cada uma das dezesseis vargas de Parashara, e foram obtidas pela leitura das
suas rotinas. Todas coincidem com as regras clássicas publicadas.

As regras das outras 29 vargas também foram lidas na rotina de vargas do
programa, e conferidas contra os mapas que o PL9 imprime (ver
`docs/relatorios/conformidade-posicoes.md`). São regras de escola: o `core` as
reproduz como o PL9 as aplica, nos dois modos.

## Conferência contra o PL9

Em 72 mapas, o signo do Lagna e dos nove grahas em cada varga foi lido do
relatório "Shodashvarga Summary" do programa: 10 800 células de D2 a D60,
todas iguais às do `core`. Nenhuma dessas células está a menos de 0,5" de um
limite de divisão, de modo que as regras de fronteira (em particular a do
D30 e a do D2 a 15°) vêm só da leitura das rotinas.

## O que não foi verificado

- Em algumas das 29 vargas o PL9 faz a conta em precisão simples. O `core`
  usa precisão dupla; a diferença só aparece a menos de 0,1" de um limite de
  parte.
- O comportamento exato numa fronteira de parte das 29 vargas vem só da
  leitura das rotinas.
