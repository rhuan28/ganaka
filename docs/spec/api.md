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
| `RATE_LIMITS` | no | a limit of its own for some clients, `client:n,client:n`, with the client names of `API_KEYS` (for example `app:600` for an app that serves many people through one key) |

The engine's version is the `version` of the repository's root `package.json`. It goes up with every deployment that
can change a number, so that a client that keeps results can tell old ones from new ones.

## Requests

- Each request carries the key in the `x-api-key` header. Open without a key are `GET /health`,
  `GET /openapi.json` (the full API description) and `GET /docs` (the same description, browsable).
- The endpoints accept `POST` with a JSON body:
  - chart: `/v1/chart`;
  - dashas: `/v1/dashas`;
  - strengths: `/v1/strengths/shadbala`, `/v1/strengths/bhava-bala`, `/v1/strengths/ashtakavarga`,
    `/v1/strengths/vimshopaka`;
  - time: `/v1/transits`, `/v1/panchanga`, `/v1/varshaphala`, `/v1/muhurta`, `/v1/panch-pakshi` (with `at`);
    `/v1/transits` with `vargas` (any of `D9` and `D10`) adds each varga's table of the transit as `vargaTables`;
  - solar returns: `/v1/varshaphala` with `period` (`year` by default, `month` or `day`) casts the monthly or daily
    return of the year, its month and day of age read from `at` or given as `months` (0 to 11) and `days` (0 to 29)
    with `years`, and `offset` whole periods after it (negative before); the answer says which in `period`;
  - Tithi Pravesh: `/v1/tithi-pravesh`, with `birth`, `at` and optionally `offset` (years), answering the instant of
    the Tithi Pravesh of the year of age that holds `at`;
  - transit calendar: `/v1/transits/month`, with `birth` and `at`, answering PL9's transit calendar and kaksha calendar
    of the civil month of `at`, in its clock;
  - year's ingresses: `/v1/transits/year`, with `at`, answering each planet's sign at the start of the civil year of
    `at` and its sign ingresses in the year;
  - natal Sahams: `/v1/sahams`, with `birth`, answering the Sahams of the birth chart;
  - events: `/v1/events`, with `birth` and up to 20 `events`, each `{ jdUt, utcOffsetHours }`, answering the dashas
    running at each as PL9's Events pages read them (the event's clock taken as UT);
  - natal tables (see [natal-tables.md](natal-tables.md)): `/v1/sunrise-chart`, `/v1/aspects`, `/v1/tarabala`,
    `/v1/lordships` (with `varga`, one of the sixteen classical vargas), `/v1/dispositors`, `/v1/house-aspects` (by
    house, the aspect of each planet on it and on it and its lord, as whole percents);
  - natal yogas (see [yogas.md](yogas.md)): `/v1/yogas`, answering `{ yogas, missing }`. `yogas` lists every
    yoga the engine knows with `id`, `family`, `present` and, when present, the `planets` that form it and their
    `houses` from the Lagna. `missing` lists those it cannot decide for this chart, with the `reason`.
    `/v1/yoga-context` answers instead the facts the yogas read, for a client that evaluates yogas of its own: the
    planets (longitude, speed, sign, nakshatra, dignity, combustion), the sixteen classical vargas (the Lagna's sign,
    each planet's sign, longitude and dignity there, and the graded aspects between planets), the natural and
    functional natures, the Shadbala ratio, the chara karakas, the signs of the special points, day or night birth
    and the weekday; and per planet its varga dignity, its Shayanadi state and its Shadvarga Vimshopaka. It holds no
    rule of any yoga, and takes only `birth` and `options`;
  - planet data (see [planet-info.md](planet-info.md)): `/v1/planet-info`, the columns of PL9's planet tables per
    body (declination, Kranti, speed against the mean, combustion, the Deeptadi and Shayanadi avasthas, Hemmed, final
    dispositor, argala, the navamsha number and age, the Shashtiamsha, and the others the spec lists), the deity of
    each point in the sixteen classical vargas, the degrees within the equal vargas, the 108 navamshas numbered from the
    Lagna's and each point's pada syllable, `nama`, and the nine's natures, `natures` (see [natal-tables.md](natal-tables.md)), the natural relations of the nine, and `missing` for what a
    chart cannot give. Its own options go in `planetInfo`: `anka`, PL9's Anka value, an integer from 1 to 5 (1 when
    absent; the answer says which was used);
  - compatibility (see [compatibility.md](compatibility.md)): `/v1/compatibility`, with `native` and `partner`, each
    `{ birth, sex }` (`male` or `female`), answering the Ashtakoota, the Dashkoota, the distances between the two charts'
    points, each chart's Mangala Dosha and the reasons for its cancellation between the two (`mangalaCancellations`); its own options go in `compatibility`: `point`, `moon` (default) or `lagna`;
  - rectification (see [rectification.md](rectification.md)): `/v1/rectification`, with `birth`, answering the
    Rectification Tool's rows (the moved instant, the Lagna's and the Navamsha's signs, the dasha at each event); its own
    options go in `rectification`: `zoom` (0 to 5), `before`, `after`, `events`, `system`, `levels`; and
    `/v1/lagna-steps`, with `birth`, answering where the time tool steps by the Ascendant and the Navamsha, and each
    classical varga's Lagna window;
  - the Krishnamurti chart (see [kp.md](kp.md)): `/v1/kp`, with `birth`, answering the Placidus cusps with their KP
    lords, the significators of each house, the houses each planet signifies by strength, the ruling planets, Fortuna
    and the dasha balance; its own options go in `kp`: `horary`, a number from 1 to 249 for a horary chart;
  - remedies (see [remedies.md](remedies.md)): `/v1/remedies`, with `birth`, answering the Sade Sati and the Laghu
    Kalyani Dhayya and Kantaka Saturn (three cycles each, every stay with its Julian days and span), the Mangala Dosha
    and the lords whose gems PL9 recommends;
  - ephemeris (PL9's Export Ephemeris): `/v1/ephemeris`, with `from` (an instant and a place, as `birth`), `to` (an
    instant: `jdUt` or `utc`), `stepDays` (at least one minute) and optionally `points` (any of the chart's points; the
    nine and the three outer planets by default), answering a row per step with each point's position as in
    `/v1/chart`, and `missing` where a point is not defined at the place. The last row is the last step not past `to`; a
    table holds at most 2,000 rows;
  - several of the above at once: `/v1/batch` (below);
  - chart files saved by Parashara's Light 9: `/v1/import/pl9` (below);
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
  etc. The mode is `corrected` by default; `fidelity: "pl9"` reproduces PL9. `natures` changes PL9's tables of natural
  and functional natures, as `{ "natural": { "moon": "lessThanThirdFull" }, "functional": { "aries": { "sun":
  "neutral" } } }` (see [yogas.md](yogas.md)).
