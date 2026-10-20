# Prana Pada

## Rule

1. Take the **sunrise** that applies to the instant (see
   `sunrise.md`) and the time elapsed since it.
2. That time is converted into arc at the rate of **one sign every six
   minutes** (7200° per day).
3. The arc is added to a starting point that depends on the sidereal sign the
   Sun is in **at the given instant**:

   | Sun's sign | Starting point |
   |---|---|
   | Movable (Aries, Cancer, Libra, Capricorn) | Sun |
   | Fixed (Taurus, Leo, Scorpio, Aquarius) | Sun + 240° |
   | Dual (Gemini, Virgo, Sagittarius, Pisces) | Sun + 120° |

4. The result is reduced to [0°, 360°).

The Sun's longitude is that of the given instant, not that of sunrise.

## Sensitivity

One second of time in the sunrise shifts the Prana Pada by 5 minutes of
arc. Half a second of arc of Prana Pada corresponds to 2 thousandths of a second
in the sunrise.

## Origin

The rule is the classical one, common knowledge, and served as a hypothesis. **Confirmed
by measurement** against PL9's export: with PL9's sunrise, it
reproduces the exported Prana Pada. The variant with the Sun taken at the instant of
sunrise was tested and discarded (a difference of several seconds of
time).

PL9's routine that computes the Prana Pada was not read; the sunrise one
was.

## Conformance

Maximum difference of 0.012" in the reference charts with Lahiri. The current
numbers, per set, are in `docs/reports/conformance.md`.

## What was not verified

- With the "Sunrise: Edge of Sun" option.
