# Conformidade das posições com o PL9

Gerado por `pnpm --filter @reverse/oracle verify`. Tolerância: 0,5" em longitude; signo, nakshatra e pada idênticos, salvo ponto a menos de 0,5" de uma fronteira.

Nas tabelas de longitude abaixo, o signo, o nakshatra e o pada "esperados" são derivados da longitude do PL9 pela regra de `docs/spec/zodiaco.md`. Os valores lidos das telas do PL9 estão na última seção.

## Resumo

| Conjunto | Mapas | Campos | Falhas de longitude | Falhas categóricas | Casos de borda | Situação |
|---|---|---|---|---|---|---|
| lahiri | 380 | 7600 | 0 | 0 | 0 | aprovado |
| sayana | 30 | 600 | 0 | 0 | 0 | aprovado |
| yukteshwar | 30 | 600 | 0 | 0 | 0 | aprovado |
| raman | 30 | 600 | 0 | 0 | 0 | aprovado |
| bhasin | 30 | 600 | 0 | 0 | 0 | aprovado |
| fagan | 30 | 600 | 0 | 0 | 0 | aprovado |
| krishnamurti | 30 | 600 | 0 | 0 | 0 | aprovado |
| krishnamurtiNew | 30 | 600 | 0 | 0 | 0 | aprovado |
| trueChitra | 30 | 600 | 0 | 0 | 0 | aprovado |
| lahiri + 1° offset | 30 | 600 | 0 | 0 | 0 | aprovado |

## Maior diferença por ponto, em segundos de arco

| Conjunto | sun | moon | mars | mercury | jupiter | venus | saturn | rahu | ketu | uranus | neptune | pluto | dhuma | vyatipata | parivesha | indrachapa | upaketu | gulika | pranaPada | lagna |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lahiri | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.015 | 0.015 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.012 | 0.000 |
| sayana | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.006 | 0.000 | 0.000 |
| yukteshwar | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| raman | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| bhasin | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| fagan | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| krishnamurti | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| krishnamurtiNew | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |
| trueChitra | 0.048 | 0.049 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.046 | 0.046 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 | 0.048 |
| lahiri + 1° offset | 0.000 | 0.004 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.011 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.004 | 0.000 | 0.000 |

## Falhas

Nenhuma nos conjuntos verificados.

## Casos de borda

Nenhum.

## Maior diferença por década (Lahiri, todos os pontos), em segundos de arco

| Década | Maior diferença |
|---|---|
| 1800 | 0.013 |
| 1810 | 0.012 |
| 1820 | 0.012 |
| 1830 | 0.013 |
| 1840 | 0.012 |
| 1850 | 0.012 |
| 1860 | 0.010 |
| 1870 | 0.012 |
| 1880 | 0.013 |
| 1890 | 0.008 |
| 1900 | 0.015 |
| 1910 | 0.012 |
| 1920 | 0.008 |
| 1930 | 0.004 |
| 1940 | 0.012 |
| 1950 | 0.011 |
| 1960 | 0.012 |
| 1970 | 0.008 |
| 1980 | 0.014 |
| 1990 | 0.013 |
| 2000 | 0.011 |
| 2010 | 0.012 |
| 2020 | 0.012 |
| 2030 | 0.011 |
| 2040 | 0.012 |

## Casas, vargas e valores lidos das tabelas do PL9

Mapas com tabela: 72 de 380, mais 40 impressos com outras opções do PL9. Valores conferidos: 72486. Falhas: 0. Casos de borda: 0.

Opções alternativas: dos 40 mapas impressos com elas, 40 têm algum pada diferente entre Parashara e K.N.Rao, e 2 têm Rahu como AK com oito karakas — só nesses "Rahu too" muda o resultado.

Os valores vêm das telas do PL9 (etapa 2) e dos PDFs que ele imprime (etapa 2b), só com Lahiri. O signo e a varga D1 de um ponto são contados separadamente nesse total. As vargas são conferidas pelo signo do Lagna, dos nove grahas, de Mandi e do Bhrigu point. As casas entram pelo meio e pelo início de cada uma, que o PL9 mostra arredondados ao segundo. Mandi e Bhrigu point em graus só existem ao minuto, truncados; o Gulika pelos dois métodos, ao segundo, arredondado.

### Cobertura das vargas

Uma célula é uma parte de um signo. As regras foram lidas no executável; a cobertura diz em quantas células o resultado foi visto no PL9.

| Varga | Mapas | Valores | Células observadas | Células |
|---|---|---|---|---|
| D1 | 72 | 864 | 12 | 12 |
| D2 | 72 | 860 | 24 | 24 |
| D3 | 72 | 864 | 36 | 36 |
| D4 | 72 | 864 | 48 | 48 |
| D7 | 72 | 862 | 84 | 84 |
| D9 | 72 | 864 | 108 | 108 |
| D10 | 72 | 864 | 119 | 120 |
| D12 | 72 | 864 | 144 | 144 |
| D16 | 72 | 864 | 188 | 192 |
| D20 | 72 | 863 | 232 | 240 |
| D24 | 72 | 863 | 262 | 288 |
| D27 | 72 | 864 | 287 | 324 |
| D30 | 72 | 863 | 307 | 360 |
| D40 | 72 | 864 | 365 | 480 |
| D45 | 72 | 864 | 386 | 540 |
| D60 | 72 | 864 | 438 | 720 |
| D5 | 72 | 864 | 60 | 60 |
| D6 | 72 | 863 | 72 | 72 |
| D8 | 72 | 864 | 96 | 96 |
| D11 | 72 | 864 | 132 | 132 |
| D150 | 72 | 864 | 609 | 1800 |
| D2-parivritti | 72 | 864 | 24 | 24 |
| D2-samasaptaka | 72 | 864 | 24 | 24 |
| D3-parivritti | 72 | 864 | 36 | 36 |
| D4-parivritti | 72 | 864 | 48 | 48 |
| D10-parivritti | 72 | 864 | 119 | 120 |
| D12-parivritti | 72 | 863 | 144 | 144 |
| D30-parivritti | 72 | 864 | 307 | 360 |
| D5-parivritti | 72 | 864 | 60 | 60 |
| D16-iyer | 72 | 864 | 188 | 192 |
| D11-iyer | 72 | 864 | 132 | 132 |
| D108-nd | 72 | 805 | 533 | 1296 |
| D108-dn | 72 | 810 | 531 | 1296 |
| D2-kashinatha | 72 | 807 | 24 | 24 |
| D2-somanatha | 72 | 814 | 24 | 24 |
| D3-jagannatha | 72 | 809 | 36 | 36 |
| D3-somanatha | 72 | 811 | 36 | 36 |
| D4-vedamsha | 72 | 794 | 48 | 48 |
| D6-kaulaka | 72 | 796 | 72 | 72 |
| D9-pada | 72 | 809 | 108 | 108 |
| D9-nadi | 72 | 805 | 108 | 108 |
| D9-somanatha | 72 | 810 | 108 | 108 |
| D24-parasiddhamsha | 72 | 801 | 259 | 288 |
| D24-siddhamsha | 72 | 796 | 258 | 288 |
| D30-venkatesha | 72 | 814 | 302 | 360 |

## Dashas

Mapas com dashas: 71. Datas conferidas: 87083. Uma data mostrada só com o dia passa se o instante do core cai nesse dia, e fica "no limite" se cai a menos de 0.06 dia dele; uma data com hora passa se o instante cai no minuto mostrado (o PL9 trunca), e fica "no limite" se cai a menos de um minuto dele com o mesmo deslocamento em todas as datas com hora do mapa.

| Sistema | Mapas | Datas | Falhas | No limite |
|---|---|---|---|---|
| vimshottari | 71 | 17050 | 0 | 1275 |
| ashtottari | 71 | 5839 | 0 | 0 |
| yogini | 71 | 4719 | 0 | 0 |
| shodashottari | 71 | 6429 | 0 | 3 |
| dwadashottari | 71 | 6445 | 0 | 0 |
| panchottari | 71 | 5833 | 0 | 0 |
| shatabdika | 71 | 5807 | 0 | 0 |
| chaturshitisama | 71 | 5831 | 0 | 1 |
| dwisaptatisama | 71 | 6432 | 0 | 0 |
| shastihayani | 71 | 5367 | 0 | 0 |
| shattrimshatsama | 71 | 5371 | 0 | 0 |
| tribhagi | 71 | 5980 | 0 | 1 |
| tribhagi40 | 71 | 5980 | 0 | 0 |

| Alternativa | Mapas | Datas | Falhas | No limite |
|---|---|---|---|---|
| balance-time | 30 | 36908 | 0 | 600 |
| base-lagna | 30 | 450 | 0 | 0 |
| base-sun | 30 | 450 | 0 | 0 |
| varga-D9 | 30 | 450 | 0 | 0 |
| yearDays-327.85 | 30 | 36908 | 0 | 524 |
| yearDays-360 | 30 | 36908 | 0 | 718 |

## Kalachakra

| Conjunto | Mapas | Datas | Falhas | No limite | Cabeçalhos diferentes | Padas da Lua |
|---|---|---|---|---|---|---|
| opções do PL9 observadas | 135 | 140672 | 0 | 618 | 0 | 103 de 108 |

Os relatórios do Kalachakra só têm a data: cada início passa se o instante do core cai no dia mostrado, e fica "no limite" a menos de 0.06 dia dele. O cabeçalho é o Deha, o Jeeva e o signo da mahadasha em curso no nascimento.

## Dashas de signo

Mapas: 135. Datas só com o dia, com a mesma tolerância do Kalachakra. "Não conferidas": as datas da segunda volta do Narayana, do Lagna Kendradi e do Drig (o PL9 a dá embaralhada, e o modo pl9 do core só dá a primeira), e as dos sistemas ainda não medidos. "Exceção": as datas postas à parte abaixo.

| Sistema | Mapas | Datas | Falhas | No limite | Não conferidas | Exceção |
|---|---|---|---|---|---|---|
| chara | 135 | 63281 | 0 | 0 | 0 | 0 |
| sthira | 135 | 22098 | 0 | 0 | 0 | 0 |
| niryaanaShoola | 135 | 2025 | 0 | 0 | 0 | 0 |
| drig | 135 | 20943 | 0 | 0 | 1267 | 0 |
| navamsha | 135 | 42120 | 0 | 0 | 0 | 0 |
| narayana | 135 | 20904 | 0 | 0 | 1317 | 0 |
| lagnaKendradi | 135 | 20904 | 0 | 0 | 1317 | 0 |
| sreeLagnaKendradi (não medido) | 135 | 0 | 0 | 0 | 2025 | 0 |
| shoola | 135 | 21060 | 0 | 0 | 0 | 0 |
| padanadhamsa | 135 | 21060 | 0 | 0 | 0 | 0 |

Com outras opções da aba Dashas (todos os sistemas medidos do modelo de impressão, somados):

| Conjunto | Mapas | Datas | Falhas | No limite | Não conferidas | Exceção |
|---|---|---|---|---|---|---|
| antardashaStart-lord | 31 | 53903 | 0 | 0 | 1314 | 0 |
| charaAntarFromLord-true | 31 | 53903 | 0 | 0 | 1314 | 0 |
| charaMethod-parashara | 31 | 53892 | 0 | 0 | 1314 | 0 |
| charaMethod-parashara_charaAntarFromLord-true | 30 | 52146 | 0 | 0 | 1254 | 0 |
| mercuryExaltation-anywhere | 30 | 52155 | 0 | 0 | 1119 | 0 |
| padanadhamsaMethod-iranganti | 31 | 53903 | 0 | 0 | 1314 | 0 |
| rahuExaltation-gemini | 32 | 55573 | 0 | 0 | 1465 | 0 |

## Ashtakavarga

