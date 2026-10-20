import { describe, expect, it } from 'vitest';
import { julianDayUt } from '../src/time';

describe('julianDayUt', () => {
  it('gives the J2000 epoch', () => {
    expect(julianDayUt(2000, 1, 1, 12)).toBe(2451545);
  });
  it('gives midnight of 1 January 1801', () => {
    expect(julianDayUt(1801, 1, 1)).toBe(2378861.5);
  });
  it('matches the Julian day PL9 exports for 1 July 2017 12:00 UT', () => {
    expect(julianDayUt(2017, 7, 1, 12)).toBe(2457936);
  });
  it('handles January and February as months 13 and 14 of the previous year', () => {
    expect(julianDayUt(2000, 2, 29, 0) - julianDayUt(2000, 1, 1, 0)).toBe(59);
  });
});
