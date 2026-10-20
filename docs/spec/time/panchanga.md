# Panchanga (stage 5B)

The panchanga that PL9 shows for an instant and place and what it prints for the
birth ("Panchanga Details" and "Basic Calculations"), how the `core` computes it
(`packages/core/src/panchanga/`) and where each rule comes from. Answer keys: the birth
pages of the 135 reference charts (`packages/oracle/fixtures-panchanga/`, over the
copies with the birth rounded to the second, `refset-tempo.json`), the tithi, karana and
yoga of the 540 transit instants (`fixtures-transits/`) and the six Print → Panchang printouts
of REF 0010 (`fixtures-panchanga/panchang/`).

## The elements

Read in the executable. With E = Moon − Sun (sidereal), the tithi is the integer part of E / 12 plus 1
(1 to 30), the karana that of E / 6 plus 1 (1 to 60), the nakshatra that of Moon / 13°20' plus 1, the yoga that
of (Sun + Moon + 93°20') / 13°20' — the same as counting the sum in parts of 13°20', since 93°20'
is seven parts. The 60 karanas have 11 names: Kimstughna in the first, the seven movable ones
repeated eight times, and Shakuni, Chatushpada and Naga in the last three. The names come from the PDFs
(in the executable they are encrypted text); PL9 writes Vishti on the birth pages and Visthi
in the "Gochara data", and the nakshatra on the birth pages with a different spelling from that of the
transit pages ("Mrigasira", "Poorva Phalg.").

## Sunrise and sunset

What the page prints (read in the executable): the moment at which the Lagna (the opposite point, at
sunset) reaches a Sun that moves 0.985653° per day from its true place at the
instant, by secants starting from a slope of 360° per day (double beyond 60° of
latitude in the first three steps), down to 0.0005° at sunrise and 0.001° at sunset, in at most
nine steps; then, one more step on the true Sun, without checking. The sunset starts from the
sunrise guess plus half a day and keeps the Sun where the linear Sun was at sunrise. The next
sunrise is searched for in the same way starting 1.1 days later, without the last step. The time is
rounded to the second. In `corrected` mode, the exact instants (corrections 1 and 2 in
`docs/spec/corrections.md`). Where the Sun does not rise (beyond the polar circle, or with no root found),
the panchanga gives what does not depend on sunrise — the elements at the instant, the calendars, the
Avakhada without the Rashi Paya, the Ghat Chakra, Bhayat and Bhabhog — and states in `missing` what is lacking;
the sunrise, the sunset, the elements at sunrise, the Vedic weekday and the Ishtkaal are
null.

## The ends

Read in the executable. Each end is searched for with a fixed number of straight-line steps on the
speed at each step, without testing whether it has arrived: four for the tithi, three for the karana, the
yoga and the nakshatra. The search starts from the Shadbala sunrise (the Sun at 1° per day, stage 4),
not from the printed sunrise — since the steps are fixed, the starting point shows in the result,
and it is with it that the ends match. The yoga falls one second after PL9's in 13 of the 135
births, with no cause found; the bench accepts one second either way on the ends.

Ghatis (of 24 minutes), vighatis and palas: each one truncated, the ghatis without wrapping at 60
("62:14:45"); the Ishtkaal counts from sunrise to the birth, the Bhayat from the Moon's entry into the
nakshatra to the birth, the Bhabhog from the entry to the exit.

## Calendars

Read in the executable:

- The lunar month: that of a new moon is the Sun's sign at it (Pisces gives Chaitra). Three modes
  ("Indian Calendar"): Krishnadi (purnimanta: the dark paksha belongs to the month of the following new moon,
  the default), Shukladi (amanta: to the month of the previous new moon) and Krishnadi 1/2 (like
  Krishnadi). The month is intercalary when, in Krishnadi and Shukladi, the amanta month containing
  the date has both new moons with the Sun in the same sign (there is no sankranti between them), and,
  in Krishnadi 1/2, when the new moon that gives the name and the one before it do. PL9 writes
  "Adhik" before the name, and "First" in Krishnadi 1/2 (this one, from the printouts: June 2026).
  On the birth page, the Chaitradi system uses purnimanta and Kartikadi amanta,
  whatever the option.
- The Vikram year: Chaitradi, the civil year plus 57; plus 56 from January to May in Pausha, Magha
  or Phalguna, and in Chaitra while its dark paksha runs. Kartikadi, plus 56; plus 57
  from July to December, from Kartika to Magha (in amanta mode). The Saka is the Chaitradi Vikram minus
  135.

From the data: the season, the ayana and the gola follow the tropical Sun (seasons of two signs
starting from Vasant in Pisces and Aries; Uttarayan from Capricorn to Gemini; Uttar from Aries to
Virgo). PL9 computes the new and full moons approximately: in 4 of the 135 births,
hours from a full moon or with the Sun a hair from changing sign, its Chaitradi month is
another (pending on the bench).

The Vedic weekday: PL9's code was not found. The `core` takes the day of the instant in
local mean time (by the longitude), one less before that day's sunrise; this gives 118 of PL9's 135
days (the others, pending on the bench).

The Tamil calendar is not computed by PL9: it reads it from an almanac in a file, which covers
1941 to 2020 (outside that it prints "NA"). A computed rule gets 33 of the 46 charts within
the range right; the `core` does not reproduce it.

## Avakhada and Ghat Chakra

The tables are in the executable, with the names encrypted; they therefore come from the PDFs
(`tables.ts`, generated from the 135 births): yoni, gana, nadi, yunja and paya by the nakshatra;
varna, tattva and lord by the Moon's sign; the name syllable and the varga by the pada (103 of the 108
padas observed; the other five are left without a value); the Ghat Chakra by the Moon's sign. The
Vashya changes at 15° of Sagittarius and of Capricorn (read in the executable). The Paya of the sign is by
the Moon's house from the Lagna: gold in 1, 6 and 11, silver in 2, 5 and 9, copper in 3, 7 and 10,
iron in 4, 8 and 12 (from the data, 135 of 135).

