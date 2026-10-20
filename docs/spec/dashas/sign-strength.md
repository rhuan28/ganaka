# Sign strength

Code: `packages/core/src/dashas/strength.ts` and `points.ts`. Tests:
`packages/core/test/strength.test.ts`, `packages/core/test/rashi.test.ts`.

PL9 decides which of two signs is the stronger (in Kalachakra, the sign and the
7th, for the first subdivision of each period; in the sign dashas, where the
rule asks for the "stronger of the 1st and the 7th") by this comparison, criterion by
criterion, until one breaks the tie:

1. more planets in the sign (the nine grahas, Rahu and Ketu included);
2. more sign aspects (jaimini) or conjunctions of Jupiter, of Mercury and
   of the sign's lord; a lord that is Jupiter or Mercury counts
   again;
3. more exalted planets in the sign (below);
4. dual sign before fixed, fixed before movable;
5. the lord in a sign of parity different from the sign's;
6. the lord with the higher degree within its sign, the lord of Scorpio
   and of Aquarius being the one chosen below;
7. complete tie: the second sign.

**Exaltation.** A planet counts as exalted throughout its exaltation sign,
strictly above 0°, except Mercury, only below 15° Virgo. Rahu is
exalted in Gemini and Ketu in Sagittarius, each debilitated in the other's sign
(in this comparison, whatever the "Rahu's Exaltation sign" option); outside
these two signs, the nine-level dignity (below) applies: Rahu exalted in
Taurus and debilitated in Scorpio, Ketu the reverse. Debilitated, for the others:
in the sign opposite the exaltation sign.

**Lord of Scorpio and of Aquarius.** The two lords, Mars and Ketu,
Saturn and Rahu: if one of them is in the sign, the other one counts; otherwise, the one with
more planets in the same sign; then the one aspected by more of Jupiter,
Mercury and the lord of the sign it is in (not counting itself; a lord
that is Jupiter or Mercury counts again); then the one with the better dignity
(exalted, neither, debilitated); then the one farthest from the
sign, counting forward from an odd sign and backward from
an even one; tie: Mars or Saturn.

## Points (Parashara's Chara and Sthira)

Another comparison, which PL9 uses in Parashara's Chara and to find the Brahma
of Sthira, adds up points.

**Points of a sign:** 15 if movable, 30 if fixed, 60 if dual; 60 for each of
Mercury, Jupiter and the sign's lord whose sign aspects it (sign
aspect, not counting conjunction); 15 per planet in the sign, from the Sun to Rahu (Ketu
does not count), and 45 more if there is any.

**Points of a planet:** by the nine-level dignity (below): 60, 45, 30,
22.5, 22.5, 15, 7.5, 7.5 and 3.75; by the position among the chara karakas (with the
7 or 8 karakas option): 60 the Atmakaraka, then 45, 30, 22.5, 15, 7.5 and
3.75, nothing beyond the seventh; and by the house from the Atmakaraka's sign: 60 in a
kendra, 30 in a panaphara, 15 in an apoklima.

**Nine-level dignity:** 1 exalted (Sun in Aries, Moon in Taurus, Mars in
Capricorn, Mercury in Virgo up to 15°, Jupiter in Cancer, Venus in Pisces,
Saturn in Libra, Rahu in Taurus, Ketu in Scorpio); 2 moolatrikona (Sun in
Leo up to 20°, Moon in Taurus from 3° to 30°, Mars in Aries up to 12°, Mercury in
Virgo from 15° to 20°, Jupiter in Sagittarius up to 10°, Venus in Libra up to 15°,
Saturn in Aquarius up to 20°, Rahu in Gemini, Ketu in Sagittarius), the ranges
strict; 3 in its own sign (Rahu in Aquarius and Virgo, Ketu in Scorpio and
Pisces); 9 debilitated (the sign opposite the exaltation sign). The others, from the Sun to
Saturn, get 7 minus the natural friendship with the sign's lord (2 friend, 1
neutral, 0 enemy) minus the temporal one (+1 if the lord is 2, 3, 4, 10, 11 or
12 signs away, −1 if not, including in the same sign): from 4, great friend, to 8,
great enemy. Rahu and Ketu, outside this, 6.

**Stronger by points:** of two signs, the one with the larger sum of sign points and
the points of its lord (Mars for Scorpio, Saturn for Aquarius),
rounded to the nearest integer, halves to even; tie, the second.

## Origin

Read in the PL9 executable (the routine that the program also uses for the
"strongest of first and seventh" search item of Narayana), and checked on the
Kalachakra reports: it gets the 780 axis choices of 130 charts right. An earlier
deduction, from the reports alone, had four criteria and was wrong on one axis
(that of REF 0169, decided by Ketu exalted in Sagittarius). The exaltation
ranges and the points were read in the executable's tables; the points are
checked through Sthira (130 charts) and through Parashara's Chara (31 charts).
Exaltation over the whole sign was checked in five charts where it decides
(REF 0042, 0127, 0140, 0191 and 0223): with the degree ranges that `core` used
before, the Kalachakra and the sign dashas of these charts fail.

## What was not verified

- Criterion 7 (complete tie) and the order of the two signs in it.
- The points with 8 karakas: the option was not changed in PL9.
