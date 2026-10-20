import { describe, expect, it } from 'vitest';
import { LagnaUndefinedError, SunriseUndefinedError, dayFrame, lagnaLongitude, planetLongitude } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const wrap = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;
const sun = (jd: number) => planetLongitude(fakeSky, jd, 'sun', 24).longitude;
const lagna = (jd: number, lat: number, lon: number) => lagnaLongitude(fakeSky, jd, lat, lon, 24);

describe('dayFrame', () => {
  it('brackets the instant between two sunrises, with the sunset between them', () => {
    for (let k = 0; k < 24; k++) {
      const jd = 2451545 + k / 24 + 0.013;
      const f = dayFrame(fakeSky, jd, 20, 30, fakeFrame);
      expect(f.sunrise, `hour ${k}`).toBeLessThanOrEqual(jd);
      expect(f.nextSunrise, `hour ${k}`).toBeGreaterThan(jd);
      expect(f.sunset).toBeGreaterThan(f.sunrise);
      expect(f.sunset).toBeLessThan(f.nextSunrise);
      expect(f.nextSunrise - f.sunrise).toBeGreaterThan(0.99);
      expect(f.nextSunrise - f.sunrise).toBeLessThan(1.01);
      expect(f.isDay).toBe(jd < f.sunset);
    }
  });
  it('puts the Sun on the Lagna at sunrise and opposite it at sunset', () => {
    const f = dayFrame(fakeSky, 2451545.4, -35, 140, fakeFrame);
    expect(Math.abs(wrap(lagna(f.sunrise, -35, 140) - sun(f.sunrise)))).toBeLessThan(1e-6);
    // PL9's search for the sunset stops less close than the one for the sunrise.
    expect(Math.abs(wrap(lagna(f.sunset, -35, 140) + 180 - sun(f.sunset)))).toBeLessThan(0.002);
  });
  it('gives the same frame to every instant between one sunrise and the next', () => {
    const f = dayFrame(fakeSky, 2451545.4, 20, 30, fakeFrame);
    for (const t of [f.sunrise + 20 / 86400, f.sunset - 20 / 86400, f.sunset + 20 / 86400, f.nextSunrise - 20 / 86400]) {
      expect(dayFrame(fakeSky, t, 20, 30, fakeFrame).sunrise).toBeCloseTo(f.sunrise, 7);
    }
    expect(dayFrame(fakeSky, f.sunrise - 20 / 86400, 20, 30, fakeFrame).sunrise).toBeLessThan(f.sunrise - 0.9);
  });
  it('still finds a sunrise near the polar circle: it is the rising of the degree of the Sun, not of the visible Sun', () => {
    // 66.3 degrees north at the June solstice. The visible Sun stays up; its ecliptic degree still crosses the horizon.
    const f = dayFrame(fakeSky, 2451716.5, 66.3, 0, fakeFrame);
    expect(f.nextSunrise - f.sunrise).toBeGreaterThan(0.9);
    expect(() => dayFrame(fakeSky, 2451716.5, 67, 0, fakeFrame)).toThrow(LagnaUndefinedError);
  });
  it('throws a typed error, and does not loop, when the search does not settle', () => {
    const erratic = { sunAyanamsha: () => 24, lagnaAyanamsha: (jd: number) => (jd * 1e5) % 360, fidelity: 'pl9' as const };
    expect(() => dayFrame(fakeSky, 2451545.4, 20, 30, erratic)).toThrow(SunriseUndefinedError);
  });
  it('rejects non-finite input', () => {
    expect(() => dayFrame(fakeSky, Number.NaN, 20, 30, fakeFrame)).toThrow();
    expect(() => dayFrame(fakeSky, 2451545, 20, Number.POSITIVE_INFINITY, fakeFrame)).toThrow();
  });
});
