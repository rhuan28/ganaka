# Vimshopaka and dignities in the vargas

Code: `packages/core/src/strengths/vimshopaka.ts` and `strengths/compute.ts`
(`computeVimshopaka`). Tests: `packages/core/test/vimshopaka.test.ts`.

Read in PL9's executable and checked against the "20. Vargavimshopaka" worksheet of the bench's 135
charts (VIM print model). For the nine planets, Rahu and Ketu
included.

## Points in a varga

The planet's sign in the varga gives the points by the planet's relationship with the lord
of that sign (Scorpio Mars, Aquarius Saturn):

- own sign: 20;
- great friend 18, friend 15, neutral 10, enemy 7, great enemy 5, by the compound
  relationship: the natural one (friend, neutral, enemy) added to the temporal one. The temporal one is
  always that of the natal chart (D1), in any varga: friend when the lord is 2,
  3, 4, 10, 11 or 12 signs from the planet; enemy in the other cases and in the same sign.

There are no exaltation or moolatrikona points.

**Rahu and Ketu** have no own sign here, and their natural relationships are:
Rahu friend of Venus, Jupiter and Saturn, neutral with Mercury, enemy of the Sun, the Moon
and Mars; Ketu friend of Mars and Venus, neutral with Mercury and Jupiter, enemy of the
Sun, the Moon and Saturn. These relationships were taken from the 135 printed charts
(they explain all the values of the nodes). PL9's Muhurta and transit pages rate the nodes by
another table, read in PL9 (option `nodes: 'time'` of `vimshopaka`): Rahu owns Gemini, Virgo and
Aquarius and Ketu Scorpio, Sagittarius and Pisces, and Ketu is a friend of Saturn; the rest as
above. The temporal relationship comes from the signs of the instant's own chart. Checked on the 8
distinct values those pages print (4 instants, both nodes), rounded half up.

## Groups

Each group adds the points of each varga times its weight and divides by 200 (the
maximum is 20):

| Group | Weights |
|---|---|
| Shadvarga | D1 60, D2 20, D3 40, D9 50, D12 20, D30 10 |
| Saptavarga | D1 50, D2 20, D3 30, D7 10, D9 25, D12 45, D30 20 |
| Dashavarga | D1 30, D2 15, D3 15, D7 15, D9 15, D10 15, D12 15, D16 15, D30 15, D60 50 |
| Shodashavarga | D1 35, D2 10, D3 10, D4 5, D7 5, D9 30, D10 5, D12 5, D16 20, D20 5, D24 5, D27 5, D30 10, D40 5, D45 5, D60 40 |

In Saptavarga, PL9's weights are shifted relative to the classical ones (D7 2.5,
D9 4.5, D12 2, D30 1, in twentieths): it gives 1 to D7, 2.5 to D9, 4.5 to D12 and 2 to
D30. In `corrected` mode, the books' weights (`docs/spec/corrections.md`, 22).

## Dignities in the 16 vargas

The dignity in nine levels (1 exalted, 2 moolatrikona, 3 own, 4 great
friend … 8 great enemy, 9 debilitated; the same as for Saptavargaja and Parashara's
Chara, `strengths/dignity.ts`), computed on each varga's chart: the planet's
sign in the varga, the degree within the sign times the varga's number of parts, and the
temporal relationship by the positions of the varga itself. In the Trimshamsha, whose parts
are unequal, the degree is the fraction of the part already traversed, from 0 to 1 (PL9's
arithmetic), which puts almost every planet in their sign into the exaltation and moolatrikona bands
that begin at 0°.

## The report

The points come out rounded to an integer. When the exact value is a half, PL9
sometimes rounds up, sometimes down (by its floating-point
arithmetic); the bench accepts both.

## Check

`pnpm --filter @reverse/oracle verify`, "Vimshopaka" section: the four groups and the
144 dignities of each chart, in the 135 charts.
