# Varshaphala (stage 5C)

The annual chart (solar return) and what PL9 derives from it, how the `core` computes it
(`packages/core/src/varshaphala/`) and where each rule comes from. Answer keys: the Varshaphala
reports of the TEMPO PDFs for the 135 reference charts (`packages/oracle/fixtures-varshaphala/`,
the age answered at each reference date), the 72 returns of the "Varshaphala Charts" and the
"Mean solar return" alternative in 30 charts (`fixtures-varshaphala-options/mean/`).

## The year of age and the return

Read in the executable:

- The year of age at a date is the number of whole mean sidereal years (365.25636 days) from
  birth to it, also in the true-return mode; before birth, 0.
- The true return (the default): starting from birth plus 365.2422 days per year (months
  counted as twelfths and days as 360ths of the year), computed in single precision, three
  steps of one day per degree that the Sun is away from its natal longitude (plus 30° per month and 1° per
  day in the monthly and daily returns), with no tolerance test. Since the starting point has
  single precision (a quarter of a day at present-day dates) and the steps are fixed, the `core`
  reproduces both.
- The mean return: birth plus 365.25636 days per year, 30.43803 per month and 1.01460 per day.
- The annual chart is cast at the place of birth (the "(L)" variants, at that of the "Today" event).

From the data: the return of year 0 is the birth itself. The reports accept ages up to 120;
above that, the header writes the requested age but the chart is that of an instant near
birth, which was not identified. The `core` computes the requested age (correction 25); the check compares,
in those reports, only the 72 returns (which do not depend on the date) and leaves the rest out.

Without a Lagna (beyond the polar circle), the annual chart has no houses and no day and night: the `core` gives the
planets, the Panchavargeeya and the Mudda, and states what is missing — the Harsha, the year lord, the
Sahams, the Patyayini, the Tripataki, and the yogas that require houses (Iqabala, Induvara, Kutta) do not form. With
the birth beyond the polar circle the Muntha is missing too.

## The Muntha

From the data (97% of the 9,720 returns to the second, the rest to 1"): the natal Lagna plus 30° per mean sidereal
year elapsed from birth to the return — which is why the seconds vary from one year
to another, and the Muntha of the monthly charts advances about 2.5° per month.

## The Tajika relations

Read in the executable. Everything is counted by signs: the sign of one planet counted from the
sign of the other (1 to 12). There is an aspect in every position except the 2nd, 6th, 8th and 12th. The
relation is friendly in the 3rd, 5th, 9th and 11th, inimical in the 1st, 4th, 7th and 10th, and neutral in the others.

Ithasala: the two signs in aspect; the faster planet (in the order Moon, Mercury, Venus, Sun,
Mars, Jupiter, Saturn), not retrograde, behind the slower one by degree within the sign, by less
than half the sum of the orbs (Sun 15°, Moon 12°, Mars 8°, Mercury 7°, Jupiter 9°, Venus 7°,
Saturn 9°).

A retrograde faster planet behind the slower one is in neither Ithasala nor Esharpha
(which requires the faster one ahead): PL9 does not swap the roles because of retrogression, and the `core`
does the same.

## The strengths

Read in the executable.

- Panchavargeeya: five strengths, each (except the Uchcha) by the lord of the division the
  planet is in — the planet itself, a friend, a neutral or an enemy by the Tajika relation of the
  signs: Graha (the sign) 30/22.5/15/7.5; Hudda (the Tajika terms, five per sign, with the end of
  each term belonging to it) 15/11.25/7.5/3.75; Drekkana (the lords in the order of the days of the
  week) 10/7.5/5/2.5; Navamsha 5/3.75/2.5/1.25; and the Uchcha, the distance from the
  debilitation point (Sun 190°, Moon 213°, Mars 118°, Mercury 345°, Jupiter 275°, Venus 177°,
  Saturn 20°) divided by 9. The total is the sum times 0.25.
- Harsha: 5 for each of four conditions — the planet in its house (Sun 9, Moon 3, Mars 6,
  Mercury 1, Jupiter 11, Venus 5, Saturn 12); exalted, in moolatrikona or in its own sign;
  a feminine planet (Moon, Mercury, Venus, Saturn) in houses 1 to 3 and 7 to 9, or a masculine one
  in the others; a feminine one in a night chart, or a masculine one in a day chart. Houses are counted
  by sign from the annual Lagna (from the data: 2,099 of 2,100).

## The year lord

Read in the executable. The five office-holders: the lords of the Muntha, of the natal Lagna and of the annual Lagna, the
Trirashi Pati (by sign of the annual Lagna, by day and by night) and the Dina-Ratri Pati (the lord of the
Sun's sign by day, the Moon's by night). The chart is a day chart when the Sun is more than 180°
ahead of the Lagna. Of the office-holders that are not the Moon and whose sign aspects the annual Lagna, the strongest
(the Panchavargeeya total; on a tie, the first in the order Sun to Saturn), if its strength reaches
5; otherwise, and when none aspects, the Muntha Pati. When the Moon is an office-holder and only it aspects, PL9
takes the Muntha Pati (from the data: 140 of 140 such returns): the branch that would give the strongest
planet in Ithasala with the Moon has a condition that is never met. The `corrected` mode follows that
branch as its text says (correction 24 in `docs/spec/corrections.md`).

## The Tajika yogas

Read in the executable: 22 rules on pairs (or trios) of planets, which the report groups into the 16
names it prints — Iqabala (all planets in kendra or panaphara) and Induvara (all in
apoklima); Ithasala in four ways (the ordinary one at more than 1°, the complete one at less than 1°, that of the
planet in the last degree heading to the next sign, and the one that crosses the boundary); Esharpha (the
faster one ahead, between 1° and 30°, within the orbs); Manua (Ithasala with Mars or Saturn in
aspect with the faster one); Kamboola (Ithasala and the Moon in Ithasala with one of the two); Gairi-
Kamboola and Khallsara (the Moon without qualification); Rudda (Ithasala and one of the two combust,
debilitated, in houses 6, 8 or 12, or with Mars or Saturn in aspect); Duphali-Kutta;
Dutthotta-Daivira; Tambira; Kutta; Durupha (both in houses 6, 8 or 12, retrograde and
combust).

From the data:

- The report names each pair with the faster one first, and never takes Jupiter as the first,
  except in Ithasala (Jupiter and Saturn appear 25 times in Ithasala and never in the yogas
  built on it). The rules accept the pair and the routines that go through the pairs cover the
  seven planets: the omission comes from the report's model ("What is not corrected" in
  `docs/spec/corrections.md`).
