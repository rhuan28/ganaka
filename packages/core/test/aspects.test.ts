import { describe, expect, it } from 'vitest';
import { aspectBetween, aspectValue } from '../src/index';

// REF 0010, as the core computes it in the pl9 mode.
const SUN = 42.39944, MARS = 127.250034, JUPITER = 227.293074, SATURN = 329.693659, RAHU = 191.654478;

describe('the graded aspects', () => {
  it('on the Sun of REF 0010, as PL9 prints them truncated: Mars 12, Jupiter 50, Saturn 53, Rahu 45', () => {
    expect(Math.trunc(aspectBetween('mars', MARS, SUN))).toBe(12);
    expect(Math.trunc(aspectBetween('jupiter', JUPITER, SUN))).toBe(50);
    expect(Math.trunc(aspectBetween('saturn', SATURN, SUN))).toBe(53);
    expect(Math.trunc(aspectBetween('rahu', RAHU, SUN))).toBe(45);
  });
  it('follow the classical curve, with the special aspects as ramps around their houses', () => {
    expect(aspectValue('sun', 30)).toBe(0);
    expect(aspectValue('sun', 60)).toBe(15);
    expect(aspectValue('sun', 90)).toBe(45);
    expect(aspectValue('sun', 180)).toBe(60);
    expect(aspectValue('sun', 300)).toBe(0);
    // Mars: its 4th rises 1.5 a degree before 90; its 8th is 60 from 180 to 210.
    expect(aspectValue('mars', 81.86)).toBeCloseTo(47.79, 2);
    expect(aspectValue('mars', 195)).toBe(60);
    // Saturn: its 10th falls 2 a degree after 270.
    expect(aspectValue('saturn', 278.14)).toBeCloseTo(43.72, 2);
    expect(aspectValue('jupiter', 120)).toBe(60);
    expect(aspectValue('ketu', 240)).toBe(60);
  });
});
