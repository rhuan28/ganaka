# Special lagnas

## Rules

`Δ` is the time, in days, since the sunrise that applies to the instant (see
`sunrise.md`); `Sun₀` is the Sun's sidereal longitude at the instant of that
sunrise.

| Lagna | Longitude | Rate |
|---|---|---|
| Bhava Lagna | `Sun₀ + 360°·Δ` | one sign every 2 hours |
| Hora Lagna | `Sun₀ + 720°·Δ` | one sign every hour |
| Ghatika Lagna | `Sun₀ + 1800°·Δ` | one sign every ghati (24 minutes) |

**Jaimini Hora Lagna:** if the Lagna is in an odd sign (Aries, Gemini…), it is
the Hora Lagna itself; if it is in an even sign, it is `Lagna + 720°·Δ`, counted
from the Lagna of the instant.

**Indu Lagna** (sign only): each planet has a number of kalas — Sun 30,
Moon 16, Mars 6, Mercury 8, Jupiter 10, Venus 12, Saturn 1. Add the
kalas of the lord of the 9th sign from the Lagna and of the lord of the 9th sign
from the Moon; the remainder of the division by 12 (0 counts as 12) is the number of signs
counted from the Moon's sign, which counts as the first.

## Origin

The rules for Bhava, Hora and Ghatika Lagna and for Indu Lagna are classical and
served as a hypothesis; the Jaimini Hora Lagna one was **deduced from the numbers**.
All were **confirmed by measurement** against the 72 reference charts
printed by PL9, without exception. PL9 shows the first three and the Jaimini
Hora Lagna in degrees with rounded seconds; the largest difference measured was
0.76". PL9's routine was not read.

## Sensitivity

One second of time at sunrise shifts the Ghatika Lagna by 0.0208°
(75"); one millisecond, by 0.075". That is why the check of these
longitudes uses a tolerance of 1".

## What was not verified

- With the "Sunrise: Edge of Sun" option.
- Beyond the polar circle and where sunrise cannot be found: these
  lagnas are absent from the result, like Gulika.
