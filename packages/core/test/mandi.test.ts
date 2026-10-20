import { describe, expect, it } from 'vitest';
import { dayFrame, lagnaLongitude, mandiLongitude } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const DAY = [26, 22, 18, 14, 10, 6, 2];
/** PL9's night: from Wednesday on, two thirtieths later than the classical table. */
const NIGHT = [10, 6, 2, 28, 24, 20, 16];
const CLASSICAL_NIGHT = [10, 6, 2, 26, 22, 18, 14];
const weekdayOf = (jd: number) => ((Math.floor(jd + 1.5) % 7) + 7) % 7;

describe('mandiLongitude', () => {
  it('is the Lagna at the ghati of the weekday, by day and by night, on every weekday', () => {
    const seen = new Set<string>();
    for (let k = 0; k < 28; k++) {
      const jd = 2451545 + k * 0.5 + 0.13;
      const f = dayFrame(fakeSky, jd, 20, 0, fakeFrame);
      const w = weekdayOf(f.isDay ? jd : jd - 0.5);
      const t = f.isDay ? f.sunrise + ((f.sunset - f.sunrise) * DAY[w]!) / 30 : f.sunset + ((f.nextSunrise - f.sunset) * NIGHT[w]!) / 30;
      seen.add(`${f.isDay}${w}`);
      expect(mandiLongitude(fakeSky, jd, 20, 0, fakeFrame), `k ${k}`).toBeCloseTo(lagnaLongitude(fakeSky, t, 20, 0, 24), 9);
    }
    expect(seen.size).toBe(14);
  });
  it('counts the weekday on the clock of the chart', () => {
    // 22:00 UT on Saturday, at 150 degrees east, is Sunday 08:00 on a clock ten hours ahead of UT.
    const jd = 2451545 + 10 / 24;
    expect(mandiLongitude(fakeSky, jd, 20, 150, fakeFrame, 10)).not.toBeCloseTo(mandiLongitude(fakeSky, jd, 20, 150, fakeFrame, 0), 3);
  });
  it('takes the classical night in the corrected mode, and differs from PL9 only from Wednesday to Saturday night', () => {
    const corrected = { ...fakeFrame, fidelity: 'corrected' as const };
    const seen = new Set<number>();
    for (let k = 0; k < 28; k++) {
      const jd = 2451545 + k * 0.5 + 0.13;
      const f = dayFrame(fakeSky, jd, 20, 0, corrected);
      const w = weekdayOf(f.isDay ? jd : jd - 0.5);
      const g = f.isDay ? DAY[w]! : CLASSICAL_NIGHT[w]!;
      const t = f.isDay ? f.sunrise + ((f.sunset - f.sunrise) * g) / 30 : f.sunset + ((f.nextSunrise - f.sunset) * g) / 30;
      expect(mandiLongitude(fakeSky, jd, 20, 0, corrected), `k ${k}`).toBeCloseTo(lagnaLongitude(fakeSky, t, 20, 0, 24, 'corrected'), 9);
      if (!f.isDay) seen.add(w);
    }
    expect(seen.size).toBe(7);
  });
});
