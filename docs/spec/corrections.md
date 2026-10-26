# The two calculation modes and the corrections

## The two modes

The `core` calculates in one of two modes, chosen by the `fidelity` option:

- **`pl9`** reproduces Parashara's Light 9, including where it is wrong. It is the
  mode checked against the values extracted from the program: everything
  `docs/reports/conformance.md` reports is in this mode.
- **`corrected`**, the default, is the same calculation with PL9's proven defects
  fixed.

Every result carries the `fidelity` field, which says in which mode it was calculated.
The low-level functions of the `core`, which are the reproduction of PL9, use
`pl9` when the mode is not given; `computePositions`, `computeChart` and the command
line use `corrected`.

## The criterion

A defect only counts as a correction if a test demonstrates it without depending on
opinion:

- an instant that should put the degree of the Sun on the horizon and does not;
- a result outside the set of possible results;
- a constant that differs from the source the calculation itself follows;
- an outdated table.

Conventions and choices of the program's author are not corrected, even when
other programs do it differently: without an external criterion, "better" would be
mere preference, and the result would stop matching what a PL9 user
expects to see.

Each correction below has a test that shows the defect in `pl9` mode and the
fix in `corrected` mode: the ephemeris ones in
`packages/oracle/test/corrections.test.ts`, the D2 one in
`packages/core/test/vargas.test.ts`, the Mandi one in both, the D11-iyer one in the
`core`, the dasha ones in `packages/core/test/dashas.test.ts` and
`packages/core/test/kalachakra.test.ts`.

## The corrections

### 1. Sunset and next sunrise

**What PL9 does.** It looks for these instants with a search that stops when
it gets close (to a thousandth of a degree, measured against an approximate position of the
Sun) and takes one more step. The sunrise comes out right to within a thousandth
of a second. The sunset and the next sunrise do not: in 120 reference
charts, they are up to 0.015° off the horizon, which is a few seconds
of time.

In a rare case — about one chart in twenty thousand, at any latitude — the
sunset search ends on the first pass and the final step uses a
slope left over from the previous search. The sunset comes out almost a degree
from the horizon, minutes of time.

**Why it is a defect.** The program itself defines sunset as the
instant at which the degree of the Sun is on the western horizon. The instant it
returns does not satisfy that definition.

**What `corrected` mode does.** It finds the true roots, by scanning
and bisection, down to the resolution of a Julian day (0.04 millisecond). The
definition does not change.

**Effect.** The Gulika, which is a Lagna at an instant derived from sunset,
shifts by more than ten minutes of arc in the two charts of the rare case. In
ordinary charts the shift from this correction is seconds of arc; the
numbers in the table at the end (median of 2.8", maximum of 12") add the effect
of this correction and that of Delta T.

The panchanga has a search of its own, with the Sun moving at its mean speed, which
also stops without checking: the sunrise, sunset and next sunrise it prints
are, in `corrected` mode, the exact ones. Near 65° of latitude PL9's search can
stop hours away from the horizon (REF 0013: sunset three and a half hours after
sunrise; REF 0124: next sunrise 28 hours later).

Tests: "the sunset when PL9's search settles at once"; "the sunset and
the next sunrise of an ordinary chart"; "in the corrected mode takes the exact
sunrise, sunset and next sunrise (corrections 1 and 2)".

### 2. Sunrise search at high latitudes

**What PL9 does.** From about 65° of latitude on, the search stops
converging on some of the days; the program uses whatever it produced. At 66°, in
87 of 120 instants tested over a year the result is more than
half a degree from the horizon or is unusable.

**Why it is a defect.** The degree of the Sun crosses the horizon every day below
the polar circle; the root exists and the search does not find it.

**What `corrected` mode does.** The same scanning and bisection as item 1,
which finds the root at any latitude at which the Lagna is defined. On the same
120 instants, no failures.

**Effect.** In `pl9` mode, the chart comes back without Gulika and Prana Pada when the
search is unusable (see "Points that are not defined"). When it ends
without converging but with instants in order, `pl9` mode returns what PL9
would return — a Gulika and a Prana Pada that may be degrees off — only with
`verified` false. In `corrected` mode, the chart comes back complete and correct up to
half a thousandth of a degree from the polar circle; closer than that (about 50
meters on the ground) the root may not be found, and the chart comes back without the two
points.

