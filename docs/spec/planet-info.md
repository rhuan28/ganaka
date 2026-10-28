# Planet info

The data PL9 shows about each planet in its planet tables (the "Interpreting Grahas" and "Declination" pages, and the
same columns elsewhere), beyond the positions, dignities and strengths specified apart. Code:
`packages/core/src/planetInfo/`; endpoint in [api.md](api.md). Every rule here was read in PL9 and checked against
what PL9 prints; "PL9's" marks a choice of the program where the classical texts differ or say nothing.

The bodies are the nine grahas, Sun to Ketu, and, for the astronomy only, Uranus, Neptune and Pluto. A field given
for some bodies only says so.

## Astronomy

- **Declination:** the true declination, degrees, from the body's ecliptic longitude and latitude and the true
  obliquity of the date, all at the instant PL9's positions use ([corrections.md](corrections.md)). The nodes have no
  latitude: Rahu is PL9's own node ([node.md](node.md)) put back on the true equinox, its sidereal longitude plus the
  ayanamsha and the nutation in longitude; Ketu is its opposite, so its declination is Rahu's with the sign changed.
  PL9's Declination page lists Sun to Rahu and the three outer planets, not Ketu.
- **Kranti:** PL9's approximation of the declination, 23.45° times the sine of the tropical longitude, the latitude
  left out. It is the declination PL9's Shadbala uses ([strengths/shadbala.md](strengths/shadbala.md)).
