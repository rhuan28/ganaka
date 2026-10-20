# The calculation service (API)

The `packages/api` package serves the engine over HTTP. The service only receives requests and returns, in JSON and
without rounding, what the `core` calculates. It does not redo any calculation and does not resolve time zones.

## Running

Without a container:

```bash
API_KEYS=dev:<key> SOURCE_URL=https://example.org/source pnpm --filter @reverse/api start
```

With a container, from the repository root:

```bash
docker build -f packages/api/Dockerfile -t calc-service .
docker run -p 8080:8080 -e API_KEYS=dev:<key> -e SOURCE_URL=https://example.org/source calc-service
```

| Variable | Required | What it is |
|---|---|---|
| `API_KEYS` | yes | the accepted keys, `client:key,client:key` |
| `SOURCE_URL` | yes | where the service's source code is (the AGPL requires that whoever uses the service can obtain it) |
| `PORT` | no | the port, 8080 by default |
| `RATE_LIMIT_PER_MINUTE` | no | requests per minute per key, 120 by default |

## Requests

- Each request carries the key in the `x-api-key` header. Open without a key are `GET /health`,
  `GET /openapi.json` (the full API description) and `GET /docs` (the same description, browsable).
- The endpoints accept `POST` with a JSON body:
  - chart: `/v1/chart`;
  - dashas: `/v1/dashas`;
  - strengths: `/v1/strengths/shadbala`, `/v1/strengths/bhava-bala`, `/v1/strengths/ashtakavarga`,
    `/v1/strengths/vimshopaka`;
  - time: `/v1/transits`, `/v1/panchanga`, `/v1/varshaphala`, `/v1/muhurta`.
  - atlas: `GET /v1/atlas/cities?q=<name>&country=<ISO code>&limit=<1 to 50>` (GeoNames cities,
    CC BY 4.0 license, by the start of the name, accent- and case-insensitive) and `POST /v1/atlas/local` with
    `{ "timeZone": "America/Sao_Paulo", "local": "2019-02-16T23:30:00" }`. The latter returns the
    `status` (`ok`, `ambiguous` for the repeated hour at the end of daylight saving time, `nonexistent` for the
    skipped hour at its start), the readings (instant, offset, daylight saving time, abbreviation), the canonical
    zone and the IANA database version. It is this endpoint that resolves the time zone; the calculation endpoints
    receive the offset already resolved.
- The birth (`birth`), and the instant `at` where there is one, is an object with `jdUt` (Julian day UT) or
  `utc` (`2000-01-01T12:00:00Z`), plus `latitude`, `longitudeEast` and, if applicable, `utcOffsetHours`
  (the clock offset, already resolved).
- The engine options go in `options`, with the `core` names: `ayanamsha`, `fidelity`, `gulika`
  etc. The mode is `corrected` by default; `fidelity: "pl9"` reproduces PL9.
- The options of each area have their own object: `dasha`, `shadbala` and `ashtakavarga`.
- Unknown fields are rejected, so that a wrong name is never silently ignored.
- Every response carries the `X-Source-Code` header with the address of the source code.

## Errors

The body is always `{ "error": { "code", "message", "option"? } }`.

| Situation | Status | `code` |
|---|---|---|
| malformed birth or request | 400 | `invalid-input`, `invalid-request` |
| option with a wrong name or value | 400 | `invalid-option` (with `option`) |
| option the engine does not implement yet | 400 | `option-not-implemented` |
| unknown time zone | 400 | `invalid-input` |
| no valid key | 401 | `unauthorized` |
| no Lagna (beyond the polar circle) | 422 | `lagna-undefined` |
| no sunrise | 422 | `sunrise-undefined` |
| a search that did not find the crossing | 422 | `crossing-not-found` |
| over the request limit | 429 | `rate-limited` |
| internal failure | 500 | `internal` |

Where the `core` result carries a `missing` list (for example, the chart without houses beyond the polar
circle), the response is 200 and the list goes in the body.