- The options of each area have their own object: `dasha`, `shadbala`, `ashtakavarga`, `yogas`, `planetInfo` and `compatibility`
  (`functionalNature`, PL9's "Use functional mal/ben", and `sex`, `male` by default).
- Unknown fields are rejected, so that a wrong name is never silently ignored.
- Every response carries the `X-Source-Code` header with the address of the source code, and the
  `X-Engine-Version` header with the engine's version (`GET /health` answers it too). A client that caches results
  should put this version in its cache key.

### Several calculations at once

`POST /v1/batch` takes `{ "requests": [{ "id", "path", "body" }] }`, from 1 to 20 requests, and answers
`{ "results": [{ "id", "status", "body" }] }` in the same order.

- `path` is one of the calculation endpoints above (`/v1/chart`, `/v1/dashas`, …), and `body` is what that endpoint
  takes. Each `body` in the answer is exactly what the endpoint alone answers, an error included: a failing request
  does not stop the others.
- The ids must differ. A batch inside a batch, a path outside `/v1` or an unknown path refuses the whole batch (400).
- The whole batch counts as one request against the key's limit.

### Chart files from Parashara's Light 9

`POST /v1/import/pl9` takes `{ "files": [{ "name", "text" }] }`, from 1 to 1000 files, each text up to 200 000
characters, and answers `{ "results": [...] }` in the same order. Each result is either
`{ "name", "ok": true, "chart" }` or `{ "name", "ok": false, "error" }`, so one broken file does not stop the others.

The chart holds:
- `firstName`, `lastName`, `gender` and `rodden`, as the file has them;
- `birth`: `jdUt`, `latitude`, `longitudeEast`, `utcOffsetHours` (the clock's offset from UT, east positive,
  daylight saving included), `dstHours` (the daylight saving part) and `place` (`city`, `state`, `country`);
- `events`: the same fields as the birth, plus `name`, `description`, `classification`, `notes` and `rodden`;
- `notes`, `tags` (the file's tags, split at commas and semicolons) and `family` (the family and contact fields that
  are filled).

How the file is read:
- The file keeps local time as a Julian day. It keeps the zone in hours, west positive like its longitude, and the
  daylight saving in hours ahead of the zone. The answer turns them into UT and east-positive values.
- PL9 keeps two events of its own in every file, "Today" (the first) and "Muhurta" (the second), and rewrites them
  itself. They are left out.
- The time zone stays as the file has it. Nothing goes through the atlas again, so an imported chart gives the result
  it gave in PL9.

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
