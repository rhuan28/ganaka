# @reverse/atlas

Cities and time zones with the world's history, without any external service.

## Sources and licenses

- **Time zones:** the IANA time zone database, version `2026b`, in `tzdata/2026b/`. It is in the public
  domain (see `tzdata/2026b/LICENSE`). The package compiles the database's text with `backzone`
  included, so that every zone keeps its own history before 1970.
- **Cities:** [GeoNames](https://www.geonames.org), license
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data in `data/` is derived from
  `cities1000.txt` (cities of 1000 people or more), `admin1CodesASCII.txt` and `countryInfo.txt`,
  downloaded on 2026-10-20 and reduced by `scripts/build-cities.ts`: up to eight other names per city,
  in Latin script only, and the canonical IANA zone.

## Rebuilding the data

```bash
pnpm tsx packages/atlas/scripts/build-cities.ts <folder with cities1000.txt, admin1CodesASCII.txt and countryInfo.txt>
```

For a new version of the IANA database, keep the version's files in `tzdata/<version>/` and change
`TZ_VERSION` in `src/tz.ts`.
