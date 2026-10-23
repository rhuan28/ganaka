import { describe, expect, it } from 'vitest';
import { computePlanetInfo, housesRuled, mrityuBhaga } from '../src';
import { fakeSky } from './fakeSky';

describe('the other columns of the planet tables', () => {
  it('gives the Mrityu Bhaga inside its orb only, with its severity', () => {
    // The Sun's Mrityu Bhaga in Aries is at 20°; its orb is 40'.
    expect(mrityuBhaga('sun', 20.25)).toEqual({ distance: 0.25, severity: expect.closeTo(1 - 0.25 / (2 / 3), 9) });
    expect(mrityuBhaga('sun', 20.7)).toBeNull();
    // Mars in Aries at 19°, orb 30'.
    expect(mrityuBhaga('mars', 18.6)!.severity).toBeCloseTo(0.2, 9);
    expect(mrityuBhaga('lagna', 1.9)!.severity).toBeCloseTo(0.1, 9);
  });

  it('gives the houses a planet rules from the Lagna', () => {
    expect(housesRuled('mars', 3)).toEqual([5, 10]); // Cancer rising: Scorpio 5th, Aries 10th
    expect(housesRuled('sun', 3)).toEqual([2]);
  });

  it('leaves out what needs the Lagna in a polar chart, and keeps the rest', () => {
    const info = computePlanetInfo(fakeSky, { jdUt: 2449865.4694144, latitude: 89, longitudeEast: 150.6744 }, {}, { fidelity: 'corrected' });
    expect(info.missing.map((m) => m.field)).toEqual(expect.arrayContaining(['shayanadi', 'dominance', 'housesRuled']));
    expect(info.points.sun.dominance).toBeUndefined();
    expect(info.points.sun.housesRuled).toBeUndefined();
    expect(info.points.sun.rays).toBeTypeOf('number');
    expect(info.points.rahu.rays).toBeUndefined();
    expect(info.lagnaMrityuBhaga).toBeNull();
  });
});

describe('the navamsha numbers', () => {
  it("count the 108 navamshas from the Lagna's, and give PL9's age as the number less one, round", async () => {
    const { navamshaAge, navamshaNumber } = await import('../src');
    // REF 0010: the Lagna at 16°30' Cancer (Pushya's 4th pada, navamsha 33 of the zodiac); the Sun at 12°24' Taurus.
    expect(navamshaNumber(106.515, 106.515)).toBe(1);
    expect(navamshaNumber(42.4, 106.515)).toBe(90);
    expect(navamshaAge(42.4, 106.515)).toBe(89);
    expect(navamshaAge(106.515, 106.515)).toBe(108);
    expect(navamshaNumber(103.2, 106.515)).toBe(108); // the navamsha before the Lagna's
  });
});