- **Speed:** degrees a day, negative when retrograde, from the ephemeris at the same instant (for the nodes, the
  ephemeris' true node). **Speed against the mean:** 100 times PL9's mean daily motion
  over the actual speed, truncated, so a slow planet shows more than 100 and a retrograde one a negative number.
  PL9's mean motions: Sun, Mercury and Venus 0.985556; Moon 13.176667; Mars 0.616667; Jupiter 0.081111; Saturn
  0.033611; Rahu and Ketu 0.052993. None for the outer planets.
- **Retrograde:** a negative speed, marked for the planets and never for the nodes.

## Combustion

A planet is combust when its distance from the Sun is under the orb, in degrees, direct and retrograde: Moon 12 and
12, Mars 17 and 17, Mercury 14 and 12, Jupiter 11 and 11, Venus 10 and 8, Saturn 15 and 15. The Sun and the nodes are
never combust. **How combust:** 100 × (1 − distance / orb), rounded half up; PL9 works it out for Mars to Saturn
only, so a combust Moon shows 0.

## Avasthas

- **Deeptadi** (nine states), PL9's reading, by the dignity alone ([strengths/dignity.md](strengths/dignity.md)):
  exalted *deepta*; moolatrikona or own sign *swastha*; great friend *mudita*; friend *shanta*; neutral *deena*; enemy
  *dukhita*; great enemy or debilitated *khala*. PL9 never gives *vikala* or *kopa* here, though the texts tie them
  to combustion and to defeat in war.
- **Shayanadi** (twelve states): the planet's nakshatra (1 to 27) times its number (Sun 1 to Ketu 9) times its
  navamsa within the sign (1 to 9), plus the Moon's nakshatra, the Lagna's sign (1 to 12), the whole ghatis elapsed
  since sunrise and one, counted round 1 to 12: 1 *shayana*, 2 *upavesha*, 3 *netrapani*, 4 *prakasha*, 5 *gamana*,
  6 *agamana*, 7 *sabha*, 8 *agama*, 9 *bhojana*, 10 *nritya lipsa*, 11 *kautuka*, 12 *nidra*. Its sub-state:
  ((state² + Anka) counted round 1 to 12, plus the planet's constant) mod 3, where the constants are Sun 5, Moon 2,
  Mars 2, Mercury 3, Jupiter 5, Venus 3, Saturn 3, Rahu 4, Ketu 4. PL9 shows the sub-state as that number, 0, 1 or 2,
  without a name, and so does the engine. The ghatis are counted from the sunrise before the birth at the birth place
  ([sunrise.md](sunrise.md)). It needs the Lagna and the sunrise; without either it is missing.
- **Anka:** a number from 1 to 5 kept with each chart in PL9 (its "Anka value"); it changes only the Shayanadi's
  sub-state. A chart without one is read with 1, and the answer says which Anka was used.

## Relations

- **Hemmed:** PL9's column, the planets just before and just after this one in the zodiac, among the nine, at any
  distance. It is not the hemming between malefics of the yogas ([yogas.md](yogas.md)).
- **Final dispositor:** the lords of the signs followed from the planet until one comes back; the first to come
  back. A planet in its own sign is its own final dispositor.
- **Natural relations of the nine:** the classical relations of the seven, with PL9's for the nodes: Rahu befriends
  Jupiter, Venus and Saturn, is neutral to Mercury, and the enemy of the Sun, the Moon, Mars and Ketu; Ketu
  befriends Mars and Venus, is neutral to Mercury and Jupiter, and the enemy of the rest. The table is in the code.
- **Temporal and compound relations of the nine** (PL9's "Compound relations" page): the temporal relation is friend
  when the other planet is in the 2nd, 3rd, 4th, 10th, 11th or 12th sign from this one, enemy otherwise (the same sign
  too), the nodes as the others; the compound one is the natural plus the temporal, great friend (2) to great enemy
  (−2). Checked against the page's three tables for REF 0010 (243 cells).

## Other columns

- **V+:** in how many of the Shadvarga (D1, D2, D3, D9, D12, D30) the planet is in its own sign or its sign of
  exaltation, the whole sign counting (the Moon anywhere in Taurus). The nodes rule no sign and count only through
  their exaltation, Rahu in Taurus and Ketu in Scorpio. The same count over the Dashavarga (the Shadvarga with D7, D10,
  D16 and D60) is the one the yogas of the varga dignities read ([yogas.md](yogas.md)).
- **RN:** the navamsa's sign counted from the rashi's, 1 to 12. **Pushkara navamsa:** a planet in a fire sign whose
  navamsa sign is the 7th or the 9th, in an earth or air sign with the 2nd or the 12th, in a water sign with the 4th or
  the 6th; PL9 marks the RN with a "P".
- **Argala:** PL9's count. From the planet's sign (backwards for the nodes) four pairs, each an argala sign against an
  obstructing one: the 2nd against the 12th, the 4th against the 10th, the 5th against the 9th, the 11th against the
  3rd. The planets of each sign are put by quarter of the sign, 7°30′ each; a pair gives, over the four quarters, how
  many more planets the argala sign has in a quarter than the obstructing sign in the mirror quarter (never less than
  none). The count is the sum of the pairs, and three more when the 3rd from the planet holds more than two natural
  malefics, taken as the yogas take the natural natures ([yogas.md](yogas.md)): the Sun, Mars, Saturn and the nodes,
  the waning Moon, and Mercury with malefics.
- **House effect:** with whole-sign houses, full at the Lagna's degree within the sign and nothing at the sign's edges:
  100 minus 100 times the planet's distance from that degree over the room on its side (the Lagna's degree before it,
  30° less that degree after it), rounded. Needs the Lagna.
- **Rays:** the distance from the planet's point of debilitation over 180°, times its rays (Sun 10, Moon 9, Mars 5,
  Mercury 5, Jupiter 7, Venus 8, Saturn 5), times a factor of its dignity: exalted 3, moolatrikona 2, own 1.5, great
  friend 1.333, friend 1.2, neutral 1, enemy 0.5, great enemy 0.4, debilitated 1. Sun to Saturn.
- **Houses ruled:** the houses from the Lagna whose signs the planet rules, Sun to Saturn. Needs the Lagna.
- **Mrityu Bhaga:** each body has a degree of death in each sign (PL9's table, in the code, the Lagna too). Inside the
  orb (40′ for the Sun, the Moon, Mercury and Venus, 30′ for the others, 1° for the Lagna) the column gives the
  distance and a severity, 1 − distance / orb; outside it, nothing. PL9 prints the distance in whole minutes, cut.
- **Shadvarga lords:** the planets ruling the planet's sign in two or more of the Shadvarga, the most first.
- **Shadvarga elements:** the three most frequent elements and modes of the planet's signs over the Shadvarga, with
  their counts; ties go in the order water, fire, earth, air, dual, movable, fixed.
- **Dominance:** PL9's score of how much a planet stands out. In the 1st house it scores 1 − its distance from the
  Lagna / 30°; being with the Moon 0.75 and with the Sun 0.5; being the Lagna lord 1 (with it 0.75), the lord of the
  Moon's sign 0.75 (with it 0.5), the lord of the Sun's sign 0.5 (with it 0.3); being the final dispositor of the
  Lagna lord 0.25. To these go its graded aspects ([strengths/aspects.md](strengths/aspects.md), over 60) on the
  Lagna × 1, the Lagna lord × 0.75, the Moon × 0.75, the Sun × 0.5, the lord of the Moon's sign × 0.5 and the lord of
  the Sun's sign × 0.3, none on itself. A node's aspects count for nothing on a target whose sign holds the other node,
  and the rest are divided by 1.25. Needs the Lagna.

## Checked

Against PL9's printed "Declination" and "Interpreting Grahas" pages for the 135 reference charts
(`check-planet-info`): every column the engine gives matches, with these border cases. Four declinations off by one
second, at the rounding of a half second. Eleven speeds against the mean of bodies almost stationary, where a speed
near zero makes the share run to thousands of percent and PL9's narrow column cuts it. The houses ruled, RN and the
house effect do not fit PL9's printed page and are checked on its screen for one chart. PL9 writes the sign of a value
even where it rounds to zero ("-00:00").

## Not covered yet

- **Ishta/Kashta** as PL9 prints them (pairs like 210/355): built from the Ishta and Kashta phala, the Shadbala and
  the Saptavarga points, but the unfavourable side and the units are not read yet.

## Grahas Overview

PL9's planet menu opens a "Grahas Overview" of the planet. Most of its rows are columns this spec already gives; the
others are in `/v1/planet-info`, per point:

- `percentExalted`, Sun to Saturn: the distance from the point of debilitation (Sun 190°, Moon 213°, Mars 118°,
  Mercury 345°, Jupiter 275°, Venus 177°, Saturn 20°), as a whole percent of 180°, rounded half up. `percentFull`,
  the distance from the Sun the same way (0 for the Sun). PL9 shows neither for the nodes.
- `vaisheshika`, Sun to Saturn: in how many of the Dashavarga (D1, D2, D3, D7, D9, D10, D12, D16, D30, D60) the planet
  is exalted, in moolatrikona or in its own sign.
- `karakaForSelf`, Sun to Saturn: PL9's "Lagnesh count" row, which is 1 for the Sun, the Moon and the Atmakaraka (by
  the `karakas` option) and 0 otherwise.
- `jagradadi`, Sun to Ketu, from the D1 dignity: awake (`jagrat`) when exalted, in moolatrikona or in its own sign;
  dreaming (`swapna`) with a great friend; asleep (`sushupti`) with a great enemy or in debility; otherwise dreaming,
  unless the planet is the sign lord's natural enemy (the nodes by their rows of the natural relations too).
- `baladi`: the sign in bands of 6°: in the odd signs (Aries, Gemini…) `bala`, `kumara`, `yuva`, `vriddha`, `mrita`;
  in the even signs the other way round.
- `lajjitadi`: the states that hold, in this order. "With" means in the same sign. "Aspected" means by a full sign
  aspect (the 7th, and Mars's 4th and 8th, Jupiter's 5th and 9th, Saturn's 3rd and 10th). "Associated" means with it,
  aspected by it, or in its sign. Benefic and malefic are the natural natures.
  - `lajjita`: in the 5th house, associated with the Sun, Mars, Saturn, Rahu or Ketu.
  - `garvita`: exalted or in moolatrikona.
  - `kshudhita`: in an enemy's or great enemy's sign (by the compound relation, the dignity codes 7 and 8), or with Saturn.
  - `trushita`: in Cancer or Pisces, aspected by a malefic and by no benefic.
  - `mudita`: in a friend's sign, with or aspected by a benefic, or with Jupiter.
  - `kshobhita`: with the Sun and aspected by a malefic, or with Mars, Saturn, Rahu or Ketu.

The Overview's rows for the Dashavarga give the planet's sign in each varga and its house counted from that varga's
Lagna sign: both from the chart's `vargas`. Checked on the Moon of REF 0010 (the maintainer's capture): 97%, 9%, 1,
1, Swapna, Mrita, Kshudhita and Mudita.