- Nakata and Yamaya never appear (0 in 600 reports), although their rules, with the orbs of
  all planets, form in many charts; the `core` does not count them, in both modes ("What is not
  corrected" in `docs/spec/corrections.md`).
- Combustion: within 17° of the Sun for Mars, 14° (12° retrograde) for Mercury, 11° for
  Jupiter, 10° (8° retrograde) for Venus and 15° for Saturn; the Moon never (270 of 270 charts
  per planet).
- Pending: the pairs the report omits in 15 of 161 Manuas and 5 of 161 Kamboolas (the rule
  read in the executable would give them), and the Kutta and the Tambira. Both rules are read and take a
  pair of planets; the pair comes from the report's model (program data, not code), and no
  combination of roles (office-holders, year lord, lords of the houses of the annual Lagna, of the natal one and of the
  Muntha, the planets) reproduces what the report prints (the best, in the Kutta, gets 130 of 161 right,
  against 128 for "never"). The `core` computes them for the given pair.

## The Tripataki Chakra

Read in the executable and checked against the data. Each point starts from its natal sign and moves, for each
completed year, one sign: the Moon in a cycle of 9, Mars in one of 6, the Sun, Mercury, Jupiter, Venus and
Saturn in one of 4; Rahu and Ketu move backwards in a cycle of 6; the Lagna stays in the natal sign. The
chakra shows each planet's sign (PL9 does not print a planet drawn over another).

The vedhas: counting houses from the annual Lagna (1 = the Lagna), a planet makes vedha on a
point when its house is in the set of the point's house: houses 1, 4, 7 and 10 among themselves;
2 with 2, 3, 6, 9; 3 with 2, 3, 8, 11; 5 with 5, 6, 9, 12; 6 with 3, 5, 6, 11; 8 with 3, 8, 9, 12;
9 with 2, 5, 8, 9; 11 with 5, 6, 11, 12; 12 with 5, 8, 11, 12. The report lists the vedhas of the
Lagna and of the seven planets.

Check: the printed houses and the vedha lists of the 172 reports up to 120 years, 2,918
values, all equal.

## The Sahams

The rule was not found in the executable (the names are encrypted); the formulas come from the data, each one
searched among all combinations of points and checked in the 161 annual charts up to 120 years.
Every Saham is A − B + C, adding 30° when C is not between B and A (counting forward from B);
in some of them A and B swap places at night. The points: the Lagna, the planets, the Punya and the Vidya,
15° Cancer, the middle of the houses (Sripati) and the position of the lord of a house's sign. Samartha uses
Jupiter − Mars when Mars rules the Lagna; Karyasiddhi is Saturn − Sun + the lord of the Sun's
sign by day, Saturn − Moon + the lord of the Moon's sign by night. The full table is in
`packages/core/src/varshaphala/sahams.ts`.

Check: the Sahams without the Lagna match to the second (Gaurava, Sastra, Jadya: 172 of 172); the
others, to within 30" (the Lagna moves 15" per second of time, and the return is known to one
second). Pending: 9 Karyesiddhis off by 30° (the 30° rule in them did not close) and one or two
cases in Yasa, Mahatmya, Paradesa, Artha, Bandhana, Apamrityu and Labha.

