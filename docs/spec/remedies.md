# Remedies: Sade Sati, Kantaka Saturn, Mangala Dosha and gems

What PL9's Remedies reports compute for one chart ("Sadhesati Calculations", "Sadhesati - Kantaka calculations",
"Mangala Dosha Consideration" and the two gem stone recommendations), read in PL9 and checked against its printouts.
Code: `packages/core/src/remedies/`; endpoint `/v1/remedies` in [api.md](api.md). Signs are numbered 1 (Aries) to 12
(Pisces); houses are counted from the natal Moon's sign, which is house 1. The reports' texts are not part of the engine.

## Saturn's sign changes

PL9 takes Saturn's entries into the signs from a fixed list in Lahiri's zodiac, in universal time, whatever ayanamsha
the chart uses; the chart gives only the Moon's and Saturn's natal signs, in the chart's own zodiac, and the houses are counted from
that Moon sign. The engine computes the same entries: Saturn's
Lahiri longitude once a day, each sign change found by halving to within a second. An entry backwards (a retrogression
into the previous sign) counts as an entry into that sign.

PL9's list covers 29 October 1805 to 29 November 2105. In the `pl9` mode the engine searches only that span, and where
the list ends before a re-entry PL9 repeats the first stay on the re-entry's row (its search keeps the last stay it
found); the `corrected` mode searches the whole span the cycles need and leaves that row empty.

## The cycles

A table has three cycles and, in each, some houses from the Moon:

- **Sade Sati:** the 12th, the 1st and the 2nd (PL9's first, second and third Dhayya of the Sade Sati).
- **Laghu Kalyani Dhayya and Kantaka Saturn:** the 4th, the 7th, the 8th and the 10th. The 4th and the 8th are the
  Laghu Kalyani Dhayya; the 4th, the 7th and the 10th are Kantaka Saturn.

Each cycle starts its search at birth plus an offset plus 29 years for each cycle before it (years of 365.25 days). The
offset depends on natal Saturn's house from the Moon:

| Table | Natal Saturn in | Offset |
|---|---|---|
| Sade Sati | the 12th, 1st or 2nd | 15 years before birth (the Sade Sati running at birth is the first cycle) |
| Sade Sati | the 3rd | 5 years after birth |
| Sade Sati | any other | none |
| Kantaka | the 11th | 2.5 years after birth |
| Kantaka | the 12th, 1st, 2nd or 3rd | none |
| Kantaka | the 4th to the 10th | (house − 1) × 2.5 years before birth |

For each house, the first stay is Saturn's first entry into the sign after the search start, ending at Saturn's next
sign change either way (a stay whose end lies past the search counts as not found). The second stay is the next entry into the same sign after that change (the re-entry after a
retrogression); there is none if it comes more than ten years after the first entry. Stays are not merged.

## The answer

`sadeSati` and `kantaka` are three cycles, each a list of houses with `house`, `sign`, `stays` (the first stay and the
re-entry, either null) and `points`: Saturn's bindus in the sign and the Sarvashtakavarga's (null without a Lagna). A stay
has `startJdUt`, `endJdUt` and `span`, its length from birth on (a stay that started before birth counts from birth;
null if it ended before birth) in calendar years, months and days, borrowing 30 days for a month and 12 months for a
year, as PL9 counts it. PL9 prints the dates in universal time, day only, and leaves a date before birth empty.

`mangala` is the Mangala Dosha of [compatibility.md](compatibility.md): Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from
the Lagna and from the Moon, with no exceptions. `gems` names the planets whose gems PL9 recommends: the Lagna's lord
(the "Life" stone), the 5th house's lord ("Punya") and the 9th house's ("Bhagya"), by sign lordship; null without a
Lagna. The gems themselves are the classical ones: Sun ruby, Moon pearl, Mars red coral, Mercury emerald, Jupiter
yellow sapphire, Venus diamond, Saturn blue sapphire.

## Checked

Against PL9's Remedies reports for the 135 reference charts (`check-remedies`): every sign, Ashtakavarga point, house
of Mars and gem lord matches, and 98% of the dates and spans. The rest have two causes. Three of Saturn's sign changes
(May 1833, November 2086, May 2091) fall within about an hour after midnight in the engine and before it in PL9's
list, a day apart in every row that holds them. And where a third cycle runs past PL9's list (after 2100), PL9 prints
what its previous search left (a date of 2105, or of another row) where the engine leaves the row empty.
