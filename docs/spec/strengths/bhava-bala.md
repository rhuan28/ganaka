# Bhava Bala

Code: `packages/core/src/strengths/bhavaBala.ts` and `strengths/compute.ts`
(`computeBhavaBala`). Tests: `packages/core/test/bhavaBala.test.ts`.

The strength of each house as PL9 computes it, read in the executable and checked against the
"Shad Bala and Bhava Bala" and "22. Bhava Bala" pages of the bench's charts. In
virupas; 60 virupas are one rupa. It takes the five Shadbala options (the lord and
the Drishti change with them).

## The houses

Twelve equal houses from the Lagna: house *k* is the point Lagna + 30(*k* − 1),
and its sign is the point's. The report shows the whole degree of the point within
the sign (the same in all twelve houses). The planets sit in the houses by sign: a planet's
house is the count from the Lagna's sign to the planet's sign.

## The five parts

- **Lord:** the Shadbala total of the lord of the house's sign. Scorpio has
  Mars; Aquarius, Saturn.
- **Dig:** the distance from the house's point to the point of the house where the sign is
  weakest, folded to 0–180 and divided by 3. Where the sign is weakest, by its
  type:
  - human (Gemini, Virgo, Libra, Aquarius and the first half of
    Sagittarius): the 7th house;
  - aquatic (Pisces and the second half of Capricorn): the 10th;
  - quadruped (Aries, Taurus, Leo, the second half of Sagittarius and the
    first of Capricorn): the 4th;
  - insect (Cancer and Scorpio): the 1st.

  At exactly 15° of Sagittarius or of Capricorn no type applies: PL9 reads
  an undefined value; the `core` gives 0.
- **Drishti:** the graded aspects (`aspects.md`) of the seven planets on the
  house's point, as in Drik Bala (benefics add, malefics subtract; a
  quarter of each, Jupiter and Mercury whole by the option; the Moon benefic when
  waxing; Mercury by its option).
- **Planets in the house:** Mercury and Jupiter add 60 each; the Sun, Mars and
  Saturn take away 60 each; the Moon and Venus do not count.
- **Day and night:** 15 for the house's sign when it is strong at the time of
  birth: by day, Gemini, Leo, Virgo, Libra, Scorpio and Aquarius; by night
  (by the Shadbala day, `shadbala.md`), Aries, Taurus, Cancer, Sagittarius and
  Capricorn. Up to 0.05 day after the Shadbala sunrise or sunset, only
  Pisces receives the 15.

Total = lord + Dig + Drishti + planets + day/night; rupas = total / 60.

## The report

The five parts come out truncated toward zero; the total and the rupas,
rounded. In PL9's memory (REF 0010) the values match the `core`'s
to 1e-4.

## Check

`pnpm --filter @reverse/oracle verify`, "Bhava Bala" section: each part, the total and
the rupas of the twelve houses, in the 135 charts and in the five Shadbala option
sets, with the report's rounding; the charts outside the Cheshta series
listed and not checked (the lord depends on Shadbala).
