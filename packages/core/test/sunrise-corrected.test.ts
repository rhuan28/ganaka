import { describe, expect, it } from 'vitest';
import { LagnaUndefinedError, dayFrame, lagnaLongitude, planetLongitude, type AyanamshaFrame } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const corrected: AyanamshaFrame = { ...fakeFrame, fidelity: 'corrected' };
const wrap = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;
// Sun and Lagna as the corrected mode computes them.
const sun = (jd: number) => planetLongitude(fakeSky, jd, 'sun', 24, 'corrected').longitude;
const lagna = (jd: number, lat: number, lon: number) => lagnaLongitude(fakeSky, jd, lat, lon, 24, 'corrected');
const offHorizon = (jd: number, lat: number, lon: number, shift: number) => Math.abs(wrap(lagna(jd, lat, lon) + shift - sun(jd)));

describe('dayFrame, corrected mode', () => {
  it('puts the Sun\'s degree exactly on the horizon at all three instants', () => {
    for (const [lat, lon] of [[20, 30], [-35, 140], [52, -3], [0, 0]] as const) {
      for (let k = 0; k < 12; k++) {
        const jd = 2451545 + k * 30.37;
        const f = dayFrame(fakeSky, jd, lat, lon, corrected);
        expect(offHorizon(f.sunrise, lat, lon, 0), `rise ${lat} ${k}`).toBeLessThan(1e-6);
        expect(offHorizon(f.sunset, lat, lon, 180), `set ${lat} ${k}`).toBeLessThan(1e-6);
        expect(offHorizon(f.nextSunrise, lat, lon, 0), `next ${lat} ${k}`).toBeLessThan(1e-6);
      }
    }
  });
  it('brackets the instant: the last sunrise at or before it, then the sunset, then the next sunrise', () => {
    for (let k = 0; k < 48; k++) {
      const jd = 2451545 + k / 48 + 0.0007;
      const f = dayFrame(fakeSky, jd, 20, 30, corrected);
      expect(f.sunrise).toBeLessThanOrEqual(jd);
      expect(f.nextSunrise).toBeGreaterThan(jd);
      expect(f.sunset).toBeGreaterThan(f.sunrise);
      expect(f.sunset).toBeLessThan(f.nextSunrise);
      expect(f.isDay).toBe(jd < f.sunset);
    }
  });
  it('changes frame exactly at sunrise', () => {
    const f = dayFrame(fakeSky, 2451545.4, 20, 30, corrected);
    expect(dayFrame(fakeSky, f.nextSunrise - 1e-6, 20, 30, corrected).sunrise).toBeCloseTo(f.sunrise, 8);
    expect(dayFrame(fakeSky, f.nextSunrise + 1e-6, 20, 30, corrected).sunrise).toBeCloseTo(f.nextSunrise, 8);
  });
  it('agrees with the PL9 search on the sunrise to a few hundredths of a second at ordinary latitudes', () => {
    // The two modes also place the Sun a few seconds of time apart (Delta T), which moves the sunrise by about 0.01 s.
    for (let k = 0; k < 20; k++) {
      const jd = 2451545 + k * 17.3;
      const a = dayFrame(fakeSky, jd, 30, 77, fakeFrame);
      const b = dayFrame(fakeSky, jd, 30, 77, corrected);
      expect(Math.abs(a.sunrise - b.sunrise) * 86400).toBeLessThan(0.05);
    }
  });
  it('finds a frame at every latitude below the polar circle, at the solstices too, where the PL9 search fails', () => {
    for (const lat of [60, 64, 65, 66, 66.5, -65, -66.5]) {
      for (const day of [171.5, 172.9, 355.3, 356.1, 80.2]) {
        for (const hour of [1, 7, 13, 19]) {
          const jd = 2451545 + day + hour / 24;
          const f = dayFrame(fakeSky, jd, lat, 10, corrected);
          // A Julian day resolves 0.04 ms; near the polar circle the Lagna can cover a thousandth of a degree in that.
          expect(offHorizon(f.sunrise, lat, 10, 0), `${lat} ${day} ${hour}`).toBeLessThan(1e-3);
          expect(offHorizon(f.sunset, lat, 10, 180), `${lat} ${day} ${hour}`).toBeLessThan(1e-3);
          expect(f.sunrise).toBeLessThanOrEqual(jd);
          expect(f.nextSunrise).toBeGreaterThan(jd);
        }
      }
    }
  });
  it('still refuses latitudes where the Lagna is not defined', () => {
    expect(() => dayFrame(fakeSky, 2451545.4, 67, 0, corrected)).toThrow(LagnaUndefinedError);
  });
});
