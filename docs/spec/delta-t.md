# PL9's Delta T

## Rule

From 1801 to 2048, PL9 uses the Delta T of **Swiss Ephemeris 2.00.00**. The `core`
reproduces it with the same table and the same algorithm.

Let `year = 2000 + (Julian day UT − 2451545) / 365.2425`.

**From 1620 to 2019** (within the table):

1. Table of one value per year, in seconds, from 1620.0 to 2019.0. The values
   up to 2013 are observed; those from 2014 to 2019 (67.267; 67.90; 68.40; 69.00;
   69.50; 70.00) were that version's extrapolation.
2. Bessel interpolation over the annual values, up to fourth-order differences
   when there are enough neighbours in the table; at the ends the order drops.
3. For `year < 1955`, add `−0.000091 × (n + 26) × (year − 1955)²`, with
   `n = −25.82`, the Moon's secular tidal acceleration adopted in that version.
   The table before 1955 assumes `n = −26`.

**After 2019:**

    b  = (year − 1820) / 100
    ΔT = −20 + 31 b²

and, up to 2119, a linear term is added that joins the parabola to the last value of the
table without a jump:

    b₂ = (2019 − 1820) / 100
    ΔT += (−20 + 31 b₂² − 70.00) × (year − 2119) / 100

**Before 1620** the `core` does not compute: it rejects the date. It is outside the project's
ephemeris data.

## Reference values

| Instant (UT) | ΔT (s) |
|---|---|
| 21 Mar 1805, 0h | 12.2075 |
| 1 Jan 1850, 0h | 6.9193 |
| 1 Jan 1900, 0h | −2.7703 |
| 5 Apr 1950, 0h | 29.2593 |
| 1 Jul 2000, 12h | 63.9686 |
| 1 Jul 2018, 0h | 69.7480 |
| 1 Jan 2020, 0h | 71.5630 |
| 1 Jul 2044, 0h | 111.8285 |

## Origin

Public source code of Swiss Ephemeris 2.00.00 (AGPL licence), file
`swephlib.c`, the Delta T function for dates from 1620 onward, and the standard tidal
constant from the file `sweph.h` of the same version. The `core` code is a
TypeScript rewrite of that algorithm; the table of annual values is the
same.

The source used was the copy of that code distributed with a public Node
binding package (`swisseph` 0.5.3, which declares itself version 2.00.00). The
version tags of the official GitHub repository were of no use: the
files tagged 2.00 to 2.04 are identical to each other and carry an older
table.

## How the version was arrived at

For each of the 290 reference charts, PL9's effective Delta T was
obtained as the Delta T of Swiss Ephemeris 2.10 plus the time offset
of the fit described in `docs/reports/ephemeris-measurement.md`. Comparisons:

| Candidate | Largest difference over the 290 charts |
|---|---|
| Delta T text table that ships with PL9 | 1.24 s (up to 1993, where it ends) |
| Algorithm above with the version 2.07 table and n = −25.80 | 0.50 s (after 2014) |
| Algorithm above with the version 2.00.00 table and n = −25.826 | 0.016 s |
| **Algorithm above with the version 2.00.00 table and n = −25.82** | **0.008 s** |

The difference of 0.008 s is within the uncertainty of the fit itself and is equivalent
to 0.004" on the Moon.

The clue to the version is the extrapolated values from 2014 to 2019, which change
with each version of the library.

## Consequence

For an instant in universal time, PL9 and the current Swiss Ephemeris
compute different dynamical times. The `core` evaluates the ephemerides at the
instant

    UT + (PL9's ΔT − library's ΔT) / 86400 days

which leads to the same dynamical time that PL9 uses.

## What was not verified

- That PL9's own ephemeris was in fact generated with Swiss Ephemeris
  2.00.00. What was shown is that the Delta T matches.
- PL9's behaviour outside 1801–2048, where it uses another computation
  path.

## In corrected mode

The `corrected` mode does not use this Delta T: it evaluates the ephemerides at the
given instant, with the Delta T of the current version of the library. PL9's table ends
in 2014, and its extrapolation departs from the current one by more than 44 seconds in
2048, which shifts the Moon by 26". From 1950 to 2010 the difference on the Moon does not
exceed 0.15". See `corrections.md`.