## The annual dashas

No text anchor in the executable; the rules come from the data, in the four reports of 161 years.
The dasha year has 365.2422 days.

- Mudda: the Vimshottari order, each period (the lord's years) / 120 of the year and the subperiods in the
  same proportion starting from the lord itself. It starts with the lord of the natal nakshatra counted
  forward by the completed years (the nakshatra of the natal Moon plus the years). With the Moon's balance at
  birth, the first period began before the return by the part of its nakshatra the natal Moon had already
  traversed; the report shows the subperiods starting from the one running at the return.
- Mudda (Kalidasa), "balance based on moon in Varshaphala": the same, starting from the lord of the
  nakshatra of the annual Moon and with its balance.
- Mudda without balance: starts at the return, with the whole period.
- The periods continue until the year is covered; the one that starts at its end is also listed.
- Patyayini: the seven planets and the Lagna in the order of their degrees within the sign; each period is the
  advance of its degree over the previous one (the first, the degree itself) as a fraction of the largest, times the
  year; the subperiods, the same fractions of each period, starting from the lord itself.
- The Patyayini printout (from the data; what draws the table is the report's model, not the
  executable): the subperiod lines one after another, cycle after cycle, without those of less than
  5 minutes (the longest omitted ones are 4.85 minutes; the shortest shown, 5.12), eight per
  period; each period takes the lord of the period of its first line, from the start of that line to the end
  of the last. When the first line of the year is omitted, the first period comes out whole (three
  reports). Thus a short line pushes the following ones one period back, and the last
  period ends with lines from the next cycle. The `corrected` mode gives each period its
  own subperiods (`docs/spec/corrections.md`, 27).
- The hours are truncated to the minute.

Check (up to 120 years, 2 dates): the lords and end dates of all Mudda periods,
in the three modes (1,610 of 1,610 each); the hours of the subperiods to one minute (those of Kalidasa are up to
one minute earlier: the annual Moon, which moves 0.5" per second of time, fixes the start). Patyayini: the
period routine, read in the executable, is that of the `core` (the order by degree in the sign, with the Lagna;
each period, the advance over the previous one as a fraction of the largest degree; the year of 365.2422 days). With the
printout rule above, the 21 reports that previously diverged fall to 3 (REF 0003, 0268 and 0272
in 2000), pending: in REF 0003 PL9 omits a 13-hour line, and in the other two it shows, in the
next cycle, a 1.7-minute line inside an 8-minute period. A hypothesis tested
and discarded: times in single precision (days since 1899, 5.6-minute resolution) with the
line omitted when start and end coincide; it explains 51 of the 69 omitted lines, against 68 for the
5-minute rule.

## Printout

The hours and degrees of the "Varshaphala Charts" and of the monthly charts are rounded to the second and
shown to the minute (from the data: with direct rounding to the minute, dozens of hours
differ).

## Check

On the bench (`pnpm --filter @reverse/oracle verify`, section "Varshaphala"): the reports up to 120
years at both dates and the 30 of the mean return (172 reports), plus the 72 returns of the 65
reports of 2030 above 120 years, 334 thousand values; the pending items, listed per report (the
pairs that some yogas omit or add, the Patyayini in 3 reports and some Sahams), do not
fail. Not compared: the Kutta and the Tambira, and the SB (the Shadbala of the annual
chart, which matches the `core`'s in 389 of 490 values, with the median difference at zero: one
component differs and it was not found which).

## The worksheets of the clock's year

Worksheets 64 to 92 show the year of age the print's clock falls in (at the place of
birth; 67 at the place of the "Today" event). Checked in the 270 PDFs (`verifyVarshaClock`):

- the year and the return (64), to the second; the year is the `core`'s at the print's clock (`ageAt`: the whole mean
  sidereal years, 0 before birth), as are the years, months and days of the monthly and daily returns (75, 81:
  the whole twelfths and 360ths of the year in the remainder), checked against them;
- the annual chart table (66): degree, sign, nakshatra, KP lords, R/c, dignity, SB%, and where the
  line comes out whole, SB#, VB, the bindus and the Avastha. The counted columns and the Avastha are cut in
  one way in each chart (from the data: the same chart at both dates, different charts in different
  ways), and are only checked where the Sun's line carries all of them. The bindus are those of the Ashtakavarga of the
  annual chart itself (Rahu those of the Lagna, Ketu none), as in the transit vargas. The Moon comes out
  combust within 12° of the Sun (`combustInTable`), which the reports never show. The SB% here
  is that of the Shadbala of the annual chart at the place of birth, equal to the `core`'s (with half a hundredth of
  slack on values exactly at the half);
