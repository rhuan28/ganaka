# PL9 ayanamshas

## General rule

The `core` works with the longitude referred to the mean equinox of date (without
nutation) and subtracts the ayanamsha from it. Each PL9 ayanamsha is the
mean ayanamsha of a mode of the current Swiss Ephemeris plus a constant:

| Option in PL9 | Library mode | Constant (PL9 − library) | Value at J2000 |
|---|---|---|---|
| Lahiri | Lahiri | −0.1382" | 23°51'25.39" |
| Yukteshwar | Yukteshwar | 0 | 22°28'43.69" |
| Raman | Raman | +0.8280" | 22°24'39.68" |
| Bhasin | J.N. Bhasin | 0 | 22°45'43.69" |
| Fagan | Fagan/Bradley | +0.4021" | 24°44'25.48" |
| Krishnamurti | Krishnamurti | +0.8280" | 23°45'37.69" |
| Krishnamurti New | Krishnamurti | +322.8280" | 23°50'59.69" |
| True Chitra | True Citra | 0 | 23°50'24.06" |

The library ayanamsha is evaluated at the given universal time. Evaluating it at the
instant shifted by Delta T makes no measurable difference.

## None (Sayana)

With this option PL9 gives the **apparent** tropical longitude, with nutation. In
the `core` scheme this is equivalent to an "ayanamsha" equal to minus the nutation in
longitude, taken from the library at PL9's instant (see `delta-t.md`).

## Manual offset ("Specify offset")

The value entered is **subtracted** from the ayanamsha: a positive offset of
1° increases all sidereal longitudes by 1°.

## Origin

**Measured.** For each option, thirty charts spread from 1801 to 2048 were
exported from PL9 with the option selected. The implied ayanamsha of each
chart is the Sun's longitude referred to the mean equinox, at PL9's instant,
minus the exported longitude. This value was compared with each library
mode.

| Option | Best mode | Mean difference | Variation over the 30 charts |
|---|---|---|---|
| Lahiri (290 charts) | Lahiri | −0.1382" | 0.0005" |
| Yukteshwar | Yukteshwar | 0.0000" | 0.0001" |
| Raman | Raman | +0.8280" | 0.0001" |
| Bhasin | J.N. Bhasin | 0.0000" | 0.0001" |
| Fagan | Fagan/Bradley | +0.4021" | 0.0001" |
| Krishnamurti | Krishnamurti | +0.8280" | 0.0001" |
| Krishnamurti New | Krishnamurti | +322.8280" | 0.0001" |
| True Chitra | True Citra | −0.015" | 0.063" |

In all of them, the implied ayanamsha is the same for Sun, Moon, Mars, Jupiter and
Saturn of the same chart, to within 0.004".

Remarks:

- The difference is constant in time in all but True Chitra. A
  constant rules out a difference in precession rate.
- "Krishnamurti New" is exactly 322" (5'22") above "Krishnamurti".
  The library's most recent mode with a similar name does not match: it is
  250" off and with greater variation.
- True Chitra follows the library mode, which depends on the position of the
  star at the date, with a difference of up to about 0.05". The rule applies no
  correction.
- For "None (Sayana)", the exported longitude matches the library's apparent
  longitude with a difference below 0.004" and differs from the
  longitude without nutation by up to 17".
- For the manual offset, the Sun of one chart went from 5.0837° to
  6.0837° with an offset of 01:00:00.

## The 0.138" offset of Lahiri

The ephemeris measurement left open whether this offset belonged to
Lahiri or was common to all ayanamshas. It belongs to Lahiri: Yukteshwar and Bhasin have
no offset at all, and Raman, Fagan and Krishnamurti have their own,
different constants.

Hypothesis, not verified: the constants reflect changes in the definition
of these ayanamshas between version 2.00 of the Swiss Ephemeris and the current one.

## Conformance

With these rules, the longitudes from Sun to Pluto are within 0.5" of PL9
in the thirty charts of each option. The per-point values are in
`docs/reports/conformance.md`.

## What was not verified

- The manual offset combined with ayanamshas other than Lahiri, and with
  "None (Sayana)".
- Negative offsets: PL9's field was tested only with a positive value.
- The Lagna with each ayanamsha beyond what the conformance report shows.
- More than thirty charts per option.
