# Ashtakavarga

Code: `packages/core/src/strengths/ashtakavarga.ts` and `compute.ts`. Tests:
`packages/core/test/ashtakavarga.test.ts`.

With the options observed in the examined installation ("Ashtakavarga:
Varamihira", "Ekhadipatya reductions: Parashara", "Rashi multiplier for
Virgo: 6 points"); the others under "Options".

## Bindus

Eight tables: those of the seven planets and that of the Lagna. In each, each of the eight
contributors (the seven planets and the Lagna) gives a bindu in the houses, counted
from its sign, of the table below, Varahamihira's. In `pl9` mode, with the
option "Ashtakavarga: Varamihira", the default, PL9 uses Parashara's houses:
those of the table, minus two — Jupiter in the Moon's table gives a bindu in the 12th and not in the
2nd; Mars in Venus's, in the 5th and not in the 4th; and with "Parashara", the table. In
`corrected` mode, each option gives the school it names (`docs/spec/corrections.md`, 18).


| Table | Sun | Moon | Mars | Mercury | Jupiter | Venus | Saturn | Lagna |
|---|---|---|---|---|---|---|---|---|
| Sun | 1 2 4 7 8 9 10 11 | 3 6 10 11 | 1 2 4 7 8 9 10 11 | 3 5 6 9 10 11 12 | 5 6 9 11 | 6 7 12 | 1 2 4 7 8 9 10 11 | 3 4 6 10 11 12 |
| Moon | 3 6 7 8 10 11 | 1 3 6 7 10 11 | 2 3 5 6 9 10 11 | 1 3 4 5 7 8 10 11 | 1 2 4 7 8 10 11 | 3 4 5 7 9 10 11 | 3 5 6 11 | 3 6 10 11 |
| Mars | 3 5 6 10 11 | 3 6 11 | 1 2 4 7 8 10 11 | 3 5 6 11 | 6 10 11 12 | 6 8 11 12 | 1 4 7 8 9 10 11 | 1 3 6 10 11 |
| Mercury | 5 6 9 11 12 | 2 4 6 8 10 11 | 1 2 4 7 8 9 10 11 | 1 3 5 6 9 10 11 12 | 6 8 11 12 | 1 2 3 4 5 8 9 11 | 1 2 4 7 8 9 10 11 | 1 2 4 6 8 10 11 |
| Jupiter | 1 2 3 4 7 8 9 10 11 | 2 5 7 9 11 | 1 2 4 7 8 10 11 | 1 2 4 5 6 9 10 11 | 1 2 3 4 7 8 10 11 | 2 5 6 9 10 11 | 3 5 6 12 | 1 2 4 5 6 7 9 10 11 |
| Venus | 8 11 12 | 1 2 3 4 5 8 9 11 12 | 3 4 6 9 11 12 | 3 5 6 9 11 | 5 8 9 10 11 | 1 2 3 4 5 8 9 10 11 | 3 4 5 8 9 10 11 | 1 2 3 4 5 8 9 11 |
| Saturn | 1 2 4 7 8 10 11 | 3 6 11 | 3 5 6 10 11 12 | 6 8 9 10 11 12 | 5 6 11 12 | 6 11 12 | 3 5 6 11 | 1 3 4 6 10 11 |
| Lagna | 3 4 6 10 11 12 | 3 6 10 11 12 | 1 3 6 10 11 | 1 2 4 6 8 10 11 | 1 2 4 5 6 7 9 10 11 | 1 2 3 4 5 8 9 | 1 3 4 6 10 11 | 3 6 10 11 |

Totals: 48, 49, 39, 54, 56, 52 and 39 in the planets' tables (337), 49 in the
Lagna's. The Prastarashtakavarga is each contributor's bindu in each sign; the
Bhinnashtakavarga, the sum per sign; the Sarvashtakavarga, the sum of the tables
of the seven planets.

## Reductions

In each of the eight tables, the Lagna's included, in order:

1. **Trikona:** in each triangle of signs (Aries, Leo, Sagittarius; Taurus,
   Virgo, Capricorn; Gemini, Libra, Aquarius; Cancer, Scorpio, Pisces),
   each one minus the smallest of the three.
2. **Ekadhipatya:** for the two signs of each ruler, in the order Mars
   (Aries, Scorpio), Venus (Taurus, Libra), Mercury (Gemini, Virgo),
   Jupiter (Sagittarius, Pisces), Saturn (Capricorn, Aquarius). An occupied
   sign is one holding a planet or the Lagna. Nothing changes if one of the two has 0
   bindus or if both are occupied. Both empty: if equal, both end up
   with 0; if different, both end up with the smaller. One occupied: the empty one gets
   what it has in excess of the occupied one, or 0.

## Pindas

After the two reductions:

- **Rashi Pinda:** the sum, per sign, of the bindus times 7, 10, 8, 4, 10, 6,
  7, 8, 9, 5, 11, 12 (Aries to Pisces).
- **Graha Pinda:** the sum, per planet, of the bindus of the sign it is in
  times 5 (Sun), 5 (Moon), 8 (Mars), 5 (Mercury), 10 (Jupiter), 7 (Venus),
  5 (Saturn).
- **Sodhya Pinda:** the sum of the two.

## Options

- **Ashtakavarga: Parashara** (`method: 'parashara'`): in `pl9` mode, the
  houses of Varahamihira (the table above, without the two swaps), as PL9 does; in
  `corrected`, those of Parashara.
- **Ekhadipatya reductions: other** (`ekadhipatya: 'other'`): with the two
  signs empty and different, both lose the smaller (one ends up with 0).
- **Rashi multiplier for Virgo: 5 points** (`virgoMultiplier: 5`).

## Origin

Read in the PL9 executable (the bindu table, the two reductions, the
multipliers and the three options). Checked against the printed reports in 135
charts, and in 30 for each alternative of the options, with no difference in any value:
see `docs/reports/conformance.md`.

## What was not verified

- The Sodhya Pinda multiplied by the bindus of a house, which PL9 computes but
  no report shows: `core` does not provide it.
- Charts with an undefined Lagna (beyond the polar circle): refused.