## Times

The local mean time correction is the east longitude / 15 minus the time zone; the sidereal time, the
Greenwich one plus the longitude / 15, without wrapping at 24 (read in the executable). PL9 loses the carry
when the seconds round to 60 on an exact minute (69° of longitude, 4.6 hours,
printed "04:35:00").

## Tithi Pravesh

Read in the executable: for the year of age that contains a date, the whole mean sidereal years
(365.25636 days) from the birth to it; from the birth plus that number of
years of 365.2422 days, the Sun brought to the start of its natal sign, and then three straight-line
steps forward to the birth's Moon − Sun angle. The (L) variant is the same instant
shown at the place and in the time zone of the "Today" event. From the data: a date before the birth counts
as age 0, which can give a moment before the birth. In the 135 charts (at the date printed
on each PDF): 135 equal to the second, in both variants.

## Sunrise chart

The "Sunrise chart" worksheet shows the chart at the sunrise that opens the day of birth, at the
place of birth (`computeSunriseChart`): the same sunrise as the birth panchanga.
The chart's title comes from the report's model; the instant came from the data, equal to the minute in the 135
charts, with the degrees rounded to the second and shown to the minute, as on the Varshaphala pages
(from the data: straight truncation leaves 8 points one minute low, rounding to the minute misses on all of them). Beside it, 15 lines of this chart's Vimshottari, in two levels (from the Moon at sunrise),
starting from the antardasha running at the print's clock read as UT (or the next one, if it begins less than one
minute later; or the first one, for a birth after the clock; checked in the 270), with the weekday and the date in the clock
of the birth (a start less than 15 seconds from midnight may come out on either of the two days:
REF 0278, 9.5 s before). With no sunrise on that day, there is no chart. Checked in the 135 charts, on the
two dates: the ten positions and the 15 lines, 6750 values. The drawn D9 is not checked separately:
it is the stage 2 varga over the same positions.

## Panch Pakshi (worksheet 39)

Read in the executable (`panchPakshi`, `panchPakshiDay`):

- The five birds, in this numbering: Vulture, Owl, Crow, Cock, Peacock; the five activities: Eating,
  Walking, Ruling, Sleeping, Dying.
- The native's bird: the natal Moon in five bands of nakshatras (up to 66°40', 146°40', 213°20', 280° and the
  rest: 5, 6, 5, 5 and 6 nakshatras), counted backwards (6 − n) when the Moon has passed the Sun's opposition.
