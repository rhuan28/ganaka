import { describe, expect, it } from 'vitest';
import { InvalidOptionError, LagnaUndefinedError, PLANETS_9, kalachakraDashas, type Planet9, NotImplementedOptionError, CrossingNotFoundError, byTime, calendarOf, crossingTime, vargaLongitude, computeDashas, computePositions, nakshatraDashas } from '../src/index';
import { fakeSky } from './fakeSky';

const input = { jdUt: 2451545.3, latitude: 20, longitudeEast: 30 };

describe('computeDashas', () => {
  it('defaults to Vimshottari from the Moon, three levels, the year PL9 calls 365.25, in the corrected mode', () => {
    const d = computeDashas(fakeSky, input, { cycles: 1 });
    const moon = computePositions(fakeSky, input).points.moon.longitude;
    expect(d.system).toBe('vimshottari');
    expect(d.fidelity).toBe('corrected');
    expect(d.periods).toEqual(nakshatraDashas('vimshottari', moon, input.jdUt, { yearDays: 365.25, levels: 3 }, 'corrected'));
  });
  it('starts from another point when asked, and keeps the pl9 mode', () => {
    const d = computeDashas(fakeSky, input, { system: 'ashtottari', base: 'lagna', levels: 2, yearDays: '360', cycles: 1 }, { fidelity: 'pl9' });
    const lagna = computePositions(fakeSky, input, { fidelity: 'pl9' }).points.lagna!.longitude;
    expect(d.periods).toEqual(nakshatraDashas('ashtottari', lagna, input.jdUt, { yearDays: 360, levels: 2 }, 'pl9'));
  });
  it('refuses a Lagna base where the Lagna is not defined, and unknown options', () => {
    expect(() => computeDashas(fakeSky, { ...input, latitude: 75 }, { base: 'lagna' })).toThrow(LagnaUndefinedError);
    expect(() => computeDashas(fakeSky, input, { system: 'nope' as never })).toThrow(InvalidOptionError);
    expect(() => computeDashas(fakeSky, input, { levels: 6 as never })).toThrow(InvalidOptionError);
    expect(() => computeDashas(fakeSky, input, { yearDays: '365' as never })).toThrow(InvalidOptionError);
    expect(() => computeDashas(fakeSky, input, { base: 'pluto' as never })).toThrow(InvalidOptionError);
  });
  it('takes the balance by time from the instants the point enters and leaves its nakshatra', () => {
    // The fake sky moves the Moon evenly: by time and by degree agree.
    const t = computeDashas(fakeSky, input, { balance: 'time', levels: 1 }).periods;
    const d = computeDashas(fakeSky, input, { levels: 1 }).periods;
    expect(t[0]!.lord).toBe(d[0]!.lord);
    expect(t[0]!.start).toBeCloseTo(d[0]!.start, 3);
    expect(() => computeDashas(fakeSky, input, { balance: 'time', base: 'rahu' })).toThrow(NotImplementedOptionError);
  });
  it('starts the dashas of the Navamsha from nine times the longitude, and declares the other vargas', () => {
    const moon = computePositions(fakeSky, input).points.moon.longitude;
    expect(computeDashas(fakeSky, input, { varga: 'D9', levels: 1, cycles: 1 }).periods).toEqual(nakshatraDashas('vimshottari', (moon * 9) % 360, input.jdUt, { yearDays: 365.25, levels: 1 }, 'corrected'));
    expect(vargaLongitude(350, 9)).toBeCloseTo(270, 9);
    expect(() => computeDashas(fakeSky, input, { varga: 'D10' })).toThrow(NotImplementedOptionError);
  });
});

