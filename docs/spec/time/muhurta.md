# Muhurta

What PL9 shows on the pages "127. Muhurta", "128. Muhurta - dashas and balas" and "129. Muhurta
vargas" of the TEMPO model, and how the `core` reproduces it (`computeMuhurta` in
`packages/core/src/muhurta/`). PL9 does not search for moments: the Muhurta is the evaluation of a given instant
(the chart's "Muhurta" event) for a native. Answer keys: the 135 reference charts with the event at the
two reference dates, in Jaipur (`packages/oracle/fixtures-muhurta/`).

## The instant and the place

Explicit inputs: the instant (UT), the place and the place's clock (`utcOffsetHours`, which gives the day of the
week). In the answer keys: 01/01/2000 12:00 and 15/06/2030 06:00, Jaipur time, in Jaipur. The
Muhurta chart is the same for all natives on a date; what changes from one native to another is what is
counted from the natal Moon and from the natal chart.

## What comes from the earlier stages

The Muhurta chart and the drawn vargas (D9, D10, D16, D24, D60), the positions with nakshatra and syllable,
the dignity, the Shadbala over the minimum (SB%), the Bhava Bala and the Vimshopaka are the computations of stages 3
and 4 on the Muhurta instant. The kakshas are those of the transits (stage 5A): the Muhurta planets in the
natal Ashtakavarga; the "Kaks." column prints the bindu of the kaksha lord (0 or 1) and the lord. Tarabala
and Chandrabala, counted from the natal Moon, and the native's dasha chains at the instant (Vimshottari, Narayana,
Yogini, Ashtottari) are also those of the transits; before birth PL9 prints the chain as in the transits.
Tithi, karana and yoga are those of the panchanga (stage 5B) at the instant.

From the data:

- SB# is how many of the six Shadbala strengths exceed their minimum.
- VB is the Shadvarga Vimshopaka, rounded to the unit (and with one decimal place on page 128).
- The twelve numbers on page 128 are the total Bhava Bala of each house, written next to the house.
- The "Muhurta Vimshottari" is the Vimshottari of the Muhurta chart itself (from its Moon): two
  lists, at two and at four levels. The list of the native's Vimshottari, at four levels, and those of the Muhurta
  start at the period running on the date of the clock of the machine that printed (or at the first, if it starts
  later); the check starts from the first printed line.

## The Avastha

From the data (18 of 18 positions in the two Muhurta charts; the routine was not found in the executable): the
Baladi, in 6° bands of the sign, in the order infant, "Youth.", "Adoles.", old and dead in the odd
signs (Aries, Gemini…) and in reverse order in the even ones. PL9 calls the second band (Kumara)
"Youth." and the third (Yuva) "Adoles."; the `core` uses the same names (`youth`, `adolescent`). The
edge of each band belongs to the band above.

## The panchang thermometer

Read in the executable. Each element gets a score of 1 (bad), 2 or 3 (good), multiplied by its weight:

- the Tarabala, weight 1 (good: Sampat, Kshema, Sadhana, Mitra and Parama Mitra);
- the karana, weight 0.5 (bad: Kimstughna, the eight Vishti, Shakuni, Chatushpada and Naga);
- the yoga, weight 0.5, counted from the Yogi point — the tropical Sun and Moon plus 93°20′ (the tropical
  longitudes come from the data: with the sidereal ones the 270 levels do not close) — bad in parts 1, 6, 8, 9, 10,
  13, 15, 17 and 19;
- the Chandrabala, weight 0.5 (bad in houses 6, 8 and 12);
- and, per activity, the nakshatra of the Muhurta Moon (weight 1), the weekday and the tithi (0.5 each), each
  with its own table. The weekday is that of the civil calendar at the place's clock (read in the
  executable), not the Vedic day counted from the panchanga's sunrise: between midnight and sunrise
  the two differ.

The column is drawn filled up to the sum over 13.5, the maximum of the scores. Check: the 270 levels read
from the drawing, to within 0.0012. Since the Muhurta chart is the same for all natives on a date, the
yoga, the karana, the tithi, the nakshatra and the weekday were seen at only two instants (the 270 levels
vary by the Tarabala and the Chandrabala); the choice of tropical longitudes for the yoga rests on those
two instants (2030 calls for a bad yoga, 2000 a good one).

The activities, in PL9's order: general ("General Auspicious Events"), travel ("Travelling") and marriage
("Marriage"). The activity is that of the Muhurta worksheet of the open chart: a click at the end of the cell's
title line moves to the next one, and each chart opens with the saved activity. The TEMPO model came out in travel,
checked in the 270 charts. General and marriage were printed separately (only the Muhurta worksheet, the event
on 02/07/2030 12:00 in Jaipur, a day on which the three activities give different scores): 30 charts each,
checked like the others.

## What is not included

The texts of "Nakshatra & Tithi Activities" and the thermometer note (interpretations): the `core` states which
nakshatra and tithi the texts refer to. Mandi, "BP" and "eM" in the drawings.

## Check

On the bench (`pnpm --filter @reverse/oracle verify`, section "Muhurta"): the 270 printouts of the TEMPO model
(the 135 charts at both dates) and the 30 of each of the general and marriage activities
(`packages/oracle/fixtures-muhurta-options/`), 0 failures. Pending: the VB of Rahu and Ketu, which is not the
Shadvarga Vimshopaka of the `core` (which checks out on the seven planets).
