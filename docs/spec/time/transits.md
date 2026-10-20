# Transits (stage 5A)

What PL9 shows of the transits over a natal chart, how the `core` computes it
(`packages/core/src/transits/`) and where each rule comes from. Answer keys: the TEMPO PDFs
(`packages/oracle/fixtures-transits/`), over the copies of the reference charts with the
birth rounded to the second (`packages/oracle/refset-tempo.json`).

## The second instant

PL9's "now" transit chart takes the machine clock as the local time of the installation's
default place (Jaipur, 26N55'00, 75E49'40, time zone −5:30) and computes the Ascendant and the
houses at that place, not at the place of birth (read in the executable). The `core` never uses the clock:
`computeTransits(eph, natal, at)` receives the instant in UT and the place in `at`
(`TransitInstant`); the command line converts the Jaipur local time.

## Positions

Those of the chart at the instant and place of the transit, as in `computePositions`: the nine
planets and the Ascendant, with sign, nakshatra and the retrograde mark (the nodes never
marked). PL9 prints truncated degrees, minutes and seconds (from the data).

## KP lords

The "Graphical ephemeris - 3 month overview" and the timelines print, for each point of the
transit, the pada and three lords ("3,Su/Sa/Ve"), read in the executable (`kpLords`): the lord of the
nakshatra; the sub, found by stretching the 120 years of the Vimshottari over the 13°20' of the nakshatra
starting from its lord, each lord with its years; and the sub-sub, the same division of the sub starting
from the lord of the sub. PL9 counts the years already elapsed as integers, which gives the same as comparing them
exactly, because the years of the table are integers. For the sub-sub, it stretches the fraction of the sub over
a nakshatra by multiplying by 13.33333333 and adding 13.33333 minus that; the difference is one
thousandth of an arc second and applies in both modes.

## Vargas of the transit

The "Animated Transits - Vargas" draws the D9 and the D10 of the transit chart and, under each one, a
table per planet (`vargaTable`). All from the data, at 270 instants:

- degree in the varga (the longitude times the number of parts, within the sign), sign and nine-step dignity
  computed with the positions of the varga, like the dignity of the chart;
- "AV": the bindus of the planet in the Ashtakavarga built with the signs of the varga; Rahu shows those of the
  Lagna's table, Ketu none;
- "Av3": awake (Alr.) in exaltation, moolatrikona or own sign; asleep (Slp.) in debilitation
  or in the sign of a natural enemy; dreaming (Drm.) in the other cases, and the nodes by dignity only;
- "Av5": the Baladi over the degree in the varga (as in the Muhurta);
- "Func.": the functional nature by the sign of the varga's Lagna, Parashara's list per Ascendant
  (the seven planets, in a fixed table that the data show without conflict in the twelve signs);
- "In": the houses counted from the Lagna, the Moon and the Sun of the varga.

The functional nature of the nodes was not found: it follows neither the sign's owner nor a rule of the house alone,
and the table is not in the executable in the forms searched for. It is shown and not checked.

## Kakshas

Each sign is divided into eight kakshas of 3°45'; the kaksha is the integer part of the degree in the sign
divided by 3.75, so that a degree exactly at the end of a part falls into the next one. The
lords, in order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, Ascendant (read in the
executable). For each transiting planet (Sun to Saturn), in the natal Ashtakavarga, without
reduction (read in the executable):

- the kaksha's bindu: whether the lord of the kaksha gives a bindu to the transit sign in the natal Bhinna of the
  transiting planet (0 or 1);
- "Ash.": the bindus of the planet's natal Bhinna in the transit sign;
- "Sarv.": the natal Sarva (the sum of the seven Bhinnas, up to 56) of the transit sign.

## Tarabala and Chandrabala

From the natal Moon to the transiting Moon (read in the executable):

- Tarabala: the nakshatras between them, in cycles of nine, 1 to 9 — Janma, Sampat, Vipat,
  Kshema, Pratyak, Sadhaka, Vadha, Mitra, Atimitra; good are taras 2, 4, 6, 8 and 9. PL9
  prints the name followed by a description cut by the column width ("Mitra: Good");
  the names come from the PDFs.
- Chandrabala: the house of the transiting Moon's sign counted from the natal Moon's sign; "Inauspicious"
  in houses 6, 8 and 12, "Auspicious" in the others, without depending on the Moon's phase.

## Shadbala of the transits

What PL9 prints for the transiting planets is the full Shadbala of the transit chart
(at the instant and place of the transit) divided by the minimum required of each planet (390, 360,
300, 420, 390, 330, 300), with two decimals — the `ratio` of the stage 4 Shadbala. The printed
table was found in the executable; the division by the minimum comes from the data (it matches at the 270
checked instants).

## Dashas at the instant

