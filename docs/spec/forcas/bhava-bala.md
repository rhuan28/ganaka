# Bhava Bala

Código: `packages/core/src/strengths/bhavaBala.ts` e `strengths/compute.ts`
(`computeBhavaBala`). Testes: `packages/core/test/bhavaBala.test.ts`.

A força de cada casa como o PL9 a calcula, lida no executável e conferida nas
páginas "Shad Bala and Bhava Bala" e "22. Bhava Bala" dos mapas da bancada. Em
virupas; 60 virupas são um rupa. Recebe as cinco opções do Shadbala (o senhor e
o Drishti mudam com elas).

## As casas

Doze casas iguais a partir do Lagna: a casa *k* é o ponto Lagna + 30(*k* − 1),
e o seu signo é o do ponto. O relatório mostra o grau inteiro do ponto dentro
do signo (o mesmo nas doze casas). Os planetas ficam nas casas por signo: a casa
de um planeta é a contagem do signo do Lagna ao signo do planeta.

## As cinco partes

- **Senhor:** o total do Shadbala do senhor do signo da casa. Escorpião tem
  Marte; Aquário, Saturno.
- **Dig:** a distância do ponto da casa ao ponto da casa onde o signo é mais
  fraco, dobrada a 0–180 e dividida por 3. Onde o signo é mais fraco, pelo seu
  tipo:
  - humanos (Gêmeos, Virgem, Libra, Aquário e a primeira metade de
    Sagitário): a 7ª casa;
  - aquáticos (Peixes e a segunda metade de Capricórnio): a 10ª;
  - quadrúpedes (Áries, Touro, Leão, a segunda metade de Sagitário e a
    primeira de Capricórnio): a 4ª;
  - insetos (Câncer e Escorpião): a 1ª.

  A exatos 15° de Sagitário ou de Capricórnio nenhum tipo se aplica: o PL9 lê
  um valor não definido; o `core` dá 0.
- **Drishti:** os aspectos graduados (`aspectos.md`) dos sete planetas sobre o
  ponto da casa, como no Drik Bala (benéficos somam, maléficos subtraem; um
  quarto de cada, Júpiter e Mercúrio inteiros pela opção; a Lua benéfica
  crescente; Mercúrio pela sua opção).
- **Planetas na casa:** Mercúrio e Júpiter somam 60 cada um; o Sol, Marte e
  Saturno tiram 60 cada um; a Lua e Vênus não contam.
- **Dia e noite:** 15 para o signo da casa quando ele é forte na hora do
  nascimento: de dia, Gêmeos, Leão, Virgem, Libra, Escorpião e Aquário; de noite
  (pelo dia do Shadbala, `shadbala.md`), Áries, Touro, Câncer, Sagitário e
  Capricórnio. Até 0,05 dia depois do nascer ou do pôr do sol do Shadbala, só
  Peixes recebe os 15.

Total = senhor + Dig + Drishti + planetas + dia/noite; rupas = total / 60.

## O relatório

As cinco partes saem truncadas em direção a zero; o total e os rupas,
arredondados. Na memória do PL9 (REF 0010) os valores coincidem com os do `core`
a 1e-4.

## Conferência

`pnpm --filter @reverse/oracle verify`, seção "Bhava Bala": cada parte, o total e
os rupas das doze casas, nos 135 mapas e nos cinco conjuntos de opções do
Shadbala, com o arredondamento do relatório; os mapas fora das séries do Cheshta
listados e não conferidos (o senhor depende do Shadbala).