Test: "the sunrise search at high latitudes".

### 3. D2 at exactly 15° of an odd sign

**What PL9 does.** It treats exactly 15° as the end of the first half, and the
computation it does at that point gives Virgo.

**Why it is a defect.** The D2 has only two signs, Cancer and Leo.

**What `corrected` mode does.** It gives Cancer: exactly 15° is the start of the
second half, as in the other vargas.

**Effect.** Only exists for a longitude exactly equal to 15° of an odd
sign.

Test (in the `core`): "at exactly 15 degrees of an odd sign gives Virgo in D2
as PL9 does, and Cancer in the corrected mode".

### 4. Two coefficients of the Lagna's nutation

**What PL9 does.** In the thirteen-term series it subtracts from the Lagna and the
midheaven, it uses in two places a coefficient that is not the one in the
published series (see `lagna.md`).

**Why it is a defect.** The other coefficients are those of the series; these two
match neighboring values in the same table, which points to a swap in
transcription.

**What `corrected` mode does.** It uses the published coefficients.

**Effect.** Up to 0.002" in the Lagna.

Test: "the nutation coefficients".

### 5. Delta T

**What PL9 does.** It converts universal time to dynamical time with a
table that ends in 2014 and, from then on, extrapolates (see `delta-t.md`).

**Why it is a defect.** The extrapolation drifts away from the observed Delta T. Against
the values published from observation, PL9's is already off by more than 2
seconds in 2024, and the current library's stays within half a second from
2016 to 2024. The difference between the two exceeds 44 seconds in 2048.

**What `corrected` mode does.** It uses the Delta T of the current version of the Swiss
Ephemeris.

**Effect.** It is the correction with the largest effect. On the Moon, in the reference charts:
median of 1.35" and up to 2.9" before 1900; 0.19" from 1900 to 1950; 0.001" from
1950 to 2014; 13.6" after 2014, reaching 26" in 2048. On the Sun, 1.8" at
most. The Prana Pada, which amplifies any shift of sunrise,
changes by up to 47".

**What is demonstrated and what is not.** Demonstrated, by a test against
observed values: from 2016 to 2024 the current library's Delta T is the right one and
PL9's is not. **Not** demonstrated here: that before 1900 the current table is
better than PL9's. The two differ there by a few seconds (13.0 against
18.2 in 1801) because the library switched to a more recent historical
reconstruction; the project adopts the current one because it is the most recent, without
proof of its own. For future dates the current table is also an estimate, and it will be
revised when the library is updated.

Tests: three in "Delta T".

### 6. Mandi at night, from Wednesday to Saturday

**What PL9 does.** At night, it puts Mandi at the 10th, 6th, 2nd, 28th, 24th, 20th and
16th thirtieth of the night, from Sunday to Saturday.

**Why it is a defect.** The rule PL9 follows for Mandi is the classical
ghati table — by day it reproduces it on every day, and by night on
Sunday, Monday and Tuesday. The table gives 26, 22, 18 and 14 for the nights
from Wednesday to Saturday; PL9 gives two thirtieths more on each, as if the
count wrapped around at 30 instead of starting over from the table. It is a
constant that differs from the source the calculation itself follows; the 28 of Wednesday
night, moreover, is outside everything the table gives (from 2 to 26).

PL9's routine was not read: the source is deduced from the program following it
in every other case. The correction depends on the maintainer accepting that
deduction.

**What `corrected` mode does.** It uses the classical table: 10, 6, 2, 26, 22,
18 and 14.

**Effect.** Only on night births from Wednesday to Saturday: Mandi falls two
thirtieths of the night earlier, which usually moves the point a few degrees.

Measurement: in the charts printed by PL9, the Wednesday and Friday nights fell
exactly at the 28th and 20th thirtieths, and the Sunday and Tuesday ones at the 10th and 2nd; the
Thursday and Saturday ones, checked later across the whole bench, at the 24th and 16th. Test: "correction: Mandi at night from Wednesday to Saturday".

### 7. D11-iyer at exactly 0° of a sign

**What PL9 does.** It gives Taurus.

**Why it is a defect.** Within a sign, the eleven parts of the D11-iyer give
Aries and then Pisces, Aquarius… down to Gemini; Taurus is not a possible result
of this varga.

**What `corrected` mode does.** It gives Aries: exactly 0° is the start of the
first part.

