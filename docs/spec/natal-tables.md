# Natal tables

Tables of PL9's natal pages that are built from the chart alone, with no rule of their own beyond the ones they
reuse. Code: `packages/core/src/natalTables.ts`; endpoints in [api.md](api.md).

- **Aspects** (`/v1/aspects`): `value[on][from]` is the graded aspect, in virupas from 0 to 60, that `from` casts on
  `on`, by [the aspect curve](strengths/aspects.md) at the angle from one to the other; rows and columns are the nine
  planets, Sun to Ketu. PL9's "Aspects on planets" page prints these values truncated. The page also prints a sign
  fraction (1/4 to 4/4) and colours each cell; the fraction's rule is under "Pages checked in print" below, and
  neither is computed here yet.
- **Taras** (`/v1/tarabala`): `cells[row][column]` is the tara of the row's nakshatra counted from the column's, for
  the Lagna and the nine planets, as PL9's "Nakshatra spatial matrix".
- **Lordships** (`/v1/lordships`): for each house of a varga, counted from that varga's Lagna sign, its sign's lord and
  the house the lord occupies in the same varga.
- **Dispositors** (`/v1/dispositors`): for each planet, the lords of the signs it occupies in the Shad Varga (D1, D2,
  D3, D9, D12, D30) and how many times each, the most first and ties in the planets' order. PL9 lists the ties in an
  order of its own.
- **Sunrise chart** (`/v1/sunrise-chart`) and **Panch Pakshi** (`/v1/panch-pakshi`) return the core's
  `computeSunriseChart` and `panchPakshi`; see [time/panchanga.md](time/panchanga.md).

## Aspects on the houses

PL9's "Aspects on Houses" pages (four, three houses each) draw, for each house, two bar charts of the nine planets,
Sun to Ketu, as whole percents of a full aspect. With v the graded aspect (in virupas, by [the aspect curve](strengths/aspects.md),
the special aspects included) that the planet casts on the house's point, the Lagna's longitude plus 30° for each house
after the first, and w the one it casts on the longitude of the house's lord (the lord of the house's sign; nothing
when the planet is the lord):

- **on the house:** trunc(v / 0.6), the percent cut;
- **on the house and its lord:** trunc(trunc(v / 1.2) + w / 1.2). Each part counts half; PL9 cuts the house's half to
  a whole number before it adds the lord's, so the result can be one less than the average of the two cut once.

A bar of 0 is drawn as a red stub at the base, the others in green; the colour says nothing of the nature. Code:
`houseAspects` in `packages/core/src/natalTables.ts`, in `/v1/house-aspects`. Checked against the four printed pages of
the 135 reference charts: 29,160 bars (14,580 of each chart), no failure.

## Navamsha ages

PL9's "Navamsha ages" page numbers the 108 navamshas of the zodiac (each 3°20′) from the Lagna's: the Lagna's navamsha
is 1, the count runs in the order of the zodiac and wraps at 108. The planet tables' "age" is that number less one,
counted round, so a planet in the Lagna's own navamsha shows 108. Both need the Lagna. Code:
`packages/core/src/planetInfo/columns.ts` (`navamshaNumber`, `navamshaAge`), in `/v1/planet-info`.

## Nama

The planet tables of PL9's Tempo pages (Animated transits I, the Gochara tables) print a "Nama" column: the syllable of
the point's nakshatra pada, the same as the Panchanga's naamakshar of the Moon. A pada is a navamsha of the zodiac, so
the syllable is read from the point's navamsha (`navamshaOf`). A few padas have none in the table, and the answer gives
null for them. Code: `nama` in `/v1/planet-info`, from `BY_PADA_NAAMAKSHAR` (`packages/core/src/panchanga/tables.ts`).
Checked on capture 101: all 20 cells, the birth chart's and the transits'.

## Varga deities

PL9's "Planetary deities" page gives the deity of the Lagna, the nine, Mandi and Bhrigu Bindu in each of the sixteen
classical vargas. The names are the classical ones (BPHS); the rules are PL9's. With d the degree within the sign and
N the varga's parts, the part is trunc(N × d / 30), counted from 0, and in each varga:

- **D1:** the deity of the nakshatra (the D27's list below), over the whole zodiac.
- **D2:** Deva, Pitar; reversed in even signs.
- **D3:** Narada, Agastya, Durvasa. **D4:** Sanaka, Sananda, Sanat Kumara, Sanatana. The same order in every sign.
- **D7:** Kshaara, Ksheera, Dadhi, Ghritha, Ikshu rasa, Madhu, Shuddha Jala; reversed in even signs.
- **D9:** the cycle Deva, Manushya, Rakshasa, starting at Deva in movable signs, Manushya in fixed and Rakshasa in
  dual ones. **D45:** the cycle Brahma, Shiva, Vishnu, started the same way.
- **D10:** Indra, Agni, Yama, Rakshasa, Varuna, Vayu, Kubera, Ishan, Brahma, Ananta; reversed in even signs.
- **D12:** the cycle Ganesha, Ashwini Kumara, Yama, Ahi.
- **D16:** the cycle Brahma, Vishnu, Shiva, Surya; reversed in even signs.
- **D20:** twenty goddesses, one list for odd signs (Kali … Sumukhi) and another for even ones (Daya … Aparajita).
- **D24:** the cycle Skanda, Parshudhara, Anala, Vishwakarma, Bhaga, Mitra, Maya, Antaka, Vrishadhwaja, Govinda, Madan,
  Bhima, twice in a sign; reversed in even signs.
- **D27:** the deities of the 27 nakshatras, Ashwini Kumara (Ashwini) to Pusha (Revati), the same in every sign.
- **D30:** Agni, Vayu, Indra, Kubera, Varuna; reversed in even signs. PL9 cuts its parts at 5°, 10°, 18° and 25° in
  every sign, the odd signs' limits, though the Trimshamsha's sign uses 5°, 12°, 20° and 25° in even ones
  ([vargas.md](vargas.md)).
- **D40:** the cycle Vishnu, Chandra, Marichi, Tvashta, Dhata, Shiva, Ravi, Yama, Yaksha, Gandharva, Kaala, Varuna.
- **D60:** the sixty Shashtiamshas, Ghora to Chandrarekha; reversed in even signs.

The full lists are in the code (`packages/core/src/planetInfo/deities.ts`), as ids.

**Shashtiamsha:** its number is trunc(2d) + 1 in odd signs and 60 − trunc(2d) in even ones, the D60 deity's place in
the list; 33 of the sixty are benefic and the others malefic (the list is in the code). The planet tables show the
name with B or M.

## Degrees within the vargas

A chart of a varga with degrees (PL9's "Special" page, the D2) places a point at its degree within the sign times the
varga's parts, less the whole signs (N × d mod 30), and writes it rounded to the second with the minutes cut
(29°59′59.6″ shows 30:00 as 00:00 of the next degree, as PL9 does). The Trimshamsha, whose parts are
unequal, is left out: PL9's arithmetic for it is not checked.

Checked against PL9's printed "Planetary deities" and "Special" pages and the planet tables of the 135 reference
charts (`check-natal-tables`, `check-planet-info`): the deities of the sixteen vargas (21,600 cells), the D2's degrees
(1,620), the Shashtiamsha's nature (1,215) and the navamsha age (1,215), with no failure.

## Pages checked in print

A second print model (REF2) prints the natal pages that the engine computed but the first model left out. It covers
Birth chart II, Sudarshan Chakra, Alternate Lagnas, Lordships, Compound relations, the two pages of aspects,
Auspiciousness graph and Nakshatra spatial matrix. It was printed for the 135 reference charts and read with the
bench's variant checker. What the prints show, beyond the rules already in these specs:

- **Aspect fraction.** Before the virupas, PL9 prints a fraction from the signs counted from the aspecting planet to
  the aspected one: the 3rd and 10th 1/4, the 5th and 9th 1/2, the 4th and 8th 3/4, the 7th 4/4. The special aspects
  are full instead: Mars on the 4th and 8th, Jupiter, Rahu and Ketu on the 5th and 9th, Saturn on the 3rd and 10th.
  A cell reads the fraction and the virupas cut, as "3/4(42)". With no fraction it reads "- (v)", or "-" when v is
  0. A fraction over no whole virupa prints alone ("1/2"). Rahu and Ketu, exactly opposite, print 59 or 60 by a
  hair. The bar charts of the same pages draw each aspect from or on a planet as a percent of 60 virupas (checked to
  within 1.5 points, a little under one virupa).
- **Lordships.** Each line gives a house, the house its lord occupies and the lord. When the lords of two houses
  occupy each other's houses (two different planets), the line is marked with "*".
- **Sudarshan Chakra.** Three rings of the twelve signs, the inner one counted from the Lagna, the middle from the
  Moon and the outer from the Sun. Each ring's top sector is that point's sign, and every point stands in its D1
  sign.
- **Alternate Lagnas.** The Karakamsha charts draw "Asc" at the Karakamsha. The Bhava and Ghatika Lagna charts put
  the Lagna in that special lagna's sign. The Sripati chart puts a point in the sign of the Lagna plus its house less
  one. The "Krishnamurti chart" has no signs: it places each point in its Placidus house.
- **Birth chart II.** The edges of the chart print, for each house, the Sarvashtakavarga bindus and the Bhava Bala.
- **Nakshatra spatial matrix.** PL9's tara names are Pratyari and P.mitra for the core's Pratyak and Atimitra.
- **Auspiciousness graph.** Only its chart is checked. The scale of the graph's bars is not known.

In the 135 charts, every one of these checks passes: the charts drawn, the planet tables, the dashas, the house
edges, the rings, the KP chart, the lordships, the relations, the aspect matrix and bars, and the taras. Shadbala
and Bhava Bala are left out on the charts outside PL9's Cheshta Bala series.
