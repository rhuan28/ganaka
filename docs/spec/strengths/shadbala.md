# Shadbala

Code: `packages/core/src/strengths/shadbala/` (`sthana.ts`, `kala.ts`,
`day.ts`, `cheshta.ts`, `index.ts`) and `strengths/compute.ts`
(`computeShadbala`, `shadbalaInputs`). Tests:
`packages/core/test/shadbala.test.ts`. Aspects: `aspects.md`.

The rules were read in PL9's executable and checked against the "Shad Bala
and Bhava Bala" report of the bench's charts, with the default options (below).
`corrected` mode differs at three points: the Moon in the first three degrees of Taurus, the
day beyond 65° of latitude and Cheshta outside the series (`docs/spec/corrections.md`,
19 to 21). Values
in virupas (shashtiamshas); 60 virupas are one rupa.

## Sthana Bala

- **Uchcha**: the planet's distance from its debilitation point, divided by
  3. Points: Sun 190°, Moon 213°, Mars 118°, Mercury 345°, Jupiter 275°,
  Venus 177°, Saturn 20°.
- **Saptavargaja**: in the seven vargas D1, D2, D3, D7, D9, D12 and D30 (PL9's
  ones), by the lord of the sign the planet falls in:
  - own sign: 30; in D1, 45 within the moolatrikona (strict limits:
    Sun Leo 0–20°, Moon Taurus 3–30°, Mars Aries 0–12°, Mercury Virgo
    15–20°, Jupiter Sagittarius 0–10°, Venus Libra 0–15°, Saturn Aquarius
    0–20°);
  - the Moon in Taurus in D1: 45 after 3°, **0** in the first three degrees
    (so in PL9);
  - in the other cases, by the compound relationship with the lord (natural added to
    temporary, the latter by the D1 signs): 22.5, 15, 7.5, 3.75 and 1.875, from
    great friend to great enemy.
- **Ojhayugma**: 15 in D1 and 15 in D9 when the sign is odd (even for the Moon and
  Venus).
- **Kendradi**: 60 in a kendra from the Lagna's sign, 30 in a panaphara, 15 in an
  apoklima.
- **Drekkana**: 15 in the decanate of its gender: the first for the Sun, Mars and
  Jupiter; with "Parashara", the second for Mercury and Saturn and the third
  for the Moon and Venus; with "Hora Ratnam", the reverse.

## Dig Bala

The distance from the point where the planet is weakest, divided by 3. The points:
for the Sun and Mars, the middle of the 4th house (Sripati); for the Moon and Venus, that of the 10th;
for Mercury and Jupiter, that of the 7th; for Saturn, that of the 1st. With the "kendras" option,
the Lagna plus 90° and minus 90° instead of the middles of the 4th and the 10th.

## Kala Bala

Sum of Nathonnatha, Paksha, Tribhaga, Varsha, Masa, Vara, Hora and Ayana.
Yuddha comes out in the same table but does **not** enter the sum.

### The Shadbala day

PL9 counts the Shadbala day by a sunrise and a sunset of its own, which are not
those of Gulika:

- the sunrise is the instant at which the Lagna reaches the Sun; the sunset, at which the point
  opposite the Lagna reaches it — the Sun taken at its place at birth and
  moving one degree per day;
- the first guess for the sunrise is the birth plus the arc from the Lagna to the Sun
  over 360, minus one day (the previous sunrise); that for the sunset, this guess plus
  half a day;
- each one is found by secants, the first slope 360° per day, until
  the difference falls below one thousandth of a degree, in at most nine steps;
  at sunset, the opposite point and the slope in single precision;
- beyond 65° of latitude, north or south, the latitude is taken as 60° north
  (also in the southern hemisphere); between
  60° and 65°, the first slope, and those of steps 2 and 3, are multiplied
  by 4;
- it is night when the Sun is less than 180° ahead of the Lagna.

### The parts

- **Nathonnatha**: midnight = (sunrise + sunset) / 2 + (1 + 1/365.25) / 2. With
  `d` = (birth − midnight) × 360, brought to 0–360, the night strength is
  |d − 180| / 3; the Moon, Mars and Saturn receive it, the Sun, Jupiter and Venus the
  complement to 60; Mercury, always 60.
