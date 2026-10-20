import { describe, expect, it } from 'vitest';
import { dayFrame, gulikaLongitude, lagnaLongitude } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const at = (jd: number) => gulikaLongitude(fakeSky, jd, 20, 30, fakeFrame);

describe('gulikaLongitude', () => {
  it('is the same for every instant of one day, and changes at sunset', () => {
    const f = dayFrame(fakeSky, 2451545.4, 20, 30, fakeFrame);
    const day = at(f.sunrise + 0.01);
    expect(at(f.sunset - 0.01)).toBeCloseTo(day, 9);
    expect(Math.abs(at(f.sunset + 0.01) - day)).toBeGreaterThan(1);
  });
  it('stays in [0, 360) over a week', () => {
    for (let k = 0; k < 56; k++) {
      expect(at(2451545 + k / 8)).toBeGreaterThanOrEqual(0);
      expect(at(2451545 + k / 8)).toBeLessThan(360);
    }
  });
  it('is the Lagna when the part of Saturn ends: the first eighth of a Saturday, the seventh of a Sunday', () => {
    // 2000-01-01 was a Saturday. 12:00 UT at longitude 0 is midday.
    for (const [jd, part] of [[2451545.0, 1], [2451546.0, 7], [2451547.0, 6]] as const) {
      const f = dayFrame(fakeSky, jd, 20, 0, fakeFrame);
      expect(f.isDay).toBe(true);
      const t = f.sunrise + ((f.sunset - f.sunrise) * part) / 8;
      expect(gulikaLongitude(fakeSky, jd, 20, 0, fakeFrame)).toBeCloseTo(lagnaLongitude(fakeSky, t, 20, 0, 24), 9);
    }
  });
  it('by night counts from the lord of the fifth weekday: the fourth eighth on a Saturday night, the third on a Sunday night', () => {
    // 21:36 UT at longitude 0.
    for (const [jd, part] of [[2451545.4, 4], [2451546.4, 3], [2451549.4, 7]] as const) {
      const f = dayFrame(fakeSky, jd, 20, 0, fakeFrame);
      expect(f.isDay).toBe(false);
      const t = f.sunset + ((f.nextSunrise - f.sunset) * part) / 8;
      expect(gulikaLongitude(fakeSky, jd, 20, 0, fakeFrame)).toBeCloseTo(lagnaLongitude(fakeSky, t, 20, 0, 24), 9);
    }
  });
  it('takes the weekday from the clock the chart is written in', () => {
    // 22:00 UT on Saturday, at 150 degrees east, is Sunday 08:00 on a clock ten hours ahead of UT.
    const jd = 2451545 + 10 / 24;
    const f = dayFrame(fakeSky, jd, 20, 150, fakeFrame);
    expect(f.isDay).toBe(true);
    const lagnaAtPart = (part: number) => lagnaLongitude(fakeSky, f.sunrise + ((f.sunset - f.sunrise) * part) / 8, 20, 150, 24);
    expect(gulikaLongitude(fakeSky, jd, 20, 150, fakeFrame)).toBeCloseTo(lagnaAtPart(1), 9);
    expect(gulikaLongitude(fakeSky, jd, 20, 150, fakeFrame, 10)).toBeCloseTo(lagnaAtPart(7), 9);
  });
  it('by night takes the weekday of the date twelve hours before the instant', () => {
    // 02:24 UT on Sunday at longitude 0: still the night of Saturday.
    const jd = 2451545.6;
    const f = dayFrame(fakeSky, jd, 20, 0, fakeFrame);
    expect(f.isDay).toBe(false);
    const t = f.sunset + ((f.nextSunrise - f.sunset) * 4) / 8;
    expect(gulikaLongitude(fakeSky, jd, 20, 0, fakeFrame)).toBeCloseTo(lagnaLongitude(fakeSky, t, 20, 0, 24), 9);
  });
  it('takes the beginning of the part of Saturn when asked', () => {
    for (let k = 0; k < 14; k++) {
      const jd = 2451545 + k * 0.5 + 0.13;
      const f = dayFrame(fakeSky, jd, 20, 0, fakeFrame);
      const start = f.isDay ? f.sunrise : f.sunset;
      const eighth = (f.isDay ? f.sunset - f.sunrise : f.nextSunrise - f.sunset) / 8;
      const end = gulikaLongitude(fakeSky, jd, 20, 0, fakeFrame);
      const begin = gulikaLongitude(fakeSky, jd, 20, 0, fakeFrame, 0, undefined, 'beginning');
      // The beginning is the Lagna one eighth earlier than the end.
      let part = 1;
      for (let p = 1; p <= 8; p++) if (Math.abs(lagnaLongitude(fakeSky, start + eighth * p, 20, 0, 24) - end) < 1e-9) part = p;
      expect(begin, `k ${k}`).toBeCloseTo(lagnaLongitude(fakeSky, start + eighth * (part - 1), 20, 0, 24), 9);
    }
  });
});
