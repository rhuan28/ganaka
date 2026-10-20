# Lagna

## Rule

PL9 calculates the Lagna by closed formulas, without going through the ephemerides.
With `T` in Julian centuries since J2000, counted in the given universal time:

1. **Greenwich mean sidereal time**, in degrees:
   `280.46061837 + 360.98564736629 × (Julian day − 2451545) + 0.000387933 T² − T³ / 38710000`.
2. **Mean obliquity**, in degrees:
   `23.4392911111 + (−46.815 T − 0.00059 T² + 0.001813 T³) / 3600`.
3. **Short nutation**, in arcseconds, with four terms:
   `−17.2 sin Ω − 1.322 sin 2L − 0.23 sin 2L' + 0.21 sin 2Ω`, where
   `Ω = 125.04452 − 1934.136261 T + 0.0020708 T² + T³ / 450000`,
   `L = 280.4665 + 36000.7698 T` and `L' = 218.3165 + 481267.8813 T`, in degrees.
4. **Local sidereal time**: mean sidereal time, plus the short nutation times the
   cosine of the mean obliquity, plus the geographic longitude (east
   positive).
5. **Ascendant**, with the **mean** obliquity:
   `atan2(cos θ, −(sin θ cos ε + tan φ sin ε))`, where `θ` is the local sidereal
   time, `ε` the obliquity and `φ` the geographic latitude.
6. **Lagna** = ascendant − long nutation − ayanamsha.

The **long nutation** of step 6 is not that of step 3. It is a series of thirteen
terms, in units of 0.0001", with the arguments in degrees:

| Argument | Coefficient |
|---|---|
| Ω | −171996 − 174.2 T |
| 2F − 2D + 2Ω | −13187 − 1.6 T |
| 2F + 2Ω | −2274 − 0.02 T |
| 2Ω | 2062 + 0.2 T |
| M | 1426 − 3.4 T |
| M' | 712 + 0.1 T |
| M + 2F − 2D + 2Ω | −517 + 1.2 T |
| 2F + Ω | −386 − 0.4 T |
| M' + 2F + 2Ω | −301 |
| −M + 2F − 2D + 2Ω | 217 − 0.5 T |
| M' − 2D | −158 |
| 2F − 2D + Ω | 129 + 0.1 T |
| −M' + 2F + 2Ω | 123 |

with

- `M = 357.52772 + 35999.05034 T − 0.0001603 T² − T³ / 300000` (mean anomaly of the Sun),
- `M' = 134.96298 + 477198.867398 T + 0.0086972 T² + T³ / 56250` (mean anomaly of the Moon),
- `D = 297.85036 + 445267.11148 T − 0.0019142 T² + T³ / 189474` (mean elongation),
- `F = 93.27191 + 483202.017538 T + 0.0086972 T² + T³ / 327270` (argument of latitude),
- `Ω` as in step 3.

These are the thirteen largest terms of the 1980 nutation series, in the form in which
they appear in the tables of astronomical algorithm books. At two points
PL9 differs from the published series, and the `core` reproduces PL9:

- the `T²` coefficient in `F` is that of `M'` (0.0086972), not −0.0036825;
- the `T` coefficient in the `2F + 2Ω` term is 0.02, not 0.2.

The effect of these two differences on the Lagna reaches 0.002". The `corrected` mode
uses the coefficients of the published series (see `corrections.md`).

The ayanamsha is the same as for the planetary positions (see `ayanamsha.md`). The
instant is the given universal time, without the Delta T shift of the
planetary positions.

### With "None (Sayana)"

PL9 subtracts nothing: the Lagna is the ascendant of step 5.

## Midheaven

The same routine gives the midheaven, used in the houses (see `houses.md`):
`atan2(sin θ, cos θ cos ε)`, minus the long nutation, minus the ayanamsha.

## Example

Julian day 2448000.25 (universal time), latitude 28.6° N, longitude
77.2° E, ayanamsha 23.5°:

| Quantity | Value |
|---|---|
| T | −0.0970499658 |
| Short nutation | 11.5902" |
| Mean obliquity | 23.4405531630° |
| Local sidereal time | 193.7900741727° |
| Ascendant | 270.1066390964° |
| Long nutation | 11.6454" |
| **Lagna** | **246.6034042587°** |
| Midheaven (before nutation and ayanamsha) | 194.9769034890° |

## Where it is undefined

At latitudes from 90° minus the obliquity (about 66.56°) upward there are
instants at which the ecliptic coincides with the horizon. The `core` rejects those
latitudes with a typed error. The reference set goes up to 65°.

## Origin

**Read in PL9's routine.** The formulas, the constants, the use of two different
nutation series and the "None (Sayana)" case come from reading the program's
ascendant routine. The instant (universal time, not dynamical time)
was confirmed by measurement.

Before the reading, the rule had been approximated by comparison, using the
short nutation in both places; that left a residual of up to 0.285", which
was the difference between the two series.

## Conformance

Maximum difference of 0.0001" in the reference charts with Lahiri, and the same
with the other ayanamshas and with "None (Sayana)". With True Chitra the difference
is that of the ayanamsha itself (up to 0.05", see `ayanamsha.md`). The current numbers
are in `docs/reports/conformance.md`.

## What was not verified

- Latitudes above 65°.
- The manual offset combined with "None (Sayana)".