- the kakshas of the annual planets in the natal Ashtakavarga (66), like those of the transits;
- the Panchavargeeya to one decimal place, the five office-holders with the strength to two, the year lord and the Muntha
  rounded to the second and shown to the minute (65);
- the 37 Sahams of the natal chart and the 37 of the annual one (74), with the reports' pending items.

The VB of the nodes stays pending, as in the Muhurta. Not read: the drawn charts (the D9, the eight charts
of 70, those of 91 and 92, which do not carry the yogas or the Tripataki in text) and the (L) variant of 67,
which repeats 64 at the place of the event.

### The dasha lists (64, 65, 75, 81 and 89)

Twelve lists of 15 lines (chain of lords, weekday and start date), checked in the 270
PDFs (`worksheetDashaLists`, `verifyVarshaLists`):

- 89: the Patyayini, the Mudda, the Mudda (Kalidasa) and the Mudda without balance at three levels, and the natal
  Vimshottari at three; 64: the Kalidasa and the natal at three; 65: the Kalidasa at four; 75 and 81: the dasha of the
  monthly and of the daily return, and the natal again.
- The start: the line running at the print's clock read as UT (the clock + 5h30, as on the
  other clock pages), or the return when it comes later; the daily list always starts at its
  return, and the natal one at the clock or at the first period.
- The levels below the annual periods (`deepenAnnual`): in the Mudda, the Vimshottari years / 120 starting
  from the lord itself; in the Patyayini, the fractions of the subperiods of the first period starting from the
  lord itself, over the true periods (those of the `corrected` mode), cycle after cycle.
- The parts of less than 5 minutes are dropped, except the first of the year (the reports' Patyayini rule;
  the Kalidasa at four levels also loses 3.8-minute parts).
- The monthly and daily returns: the return chart (75: years and months; 81: years, months and days) and the
  Mudda of its Moon (`moonMudda`), starting from the lord of the Moon's nakshatra with its balance, over
  365.2422/12 days in the monthly one (three levels) and 365.2422/360 in the daily one (one level). The
  return header is checked to 25 seconds: PL9 gives it up to 20 seconds earlier than the `core` (cause not found).
- The dates in the birth clock, with 15 seconds of slack at midnight (60 in the
  Kalidasa lists, whose start the annual Moon fixes up to one minute earlier).

Result: 49,140 values, 0 problems. Border cases: seven lists that PL9 starts one line
later, all with a period that starts less than one minute after the clock (the bench only accepts the
line ahead under that condition). The age at the clock: 1,620 values; one day of age (REF
0037) turns 53 seconds after the clock and is a border case. Pending: the Patyayini
of eight charts (the same at both dates), where PL9 omits or swaps lines with no rule found (in
REF 0269 it shows parts of 4.57 and 4.44 minutes and omits the 4.60 one between them; in REF 0010, 0269 and
0270 it keeps only the last parts of a short subperiod). Like the reports' pending items, what
draws these lines is the report's model. Tested and discarded: times in single precision
(224 of 270 lists, against 254 with the 5-minute rule).


The 72 returns of the 135 charts: dates 9,720 of 9,720; hours 9,695, the other 25 within one second of the
minute turnover; degrees 87,123 of 87,480, the others of the Lagna (which moves 15" per second of time)
at the minute turnover. The year's return in the reports up to 120 years: 161 of 161 to one second, the
planets to within 1". The monthly charts: 2,063 of 2,064 hours. The year lord: 9,720 of 9,720 in the
returns, 299 of 300 in the reports. Harsha 2,099 of 2,100, Panchavargeeya 2,078 of 2,100 (the
differences in the reports above 120 years), the office-holders 1,499 of 1,500.
