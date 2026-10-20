# Fonte das efemérides

Verificado em 2026-10-12.

## Decisão

O pacote `ephemeris` usa o pacote npm `swisseph-wasm` na versão 0.1.0, que
embute a Swiss Ephemeris 2.10.03 compilada para WebAssembly.

## Licença

`swisseph-wasm` é GPL-3.0-or-later. A GPL versão 3 permite combinar o código
com um trabalho sob AGPL versão 3, que é a licença deste projeto. A Swiss
Ephemeris em si é oferecida sob AGPL ou licença comercial; este projeto usa
a primeira.

## Dados embutidos e faixa de datas

O pacote traz os arquivos `sepl_18`, `semo_18` e `seas_18` (planetas, Lua e
asteroides principais), que cobrem de 1800 a 2400. A faixa com garantia
deste projeto, 1801 a 2048, está inteira dentro deles.

## Comportamento fora da faixa

Pedida uma data fora dos arquivos embutidos, a biblioteca devolve valores do
modelo analítico de menor precisão sem sinalizar. Observado para os anos 1700
e 2500: o cálculo retorna normalmente. Por isso o pacote `ephemeris` recusa,
com erro tipado, qualquer data fora de 10 de janeiro de 1800 a 20 de
dezembro de 2399.

## Modo sideral e nutação

A longitude no modo sideral da biblioteca não é igual à longitude tropical
menos o ayanamsha: o modo sideral deixa a nutação de fora. Em 1º de julho de
2000 a diferença entre as duas contas é de cerca de 15 segundos de arco. As
posições exportadas pelo PL9 concordam com o modo sideral, a menos de um
segundo de arco, e não com a subtração simples. O pacote expõe as duas
grandezas separadamente.

## Node e navegador

A longitude tropical da Lua em 1º de julho de 1801, 2000 e 2048, ao meio-dia
em tempo universal, foi calculada em Node 24 e num navegador baseado em
Chromium. Os três valores são idênticos, dígito por dígito, nos dois
ambientes.

Para o navegador carregar o módulo com o Vite, o pacote precisa ficar fora
do pré-empacotamento de dependências (`optimizeDeps.exclude`); do contrário o
arquivo WebAssembly não é encontrado.

## O que não foi verificado

- Outros navegadores (Firefox, Safari).
- Outros corpos e outras funções além da longitude da Lua, na comparação
  entre Node e navegador.
- Se a versão 2.10.03 e a versão embutida no PL9 diferem em algum resultado
  dentro da faixa.
