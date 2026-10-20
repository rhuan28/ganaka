# Etapa 5 — Inventário: trânsitos, panchanga, Varshaphala e Muhurta

Data: 2026-10-16. Fontes: as telas e os menus do PL9 (capturas na VM), a lista de páginas
do editor de modelos de impressão, o manual do PL9 e o executável (só o despacho e as
entradas; as regras ficam para cada sub-projeto). Os nomes abaixo são os da interface.

## 1. Como o PL9 imprime o que interessa

O editor de modelos (Print → Print Model → Edit) aceita três tipos de página: os relatórios
(os do menu Reports), os worksheets (as telas do menu Charts, impressas como estão) e
outros modelos. Por isso quase tudo desta etapa tem forma imprimível: as telas que o
manual chama de "só tela" (trânsitos animados, linhas do tempo, Muhurta) entram no
modelo como worksheet. A captura de tela fica só para o que não sair legível do PDF.

Duas maneiras de escolher o segundo instante convivem (escrito antes da impressão de teste;
o que a impressão mostrou, e que vale sobre esta seção e as colunas "Instante / local" da
seção 2, está na seção 5: os worksheets de trânsito e do Varshaphala seguem o relógio, não
o evento "Today"):

- **Worksheets e tabelas de trânsito:** tomam o evento "Today" (o evento 1 de Edit →
  Events, o mesmo de Edit → "Native's current location"). Os eventos ficam nos dados de
  cada mapa (a aba Events do diálogo Data Entry: "Today", "Muhurta" e os acrescentados);
  ao abrir um mapa, "Today" e "Muhurta" recebem a data e a hora do relógio e o local
  padrão (Jaipur, 26N55, 75E49'40, fuso −05:30 na convenção do PL9). O job grava os dois
  eventos depois de abrir cada mapa e antes de imprimir. Abrir a aba mostra antes o aviso
  do atlas ("Cannot open … _st.txt"), que se fecha com OK.
- **Relatórios do Varshaphala** (Reports → Varshaphala, exceto os "Varshaphala Charts"):
  ao abrir, pedem a idade ("Please enter the age…"); o valor proposto é a idade completa
  hoje (31 para o REF 0010 em outubro de 2026). O relatório mostra "Varshaphala for
  2026-2027, Passed year 31, Running year 32" e o retorno solar verdadeiro, no **local
  de nascimento**.
- **"Varshaphala Charts #1" a "#6":** seis páginas com os 72 primeiros retornos solares
  (12 por página), cada um com a data e a hora, o mapa, as posições ao minuto de arco,
  o senhor do ano e a Muntha. Não dependem de data nenhuma.
- **Muhurta:** o evento 2 de Edit → Events ("Muhurta"), ou o instante em que se abre o
  worksheet; o local é o do astrólogo (Edit → "Astrologer's location").

## 2. Por sub-projeto

Para cada página: o que mostra, se é relatório (R) ou worksheet (W), o instante e o local.

### 5A — Trânsitos

| Página | Tipo | Mostra | Instante / local |
|---|---|---|---|
| 101. Animated transits I | W | mapa de nascimento e de trânsito; posições, nakshatra e Shadbala dos dois; Kaksha (senhor e bindu), bindus do planeta e do Sarva no signo de trânsito; Ishta/Kashta dos trânsitos; Tarabala, Chandrabala, tithi, karana, yoga e quatro dashas no instante | "Today" |
| 102. Animated transits II | W | a ver na impressão de teste | "Today" |
| 103. Animated Transits - Vargas | W | os trânsitos nas vargas | "Today" |
| 113. Kaksha and dasha calendar | W | barras mensais dos kakshas (bindu sim/não, bindus do signo, R/D) com os dashas | janela a partir de "Today" |
| 108. Dasha and Transit timelines | W | linha do tempo de dashas (3 níveis) e gráfico de trânsitos por signo, mapa e tabelas Gochara | janela em torno de "Today" |
| 105. Graphical Ephemeris | W | efemérides gráficas com o dasha ao lado | janela do Change Time Tool |
| 106. Graphical ephemeris - 3 month overview | W | três meses de trânsitos | "Today" |
| 107. Yearly transit overview (South Indian) | W | entradas em signos no ano | ano de "Today"; só o mapa natal |
| 114. Kota Chakra, 115. Sanghatta Chakra, 116. Sarvatobhadra Chakra | W | os chakras de trânsito (Sarvatobhadra com a pontuação e as vedhas) | "Today" |
| 120. Events 1-10 | W | os eventos, o 1 sendo "Today" | eventos |

Fora do modelo: Research → "Time of transits" (diálogo: planeta em trânsito, ponto natal,
tipo de evento, "For dates after"; devolve o primeiro evento) e Print → "Transit/dasha
Report" (diálogo próprio, janela de meses "from"–"to", preferências de trânsito e de
dasha). Ambos ficam para o plano 5A (a sua última tarefa: um conjunto fixo de consultas). "Transit Interpretations" é texto interpretativo: fora da etapa.

