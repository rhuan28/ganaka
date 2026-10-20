# Houses

## What PL9 offers

PL9 shows the chart by sign and, as alternative reference frames, two
house systems: **Bhava (Sripati)** and **Bhava (equal)**. The `core` computes
both. In both, the Lagna is the **middle** of the first house, not its start.

## Midheaven

Computed by the same closed formulas as the Lagna (see `lagna.md`):
`atan2(sin θ, cos θ cos ε)`, minus the long nutation, minus the ayanamsha, where
`θ` is the local sidereal time and `ε` the mean obliquity. It does not depend on
latitude.

## Equal houses

Twelve houses of 30°. The middle of house `k` is the Lagna plus `30° × (k − 1)`.

## Sripati

- The middle of house 1 is the Lagna; that of house 10 is the midheaven; those of house 7 and
  house 4 are the opposite points.
- The arc from the midheaven to the Lagna, in the direction of the signs, is divided into three
  equal parts: the division points are the middles of houses 11 and 12.
- The arc from the Lagna to the point opposite the midheaven is divided into three
  equal parts: the division points are the middles of houses 2 and 3.
- The middles of houses 5, 6, 8 and 9 are the points opposite those of houses 11, 12,
  2 and 3.

## Where a house begins

In both systems, a house begins at the midpoint between the middle of the
previous house and its own middle, and runs to the start of the next one. The point
exactly on the start belongs to the house that begins.

## Example

Lagna at 100° and midheaven at 5°, in Sripati:

| House | Middle | Start |
|---|---|---|
| 1 | 100.0000° | 84.1667° |
| 2 | 128.3333° | 114.1667° |
| 3 | 156.6667° | 142.5000° |
| 4 | 185.0000° | 170.8333° |
| 5 | 216.6667° | 200.8333° |
| 6 | 248.3333° | 232.5000° |
| 7 | 280.0000° | 264.1667° |
| 8 | 308.3333° | 294.1667° |
| 9 | 336.6667° | 322.5000° |
| 10 | 5.0000° | 350.8333° |
| 11 | 36.6667° | 20.8333° |
| 12 | 68.3333° | 52.5000° |

## Origin

- Midheaven formula: **read in PL9's routine**, the same as the Lagna's.
- Construction of the Sripati and equal houses, with the Lagna in the middle of the house:
  described in the PL9 manual and classical; **confirmed on PL9's screens**.
- Start of each house at the midpoint between two middles: classical construction,
  **confirmed on PL9's screens** ("Sandhi, from" column of the "House
  cusp details" table).

## Check against PL9

In 70 charts, from 1801 to 2047 and up to 65° of latitude, the middle ("Madhya") and the
start ("Sandhi, from") of the twelve houses were read from PL9's "House cusp
details" table, in the Bhava (Sripati) and Bhava (equal) reference frames: 3360
values. PL9 shows them rounded to the arcsecond; the largest difference
against the `core` is 0.50", that is, the rounding itself.

The house of each point follows from the starts of the houses. In one chart, the houses of the
nine grahas in PL9's Bhava (Sripati) drawing were checked by eye and
match those of the `core`.

## What was not verified

- The house of each point, systematically: PL9 shows it only in the chart
  drawing, which was not read by program.
- A point exactly on the start of a house.
- Which reference frame the natal chart screen uses by default to place the planets
  in the houses.
- The Placidus cusps of the Krishnamurti screen ("Cusp (KP)" in the same table),
  which PL9 also computes.