**Effect.** Only exists for a longitude exactly equal to 0° of a sign.

Test (in the `core`): "at exactly 0 degrees of a sign gives Taurus in D11-iyer
as PL9 does, and Aries in the corrected mode".

### 8. The dasha year PL9 calls 365.25

**What PL9 does.** With the "Dasha year" option of 365.25 days, it calculates with
365.2422 stored in single precision, 365.2421875 days.

**Why it is a defect.** The constant differs from the one the program itself declares
in the option. Measured: with 365.2421875, the printed sookshma changes land on the
minute; with 365.25, they are off by hours.

**What `corrected` mode does.** It uses 365.25 days. The year of 365.2422 remains
available as an option of its own (`365.2422`), in both modes.

**Effect.** All dasha dates with this option, the default: 0.78 day per
century counted from the start of the first period.

Test: "correction: the dasha year PL9 calls 365.25".

### 9. Shravana first in the group of Saturn, in Ashtottari

**What PL9 does.** In Ashtottari, the balance at birth is the already
traversed part of the lord's group of nakshatras: (position in the group + fraction of the
nakshatra) / size of the group. The group of Saturn is Purva Ashadha, Uttara
Ashadha, Abhijit and Shravana; PL9 gives Shravana position 0, not 3.

**Why it is a defect.** In every other nakshatra, of both group
systems, the position is the order in the group, the rule the calculation itself follows. With
position 0, when the Moon passes from Abhijit to Shravana the traversed part
falls back from 3/4 to almost 0: two births seconds apart have
dashas years apart.

**What `corrected` mode does.** It gives Shravana position 3.

**Effect.** Only in Ashtottari, and only with the Moon (or the starting point) in
Shravana: the Mahadasha of Saturn running at birth starts 7.5 years
earlier, and all the following dates with it.

Test: "correction: Shravana first in the group of Saturn in Ashtottari".

### 10. Shravana counted from 280°04'

**What PL9 does.** In both group systems (Ashtottari and
Shastihayani), the traversed fraction of Shravana is counted from 280°04' to
293°20', although Abhijit occupies the arc up to 280°53'20". The starting point was
measured from the printed dates (between 280.065° and 280.067°, in six charts).

**Why it is a defect.** On leaving Abhijit, Shravana already starts with a 6%
fraction: the arc from 280°04' to 280°53'20" is counted twice, as Abhijit and
as Shravana, and the balance jumps at the boundary. No Moon gives Shravana a
fraction smaller than 6%, a result outside what is possible for the traversed part
of a nakshatra.

**What `corrected` mode does.** It counts Shravana from the end of Abhijit, 280°53'20",
to 293°20'.

**Effect.** Only with the Moon in Shravana, in both group systems: the balance
changes by up to 6% of the nakshatra, less than two months of period.

Test: "correction: Shravana counted from 280°04' though Abhijit holds it until
280°53'20"".

### 11. "By time" balance ignored in the group systems

**What PL9 does.** With the "By time" balance option, it calculates the traversed
fraction of the nakshatra by time in the eleven systems that count nakshatras,
and keeps going by degree in Ashtottari and Shastihayani.

**Why it is a defect.** The program's own option says the balance is by
time, and it applies it in every other system. Measured: in 30 charts
printed with "By time", the fraction deduced from the dates of the two group
systems is the one by degree, not by time.

**What `corrected` mode does.** It uses the fraction by time inside the
groups too: (position in the group + fraction of the nakshatra by time) / size of the
group.

**Effect.** Only with "By time", in Ashtottari and Shastihayani: the balance changes
by the difference between the fraction by degree and by time, generally a few days.

Test: "correction: the balance by time ignored in the groups".

### 12. Kalachakra: mahadashas in zodiacal order

**What PL9 does.** With the option "Continue mahadashas in following pada", the
mahadashas after the one running at birth follow the order of the zodiac
(Cancer, Leo, Virgo…).

**Why it is a defect.** The option says the mahadashas continue to the following
pada, and the sequence of signs PL9 itself uses to find the
running mahadasha and the balance is that of the pada. The continuation through the zodiac differs
from both: it is a rule different from the one the calculation follows.

**What `corrected` mode does.** After the running mahadasha, it follows the
rest of the sequence of the Moon's pada and then the sequences of the following
padas, in the order of the 108 padas.