Opções: ayanamsha, nós verdadeiros/médios e nascer do sol (já cobertos nas etapas 2–4);
a tabela de bindus do Ashtakavarga (Parashara ou Brihat Jataka, Options → Calculation);
a janela das linhas do tempo (centrar ou fixar).

### 5B — Panchanga

| Página | Tipo | Mostra | Instante / local |
|---|---|---|---|
| (201) Panchanga Details | R | tithi, vara, nakshatra, yoga, karana com os fins; Rahu Kaala; Ghat chakra | nascimento |
| (314) Basic Calculations | R | Avakhada chakra, calendários hindu e tâmil | nascimento |
| 72. Tithi Pravesh | W | o mapa do Tithi Pravesh do ano, D9 e Vimshottari | ano de "Today"; nascimento |
| 73. Tithi Pravesh (L) | W | o mesmo no local atual | ano de "Today"; "Today" |
| 8. Sunrise chart | W | o mapa do nascer do sol | dia de "Today" |
| 39. Panch Pakshi | W | o pássaro e os períodos do dia | "Today" |
| 104. Calendar | W | calendário com trânsitos e dashas | mês de "Today" |

O panchanga dos dois instantes de referência sai das tabelas dos worksheets de trânsito
(Animated transits I) e do Muhurta; o do nascimento, do (201) e do (314).

Fora do modelo: Print → Panchang (cerca de duas semanas por página; período escolhido na
própria tela; local "Native's current location"). Fica para o plano 5B, como um conjunto
fixo de impressões (o mês de cada data de referência).

Opções: Options → Panchang: as colunas da impressão Panchang; "Indian Calendar" com
Krishnadi (P.Anta) (o padrão), Shukladi (Amanta) e Krishnadi (P.Anta) 1/2 (muda os nomes do
mês e do ano lunar); "Display seconds" (desligado; ligado dá os fins ao segundo, útil para
a conferência); o estilo do mapa (só apresentação). Options → Calculation → Miscellaneous:
"Sunrise" e "Gulik method".

### 5C — Varshaphala

| Página | Tipo | Mostra | Instante / local |
|---|---|---|---|
| (339)–(344) Varshaphala Charts #1–#6 | R | 72 retornos solares: data, hora, mapa, posições, senhor do ano, Muntha | nenhum; nascimento |
| (401) Basic Calculations | R | dados do retorno solar verdadeiro, ayanamsha, Lagna | idade pedida; nascimento |
| (402) Natal Chart, (403) Chart and Planetary Details | R | mapas e posições | idade pedida |
| (404) Planetary Strength, etc. | R | Panchadhikaris, senhor do ano, forças Tajika | idade pedida |
| (405) Tajika Yogas (Summary), (415) Tajika Yogas (Detailed) | R | os yogas Tajika | idade pedida |
| (406) Tripataki Chakra | R | o chakra e as vedhas | idade pedida |
| (407) Sahams | R | os Sahams | idade pedida |
| (408) Mudda Dasha, (409) Mudda Dasha (Kalidasa), (410) Mudda Dasha (without dasha balance), (411) Patyayini Dasha | R | os dashas anuais | idade pedida |
| (417), (418) Consolidated Report #1, #2 | R | resumo, Harsha e Panchavargeeya bala | idade pedida |
| (425) Varshaphala Monthly Charts | R | os 12 mapas mensais | idade pedida |
| 64–66. Varshaphala I, II, III | W | mapa anual, tabelas "Varsh. year lord" e "Varsh. strength", dashas | ano de "Today"; nascimento |
| 67. Varshaphala I (L) | W | o mesmo no local atual | ano de "Today"; "Today" |
| 70. Varshaphala 8 years overview | W | oito anos | a partir do ano de "Today" |
| 75. Monthly Solar Ret. I, 81. Daily Solar Return I | W | retornos mensal e diário | "Today" |
| 89. Varshaphala Dashas | W | os quatro dashas anuais | ano de "Today" |
| 74. Sahams, 91. Tajika Yogas Summary, 92. Tripataki Chakra | W | as mesmas coisas na tela | ano de "Today" |

