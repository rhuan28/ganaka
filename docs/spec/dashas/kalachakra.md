# Kalachakra dasha

Code: `packages/core/src/dashas/kalachakra.ts`. Tests:
`packages/core/test/kalachakra.test.ts`.

## Rules

**Years of the signs.** Aries 7, Taurus 16, Gemini 9, Cancer 21, Leo 5, Virgo
9, Libra 16, Scorpio 7, Sagittarius 10, Capricorn 4, Aquarius 4, Pisces 10.
The length of the year is that of the nakshatra dasha engine (`dashaYearDays`).

**Sequences by pada.** Each pada has nine signs.

| Group | Nakshatras | Pada 1 | Pada 2 | Pada 3 | Pada 4 |
|---|---|---|---|---|---|
| Savya A | Ashwini, Krittika, Punarvasu, Ashlesha, Hasta, Swati, Mula, U. Ashadha, P. Bhadrapada, Revati | Ari Tau Gem Can Leo Vir Lib Sco Sag | Cap Aqu Pis Sco Lib Vir Can Leo Gem | Tau Ari Pis Aqu Cap Sag Ari Tau Gem | Can Leo Vir Lib Sco Sag Cap Aqu Pis |
| Savya B | Bharani, Pushya, Chitra, P. Ashadha, U. Bhadrapada | Sco Lib Vir Can Leo Gem Tau Ari Pis | Aqu Cap Sag Ari Tau Gem Can Leo Vir | Lib Sco Sag Cap Aqu Pis Sco Lib Vir | Can Leo Gem Tau Ari Pis Aqu Cap Sag |
| Apasavya B | Rohini, Magha, Vishakha, Shravana | reverse of B pada 4 | reverse of B pada 3 | reverse of B pada 2 | reverse of B pada 1 |
| Apasavya A | Mrigashira, Ardra, P. and U. Phalguni, Anuradha, Jyeshtha, Dhanishta, Shatabhisha | reverse of A pada 4 | reverse of A pada 3 | reverse of A pada 2 | reverse of A pada 1 |

**Deha and Jeeva.** Savya: Deha is the first sign of the sequence of the Moon's pada,
Jeeva the last. Apasavya: Deha the last, Jeeva the first.

**Balance at birth.** The fraction of the Moon's pada already traversed, by degree,
times the sum of the years of the pada's sequence, gives how much of the
sequence has already elapsed. The running mahadasha is the sign in which that time falls; what of it
has already passed moves its start back.

**Following mahadashas** (PL9 option "Continue mahadashas in following
pada"). They follow **zodiac order** from the sign of the running
mahadasha, each with the years of its sign.

**Antardashas and pratyantardashas** (option "12 Antar Dasha"). Each period is
divided into 12 equal parts, one per sign. The first is the stronger sign
between the period's sign and the 7th from it; the sequence moves
forward if the period's sign is odd (Aries, Gemini…) and backward if it is even.
Holds at all levels.

**Stronger sign** of the axis: PL9's own comparison of two signs,
described in `docs/spec/dashas/sign-strength.md`, with the sign from the half from
Aries to Virgo as the first, so that the two signs of an axis get the
same answer.

## Origin

Measured on the reports printed by PL9 ("Kala Chakra - MD and AD" and "AD and
PD #1 to #5") of 130 reference charts (the Moon in 103 of the 108 padas), with the
options observed: the 135,447 start dates of mahadasha, antardasha and
pratyantardasha match these rules, with the year of 365.2421875 days. The sequences by pada and the years are
the classical ones; the continuation through the zodiac, the division into 12 equal parts and the
choice of the stronger sign were deduced from the reports. The choice of the stronger
sign was first deduced from the reports (four criteria, which were wrong
on one axis out of 780, that of REF 0169) and then read in the executable: the rule read
gets all 780 right.

## `corrected` mode

Differs from `pl9` in three points, approved by the maintainer and described in
`docs/spec/corrections.md` (12 to 14): the mahadashas follow the sequences of the
following padas, and not the zodiac; "Cycle through mahadasha within the same
pada", which PL9 does not store, repeats the pada's sequence; "9 Antar Dasha", which
comes out inconsistent in PL9, divides each period among the nine signs starting from
its own, in proportion to the years. In `pl9` mode, both options are refused.

## What was not verified

- The options "9 Antar Dasha" and "Cycle through mahadasha within the same pada"
  in `pl9` mode: PL9 does not deliver them in usable form (corrections 13 and
  14); `corrected` mode computes them, with no external reference.
- The 5 padas without a reference chart.
