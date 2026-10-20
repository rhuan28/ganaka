# Dashas de signo

Código: `packages/core/src/dashas/rashi.ts` (e `strength.ts`, `points.ts`).
Testes: `packages/core/test/rashi.test.ts`, `packages/core/test/strength.test.ts`.

Nove dos dez dashas de signo do PL9. O padrão são as opções observadas na
instalação examinada ("Chara dasha method: K.N.Rao", "Padanadhamsadasha
Method: K.N.Rao", "Rahu's Exaltation sign for Rashi Dashas: Taurus", "Mercury
Exaltation for Rashi Dasha: Exalted according to degree", "Start of Rashi
Antardashas: the Sign"); as outras estão em "Opções". O Sree Lagna Kendradi
ainda não fecha com o PL9 e é recusado (`NotImplementedOptionError`).

## Regras comuns

- **Começo:** no nascimento, sem saldo.
- **Duração:** em anos inteiros por signo; o ano é o dos outros dashas
  (`dashaYearDays`). Um signo de 0 anos é pulado.
- **Antardashas:** 12 partes iguais. Salvo onde se diz outra coisa, a
  primeira é o signo mais forte entre o signo da mahadasha e o 7º
  (`docs/spec/dashas/forca-signos.md`), e elas andam para a frente se o signo
  da mahadasha é ímpar, para trás se é par — como no Kalachakra.
- **Voltas:** a sequência se repete com os mesmos anos — salvo no Narayana,
  no Lagna Kendradi e no Drig. Neles, no modo `pl9`, o `core` só dá a
  primeira volta e recusa (`NotImplementedOptionError`) pedir mais de uma,
  porque a do PL9 sai embaralhada; no modo `corrected`, a segunda volta dá a
  cada signo 12 anos menos os da primeira (`docs/spec/correcoes.md`, 16).
- **Modos:** nos dashas de signo, o modo `corrected` difere do `pl9` na
  ordem do Drig (o corte a oito bits, abaixo) e na segunda volta
  (`docs/spec/correcoes.md`, 15 a 17).
- **Signos "diretos":** Áries, Touro, Gêmeos, Libra, Escorpião, Sagitário.

## Anos

**Contagem até o regente** (Narayana, Lagna Kendradi, Drig): os signos do
signo até o seu regente (o mais forte dos dois para Escorpião e Aquário),
para a frente nos signos diretos e para trás nos outros, sem contar o
próprio; 12 quando o regente está nele; mais 1 se o regente está exaltado,
menos 1 se debilitado; 13 vale 12. A exaltação, aqui, vale no signo inteiro,
menos para Mercúrio (só até 15° de Virgem); Rahu é exaltado em Touro e Ketu
em Escorpião; debilitado no signo oposto.

**Chara (K.N. Rao):** a mesma contagem, sem exaltação. Para Escorpião e
Aquário: se um dos regentes está no signo, vale o outro; senão, o que está
num signo com mais planetas; empate, o de maior grau no signo.

**Navamsha:** os signos até o regente simples, sempre para a frente.

**Padanadhamsa:** na Navamsha, os signos até o regente simples contando os
dois extremos, para a frente a partir de signo ímpar e para trás a partir
de par; 12 com o regente no próprio signo, 10 com ele no 7º.

**Shoola:** 9 anos cada. **Niryaana Shoola** e **Sthira:** 7, 8 ou 9 anos
(móvel, fixo, duplo).

## Sequências

- **Chara:** do signo do Lagna, para a frente se o 9º a partir dele é direto,
  para trás se não. Antardashas: do signo seguinte ao da mahadasha, na
  direção dada pelo 9º a partir dele, com o próprio signo por último.
- **Narayana:** do mais forte entre o Lagna e o 7º. Direção: para a frente em
  signo ímpar, para trás em par; Saturno no signo leva para a frente; Ketu no
  signo inverte a direção. Ordem pela modalidade do primeiro signo: móvel, um
  signo depois do outro; fixo, de seis em seis; duplo, por trígonos (o signo,
  o 9º e o 5º na direção contrária, depois o grupo três signos adiante).
  A direção dos signos duplos fica, assim, ao contrário da dos outros.
  Com Saturno no primeiro signo, um depois do outro, qualquer que seja a
  modalidade.
- **Lagna Kendradi:** mesmo primeiro signo e direção do Narayana; os quatro
  kendras, depois os panapharas, depois os apoklimas.
- **Shoola:** do mais forte entre o Lagna e o 7º, sempre para a frente.
  Antardashas a partir do próprio signo da mahadasha, para a frente em signo
  ímpar e para trás em par.
- **Drig:** o 9º, o 10º e o 11º a partir do Lagna, cada um seguido dos três
  signos que ele aspecta (aspecto de signo), para a frente se ele é direto,
  para trás se não. No PL9, quando a conta do signo fica abaixo de 1, o
  número é cortado a oito bits antes de voltar a 1..12, e o signo sai quatro
  adiante; o modo `corrected` volta a conta a 1..12 como ela é.
- **Sthira:** do signo do Brahma, pela ordem do zodíaco. O Brahma: entre o
  Lagna e o 7º, o de mais pontos de signo (o Lagna no empate;
  `docs/spec/dashas/forca-signos.md`, "Pontos"); dos regentes do 6º, do 8º e
  do 12º a partir dele, Saturno de fora, o de mais pontos de planeta (o
  anterior no empate).
- **Niryaana Shoola:** do mais forte entre o 2º e o 8º, um signo depois do
  outro, para a frente em signo ímpar, para trás em par.
- **Navamsha:** do signo do Lagna na Navamsha, se ímpar; se par, do signo
  ímpar do mesmo regente (Leão no lugar de Câncer); para a frente.
- **Padanadhamsa:** do signo, na Navamsha, do regente do Arudha Lagna
  (Parashara: no 1º ou no 7º, o 10º dali); ordem pela modalidade desse signo
  (móvel, consecutiva; fixo, de seis em seis; duplo, por trígonos com grupos
  um signo adiante, e dentro do grupo o 5º antes do 9º), direção pela
  paridade. As antardashas seguem a mesma ordem a partir do signo da
  mahadasha.

## Opções

- **Chara dasha method: Parashara** (`charaMethod: 'parashara'`). Mahadashas
  do mais forte por pontos entre o Lagna e o 7º, um signo depois do outro, na
  direção que o 9º a partir do Lagna dá (como no K.N. Rao). Anos: a contagem
  até o regente, sem dignidade; para Escorpião e Aquário, 12 com os dois
  regentes no signo; com um, até o outro; senão Marte ou Saturno se o signo
  dele tem mais planetas que o do nó; senão o regente cujo signo tem a
  modalidade mais alta (duplo, fixo, móvel); na mesma modalidade, o exaltado,
  depois o que dá mais anos (Marte ou Saturno no empate); mais 1 ano se o
  escolhido está exaltado, menos 1 se debilitado (com os dois no mesmo signo,
  se qualquer um deles está). Antardashas: do mais forte por pontos entre o
  signo e o 7º, para a frente se ele é ímpar, para trás se par; de um signo
  móvel, um depois do outro; de um fixo, de seis em seis; de um duplo, de
  três em três, sete depois de cada quarto (as kendras, depois as do signo
  quatro adiante).
- **Antardashas start from dasha lord** (`charaAntarFromLord`): só no
  Chara de Parashara (no K.N. Rao o PL9 a ignora): a comparação das
  antardashas parte do signo do regente da mahadasha, e não dela.
- **Padanadhamsadasha Method: Iranganti** (`padanadhamsaMethod`): o PL9 dá as
  mesmas datas que com K.N. Rao (o cálculo não distingue os dois valores que a
  opção grava); o `core` também.
- **Rahu's Exaltation: Gemini** (`rahuExaltation: 'gemini'`): nos anos, Rahu
  exaltado em Gêmeos e debilitado em Sagitário, Ketu o contrário; a opção
  acrescenta esses signos: Rahu continua exaltado em Touro e debilitado em
  Escorpião, Ketu o contrário.
- **Mercury Exaltation: anywhere in Virgo** (`mercuryExaltation: 'anywhere'`):
  nos anos, Mercúrio exaltado em toda Virgem.
- **Start of Rashi Antardashas: From Lord** (`antardashaStart: 'lord'`): nos
  sistemas cujas antardashas partem do mais forte do eixo (Narayana, Lagna
  Kendradi, Drig, Niryaana Shoola, Sthira, Navamsha), elas partem do signo do
  regente desse mais forte (Marte para Escorpião, Saturno para Aquário), para a
  frente se ele é ímpar, para trás se par. Não muda o Chara, o Shoola e o
  Padanadhamsa.

## Origem

Medido nos relatórios impressos pelo PL9 (modelo de impressão RAS: Chara #1 a
#3, Sthira, Niryaana Shoola #1 e #2, Drig, Navamsha, Narayana e Lagna
Kendradi #1 e #2, Shoola, Padanadhamsa, e a worksheet "34. Dashas - Rashi
based") e lido no executável onde as medidas não decidiam (anos do Chara,
direção do Narayana e do Lagna Kendradi, ordem do Drig); o Sthira, o Chara de
Parashara e as opções, lidos no executável e conferidos nos relatórios
impressos com cada opção (30 mapas por alternativa). Contagem na
bancada: `docs/relatorios/conformidade-posicoes.md`.

## Defeitos do PL9 encontrados

- O relatório "Niryaana Shoola Dasha" imprime o Drig. O Niryaana Shoola foi
  medido na célula da worksheet.
- A segunda volta do Narayana, do Lagna Kendradi e do Drig: nas páginas #2
  dos relatórios ela sai embaralhada (períodos fora de ordem, durações que
  não fecham); nas células da worksheet ela parece ordenada, a maioria das
  mahadashas com os anos da primeira volta, algumas com 12 menos esses anos
  (a regra clássica da segunda volta) e algumas com nenhum dos dois. Não foi
  reproduzida; o modo `corrected` dá a regra clássica.
- O corte a oito bits na ordem do Drig, corrigido no modo `corrected`.

## O que não foi verificado

- Sree Lagna Kendradi: lido no executável (signo do Sree Lagna, saldo pelo
  grau dele no signo, kendras, voltas seguidas pelo mesmo passo), mas as
  antardashas das voltas seguintes ainda não fecham com as células da
  worksheet.
- A segunda volta do Narayana, do Lagna Kendradi e do Drig: o modo `pl9`
  não a dá nas tabelas, e a do `corrected` não tem gabarito nelas. A cadeia
  do Narayana no instante (`docs/spec/tempo/transitos.md`) tem a segunda
  volta com 12 anos menos os da primeira, conferida em 296 instantes.
- No Niryaana Shoola, só as 15 linhas da célula da worksheet: a primeira
  mahadasha impressa ali, as suas antardashas e o começo da seguinte.
- Mais de dois níveis nas tabelas (a cadeia do Narayana no instante tem
  cinco, conferidos), e o Chara de Parashara com 8 karakas.