- The fortnight: bright with the tithi of the instant below 16.
- The day: from the sunrise before the instant to the next one (those of the panchanga), at the place of the event; the day and the
  night in five equal yamas. The tables use the Vedic weekday of that sunrise (Sunday = 1): a clock
  at 04:06 on a Saturday takes Friday's. The header prints the civil day.
- By fortnight and day/night: the next bird (at night the previous one; by day, in the bright fortnight the following one and in the dark fortnight
  three ahead), the next activity (one, two, three or four ahead: bright by day, bright by night,
  dark by day, dark by night), the parts of each activity in a yama (in 24ths, Eating to Dying: bright
  by day 5 6 8 3 2; bright by night 5 5 4 4 6; dark by day 8 6 3 2 5; dark by night 7 7 3 3 4) and the first
  bird of each weekday, which rules the first yama.
- In the first yama, the native's bird does the activity reached by stepping birds and activities
  from the day's first bird in Ruling; each following yama, the next activity. Each yama in five
  parts, starting from the native's bird and the yama's activity, each one by its fraction.
- The "Ruling bird": the bird reached, from the day's first in Ruling, when the activity
  reaches Eating (by day and by night). The "Dying bird": a table by weekday and fortnight.
- The relation to the native's bird: itself; friends Vulture–Peacock, Owl–Crow, Cock–Peacock, and in the
  bright fortnight Vulture–Owl and Crow–Cock, in the dark fortnight Vulture–Crow and Owl–Cock; the others, enemies.

Check (270 PDFs, Jaipur, times to 2 seconds): the header, the ten yamas and the 50 parts, 63720 of
63720 values. The 270 clocks are from 17 October 2026 (a Saturday), between 00:51 and 07:54: the
weekday tables are only exercised on Friday and Saturday (before and after sunrise), and only
in the bright fortnight. The rows of the other five days and the dark fortnight rules come only from the
executable, without a check. At a place with no sunrise on that day (the place of the event, not that of the
birth) there is no Panch Pakshi.

## The Panchang printout

Print → Panchang prints, for fifteen days starting on a Sunday, at the place of the
"Today" event (Jaipur in the reference charts), one line per civil day. The `core` reproduces it in
`computePanchangTable` (command line: `panchanga --at … --days n --calendar …`).

- The dialog follows the year of the machine's clock: the year box changes the text but not the list
  of fortnights nor the table. The printouts are therefore from 2026 (28 December 2025 and
  14 June 2026, the latter with the Adhik Jyeshtha), in the three calendar modes.
- Each line: the sunrise and sunset, the length of the day, and the tithi, the nakshatra, the yoga and the
  karana at sunrise with their ends, as on the birth page (the ends counted
  from the day's midnight, beyond 24 hours when they pass it, and "..." when they pass the next
  sunrise). The tithi carries the paksha name only where it changes. A tithi that begins and ends
  between two sunrises gets a line of its own, with its end.
- The nakshatra's end is found differently from the birth page's: the Moon every half
  day of universal time, the crossing put on a straight line between the two samples, the search
  of the transit tables (from the data: 83 of 84 days to the second, one off by a second).
- The header: the month and paksha of the first sunrise in the chosen mode, the Vikram year
  Chaitradi (Krishnadi and Krishnadi 1/2) or Kartikadi (Shukladi), the Saka, and the true
  ayanamsha, with nutation (from the data, to the arc second).
- On the day after a tithi printed "...", PL9 repeats the weekday of the line above
  (10 January 2026, a Saturday, comes out "Fri"). `pl9` mode reproduces the repetition;
  `corrected` gives the date's day (correction 23 in `docs/spec/corrections.md`).
- Not reproduced: moonrise and moonset (PL9 repeats the previous day's when the Moon does not
  set on the day), the transits and the auspicious mark of each day, the header's Ratriman
  (it is not the night of any of the printed days) and the table of the time at which each sign rises,
  with the two sunrise charts.

## Check

In the 135 births: 8235 values, no failure; 42 pending (the Vedic weekday, the Chaitradi
month near a full moon, and 4 sunsets or next sunrises at which the `core`'s search
reaches another crossing). In the six Panchang printouts: 84 days and the headers, no
failure nor pending.
