# Rectification and the Lagna's steps

PL9's Rectification Tool, the "Ascendant" and "Navamsha" steps of its time tool (F9) and the time a varga's Lagna stays
in its sign (its varga headers), read in PL9. Code: `packages/core/src/rectification.ts`; endpoints
`/v1/rectification` and `/v1/lagna-steps` in [api.md](api.md).

## The Rectification Tool

A table of the birth moved step by step. The zoom levels step by an hour, 15 minutes, 5 minutes, a minute, 15 seconds
and a second (`zoom` 0 to 5). PL9's tool shows 8 rows before the birth's and 10 after; its printed worksheet 23 and 25
(`before`, `after`). Each row gives the moved instant, the Lagna's sign there and, from the 5-minute step down, the
Navamsha Lagna's sign, and at each event (`events`, Julian days UT) the dasha running, as many levels deep as asked
(`levels`; PL9's "automatic" is 3, 3, 4, 4, 5 and 5 by zoom level). The dasha system is `system`, a nakshatra dasha
(Vimshottari by default); the events lie within 400 years of the birth.

The dasha is not computed again for the moved birth. PL9 reads the birth's own dasha table at the event moved by the
row's steps times the dasha time the Moon covers in a day: the years of the mahadasha running at birth × 365.2421875 ×
the Moon's speed in degrees a day / 13°20'. So every row keeps the birth's lords even where the moved birth would put
the Moon in another nakshatra. An instant before the table's first period reads that period at every level (PL9 prints
the birth's lord three times).

## The time tool's steps

No search: one straight line at the Lagna's rate, five minutes of time over the arc the Lagna covers in them.
"Ascendant +" goes to 5° into the next sign (35° less the Lagna's degree in its sign, at that rate) and "Ascendant −"
to 25° into the previous one (5° plus the degree, back). "Navamsha +" goes a quarter degree of the Lagna past the end
of its navamsha, "Navamsha −" a quarter degree before its start, the ends being those of the varga window below.

## Varga windows

The time a varga's Lagna stays in its sign around the birth, as PL9's varga headers show it ("Name + boundary"): the
rate of the Lagna's place in the varga measured 30 seconds later when it is in the first half of its sign, earlier in
the second; the window starts its degree in the sign before the birth at that rate and lasts 30° of it. The D1 has
none: both ends are the birth. Only the vargas whose sign is the part the longitude falls in, counted on through the
zodiac, have one (the Navamsha and the like): there the time in the part is the time in the sign; the others (the
Hora, the Drekkana, the Trimshamsha and those that give their parts signs by rules of their own) are left out, PL9's
header for them not having been checked. Beyond the polar circle the steps and windows are null. Being straight lines, the steps and windows are approximate by a few seconds.

## Checked

The table against PL9's printed worksheet for 134 reference charts (`check-rectification`; the "Today" event is the
print instant): every Lagna sign (6566), and the Vimshottari three levels deep in all but 10 of 6566 rows, each one
period earlier at a boundary in PL9 (its "today" a few seconds before the PDF's time). The steps and windows are not
printed by PL9 and were not compared.
