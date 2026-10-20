import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaPl9, ephemerisInstant, lagnaLongitude, midheavenLongitude, nodeLongitudes, pl9DeltaTSeconds, pl9NutationThirteenTerms, planetLongitude } from '../src/index';

/** Records the instants it is asked for; Delta T of the library fixed at 60 s. */
function recorder() {
  const asked: number[] = [];
  const eph = {
    meanEquinoxLongitude: (jd: number) => (asked.push(jd), { longitude: 100, latitude: 0, distance: 1, longitudeSpeed: 1 }),
    obliquityAndNutation: (jd: number) => (asked.push(jd), { trueObliquity: 23.4, meanObliquity: 23.4, nutationLongitude: 0.004, nutationObliquity: 0 }),
    deltaTSeconds: () => 60,
    ayanamshaReference: () => 24,
  } as unknown as Ephemeris;
  return { eph, asked };
}
const jd = 2469807.5; // 2050: PL9's Delta T is far from 60 s here

describe('the instant the ephemeris is asked for', () => {
  it('is shifted by the difference in Delta T in the pl9 mode, and is the instant itself in the corrected mode', () => {
    const { eph } = recorder();
    expect(ephemerisInstant(eph, jd, 'corrected')).toBe(jd);
    expect((ephemerisInstant(eph, jd, 'pl9') - jd) * 86400).toBeCloseTo(pl9DeltaTSeconds(jd) - 60, 3);
  });
  it('is used by planets, nodes and the tropical ayanamsha alike', () => {
    for (const call of [
      (e: Ephemeris) => planetLongitude(e, jd, 'moon', 24, 'corrected'),
      (e: Ephemeris) => nodeLongitudes(e, jd, 24, 'corrected'),
      (e: Ephemeris) => ayanamshaPl9(e, jd, 'sayana', 0, 'corrected'),
    ]) {
      const { eph, asked } = recorder();
      call(eph);
      expect(asked).toEqual([jd]);
    }
    const { eph, asked } = recorder();
    planetLongitude(eph, jd, 'moon', 24);
    expect(asked[0]).not.toBe(jd);
  });
  it('does not need PL9\'s Delta T, which does not exist before 1620, in the corrected mode', () => {
    const { eph } = recorder();
    const early = 2305447.5; // 1600
    expect(() => ephemerisInstant(eph, early, 'pl9')).toThrow(RangeError);
    expect(ephemerisInstant(eph, early, 'corrected')).toBe(early);
  });
});

describe('the long nutation series', () => {
  it('differs between the modes by the two coefficients, a few thousandths of an arcsecond at most', () => {
    let worst = 0;
    for (let k = 0; k < 500; k++) {
      const t = 2378497 + k * 180;
      worst = Math.max(worst, Math.abs(pl9NutationThirteenTerms(t, 'pl9') - pl9NutationThirteenTerms(t, 'corrected')) * 3600);
    }
    expect(worst).toBeGreaterThan(0.0005);
    expect(worst).toBeLessThan(0.005);
  });
  it('agrees with the published series at J2000, where the two coefficients have no effect', () => {
    expect(pl9NutationThirteenTerms(2451545, 'corrected')).toBe(pl9NutationThirteenTerms(2451545, 'pl9'));
    // About -13.9" at J2000.0 by the 1980 theory; thirteen terms come close.
    expect(pl9NutationThirteenTerms(2451545, 'corrected') * 3600).toBeGreaterThan(-14.1);
    expect(pl9NutationThirteenTerms(2451545, 'corrected') * 3600).toBeLessThan(-13.7);
  });
  it('moves the Lagna and the midheaven by the same amount', () => {
    const { eph } = recorder();
    const t = 2469807.5;
    const d = (pl9NutationThirteenTerms(t, 'pl9') - pl9NutationThirteenTerms(t, 'corrected'));
    expect(lagnaLongitude(eph, t, 20, 30, 24, 'corrected') - lagnaLongitude(eph, t, 20, 30, 24, 'pl9')).toBeCloseTo(d, 9);
    expect(midheavenLongitude(eph, t, 30, 24, 'corrected') - midheavenLongitude(eph, t, 30, 24, 'pl9')).toBeCloseTo(d, 9);
  });
});