| Conjunto | Mapas | Valores | Falhas |
|---|---|---|---|
| opções do PL9 observadas | 135 | 147420 | 0 |
| ekadhipatya-other | 36 | 39312 | 0 |
| method-parashara | 30 | 32760 | 0 |
| virgoMultiplier-5 | 30 | 32760 | 0 |

Cada valor impresso — os oito quadros antes e depois de cada redução, os pindas, o Prastara e o Samudaya — igual ao do core, sem tolerância.

## Shadbala

| Mapas | Conferidos | Valores | Falhas | Rank pendente |
|---|---|---|---|---|
| 135 | 131 | 25676 | 0 | 44 |

Cada parte impressa a meio centésimo do core; mínimos e forças fortes iguais. A classificação ainda difere onde o PL9 troca planetas de razões muito próximas (docs/spec/forcas/shadbala.md).

Fora das séries do Cheshta do PL9, não conferidos: ref-0002, ref-0019, ref-0243, ref-0250.

| Opção | Mapas | Valores | Falhas | Rank pendente |
|---|---|---|---|---|
| digBala-kendras | 31 | 6076 | 0 | 2 |
| drekkana-horaRatnam | 30 | 5880 | 0 | 7 |
| jupiterMercuryDrik-quarter | 30 | 5880 | 0 | 6 |
| mercuryDrik-benefic | 30 | 5880 | 0 | 2 |
| mercuryPaksha-benefic | 33 | 6468 | 0 | 4 |

Memória do PL9: 11 mapas, 1694 valores, cada um a um décimo de milésimo do core.

| Mapa | Rank pendente |
|---|---|
| ref-0004 | rank sun: PL9 6, core 5 |
| ref-0004 | rank mercury: PL9 5, core 6 |
| ref-0018 | rank sun: PL9 7, core 6 |
| ref-0018 | rank mercury: PL9 6, core 7 |
| ref-0073 | rank sun: PL9 4, core 5 |
| ref-0073 | rank saturn: PL9 5, core 4 |
| ref-0077 | rank jupiter: PL9 6, core 7 |
| ref-0077 | rank saturn: PL9 7, core 6 |
| ref-0079 | rank moon: PL9 6, core 7 |
| ref-0079 | rank mercury: PL9 7, core 6 |
| ref-0096 | rank sun: PL9 3, core 4 |
| ref-0096 | rank venus: PL9 4, core 3 |
| ref-0099 | rank sun: PL9 5, core 6 |
| ref-0099 | rank mercury: PL9 6, core 5 |
| ref-0122 | rank moon: PL9 1, core 2 |
| ref-0122 | rank saturn: PL9 2, core 1 |
| ref-0126 | rank mars: PL9 6, core 5 |
| ref-0126 | rank jupiter: PL9 5, core 6 |
| ref-0140 | rank sun: PL9 4, core 3 |
| ref-0140 | rank mercury: PL9 3, core 4 |
| ref-0143 | rank moon: PL9 5, core 6 |
| ref-0143 | rank saturn: PL9 6, core 5 |
| ref-0209 | rank sun: PL9 5, core 4 |
| ref-0209 | rank jupiter: PL9 4, core 5 |
| ref-0223 | rank mars: PL9 1, core 2 |
| ref-0223 | rank saturn: PL9 2, core 1 |
| ref-0225 | rank venus: PL9 2, core 3 |
| ref-0225 | rank saturn: PL9 3, core 2 |
| ref-0254 | rank mercury: PL9 6, core 7 |
| ref-0254 | rank saturn: PL9 7, core 6 |
| ref-0261 | rank moon: PL9 1, core 2 |
| ref-0261 | rank jupiter: PL9 7, core 6 |
| ref-0261 | rank venus: PL9 6, core 7 |
| ref-0261 | rank saturn: PL9 2, core 1 |
| ref-0276 | rank moon: PL9 6, core 7 |
| ref-0276 | rank mercury: PL9 7, core 6 |
| ref-0277 | rank sun: PL9 5, core 4 |
| ref-0277 | rank jupiter: PL9 4, core 5 |
| ref-0280 | rank sun: PL9 4, core 5 |
| ref-0280 | rank mars: PL9 2, core 3 |
| ref-0280 | rank venus: PL9 3, core 2 |
| ref-0280 | rank saturn: PL9 5, core 4 |
| ref-0291 | rank mercury: PL9 3, core 4 |
| ref-0291 | rank saturn: PL9 4, core 3 |

## Bhava Bala

| Conjunto | Mapas | Valores | Falhas |
|---|---|---|---|
| opções padrão | 131 | 14148 | 0 |
| digBala-kendras | 31 | 3348 | 0 |
| drekkana-horaRatnam | 30 | 3240 | 0 |
| jupiterMercuryDrik-quarter | 30 | 3240 | 0 |
| mercuryDrik-benefic | 30 | 3240 | 0 |
| mercuryPaksha-benefic | 33 | 3564 | 0 |

Memória do PL9: 72 valores, cada um a um décimo de milésimo do core. As partes como o PL9 as imprime, truncadas; o total e os rupas arredondados.

Fora das séries do Cheshta do PL9, não conferidos: ref-0002, ref-0019, ref-0243, ref-0250.

## Vimshopaka

| Mapas | Valores | Falhas |
|---|---|---|
| 135 | 24300 | 0 |

Os quatro grupos de cada um dos nove planetas, arredondados (um meio exato aceito para os dois lados), e as 144 dignidades nas vargas, exatas.

## Trânsitos

| Mapas × datas | Valores | Falhas | Casos de fronteira | Pendentes |
|---|---|---|---|---|
| 270 | 327066 | 0 | 9 | 532 |

Por mapa e data de referência: as posições, marcas R, kakshas, Shadbala, Tarabala, Chandrabala e os dashas Vimshottari, Narayana, Yogini e Ashtottari no instante de referência (a página do Muhurta) e no instante impresso nas páginas de trânsito, com os senhores KP dos dez pontos neste; o mapa do nascer do sol do nascimento e as 15 linhas do seu Vimshottari; os quatro dashas (com o Chara) dos dois eventos da página Events; as tabelas da D9 e da D10 do trânsito (sem a natureza funcional dos nós); o Varshaphala do ano do relógio (worksheets 64 a 66 e 74: retorno, tabela do mapa anual, kakshas, forças, ofícios, Muntha e os Sahams natais e anuais; as 12 listas de dashas de 64, 65, 75, 81 e 89 e os retornos mensal e diário, docs/spec/tempo/varshaphala.md); os eventos do calendário do mês (worksheet 104); as posições do Kota Chakra (sem a pontuação); o SB# e o VB da tabela do trânsito (worksheet 106; o VB dos nós pendente onde difere); o Panch Pakshi (worksheet 39: o pássaro, a quinzena, os pássaros que regem e que morrem, os dez yamas com as cinco partes, as horas a dois segundos); as entradas em signos do ano e o calendário de kakshas do mês. E 17 consultas de "Time of transits" no REF 0010, ao segundo.

| Mapa | Caso de fronteira |
|---|---|
| ref-0037 2000 | daily days: PL9 10, core 9 at the clock, 10 a minute later |
| ref-0233 2000 | kalidasa4: the list starts one row off |
| ref-0260 2000 | kalidasa4: the list starts one row off |
| ref-0290 2000 | mudda: the list starts one row off |
| ref-0014 2030 | monthly: the list starts one row off |
| ref-0097 2030 | kalidasa: the list starts one row off |
| ref-0097 2030 | kalidasa4: the list starts one row off |
| ref-0097 2030 | kalidasa@89: the list starts one row off |
| ref-0170 2030 | sb mars: PL9 1.43, core 1.6263 (igual ao core 30 s antes ou depois) |

