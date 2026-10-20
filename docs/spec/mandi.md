# Mandi

## Rule

1. Determine whether the instant is **by day or by night**, and the instants of
   sunrise, sunset and next sunrise, as in
   `sunrise.md`.
2. The interval (by day, from sunrise to sunset; by night, from sunset to the
   next sunrise) is divided into **thirty equal parts**.
3. Mandi is the **Lagna at the instant part number `g` ends**,
   counting from the start of the interval, with `g` given by the weekday:

   | | Sunday | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday |
   |---|---|---|---|---|---|---|---|
   | By day | 26 | 22 | 18 | 14 | 10 | 6 | 2 |
   | By night, `pl9` mode | 10 | 6 | 2 | 28 | 24 | 20 | 16 |
   | By night, `corrected` mode | 10 | 6 | 2 | 26 | 22 | 18 | 14 |

   The `corrected` mode row is the classical table. PL9 departs from it on the
   nights from Wednesday to Saturday; see correction 6 of `corrections.md`.

The weekday is counted as for Gulika (see `gulika.md`): by day, that of the
instant's date; by night, that of the date twelve hours before; the date is that of the
clock the chart is written in.

In a day of thirty ghatis, `g` is the number of ghatis after sunrise
at which Mandi rises, by the classical rule.

## Relation to Gulika

In PL9, Gulika and Mandi are different points: Gulika comes from dividing the
interval into eight parts, Mandi from dividing it into thirty. On a Saturday by day,
Gulika is the Lagna at 1/8 of the day, and Mandi the Lagna at 2/30 of the day.

## Origin

- The rule is the classical one, common knowledge, and served as the hypothesis; the PL9
  manual only says that Mandi uses a division into thirty parts.
- **Confirmed by measurement** against the charts printed by PL9, in which
  Mandi appears in the chart drawing in degrees and minutes. Inverting the displayed
  value to the instant at which the Lagna has it, the fraction of the day or night
  falls on a whole number of thirtieths, within 0.01. By day and on the nights
  from Sunday to Tuesday, it is that of the classical table; on Wednesday and
  Friday nights, two more. PL9's values for Thursday and Saturday nights
  (24 and 16) follow the same pattern and are checked by the bench.
- PL9's routine that calculates Mandi **was not read**.

## Conformance

The current numbers are in `docs/reports/conformance.md`. The
check is to the arcminute: the `core` value, truncated to the minute, must
be what PL9 displays.

## The "Gulik method" option

It does not change Mandi. On 14 October 2026 the option was set to "Beginning
of portion" and three charts were printed again (one by day, one Friday night,
one Tuesday night): Mandi in degrees, Mandi's sign in the 45 vargas and the
rest of what the bench reads came out identical to those printed with "Ending of
portion". The option was restored and checked by export.

## What was not verified

- Precision below one arcminute: PL9 neither shows nor exports
  Mandi with seconds.
- With the "Sunrise: Edge of Sun" option.
