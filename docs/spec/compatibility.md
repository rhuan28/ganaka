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

### Cancellation of the Mangala Dosha

`mangalaCancellations` lists the reasons PL9 gives for the dosha between the two charts to be cancelled or eased, in
the order of its report, each with the chart it is found in (`native`, `partner`, or `pair` for the two together).
PL9 keeps the report's template in its data files, not in the program, so the rules come from its printed reports.
Here the dosha is Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna only; houses count whole signs from the
Lagna; the Bhakoot, the Gana and the Ashtakoota are the Moons', whatever `point` the kootas use; "with" is the same sign; an aspect is a full sign aspect (the 7th for all, and the 4th and 8th of Mars, the 5th
and 9th of Jupiter, the 3rd and 10th of Saturn). The bride is the chart the kootas read as the bride.

- With the dosha in neither chart, the only reason is `noDosha`.
- Of the pair, first: `doshaBoth`, the dosha in both; `marsSaturn`, Mars in a dosha house in one chart and Saturn in
  one in the other, the native's Mars first (the houses are the six above, though the report's words name five);
  `maleficCount`, more of the Sun, Mars, Saturn, Rahu and Ketu in the dosha houses of the groom than of the bride;
  `bhakootGana`, a Bhakoot of 7, a Gana of 6 and an Ashtakoota of 27 or more.
- Then each chart that has the dosha, the native before the partner, in this order:
  - `marsWeakened`: Mars combust, or with Jupiter or Venus or under its full aspect;
  - `brideJupiter`: in the bride's chart only, Jupiter in the 1st, 4th, 5th, 7th, 9th or 10th;
  - `movableSign`: Mars in the 1st, 2nd, 4th, 8th or 12th in a movable sign;
  - `fourthSeventhSigns`: Mars in the 4th or 7th in Aries, Cancer, Scorpio or Capricorn;
  - `marsWithMoonJupiterMercury`: Mars in the 1st, 4th, 7th, 8th or 12th, with the Moon, Jupiter or Mercury or under its
    full aspect;
  - `exaltedOrOwn`: Mars in Capricorn, Aries, Scorpio, Cancer or Leo, or in Capricorn, Aries or Scorpio in the D9;
  - `twelfthSigns`: Mars in the 12th in Taurus, Gemini, Virgo or Libra;
  - `leoCancerSigns`: Mars in the 1st, 4th, 7th, 8th or 12th in Leo, Cancer, Aries, Scorpio or Capricorn;
  - `marsJupiter`: Mars with Jupiter;
  - `fourthSigns`: Mars in the 4th in Aries, Scorpio, Taurus or Libra;
  - `eighthSigns`: Mars in the 8th in Sagittarius, Pisces, Cancer or Capricorn;
  - `dispositor`: the lord of Mars's sign in the 1st, 4th, 5th, 7th, 9th or 10th;
  - `marsMercury`: Mars with Mercury or under its aspect;
  - `marsMoon`: Mars with the Moon;
  - `moonKendra`: the Moon in the 1st, 4th, 7th or 10th;
  - `fivePlacements`: Mars in Aries in the 1st, Sagittarius in the 12th, Scorpio in the 4th, Taurus in the 7th or
    Aquarius in the 8th; `fivePlacementsVariant`, the same with Capricorn in the 7th and Cancer in the 8th;
  - `strongBenefics`: Jupiter or Venus exalted, in its moolatrikona or in its own sign, outside the 6th, 8th and 12th;
    or Mars retrograde or debilitated. This one is the closest reading found, not PL9's exact rule (below).

The engine names the reasons and leaves their wording to the client. Some parts never occur in the sample and are
read from the rule's own statement: the Gana of 5 with a high total, Venus by aspect alone in `marsWeakened`, and
several signs of the house-and-sign rules. The pair's sexes are as above; a woman native with a man partner never
occurs in the sample.

## The answer

`bride` says which chart was read as the bride. Each koota row has its `name`, `max` and `score`, and the Ashtakoota's
Gana, Bhakoot and Nadi a `dosha` flag; the Dashkoota says whether its cancellation applied (`cancelled`). With the
option `point: 'lagna'` and a chart without a Lagna, the kootas come back empty and `missing` names them.

## Checked

The cancellations of the Mangala Dosha: against PL9's report for the same 40 pairs, 39 give its reasons exactly,
in order (211 of 212 reasons). The one left is `strongBenefics` in one chart, which PL9 gives to one of two charts
with the same signs and a different Lagna, by a rule not found.

Against PL9's printed Kutas page and Mangala Dosha report for 40 pairs of reference charts, 20 with a woman as the
partner (`check-compatibility`): every Ashtakoota row and total, every Dashkoota row and total, the 400 sign distances
and the 80 houses of Mars match, but for one pair: two Moons in Chitra in different signs, where PL9 gives the
Dashkoota's Yoni 0 and the engine 4 (the same animal). One case does not show PL9's rule, so the engine keeps the
classical reading.

The composite pages (stage 2J, the CMP2 print model, 40 pairs, `check-variants`): on 94, the two wheels (the native's
chart inside the first, the partner's inside the second), the native's D9 and the partner's (the second D9 of the
page), and the four-level Vimshottari lists of both at the print's clock; on 96, the planet tables of both charts
(degree, nakshatra and SB%; the Shadbala of REF 0002, 0019, 0243 and 0250 left out, as in the Shadbala section of the
conformance report). 0 problems.