**Effect.** Almost always, all the mahadashas after the one running at
birth, and their periods: most pada sequences do not follow the
order of the zodiac (Ashwini 2: Capricorn, Aquarius, Pisces, Scorpio…). In the
130 reference charts, 126 have a different list of mahadashas in
`corrected` mode. Only the padas whose sequence runs through the zodiac (such as
Ashwini 1, Aries to Sagittarius) match, up to its end.

Test: "correction: the mahadashas go on through the zodiac, not to the
following pada".

### 13. Kalachakra: "Cycle through mahadasha within the same pada"

**What PL9 does.** It accepts the click on the option but does not save it: on reopening the
preferences, "Continue mahadashas in following pada" is checked again, with 9 or
12 antardashas. The option cannot be used.

**Why it is a defect.** An offered option that the program does not keep; there is no
PL9 result to check.

**What `corrected` mode does.** After the running mahadasha, it repeats the
sequence of the Moon's pada. In `pl9` mode the option is rejected
(`NotImplementedOptionError`).

Test: "correction: the mahadashas cycling within the same pada, an option PL9
does not keep".

### 14. Kalachakra: "9 Antar Dasha"

**What PL9 does.** The reports with this option are inconsistent. In 30 charts,
over 268 mahadashas: 117 with the name out of sequence, 58 pairs of overlapping
periods, 80 in which the antardashas do not add up to the duration of the mahadasha. The
antardashas are the nine signs of the zodiac starting from that of the mahadasha, each one
in proportion to its years, but the sum of years it divides by is that of the first
mahadasha, reused in the others.

**Why it is a defect.** Overlapping periods and subperiods that do not fill
the period are results outside what is possible.

**What `corrected` mode does.** The nine signs starting from the sign of the
period, in zodiacal order, each with `period duration × years of the
sign / sum of the years of the nine`, the sum recomputed for each period, at every
level. In `pl9` mode the option is rejected (`NotImplementedOptionError`).

Test: "correction: nine antardashas, inconsistent in PL9".

### 15. Drig: the sign computation cut to eight bits

**What PL9 does.** When building the Drig order, when the sign computation falls
below 1, the number is cut to eight bits before wrapping back to 1..12, and the
sign comes out four ahead. With the Lagna in Virgo, Libra, Scorpio, Sagittarius
or Capricorn, the order repeats signs and leaves others out.

**Why it is a defect.** The Drig rule gives, after the 9th, the 10th and the 11th, the
three signs each one aspects; the sign four ahead is not aspected by
it, and a sign dasha that repeats signs and forgets others does not cover the
zodiac.

**What `corrected` mode does.** It wraps the computation back to 1..12 as it is: each of
the three signs is followed by exactly the three it aspects.

**Effect.** The Drig order, and the dates from the first swapped sign on, in
charts with the Lagna in one of those five signs.

Test: "correction: the Drig order cut to eight bits".

### 16. Second run of the Narayana, the Lagna Kendradi and the Drig

**What PL9 does.** The mahadashas of the second run take 12 years less than
those of the first, but each antardasha is timed by the years of its count: the
first twelve antardashas of a mahadasha take a twelfth of the first run's years
of its sign, the next twelve a twelfth of the second's. In a mahadasha of the
second run they therefore run past its end (the next row PL9 prints falls in
the middle of the next mahadasha) or fall short of it (the antardashas go on
past the twelfth). The Lagna Kendradi and the Drig also count their signs on
from run to run: the Lagna Kendradi's second run starts three signs further on,
the Drig's with the 12th from the Lagna. On the #2 pages of the reports, whose
boxes hold twelve rows each under the mahadasha of the first, this looks
scrambled (`docs/spec/dashas/rashi.md`, "Cycles").

**Why it is a defect.** Antardashas that do not fill their mahadasha, or run
past it, are results outside what is possible; the order of the signs changes
from run to run with no rule behind it.

**What `corrected` mode does.** The classical rule: in the second run each
sign has 12 years minus those of the first (a sign left with 0 is skipped);
the third repeats the first, and so on; the same order every run; each
mahadasha divided in twelve equal antardashas. By default, as many runs as
cover 120 years. In `pl9` mode, PL9's table, every run asked.

**Effect.** The antardashas of every run after the first; in the Lagna Kendradi
and the Drig, also the mahadashas from the second run on.