PL9 prints in the "Gochara data" four dashas at the instant, five levels each, with the
lords in two letters joined by "-" ("Ra-Me-Ve-Ve-Ra"): Vimshottari, Yogini and
Ashtottari with planets (the Yoginis by the planet of each one: Mangala Mo, Pingala Su,
Dhanya Ju, Bhramari Ma, Bhadrika Me, Ulka Sa, Siddha Ve, Sankata Ra) and Narayana with signs
(Ar Ta Ge Ca Le Vi Li Sc Sa Cp Aq Pi). The format was read in the executable. `dashasAt` gives the
first three with the stage 3 engine. An instant before birth takes the first
period of each level, so that PL9 prints the first lord five times
("Ke-Ke-Ke-Ke-Ke"); this came from the data.

The Narayana at the instant (`narayanaChainAt`), read in the executable: the mahadashas follow the order
and the years of the Narayana (`docs/spec/dashas/rashi.md`), and each even round gives each sign 12 years
minus those of the first (the third repeats the first); each period is divided into twelve parts,
in the order of the antardashas of the sign of the period above, down to the fifth level. Below the mahadasha,
PL9 measures the parts by the years the mahadasha would have in the round counted by the parts of the
level itself: the first twelve parts of a level with the years of the first round, the next twelve
with those of the second, and so on. In the first round this gives twelve equal parts;
in an even round the parts do not fill the mahadasha or go past it (correction 26: the
`corrected` mode divides each period into twelve equal parts). The year is the one of the other dashas. Before
birth, the first sign at all five levels, as in the others, even if it has 0 years (PL9's
loop descends into the first period before adding its duration; the tables skip that sign).
At an instant exactly on the boundary between two periods, the one that begins there. Without a Lagna (beyond the polar
circle), `dashasAt` gives `null` for the Narayana.

The "Events 1-10" page shows, for the "Today" and "Muhurta" events, Vimshottari, Yogini, Ashtottari and
"Chara (As)" at five levels. The Chara, read in the executable, descends through the same routine as the Narayana
(`rashiChainAt`), with the order and years of the stage 3 Chara, the same years in every round and
equal parts: below the mahadasha, each period starts at the sign neighbouring the one above, forwards
or backwards according to the direction given by it, like the antardashas. From the data: the page computes the
events at the saved time (06:00) taken as UT, not as the event's Jaipur time; at that time the
four systems match in the 270 cases, and at the Jaipur time they do not. Without a Lagna, the Chara also comes out `null`.

## Sign ingresses

The "Yearly transit overview" shows, for the year of the instant, the periods of each planet in
each sign, with the day of entry and of exit. PL9's search, read in the executable, samples the
longitudes every half day and places the crossing by linear interpolation between the two
samples (`crossings`, `signIngresses`). The printed day is the calendar day in UT in the
reference charts, which all have time zone 0, and so it cannot be told whether PL9 uses UT or the chart's
time zone: the check is in UT, and this choice is an ambiguity of the data, not a reading. The page cuts some long lines at the edge, losing the
planet ("R: Nov 5 to (D) Nov 22"); those are left unchecked.

## Kaksha calendar

The "Kaksha and dasha calendar" draws, for each planet from Sun to Saturn, one bar per
kaksha across the month: the kaksha at the start of the month and each one the planet enters
(`kakshaCalendar`, with the same search, 3°45' boundaries), with the lord and the bindu as in the
kakshas above. Under the label of each bar PL9 prints the bindus of the sign the planet
is in when it leaves the kaksha (that of the next stretch), or of the stretch itself if the month ends first
(`shownAsh`); this came from the data, as did the position of the label, between 17% and 47% of the height of the
bar, and the bars PL9 does not label (the short ones at the start and end of the month and those of the Moon).

## Kota Chakra

The "Kota Chakra" worksheet numbers the 28 nakshatras, Abhijit between Uttara Ashadha and Shravana, starting
from the natal nakshatra of the Moon, and places each transiting planet in its own (`kotaChakra`, from the data: the 2430
printed positions). It also prints a score ("Score: -4.5") whose rule was not found: the texts
of the chakra are encrypted, and the 270 printouts, all under the same sky, are not enough to extract it from the
data (only the natal nakshatra changes from one to the other). The score is read and not checked.

## Sanghatta, Sarvatobhadra and the Ishta/Kashta of the transits (not checked)

Pages 115 (Sanghatta Chakra) and 116 (Sarvatobhadra Chakra) are drawings: they place each planet, the
natal ones inside and the transit ones outside in the Sanghatta and the transit ones in the grid cells in the
Sarvatobhadra, in its nakshatra (which the transit tables and the Kota Chakra already check), and draw
the vedha lines. Neither of the two prints a number. In the executable, the "Sarvatobhadrachakra score" and
the cells of the Ishta/Kashta of the transits (score, phase and position) are registered in a table of
cells, but the routine that evaluates them was not found, and no printed page shows them. They are left to
stage 6, with the drawing of the chakras.

## Month calendar

The "Calendar" worksheet lists, day by day, the events of the clock's month, in Jaipur time
(`monthEvents`). Which events go in is PL9 configuration, not a fixed rule: the transit preset
"Worksheet Calendar" of the options (read in PL9) marks the nine transiting planets, seven event
types and the targets — the nine natal planets, the Ascendant, cusps 4, 7 and 10 and the nakshatras and
signs. The events:

- the entry of each planet into a nakshatra and into a sign;
- conjunction, opposition and trine (both, at 120° on each side) with the natal planets, the Ascendant
  and cusps 4, 7 and 10, which are the midpoints of the equal houses: the Ascendant plus 90°, 180° and 270°
  (from the data; the Sripati houses do not match);
- the stations of Mars to Saturn ("R or D As");
- each new period of the fifth level of the natal Vimshottari, starting from 0h UT of the first day (from the
  data: the changes before 05:30 of day 1, in Jaipur time, never appear; the aspects do).

The search is that of the ingresses (samples every half day, straight lines between them); the time is truncated to the
minute. The planet's symbol carries "M" when it moves backwards; in the trines this holds in almost
all cases (109 of 4785 printed diverge, rule not found, and there the "M" is not compared). The
time of the stations and that of the dasha changes did not come out of PL9's routine: the `core` gives the station at the
instant the speed reaches zero, within a minute of the printed one, and the dasha changes come out within 3
minutes. Each day's cell cuts the last lines when they do not fit (from 5 to 9 lines, by the
width of the texts): an event is missing only if it comes before the last printed line of the day. The line
"-------" marks the print's clock, read as UT and shown in Jaipur time (from the data).