- **Paksha**: the Moon's distance from the Sun, divided by 3, for the benefics; the
  complement to 60 for the Sun, Mars, Saturn and Mercury when malefic
  (Mercury is malefic in the sign of the Sun, Mars, Saturn, Rahu or Ketu; with the
  "benefic" option, never).
- **Tribhaga**: 60 to the lord of the third of the day (Mercury, Sun, Saturn) or of the
  night (Moon, Venus, Mars) in which the birth falls; Jupiter, always 60.
- **Varsha, Masa, Vara and Hora**: 15, 30, 45 and 60 to the lords of the year, the month,
  the day and the hour. The days are counted from Julian day
  2380557.5 to the local instant (the Julian day plus the longitude / 360), one
  less when born at night before local noon (fraction of the local day
  below one half); the year has 360 days and the month 30. With the weekday numbered from
  1 (Sunday) to 7: that of the year is that of (⌊days / 360⌋ × 3 + 1), that of the month that of
  (⌊days / 30⌋ × 2 + 1), that of the day that of (days mod 7), and that of the hour that of the day plus
  5 per whole hour since sunrise.
- **Ayana**: ((d + 23.45) / 46.9) × 60, with the declination d taken as
  23.45 × sin(tropical longitude) (the latitude does not enter); inverted for the Moon
  and Saturn; for Mercury, |d|. The tropical longitude is the true one (with
  nutation), at the instant at which PL9 evaluates the ephemeris (its ΔT), like
  the Sun's in Ishta and the latitudes of the war.

## Cheshta Bala

- The Sun's is its Ayana; the Moon's, its Paksha.
- From Mars to Saturn, PL9 takes the instants of each motion cycle from
  approximate series in its own code: the "zero" and the "top" of each cycle,
  Julian days as a function of the cycle's integer number `k` (below).
- The cycle: `i` is the first index with zero(i) not earlier than the birth; the
  top is that of index `i` (Mars) or `i − 1` (the others, if `i > 0`); if the
  birth is before the top, zero `i − 1` applies, otherwise zero `i`.
- The station: starting from the top minus (before the top) or plus (after) a
  distance per planet (Mars 30 days, Mercury 10, Jupiter 55, Venus 21,
  Saturn 60), one day at a time in the direction the motion leads, until the
  sign of the speed changes, in **at most 12 looks**; the longitude of the
  last one applies. The speed whose sign is read is the true one (with nutation); near
  the station it can have a different sign from the speed without nutation.
- The (sidereal) longitudes of zero `la`, top `lb`, station `ls` and birth
  `lc` are those of the chart, computed like the chart positions. With
  oriented(x, y) = (y − x) mod 360 and minimum the shorter distance:
  - if the zero comes after the top: direct = oriented(ls, la) and
    partial = oriented(lc, la); otherwise, oriented(la, ls) and oriented(la, lc);
  - total = direct + minimum(lb, ls); partial above 300 becomes 360 − partial;
  - planet retrograde (speed ≤ 0) at birth: partial = direct +
    minimum(lc, ls);
  - Cheshta = 60 × min(partial, total) / total.

The series (u in radians):

| Planet | zero(k) | top(k) | last k |
|---|---|---|---|
| Mars | 2380725 + 779.9307k + 8.3717 + 17.4314 sin(0.8549k) − 10.8387 cos(0.8549k) | 2380350 + 779.9449k − 7.9668 − 19.0764 sin(0.8549k) + 16.1501 cos(0.8549k) | 113 |
| Mercury | 2380632 + 115.8775k + 4.5231 + a sin(0.09973k) + b cos(0.09973k) | 2380691 + 115.8776k + 3.5036 + c sin(0.09973k) + d cos(0.09973k) | 766 |
| Jupiter | 2380665 + 398.8825k + 4.8226 − 3.5836 sin(0.57776k) − 5.5003 cos(0.57776k) | 2380863 + 398.8815k + 6.1374 + 1.3601 sin(0.5791k) − 6.2723 cos(0.5791k) | 222 |
| Venus | 2380469 + 583.9214k − 3.1004 | 2380760 + 583.9210k − 2.1953 | 152 |
| Saturn | 2380607 + 378.0963k − 8.5965 − 1.4827 sin(0.2209k) + 8.3813 cos(0.2209k) | 2380792 + 378.0954k − 4.4261 − 3.2208 sin(0.21726k) + 2.9859 cos(0.21726k) | 235 |

