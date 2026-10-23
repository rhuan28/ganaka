# Natal tables

Tables of PL9's natal pages that are built from the chart alone, with no rule of their own beyond the ones they
reuse. Code: `packages/core/src/natalTables.ts`; endpoints in [api.md](api.md).

- **Aspects** (`/v1/aspects`): `value[on][from]` is the graded aspect, in virupas from 0 to 60, that `from` casts on
  `on`, by [the aspect curve](strengths/aspects.md) at the angle from one to the other; rows and columns are the nine
  planets, Sun to Ketu. PL9's "Aspects on planets" page prints these values truncated. The page also prints a sign
  fraction (1/4 to 4/4) and colours each cell; neither is computed here yet.
- **Taras** (`/v1/tarabala`): `cells[row][column]` is the tara of the row's nakshatra counted from the column's, for
  the Lagna and the nine planets, as PL9's "Nakshatra spatial matrix".
- **Lordships** (`/v1/lordships`): for each house of a varga, counted from that varga's Lagna sign, its sign's lord and
  the house the lord occupies in the same varga.
- **Dispositors** (`/v1/dispositors`): for each planet, the lords of the signs it occupies in the Shad Varga (D1, D2,
  D3, D9, D12, D30) and how many times each, the most first and ties in the planets' order. PL9 lists the ties in an
  order of its own.
- **Sunrise chart** (`/v1/sunrise-chart`) and **Panch Pakshi** (`/v1/panch-pakshi`) return the core's
  `computeSunriseChart` and `panchPakshi`; see [time/panchanga.md](time/panchanga.md).

## Navamsha ages

PL9's "Navamsha ages" page numbers the 108 navamshas of the zodiac (each 3°20′) from the Lagna's: the Lagna's navamsha
is 1, the count runs in the order of the zodiac and wraps at 108. The planet tables' "age" is that number less one,
counted round, so a planet in the Lagna's own navamsha shows 108. Both need the Lagna. Code:
`packages/core/src/planetInfo/columns.ts` (`navamshaNumber`, `navamshaAge`), in `/v1/planet-info`.

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
