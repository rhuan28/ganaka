# Sunrise and sunset

Applies to the "Sunrise: Centre of Sun" option, the one observed in the installation
examined. The "Edge of Sun" option is not reproduced.

## Definition

In PL9, the Sun rises at the instant the **Lagna equals the longitude of the
Sun**, and sets when the point opposite the Lagna (Lagna + 180°) equals the
longitude of the Sun. Both longitudes are the sidereal ones the program shows
(see `lagna.md` and `ephemeris-source.md`).

This is the rising of the **Sun's degree** on the ecliptic, not of the visible Sun:

- there is no refraction or semidiameter;
- the Sun's ecliptic latitude, always a few arcseconds, does not enter;
- below the polar circle the Sun's degree crosses the horizon every day,
  even on days when the visible Sun does not set or does not rise.

That is why the instants differ from the almanac sunrise by a few
minutes, and more at high latitudes.

## Which sunrise applies to an instant

The program starts from a guess and looks for the nearest root. The guess
depends on two things: whether the Sun is above the horizon at the given instant, and
which quarter of the day the instant falls in, counting the day from 6 h
local mean time (`Julian day + east longitude / 360 + 0.25`).

The Sun is **above the horizon** when the longitude of the Sun minus the Lagna,
reduced to [0°, 360°), is 180° or more, or is zero.

| Sun | Quarter of the day (local mean time) | Guess |
|---|---|---|
| below | 6 h to 12 h | one day before the instant |
| above | 0 h to 6 h | the following 6 h |
| any other case | | the preceding 6 h |

Consequence: for someone born in the small hours, before sunrise, the previous
day's sunrise applies; after sunrise, that of the same day.

The sunset guess is the sunrise guess plus half a day.

## The search

The search is reproduced step by step, because the program ends it with a
loose tolerance and the result depends on the path. Calling `t` the
current estimate:

1. Calculate the Lagna at `t` and the error: target longitude of the Sun minus the Lagna
   (or minus Lagna + 180°, for sunset), reduced to (−180°, 180°].
2. The target longitude, during the search, is a **linear extrapolation**: the
   longitude of the Sun at the given instant plus 0.985653° per day. For sunrise,
   the days are counted up to `t`; for sunset, up to the sunrise already
   found (and not up to `t`).
3. On the first pass, the correction is the error divided by 360° per day. On the
   following ones, the error divided by the slope measured between the last two
   estimates (secant method).
4. At latitudes beyond 60°, the slope is doubled on the first pass and
   on the two following ones.
5. The search ends when the error falls below 0.0005° (sunrise) or 0.001°
   (sunset), or on the ninth pass. On the pass on which it ends, the error is
   recalculated with the **true** longitude of the Sun at that instant, and
   a last secant correction is applied.

The **next** sunrise, used to measure the night, is searched for starting from
an instant 1.1 days after sunrise, by the same process, but without
the final recalculation with the true longitude of the Sun.

Effect of the tolerance: sunrise lands less than a thousandth of a second
from the exact root; sunset and the next sunrise can land a few
seconds from it, and more at high latitudes. The `core` reproduces these deviations,
because Gulika depends on them.

### When the sunset search ends on the first pass

If the sunset guess already falls within the tolerance, the final correction uses
the slope left over from the **sunrise** search, which is not suited to
sunset. The result lands about one degree from the horizon — a few
minutes of time. It happens in about one chart in twenty thousand, at any
latitude. The `core` reproduces it: two charts in this situation were exported from
PL9, and their Gulika matches the `core`'s and lies more than ten
arcminutes from what a correct sunset would give.

If the **sunrise** search ended on the first pass, there would be no
previous slope; the `core` then uses 360° per day. This case was not
observed in PL9.

## In corrected mode

The definition is the same; the instants are the true roots:

- **sunrise** is the last passage of the Sun's degree over the eastern
  horizon at or before the given instant;
- **sunset** is the first passage over the western horizon after it;
- the **next sunrise** is the following passage over the east;
- it is day as long as the instant is before sunset.

The roots are found by scanning and bisection, down to the resolution of a Julian
day (0.04 millisecond). The scan uses a Sun in uniform motion,
which dispenses with the ephemeris, and each root found this way is refined against the true
Sun. This works up to half a thousandth of a degree from the polar circle; any
closer than that the Lagna sweeps half the zodiac in moments and the root may not
be found. See `corrections.md`.

## Where it does not work (`pl9` mode)

- Beyond the polar circle the Lagna is undefined (see `lagna.md`).
- From about 65° latitude, PL9's search stops converging on
  some days of the year. PL9 does not detect this and uses whatever the search
  gave. The `pl9` mode does the same; when the result cannot
  be used, the chart comes back without Gulika and Prana Pada: when the estimate drifts more than three days, or when
  the three instants come out of order.

  At test instants over a year: up to 64°, no error and no
  result more than half a degree from the horizon; at 65°, error in 1% and result
  more than half a degree from the horizon in 12%; at 66°, error in 64%.

  The reference charts go up to 64.98°. Above that nothing was checked
  against PL9, and the `core` marks the result as unchecked from
  65°.
- Trigonometric functions do not give exactly the same last digit in
  every execution environment. Since the search ends by tolerance, a
  difference in the last digit can, in rare cases, change the number of
  passes and shift sunset by fractions of a second.

## Origin

**Read in PL9's routine**: the definition, the table of guesses, the
linear extrapolation, the tolerances, the nine-pass limit, the
handling of latitudes beyond 60° and the starting point of the next
sunrise. **Confirmed by measurement**: the sunrise calculated this way
matches what the Prana Pada exported by PL9 implies, with a difference
below 0.04 millisecond in the initial 290 charts.

Two points of the reading were decided by measurement, because the code
admitted two interpretations: the quarter of the day is obtained by truncation, not
by rounding; and the final pass uses the true longitude of the Sun.

## What was not verified

- The "Edge of Sun" option.
- PL9's behaviour where the search does not converge, from 65° upward.