describe('calendarOf', () => {
  it('gives the Gregorian date and time of a Julian day, and the Julian calendar before 1582', () => {
    expect(calendarOf(2451545)).toEqual({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 });
    expect(calendarOf(2449865.4694144 + 10 / 24)).toMatchObject({ year: 1995, month: 5, day: 28, hour: 9 });
    expect(calendarOf(2299160.5)).toMatchObject({ year: 1582, month: 10, day: 15 });
    expect(calendarOf(2299159.5)).toMatchObject({ year: 1582, month: 10, day: 4 });
    // The ends of the reference charts: 1801 and 2048.
    expect(calendarOf(2378861.5)).toEqual({ year: 1801, month: 1, day: 1, hour: 0, minute: 0 });
    expect(calendarOf(2469441.5)).toEqual({ year: 2048, month: 12, day: 31, hour: 0, minute: 0 });
    // A minute is never shown as 60.
    expect(calendarOf(2451545 + (59.9999 / 60) / 24)).toMatchObject({ hour: 12, minute: 59 });
  });
});

describe('the balance by time', () => {
  it('finds the instants a point crosses the ends of its arc', () => {
    // A point at 10° per day from 0° at jd 0.
    const at = (jd: number) => ((10 * jd) % 360 + 360) % 360;
    expect(crossingTime(at, 1.234, 10, -1, 13.3)).toBeCloseTo(1, 9);
    expect(crossingTime(at, 1.234, 20, 1, 13.3)).toBeCloseTo(2, 9);
    // Across 0°.
    expect(crossingTime(at, 35.95, 0, 1, 13.3)).toBeCloseTo(36, 9);
    expect(byTime(at, 1.234)(12.34, 10, 20)).toBeCloseTo(0.234, 9);
  });
  it('gives the part of the time, not of the arc, when the point does not move evenly', () => {
    // Slower at the start of the arc: 5°/day up to 15°, then 20°/day.
    const at = (jd: number) => (jd <= 3 ? 5 * jd : 15 + 20 * (jd - 3));
    // At jd 3 the point has gone half the arc 10°–20° in degrees, but two thirds of its time over it.
    expect(byTime(at, 3)(15, 10, 20)).toBeCloseTo(1 / (1 + 0.25), 9);
  });
});

