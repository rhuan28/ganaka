import { describe, expect, it } from 'vitest';
import { dayFrame, induLagna, lagnaLongitude, planetLongitude, specialLagnas } from '../src/index';
import { fakeFrame, fakeSky } from './fakeSky';

const norm = (v: number) => ((v % 360) + 360) % 360;

describe('specialLagnas', () => {
  it('run from the Sun at sunrise at 360, 720 and 1800 degrees a day', () => {
    let day = 0;
    let night = 0;
    for (let k = 0; k < 20; k++) {
      const jd = 2451545 + k * 0.37 + 0.05;
      const f = dayFrame(fakeSky, jd, 20, 30, fakeFrame);
      if (f.isDay) day++;
      else night++;
      const sun = planetLongitude(fakeSky, f.sunrise, 'sun', 24).longitude;
      const elapsed = jd - f.sunrise;
      const s = specialLagnas(fakeSky, jd, 20, 30, fakeFrame);
      expect(s.bhava, `k ${k}`).toBeCloseTo(norm(sun + 360 * elapsed), 9);
      expect(s.hora, `k ${k}`).toBeCloseTo(norm(sun + 720 * elapsed), 9);
      expect(s.ghatika, `k ${k}`).toBeCloseTo(norm(sun + 1800 * elapsed), 9);
      for (const v of Object.values(s)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(360);
      }
    }
    expect(day).toBeGreaterThan(0);
    expect(night).toBeGreaterThan(0);
  });
  it('take the Jaimini Hora Lagna as the Hora Lagna for an odd Lagna, and from the Lagna itself for an even one', () => {
    const seen = new Set<boolean>();
    for (let k = 0; k < 40; k++) {
      const jd = 2451545 + k * 0.071;
      const f = dayFrame(fakeSky, jd, 20, 30, fakeFrame);
      const lagna = lagnaLongitude(fakeSky, jd, 20, 30, 24);
      const odd = Math.floor(lagna / 30) % 2 === 0;
      seen.add(odd);
      const s = specialLagnas(fakeSky, jd, 20, 30, fakeFrame);
      expect(s.jaiminiHora, `k ${k}`).toBeCloseTo(odd ? s.hora : norm(lagna + 720 * (jd - f.sunrise)), 9);
    }
    expect(seen.size).toBe(2);
  });
});

describe('induLagna', () => {
  it('counts the kalas of the two ninth lords from the Moon', () => {
    // Lagna Cancer: 9th Pisces, Jupiter, 10 kalas. Moon in Aries: 9th Sagittarius, Jupiter, 10. 20 mod 12 = 8:
    // the eighth sign from Aries is Scorpio.
    expect(induLagna(3, 0)).toBe(7);
  });
  it('counts on from the Moon, and takes a remainder of zero as twelve', () => {
    // Lagna Aries: 9th Sagittarius, Jupiter 10. Moon in Taurus: 9th Capricorn, Saturn 1. 11: the eleventh sign from Taurus is Pisces.
    expect(induLagna(0, 1)).toBe(11);
    // Lagna Leo: 9th Aries, Mars 6; Moon Leo: 6 -> 12: the twelfth sign from Leo is Cancer.
    expect(induLagna(4, 4)).toBe(3);
  });
});
