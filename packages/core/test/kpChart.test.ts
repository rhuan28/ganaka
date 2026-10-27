import { describe, expect, it } from 'vitest';
import { computeKpChart, cuspHouse, horaryNumber, parseChartInput, placidusCusps } from '../src';
import { fakeSky } from './fakeSky';

const birth = parseChartInput({ utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 });
const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;

describe('the KP chart', () => {
  it("gives REF 0010's Placidus cusps as PL9's worksheet prints them (Lahiri)", () => {
    // PL9's KP page: 16:30:55 Can, 06:22:50 Leo, 01:08:37 Vir, 02:49:54 Lib, 10:11:49 Sco, 16:20:13 Sag.
    const ayanamsha = 23 + 47 / 60 + 43 / 3600 - 8 / 3600; // the printed value less the nutation PL9 adds for show
    const c = placidusCusps(birth.jdUt, birth.latitude, birth.longitudeEast, ayanamsha);
    const shown = [dms(90 + 16, 30, 55), dms(120 + 6, 22, 50), dms(150 + 1, 8, 37), dms(180 + 2, 49, 54), dms(210 + 10, 11, 49), dms(240 + 16, 20, 13)];
    shown.forEach((s, i) => expect(Math.abs(c[i]! - s)).toBeLessThan(0.01));
    for (let i = 0; i < 6; i++) expect((c[i + 6]! - c[i]! + 360) % 360).toBeCloseTo(180, 9);
  });

  it('numbers the 249 horary parts: 1 at 0° Aries, the subs cut by a sign counted twice', () => {
    expect(horaryNumber(0)).toBe(1);
    expect(horaryNumber(359.999)).toBe(249);
    // Krittika's Rahu sub runs from 28°53'20" Aries into Taurus: two numbers either side of 30°.
    expect(horaryNumber(29.99)).toBe(horaryNumber(30.01) - 1);
  });

  it('places each planet from its house cusp to the next, and scores the houses it signifies', () => {
    const kp = computeKpChart(fakeSky, birth);
    for (const [p, x] of Object.entries(kp.planets)) {
      expect(x.house).toBe(cuspHouse(x.longitude, kp.cusps));
      expect(kp.houses[x.house - 1]!.occupants).toContain(p);
      const all = [...x.signifies.veryStrong, ...x.signifies.strong, ...x.signifies.normal, ...x.signifies.weak];
      expect(all).toContain(x.house);
    }
    expect(kp.ruling.fortuna).toBeCloseTo(((kp.cusps[0]! + kp.planets.moon.longitude - kp.planets.sun.longitude) % 360 + 360) % 360, 9);
  });

  it('opens a horary chart where the Ascendant enters the part of its number, the planets at the instant', () => {
    const kp = computeKpChart(fakeSky, birth, { horary: 100 });
    expect(horaryNumber(kp.cusps[0]!)).toBe(100);
    expect(kp.horary!.cuspsJdUt).toBeLessThanOrEqual(birth.jdUt + 0.001);
    expect(kp.planets.sun.longitude).toBe(computeKpChart(fakeSky, birth).planets.sun.longitude);
  });
});
