# Sign, nakshatra and pada

## Rule

For a sidereal longitude reduced to the interval from 0° (inclusive) to 360°
(exclusive):

- **Sign:** integer part of the longitude divided by 30. From 0 (Aries) to 11
  (Pisces).
- **Nakshatra:** integer part of the longitude divided by 13°20' (360/27). From
  0 (Ashwini) to 26 (Revati).
- **Pada:** within the nakshatra, integer part of the distance from the start of the
  nakshatra divided by 3°20' (a quarter of the nakshatra), plus one. From 1 to 4.

The lower bound of each division belongs to the division that starts there: exactly 30°
is the start of the second sign.

## Rounding

The reduction to [0, 360) treats a tiny negative value, whose sum with 360
would round to exactly 360, as 0.

Sign, nakshatra and pada derive from a single index: that of the quarter-nakshatra
(3°20'), from 0 to 107. The sign is that index divided by 9, the nakshatra is it
divided by 4, and the pada is the remainder of the division by 4, plus one. Thus the three
never contradict each other at a boundary, and none falls out of range through floating-point
error.

## Origin

Classical definitions, common knowledge.

## Check against PL9

Done in two ways.

**By the longitudes.** In all reference charts, the sign, nakshatra
and pada of the `core` are equal to those the same rule gives for the longitude
exported by PL9. This shows that the two longitudes fall in the same
division.

**By PL9's screens.** In 72 charts, the sign, nakshatra and pada of the Lagna
and of the nine grahas were read from the program's screen and match those of the `core` in all
720 values of each type. The point closest to a boundary among these
charts is about 1.5" from it: the exact-boundary rule was not put to
the test.