| Mapa | Pendente |
|---|---|
| ref-0001 2000 | planet rahu vb: PL9 13,1, core 12.15 |
| ref-0001 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0002 2000 | planet rahu vb: PL9 17,4, core 13.3 |
| ref-0002 2000 | planet ketu vb: PL9 9, core 7.5 |
| ref-0002 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0003 2000 | saham natal Karyasiddhi: PL9 Libra 28:12:19, core 238.20541226182962 |
| ref-0003 2000 | saham natal Karyasiddhi lord: PL9 venus, core mars |
| ref-0003 2000 | patyayini row 2: PL9 saturn-lagna-sun Thu 12-11-2026, core saturn-lagna-saturn 12-11-2026 |
| ref-0003 2000 | patyayini row 3: PL9 saturn-lagna-saturn Thu 12-11-2026, core saturn-lagna-mercury 12-11-2026 |
| ref-0003 2000 | patyayini row 4: PL9 saturn-lagna-mercury Thu 12-11-2026, core saturn-jupiter-jupiter 12-11-2026 |
| ref-0003 2000 | patyayini row 5: PL9 saturn-jupiter-jupiter Thu 12-11-2026, core saturn-jupiter-sun 12-11-2026 |
| ref-0003 2000 | patyayini row 6: PL9 saturn-jupiter-sun Thu 12-11-2026, core saturn-jupiter-venus 13-11-2026 |
| ref-0003 2000 | patyayini row 7: PL9 saturn-jupiter-venus Fri 13-11-2026, core saturn-jupiter-moon 13-11-2026 |
| ref-0003 2000 | patyayini row 8: PL9 saturn-jupiter-moon Fri 13-11-2026, core saturn-jupiter-mars 13-11-2026 |
| ref-0003 2000 | patyayini row 9: PL9 saturn-jupiter-mars Fri 13-11-2026, core saturn-jupiter-saturn 13-11-2026 |
| ref-0003 2000 | patyayini row 10: PL9 saturn-jupiter-saturn Fri 13-11-2026, core saturn-jupiter-mercury 18-11-2026 |
| ref-0003 2000 | patyayini row 11: PL9 saturn-jupiter-mercury Wed 18-11-2026, core saturn-sun-sun 21-11-2026 |
| ref-0003 2000 | patyayini row 12: PL9 saturn-sun-sun Sat 21-11-2026, core saturn-sun-venus 21-11-2026 |
| ref-0003 2000 | patyayini row 13: PL9 saturn-sun-venus Sat 21-11-2026, core saturn-sun-moon 21-11-2026 |
| ref-0003 2000 | patyayini row 14: PL9 saturn-sun-moon Sat 21-11-2026, core saturn-sun-mars 21-11-2026 |
| ref-0003 2000 | patyayini row 15: PL9 saturn-sun-mars Sat 21-11-2026, core saturn-sun-saturn 21-11-2026 |
| ref-0003 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0004 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0005 2000 | planet rahu vb: PL9 14,1, core 12.65 |
| ref-0005 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0006 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0008 2000 | planet rahu vb: PL9 13,2, core 12 |
| ref-0008 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0009 2000 | planet rahu vb: PL9 18,4, core 15.4 |
| ref-0009 2000 | planet ketu vb: PL9 9, core 7.5 |
| ref-0009 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0010 2000 | planet rahu vb: PL9 18,5, core 15.9 |
| ref-0010 2000 | planet ketu vb: PL9 14, core 11.75 |
| ref-0010 2000 | patyayini row 15: PL9 mars-mars-sun Fri 30-10-2026, core mars-venus-venus 30-10-2026 |
| ref-0010 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0011 2000 | planet rahu vb: PL9 16,5, core 14.4 |
| ref-0011 2000 | planet ketu vb: PL9 12, core 11 |
| ref-0011 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0012 2000 | planet rahu vb: PL9 18,5, core 13.8 |
| ref-0012 2000 | planet ketu vb: PL9 9, core 7.5 |
| ref-0012 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0013 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0014 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0015 2000 | planet rahu vb: PL9 16,4, core 14.4 |
| ref-0015 2000 | planet ketu vb: PL9 12, core 11 |
| ref-0015 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0016 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0017 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0018 2000 | planet rahu vb: PL9 13,4, core 12 |
| ref-0018 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0019 2000 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0019 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0020 2000 | saham natal Karyasiddhi: PL9 Virgo 11:26:09, core 191.43588859877923 |
| ref-0020 2000 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0020 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0022 2000 | planet rahu vb: PL9 17,2, core 14.9 |
| ref-0022 2000 | planet ketu vb: PL9 11, core 8.75 |
| ref-0022 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0025 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0027 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0028 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0029 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0030 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0031 2000 | planet rahu vb: PL9 13,3, core 12 |
| ref-0031 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0035 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0037 2000 | planet rahu vb: PL9 16,3, core 14.4 |
| ref-0037 2000 | planet ketu vb: PL9 12, core 11 |
| ref-0037 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0038 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0039 2000 | saham annual Mahatmya: PL9 Aries 09:56:31, core 9.948686515216878 |
| ref-0039 2000 | saham annual Paradesa: PL9 Aquarius 18:38:16, core 318.64500825420095 |
| ref-0039 2000 | saham annual Artha: PL9 Virgo 15:55:56, core 165.9392581005307 |
| ref-0039 2000 | saham annual Bandhana: PL9 Gemini 01:14:54, core 61.255141948711014 |
| ref-0039 2000 | saham annual Apamrityu: PL9 Aquarius 24:37:33, core 324.6328026670365 |
| ref-0039 2000 | saham annual Labha: PL9 Pisces 06:37:28, core 336.6315462830279 |
| ref-0039 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0040 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0041 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0042 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0043 2000 | planet rahu vb: PL9 16,5, core 14.65 |
| ref-0043 2000 | planet ketu vb: PL9 17, core 13.15 |
| ref-0043 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0044 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0050 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0051 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0056 2000 | saham annual Mahatmya: PL9 Aries 18:14:06, core 18.225817617427765 |
| ref-0056 2000 | saham annual Paradesa: PL9 Aries 03:21:15, core 3.3451248573030625 |
| ref-0056 2000 | saham annual Artha: PL9 Virgo 20:37:31, core 170.6163051215031 |
| ref-0056 2000 | saham annual Bandhana: PL9 Gemini 06:18:29, core 66.2986181653927 |
| ref-0056 2000 | saham annual Apamrityu: PL9 Aries 28:31:27, core 28.515117797726248 |
| ref-0056 2000 | saham annual Labha: PL9 Gemini 12:21:34, core 72.35056755162562 |
| ref-0056 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0058 2000 | planet rahu vb: PL9 17,4, core 16 |
| ref-0058 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0060 2000 | planet rahu vb: PL9 14,1, core 12.65 |
| ref-0060 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0061 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0063 2000 | planet rahu vb: PL9 18,6, core 15.9 |
| ref-0063 2000 | planet ketu vb: PL9 14, core 11.75 |
| ref-0063 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0065 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0067 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0069 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0070 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0073 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0075 2000 | saham natal Karyasiddhi: PL9 Virgo 14:50:54, core 194.84824057875295 |
| ref-0075 2000 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0075 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0076 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0077 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0088 2000 | planet rahu vb: PL9 14,2, core 12.65 |
| ref-0090 2000 | saham natal Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2000 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0090 2000 | saham annual Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2000 | saham annual Karyasiddhi lord: PL9 mercury, core venus |
| ref-0090 2000 | patyayini row 13: PL9 lagna-saturn-sun Tue 28-01-2031, core lagna-saturn-jupiter 28-01-2031 |
| ref-0090 2000 | patyayini row 14: PL9 lagna-saturn-jupiter Tue 28-01-2031, core lagna-saturn-venus 28-01-2031 |
| ref-0090 2000 | patyayini row 15: PL9 lagna-saturn-venus Tue 28-01-2031, core lagna-mars-mars 28-01-2031 |
| ref-0091 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0095 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0096 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0097 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0098 2000 | planet rahu vb: PL9 18,4, core 13.8 |
| ref-0098 2000 | planet ketu vb: PL9 9, core 7.5 |
| ref-0098 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0099 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0103 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0109 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0122 2000 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0122 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0124 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0126 2000 | planet rahu vb: PL9 13,2, core 12.15 |
| ref-0126 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0127 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0129 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0131 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0140 2000 | saham natal Karyasiddhi: PL9 Cancer 08:00:06, core 128.00170372728007 |
| ref-0140 2000 | saham natal Karyasiddhi lord: PL9 moon, core sun |
| ref-0140 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0143 2000 | planet rahu vb: PL9 16,4, core 14.4 |
| ref-0143 2000 | planet ketu vb: PL9 12, core 11 |
| ref-0143 2000 | saham annual Mahatmya: PL9 Taurus 26:54:46, core 56.921778580819876 |
| ref-0143 2000 | saham annual Paradesa: PL9 Aquarius 17:48:20, core 317.8136316279435 |
| ref-0143 2000 | saham annual Artha: PL9 Aries 15:58:00, core 15.975116817152696 |
| ref-0143 2000 | saham annual Bandhana: PL9 Cancer 02:02:08, core 92.04450103311933 |
| ref-0143 2000 | saham annual Apamrityu: PL9 Capricorn 24:01:35, core 294.0349622169754 |
| ref-0143 2000 | saham annual Labha: PL9 Aquarius 17:08:55, core 317.15682338193085 |
| ref-0143 2000 | patyayini row 5: PL9 lagna-moon-lagna Mon 19-10-2026, core lagna-moon-lagna 20-10-2026 |
| ref-0143 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0151 2000 | planet rahu vb: PL9 18,5, core 15.9 |
| ref-0151 2000 | planet ketu vb: PL9 10, core 8.5 |
| ref-0151 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0156 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0157 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0161 2000 | planet ketu vb: PL9 15, core 8.65 |
| ref-0161 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0165 2000 | planet rahu vb: PL9 13,2, core 11.15 |
| ref-0165 2000 | planet ketu vb: PL9 12, core 8 |
| ref-0165 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0169 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0170 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0173 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0176 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0177 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0182 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0183 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0186 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0188 2000 | planet rahu vb: PL9 17,3, core 11.35 |
| ref-0188 2000 | planet ketu vb: PL9 15, core 13 |
| ref-0188 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0191 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0208 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0209 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0212 2000 | planet rahu vb: PL9 9,6, core 7.85 |
| ref-0212 2000 | planet ketu vb: PL9 15, core 13.15 |
| ref-0212 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0223 2000 | planet ketu vb: PL9 12, core 8.85 |
| ref-0223 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0225 2000 | planet ketu vb: PL9 9, core 6.1 |
| ref-0225 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0233 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0236 2000 | planet rahu vb: PL9 11,5, core 8.5 |
| ref-0236 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0243 2000 | planet rahu vb: PL9 18,3, core 15.4 |
| ref-0243 2000 | planet ketu vb: PL9 9, core 7.5 |
| ref-0243 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0246 2000 | saham natal Karyasiddhi: PL9 Leo 15:32:10, core 165.5361261770007 |
| ref-0246 2000 | saham natal Karyasiddhi lord: PL9 sun, core mercury |
| ref-0246 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0250 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0254 2000 | saham annual Mahatmya: PL9 Aquarius 14:31:20, core 314.5275233551084 |
| ref-0254 2000 | saham annual Paradesa: PL9 Taurus 08:20:10, core 38.34235719855732 |
| ref-0254 2000 | saham annual Artha: PL9 Aries 19:58:22, core 19.97837319064297 |
| ref-0254 2000 | saham annual Bandhana: PL9 Aries 05:30:43, core 5.517064503237663 |
| ref-0254 2000 | saham annual Apamrityu: PL9 Capricorn 15:54:48, core 285.91893212768855 |
| ref-0254 2000 | saham annual Labha: PL9 Pisces 10:45:12, core 340.7596218604844 |
| ref-0254 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0258 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0259 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0260 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0261 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0262 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0263 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0264 2000 | saham annual Paradesa: PL9 Pisces 20:46:06, core 350.7742033201496 |
| ref-0264 2000 | saham annual Artha: PL9 Taurus 01:47:56, core 31.804558935260225 |
| ref-0264 2000 | saham annual Labha: PL9 Pisces 03:53:43, core 333.9012384046989 |
| ref-0264 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0265 2000 | planet rahu vb: PL9 13,2, core 12.15 |
| ref-0265 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0266 2000 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0266 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0267 2000 | patyayini row 10: PL9 moon-mars-venus Wed 28-10-2026, core moon-saturn-venus 28-10-2026 |
| ref-0267 2000 | patyayini row 11: PL9 moon-saturn-sun Wed 28-10-2026, core moon-mercury-sun 28-10-2026 |
| ref-0267 2000 | patyayini row 12: PL9 moon-saturn-venus Wed 28-10-2026, core moon-mercury-venus 28-10-2026 |
| ref-0267 2000 | patyayini row 13: PL9 moon-mercury-sun Wed 28-10-2026, core moon-sun-sun 28-10-2026 |
| ref-0267 2000 | patyayini row 14: PL9 moon-mercury-venus Wed 28-10-2026, core moon-sun-venus 28-10-2026 |
| ref-0267 2000 | patyayini row 15: PL9 moon-sun-sun Wed 28-10-2026, core moon-sun-mercury 28-10-2026 |
| ref-0267 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0268 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0269 2000 | planet rahu vb: PL9 14,2, core 12.65 |
| ref-0269 2000 | patyayini row 5: PL9 mars-mars-sun Tue 27-10-2026, core mars-jupiter-sun 27-10-2026 |
| ref-0269 2000 | patyayini row 6: PL9 mars-mars-venus Tue 27-10-2026, core mars-jupiter-moon 27-10-2026 |
| ref-0269 2000 | patyayini row 7: PL9 mars-jupiter-lagna Tue 27-10-2026, core mars-jupiter-venus 27-10-2026 |
| ref-0269 2000 | patyayini row 8: PL9 mars-jupiter-sun Tue 27-10-2026, core mars-saturn-saturn 27-10-2026 |
| ref-0269 2000 | patyayini row 9: PL9 mars-jupiter-moon Tue 27-10-2026, core mars-saturn-lagna 27-10-2026 |
| ref-0269 2000 | patyayini row 10: PL9 mars-jupiter-venus Tue 27-10-2026, core mars-saturn-mercury 27-10-2026 |
| ref-0269 2000 | patyayini row 11: PL9 mars-saturn-saturn Tue 27-10-2026, core mars-saturn-sun 27-10-2026 |
| ref-0269 2000 | patyayini row 12: PL9 mars-saturn-lagna Tue 27-10-2026, core mars-saturn-moon 27-10-2026 |
| ref-0269 2000 | patyayini row 13: PL9 mars-saturn-mercury Tue 27-10-2026, core mars-saturn-venus 27-10-2026 |
| ref-0269 2000 | patyayini row 14: PL9 mars-saturn-sun Tue 27-10-2026, core mars-lagna-lagna 28-10-2026 |
| ref-0269 2000 | patyayini row 15: PL9 mars-saturn-moon Tue 27-10-2026, core mars-lagna-mercury 28-10-2026 |
| ref-0269 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0270 2000 | planet rahu vb: PL9 14,3, core 12.65 |
| ref-0270 2000 | patyayini row 8: PL9 mars-mars-moon Tue 27-10-2026, core mars-jupiter-sun 27-10-2026 |
| ref-0270 2000 | patyayini row 9: PL9 mars-jupiter-jupiter Tue 27-10-2026, core mars-jupiter-moon 27-10-2026 |
| ref-0270 2000 | patyayini row 10: PL9 mars-jupiter-sun Tue 27-10-2026, core mars-jupiter-venus 27-10-2026 |
| ref-0270 2000 | patyayini row 11: PL9 mars-jupiter-moon Tue 27-10-2026, core mars-jupiter-lagna 27-10-2026 |
| ref-0270 2000 | patyayini row 12: PL9 mars-jupiter-venus Tue 27-10-2026, core mars-saturn-mercury 27-10-2026 |
| ref-0270 2000 | patyayini row 13: PL9 mars-jupiter-lagna Tue 27-10-2026, core mars-saturn-sun 27-10-2026 |
| ref-0270 2000 | patyayini row 14: PL9 mars-saturn-saturn Tue 27-10-2026, core mars-saturn-moon 27-10-2026 |
| ref-0270 2000 | patyayini row 15: PL9 mars-saturn-mercury Tue 27-10-2026, core mars-saturn-venus 27-10-2026 |
| ref-0270 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0271 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0272 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0273 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0274 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0275 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0276 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0277 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0278 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0279 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0280 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0281 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0282 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0283 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0284 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0285 2000 | planet rahu vb: PL9 15,5, core 13.4 |
| ref-0285 2000 | planet ketu vb: PL9 10, core 8.5 |
| ref-0285 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0286 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0287 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0288 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0289 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0290 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0291 2000 | patyayini row 15: PL9 venus-jupiter-saturn Tue 03-11-2026, core venus-jupiter-mars 03-11-2026 |
| ref-0291 2000 | vb rahu: PL9 13, core 12.00 |
| ref-0352 2000 | planet rahu vb: PL9 15,3, core 13.9 |
| ref-0352 2000 | planet ketu vb: PL9 12, core 11 |
| ref-0352 2000 | saham annual Yasa: PL9 Aquarius 16:32:36, core 316.54909772621954 |
| ref-0352 2000 | saham annual Paradesa: PL9 Pisces 15:50:50, core 345.85360502099877 |
| ref-0352 2000 | saham annual Artha: PL9 Taurus 02:19:26, core 32.33007724029195 |
| ref-0352 2000 | saham annual Labha: PL9 Pisces 01:37:56, core 331.6385616988248 |
| ref-0001 2030 | planet rahu vb: PL9 13,1, core 12.15 |
| ref-0001 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0002 2030 | planet rahu vb: PL9 17,4, core 13.3 |
| ref-0002 2030 | planet ketu vb: PL9 9, core 7.5 |
| ref-0002 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0003 2030 | saham natal Karyasiddhi: PL9 Libra 28:12:19, core 238.20541226182962 |
| ref-0003 2030 | saham natal Karyasiddhi lord: PL9 venus, core mars |
| ref-0003 2030 | patyayini row 2: PL9 saturn-lagna-sun Thu 12-11-2026, core saturn-lagna-saturn 12-11-2026 |
| ref-0003 2030 | patyayini row 3: PL9 saturn-lagna-saturn Thu 12-11-2026, core saturn-lagna-mercury 12-11-2026 |
| ref-0003 2030 | patyayini row 4: PL9 saturn-lagna-mercury Thu 12-11-2026, core saturn-jupiter-jupiter 12-11-2026 |
| ref-0003 2030 | patyayini row 5: PL9 saturn-jupiter-jupiter Thu 12-11-2026, core saturn-jupiter-sun 12-11-2026 |
| ref-0003 2030 | patyayini row 6: PL9 saturn-jupiter-sun Thu 12-11-2026, core saturn-jupiter-venus 13-11-2026 |
| ref-0003 2030 | patyayini row 7: PL9 saturn-jupiter-venus Fri 13-11-2026, core saturn-jupiter-moon 13-11-2026 |
| ref-0003 2030 | patyayini row 8: PL9 saturn-jupiter-moon Fri 13-11-2026, core saturn-jupiter-mars 13-11-2026 |
| ref-0003 2030 | patyayini row 9: PL9 saturn-jupiter-mars Fri 13-11-2026, core saturn-jupiter-saturn 13-11-2026 |
| ref-0003 2030 | patyayini row 10: PL9 saturn-jupiter-saturn Fri 13-11-2026, core saturn-jupiter-mercury 18-11-2026 |
| ref-0003 2030 | patyayini row 11: PL9 saturn-jupiter-mercury Wed 18-11-2026, core saturn-sun-sun 21-11-2026 |
| ref-0003 2030 | patyayini row 12: PL9 saturn-sun-sun Sat 21-11-2026, core saturn-sun-venus 21-11-2026 |
| ref-0003 2030 | patyayini row 13: PL9 saturn-sun-venus Sat 21-11-2026, core saturn-sun-moon 21-11-2026 |
| ref-0003 2030 | patyayini row 14: PL9 saturn-sun-moon Sat 21-11-2026, core saturn-sun-mars 21-11-2026 |
| ref-0003 2030 | patyayini row 15: PL9 saturn-sun-mars Sat 21-11-2026, core saturn-sun-saturn 21-11-2026 |
| ref-0005 2030 | planet rahu vb: PL9 14,1, core 12.65 |
| ref-0008 2030 | planet rahu vb: PL9 13,2, core 12 |
| ref-0008 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0009 2030 | planet rahu vb: PL9 18,4, core 15.4 |
| ref-0009 2030 | planet ketu vb: PL9 9, core 7.5 |
| ref-0009 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0010 2030 | planet rahu vb: PL9 18,5, core 15.9 |
| ref-0010 2030 | planet ketu vb: PL9 14, core 11.75 |
| ref-0010 2030 | patyayini row 15: PL9 mars-mars-sun Fri 30-10-2026, core mars-venus-venus 30-10-2026 |
| ref-0010 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0011 2030 | planet rahu vb: PL9 16,5, core 14.4 |
| ref-0011 2030 | planet ketu vb: PL9 12, core 11 |
| ref-0011 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0012 2030 | planet rahu vb: PL9 18,5, core 13.8 |
| ref-0012 2030 | planet ketu vb: PL9 9, core 7.5 |
| ref-0012 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0013 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0014 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0015 2030 | planet rahu vb: PL9 16,4, core 14.4 |
| ref-0015 2030 | planet ketu vb: PL9 12, core 11 |
| ref-0015 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0016 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0017 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0018 2030 | planet rahu vb: PL9 13,4, core 12 |
| ref-0018 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0019 2030 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0019 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0020 2030 | saham natal Karyasiddhi: PL9 Virgo 11:26:09, core 191.43588859877923 |
| ref-0020 2030 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0020 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0022 2030 | planet rahu vb: PL9 17,2, core 14.9 |
| ref-0022 2030 | planet ketu vb: PL9 11, core 8.75 |
| ref-0022 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0025 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0027 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0028 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0029 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0030 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0031 2030 | planet rahu vb: PL9 13,3, core 12 |
| ref-0031 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0035 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0037 2030 | planet rahu vb: PL9 16,3, core 14.4 |
| ref-0037 2030 | planet ketu vb: PL9 12, core 11 |
| ref-0037 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0038 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0039 2030 | saham annual Mahatmya: PL9 Aries 09:56:31, core 9.948686515216878 |
| ref-0039 2030 | saham annual Paradesa: PL9 Aquarius 18:38:16, core 318.64500825420095 |
| ref-0039 2030 | saham annual Artha: PL9 Virgo 15:55:56, core 165.9392581005307 |
| ref-0039 2030 | saham annual Bandhana: PL9 Gemini 01:14:54, core 61.255141948711014 |
| ref-0039 2030 | saham annual Apamrityu: PL9 Aquarius 24:37:33, core 324.6328026670365 |
| ref-0039 2030 | saham annual Labha: PL9 Pisces 06:37:28, core 336.6315462830279 |
| ref-0039 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0040 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0041 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0042 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0043 2030 | planet rahu vb: PL9 16,5, core 14.65 |
| ref-0043 2030 | planet ketu vb: PL9 17, core 13.15 |
| ref-0043 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0044 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0050 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0051 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0056 2030 | saham annual Mahatmya: PL9 Aries 18:14:06, core 18.225817617427765 |
| ref-0056 2030 | saham annual Paradesa: PL9 Aries 03:21:15, core 3.3451248573030625 |
| ref-0056 2030 | saham annual Artha: PL9 Virgo 20:37:31, core 170.6163051215031 |
| ref-0056 2030 | saham annual Bandhana: PL9 Gemini 06:18:29, core 66.2986181653927 |
| ref-0056 2030 | saham annual Apamrityu: PL9 Aries 28:31:27, core 28.515117797726248 |
| ref-0056 2030 | saham annual Labha: PL9 Gemini 12:21:34, core 72.35056755162562 |
| ref-0056 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0058 2030 | planet rahu vb: PL9 17,4, core 16 |
| ref-0058 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0060 2030 | planet rahu vb: PL9 14,1, core 12.65 |
| ref-0060 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0061 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0063 2030 | planet rahu vb: PL9 18,6, core 15.9 |
| ref-0063 2030 | planet ketu vb: PL9 14, core 11.75 |
| ref-0063 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0065 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0067 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0069 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0070 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0073 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0075 2030 | saham natal Karyasiddhi: PL9 Virgo 14:50:54, core 194.84824057875295 |
| ref-0075 2030 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0075 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0076 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0077 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0079 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0082 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0083 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0088 2030 | planet rahu vb: PL9 14,2, core 12.65 |
| ref-0088 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0090 2030 | saham natal Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2030 | saham natal Karyasiddhi lord: PL9 mercury, core venus |
| ref-0090 2030 | saham annual Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2030 | saham annual Karyasiddhi lord: PL9 mercury, core venus |
| ref-0090 2030 | patyayini row 13: PL9 lagna-saturn-sun Tue 28-01-2031, core lagna-saturn-jupiter 28-01-2031 |
| ref-0090 2030 | patyayini row 14: PL9 lagna-saturn-jupiter Tue 28-01-2031, core lagna-saturn-venus 28-01-2031 |
| ref-0090 2030 | patyayini row 15: PL9 lagna-saturn-venus Tue 28-01-2031, core lagna-mars-mars 28-01-2031 |
| ref-0090 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0091 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0095 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0096 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0097 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0098 2030 | planet rahu vb: PL9 18,4, core 13.8 |
| ref-0098 2030 | planet ketu vb: PL9 9, core 7.5 |
| ref-0098 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0099 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0103 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0109 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0122 2030 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0122 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0124 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0126 2030 | planet rahu vb: PL9 13,2, core 12.15 |
| ref-0126 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0127 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0129 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0131 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0140 2030 | saham natal Karyasiddhi: PL9 Cancer 08:00:06, core 128.00170372728007 |
| ref-0140 2030 | saham natal Karyasiddhi lord: PL9 moon, core sun |
| ref-0140 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0143 2030 | planet rahu vb: PL9 16,4, core 14.4 |
| ref-0143 2030 | planet ketu vb: PL9 12, core 11 |
| ref-0143 2030 | saham annual Mahatmya: PL9 Taurus 26:54:46, core 56.921778580819876 |
| ref-0143 2030 | saham annual Paradesa: PL9 Aquarius 17:48:20, core 317.8136316279435 |
| ref-0143 2030 | saham annual Artha: PL9 Aries 15:58:00, core 15.975116817152696 |
| ref-0143 2030 | saham annual Bandhana: PL9 Cancer 02:02:08, core 92.04450103311933 |
| ref-0143 2030 | saham annual Apamrityu: PL9 Capricorn 24:01:35, core 294.0349622169754 |
| ref-0143 2030 | saham annual Labha: PL9 Aquarius 17:08:55, core 317.15682338193085 |
| ref-0143 2030 | patyayini row 5: PL9 lagna-moon-lagna Mon 19-10-2026, core lagna-moon-lagna 20-10-2026 |
| ref-0143 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0151 2030 | planet rahu vb: PL9 18,5, core 15.9 |
| ref-0151 2030 | planet ketu vb: PL9 10, core 8.5 |
| ref-0151 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0156 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0157 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0161 2030 | planet ketu vb: PL9 15, core 8.65 |
| ref-0161 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0165 2030 | planet rahu vb: PL9 13,2, core 11.15 |
| ref-0165 2030 | planet ketu vb: PL9 12, core 8 |
| ref-0165 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0169 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0170 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0173 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0176 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0177 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0182 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0183 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0186 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0188 2030 | planet rahu vb: PL9 17,3, core 11.35 |
| ref-0188 2030 | planet ketu vb: PL9 15, core 13 |
| ref-0188 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0191 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0208 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0212 2030 | planet rahu vb: PL9 9,6, core 7.85 |
| ref-0212 2030 | planet ketu vb: PL9 15, core 13.15 |
| ref-0223 2030 | planet ketu vb: PL9 12, core 8.85 |
| ref-0225 2030 | planet ketu vb: PL9 9, core 6.1 |
| ref-0236 2030 | planet rahu vb: PL9 11,5, core 8.5 |
| ref-0243 2030 | planet rahu vb: PL9 18,3, core 15.4 |
| ref-0243 2030 | planet ketu vb: PL9 9, core 7.5 |
| ref-0243 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0246 2030 | saham natal Karyasiddhi: PL9 Leo 15:32:10, core 165.5361261770007 |
| ref-0246 2030 | saham natal Karyasiddhi lord: PL9 sun, core mercury |
| ref-0246 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0250 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0254 2030 | saham annual Mahatmya: PL9 Aquarius 14:31:20, core 314.5275233551084 |
| ref-0254 2030 | saham annual Paradesa: PL9 Taurus 08:20:10, core 38.34235719855732 |
| ref-0254 2030 | saham annual Artha: PL9 Aries 19:58:22, core 19.97837319064297 |
| ref-0254 2030 | saham annual Bandhana: PL9 Aries 05:30:43, core 5.517064503237663 |
| ref-0254 2030 | saham annual Apamrityu: PL9 Capricorn 15:54:48, core 285.91893212768855 |
| ref-0254 2030 | saham annual Labha: PL9 Pisces 10:45:12, core 340.7596218604844 |
| ref-0254 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0258 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0259 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0260 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0261 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0262 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0263 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0264 2030 | saham annual Paradesa: PL9 Pisces 20:46:06, core 350.7742033201496 |
| ref-0264 2030 | saham annual Artha: PL9 Taurus 01:47:56, core 31.804558935260225 |
| ref-0264 2030 | saham annual Labha: PL9 Pisces 03:53:43, core 333.9012384046989 |
| ref-0264 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0265 2030 | planet rahu vb: PL9 13,2, core 12.15 |
| ref-0265 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0266 2030 | planet rahu vb: PL9 13,3, core 12.15 |
| ref-0266 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0267 2030 | patyayini row 10: PL9 moon-mars-venus Wed 28-10-2026, core moon-saturn-venus 28-10-2026 |
| ref-0267 2030 | patyayini row 11: PL9 moon-saturn-sun Wed 28-10-2026, core moon-mercury-sun 28-10-2026 |
| ref-0267 2030 | patyayini row 12: PL9 moon-saturn-venus Wed 28-10-2026, core moon-mercury-venus 28-10-2026 |
| ref-0267 2030 | patyayini row 13: PL9 moon-mercury-sun Wed 28-10-2026, core moon-sun-sun 28-10-2026 |
| ref-0267 2030 | patyayini row 14: PL9 moon-mercury-venus Wed 28-10-2026, core moon-sun-venus 28-10-2026 |
| ref-0267 2030 | patyayini row 15: PL9 moon-sun-sun Wed 28-10-2026, core moon-sun-mercury 28-10-2026 |
| ref-0267 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0268 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0269 2030 | planet rahu vb: PL9 14,2, core 12.65 |
| ref-0269 2030 | patyayini row 5: PL9 mars-mars-sun Tue 27-10-2026, core mars-jupiter-sun 27-10-2026 |
| ref-0269 2030 | patyayini row 6: PL9 mars-mars-venus Tue 27-10-2026, core mars-jupiter-moon 27-10-2026 |
| ref-0269 2030 | patyayini row 7: PL9 mars-jupiter-lagna Tue 27-10-2026, core mars-jupiter-venus 27-10-2026 |
| ref-0269 2030 | patyayini row 8: PL9 mars-jupiter-sun Tue 27-10-2026, core mars-saturn-saturn 27-10-2026 |
| ref-0269 2030 | patyayini row 9: PL9 mars-jupiter-moon Tue 27-10-2026, core mars-saturn-lagna 27-10-2026 |
| ref-0269 2030 | patyayini row 10: PL9 mars-jupiter-venus Tue 27-10-2026, core mars-saturn-mercury 27-10-2026 |
| ref-0269 2030 | patyayini row 11: PL9 mars-saturn-saturn Tue 27-10-2026, core mars-saturn-sun 27-10-2026 |
| ref-0269 2030 | patyayini row 12: PL9 mars-saturn-lagna Tue 27-10-2026, core mars-saturn-moon 27-10-2026 |
| ref-0269 2030 | patyayini row 13: PL9 mars-saturn-mercury Tue 27-10-2026, core mars-saturn-venus 27-10-2026 |
| ref-0269 2030 | patyayini row 14: PL9 mars-saturn-sun Tue 27-10-2026, core mars-lagna-lagna 28-10-2026 |
| ref-0269 2030 | patyayini row 15: PL9 mars-saturn-moon Tue 27-10-2026, core mars-lagna-mercury 28-10-2026 |
| ref-0269 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0270 2030 | planet rahu vb: PL9 14,3, core 12.65 |
| ref-0270 2030 | patyayini row 8: PL9 mars-mars-moon Tue 27-10-2026, core mars-jupiter-sun 27-10-2026 |
| ref-0270 2030 | patyayini row 9: PL9 mars-jupiter-jupiter Tue 27-10-2026, core mars-jupiter-moon 27-10-2026 |
| ref-0270 2030 | patyayini row 10: PL9 mars-jupiter-sun Tue 27-10-2026, core mars-jupiter-venus 27-10-2026 |
| ref-0270 2030 | patyayini row 11: PL9 mars-jupiter-moon Tue 27-10-2026, core mars-jupiter-lagna 27-10-2026 |
| ref-0270 2030 | patyayini row 12: PL9 mars-jupiter-venus Tue 27-10-2026, core mars-saturn-mercury 27-10-2026 |
| ref-0270 2030 | patyayini row 13: PL9 mars-jupiter-lagna Tue 27-10-2026, core mars-saturn-sun 27-10-2026 |
| ref-0270 2030 | patyayini row 14: PL9 mars-saturn-saturn Tue 27-10-2026, core mars-saturn-moon 27-10-2026 |
| ref-0270 2030 | patyayini row 15: PL9 mars-saturn-mercury Tue 27-10-2026, core mars-saturn-venus 27-10-2026 |
| ref-0270 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0271 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0272 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0273 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0274 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0275 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0276 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0277 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0278 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0279 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0280 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0281 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0282 2030 | vb rahu: PL9 13, core 12.00 |
| ref-0285 2030 | planet rahu vb: PL9 15,5, core 13.4 |
| ref-0285 2030 | planet ketu vb: PL9 10, core 8.5 |
| ref-0291 2030 | patyayini row 15: PL9 venus-jupiter-saturn Tue 03-11-2026, core venus-jupiter-mars 03-11-2026 |
| ref-0352 2030 | planet rahu vb: PL9 15,3, core 13.9 |
| ref-0352 2030 | planet ketu vb: PL9 12, core 11 |
| ref-0352 2030 | saham annual Yasa: PL9 Aquarius 16:32:36, core 316.54909772621954 |
| ref-0352 2030 | saham annual Paradesa: PL9 Pisces 15:50:50, core 345.85360502099877 |
| ref-0352 2030 | saham annual Artha: PL9 Taurus 02:19:26, core 32.33007724029195 |
| ref-0352 2030 | saham annual Labha: PL9 Pisces 01:37:56, core 331.6385616988248 |

