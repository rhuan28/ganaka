import { describe, expect, it } from 'vitest';
import { FUNCTIONAL_BY_LAGNA, functionalNatures, naturalNatures, yogaNatures } from '../src/yogas/natures';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<'lagna' | Planet9, number>;
// Every planet alone in its sign; the Lagna in Aries. In longitude: Sun, Rahu, Moon, Mars, Mercury, Jupiter, Ketu,
// Venus, Saturn.
const BASE: Lons = { lagna: 5, sun: 40, moon: 100, mars: 160, mercury: 200, jupiter: 235, venus: 280, saturn: 310, rahu: 70, ketu: 250 };
const chart = (over: Partial<Lons>): Lons => ({ ...BASE, ...over });

describe('the functional nature by the Lagna', () => {
  it('is Parashara\'s list of PL9 for the seven, in the twelve signs', () => {
    const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
    const code = { benefic: 'B', malefic: 'M', neutral: 'N' } as const;
    for (let sign = 0; sign < 12; sign++) {
      const f = functionalNatures(chart({ lagna: sign * 30 + 5, rahu: 10, ketu: 190 }))!;
      expect(seven.map((p) => code[f[p]]).join('')).toBe(FUNCTIONAL_BY_LAGNA[sign]);
    }
    expect(FUNCTIONAL_BY_LAGNA[0]).toBe('BNBMBMM');
    expect(FUNCTIONAL_BY_LAGNA[11]).toBe('MBBMBMM');
  });

  it('makes a node alone in its sign benefic in the 1st, 5th or 9th, malefic in the 6th, 8th or 12th, else neutral', () => {
    // Lagna in Aries: Rahu in Leo (5th) and Ketu in Aquarius (11th), no planet with them.
    const a = functionalNatures(chart({ lagna: 5, rahu: 125, ketu: 305, saturn: 330, sun: 40 }))!;
    expect(a.rahu).toBe('benefic');
    expect(a.ketu).toBe('neutral');
    // Rahu in Virgo (6th), Ketu in Pisces (12th).
    const b = functionalNatures(chart({ lagna: 5, rahu: 155, ketu: 335, mars: 100, saturn: 300 }))!;
    expect(b.rahu).toBe('malefic');
    expect(b.ketu).toBe('malefic');
  });

  it('gives a node with planets in its sign the nature of the nearest one', () => {
    // Lagna in Aries; Rahu at 205 in Libra with Mercury at 200 and Venus at 208: Mercury is nearer (malefic for Aries).
    const f = functionalNatures(chart({ lagna: 5, rahu: 205, ketu: 25, mercury: 200, venus: 208, sun: 40 }))!;
    expect(f.rahu).toBe('malefic');
    // Ketu at 25 in Aries with the Sun at 10: the Sun is benefic for Aries.
    const g = functionalNatures(chart({ lagna: 5, rahu: 205, ketu: 25, sun: 10, mercury: 200, venus: 208 }))!;
    expect(g.ketu).toBe('benefic');
  });

  it('is unknown without a Lagna', () => {
    const { lagna: _, ...noLagna } = BASE;
    expect(functionalNatures(noLagna)).toBeNull();
  });
});

describe('the natural nature', () => {
  it('makes the Sun, Mars, Saturn and the nodes malefic, Jupiter and Venus benefic', () => {
    const n = naturalNatures(BASE);
    expect([n.sun, n.mars, n.saturn, n.rahu, n.ketu]).toEqual(['malefic', 'malefic', 'malefic', 'malefic', 'malefic']);
    expect([n.jupiter, n.venus]).toEqual(['benefic', 'benefic']);
  });

  it('makes the Moon benefic from just past the new moon to the full moon', () => {
    expect(naturalNatures({ ...BASE, sun: 40, moon: 41 }).moon).toBe('benefic');
    expect(naturalNatures({ ...BASE, sun: 40, moon: 220 }).moon).toBe('benefic');
    expect(naturalNatures({ ...BASE, sun: 40, moon: 221 }).moon).toBe('malefic');
    expect(naturalNatures({ ...BASE, sun: 40, moon: 40 }).moon).toBe('malefic');
    expect(naturalNatures({ ...BASE, sun: 350, moon: 10 }).moon).toBe('benefic');
  });

  it('makes Mercury benefic unless a malefic shares its sign', () => {
    expect(naturalNatures({ ...BASE }).mercury).toBe('benefic');
    // Saturn in Libra with Mercury (Venus between them).
    expect(naturalNatures({ ...BASE, mercury: 200, saturn: 205, venus: 203 }).mercury).toBe('malefic');
  });

  it('settles Mercury between two neighbours in its sign by them', () => {
    // Venus 195, Mercury 200, Jupiter 205, all in Libra: both neighbours benefic.
    expect(naturalNatures({ ...BASE, venus: 195, jupiter: 205, ketu: 250 }).mercury).toBe('benefic');
    // Venus 195, Mercury 200, Saturn 205: one benefic, one malefic, and the next is not the Moon: neutral.
    expect(naturalNatures({ ...BASE, venus: 195, saturn: 205 }).mercury).toBe('neutral');
    // Mars 195, Mercury 200, Saturn 205: both malefic.
    expect(naturalNatures({ ...BASE, mars: 195, saturn: 205 }).mercury).toBe('malefic');
    // Jupiter 195, Mercury 200, the waning Moon 205 next: benefic.
    expect(naturalNatures({ ...BASE, sun: 300, jupiter: 195, moon: 205 }).mercury).toBe('benefic');
  });

  it('follows PL9 when only the next neighbour shares the sign: it looks at the previous one', () => {
    // The previous planet is Mars at 170 in Virgo, the next Jupiter at 205 in Libra: no malefic in Libra, yet Mars
    // makes Mercury malefic.
    expect(naturalNatures({ ...BASE, mars: 170, jupiter: 205 }).mercury).toBe('malefic');
    expect(naturalNatures({ ...BASE, venus: 170, mars: 110, jupiter: 205 }).mercury).toBe('benefic');
  });
});

describe('the natures the yogas use', () => {
  it('are the natural ones by default and the functional ones with the option', () => {
    expect(yogaNatures(BASE)).toEqual(naturalNatures(BASE));
    expect(yogaNatures(BASE, { functionalNature: true })).toEqual(functionalNatures(BASE));
  });
});