Mercury, by k mod 3 = 0, 1, 2: (a, b, c, d) = (−4.363, −6.4117, 6.6144,
−0.7605), (−3.2831, 6.9952, −3.9994, −5.4142), (7.6603, −0.6195, −2.68848,
6.1661).

**Outside the series** (births before about 1806 or after about
2045, depending on the planet), the index falls outside and PL9 takes date 0, which its
ephemeris does not compute: the value it prints is not reproducible. The `core`
returns a number — with the position zeroed before the series, and 0 after them,
where no arc remains — and lists the planets in `cheshtaOutsideSeries`;
those charts are not checked. In `corrected` mode, the series continue
onward and the Cheshta of those charts is computed (`docs/spec/corrections.md`, 21).

## Naisargika

60 × (1, 0.857, 0.286, 0.429, 0.571, 0.714, 0.143) for Sun, Moon, Mars,
Mercury, Jupiter, Venus and Saturn.

## Drik Bala

The graded aspects (`aspects.md`) of the other six planets on the planet,
those of the benefics added and those of the malefics subtracted, each with a quarter
of its value; those of Jupiter and Mercury whole ("full" option; with "quarter",
a quarter as well). Benefics: Jupiter, Venus, the waxing Moon (less than 180°
ahead of the Sun) and Mercury, except when malefic by the Paksha rule (Drik's own
option). It can be negative, and so can the total.

## Total, ranking and Ishta/Kashta

- Total = Sthana + Dig + Kala + Cheshta + Naisargika + Drik; rupas = total / 60.
- Minimums: Sun 390, Moon 360, Mars 300, Mercury 420, Jupiter 390, Venus 330,
  Saturn 300; ratio = total / minimum.
- Ranking: 1 for the highest ratio, as PL9 keeps it in memory and as
  its ranking report key gives it. **Pending**: the printed page
  ranks the ratio rounded to two places, and when two ratios tie
  that way it breaks the tie by a rule not yet found; the `core` follows the exact ratio.
- Strong strengths: how many of Sthana, Dig, Kala, Ayana and Cheshta reach the
  minimum of the planet's group (Sun, Jupiter and Mercury; Moon and Venus; Mars and
  Saturn): Sthana 165/133/96, Dig 35/50/30, Kala 112/100/67, Ayana
  30/40/20, Cheshta 50/30/40.
- Ishta = (distance from the debilitation point + motion kendra) / 6, the
  kendra being, for the Sun, the Sun's tropical longitude plus 90° folded to
  0–180; for the Moon, its distance from the Sun; for the others, 3 × Cheshta
  folded to 0–180. Kashta = 60 − Ishta.

## Planetary war

For each of Mars to Saturn, the last of the others (in the order Mars, Mercury,
Jupiter, Venus, Saturn) within 1° of it is the opponent. The one further
north (greater ecliptic latitude) wins, but Venus always wins. Yuddha is the
difference of the totals, positive for the winner and negative for the loser.

## Options

| PL9 option | Values (`ShadbalaOptions`) | Default |
|---|---|---|
| Drekkana Bala method | `drekkana`: `parashara`, `horaRatnam` | `parashara` |
| 4th/10th house in Dig bala | `digBala`: `cusps`, `kendras` | `cusps` |
| Mercury's nature for Paksha Bala | `mercuryPaksha`: `withMalefics`, `benefic` | `withMalefics` |
| Mercury nature in Drig bala | `mercuryDrik`: `withMalefics`, `benefic` | `withMalefics` |
| Jup & Merc in Drig bala | `jupiterMercuryDrik`: `full`, `quarter` | `full` |

## Check

`pnpm --filter @reverse/oracle verify`, "Shadbala" section:

- each printed part of each planet within half a hundredth of PL9 (plus 1e-5, the
  `core`'s error measured in memory), minimums and strong strengths equal;
- the ranking, equal, except where the printed ratio ties with another
  planet's: there, listed separately as pending;
- the charts outside the Cheshta series, listed and not checked;
- each alternative of the five options, printed in PL9 on 30 charts it
  affects (`fixtures-shadbala-options/<option>-<value>`), with the same tolerance;
  a missing set is a failure;
- the table read from the memory of the running PL9 on 11 charts (`fixtures-shadbala-memory`),
  each part within 1e-4; the largest
  deviation measured was 1e-5.
