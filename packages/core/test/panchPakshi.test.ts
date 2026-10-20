import { describe, expect, it } from 'vitest';
import { natalBird, panchPakshi, panchPakshiDay } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const o = { fidelity: 'pl9' } as const;
// REF 0010 on Sat 17 Oct 2026 in Jaipur (IST): sunrise 06:30:26, sunset 17:53:48, next sunrise 06:31:00.
const ist = (d: number, h: number, m: number, s: number) => Date.UTC(2026, 9, d, h, m, s) / 86400000 + 2440587.5 - 5.5 / 24;
const sunrise = ist(17, 6, 30, 26), sunset = ist(17, 17, 53, 48), next = ist(18, 6, 31, 0);

describe('the Panch Pakshi', () => {
  it('takes the bird by the natal Moon, in five spans, the other way round in the dark half', () => {
    expect(natalBird(200, 300)).toBe('peacock');
    expect(natalBird(10, 300)).toBe('vulture');
    expect(natalBird(0, 66.6)).toBe('vulture');
    expect(natalBird(0, 146.7)).toBe('crow');
  });
  it('divides the day and the night in five, each part by the activities\' shares, birds and activities in turn', () => {
    const p = panchPakshiDay('peacock', true, 6, sunrise, sunset, next);
    expect([p.ruling, p.dying]).toEqual([{ day: 'cock', night: 'vulture' }, 'owl']);
    expect(p.day.map((y) => y.activity)).toEqual(['walking', 'ruling', 'sleeping', 'dying', 'eating']);
    expect(p.night.map((y) => y.activity)).toEqual(['ruling', 'dying', 'walking', 'sleeping', 'eating']);
    const first = p.day[0]!;
    expect(first.parts.map((x) => [x.bird, x.activity, x.relation])).toEqual([
      ['peacock', 'walking', 'self'], ['vulture', 'ruling', 'friend'], ['owl', 'sleeping', 'enemy'], ['crow', 'dying', 'enemy'], ['cock', 'eating', 'friend'],
    ]);
    // The second part, 07:04:36, after six twenty-fourths of the yama.
    expect((first.parts[1]!.startJdUt - ist(17, 7, 4, 36)) * 86400).toBeCloseTo(0, -0.5);
    expect(p.day[1]!.startJdUt).toBeCloseTo(sunrise + (sunset - sunrise) / 5, 9);
    expect(p.night[0]!.parts.map((x) => x.bird)).toEqual(['peacock', 'cock', 'crow', 'owl', 'vulture']);
    expect((p.night[0]!.parts[1]!.startJdUt - ist(17, 18, 19, 3)) * 86400).toBeCloseTo(0, -0.5);
    expect(p.night[4]!.endJdUt).toBe(next);
  });
  it('is the day from the sunrise before the instant, on its Vedic weekday, and nothing where the place has no sunrise', () => {
    const at = { jdUt: ist(17, 4, 6, 23), latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
    const p = panchPakshi(fakeSky, natal, at, o)!;
    expect([p.weekday, p.vara]).toEqual([6, 6]);
    expect(p.day[0]!.startJdUt).toBeLessThan(at.jdUt);
    expect(p.night[4]!.endJdUt).toBeGreaterThan(at.jdUt);
    expect(panchPakshi(fakeSky, natal, { ...at, latitude: 89.5, jdUt: ist(20, 12, 0, 0) - 60 }, o)).toBeNull();
  });
});
