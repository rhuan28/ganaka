import { describe, expect, it } from 'vitest';
import { dayFrame, planetLongitude, pranaPadaLongitude } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const norm = (v: number) => ((v % 360) + 360) % 360;

describe('pranaPadaLongitude', () => {
  it('advances 30 degrees every 6 minutes', () => {
    const a = pranaPadaLongitude(fakeSky, 2451545.4, 20, 30, fakeFrame);
    const b = pranaPadaLongitude(fakeSky, 2451545.4 + 6 / 1440, 20, 30, fakeFrame);
    // The Sun itself moves 0.0041 degrees in six minutes.
    expect(norm(b - a)).toBeCloseTo(30.0041, 3);
  });
  it('stays in [0, 360)', () => {
    for (let k = 0; k < 200; k++) {
      const v = pranaPadaLongitude(fakeSky, 2451545 + k * 0.0137, 20, 30, fakeFrame);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });
  it('starts from the Sun, the Sun plus 240 or the Sun plus 120 according to the kind of sign the Sun is in', () => {
    const seen = new Set<number>();
    for (let day = 0; day < 120; day += 10) {
      const jd = 2451545 + day + 0.4;
      const f = dayFrame(fakeSky, jd, 20, 30, fakeFrame);
      const s = planetLongitude(fakeSky, jd, 'sun', 24).longitude;
      const kind = Math.floor(s / 30) % 3; // 0 movable, 1 fixed, 2 dual
      seen.add(kind);
      const expected = norm(s + [0, 240, 120][kind]! + (jd - f.sunrise) * 7200);
      expect(pranaPadaLongitude(fakeSky, jd, 20, 30, fakeFrame), `day ${day}`).toBeCloseTo(expected, 6);
    }
    expect(seen.size).toBe(3);
  });
});