Test: "correction: the second run of the Narayana, Kendradi and Drig, 12
years less those of the first"; "PL9's table of the Narayana, Lagna Kendradi
and Drig past the first run"; "the second run".

### 17. "Niryaana Shoola Dasha" report

**What PL9 does.** The report with that name prints the Drig.

**Why it is a defect.** The report does not carry the dasha it names.

**What the modes do.** In both, the Niryaana Shoola as the
worksheet cell gives it (from the stronger of the 2nd and the 8th). The defect is in the
report only and does not change the calculation; it is recorded because the bench skips those
pages.

### 18. Ashtakavarga: the method names swapped

**What PL9 does.** With the option "Ashtakavarga: Varamihira", the default, PL9
calculates Parashara's houses: Jupiter gives a bindu in the Moon's chart in the 12th house
from itself, not the 2nd; Mars, in Venus's, in the 5th and not the 4th. With
"Parashara", Varahamihira's. Confirmed by printing with each one.

**Why it is a defect.** The option's name states one school and the calculation does the
other.

**What `corrected` mode does.** Each option gives the houses of the school it
names: "Varamihira" (the default, `method: 'varahamihira'`) Varahamihira's,
"Parashara" Parashara's.

**Effect.** In the default, the Moon's chart and Venus's chart, their sum in the
Sarvashtakavarga, the reductions and the pindas of those charts, in almost every chart.

Test: "correction: the names of the method the right way round".

### 19. Saptavargaja of the Moon in the first three degrees of Taurus

**What PL9 does.** In the D1, the Moon in Taurus receives 45 (moolatrikona) after
3° and **0** before.

**Why it is a defect.** 0 is outside the possible values of the part (45, 30,
22.5, 15, 7.5, 3.75, 1.875).

**What `corrected` mode does.** In the first three degrees, the points of the
Moon's compound relationship with Venus, the lord of Taurus, as in any other
sign not its own. In the same mode, the Saptavargaja and the Ojhayugma use the corrected vargas
(correction 3, D2 at exactly 15°).

**Effect.** Charts with the Moon between 0° and 3° of Taurus: the Saptavargaja, the Sthana
and the total of the Moon.

Test: "correction: the Moon in the first three degrees of Taurus takes its
relationship with Venus in the Saptavargaja".

### 20. Shadbala day beyond 65° of latitude

**What PL9 does.** Beyond 65°, north or south, it counts the Shadbala day
(Nathonnatha, Tribhaga, the hora, the day/night side of the lords) as if the
place were at 60° north — in the southern hemisphere, with the seasons swapped.

**Why it is a defect.** The instant it gives as sunrise does not put the Sun
on the place's horizon (first criterion).

**What `corrected` mode does.** It uses the place's latitude. Where PL9's search
(secants) does not settle, such as near the equinoxes beyond 65°, it finds the
crossing nearest the guess in a scan at three-minute steps,
with bisection. In the tests at ±64° and ±66° on four dates of the year, the sunrise and the
sunset came within 0.2 minute of the `core`'s sunrise. If even then there is no
crossing, the Shadbala is rejected with `SunriseUndefinedError`.

**Effect.** Only charts beyond 65° of latitude: Nathonnatha, Tribhaga, Hora and
the totals.

Test: "correction: the day of the Shadbala at the latitude of the place, past
65 degrees too".

### 21. Cheshta outside the cycle series

**What PL9 does.** For births before about 1806 or after about
2045 (depending on the planet), the cycle index falls outside PL9's series, which
uses date 0; its ephemeris does not calculate it, and the Cheshta comes out arbitrary.

**Why it is a defect.** The value does not depend on the chart (second criterion).

**What `corrected` mode does.** It carries the same series forward, for any
index, and the peak from Mercury to Saturn is always that of the previous index (PL9
takes it from the same index in the first cycle). Checked against the ephemeris, the
extrapolated zeros and peaks from 1800 to 2400 are off by a few degrees of elongation,
like those inside the series.

**Effect.** Only charts outside the series: the Cheshta of Mars to Saturn and what
depends on it (totals, ratios, ranking, Ishta and Kashta). These charts no longer
appear in `cheshtaOutsideSeries`.

Test: "correction: the Cheshta past PL9's series, by the same series carried
on".

### 22. Shifted Saptavarga weights

