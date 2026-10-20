import { describe, expect, it } from 'vitest';
import { julianDayUt } from '@reverse/ephemeris';
import { pl9DeltaTSeconds } from '../src/index';

describe('pl9DeltaTSeconds', () => {
  it('is continuous: no jump larger than 0.05 s between consecutive days across the range', () => {
    let prev = pl9DeltaTSeconds(julianDayUt(1801, 1, 1));
    for (let jd = julianDayUt(1801, 1, 2); jd < julianDayUt(2049, 1, 1); jd += 1) {
      const v = pl9DeltaTSeconds(jd);
      expect(Math.abs(v - prev)).toBeLessThan(0.05);
      prev = v;
    }
  });
  it('is near 12 s in 1805, near 29 s in 1950 and above 100 s in 2044', () => {
    expect(pl9DeltaTSeconds(julianDayUt(1805, 3, 21))).toBeGreaterThan(11);
    expect(pl9DeltaTSeconds(julianDayUt(1805, 3, 21))).toBeLessThan(13.5);
    expect(pl9DeltaTSeconds(julianDayUt(1950, 4, 5))).toBeCloseTo(29.26, 0);
    expect(pl9DeltaTSeconds(julianDayUt(2044, 7, 1))).toBeGreaterThan(100);
  });
  it('returns a finite number outside the verified range', () => {
    expect(Number.isFinite(pl9DeltaTSeconds(julianDayUt(1700, 1, 1)))).toBe(true);
    expect(Number.isFinite(pl9DeltaTSeconds(julianDayUt(2300, 1, 1)))).toBe(true);
  });

  // Values of docs/spec/delta-t.md, computed independently from the same rule.
  it('reproduces the reference values of the specification', () => {
    expect(pl9DeltaTSeconds(julianDayUt(1805, 3, 21))).toBeCloseTo(12.20751004439472, 9);
    expect(pl9DeltaTSeconds(julianDayUt(1850, 1, 1))).toBeCloseTo(6.919345147460201, 9);
    expect(pl9DeltaTSeconds(julianDayUt(1900, 1, 1))).toBeCloseTo(-2.770299626488905, 9);
    expect(pl9DeltaTSeconds(julianDayUt(1950, 4, 5))).toBeCloseTo(29.259286040129034, 9);
    expect(pl9DeltaTSeconds(julianDayUt(2000, 7, 1, 12))).toBeCloseTo(63.968584636650476, 9);
    expect(pl9DeltaTSeconds(julianDayUt(2018, 7, 1))).toBeCloseTo(69.74796539285546, 9);
  });
  it('follows the long-term parabola after the table, joined smoothly at its end', () => {
    expect(pl9DeltaTSeconds(julianDayUt(2020, 1, 1))).toBeCloseTo(71.56302879308188, 9);
    expect(pl9DeltaTSeconds(julianDayUt(2044, 7, 1))).toBeCloseTo(111.82854037603472, 9);
    expect(pl9DeltaTSeconds(julianDayUt(2200, 1, 1))).toBeCloseTo(427.64, 6);
  });
  it('applies no tidal correction from 1955 on, so table years are returned as tabulated', () => {
    const y2005 = 2451545 + 5 * 365.2425;
    expect(pl9DeltaTSeconds(y2005)).toBeCloseTo(64.69, 9);
  });
  it('refuses dates before the table and values that are not numbers', () => {
    expect(() => pl9DeltaTSeconds(julianDayUt(1600, 1, 1))).toThrow(RangeError);
    expect(() => pl9DeltaTSeconds(Number.NaN)).toThrow(RangeError);
  });
});