## "Time of transits"

Research → "Time of transits" gives the first moment, after a date, at which a transiting planet
makes an event with a natal point, to the second and in Jaipur time (the "Yearly
transit overview" dates in UT). The routine is the same as for the sign ingresses (read in the
executable); each event is the crossing of a longitude, in one direction
(`timeOfTransit`):

- "Transits": the natal degree, in either direction;
- "Fully aspects": the natal degree minus 30 × (house − 1) for each house of full aspect — the 7th
  for all, and also the 4th and 8th of Mars, the 5th and 9th of Jupiter, the 3rd and 10th of
  Saturn; the nodes only the 7th (this came from the data: Rahu in 2032 exactly opposite Venus);
- "gets in" / "leaves the same sign as": the start and the end of the point's sign, according to the
  direction; the same with the nakshatra;
- "gets within 45 degrees of" / "leaves the 45 degree orb of": the natal degree minus and plus 45°,
  according to the direction.

PL9 rounds the seconds (from the data) and marks "R" when the planet arrives retrograde. The "Transit/dasha
Report" of the Print menu uses the same search and was not printed separately.

## Options

The options that change the numbers on this page already have answer keys in the earlier stages: the
ayanamsha and the nodes (stage 2), the Ashtakavarga bindu table and the five
Shadbala options (stage 4). The `core` passes them on (`computeTransits`, `transitKakshas`); PL9 has no
transit-specific option that changes a number.

## Check

- The 270 reference instants (the Muhurta page, 1/1/2000 12:00 and 15/6/2030 06:00 in
  Jaipur, in the 135 charts): positions, R marks, kakshas with bindu, Ash. and Sarv., Shadbala,
  Tarabala and Chandrabala equal to PL9's in `pl9` mode.
- The 540 instants (the 270 reference ones and the 270 "now" ones): Vimshottari, Narayana, Yogini and
  Ashtottari equal. In the Narayana, 168 instants fall in the first round, 296 after it and 76
  before birth.
- The Kota Chakra positions in the 270 PDFs (2430 values): equal; the score is not checked.
- The October 2026 calendar in the 270 PDFs (42,409 lines and marks): equal. Each day prints
  at least five lines, or all of the `core`'s events for that day when there are fewer (the minimum capacity
  of the cell): a day with fewer lines fails.
- The D9 and D10 tables of the transit at the 270 "now" instants (37,800 values): equal.
- The Events page in the 270 cases: the date and the four dashas of the two events (2430 values): equal.
- The KP lords of the ten points at the 270 "now" instants (2700 values): equal.
- The last two columns of the transit table of worksheet 106 are the SB# (how many strengths of the
  transit chart's Shadbala are strong) and the VB (the Shadvarga Vimshopaka), as in the Muhurta
  (`computeTransits`: `shadbalaStrong`, `vimshopaka`). The table is cut in a different way in each chart
  (32 without the VB). At the 270 "now" instants: SB# 1890 of 1890, the VB of the planets 1666 of 1666 (to the
  unit); the VB of the nodes differs in 238 of 476 and is left pending, as in the Muhurta.
- The 49 sign ingresses of 2026 with a legible day: equal.
- The 3780 labels of the October 2026 calendar (135 charts): the lord of each one in a
  computed stretch, in order, and the 3645 numbers printed under them, equal.
- A border case: in REF 0170 (2030), the "now" page was printed at 06:30:55 Jaipur
  time, seconds before the change of the Shadbala hora lord at sunrise, and PL9
  printed Mars already after it and Saturn still before it. The "now" pages are drawn
  with the clock running; the bench accepts a Shadbala equal to the `core`'s 30 s before or
  after and lists it as a border case.
- The 17 "Time of transits" queries in REF 0010 (the eight event types, direct and retrograde
  planets, the nodes): equal to the displayed second, accepting 1 s either way for the
  rounding (up to 1.5 s from the computed instant).
