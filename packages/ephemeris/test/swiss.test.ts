import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DATA_RANGE, EphemerisRangeError, createSwissEphemeris, julianDayUt, type Ephemeris } from '../src/index';

let eph: Ephemeris;
beforeAll(async () => {
  eph = await createSwissEphemeris();
});
afterAll(() => eph.close());

const arcsec = (a: number, b: number) => ((((a - b + 540) % 360) + 360) % 360 - 180) * 3600;

describe('Swiss Ephemeris wrapper', () => {
  it('puts the Sun at 0 degrees at the March 2000 equinox (20 March, 07:35 UT)', () => {
    const lon = eph.tropical(julianDayUt(2000, 3, 20, 7 + 35 / 60), 'sun').longitude;
    expect(Math.abs(arcsec(lon, 0))).toBeLessThan(40);
  });

  it('reproduces the package values recorded for the Moon across the guaranteed range', () => {
    expect(eph.tropical(julianDayUt(1801, 7, 1, 12), 'moon').longitude).toBeCloseTo(350.43980232994875, 9);
    expect(eph.tropical(julianDayUt(2000, 7, 1, 12), 'moon').longitude).toBeCloseTo(95.59302847846271, 9);
    expect(eph.tropical(julianDayUt(2048, 7, 1, 12), 'moon').longitude).toBeCloseTo(352.48567872798594, 9);
  });

  it('agrees with the Moon longitude PL9 exported for 1 July 2000 12:00 UT to within one arcsecond', () => {
    const jd = julianDayUt(2000, 7, 1, 12);
    expect(Math.abs(arcsec(eph.lahiriSiderealReference(jd, 'moon'), 71.733248416296))).toBeLessThan(1);
  });

  it('leaves nutation out of the sidereal mode, unlike tropical minus ayanamsha', () => {
    const jd = julianDayUt(2000, 7, 1, 12);
    const naive = eph.tropical(jd, 'moon').longitude - eph.lahiriAyanamshaReference(jd);
    const d = Math.abs(arcsec(naive, eph.lahiriSiderealReference(jd, 'moon')));
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(20);
  });

  it('returns daily motion as longitude speed', () => {
    const jd = julianDayUt(2000, 7, 1, 12);
    expect(eph.tropical(jd, 'sun').longitudeSpeed).toBeGreaterThan(0.94);
    expect(eph.tropical(jd, 'sun').longitudeSpeed).toBeLessThan(1.03);
    expect(eph.tropical(jd, 'moon').longitudeSpeed).toBeGreaterThan(11);
  });

  it('gives Delta T of about 63.83 seconds at J2000', () => {
    expect(eph.deltaTSeconds(2451545)).toBeCloseTo(63.83, 1);
  });

  it('keeps the true node within two degrees of the mean node', () => {
    const jd = julianDayUt(1950, 1, 1, 0);
    const d = arcsec(eph.tropical(jd, 'trueNode').longitude, eph.tropical(jd, 'meanNode').longitude);
    expect(Math.abs(d)).toBeLessThan(2 * 3600);
  });

  it('refuses dates outside the bundled data instead of switching model', () => {
    expect(() => eph.tropical(julianDayUt(1700, 7, 1, 12), 'moon')).toThrow(EphemerisRangeError);
    expect(() => eph.tropical(julianDayUt(2500, 7, 1, 12), 'moon')).toThrow(EphemerisRangeError);
    expect(() => eph.deltaTSeconds(Number.NaN)).toThrow(EphemerisRangeError);
    expect(() => eph.lahiriAyanamshaReference(DATA_RANGE.maxJdUt + 1)).toThrow(EphemerisRangeError);
  });

  it('accepts both ends of the guaranteed range', () => {
    expect(() => eph.tropical(julianDayUt(1801, 1, 1, 0), 'saturn')).not.toThrow();
    expect(() => eph.tropical(julianDayUt(2048, 12, 31, 23), 'saturn')).not.toThrow();
  });
});