## Panchanga

| Mapas | Valores | Falhas | Pendentes |
|---|---|---|---|
| 135 | 11340 | 0 | 42 |

As páginas de nascimento (os elementos ao nascer do sol e no nascimento com os seus fins e ghatis, o nascer e o pôr do sol, Ishtkaal, Bhayat, Bhabhog, as horas, os calendários, o Avakhada e o Ghat Chakra), o Tithi Pravesh nas duas variantes, o tithi, karana e yoga dos 540 instantes dos trânsitos, e as seis impressões Print → Panchang do REF 0010 (cada dia e o cabeçalho, nos três modos do calendário). Pendentes: o dia da semana védico, o mês Chaitradi junto a uma lua cheia e as buscas de pôr do sol que chegam a outro cruzamento (docs/spec/tempo/panchanga.md). Não comparados: o calendário tâmil e, no Panchang, o nascer e o pôr da Lua, os trânsitos, a marca de auspicioso, o Ratriman e a tabela dos signos.

| Mapa | Pendente |
|---|---|
| ref-0009 | monthChaitradi: PL9 Chaitra, core Vaishaka |
| ref-0010 | astrologicalWeekday: PL9 Saturday, core Sunday |
| ref-0010 | hinduWeekday: PL9 Saturday, core Sunday |
| ref-0013 | astrologicalWeekday: PL9 Wednesday, core Tuesday |
| ref-0013 | hinduWeekday: PL9 Wednesday, core Tuesday |
| ref-0013 | sunset: PL9 07:10:42, core 19:31:47 |
| ref-0038 | astrologicalWeekday: PL9 Saturday, core Sunday |
| ref-0038 | hinduWeekday: PL9 Saturday, core Sunday |
| ref-0040 | astrologicalWeekday: PL9 Tuesday, core Wednesday |
| ref-0040 | hinduWeekday: PL9 Tuesday, core Wednesday |
| ref-0041 | astrologicalWeekday: PL9 Sunday, core Saturday |
| ref-0041 | hinduWeekday: PL9 Sunday, core Saturday |
| ref-0042 | astrologicalWeekday: PL9 Wednesday, core Thursday |
| ref-0042 | hinduWeekday: PL9 Wednesday, core Thursday |
| ref-0043 | astrologicalWeekday: PL9 Wednesday, core Tuesday |
| ref-0043 | hinduWeekday: PL9 Wednesday, core Tuesday |
| ref-0051 | astrologicalWeekday: PL9 Wednesday, core Tuesday |
| ref-0051 | hinduWeekday: PL9 Wednesday, core Tuesday |
| ref-0058 | astrologicalWeekday: PL9 Tuesday, core Wednesday |
| ref-0058 | hinduWeekday: PL9 Tuesday, core Wednesday |
| ref-0061 | astrologicalWeekday: PL9 Saturday, core Friday |
| ref-0061 | hinduWeekday: PL9 Saturday, core Friday |
| ref-0075 | astrologicalWeekday: PL9 Sunday, core Monday |
| ref-0075 | hinduWeekday: PL9 Sunday, core Monday |
| ref-0082 | astrologicalWeekday: PL9 Friday, core Saturday |
| ref-0082 | hinduWeekday: PL9 Friday, core Saturday |
| ref-0124 | nextSunrise: PL9 Wed 11:05:44, core 05:30:18 |
| ref-0151 | astrologicalWeekday: PL9 Wednesday, core Thursday |
| ref-0151 | hinduWeekday: PL9 Wednesday, core Thursday |
| ref-0208 | sunset: PL9 02:09:32, core 02:09:30 |
| ref-0273 | monthChaitradi: PL9 Ashaadh, core Shravan |
| ref-0274 | monthChaitradi: PL9 Ashaadh, core Shravan |
| ref-0274 | astrologicalWeekday: PL9 Tuesday, core Wednesday |
| ref-0274 | hinduWeekday: PL9 Tuesday, core Wednesday |
| ref-0286 | astrologicalWeekday: PL9 Tuesday, core Monday |
| ref-0286 | hinduWeekday: PL9 Tuesday, core Monday |
| ref-0288 | astrologicalWeekday: PL9 Thursday, core Wednesday |
| ref-0288 | hinduWeekday: PL9 Thursday, core Wednesday |
| ref-0289 | sunset: PL9 17:26:12, core 17:26:15 |
| ref-0291 | astrologicalWeekday: PL9 Thursday, core Wednesday |
| ref-0291 | hinduWeekday: PL9 Thursday, core Wednesday |
| ref-0377 | monthChaitradi: PL9 Bhadrapada, core Aswini |

