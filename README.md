# Ganaka

Um motor de astrologia védica (Jyotish) de código aberto, em TypeScript: mapa e vargas, dashas,
forças (Shadbala, Bhava Bala, Ashtakavarga, Vimshopaka), trânsitos, panchanga, Varshaphala e
Muhurta. Também roda como serviço de cálculo HTTP, para outros apps e sites integrarem.

*An open-source Vedic astrology (Jyotish) engine in TypeScript, also available as an HTTP
calculation service. The documentation is in Portuguese.*

## Conferido contra o Parashara's Light 9

Cada área foi reproduzida e conferida contra as impressões do Parashara's Light 9 (PL9) em 135
mapas de referência (gerados, não de pessoas reais), em várias datas. A bancada que faz essa
conferência está neste repositório (`packages/oracle`), com os valores lidos das impressões
(as fixtures), e qualquer um pode rodá-la. O que coincide, o que difere e por quê está em
`docs/spec/`.

O motor tem dois modos:

- **`corrected`** (o padrão): o cálculo do PL9 com as correções de defeitos comprovados, cada
  uma descrita e justificada em `docs/spec/correcoes.md`;
- **`pl9`**: reproduz o PL9, inclusive esses defeitos, para quem precisa dos mesmos números.

O projeto não é afiliado ao PL9 nem aos seus autores. O nome PL9 aparece aqui só como a referência
da conferência.

## Pacotes

| Pacote | O que faz |
|---|---|
| `packages/ephemeris` | A astronomia, sobre a Swiss Ephemeris |
| `packages/core` | O cálculo védico, em funções puras |
| `packages/api` | O serviço de cálculo HTTP (veja `docs/spec/api.md`) |
| `packages/cli` | A linha de comando |
| `packages/oracle` | A bancada de conferência e as fixtures |

## Começar

Requisitos: Node 22 e pnpm.

```bash
pnpm install
pnpm test
pnpm typecheck
```

O mapa de um nascimento, pela linha de comando (`nascimento.json` com `utc`, `latitude` e
`longitudeEast`):

```bash
pnpm --silent --filter @reverse/cli chart nascimento.json --format json
```

O serviço de cálculo: `docs/spec/api.md`.

## Licença

AGPL-3.0-or-later (arquivo `LICENSE`). Quem oferecer este motor, ou uma versão modificada dele, como
serviço em rede precisa oferecer o código-fonte aos usuários desse serviço.

A astronomia usa a Swiss Ephemeris, da Astrodienst AG, que tem licença dupla: AGPL ou uma licença
profissional paga. Usar este motor sob a AGPL está coberto pela AGPL da Swiss Ephemeris; outros usos
podem exigir a licença profissional da Astrodienst.
