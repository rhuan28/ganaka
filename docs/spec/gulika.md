# Gulika

Vale para as duas alternativas da opção "Gulik method" do PL9: "Ending of
portion", a observada na instalação examinada e o padrão do `core`, e
"Beginning of portion" (`gulika: 'beginning'`).

## Regra

1. Determina-se se o instante é **de dia ou de noite**: é dia quando o Sol
   está acima do horizonte, pelo critério de `nascer-do-sol.md`.
2. De dia, o intervalo é do nascer ao pôr do sol. De noite, do pôr do sol ao
   nascer do sol seguinte. Os três instantes são os de `nascer-do-sol.md`,
   com os desvios próprios da busca do PL9.
3. O intervalo é dividido em **oito partes iguais**.
4. As partes pertencem aos regentes dos dias da semana, na ordem Sol, Lua,
   Marte, Mercúrio, Júpiter, Vênus, Saturno. De dia, a primeira parte é do
   regente do dia da semana. De noite, a primeira é do regente do quinto dia
   a contar dele. A oitava parte fica sem regente.
5. O Gulika é o **Lagna no instante em que termina a parte de Saturno**. Com
   "Beginning of portion", é o Lagna no instante em que ela **começa**.

Número da parte de Saturno:

| Dia da semana | De dia | De noite |
|---|---|---|
| Domingo | 7 | 3 |
| Segunda | 6 | 2 |
| Terça | 5 | 1 |
| Quarta | 4 | 7 |
| Quinta | 3 | 6 |
| Sexta | 2 | 5 |
| Sábado | 1 | 4 |

## Dia da semana

- **De dia:** o dia da semana da data do instante.
- **De noite:** o dia da semana da data de doze horas antes do instante.
  Assim a noite inteira pertence ao dia em que começou, se ela começa depois
  do meio-dia e termina antes do meio-dia seguinte.

"Data" aqui é a do relógio em que o mapa está escrito: a hora local, com o
fuso e o horário de verão do mapa. O `core` recebe a diferença entre esse
relógio e o tempo universal (`utcOffsetHours`) e, sem ela, usa o tempo
universal. Essa diferença não altera nenhum outro ponto.

O dia da semana **não** é o do nascer do sol, nem o da data em tempo local
médio: as duas hipóteses foram testadas e falham em dezenas de mapas.

## Origem

- A alternativa "Beginning of portion": descrita no manual, e **conferida**
  contra a página "Sub-Planets" dos mapas impressos pelo PL9, que mostra o
  Gulika pelos dois métodos lado a lado, arredondado ao segundo, sem que a
  opção precise ser trocada. A página chama o início de "Parashara Method"
  e o fim de "Kalidasa method".

- Divisão em oito partes e uso do fim da parte: descritos no manual do PL9
  e clássicos. **Confirmados por medição:** invertendo o Gulika exportado
  para o instante em que o Lagna tem aquele valor, a fração do dia ou da
  noite cai num múltiplo exato de um oitavo (dentro de um bilionésimo) nos
  290 mapas iniciais.
- Os instantes de nascer, pôr e nascer seguinte: **lidos na rotina do PL9**
  (ver `nascer-do-sol.md`). Com instantes calculados de outra forma a fração
  não fecha.
- Tabela da parte de Saturno: **medida**; coincide com a regra clássica.
- Regra do dia da semana: **medida** — a única, entre as testadas, sem
  nenhuma exceção nos 290 mapas, todos gravados sem fuso. Que o relógio é o
  do mapa, e não o tempo universal, vem da **leitura da rotina** que monta o
  quadro do dia: ela guarda a hora local do mapa e a converte em tempo
  universal somando o fuso. A rotina que escolhe a parte de Saturno não foi
  lida.

## Conferência do relógio local

Cinco mapas foram gravados com fuso ou horário de verão (5,5 h e 10 h a
oeste, 3 h e 10 h a leste, uma hora de horário de verão) e exportados do
PL9. Com a diferença de relógio informada, os vinte pontos coincidem com a
exportação. Sem ela, o Gulika de um dos cinco sai com o dia da semana
errado, a mais de 20° de distância. Cinco mapas confirmam o sentido da
regra; não cobrem todas as combinações de dia, noite e mudança de data.

## Conformidade

Diferença máxima de 0,004" nos mapas de referência com Lahiri. Os números
atuais, por conjunto, estão em `docs/relatorios/conformidade-posicoes.md`.

## O que não foi verificado

- A opção "Beginning of portion".
- Mandi, que o PL9 também calcula.
