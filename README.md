# Ganaka

An open-source Vedic astrology (Jyotish) engine in TypeScript: chart and vargas, dashas, strengths
(Shadbala, Bhava Bala, Ashtakavarga, Vimshopaka), transits, panchanga, Varshaphala and Muhurta, plus
an atlas of cities and historical time zones. It also runs as an HTTP calculation service, for other
astrology apps and sites to integrate.

## Checked against Parashara's Light 9

Every area was reproduced and checked against the printouts of Parashara's Light 9 (PL9) for 135
reference charts (generated, not real people), on several dates. The bench that runs this check is in
this repository (`packages/oracle`), with the values read from the printouts (the fixtures), and
anyone can run it. What matches, what differs and why is written in `docs/spec/`; the bench's latest
results are in `docs/reports/`.

The engine has two modes:

- **`corrected`** (the default): PL9's calculation with its proven defects corrected, each one
  described and justified in `docs/spec/corrections.md`;
- **`pl9`**: reproduces PL9, defects included, for those who need the same numbers.

The project is not affiliated with PL9 or its authors. The name PL9 appears here only as the
reference of the check.

## Packages

| Package | What it does |
|---|---|
| `packages/ephemeris` | The astronomy, on the Swiss Ephemeris |
| `packages/core` | The Vedic calculation, in pure functions |
| `packages/atlas` | Cities and time zones with the world's history (see `docs/spec/atlas.md`) |
| `packages/api` | The HTTP calculation service (see `docs/spec/api.md`) |
| `packages/cli` | The command line |
| `packages/oracle` | The bench and its fixtures |

## Getting started

Requirements: Node 22 and pnpm.

```bash
pnpm install
pnpm test
pnpm typecheck
```

A birth chart from the command line (`birth.json` with `utc`, `latitude` and `longitudeEast`):

```bash
pnpm --silent --filter @reverse/cli chart birth.json --format json
```

The calculation service: `docs/spec/api.md`.

## License

AGPL-3.0-or-later (file `LICENSE`). Whoever offers this engine, or a modified version of it, as a
network service must offer its source code to the users of that service.

The atlas's cities come from [GeoNames](https://www.geonames.org), under the CC BY 4.0 license; the
time zones from the IANA time zone database, in the public domain.

The astronomy uses the Swiss Ephemeris, by Astrodienst AG, which is dual-licensed: AGPL or a paid
professional license. Using this engine under the AGPL is covered by the Swiss Ephemeris's AGPL; other
uses may require Astrodienst's professional license.
