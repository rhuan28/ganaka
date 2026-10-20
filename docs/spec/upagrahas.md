# Upagrahas derived from the Sun

## Rule

From the Sun's sidereal longitude, all computations reduced to [0°, 360°):

| Point | Rule |
|---|---|
| Dhuma | Sun + 133°20' |
| Vyatipata | 360° − Dhuma |
| Parivesha | Vyatipata + 180° |
| Indrachapa | 360° − Parivesha |
| Upaketu | Indrachapa + 16°40' |

Consequence: Upaketu lies 30° behind the Sun.

## Origin

Classical rule, common knowledge. Confirmed against PL9's export in the
290 reference charts: applied to the Sun exported by PL9 itself, it
reproduces the five points with an error below 0.0001".

## Conformance

Computed from the `core`'s Sun, the five points inherit the Sun's
difference, which is below 0.0001".

## Bhrigu point

PL9 shows, when enabled in "Special Points", the point "BP":

`Bhrigu point = Rahu + ((Moon − Rahu) mod 360°) / 2`

It is the midpoint of the arc running from Rahu to the Moon **in the direction of the signs**. The
other midpoint, 180° from this one, is not the one PL9 shows.

Origin: PL9's manual says it is the midpoint between the Moon and Rahu; which of the
two midpoints, **by measurement** in the charts printed by the program, in which
the point appears in degrees and minutes. PL9 does not export it: the check is to the
minute of arc, and the point inherits the precision of the Moon and Rahu, already checked to
0.5".

## Outside this document

Gulika and Prana Pada, which PL9's export also carries: see `gulika.md`,
`prana-pada.md` and `sunrise.md`. Mandi: see `mandi.md`.
