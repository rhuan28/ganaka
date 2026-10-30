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
  Lagna Kendradi and Drig (below, "Cycles of the Narayana, Lagna Kendradi and
  Drig"). In `corrected` mode the second cycle of these gives each sign 12
  years minus those of the first (`docs/spec/corrections.md`, 16).
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

## Cycles of the Narayana, Lagna Kendradi and Drig

Read in the executable and checked on every page PL9 printed (below). PL9
counts the periods of each level. The mahadashas are counted from birth, run
after run; the antardashas from the start of their mahadasha.

- **Years.** A sign takes its years (above) when the count of the level being
  timed, divided by 12, is even, and 12 minus them when it is odd. A
  mahadasha of the second run thus has 12 years less, of the third the years
  again. An antardasha lasts a twelfth of its mahadasha sign's years at the
  antardasha's own count: the first twelve keep the years of the first run
  even in a mahadasha of the second, the next twelve take 12 less, and so on.
- **Order.** The Narayana repeats its order. The Lagna Kendradi steps on as in
  the first run (three signs, four after every fourth), so that each run starts
  three signs further on. The Drig takes its groups by the count brought back
  to 1..12 and divided by four: the 13th mahadasha, the first of each run after
  the first, is the 12th from the Lagna, followed by the three signs the 9th
  aspects, in the direction taken from that 12th; then the 10th and the 11th
  as in the first run. The antardashas as in the first run, the twelfth
  followed by the first again.
- **Rows.** Each row PL9 prints is the antardasha running at an instant: the
  first at birth, each next one five minutes after the end of the one before.
  An antardasha can run past the end of its mahadasha, and the next row then
  falls in the middle of an antardasha of the next mahadasha; or the twelve
  fall short and the count goes on past the twelfth. A mahadasha no row falls
  in is not printed. In `pl9` mode `core` gives these rows, each under its
  own mahadasha (`DashaPeriod.sub`), as many cycles as asked.
- **Report.** The report pages print the rows in boxes of twelve, each headed
  by the mahadasha of its first row and the years of its first run: 13 boxes
  on #1, 12 on #2. A box can hold rows of the next mahadashas under the first
  one's name; this is what made the #2 pages look scrambled. The worksheet
  cells print the 15 rows from the print instant on, each with its own
  mahadasha.

Checked on the printouts of the eight option sets (351 charts): every box
of the #1 and #2 pages of the three systems (label, first and last date, the
twelve rows), every row of their worksheet cells, and every date of the
fixtures, the second cycle included: 0 failures.

`rashiChainAt` gives the Narayana, the Lagna Kendradi and the Drig at an
instant by the same counts, to five levels.

## Sree Lagna Kendradi

Read in the executable (engine 0.21.0). Given in `pl9` fidelity when the Sree Lagna, before it is brought back into
the zodiac, is under 360°; refused (`NotImplementedOptionError`) past it, where PL9 counts the first sign 13 to 24 and
reads the years beyond the end of its table, which follow no rule. The `corrected` fidelity wraps the sign.

- **Sree Lagna:** the Moon's arc in its nakshatra (the span taken as 13.3333°) times 27, added to the Lagna, not
  wrapped (`sreeLagnaUnwrapped()`; `sreeLagna()` wraps it).
- **Balance:** its degrees in the sign over 30 times the years of the first sign: the first mahadasha starts that
  part of its length before birth, and the rows from its own start.
- **Mahadashas:** forward from an odd sign, backward from an even one; forward with Saturn in it; Ketu in it
  reverses the direction. The kendradi order, stepping on from run to run as the Lagna Kendradi (`mahadashaAt`).
- **Antardashas:** from the mahadasha sign, the kendras first; backward with Ketu in the sign (not a reversal), else
  forward with Saturn in it, else forward from an odd sign and backward from an even one. Past the twelfth they go on
  in the kendradi order run after run.
- **Years and rows:** PL9's table, as the Narayana, Lagna Kendradi and Drig (above).

Checked on the worksheet cells (135 charts): every date of the 77 charts under 360° but REF 0098's antardasha order
from 2026-08 (set apart); the 58 others refused.

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
- The second cycle of Narayana, Lagna Kendradi and Drig: antardashas timed by
  the years of their own count, which do not fill their mahadasha or run past
  it, and an order of signs that steps on from run to run in the Lagna
  Kendradi and the Drig ("Cycles of the Narayana, Lagna Kendradi and Drig").
  `pl9` mode reproduces it; `corrected` mode gives the classical rule.
- The eight-bit truncation in the Drig order, corrected in `corrected` mode.

## What was not verified

- Sree Lagna Kendradi: the balance of a quarter of the charts ("Sree Lagna
  Kendradi (not given)").
- The `corrected` mode's second cycle has no reference: PL9 has no such
  rule. The Lagna Kendradi and Drig chains at an instant follow the table's
  counts but were not compared with a printed chain (the Narayana's was, at
  296 instants, `docs/spec/time/transits.md`).
- In Niryaana Shoola, only the 15 lines of the worksheet cell: the first
  mahadasha printed there, its antardashas and the beginning of the next.
- More than two levels in the tables (the Narayana chain at the instant has
  five, checked), and Parashara's Chara with 8 karakas.
