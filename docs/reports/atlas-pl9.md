# The atlas against PL9's: time zone and daylight saving time in 20 births

Date: 2026-10-20. The maintainer entered the 20 births below in PL9, looking up each city in PL9's own
atlas, and wrote down the time zone and daylight saving time it showed. The values of this project's
atlas (the IANA database 2026b with `backzone`) were computed beforehand, without knowing PL9's. The
offset is in hours east of UT; in PL9 it is the opposite of "Timezone" plus "DST".

| # | City | Local date and time | PL9 | This atlas | |
|---|---|---|---|---|---|
| 1 | São Paulo (SP) | 1932-01-15 12:00 | −2 | −2 | same |
| 2 | Rio de Janeiro (RJ) | 1950-01-10 12:00 | −2 | −2 | same |
| 3 | São Paulo (SP) | 1966-01-15 12:00 | −2 | −2 | same |
| 4 | Belém (PA) | 1985-01-15 12:00 | −3 | −3 | same |
| 5 | Recife (PE) | 1987-12-15 12:00 | −2 | −2 | same |
| 6 | Recife (PE) | 1990-01-15 12:00 | −2 | −2 | same |
| 7 | Manaus (AM) | 1994-01-15 12:00 | −3 | −3 | same |
| 8 | Brasília (DF) | 1994-01-15 12:00 | −2 | −2 | same |
| 9 | Fortaleza (CE) | 2000-01-15 12:00 | −2 | −2 | same |
| 10 | Cuiabá (MT) | 2004-01-15 12:00 | −3 (zone 3, no DST) | −4 | **1 hour** |
| 11 | Salvador (BA) | 2012-01-15 12:00 | −2 | −2 | same |
| 12 | Campo Grande (MS) | 2016-01-15 12:00 | −2 (zone 3, DST 1) | −3 (zone 4, DST 1) | **1 hour** |
| 13 | Porto Alegre (RS) | 2018-11-04 00:30 | −2 | skipped hour (−3 → −2) | PL9 gives no warning |
| 14 | São Paulo (SP) | 2019-02-16 23:30 | −2 | repeated hour: −2 or −3 | PL9 picks one without warning |
| 15 | Kolkata (India) | 1943-06-01 12:00 | +6:30 | +6:30 | same |
| 16 | Amsterdam (Netherlands) | 1930-01-01 12:00 | +0:19:48 | +0:19:32 | 16 seconds |
| 17 | London | 1941-07-01 12:00 | +2 | +2 | same |
| 18 | New York | 1945-03-01 12:00 | −4 | −4 | same |
| 19 | Tokyo | 1949-06-01 12:00 | +9 | +10 | **1 hour** |
| 20 | Buenos Aires | 1975-01-15 12:00 | −3 | −3 | same |

**Result:** 14 the same, 1 with 16 seconds of difference, 3 with one hour, and the 2 daylight saving
turns, where PL9 gives one reading without saying the case is special.

**The one-hour differences, according to the IANA database:**
- **Campo Grande (MS) in 2016:** Mato Grosso do Sul is UTC−4; with daylight saving time, −3. PL9 gives
  Brasília's zone.
- **Cuiabá (MT) in 2004:** Mato Grosso stayed out of the 2003–2004 daylight saving time. PL9 gives −3,
  as if it had observed it.
- **Tokyo in 1949:** Japan had daylight saving time from 1948 to 1951, during the American occupation.
  PL9 does not have it.

In all three cases the IANA database documents the rule with sources. The difference is not counted as
a failure: this project's atlas follows IANA (`docs/spec/atlas.md`).

**Amsterdam in 1930:** the official time was +0:19:32 (IANA's). The 16 seconds do not change the chart
appreciably.
