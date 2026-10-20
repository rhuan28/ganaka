# Sign dashas

Code: `packages/core/src/dashas/rashi.ts` (and `strength.ts`, `points.ts`).
Tests: `packages/core/test/rashi.test.ts`, `packages/core/test/strength.test.ts`.

Nine of PL9's ten sign dashas. The default is the options observed in the
installation examined ("Chara dasha method: K.N.Rao", "Padanadhamsadasha
Method: K.N.Rao", "Rahu's Exaltation sign for Rashi Dashas: Taurus", "Mercury
Exaltation for Rashi Dasha: Exalted according to degree", "Start of Rashi
Antardashas: the Sign"); the others are in "Options". Sree Lagna Kendradi
does not yet match PL9 and is refused (`NotImplementedOptionError`).

## Common rules

- **Start:** at birth, with no balance.
- **Length:** in whole years per sign; the year is that of the other dashas
  (`dashaYearDays`). A sign of 0 years is skipped.
- **Antardashas:** 12 equal parts. Unless stated otherwise, the
  first is the stronger sign between the mahadasha sign and the 7th
  (`docs/spec/dashas/sign-strength.md`), and they move forward if the
  mahadasha sign is odd, backward if it is even — as in Kalachakra.
- **Cycles:** the sequence repeats with the same years — except in Narayana,
  Lagna Kendradi and Drig. In these, in `pl9` mode, `core` only gives the
  first cycle and refuses (`NotImplementedOptionError`) a request for more than one,
  because PL9's comes out scrambled; in `corrected` mode, the second cycle gives
  each sign 12 years minus those of the first (`docs/spec/corrections.md`, 16).
- **Modes:** in the sign dashas, `corrected` mode differs from `pl9` in the
  Drig order (the eight-bit truncation, below) and in the second cycle
  (`docs/spec/corrections.md`, 15 to 17).
- **"Direct" signs:** Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius.

## Years

**Count to the lord** (Narayana, Lagna Kendradi, Drig): the signs from the
sign to its lord (the stronger of the two for Scorpio and Aquarius),
forward in the direct signs and backward in the others, not counting the
sign itself; 12 when the lord is in it; plus 1 if the lord is exalted,
minus 1 if debilitated; 13 counts as 12. Exaltation, here, holds over the whole sign,
except for Mercury (only up to 15° Virgo); Rahu is exalted in Taurus and Ketu
in Scorpio; debilitated in the opposite sign.

**Chara (K.N. Rao):** the same count, without exaltation. For Scorpio and
Aquarius: if one of the lords is in the sign, the other one counts; otherwise, the one
in a sign with more planets; tie, the one with the higher degree in the sign.

**Navamsha:** the signs to the simple lord, always forward.

**Padanadhamsa:** in the Navamsha, the signs to the simple lord counting both
ends, forward from an odd sign and backward from an
even one; 12 with the lord in its own sign, 10 with it in the 7th.

**Shoola:** 9 years each. **Niryaana Shoola** and **Sthira:** 7, 8 or 9 years
(movable, fixed, dual).

## Sequences

- **Chara:** from the Lagna sign, forward if the 9th from it is direct,
  backward if not. Antardashas: from the sign after the mahadasha sign, in the
  direction given by the 9th from it, with the sign itself last.
- **Narayana:** from the stronger of the Lagna and the 7th. Direction: forward in an
  odd sign, backward in an even one; Saturn in the sign makes it forward; Ketu in the
  sign reverses the direction. Order by the modality of the first sign: movable, one
  sign after the other; fixed, every sixth sign; dual, by trines (the sign,
  the 9th and the 5th in the opposite direction, then the group three signs ahead).
  The direction of the dual signs is thus the reverse of the others'.
  With Saturn in the first sign, one after the other, whatever the
  modality.
- **Lagna Kendradi:** same first sign and direction as Narayana; the four
  kendras, then the panapharas, then the apoklimas.
- **Shoola:** from the stronger of the Lagna and the 7th, always forward.
  Antardashas from the mahadasha sign itself, forward in an odd
  sign and backward in an even one.
- **Drig:** the 9th, the 10th and the 11th from the Lagna, each followed by the three
  signs it aspects (sign aspect), forward if it is direct,
  backward if not. In PL9, when the sign arithmetic goes below 1, the
  number is truncated to eight bits before being brought back to 1..12, and the sign comes out four
  ahead; `corrected` mode brings the arithmetic back to 1..12 as it is.
- **Sthira:** from the Brahma's sign, in zodiac order. The Brahma: between the
  Lagna and the 7th, the one with more sign points (the Lagna on a tie;
  `docs/spec/dashas/sign-strength.md`, "Points"); of the lords of the 6th, the 8th and
  the 12th from it, Saturn excluded, the one with more planet points (the
  earlier one on a tie).
- **Niryaana Shoola:** from the stronger of the 2nd and the 8th, one sign after the
  other, forward in an odd sign, backward in an even one.
- **Navamsha:** from the Lagna sign in the Navamsha, if odd; if even, from the
  odd sign of the same lord (Leo in place of Cancer); forward.
- **Padanadhamsa:** from the sign, in the Navamsha, of the lord of the Arudha Lagna
  (Parashara: in the 1st or the 7th, the 10th from there); order by that sign's modality
  (movable, consecutive; fixed, every sixth sign; dual, by trines with groups
  one sign ahead, and within the group the 5th before the 9th), direction by
  parity. The antardashas follow the same order from the
  mahadasha sign.

## Options

- **Chara dasha method: Parashara** (`charaMethod: 'parashara'`). Mahadashas
  from the stronger by points of the Lagna and the 7th, one sign after the other, in the
  direction given by the 9th from the Lagna (as in K.N. Rao). Years: the count
  to the lord, without dignity; for Scorpio and Aquarius, 12 with both
  lords in the sign; with one, to the other; otherwise Mars or Saturn if its
  sign has more planets than the node's; otherwise the lord whose sign has the
  highest modality (dual, fixed, movable); within the same modality, the exalted one,
  then the one giving more years (Mars or Saturn on a tie); plus 1 year if the
  chosen one is exalted, minus 1 if debilitated (with both in the same sign,
  if either of them is). Antardashas: from the stronger by points of the
  sign and the 7th, forward if it is odd, backward if even; from a
  movable sign, one after the other; from a fixed one, every sixth sign; from a dual one,
  every third sign, seven after each fourth (the kendras, then those of the sign
  four ahead).
- **Antardashas start from dasha lord** (`charaAntarFromLord`): only in
  Parashara's Chara (in K.N. Rao PL9 ignores it): the comparison for the
  antardashas starts from the sign of the mahadasha lord, and not from the mahadasha.
- **Padanadhamsadasha Method: Iranganti** (`padanadhamsaMethod`): PL9 gives the
  same dates as with K.N. Rao (the calculation does not distinguish the two values that the
  option stores); so does `core`.
- **Rahu's Exaltation: Gemini** (`rahuExaltation: 'gemini'`): in the years, Rahu
  exalted in Gemini and debilitated in Sagittarius, Ketu the reverse; the option
  adds these signs: Rahu remains exalted in Taurus and debilitated in
  Scorpio, Ketu the reverse.
- **Mercury Exaltation: anywhere in Virgo** (`mercuryExaltation: 'anywhere'`):
  in the years, Mercury exalted throughout Virgo.
- **Start of Rashi Antardashas: From Lord** (`antardashaStart: 'lord'`): in the
  systems whose antardashas start from the stronger of the axis (Narayana, Lagna
  Kendradi, Drig, Niryaana Shoola, Sthira, Navamsha), they start from the sign of the
  lord of that stronger sign (Mars for Scorpio, Saturn for Aquarius),
  forward if it is odd, backward if even. Does not change Chara, Shoola and
  Padanadhamsa.

## Origin

Measured on the reports printed by PL9 (printout model RAS: Chara #1 to
#3, Sthira, Niryaana Shoola #1 and #2, Drig, Navamsha, Narayana and Lagna
Kendradi #1 and #2, Shoola, Padanadhamsa, and the worksheet "34. Dashas - Rashi
based") and read in the executable where the measurements did not decide (Chara years,
direction of Narayana and Lagna Kendradi, Drig order); Sthira, Parashara's
Chara and the options, read in the executable and checked on the reports
printed with each option (30 charts per alternative). Count on
the bench: `docs/reports/conformance.md`.

## PL9 defects found

- The "Niryaana Shoola Dasha" report prints Drig. Niryaana Shoola was
  measured in the worksheet cell.
- The second cycle of Narayana, Lagna Kendradi and Drig: on the #2 pages
  of the reports it comes out scrambled (periods out of order, lengths that
  do not add up); in the worksheet cells it looks ordered, most
  mahadashas with the years of the first cycle, some with 12 minus those years
  (the classical second-cycle rule) and some with neither. It was not
  reproduced; `corrected` mode gives the classical rule.
- The eight-bit truncation in the Drig order, corrected in `corrected` mode.

## What was not verified

- Sree Lagna Kendradi: read in the executable (sign of the Sree Lagna, balance by its
  degree in the sign, kendras, following cycles by the same step), but the
  antardashas of the following cycles do not yet match the worksheet
  cells.
- The second cycle of Narayana, Lagna Kendradi and Drig: `pl9` mode
  does not give it in the tables, and the `corrected` one has no reference in them. The
  Narayana chain at the instant (`docs/spec/time/transits.md`) has the second
  cycle with 12 years minus those of the first, checked at 296 instants.
- In Niryaana Shoola, only the 15 lines of the worksheet cell: the first
  mahadasha printed there, its antardashas and the beginning of the next.
- More than two levels in the tables (the Narayana chain at the instant has
  five, checked), and Parashara's Chara with 8 karakas.
