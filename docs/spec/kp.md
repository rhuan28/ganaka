# The Krishnamurti chart

The KP chart as PL9's pages "Krishnamurti", "Krishnamurti II" and "Krishnamurti Prashna", the KP columns of the
Bhavas page and the KP reports give it, read in PL9 and checked against its printouts. Code:
`packages/core/src/kpChart.ts` (the lords of a point are `kpLords`, `packages/core/src/kp.ts`); endpoint `/v1/kp`
in [api.md](api.md). Planets are the nine, Sun to Ketu.

## Cusps

Placidus, with the pieces of PL9's Lagna ([lagna.md](lagna.md)): its local sidereal time, the mean obliquity, and the
same correction at the end (less the thirteen-term nutation, less the ayanamsha). Cusp 1 is the Lagna and cusp 10 the
midheaven, atan(tan θ / cos ε) taken to θ's quadrant. Cusps 11 and 12 start from the sidereal time plus 30° and 60° and
take a third and two thirds of the diurnal semi-arc; cusps 3 and 2 start from it plus 150° and 120° and take a third and
two thirds of the nocturnal one, each by exactly ten rounds of x = θ + DSA(x)/f (or θ + 180° − NSA(x)/f), with
DSA = acos(−sin x · tan ε · tan φ), and no test of convergence; each x goes to the ecliptic as the midheaven does. The
other six are opposite. Like the Lagna, the cusps are undefined from the latitude 90° − ε on.

The KP pages use the chart's ayanamsha; PL9's KP reports compute everything again with the Krishnamurti one
(`ayanamsha: 'krishnamurti'`). The "KP Ayanamsha" PL9 prints adds the nutation (about 8"), for show only.

## Houses and significators

A planet is in the house from a cusp to the next, the cusp included. For each house: the occupants (in the order Sun to
Ketu); for each occupant in turn, the planets in a nakshatra it rules (the groups joined as they come); the owner, the
lord of the cusp's sign; and the planets in a nakshatra the owner rules. The nodes have no other agency. Each planet
also says whether it is retrograde.

A planet signifies a house with 2 points for the house its nakshatra lord occupies and for its own, and 1 for each house
whose cusp sign either of them rules (a planet in its own nakshatra counts both times): 4 or more is "very strong", 3 "strong", 2 "normal", 1 "weak" (from PL9's pages;
the routine was not read).

## Ruling planets

The lord of the Vedic weekday ([time/panchanga.md](time/panchanga.md)); the lord of cusp 1's sign, its nakshatra lord and
its sub lord; the same of the Moon; and Fortuna, cusp 1 + the Moon − the Sun. The balance of the dasha is the first
Vimshottari period, its lord and the time left at birth in calendar years, months and days (30 days a month).

## Horary chart

PL9 numbers the 243 subs of the nakshatras from Ashwini's Ketu sub at 0° Aries; the six subs a sign begins inside
(Krittika's Rahu, Punarvasu's Moon, and the same 120° and 240° on) take two numbers, one for each sign, which makes 249.
For a number, PL9 searches back in time from 0.001 day after the instant: by 0.0015 day (0.0005 when the Ascendant is in
the next number) until the Ascendant at the place falls in the number's part, then by 0.0001 and by 0.000005 day while it
stays there. The cusps are those of that moment; the planets those of the instant itself. So the Ascendant lies within
a few seconds of arc after the start of the part (PL9 prints 00:00:04 Aries for number 1). Where the Ascendant runs
fast, at high latitudes, PL9's first step can pass over a small part every day and its search never ends; the `core`
then searches again with a first step of 0.0002 day, which the `corrected` mode always uses. Option `horary` (1 to 249);
the answer gives `horary.cuspsJdUt`.

## Checked

Against PL9's KP print model for the 135 reference charts (`check-kp`): the worksheet cusps and their lords (1620),
the significators (1620 houses), the houses of each planet by strength (1215), the ruling planets and Fortuna (135),
the Bhavas page's KP cusps (1620), the report's cusps in the Krishnamurti ayanamsha (1620) and the horary chart
number 1 at each print's instant and place (1620 cusps and significators): every value matches.
