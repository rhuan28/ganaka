import { describe, expect, it } from 'vitest';
import { julianDayUt } from '@reverse/ephemeris/time';
import type { Ephemeris } from '@reverse/ephemeris';
import { calendarSpan, computeRemedies, parseChartInput, saturnIngresses, searchOffset } from '../src';
import { fakeSky } from './fakeSky';

// A Saturn that turns back once a year, as the real one: its mean motion plus a yearly swing of 6°.
const turning = {
  ...fakeSky,
  meanEquinoxLongitude: (jd: number, body: string) => {
    const p = (fakeSky.meanEquinoxLongitude as (jd: number, body: string) => { longitude: number; longitudeSpeed: number })(jd, body);
    if (body !== 'saturn') return p;
    const w = (2 * Math.PI) / 378;
    return { ...p, longitude: (((p.longitude + 6 * Math.sin(w * (jd - 2451545))) % 360) + 360) % 360, longitudeSpeed: p.longitudeSpeed + 6 * w * Math.cos(w * (jd - 2451545)) };
  },
} as unknown as Ephemeris;

const birth = parseChartInput({ utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 });

describe('the remedies', () => {
  it('count a span in calendar years, months and days, a month borrowed as 30 days (PL9)', () => {
    // REF 0010's Saturn in Aries, 17 April 1998 to 6 June 2000: 2-1-19 in PL9's table (20 days by the calendar).
    expect(calendarSpan(julianDayUt(1998, 4, 17, 12), julianDayUt(2000, 6, 6, 3))).toEqual({ years: 2, months: 1, days: 19 });
    expect(calendarSpan(julianDayUt(1995, 6, 2), julianDayUt(1995, 8, 9))).toEqual({ years: 0, months: 2, days: 7 });
    // A month and a year borrowed: 20 December 1999 to 5 February 2001.
    expect(calendarSpan(julianDayUt(1999, 12, 20), julianDayUt(2001, 2, 5))).toEqual({ years: 1, months: 1, days: 15 });
  });

  it('give three cycles of the 12th, 1st and 2nd from the Moon, and of the 4th, 7th, 8th and 10th', () => {
    const r = computeRemedies(fakeSky, birth);
    expect(r.sadeSati.map((c) => c.map((h) => h.house))).toEqual([[12, 1, 2], [12, 1, 2], [12, 1, 2]]);
    expect(r.kantaka[0]!.map((h) => h.house)).toEqual([4, 7, 8, 10]);
    for (const c of [...r.sadeSati, ...r.kantaka]) for (const h of c) {
      expect(h.sign).toBe(((r.moonSign + h.house - 2) % 12) + 1);
      // The fake sky's Saturn never turns back: one stay per sign, about two and a half years long.
      expect(h.stays[1]).toBeNull();
      expect(h.stays[0]!.endJdUt - h.stays[0]!.startJdUt).toBeGreaterThan(800);
    }
    const starts = r.sadeSati.map((c) => c[0]!.stays[0]!.startJdUt);
    expect(starts[1]! - starts[0]!).toBeCloseTo(starts[2]! - starts[1]!, 0);
  });

  it("give the gems of the Lagna's, the 5th's and the 9th's lords, and the Mangala Dosha", () => {
    const r = computeRemedies(fakeSky, birth);
    expect(r.gems).not.toBeNull();
    expect(r.mangala.marsHouseFromMoon).toBeGreaterThanOrEqual(1);
    expect(r.missing).toEqual([]);
  });

  it("start each table's search by natal Saturn's house from the Moon, as PL9", () => {
    const y = 365.25;
    expect([12, 1, 2, 3, 4, 11].map((h) => searchOffset('sadeSati', h) / y)).toEqual([-15, -15, -15, 5, 0, 0]);
    expect([11, 12, 1, 2, 3, 4, 7, 10].map((h) => searchOffset('kantaka', h) / y)).toEqual([2.5, 0, 0, 0, 0, -7.5, -15, -22.5]);
  });

  it('find a retrograde Saturn re-entering a sign, and give the re-entry as a second stay within ten years', () => {
    const changes = saturnIngresses(turning, birth.jdUt, birth.jdUt + 30 * 365.25);
    expect(changes.some((c) => c.retrograde)).toBe(true);
    for (let i = 1; i < changes.length; i++) expect(changes[i]!.sign).toBe(((changes[i - 1]!.sign + (changes[i]!.retrograde ? 11 : 1)) % 12));
    const r = computeRemedies(turning, birth, { fidelity: 'corrected' });
    const twice = [...r.sadeSati, ...r.kantaka].flat().filter((h) => h.stays[1]);
    expect(twice.length).toBeGreaterThan(0);
    for (const h of twice) {
      const [a, b] = h.stays as [NonNullable<typeof h.stays[0]>, NonNullable<typeof h.stays[1]>];
      expect(b.startJdUt).toBeGreaterThan(a.endJdUt);
      expect(b.startJdUt - a.startJdUt).toBeLessThanOrEqual(10 * 365.25);
    }
  });
});
