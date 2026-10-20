# Atlas

The `packages/atlas` package finds cities by name and gives, for a zone and a local date, the
UTC offset and daylight saving time, with the worldwide history. It does not depend on the `core`; the API
exposes it at `/v1/atlas/cities` and `/v1/atlas/local` (`docs/spec/api.md`).

## Time zones

- **Source:** the IANA database (tz database), version 2026b, stored as text in
  `packages/atlas/tzdata/2026b/` (public domain).
- **Compilation:** the package compiles the text by the rules of `zic` (`Rule`, `Zone` and `Link` lines), with
  `backzone` applied over the aliases in `backward`, as in IANA's own `PACKRATDATA=backzone`.
  This way, each zone keeps its own history before 1970: Amsterdam in 1930 is +0:19:32, not the
  time zone of Brussels; Oslo before 1895 has its own local mean time, not Berlin's.
- **Before the first record:** the zone's local mean time (LMT) applies; São Paulo in 1900 is
  −3:06:28.
- **The `pl9` mode does not change the time zone.** The atlas has a single behaviour.

## The local date

A local date and time in a zone give one of three answers:

- `ok`: one reading (the instant, the offset, the daylight saving time, the abbreviation);
- `ambiguous`: the hour that repeats when the clock goes back, with both readings, the earlier
  first;
- `nonexistent`: the hour that is skipped when the clock goes forward, with no reading, with the offsets
  before and after.

The atlas never chooses between two readings: the astrologer decides.

## Cities

The cities with a thousand inhabitants or more from [GeoNames](https://www.geonames.org) (CC BY 4.0 licence),
171,399 in the 2026-10-20 file. Each one stores the name, the ASCII name, up to eight alternate
names in Latin script, the country, the country's first-level division, the coordinates, the canonical IANA
zone and the population.

The search compares ignoring accents and case, by the start of the name or of one of its
words. It ranks first the cities whose own name starts with the query, then those found by another
name or by a word; within each group, by population. So "rio" gives Rio de Janeiro before
villages called Rio, and "paris" gives Paris (France) before Warsaw, whose nickname is "Paris of the
North".

## Check

- **Against Node:** the 300-odd zones of `zone1970.tab`, on the 1st and 15th of each month from 1970 to
  2037, give the same offsets as the `Intl` of Node 22, which ships the same version of the database without
  `backzone`. After 1970 `backzone` changes nothing, so the two must match. The same
  comparison is made one minute before and one minute after each compiled transition, from 1970 to 2037.
- **Like `zic`:** a rule in force keeps applying when a new zone line starts long
  after it (the wartime times: Phoenix in 1944, Manila in 1945, Brussels in 1944), and the
  instants at which a zone line and a rule change cancel each other out are merged (Moscow in 1991,
  Indiana in 2006).
- **Old cases:** those of `backzone` (Amsterdam, Oslo), LMT (São Paulo 1900), India's wartime time
  (Kolkata 1943, +6:30) and the daylight saving time switches (São Paulo 2018 and 2019, Berlin
  2021).
- **Against PL9:** 20 births entered in PL9 by the maintainer, looking up the city in its
  atlas (`docs/reports/atlas-pl9.md`): 14 equal; Amsterdam in 1930 with a 16-second difference;
  3 with one hour (Campo Grande 2016, Cuiabá 2004, Tokyo 1949), where the IANA database documents the rule;
  and the two daylight saving time switches, where PL9 gives one reading without warning. The differences are not
  failures: the atlas follows the IANA database. The 382 reference births have the time zone typed in (0, city
  "Reference") and are of no use for this check; PL9's binary atlas was not deciphered.
