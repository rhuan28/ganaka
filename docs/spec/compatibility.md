# Compatibility

The compatibility of two charts as PL9's "Compatibility - Kutas" and "Mangal Dosha Consideration" pages give it, read in
PL9 and checked against its pages. Code: `packages/core/src/compatibility/`; endpoint `/v1/compatibility` in
[api.md](api.md). Nakshatras are numbered 1 (Ashwini) to 27 (Revati) and signs 1 (Aries) to 12 (Pisces).

## Bride and groom

Each chart has a sex (`sex`, required for both). The bride is the partner if a woman; otherwise the native if a woman; otherwise (two men or two
women) the partner, as PL9 reads the pair. Every count runs from the bride to the groom, and the tables below read bride by
groom. The kootas use the Moon by default, or the Lagna by the option `point`: its sign, nakshatra and degree within
the sign, in both charts.

## Ashtakoota (36)

- **Varna (1):** the sign's caste, water Brahmin, fire Kshatriya, earth Vaishya, air Shudra; 1 when the bride's is the
  groom's or lower.
- **Vashya (2):** the sign's group (Aries and Taurus quadruped; Gemini, Virgo, Libra and Aquarius human; Cancer and
  Pisces water; Leo wild; Scorpio insect; Sagittarius human to 15° and quadruped after; Capricorn quadruped to 15° and
  water after), scored by PL9's table (in the code), 0 to 2 with halves.
- **Tara (3):** the count from the bride's nakshatra to the groom's on the cycle of nine; 3 for 1 or 2, 1.5 otherwise.
  PL9 never gives 0 here, unlike the texts.
- **Yoni (4):** the animals of the nakshatras, scored by the classical table (in the code); 4 for the same animal.
- **Graha Maitri (5):** by the lords of the two signs (in the code); 5 for the same lord.
- **Gana (6):** Deva, Manushya, Rakshasa; bride by groom: Deva 6, 5, 1; Manushya 6, 6, 0; Rakshasa 0, 0, 6.
- **Bhakoot (7):** 7 when the groom's sign is the 1st, 3rd, 4th, 7th, 10th or 11th from the bride's, 0 otherwise.
- **Nadi (8):** Adi, Madhya, Antya; 8 for different nadis, 0 for the same.

A dosha is marked on the Gana, the Bhakoot or the Nadi when it scores 0; no cancellation changes the score. The verdict
by total: up to 16 avoid, 17 to 20 medium, 21 to 30 good, 31 and more excellent; PL9 compares whole numbers, so a total
with a half point gets none.

## Dashkoota (44)

Dhinam (3), Ganam (6), Mahendram (2), Stree-Deergham (2), Yoni (4), Rashi (7), Rashiadhipati (5), Vashyam (2), Rajju
(8), Vedhai (2), and Gender, Gothram and Caste (1 each), each by PL9's table (in the code). PL9 softens the kootas
when the two Moon signs' lords are one, the signs are opposite, or the lords are friends both ways: then the Ganam is at
least 3, the Rashi at least 3.5, the Rajju 4 and the Vedhai 1 (even where they would score more, as PL9 does). Gender is
the nakshatras' sex, not the charts'. PL9's total counts the Caste with earth and air swapped (water Brahmin, fire
Kshatriya, air Vaishya, earth Shudra), though its Caste row does not, so the total is not always the rows' sum. The
verdict by total: up to 19 avoid, 20 to 27 medium, 28 to 37 good, 38 and more excellent.

## Distances

For the Lagna and each of the nine, the sign of the partner's point counted from the native's (1 to 12) and back, and
the nakshatra counted the same way on the cycle of nine (1 to 9).

## Mangala Dosha

For each chart, the house of Mars from the Lagna and from the Moon; Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from
either is the dosha from it. PL9 evaluates only these two, without exceptions. From the Lagna it needs the Lagna.
PL9's cancellation of the dosha between two charts is not covered.

## The answer

`bride` says which chart was read as the bride. Each koota row has its `name`, `max` and `score`, and the Ashtakoota's
Gana, Bhakoot and Nadi a `dosha` flag; the Dashkoota says whether its cancellation applied (`cancelled`). With the
option `point: 'lagna'` and a chart without a Lagna, the kootas come back empty and `missing` names them.

## Checked

Against PL9's printed Kutas page and Mangala Dosha report for 40 pairs of reference charts, 20 with a woman as the
partner (`check-compatibility`): every Ashtakoota row and total, every Dashkoota row and total, the 400 sign distances
and the 80 houses of Mars match, but for one pair: two Moons in Chitra in different signs, where PL9 gives the
Dashkoota's Yoni 0 and the engine 4 (the same animal). One case does not show PL9's rule, so the engine keeps the
classical reading.
