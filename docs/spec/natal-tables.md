# Natal tables

Tables of PL9's natal pages that are built from the chart alone, with no rule of their own beyond the ones they
reuse. Code: `packages/core/src/natalTables.ts`; endpoints in [api.md](api.md).

- **Aspects** (`/v1/aspects`): `value[on][from]` is the graded aspect, in virupas from 0 to 60, that `from` casts on
  `on`, by [the aspect curve](strengths/aspects.md) at the angle from one to the other; rows and columns are the nine
  planets, Sun to Ketu. PL9's "Aspects on planets" page prints these values truncated. The page also prints a sign
  fraction (1/4 to 4/4) and colours each cell; neither is computed here yet.
- **Taras** (`/v1/tarabala`): `cells[row][column]` is the tara of the row's nakshatra counted from the column's, for
  the Lagna and the nine planets, as PL9's "Nakshatra spatial matrix".
- **Lordships** (`/v1/lordships`): for each house of a varga, counted from that varga's Lagna sign, its sign's lord and
  the house the lord occupies in the same varga.
- **Dispositors** (`/v1/dispositors`): for each planet, the lords of the signs it occupies in the Shad Varga (D1, D2,
  D3, D9, D12, D30) and how many times each, the most first and ties in the planets' order. PL9 lists the ties in an
  order of its own.
- **Sunrise chart** (`/v1/sunrise-chart`) and **Panch Pakshi** (`/v1/panch-pakshi`) return the core's
  `computeSunriseChart` and `panchPakshi`; see [time/panchanga.md](time/panchanga.md).