Os worksheets II, III dos retornos e as variantes (L) restantes (68, 69, 71, 76–80,
82–88) ficaram fora do modelo TEMPO: repetem, em outro instante ou lugar, o que as páginas
do modelo já mostram; o 5C os acrescenta se precisar de algum.

Opções: Options → Dashas, "Varshaphala dasha interpretation method": Mudda dasha (o
padrão), Mudda dasha (Kalidasa), Mudda dasha (without dasha balance), Patyayini dasha (muda
o dasha dos worksheets; os relatórios trazem os quatro em páginas próprias). Options →
Calculation → Miscellaneous, "Varshaphala": "True solar return" (o padrão) ou "Mean solar
return". Display → "Varshaphala headers" (só apresentação).

### 5D — Muhurta

| Página | Tipo | Mostra | Instante / local |
|---|---|---|---|
| 127. Muhurta | W | mapa do Muhurta e D9; posições, dignidade, Shadbala, Vimshopaka, Ashtakavarga (kaksha, bindus); "qualidades do dia"; termômetro do panchang (Tarabala, Chandrabala, tithi, nakshatra, yoga, karana); atividades do nakshatra e do tithi | evento "Muhurta"; local do astrólogo |
| 128. Muhurta - dashas and balas | W | dashas do nativo e do Muhurta; balas | idem |
| 129. Muhurta vargas | W | as vargas do Muhurta | idem |