**What PL9 does.** In the Saptavarga Vimshopaka, it gives the D7 weight 1, the D9 2.5,
the D12 4.5 and the D30 2 (in twentieths), the weights of the books shifted one varga
ahead.

**Why it is a defect.** A constant that differs from the source the calculation itself
follows (third criterion): PL9's Shadvarga, Dashavarga and Shodashavarga use
the weights of the books.

**What `corrected` mode does.** The weights of the books: D1 5, D2 2, D3 3, D7 2.5,
D9 4.5, D12 2, D30 1.

**Effect.** The Saptavarga of almost every planet; the other groups do not change.

Test: "correction: the Saptavarga weighed with the weights of the books in the
corrected mode".

### 23. Weekday repeated in the Panchang printout

**What PL9 does.** In Print → Panchang, on the day after a tithi whose end goes past
the next sunrise (printed "..."), it repeats the weekday of the row above:
January 10, 2026, a Saturday, comes out "Fri" (the three January printouts).

**Why it is a defect.** An impossible result (second criterion): the date in the
same row is a Saturday.

**What `corrected` mode does.** The weekday of the date.

**Effect.** One day in each tithi that spans two sunrises, only in the Panchang table;
the elements, the times and the birth page do not change.

Test: "correction: the weekday of the Panchang table".

### 24. The year lord when only the Moon aspects the Lagna

**What PL9 does.** When no other office-bearer aspects the annual Lagna and the Moon, itself one of the office-bearers,
does aspect it, the program has a branch whose text says that, the Moon being stronger than the other
candidates, the strongest planet in Ithasala with it will be the year lord. The branch's condition,
however, was written as "the Moon is not one of the office-bearers", the opposite of what leads there: the branch
never runs, and the year lord stays the Muntha Pati.

**Why it is a defect.** A condition that contradicts the branch's own entry (second
criterion): the result cannot be what the program's text describes.

**What `corrected` mode does.** The branch as the text says: if the Moon's Panchavargeeya strength is
greater than that of all the other office-bearers, the strongest of the seven planets in Ithasala with the Moon (on a
tie, the first in the order Sun to Saturn; PL9's dead code would start the search from the Sun
even outside the Ithasala); none in Ithasala, the lord of the Moon's sign. If the Moon is not the
strongest, the Muntha Pati, as in PL9. The branch does not require a minimum strength (PL9's text does not require one,
unlike the main branch, which requires 5), and the Ithasala is the one in `tajika.ts`: the two signs in
aspect, the faster behind the slower within the orb, without crossing the end of the sign.

**Effect.** The year lord (and the month lord, which follows the same rule) in this case; the nodes are left
out, because PL9 gives them no Tajika speed.

Test: "correction: the year lord the Moon's Ithasala names".

### 25. Reports above 120 years

**What PL9 does.** When an age above 120 is requested, the header writes that age, but the chart
and everything derived from it are for an instant near birth.

**Why it is a defect.** A result that contradicts its own header (second criterion).

**What `corrected` mode does.** The chart of the requested age.

**Effect.** The reports above 120 years. The `core` calculates the requested age in
`pl9` mode as well, which here does not reproduce PL9: the instant PL9 uses has not been identified. The check
compares, in those reports, only the 72 returns.

Test: "computes the age asked above 120 (correction 25: PL9 prints a chart near the birth)".

### 26. Parts of the even run in the Narayana chain

**What PL9 does.** In the Narayana chain at the instant ("Gochara data", in the transits and in
Muhurta), the mahadashas of an even run have 12 years minus those of the first run, but the parts
below them are measured by the years of the first run: a 7-year mahadasha (5 in the first
run) has twelve parts of 5/12 of a year, and after them parts of 7/12. PL9 counts the run
by the parts of the level it is at, not by the mahadashas.

**Why it is a defect.** Parts that do not fill the period, or that go past it, are results
outside what is possible (first criterion), as in correction 16.

**What `corrected` mode does.** Each period in twelve equal parts, at every level.

**Effect.** The instants of an even run, below the mahadasha: in the 540 checked instants of the
transits, 113 chains differ between the modes (107 already at the second level), all from charts more
than one run old.

Test: "the corrected mode divides the mahadasha of the second run in twelve equal parts".

### 27. Patyayini rows under the wrong period

