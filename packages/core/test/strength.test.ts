import { describe, expect, it } from 'vitest';
import { exaltationState, strengthLord, strongerSign, type Planet9 } from '../src/index';

/** Longitudes from signs (0 = Aries) and degrees; every planet not given at 10° Taurus. */
const at = (pos: Partial<Record<Planet9, [number, number]>>) => {
  const out = {} as Record<Planet9, number>;
  for (const p of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as Planet9[]) {
    const [s, d] = pos[p] ?? [1, 10];
    out[p] = s * 30 + d;
  }
  return out;
};

describe('exaltation as the strength of signs counts it', () => {
  it('holds in the whole sign but for Mercury, and puts Rahu in Gemini and Ketu in Sagittarius', () => {
    expect(exaltationState('mercury', 5 * 30 + 14)).toBe(1);
    expect(exaltationState('mercury', 5 * 30 + 20.6)).toBe(0);
    expect(exaltationState('moon', 30 + 2)).toBe(1);
    expect(exaltationState('moon', 30 + 4)).toBe(1);
    expect(exaltationState('venus', 5 * 30 + 1)).toBe(-1);
    expect(exaltationState('rahu', 2 * 30 + 5)).toBe(1);
    expect(exaltationState('ketu', 8 * 30 + 5)).toBe(1);
    expect(exaltationState('ketu', 2 * 30 + 5)).toBe(-1);
    // Elsewhere, the nine steps: Rahu exalted in Taurus, Ketu debilitated there.
    expect(exaltationState('rahu', 30 + 5)).toBe(1);
    expect(exaltationState('ketu', 30 + 5)).toBe(-1);
  });
});

describe('the lord of Scorpio and Aquarius for the strength of signs', () => {
  it('is the other lord when one sits in the sign, then the one with more planets, aspects, dignity, distance', () => {
    expect(strengthLord(7, at({ mars: [7, 3] }))).toBe('ketu');
    expect(strengthLord(7, at({ ketu: [7, 3], rahu: [1, 3] }))).toBe('mars');
    expect(strengthLord(1, at({}))).toBe('venus');
    // Mars and Ketu together in Sagittarius with Jupiter: Ketu is exalted there.
    expect(strengthLord(7, at({ mars: [8, 23], ketu: [8, 10], rahu: [2, 10], jupiter: [8, 27] }))).toBe('ketu');
  });
});

describe('the stronger of two signs', () => {
  it('has more planets', () => {
    expect(strongerSign(0, 6, at({ moon: [6, 3] }))).toBe(6);
  });
  it('then more aspects or conjunctions of Jupiter, Mercury and the lord', () => {
    expect(strongerSign(3, 9, at({ jupiter: [1, 5], mercury: [7, 5], moon: [6, 5] }))).toBe(9);
  });
  it('then more exalted planets in it: Mercury past 15° of Virgo is not', () => {
    // REF 0035: Mercury at 20.6° Virgo, the Moon in Pisces; Jupiter in Sagittarius aspects both.
    const l = at({ sun: [6, 5.58], moon: [11, 20.8], mars: [10, 17.9], mercury: [5, 20.6], jupiter: [8, 7.02], venus: [7, 17.2], saturn: [10, 22.1], rahu: [10, 7.97], ketu: [4, 7.97] });
    expect(strongerSign(5, 11, l)).toBe(11);
    expect(strongerSign(5, 11, { ...l, mercury: 5 * 30 + 10 })).toBe(5);
  });
  it('then a dual sign over a fixed one over a movable one', () => {
    expect(strongerSign(0, 2, at({}))).toBe(2);
    expect(strongerSign(4, 0, at({}))).toBe(4);
  });
  it('then its lord in a sign of the other parity, then its lord further on in its sign', () => {
    // REF 0169: Taurus against Scorpio decided by Ketu, exalted in Sagittarius, at 10.6° against Venus at 14.8°.
    const l = at({ sun: [10, 29.2], moon: [6, 21.3], mars: [8, 23.8], mercury: [10, 4.6], jupiter: [8, 27.6], venus: [0, 14.8], saturn: [9, 5.2], rahu: [2, 10.6], ketu: [8, 10.6] });
    expect(strongerSign(1, 7, l)).toBe(1);
    expect(strongerSign(7, 1, l)).toBe(1);
  });
});

describe('the dignity of the rashi dashas', () => {
  it('holds in the whole sign but for Mercury, and puts Rahu in Taurus', async () => {
    const { dashaDignity } = await import('../src/index');
    expect(dashaDignity('moon', 30 + 19)).toBe(1);
    expect(dashaDignity('sun', 17)).toBe(1);
    expect(dashaDignity('mercury', 5 * 30 + 20.6)).toBe(0);
    expect(dashaDignity('mercury', 5 * 30 + 10)).toBe(1);
    expect(dashaDignity('rahu', 30 + 5)).toBe(1);
    expect(dashaDignity('ketu', 7 * 30 + 5)).toBe(1);
    expect(dashaDignity('saturn', 10)).toBe(-1);
  });
});
