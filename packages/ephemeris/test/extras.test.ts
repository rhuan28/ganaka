import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EphemerisRangeError, createSwissEphemeris, julianDayUt, type Ephemeris } from '../src/index';

let eph: Ephemeris;
beforeAll(async () => {
  eph = await createSwissEphemeris();
});
afterAll(() => eph.close());

const arcsec = (a: number, b: number) => ((((a - b + 540) % 360) + 360) % 360 - 180) * 3600;
const jd = julianDayUt(2000, 7, 1, 12);

describe('extra ephemeris quantities', () => {
  it('gives obliquity near 23.44 degrees and a small nutation', () => {
    const n = eph.obliquityAndNutation(jd);
    expect(n.meanObliquity).toBeGreaterThan(23.43);
    expect(n.meanObliquity).toBeLessThan(23.45);
    expect(Math.abs(n.nutationLongitude * 3600)).toBeLessThan(20);
    expect(n.trueObliquity).toBeCloseTo(n.meanObliquity + n.nutationObliquity, 9);
  });

  it('relates the two longitudes by the nutation in longitude', () => {
    const n = eph.obliquityAndNutation(jd);
    const d = arcsec(eph.tropical(jd, 'moon').longitude, eph.meanEquinoxLongitude(jd, 'moon').longitude);
    expect(d).toBeCloseTo(n.nutationLongitude * 3600, 3);
  });

  it('builds the sidereal mode from the mean-equinox longitude and the mean ayanamsha', () => {
    const viaParts = eph.meanEquinoxLongitude(jd, 'moon').longitude - eph.ayanamshaReference(jd, 'lahiri');
    expect(Math.abs(arcsec(viaParts, eph.siderealReference(jd, 'moon', 'lahiri')))).toBeLessThan(0.001);
  });

  it('keeps the old Lahiri helpers equal to the general ones', () => {
    expect(eph.lahiriSiderealReference(jd, 'sun')).toBe(eph.siderealReference(jd, 'sun', 'lahiri'));
    expect(eph.lahiriAyanamshaReference(jd)).toBe(eph.ayanamshaReference(jd, 'lahiri'));
  });

  it('orders the ayanamshas as expected at J2000', () => {
    const a = (m: Parameters<Ephemeris['ayanamshaReference']>[1]) => eph.ayanamshaReference(2451545, m);
    expect(a('lahiri')).toBeGreaterThan(23.8);
    expect(a('lahiri')).toBeLessThan(23.9);
    expect(a('faganBradley')).toBeGreaterThan(a('lahiri'));
    expect(a('raman')).toBeLessThan(a('lahiri'));
    expect(a('krishnamurti')).toBeLessThan(a('lahiri'));
    expect(a('krishnamurti')).toBeGreaterThan(a('raman'));
  });

  it('gives sidereal time in [0, 24) advancing about 3m56s per day', () => {
    const t0 = eph.siderealTimeHours(jd);
    const t1 = eph.siderealTimeHours(jd + 1);
    expect(t0).toBeGreaterThanOrEqual(0);
    expect(t0).toBeLessThan(24);
    const gain = ((t1 - t0 + 24) % 24) * 3600;
    expect(gain).toBeGreaterThan(235);
    expect(gain).toBeLessThan(238);
  });

  it('gives an ascendant that moves through the whole circle in a sidereal day', () => {
    const a0 = eph.ascendantTropical(jd, 5.55, -0.2167);
    const a6 = eph.ascendantTropical(jd + 0.25, 5.55, -0.2167);
    expect(a0).toBeGreaterThanOrEqual(0);
    expect(a0).toBeLessThan(360);
    expect(Math.abs(arcsec(a6, a0)) / 3600).toBeGreaterThan(60);
  });

  it('agrees with the Lagna PL9 exported for Accra, 1 July 2017 12:00 UT, to within one arcminute', () => {
    const j = julianDayUt(2017, 7, 1, 12);
    const sid = eph.ascendantTropical(j, 5.55, -0.2166667) - eph.ayanamshaReference(j, 'lahiri');
    expect(Math.abs(arcsec(sid, 165.837330196784))).toBeLessThan(60);
  });

  it('refuses out-of-range dates in every new method', () => {
    const bad = julianDayUt(1700, 1, 1);
    expect(() => eph.meanEquinoxLongitude(bad, 'sun')).toThrow(EphemerisRangeError);
    expect(() => eph.obliquityAndNutation(bad)).toThrow(EphemerisRangeError);
    expect(() => eph.siderealTimeHours(bad)).toThrow(EphemerisRangeError);
    expect(() => eph.ascendantTropical(bad, 0, 0)).toThrow(EphemerisRangeError);
    expect(() => eph.siderealReference(bad, 'sun', 'raman')).toThrow(EphemerisRangeError);
    expect(() => eph.ayanamshaReference(bad, 'raman')).toThrow(EphemerisRangeError);
  });
});
