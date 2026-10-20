import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@reverse/ephemeris';
import { LagnaUndefinedError, lagnaLongitude } from '../src/index';

/** Sidereal time advances with UT; obliquity fixed; no nutation. */
const fake = {
  siderealTimeHours: (jd: number) => ((((jd - 2451545) * 24.0657098 + 18.697) % 24) + 24) % 24,
  obliquityAndNutation: () => ({ trueObliquity: 23.44, meanObliquity: 23.44, nutationLongitude: 0, nutationObliquity: 0 }),
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
  ascendantTropical: () => 0,
} as unknown as Ephemeris;

describe('lagnaLongitude', () => {
  it('returns an angle in [0, 360)', () => {
    for (let h = 0; h < 24; h += 1.7) {
      const v = lagnaLongitude(fake, 2451545 + h / 24, 28.6, 77.2, 24);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });
  it('goes once round the zodiac in a sidereal day at a mid latitude', () => {
    const day = 23.9344696 / 24;
    const a = lagnaLongitude(fake, 2451545, 28.6, 77.2, 24);
    const b = lagnaLongitude(fake, 2451545 + day, 28.6, 77.2, 24);
    expect(Math.abs(((b - a + 540) % 360) - 180)).toBeLessThan(0.01);
  });
  it('moves by the change in ayanamsha, with the opposite sign', () => {
    const a = lagnaLongitude(fake, 2451545, 28.6, 77.2, 24);
    const b = lagnaLongitude(fake, 2451545, 28.6, 77.2, 25);
    expect((a - b + 360) % 360).toBeCloseTo(1, 9);
  });
  it('is symmetric: the point opposite the ascendant rises twelve sidereal hours later at the equator', () => {
    const half = 23.9344696 / 48;
    const a = lagnaLongitude(fake, 2451545, 0, 0, 0);
    const b = lagnaLongitude(fake, 2451545 + half, 0, 0, 0);
    expect(Math.abs(((b - a + 360) % 360) - 180)).toBeLessThan(0.01);
  });
  it('reproduces the worked example of docs/spec/lagna.md', () => {
    expect(lagnaLongitude(fake, 2448000.25, 28.6, 77.2, 23.5)).toBeCloseTo(246.603404259, 8);
  });
  it('refuses latitudes where the ecliptic can coincide with the horizon', () => {
    expect(() => lagnaLongitude(fake, 2451545, 89.9, 0, 24)).toThrow(LagnaUndefinedError);
    expect(() => lagnaLongitude(fake, 2451545, -70, 0, 24)).toThrow(LagnaUndefinedError);
    expect(() => lagnaLongitude(fake, 2451545, Number.NaN, 0, 24)).toThrow(LagnaUndefinedError);
  });
});