describe('review fixes of the balance by time', () => {
  it('follows a point that sweeps more than half the zodiac between two steps of the search', () => {
    // 8° a day near the start, then 800° a day further back, as the Lagna near the polar circle.
    const at = (t: number) => ((t > -1 ? 75 + 8 * t : 67 + 800 * (t + 1)) % 360 + 360) % 360;
    expect(crossingTime(at, 0, 200 / 3, -1, 40 / 3)).toBeCloseTo(-1 - (67 - 200 / 3) / 800, 6);
  });
  it('refuses the balance by time from a planet that turns retrograde, and says when no crossing is found', () => {
    for (const base of ['mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const) {
      expect(() => computeDashas(fakeSky, input, { balance: 'time', base }), base).toThrow(NotImplementedOptionError);
    }
    expect(() => crossingTime(() => 10, 0, 20, 1, 40 / 3)).toThrow(CrossingNotFoundError);
  });
});

describe('review fixes: the cycles that follow', () => {
  it('covers 120 years after birth by default, repeating the cycle from its first lord', () => {
    const d = computeDashas(fakeSky, input, { system: 'yogini', levels: 2 }).periods;
    expect(d.at(-1)!.end).toBeGreaterThanOrEqual(input.jdUt + 120 * 365.25);
    const one = computeDashas(fakeSky, input, { system: 'yogini', levels: 2, cycles: 1 }).periods;
    expect(one).toHaveLength(8);
    // The second cycle begins where the first ends, with the first lord again and its whole length.
    expect(d[8]!.lord).toBe(d[0]!.lord);
    expect(d[8]!.start).toBe(d[7]!.end);
    expect(d[8]!.end - d[8]!.start).toBeCloseTo(d[16]!.end - d[16]!.start, 6);
    expect(d[8]!.sub![0]!.lord).toBe(d[0]!.lord);
    expect(() => computeDashas(fakeSky, input, { cycles: 0 })).toThrow(InvalidOptionError);
  });
});

describe('computeDashas with the Kalachakra', () => {
  it('gives the Kalachakra of the chart, with its Deha and Jeeva, and refuses what was not measured with it', () => {
    const P = computePositions(fakeSky, input).points;
    const longitudes = Object.fromEntries(PLANETS_9.map((p) => [p, P[p].longitude])) as Record<Planet9, number>;
    const d = computeDashas(fakeSky, input, { system: 'kalachakra', levels: 2, cycles: 1 });
    const k = kalachakraDashas(P.moon.longitude, longitudes, input.jdUt, { yearDays: 365.25, levels: 2, cycles: 1, antardashas: 12, sequence: 'continue' }, 'corrected');
    expect(d.system).toBe('kalachakra');
    expect(d.periods).toEqual(k.periods);
    expect(d.kalachakra).toEqual({ savya: k.savya, deha: k.deha, jeeva: k.jeeva });
    // By default, the runs of twelve that reach 120 years after birth.
    expect(computeDashas(fakeSky, input, { system: 'kalachakra', levels: 1 }).periods.at(-1)!.end).toBeGreaterThanOrEqual(input.jdUt + 120 * 365.25);
    for (const o of [{ base: 'sun' }, { varga: 'D9' }, { balance: 'time' }] as const) {
      expect(() => computeDashas(fakeSky, input, { system: 'kalachakra', ...o }), JSON.stringify(o)).toThrow(NotImplementedOptionError);
    }
    expect(() => computeDashas(fakeSky, input, { system: 'kalachakra', kalachakra: { antardashas: 7 as never, sequence: 'continue' } })).toThrow(InvalidOptionError);
  });
});

describe('review fixes: the rashi dashas from computeDashas', () => {
  it('default to two levels, and give the Narayana, Kendradi and Drig only their first run', () => {
    const c = computeDashas(fakeSky, input, { system: 'chara' });
    expect(c.periods[0]!.sub).toHaveLength(12);
    expect(c.periods[0]!.sub![0]!.sub).toBeUndefined();
    for (const system of ['narayana', 'lagnaKendradi', 'drig'] as const) {
      const d = computeDashas(fakeSky, input, { system }, { fidelity: 'pl9' });
      expect(d.periods.length, system).toBeLessThanOrEqual(12);
      expect(() => computeDashas(fakeSky, input, { system, cycles: 2 }, { fidelity: 'pl9' }), system).toThrow(NotImplementedOptionError);
    }
    expect(() => computeDashas(fakeSky, input, { system: 'chara', levels: 3 })).toThrow(NotImplementedOptionError);
    expect(() => computeDashas(fakeSky, { ...input, latitude: 89 }, { system: 'chara' })).toThrow(LagnaUndefinedError);
  });
});

describe('the second run in the corrected mode', () => {
  it('is given, and refused in the pl9 mode', () => {
    expect(computeDashas(fakeSky, input, { system: 'narayana', cycles: 2 }).periods.length).toBeGreaterThan(12);
    expect(() => computeDashas(fakeSky, input, { system: 'narayana', cycles: 2 }, { fidelity: 'pl9' })).toThrow(NotImplementedOptionError);
  });
});

describe('the options of the rashi dashas', () => {
  it('are passed on, and checked', () => {
    const kn = computeDashas(fakeSky, input, { system: 'chara', levels: 1 }, { fidelity: 'pl9' }).periods;
    const pa = computeDashas(fakeSky, input, { system: 'chara', levels: 1, rashi: { charaMethod: 'parashara' } }, { fidelity: 'pl9' }).periods;
    expect(pa.map((p) => p.lord)).not.toEqual(kn.map((p) => p.lord));
    expect(() => computeDashas(fakeSky, input, { system: 'chara', rashi: { charaMethod: 'jaimini' as 'knRao' } })).toThrow(InvalidOptionError);
    expect(() => computeDashas(fakeSky, input, { system: 'chara', rashi: { other: 1 } as never })).toThrow(InvalidOptionError);
  });
});
