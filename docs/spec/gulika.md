# Gulika

Applies to both alternatives of PL9's "Gulik method" option: "Ending of
portion", the one observed in the installation examined and the `core`
default, and "Beginning of portion" (`gulika: 'beginning'`).

## Rule

1. Determine whether the instant is **by day or by night**: it is day when the Sun
   is above the horizon, by the criterion of `sunrise.md`.
2. By day, the interval runs from sunrise to sunset. By night, from sunset to
   the next sunrise. The three instants are those of `sunrise.md`,
   with the deviations inherent in PL9's search.
3. The interval is divided into **eight equal parts**.
4. The parts belong to the lords of the weekdays, in the order Sun, Moon,
   Mars, Mercury, Jupiter, Venus, Saturn. By day, the first part belongs to the
   lord of the weekday. By night, the first belongs to the lord of the fifth day
   counting from it. The eighth part has no lord.
5. Gulika is the **Lagna at the instant Saturn's part ends**. With
   "Beginning of portion", it is the Lagna at the instant that part **begins**.

Number of Saturn's part:

| Weekday | By day | By night |
|---|---|---|
| Sunday | 7 | 3 |
| Monday | 6 | 2 |
| Tuesday | 5 | 1 |
| Wednesday | 4 | 7 |
| Thursday | 3 | 6 |
| Friday | 2 | 5 |
| Saturday | 1 | 4 |

## Weekday

- **By day:** the weekday of the instant's date.
- **By night:** the weekday of the date twelve hours before the instant.
  This way the whole night belongs to the day on which it began, if it begins after
  noon and ends before the next noon.

"Date" here is that of the clock the chart is written in: local time, with the
chart's time zone and daylight saving time. The `core` receives the difference between that
clock and universal time (`utcOffsetHours`) and, without it, uses universal
time. That difference changes nothing else.

The weekday is **not** that of sunrise, nor that of the date in local mean
time: both hypotheses were tested and fail in dozens of charts.

## Origin

- The "Beginning of portion" alternative: described in the manual, and **checked**
  against the "Sub-Planets" page of the charts printed by PL9, which shows
  Gulika by both methods side by side, rounded to the second, without the
  option needing to be changed. The page calls the beginning "Parashara Method"
  and the end "Kalidasa method".

- Division into eight parts and use of the end of the part: described in the PL9 manual
  and classical. **Confirmed by measurement:** inverting the exported Gulika
  to the instant at which the Lagna has that value, the fraction of the day or
  night falls on an exact multiple of one eighth (within one billionth) in the
  initial 290 charts.
- The instants of sunrise, sunset and next sunrise: **read in PL9's routine**
  (see `sunrise.md`). With instants calculated any other way the fraction
  does not close.
- Table of Saturn's part: **measured**; it matches the classical rule.
- Weekday rule: **measured** — the only one, among those tested, without
  a single exception in the 290 charts, all recorded without a time zone. That the clock is
  the chart's, and not universal time, comes from **reading the routine** that builds
  the day's table: it stores the chart's local time and converts it to universal
  time by adding the offset. The routine that chooses Saturn's part was not
  read.

## Check of the local clock

Five charts were recorded with a time zone or daylight saving time (5.5 h and 10 h
west, 3 h and 10 h east, one hour of daylight saving time) and exported from
PL9. With the clock difference supplied, the twenty points match the
export. Without it, the Gulika of one of the five comes out with the wrong weekday,
more than 20° away. Five charts confirm the direction of the
rule; they do not cover every combination of day, night and date change.

## Conformance

Maximum difference of 0.004" in the reference charts with Lahiri. The current
numbers, by set, are in `docs/reports/conformance.md`.

## What was not verified

- The "Beginning of portion" option.
- Mandi, which PL9 also calculates.
