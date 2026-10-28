import { describe, expect, it } from 'vitest';
import { DEFAULT_NATURES, karakaForSelf, lajjitadi, natalBaladi, natalJagradadi, percentExalted, percentFull, type Planet9 } from '../src';

// REF 0010 as PL9's planet table prints it (pl9 mode): the Lagna in Cancer 16:30:55.
const dms = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;
const L: Record<Planet9, number> = {
  sun: dms(1, 12, 23, 58), moon: dms(0, 26, 53, 22), mars: dms(4, 7, 15, 0), mercury: dms(1, 24, 5, 14), jupiter: dms(7, 17, 17, 35),
  venus: dms(0, 19, 32, 37), saturn: dms(10, 29, 41, 37), rahu: dms(6, 11, 39, 16), ketu: dms(0, 11, 39, 16),
};
const lagna = dms(3, 16, 30, 55);

describe("PL9's Grahas Overview", () => {
  it("gives REF 0010's Moon as the maintainer's capture shows it", () => {
    expect(percentExalted('moon', L.moon)).toBe(97);
    expect(percentFull(L.moon, L.sun)).toBe(9);
    expect(karakaForSelf('moon', L, 7)).toBe(true);
    expect(natalJagradadi('moon', L)).toBe('swapna');
    expect(natalBaladi(L.moon)).toBe('mrita');
    expect(lajjitadi('moon', L, lagna, DEFAULT_NATURES)).toEqual(['kshudhita', 'mudita']);
  });

  it('rounds the percents half up, and the Sun is never far from itself', () => {
    // 173.889° from the fall: 96.6, so 97; truncated, it would be 96.
    expect(percentExalted('moon', 213 + 180 - 6.111)).toBe(97);
    expect(percentFull(L.sun, L.sun)).toBe(0);
    expect(percentExalted('sun', 10)).toBe(100);
  });

  it('counts the Baladi backwards in odd signs and the nodes go by their natural relations', () => {
    expect(natalBaladi(3)).toBe('bala'); // Aries 3°: the first band of an odd sign
    expect(natalBaladi(33)).toBe('mrita'); // Taurus 3°, an even sign
    // Saturn, the Atmakaraka (29:41, the highest degree): it signifies the self; Mars does not.
    expect(karakaForSelf('saturn', L, 7)).toBe(true);
    expect(karakaForSelf('mars', L, 7)).toBe(false);
  });
});
