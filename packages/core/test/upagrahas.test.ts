import { describe, expect, it } from 'vitest';
import { bhriguPoint, upagrahas } from '../src/index';

describe('upagrahas', () => {
  it('reproduces the values PL9 exported for a Sun at 75.743871097706', () => {
    const u = upagrahas(75.743871097706);
    expect(u.dhuma).toBeCloseTo(209.077204431039, 8);
    expect(u.vyatipata).toBeCloseTo(150.922795568961, 8);
    expect(u.parivesha).toBeCloseTo(330.922795568961, 8);
    expect(u.indrachapa).toBeCloseTo(29.077204431039, 8);
    expect(u.upaketu).toBeCloseTo(45.743871097706, 8);
  });
  it('wraps every value into [0, 360)', () => {
    for (const sun of [0, 46.6666, 226.667, 300, 359.9999]) {
      for (const v of Object.values(upagrahas(sun))) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(360);
      }
    }
  });
  it('puts Upaketu thirty degrees before the Sun', () => {
    expect((75 - upagrahas(75).upaketu + 360) % 360).toBeCloseTo(30, 9);
  });
});

describe('bhriguPoint', () => {
  it('is the middle of the arc that goes from Rahu to the Moon in the order of the signs', () => {
    expect(bhriguPoint(26.889313763196, 191.654478741382)).toBeCloseTo(289.271896252289, 9);
    expect(bhriguPoint(303.75, 17.29)).toBeCloseTo(160.52, 9);
    expect(bhriguPoint(10, 10)).toBeCloseTo(10, 9);
  });
  it('stays in [0, 360)', () => {
    for (let k = 0; k < 360; k += 7) for (let j = 0; j < 360; j += 11) {
      const v = bhriguPoint(k, j);
      expect(v >= 0 && v < 360).toBe(true);
    }
  });
});
