# O serviço de cálculo (API)

O pacote `packages/api` põe o motor no ar por HTTP. O serviço só recebe pedidos e devolve, em JSON e
sem arredondar, o que o `core` calcula. Não refaz cálculo e não resolve fusos horários.

## Rodar

Sem contêiner:

```bash
API_KEYS=dev:chave SOURCE_URL=https://exemplo.org/codigo pnpm --filter @reverse/api start
```

Com contêiner, a partir da raiz do repositório:

```bash
docker build -f packages/api/Dockerfile -t calc-service .
docker run -p 8080:8080 -e API_KEYS=dev:chave -e SOURCE_URL=https://exemplo.org/codigo calc-service
```

| Variável | Obrigatória | O que é |
|---|---|---|
| `API_KEYS` | sim | as chaves aceitas, `cliente:chave,cliente:chave` |
| `SOURCE_URL` | sim | onde está o código-fonte do serviço (a AGPL pede que quem usa o serviço possa obtê-lo) |
| `PORT` | não | a porta, 8080 por padrão |
| `RATE_LIMIT_PER_MINUTE` | não | requisições por minuto por chave, 120 por padrão |

## Pedidos

- Cada pedido leva a chave no cabeçalho `x-api-key`. Ficam abertos sem chave `GET /health`,
  `GET /openapi.json` (a descrição completa da API) e `GET /docs` (a mesma descrição, navegável).
- Os endpoints aceitam `POST` com corpo JSON:
  - mapa: `/v1/chart`;
  - dashas: `/v1/dashas`;
  - forças: `/v1/strengths/shadbala`, `/v1/strengths/bhava-bala`, `/v1/strengths/ashtakavarga`,
    `/v1/strengths/vimshopaka`;
  - tempo: `/v1/transits`, `/v1/panchanga`, `/v1/varshaphala`, `/v1/muhurta`.
- O nascimento (`birth`), e o instante `at` onde houver, é um objeto com `jdUt` (dia juliano UT) ou
  `utc` (`2000-01-01T12:00:00Z`), mais `latitude`, `longitudeEast` e, se for o caso, `utcOffsetHours`
  (o deslocamento do relógio já resolvido).
- As opções do motor vão em `options`, com os nomes do `core`: `ayanamsha`, `fidelity`, `gulika`
  etc. O modo é `corrected` por padrão; `fidelity: "pl9"` reproduz o PL9.
- As opções de cada área têm o seu próprio objeto: `dasha`, `shadbala` e `ashtakavarga`.
- Campos desconhecidos são recusados, para que um nome errado nunca seja ignorado em silêncio.
- Toda resposta traz o cabeçalho `X-Source-Code` com o endereço do código-fonte.

## Erros

O corpo é sempre `{ "error": { "code", "message", "option"? } }`.

| Situação | Status | `code` |
|---|---|---|
| nascimento ou pedido malformado | 400 | `invalid-input`, `invalid-request` |
| opção com nome ou valor errado | 400 | `invalid-option` (com `option`) |
| opção que o motor ainda não implementa | 400 | `option-not-implemented` |
| sem chave válida | 401 | `unauthorized` |
| sem Lagna (além do círculo polar) | 422 | `lagna-undefined` |
| sem nascer do sol | 422 | `sunrise-undefined` |
| uma busca que não encontrou o cruzamento | 422 | `crossing-not-found` |
| acima do limite de requisições | 429 | `rate-limited` |
| falha interna | 500 | `internal` |

Onde o resultado do `core` traz uma lista `missing` (por exemplo, o mapa sem casas além do círculo
polar), a resposta é 200 e a lista vai no corpo.