## Varshaphala

| Relatórios | Valores | Falhas | Pendentes | Acima de 120 anos |
|---|---|---|---|---|
| 172 | 333975 | 0 | 245 | 128 |

Os 72 retornos (data, hora, graus, senhor do ano, Muntha), o mapa do ano (signos, graus, nakshatras, senhores, dignidades, R/C), Harsha e Panchavargeeya, os ofícios e o senhor do ano, os yogas Tajika, os Sahams, os quatro dashas anuais, os 12 meses e o Tripataki Chakra (casas e vedhas). Não comparados: o Kutta e o Tambira, o SB do mapa anual e, nos relatórios acima de 120 anos, tudo menos os 72 retornos (docs/spec/tempo/varshaphala.md).

| Relatório | Pendente |
|---|---|
| ref-0018 2030 | yoga Manua planets: PL9 moon-sun,moon-saturn, core moon-sun,moon-saturn,mercury-sun,mercury-mars,venus-mars |
| ref-0039 2030 | yoga Manua planets: PL9 moon-saturn, core sun-jupiter,sun-saturn,moon-saturn,mars-jupiter,mercury-sun,mercury-mars,mercury-jupiter,venus-mars,venus-jupiter |
| ref-0039 2030 | saham Mahatmya: PL9 Leo 18:48:24, core 138.81365294722946 |
| ref-0039 2030 | saham Paradesa: PL9 Cancer 17:28:48, core 107.4868100072664 |
| ref-0039 2030 | saham Artha: PL9 Sagittarius 17:33:11, core 257.55991970998946 |
| ref-0039 2030 | saham Bandhana: PL9 Capricorn 09:37:17, core 279.62828586526655 |
| ref-0039 2030 | saham Apamrityu: PL9 Taurus 16:57:34, core 46.96634793293063 |
| ref-0039 2030 | saham Labha: PL9 Capricorn 12:57:21, core 282.9624345463031 |
| ref-0044 2030 | yoga Kamboola planets: PL9 , core sun-mars |
| ref-0061 2030 | yoga Kamboola: PL9 true, core false |
| ref-0063 2030 | saham Karyasiddhi: PL9 Cancer 16:11:09, core 136.1857966451688 |
| ref-0063 2030 | saham Karyasiddhi lord: PL9 moon, core sun |
| ref-0090 2030 | saham Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2030 | saham Karyasiddhi lord: PL9 mercury, core venus |
| ref-0091 2030 | yoga Manua planets: PL9 moon-venus,moon-mars,moon-jupiter,moon-saturn,venus-jupiter, core moon-mars,moon-jupiter,moon-venus,moon-saturn,mars-jupiter,venus-jupiter |
| ref-0095 2030 | yoga Kamboola planets: PL9 , core sun-mars |
| ref-0096 2030 | yoga Manua planets: PL9 mercury-jupiter,mercury-saturn,venus-jupiter, core sun-jupiter,sun-saturn,mars-jupiter,mercury-jupiter,mercury-saturn,venus-jupiter,venus-saturn |
| ref-0126 2030 | saham Karyasiddhi: PL9 Leo 19:31:11, core 169.51980261350008 |
| ref-0126 2030 | saham Karyasiddhi lord: PL9 sun, core mercury |
| ref-0165 2030 | yoga Manua planets: PL9 moon-mars,moon-jupiter,moon-saturn,venus-mars,venus-jupiter, core moon-mars,moon-jupiter,moon-saturn,mars-jupiter,venus-mars,venus-jupiter,venus-saturn |
| ref-0182 2030 | yoga Manua planets: PL9 moon-mercury,moon-sun,moon-jupiter,mercury-sun,mercury-jupiter, core sun-jupiter,moon-sun,moon-mercury,moon-jupiter,mercury-sun,mercury-jupiter |
| ref-0225 2030 | yoga Manua planets: PL9 mercury-sun,mercury-mars,venus-sun,venus-mars, core mercury-sun,mercury-mars,venus-sun,venus-mars,venus-jupiter |
| ref-0263 2030 | yoga Manua planets: PL9 moon-mercury,moon-venus,moon-sun, core sun-jupiter,sun-saturn,moon-sun,moon-mercury,moon-venus,mars-jupiter,mercury-sun,mercury-mars,venus-mars,venus-jupiter |
| ref-0263 2030 | saham Mahatmya: PL9 Libra 06:13:23, core 186.22900614000142 |
| ref-0263 2030 | saham Paradesa: PL9 Aquarius 20:19:15, core 320.3269874665508 |
| ref-0263 2030 | saham Artha: PL9 Capricorn 08:15:39, core 278.2670564817763 |
| ref-0263 2030 | saham Bandhana: PL9 Pisces 26:44:00, core 356.739502676009 |
| ref-0263 2030 | saham Apamrityu: PL9 Cancer 14:09:53, core 104.17080296940162 |
| ref-0263 2030 | saham Labha: PL9 Aquarius 18:16:49, core 318.28670050032787 |
| ref-0264 2030 | yoga Manua planets: PL9 moon-mercury,moon-venus,moon-sun, core sun-jupiter,sun-saturn,moon-sun,moon-mercury,moon-venus,mars-jupiter,mercury-sun,mercury-mars,venus-mars,venus-jupiter |
| ref-0264 2030 | saham Paradesa: PL9 Gemini 09:03:00, core 69.05533369664994 |
| ref-0264 2030 | saham Artha: PL9 Libra 08:23:33, core 188.39754012986992 |
| ref-0264 2030 | saham Labha: PL9 Sagittarius 29:33:38, core 269.56585698373647 |
| ref-0269 2030 | yoga Manua planets: PL9 moon-mercury,moon-sun,moon-jupiter,mercury-sun,mercury-jupiter, core sun-jupiter,moon-sun,moon-mercury,moon-jupiter,mercury-sun,mercury-jupiter |
| ref-0270 2030 | yoga Manua planets: PL9 moon-mercury,moon-sun,moon-jupiter,mercury-sun,mercury-jupiter, core sun-jupiter,moon-sun,moon-mercury,moon-jupiter,mercury-sun,mercury-jupiter |
| ref-0277 2030 | yoga Kamboola planets: PL9 , core mercury-mars |
| ref-0278 2030 | yoga Kamboola planets: PL9 , core mercury-mars |
| ref-0352 2030 | saham Yasa: PL9 Gemini 12:21:04, core 72.35709373996872 |
| ref-0352 2030 | saham Paradesa: PL9 Taurus 28:57:09, core 58.958778589062376 |
| ref-0352 2030 | saham Artha: PL9 Virgo 28:58:38, core 178.98328940120413 |
| ref-0352 2030 | saham Labha: PL9 Sagittarius 13:59:06, core 253.99118511369738 |
| ref-0003 2000 | patyayini 2 end: PL9 12-11-2026, core 09-09-2026 16:17 |
| ref-0003 2000 | patyayini 2.3 lord: PL9 jupiter, core lagna |
| ref-0003 2000 | patyayini 2.3 time: PL9 24-05-2026 16:10, core 24-05-2026 04:49 |
| ref-0003 2000 | patyayini 2.4 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 2.4 time: PL9 25-05-2026 03:32, core 24-05-2026 16:10 |
| ref-0003 2000 | patyayini 2.5 lord: PL9 venus, core sun |
| ref-0003 2000 | patyayini 2.5 time: PL9 25-05-2026 07:18, core 25-05-2026 03:32 |
| ref-0003 2000 | patyayini 2.6 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 2.7 lord: PL9 saturn, core moon |
| ref-0003 2000 | patyayini 2.7 time: PL9 09-09-2026 16:17, core 25-05-2026 08:34 |
| ref-0003 2000 | patyayini 2.8 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 2.8 time: PL9 12-11-2026 11:59, core 09-09-2026 16:17 |
| ref-0003 2000 | patyayini 3 begin: PL9 12-11-2026, core 09-09-2026 16:17 |
| ref-0003 2000 | patyayini 3.1 lord: PL9 lagna, core mercury |
| ref-0003 2000 | patyayini 3.1 time: PL9 12-11-2026 13:24, core 12-11-2026 11:59 |
| ref-0003 2000 | patyayini 3.2 lord: PL9 jupiter, core lagna |
| ref-0003 2000 | patyayini 3.2 time: PL9 21-11-2026 01:49, core 12-11-2026 13:29 |
| ref-0003 2000 | patyayini 3.3 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 3.3 time: PL9 29-11-2026 14:29, core 21-11-2026 01:49 |
| ref-0003 2000 | patyayini 3.4 lord: PL9 venus, core sun |
| ref-0003 2000 | patyayini 3.4 time: PL9 02-12-2026 10:08, core 29-11-2026 14:28 |
| ref-0003 2000 | patyayini 3.5 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 3.5 time: PL9 03-12-2026 09:05, core 02-12-2026 10:08 |
| ref-0003 2000 | patyayini 3.6 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 3.6 time: PL9 09-12-2026 08:14, core 03-12-2026 09:05 |
| ref-0003 2000 | patyayini 3.7 lord: PL9 mercury, core mars |
| ref-0003 2000 | patyayini 3.7 time: PL9 16-01-2027 07:05, core 09-12-2026 08:14 |
| ref-0003 2000 | patyayini 3.8 lord: PL9 lagna, core mercury |
| ref-0003 2000 | patyayini 4.1 lord: PL9 jupiter, core lagna |
| ref-0003 2000 | patyayini 4.1 time: PL9 21-01-2027 09:29, core 16-01-2027 07:58 |
| ref-0003 2000 | patyayini 4.2 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 4.2 time: PL9 26-01-2027 11:11, core 21-01-2027 09:29 |
| ref-0003 2000 | patyayini 4.3 lord: PL9 venus, core sun |
| ref-0003 2000 | patyayini 4.3 time: PL9 28-01-2027 03:25, core 26-01-2027 11:11 |
| ref-0003 2000 | patyayini 4.4 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 4.4 time: PL9 28-01-2027 17:04, core 28-01-2027 03:25 |
| ref-0003 2000 | patyayini 4.5 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 4.5 time: PL9 01-02-2027 06:11, core 28-01-2027 17:04 |
| ref-0003 2000 | patyayini 4.6 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 4.6 time: PL9 06-04-2027 01:53, core 01-02-2027 06:11 |
| ref-0003 2000 | patyayini 4.7 lord: PL9 jupiter, core saturn |
| ref-0003 2000 | patyayini 4.8 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 5 end: PL9 08-04-2027, core 07-04-2027 20:17 |
| ref-0003 2000 | patyayini 5.1 lord: PL9 mars, core sun |
| ref-0003 2000 | patyayini 5.2 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 5.2 time: PL9 06-04-2027 03:39, core 06-04-2027 02:15 |
| ref-0003 2000 | patyayini 5.3 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 5.4 lord: PL9 jupiter, core mercury |
| ref-0003 2000 | patyayini 5.4 time: PL9 06-04-2027 20:43, core 06-04-2027 04:39 |
| ref-0003 2000 | patyayini 5.5 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 5.5 time: PL9 07-04-2027 12:57, core 06-04-2027 20:52 |
| ref-0003 2000 | patyayini 5.6 lord: PL9 venus, core sun |
| ref-0003 2000 | patyayini 5.6 time: PL9 07-04-2027 18:20, core 07-04-2027 13:06 |
| ref-0003 2000 | patyayini 5.7 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 5.7 time: PL9 07-04-2027 20:09, core 07-04-2027 18:28 |
| ref-0003 2000 | patyayini 5.8 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 5.8 time: PL9 08-04-2027 07:31, core 07-04-2027 20:17 |
| ref-0003 2000 | patyayini 6 begin: PL9 08-04-2027, core 07-04-2027 20:17 |
| ref-0003 2000 | patyayini 6 end: PL9 01-05-2027, core 23-04-2027 08:27 |
| ref-0003 2000 | patyayini 6.1 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 6.1 time: PL9 16-04-2027 19:56, core 08-04-2027 07:39 |
| ref-0003 2000 | patyayini 6.2 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 6.2 time: PL9 21-04-2027 21:30, core 16-04-2027 19:59 |
| ref-0003 2000 | patyayini 6.3 lord: PL9 lagna, core mercury |
| ref-0003 2000 | patyayini 6.4 lord: PL9 sun, core lagna |
| ref-0003 2000 | patyayini 6.4 time: PL9 22-04-2027 13:52, core 21-04-2027 21:37 |
| ref-0003 2000 | patyayini 6.5 lord: PL9 venus, core sun |
| ref-0003 2000 | patyayini 6.5 time: PL9 22-04-2027 19:15, core 22-04-2027 13:52 |
| ref-0003 2000 | patyayini 6.6 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 6.6 time: PL9 22-04-2027 21:04, core 22-04-2027 19:15 |
| ref-0003 2000 | patyayini 6.7 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 6.7 time: PL9 23-04-2027 08:27, core 22-04-2027 21:04 |
| ref-0003 2000 | patyayini 6.8 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 6.8 time: PL9 01-05-2027 21:06, core 23-04-2027 08:27 |
| ref-0003 2000 | patyayini 7 begin: PL9 01-05-2027, core 23-04-2027 08:27 |
| ref-0003 2000 | patyayini 7 end: PL9 12-05-2027, core 10-05-2027 16:57 |
| ref-0003 2000 | patyayini 7.1 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 7.1 time: PL9 06-05-2027 22:48, core 01-05-2027 21:06 |
| ref-0003 2000 | patyayini 7.2 lord: PL9 lagna, core mercury |
| ref-0003 2000 | patyayini 7.3 lord: PL9 jupiter, core lagna |
| ref-0003 2000 | patyayini 7.3 time: PL9 07-05-2027 15:09, core 06-05-2027 22:55 |
| ref-0003 2000 | patyayini 7.4 lord: PL9 venus, core jupiter |
| ref-0003 2000 | patyayini 7.4 time: PL9 07-05-2027 16:56, core 07-05-2027 15:09 |
| ref-0003 2000 | patyayini 7.5 lord: PL9 moon, core venus |
| ref-0003 2000 | patyayini 7.6 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 7.6 time: PL9 07-05-2027 21:18, core 07-05-2027 17:32 |
| ref-0003 2000 | patyayini 7.7 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 7.7 time: PL9 10-05-2027 16:57, core 07-05-2027 21:18 |
| ref-0003 2000 | patyayini 7.8 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 7.8 time: PL9 12-05-2027 09:11, core 10-05-2027 16:57 |
| ref-0003 2000 | patyayini 8 begin: PL9 12-05-2027, core 10-05-2027 16:57 |
| ref-0003 2000 | patyayini 8.1 lord: PL9 jupiter, core mercury |
| ref-0003 2000 | patyayini 8.1 time: PL9 12-05-2027 14:35, core 12-05-2027 09:11 |
| ref-0003 2000 | patyayini 8.2 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 8.2 time: PL9 12-05-2027 19:58, core 12-05-2027 14:35 |
| ref-0003 2000 | patyayini 8.3 lord: PL9 moon, core sun |
| ref-0003 2000 | patyayini 8.4 lord: PL9 mars, core moon |
| ref-0003 2000 | patyayini 8.5 lord: PL9 saturn, core mars |
| ref-0003 2000 | patyayini 8.5 time: PL9 13-05-2027 20:24, core 12-05-2027 21:26 |
| ref-0003 2000 | patyayini 8.6 lord: PL9 mercury, core saturn |
| ref-0003 2000 | patyayini 8.6 time: PL9 14-05-2027 10:03, core 13-05-2027 20:24 |
| ref-0003 2000 | patyayini 8.7 lord: PL9 jupiter, core mercury |
| ref-0003 2000 | patyayini 8.7 time: PL9 14-05-2027 11:53, core 14-05-2027 10:04 |
| ref-0003 2000 | patyayini 8.8 lord: PL9 sun, core jupiter |
| ref-0003 2000 | patyayini 8.8 time: PL9 14-05-2027 13:43, core 14-05-2027 11:54 |
| ref-0014 2000 | yoga Kamboola: PL9 true, core false |
| ref-0039 2000 | saham Yasa: PL9 Aquarius 11:57:58, core 311.97335113421815 |
| ref-0039 2000 | saham Paradesa: PL9 Aries 13:03:05, core 13.0588299007469 |
| ref-0039 2000 | saham Artha: PL9 Libra 08:33:17, core 188.56207480807973 |
| ref-0039 2000 | saham Labha: PL9 Taurus 00:52:49, core 30.887912738782347 |
| ref-0090 2000 | saham Karyasiddhi: PL9 Virgo 02:12:29, core 182.20817119933298 |
| ref-0090 2000 | saham Karyasiddhi lord: PL9 mercury, core venus |
| ref-0095 2000 | yoga Manua planets: PL9 moon-mercury,moon-venus, core moon-mars,moon-mercury,moon-venus |
| ref-0143 2000 | yoga Kamboola planets: PL9 , core venus-saturn |
| ref-0143 2000 | saham Yasa: PL9 Libra 03:35:42, core 183.601509643364 |
| ref-0143 2000 | saham Paradesa: PL9 Pisces 04:36:46, core 334.6197908968669 |
| ref-0143 2000 | saham Artha: PL9 Leo 22:39:31, core 142.66543621905294 |
| ref-0143 2000 | saham Labha: PL9 Pisces 19:16:16, core 349.27809241879936 |
| ref-0157 2000 | yoga Manua planets: PL9 moon-mercury,moon-mars,mercury-mars,sun-mars, core sun-mars,sun-saturn,moon-mars,moon-mercury,mercury-mars |
| ref-0157 2000 | saham Karyasiddhi: PL9 Gemini 03:42:45, core 93.7123647728626 |
| ref-0157 2000 | saham Karyasiddhi lord: PL9 mercury, core moon |
| ref-0165 2000 | yoga Manua planets: PL9 moon-mars,moon-jupiter,moon-saturn,venus-mars,venus-jupiter, core moon-mars,moon-jupiter,moon-saturn,mars-jupiter,venus-mars,venus-jupiter,venus-saturn |
| ref-0169 2000 | yoga Ithasala planets: PL9 moon-sun,moon-mars,moon-jupiter,mars-jupiter,sun-saturn, core moon-sun,moon-mars,moon-jupiter,mars-jupiter,sun-saturn,jupiter-saturn |
| ref-0225 2000 | yoga Manua planets: PL9 mercury-sun,mercury-mars,venus-sun,venus-mars, core mercury-sun,mercury-mars,venus-sun,venus-mars,venus-jupiter |
| ref-0263 2000 | saham Yasa: PL9 Gemini 10:46:33, core 70.78449183071092 |
| ref-0264 2000 | saham Paradesa: PL9 Aries 09:42:46, core 9.719326313592546 |
| ref-0264 2000 | saham Artha: PL9 Libra 04:03:06, core 184.05777479434386 |
| ref-0264 2000 | saham Labha: PL9 Capricorn 24:03:22, core 294.06264557271766 |
| ref-0268 2000 | patyayini 7 end: PL9 30-10-2003, core 31-10-2003 01:34 |
| ref-0268 2000 | patyayini 7.2 lord: PL9 jupiter, core lagna |
| ref-0268 2000 | patyayini 7.3 lord: PL9 lagna, core saturn |
| ref-0268 2000 | patyayini 7.3 time: PL9 28-10-2003 13:12, core 28-10-2003 23:02 |
| ref-0268 2000 | patyayini 7.4 lord: PL9 saturn, core sun |
| ref-0268 2000 | patyayini 7.4 time: PL9 28-10-2003 23:02, core 29-10-2003 11:10 |
| ref-0268 2000 | patyayini 7.5 lord: PL9 sun, core mars |
| ref-0268 2000 | patyayini 7.5 time: PL9 29-10-2003 11:10, core 29-10-2003 18:05 |
| ref-0268 2000 | patyayini 7.6 lord: PL9 mars, core venus |
| ref-0268 2000 | patyayini 7.6 time: PL9 29-10-2003 18:05, core 29-10-2003 21:52 |
| ref-0268 2000 | patyayini 7.7 lord: PL9 venus, core jupiter |
| ref-0268 2000 | patyayini 7.7 time: PL9 29-10-2003 21:52, core 30-10-2003 10:34 |
| ref-0268 2000 | patyayini 7.8 lord: PL9 jupiter, core moon |
| ref-0268 2000 | patyayini 7.8 time: PL9 30-10-2003 10:34, core 31-10-2003 01:34 |
| ref-0268 2000 | patyayini 8 lord: PL9 lagna, core saturn |
| ref-0268 2000 | patyayini 8 begin: PL9 30-10-2003, core 31-10-2003 01:34 |
| ref-0268 2000 | patyayini 8 end: PL9 29-12-2003, core 12-01-2004 15:54 |
| ref-0268 2000 | patyayini 8.1 lord: PL9 moon, core saturn |
| ref-0268 2000 | patyayini 8.1 time: PL9 31-10-2003 01:34, core 09-11-2003 14:35 |
| ref-0268 2000 | patyayini 8.2 lord: PL9 saturn, core sun |
| ref-0268 2000 | patyayini 8.2 time: PL9 09-11-2003 14:35, core 21-11-2003 09:29 |
| ref-0268 2000 | patyayini 8.3 lord: PL9 sun, core mars |
| ref-0268 2000 | patyayini 8.3 time: PL9 21-11-2003 09:29, core 28-11-2003 02:56 |
| ref-0268 2000 | patyayini 8.4 lord: PL9 mars, core venus |
| ref-0268 2000 | patyayini 8.4 time: PL9 28-11-2003 02:56, core 01-12-2003 18:48 |
| ref-0268 2000 | patyayini 8.5 lord: PL9 venus, core jupiter |
| ref-0268 2000 | patyayini 8.5 time: PL9 01-12-2003 18:48, core 14-12-2003 03:14 |
| ref-0268 2000 | patyayini 8.6 lord: PL9 jupiter, core moon |
| ref-0268 2000 | patyayini 8.6 time: PL9 14-12-2003 03:14, core 28-12-2003 16:35 |
| ref-0268 2000 | patyayini 8.7 lord: PL9 moon, core lagna |
| ref-0268 2000 | patyayini 8.7 time: PL9 28-12-2003 16:35, core 29-12-2003 02:26 |
| ref-0268 2000 | patyayini 8.8 lord: PL9 lagna, core sun |
| ref-0268 2000 | patyayini 8.8 time: PL9 29-12-2003 02:26, core 12-01-2004 15:54 |
| ref-0272 2000 | patyayini 7 end: PL9 15-02-2005, core 17-02-2005 07:07 |
| ref-0272 2000 | patyayini 7.2 lord: PL9 saturn, core sun |
| ref-0272 2000 | patyayini 7.2 time: PL9 21-11-2004 09:20, core 12-12-2004 13:10 |
| ref-0272 2000 | patyayini 7.3 lord: PL9 sun, core moon |
| ref-0272 2000 | patyayini 7.3 time: PL9 12-12-2004 13:10, core 29-12-2004 05:51 |
| ref-0272 2000 | patyayini 7.4 lord: PL9 moon, core lagna |
| ref-0272 2000 | patyayini 7.4 time: PL9 29-12-2004 05:51, core 01-01-2005 00:02 |
| ref-0272 2000 | patyayini 7.5 lord: PL9 lagna, core saturn |
| ref-0272 2000 | patyayini 7.5 time: PL9 01-01-2005 00:02, core 01-02-2005 07:47 |
| ref-0272 2000 | patyayini 7.6 lord: PL9 saturn, core mercury |
| ref-0272 2000 | patyayini 7.6 time: PL9 01-02-2005 07:47, core 09-02-2005 21:42 |
| ref-0272 2000 | patyayini 7.7 lord: PL9 mercury, core jupiter |
| ref-0272 2000 | patyayini 7.7 time: PL9 09-02-2005 21:42, core 15-02-2005 01:22 |
| ref-0272 2000 | patyayini 7.8 lord: PL9 jupiter, core mars |
| ref-0272 2000 | patyayini 7.8 time: PL9 15-02-2005 01:22, core 17-02-2005 07:07 |
| ref-0272 2000 | patyayini 8 lord: PL9 sun, core moon |
| ref-0272 2000 | patyayini 8 begin: PL9 15-02-2005, core 17-02-2005 07:10 |
| ref-0272 2000 | patyayini 8 end: PL9 27-04-2005, core 28-04-2005 00:34 |
| ref-0272 2000 | patyayini 8.1 lord: PL9 mars, core moon |
| ref-0272 2000 | patyayini 8.1 time: PL9 17-02-2005 07:07, core 02-03-2005 11:20 |
| ref-0272 2000 | patyayini 8.2 lord: PL9 moon, core lagna |
| ref-0272 2000 | patyayini 8.2 time: PL9 02-03-2005 11:20, core 04-03-2005 15:33 |
| ref-0272 2000 | patyayini 8.3 lord: PL9 lagna, core saturn |
| ref-0272 2000 | patyayini 8.3 time: PL9 04-03-2005 15:33, core 29-03-2005 08:45 |
| ref-0272 2000 | patyayini 8.4 lord: PL9 saturn, core mercury |
| ref-0272 2000 | patyayini 8.4 time: PL9 29-03-2005 08:45, core 05-04-2005 03:14 |
| ref-0272 2000 | patyayini 8.5 lord: PL9 mercury, core jupiter |
| ref-0272 2000 | patyayini 8.5 time: PL9 05-04-2005 03:14, core 09-04-2005 04:48 |
| ref-0272 2000 | patyayini 8.6 lord: PL9 jupiter, core mars |
| ref-0272 2000 | patyayini 8.6 time: PL9 09-04-2005 04:48, core 10-04-2005 23:14 |
| ref-0272 2000 | patyayini 8.7 lord: PL9 mars, core sun |
| ref-0272 2000 | patyayini 8.7 time: PL9 10-04-2005 23:14, core 27-04-2005 15:57 |
| ref-0272 2000 | patyayini 8.8 lord: PL9 sun, core lagna |
| ref-0272 2000 | patyayini 8.8 time: PL9 27-04-2005 15:57, core 28-04-2005 00:34 |
| ref-0282 2000 | saham Karyasiddhi: PL9 Cancer 00:41:14, core 120.68722212914503 |
| ref-0282 2000 | saham Karyasiddhi lord: PL9 moon, core sun |
| ref-0290 2000 | saham Karyasiddhi: PL9 Gemini 16:45:57, core 106.76595891749923 |
| ref-0290 2000 | saham Karyasiddhi lord: PL9 mercury, core moon |
| ref-0018 mean | yoga Manua planets: PL9 moon-sun,moon-saturn, core moon-sun,moon-saturn,mercury-sun,mercury-mars,venus-mars |
| ref-0018 mean | saham Karyasiddhi: PL9 Leo 05:34:28, core 155.57441265707672 |
| ref-0018 mean | saham Karyasiddhi lord: PL9 sun, core mercury |
| ref-0027 mean | saham Karyasiddhi: PL9 Cancer 26:02:27, core 146.04084444111615 |
| ref-0027 mean | saham Karyasiddhi lord: PL9 moon, core sun |