**What PL9 does.** The Patyayini table omits subperiods shorter than 5 minutes and
fills each period with the next eight rows of the running list: after an omitted
row, each period starts at its second subperiod and ends with the first of the following
period, and the last period ends with rows of the next cycle. When the first row of the
year is omitted, the whole first period disappears and the year ends with a period of the next cycle.

**Why it is a defect.** Subperiods outside the period that contains them (first criterion): the table
puts under a period rows that start after its end.

**What `corrected` mode does.** Each period with its own eight subperiods, however short they
may be.

**Effect.** The years with a subperiod shorter than 5 minutes: 21 of the 172 checked
reports.

Test: "prints the Patyayini as PL9 does: a part shorter than five minutes left out, the rows
moving on, eight to a period".

## What is not corrected

| PL9's choice | Why it stays |
|---|---|
| Sunrise as the degree of the Sun on the horizon, without refraction or semidiameter | It is a definition, and a traditional one |
| Constants of the nine ayanamshas | Each ayanamsha is a convention |
| Gulika's weekday by the local clock, and by the date twelve hours earlier at night | A rule of the program, with no demonstrable right or wrong |
| True node model | It has not been identified which source it differs from |
| D30 boundaries belonging to the part that ends | A boundary convention |
| Lagna with a short four-term nutation in sidereal time and mean obliquity | A precision choice of the author: there is no swapped constant and no impossible result |
| Nodes never marked as retrograde | A display convention |
| Nakata and Yamaya never shown in the Varshaphala, although the rules (read in the executable) form in many charts | The choice lies in the report's model, which was not read, and there is an innocent reading (the pair of the lord of the Lagna and of the matter); reopen if the model is read |
| Jupiter never the first planet of a pair in the yogas built on the Ithasala, although the rules accept the pair | Also from the report's model, not the code: a suspicion, not a demonstration; reopen if the model is read |

## Points that are not defined

In both modes, a point that is not defined at the given place is left out of the
result, and the `missing` list says which one and why; the rest of the chart comes back.

| Situation | Missing | Reason |
|---|---|---|
| Beyond the polar circle (from 90° minus the obliquity) | Lagna, Gulika, Prana Pada, Mandi, houses | `beyondPolarCircle` |
| Sunrise search with no usable result: `pl9` mode from 65°; any mode within half a thousandth of a degree of the polar circle or about a day from the end of the ephemeris data | Gulika, Prana Pada, Mandi | `sunriseNotFound` |

## Difference between the modes in the reference charts

Absolute difference between `corrected` and `pl9`, in seconds of arc, in the 380
reference charts (1801 to 2047). Generated on 2026-10-13 by
`pnpm --filter @reverse/oracle compare-modes`.

| Point | Median | 95th percentile | Maximum |
|---|---|---|---|
| Sun | 0.078 | 1.315 | 1.786 |
| Moon | 1.025 | 18.330 | 25.847 |
| Mars | 0.037 | 0.863 | 1.348 |
| Mercury | 0.090 | 2.172 | 2.867 |
| Jupiter | 0.009 | 0.253 | 0.399 |
| Venus | 0.076 | 1.465 | 2.166 |
| Saturn | 0.004 | 0.089 | 0.163 |
| Rahu and Ketu | 0.002 | 0.085 | 0.295 |
| Uranus | 0.002 | 0.054 | 0.105 |
| Neptune | 0.002 | 0.040 | 0.062 |
| Pluto | 0.001 | 0.029 | 0.050 |
| Dhuma to Upaketu | 0.078 | 1.315 | 1.786 |
| Gulika | 2.825 | 9.262 | 12.055 |
| Prana Pada | 2.646 | 28.462 | 46.634 |
| Lagna | 0.000 | 0.002 | 0.002 |

Almost all the difference in the planets comes from Delta T, and it is concentrated in the
charts before 1900 and after 2014.

## What the corrected mode does not have

An external answer key. The `verified` field of the result only says that the chart is within the
range of dates and latitudes in which `pl9` mode was checked; it does not say that the
numbers of `corrected` mode match PL9's. `pl9` mode is checked against PL9; `corrected` mode
is checked by internal consistency — the degree of the Sun is on the horizon, the
coefficient is the one in the published series — and not against another program. Where the
two modes match, the check of `pl9` mode holds for both; where they
differ, the test of the correction holds and nothing else.