O PL9 não busca momentos sozinho: o Muhurta é a avaliação de um instante dado (o manual
remete a busca a outro produto). Os gabaritos do 5D são portanto avaliações em instantes
fixos: as duas datas de referência (o evento "Muhurta" gravado como o "Today") nos 135
mapas (impressos na etapa 5.0), mais as três atividades do termômetro ("General
Auspicious Events", "Marriage", "Traveling"), que se trocam clicando na célula: ficam para o
plano 5D.

Opções: a atividade do termômetro (no título da célula); Options → Calculation →
Miscellaneous, "Muhurta dates": "Use current date" (o padrão) ou "Use last used date" (de onde
o worksheet parte; não muda as regras).

## 3. O segundo instante no executável

Lido no despacho (as regras de cada área ficam para o seu sub-projeto):

- **Eventos.** Cada evento guarda a data e a hora locais, a longitude, a latitude, o fuso
  e o horário de verão; o instante em UT é a data local mais (fuso − verão)/24 na
  convenção do PL9. O evento 1 é o "Today" (o mesmo que Edit → "Native's current
  location" edita); o evento 2 é o "Muhurta".
- **"Agora".** O "Today" no modo "now" lê o relógio da máquina e o converte com o fuso do
  local padrão. Os mapas de trânsito "agora" (sem evento) tomam o relógio e o **local
  padrão da instalação**, não o local de nascimento nem o do evento 1; os mapas de
  trânsito por evento tomam a data e o local do evento. A impressão de teste (tarefa 3)
  confere qual dos dois cada worksheet usa: um worksheet que siga o relógio em vez do
  evento 1 teria de ser tirado do modelo ou impresso com outro caminho.
- **O ano do Varshaphala.** Os anos completos são a parte inteira de (data − nascimento)
  / 365,25636 dias (o ano sideral médio), também no modo do retorno verdadeiro; o mensal
  e o diário tiram os meses e os dias da fração. Com o retorno verdadeiro (o padrão), o
  instante é procurado a partir de nascimento + 365,2422 × anos, com exatamente três
  passos de Newton (um dia por grau) sobre a longitude do Sol, sem teste de tolerância;
  com o médio, é nascimento + 365,25636 × anos (+ 30,43803 por mês, + 1,01460 por dia).
- **Os locais.** Varshaphala, retorno mensal, retorno diário e Tithi Pravesh usam o local
  de nascimento; as variantes (L) usam o local do evento 1. O Tithi Pravesh procura
  primeiro o retorno do Sol e depois o ângulo Lua − Sol de nascimento.
- **O senhor do ano** é escolhido entre os cinco Panchadhikaris (Muntha Pati, senhores do
  Lagna natal e anual, Trirashi Pati, Dina-Ratri Pati) pela força e pelo Ithasala com a
  Lua: a regra fica para o 5C.
- **O que não se achou por texto:** os nomes dos dashas anuais (Mudda, Patyayini) e das
  forças Tajika (Panchavargiya, Dwadashavargiya) não aparecem como texto no executável;
  as rotinas serão achadas no 5C pela página que as imprime. O lugar onde ficam as opções
  da aba Panchang também ficou em aberto.
- **Opções confirmadas:** o retorno verdadeiro ou médio; o cabeçalho do Varshaphala; o
  método do dasha anual (quatro valores); "Muhurta dates"; o cache de trânsitos e a
  velocidade da animação (só desempenho e apresentação).

## 4. O modelo TEMPO

Páginas, nesta ordem (o número entre parênteses é o do relatório; os worksheets pelo nome
e número da lista "Available printouts"):

1. (201) Panchanga Details
2. (314) Basic Calculations
3. (339)–(344) Varshaphala Charts #1 a #6
4. (401) a (411), (415), (417), (418), (425) — as páginas do Varshaphala da secção 5C
5. 101. Animated transits I; 102. Animated transits II; 103. Animated Transits - Vargas
6. 113. Kaksha and dasha calendar; 108. Dasha and Transit timelines; 105. Graphical
   Ephemeris; 106. Graphical ephemeris - 3 month overview; 107. Yearly transit overview
   (South Indian)
7. 114. Kota Chakra; 115. Sanghatta Chakra; 116. Sarvatobhadra Chakra
8. 120. Events 1-10; 8. Sunrise chart; 39. Panch Pakshi; 104. Calendar
9. 72. Tithi Pravesh; 73. Tithi Pravesh (L)
10. 64. Varshaphala I; 65. Varshaphala II; 66. Varshaphala III; 67. Varshaphala I (L);
    70. Varshaphala 8 years overview; 75. Monthly Solar Ret. I; 81. Daily Solar Return I;
    89. Varshaphala Dashas; 74. Sahams; 91. Tajika Yogas Summary; 92. Tripataki Chakra
11. 127. Muhurta; 128. Muhurta - dashas and balas; 129. Muhurta vargas

A impressão de teste (tarefa 3) diz se as páginas de relatório do Varshaphala pedem a
idade também dentro do modelo; se pedirem, o job responde com a idade da data de
referência, conferida por captura como a data.

## 5. O que a impressão de teste mostrou (REF 0010, 2026-10-17)

O modelo TEMPO imprime as 60 páginas com texto legível. Quem fixa a data de cada parte:

| Parte | Data usada | Como o job a fixa |
|---|---|---|
| Muhurta (127, 128, 129), com o panchanga, o termômetro, Tarabala, Chandrabala, posições, kakshas e bindus | o evento "Muhurta" | grava o evento na data de referência |
| Relatórios do Varshaphala (401 a 425) | a idade perguntada (três perguntas por mapa) | responde a idade na data de referência: a parte inteira de (data − nascimento) / 365,25636; mapa nascido depois da data recebe a idade 0 (a que o PL9 propõe é negativa e recusada para um mapa nascido depois de hoje) |
| Varshaphala Charts #1 a #6 | nenhuma | — |
| Trânsitos (101, 102, 103, 105, 106, 107, 113, 108), chakras, Events, Sunrise, Panch Pakshi, Calendar, Tithi Pravesh, worksheets do Varshaphala (64 a 89) | o relógio da máquina ("agora"), não o evento "Today" | nenhuma: cada página traz impresso o instante usado, que o leitor toma como entrada |

Decisões que isso trouxe (do construtor):

- As duas datas de referência valem para o Muhurta e para as idades do Varshaphala; as
  partes presas ao relógio são conferidas no instante impresso em cada página.
- Gravar um evento pelo diálogo regrava também o nascimento a partir dos campos da
  tela, a hora ao segundo inteiro e as coordenadas ao segundo de arco. Os gabaritos da etapa 5 usam por isso
  cópias dos 135 mapas com o nascimento já arredondado assim e o local em modo manual
  (`refset/xml-tempo`, fora do repositório); nelas o mapa natal não muda ao gravar (a
  tela do mapa fica igual pixel a pixel). Para o REF 0010 o Ascendente natal passa de
  16:30:55 a 16:30:50. O job fecha o mapa sem salvar.
- Sem "Manual" no local do evento, mudar a data faz o PL9 consultar o atlas e fechar.

## 6. Onde cada página é conferida (fechamento, etapa 5G)

A bancada (`pnpm --filter @reverse/oracle verify`) confere nos 135 mapas, nas duas datas de
referência, o que cada página imprime em texto; os desenhos ficam para a etapa 6.

| Página | Conferida | Onde está a regra |
|---|---|---|
| (201) Panchanga Details, (314) Basic Calculations | elementos, fins, Avakhada, calendários (com 42 pendentes) | panchanga.md |
| (339)–(344) Varshaphala Charts #1–#6 | os 72 retornos de cada mapa | varshaphala.md |
| (401)–(425) relatórios do Varshaphala | retorno, mapa, forças, senhor do ano, yogas, Tripataki, Sahams, os quatro dashas, os meses (Kutta e Tambira não) | varshaphala.md |
| 101, 102. Animated transits I, II | posições, R, kakshas, Shadbala, Tarabala, Chandrabala, Gochara data, o instante e o local | transitos.md |
| 103. Animated Transits - Vargas | as tabelas da D9 e da D10 (sem a natureza funcional dos nós) | transitos.md |
| 104. Calendar | os eventos do mês | transitos.md |
| 105. Graphical Ephemeris, 108. Dasha and Transit timelines | não: gráficos e linhas do tempo sem datas em texto; a tabela de 108 repete a de 106 | — |
| 106. Graphical ephemeris - 3 month overview | os senhores KP, o SB# e o VB dos trânsitos (o VB dos nós pendente onde difere); o gráfico não | transitos.md |
| 107. Yearly transit overview | as entradas em signos com dia legível | transitos.md |
| 113. Kaksha and dasha calendar | os rótulos do mês e os números sob eles | transitos.md |
| 114. Kota Chakra | as posições (a pontuação não) | transitos.md |
| 115. Sanghatta, 116. Sarvatobhadra | não: desenhos sem número | transitos.md |
| 120. Events 1-10 | as datas e os quatro dashas dos dois eventos | transitos.md |
| 8. Sunrise chart | as posições e as 15 linhas do Vimshottari | panchanga.md |
| 39. Panch Pakshi | o cabeçalho, os dez yamas e as 50 partes | panchanga.md |
| 72, 73. Tithi Pravesh | o instante, nas duas variantes | panchanga.md |
| 64–66, 74. Varshaphala I–III, Sahams | retorno, tabela do mapa anual, kakshas, forças, ofícios, Muntha, Sahams; as listas de dashas de 64 e 65 | varshaphala.md |
| 75, 81, 89 | os retornos mensal e diário e as listas de dashas (a Patyayini de oito mapas pendente) | varshaphala.md |
| 67. Varshaphala I (L), 70. Varshaphala 8 years overview, 91, 92 | não: 67 repete 64 em outro lugar; 70, 91 e 92 são mapas desenhados (os retornos de 70 são os já conferidos nos Varshaphala Charts) | varshaphala.md |
| 127–129. Muhurta | posições, forças, panchanga, termômetro, dashas, balas, vargas (o VB dos nós pendente) | muhurta.md |