## Muhurta

| Impressões | Valores | Falhas | Pendentes |
|---|---|---|---|
| 330 | 78720 | 0 | 465 |

O mapa do Muhurta e as suas vargas (D9, D10, D16, D24, D60), posições, nakshatras e sílabas, R/C, dignidade, SB% e SB#, a Vimshopaka, a Avastha, os kakshas, Tarabala, Chandrabala, tithi, karana e yoga, as cadeias de dasha do nativo, as listas de dasha do Muhurta e do nativo, a Bhava Bala e o termômetro. Não comparados: Mandi, "BP" e "eM" nos desenhos e os textos (docs/spec/tempo/muhurta.md).

| Impressão | Pendente |
|---|---|
| ref-0001 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0001 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0002 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0002 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0003 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0003 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0004 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0004 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0005 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0005 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0006 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0006 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0007 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0007 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0008 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0008 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0009 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0009 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0010 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0010 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0011 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0011 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0012 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0012 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0013 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0013 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0014 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0014 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0015 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0015 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0016 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0016 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0017 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0017 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0018 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0018 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0019 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0019 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0020 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0020 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0022 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0022 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0025 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0025 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0027 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0027 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0028 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0028 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0029 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0029 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0030 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0030 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0031 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0031 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0035 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0035 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0037 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0037 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0038 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0038 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0039 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0039 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0040 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0040 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0041 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0041 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0042 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0042 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0043 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0043 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0044 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0044 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0050 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0050 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0051 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0051 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0056 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0056 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0058 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0058 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0060 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0060 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0061 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0061 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0063 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0063 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0065 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0065 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0067 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0067 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0069 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0069 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0070 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0070 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0073 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0073 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0075 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0075 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0076 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0076 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0077 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0077 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0079 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0079 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0082 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0082 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0083 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0083 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0088 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0088 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0090 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0090 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0091 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0091 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0095 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0095 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0096 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0096 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0097 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0097 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0098 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0098 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0099 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0099 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0103 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0103 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0109 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0109 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0122 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0122 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0124 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0124 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0126 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0126 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0127 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0127 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0129 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0129 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0131 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0131 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0140 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0140 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0143 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0143 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0151 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0151 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0156 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0156 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0157 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0157 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0161 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0161 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0165 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0165 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0169 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0169 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0170 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0170 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0173 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0173 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0176 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0176 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0177 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0177 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0182 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0182 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0183 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0183 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0186 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0186 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0188 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0188 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0191 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0191 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0208 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0208 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0209 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0209 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0212 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0212 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0223 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0223 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0225 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0225 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0233 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0233 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0236 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0236 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0243 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0243 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0246 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0246 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0250 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0250 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0254 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0254 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0258 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0258 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0259 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0259 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0260 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0260 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0261 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0261 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0262 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0262 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0263 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0263 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0264 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0264 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0265 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0265 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0266 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0266 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0267 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0267 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0268 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0268 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0269 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0269 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0270 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0270 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0271 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0271 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0272 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0272 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0273 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0273 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0274 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0274 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0275 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0275 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0276 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0276 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0277 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0277 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0278 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0278 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0279 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0279 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0280 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0280 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0281 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0281 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0282 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0282 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0283 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0283 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0284 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0284 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0285 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0285 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0286 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0286 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0287 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0287 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0288 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0288 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0289 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0289 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0290 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0290 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0291 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0291 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0352 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0352 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0375 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0375 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0377 2000 | vb rahu: PL9 9, core 8.35 |
| ref-0377 2000 | vb ketu: PL9 17, core 14.65 |
| ref-0001 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0002 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0003 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0004 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0005 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0006 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0007 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0008 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0009 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0010 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0011 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0012 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0013 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0014 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0015 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0016 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0017 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0018 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0019 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0020 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0022 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0025 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0027 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0028 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0029 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0030 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0031 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0035 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0037 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0038 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0039 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0040 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0041 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0042 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0043 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0044 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0050 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0051 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0056 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0058 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0060 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0061 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0063 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0065 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0067 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0069 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0070 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0073 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0075 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0076 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0077 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0079 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0082 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0083 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0088 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0090 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0091 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0095 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0096 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0097 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0098 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0099 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0103 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0109 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0122 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0124 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0126 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0127 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0129 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0131 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0140 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0143 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0151 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0156 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0157 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0161 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0165 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0169 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0170 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0173 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0176 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0177 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0182 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0183 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0186 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0188 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0191 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0208 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0209 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0212 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0223 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0225 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0233 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0236 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0243 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0246 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0250 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0254 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0258 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0259 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0260 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0261 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0262 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0263 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0264 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0265 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0266 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0267 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0268 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0269 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0270 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0271 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0272 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0273 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0274 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0275 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0276 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0277 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0278 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0279 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0280 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0281 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0282 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0283 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0284 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0285 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0286 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0287 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0288 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0289 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0290 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0291 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0352 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0375 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0377 2030 | vb ketu: PL9 11, core 8.9 |
| ref-0001 general | vb ketu: PL9 10, core 8.25 |
| ref-0002 general | vb ketu: PL9 10, core 8.25 |
| ref-0003 general | vb ketu: PL9 10, core 8.25 |
| ref-0004 general | vb ketu: PL9 10, core 8.25 |
| ref-0006 general | vb ketu: PL9 10, core 8.25 |
| ref-0007 general | vb ketu: PL9 10, core 8.25 |
| ref-0008 general | vb ketu: PL9 10, core 8.25 |
| ref-0010 general | vb ketu: PL9 10, core 8.25 |
| ref-0011 general | vb ketu: PL9 10, core 8.25 |
| ref-0012 general | vb ketu: PL9 10, core 8.25 |
| ref-0013 general | vb ketu: PL9 10, core 8.25 |
| ref-0014 general | vb ketu: PL9 10, core 8.25 |
| ref-0015 general | vb ketu: PL9 10, core 8.25 |
| ref-0017 general | vb ketu: PL9 10, core 8.25 |
| ref-0018 general | vb ketu: PL9 10, core 8.25 |
| ref-0025 general | vb ketu: PL9 10, core 8.25 |
| ref-0027 general | vb ketu: PL9 10, core 8.25 |
| ref-0029 general | vb ketu: PL9 10, core 8.25 |
| ref-0030 general | vb ketu: PL9 10, core 8.25 |
| ref-0035 general | vb ketu: PL9 10, core 8.25 |
| ref-0040 general | vb ketu: PL9 10, core 8.25 |
| ref-0042 general | vb ketu: PL9 10, core 8.25 |
| ref-0043 general | vb ketu: PL9 10, core 8.25 |
| ref-0058 general | vb ketu: PL9 10, core 8.25 |
| ref-0065 general | vb ketu: PL9 10, core 8.25 |
| ref-0069 general | vb ketu: PL9 10, core 8.25 |
| ref-0073 general | vb ketu: PL9 10, core 8.25 |
| ref-0076 general | vb ketu: PL9 10, core 8.25 |
| ref-0079 general | vb ketu: PL9 10, core 8.25 |
| ref-0083 general | vb ketu: PL9 10, core 8.25 |
| ref-0001 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0002 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0003 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0004 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0006 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0007 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0008 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0010 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0011 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0012 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0013 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0014 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0015 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0017 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0018 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0025 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0027 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0029 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0030 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0035 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0040 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0042 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0043 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0058 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0065 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0069 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0073 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0076 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0079 marriage | vb ketu: PL9 10, core 8.25 |
| ref-0083 marriage | vb ketu: PL9 10, core 8.25 |
