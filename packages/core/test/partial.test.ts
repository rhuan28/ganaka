import { describe, expect, it } from 'vitest';
import { ALL_POINTS, VARGAS, computeChart, computePositions } from '../src/index';
import { fakeSky } from './fakeSky';

const finite = (o: unknown): boolean =>
  typeof o === 'number' ? Number.isFinite(o) : o !== null && typeof o === 'object' ? Object.values(o).every(finite) : true;

describe('a chart beyond the polar circle', () => {
  const input = { jdUt: 2451545.4, latitude: 70, longitudeEast: 25 };
  for (const fidelity of ['pl9', 'corrected'] as const) {
    it(`comes back with the planets, without Lagna, Gulika, Prana Pada or houses (${fidelity})`, () => {
      const c = computeChart(fakeSky, input, { fidelity });
      expect(c.points.sun.longitude).toBeGreaterThanOrEqual(0);
      expect(c.points.lagna).toBeUndefined();
      expect(c.points.gulika).toBeUndefined();
      expect(c.points.pranaPada).toBeUndefined();
      expect(c.points.mandi).toBeUndefined();
      expect(c.points.bhrigu).toBeDefined();
      expect(c.houses).toBeUndefined();
      expect(c.pointHouses).toBeUndefined();
      expect(c.missing).toEqual([
        { what: 'lagna', reason: 'beyondPolarCircle' }, { what: 'gulika', reason: 'beyondPolarCircle' },
        { what: 'pranaPada', reason: 'beyondPolarCircle' }, { what: 'mandi', reason: 'beyondPolarCircle' }, { what: 'houses', reason: 'beyondPolarCircle' },
        { what: 'arudhas', reason: 'beyondPolarCircle' }, { what: 'specialLagnas', reason: 'beyondPolarCircle' },
      ]);
      expect(Number.isFinite(c.midheaven)).toBe(true);
      expect(c.verified).toBe(false);
    });
    it(`holds no NaN and no key for an absent point (${fidelity})`, () => {
      const c = computeChart(fakeSky, input, { fidelity });
      expect(finite(c)).toBe(true);
      for (const v of VARGAS) {
        expect(Object.keys(c.vargas[v]).sort()).toEqual(ALL_POINTS.filter((p) => !['lagna', 'gulika', 'pranaPada', 'mandi'].includes(p)).sort());
      }
      expect(JSON.parse(JSON.stringify(c))).toEqual(c);
    });
  }
});

describe('a chart where only the sunrise search fails', () => {
  // 66 degrees at a solstice: PL9's search does not settle; the exact one does.
  const input = { jdUt: 2451545 + 172.3, latitude: 66, longitudeEast: 10 };
  it('in the pl9 mode keeps the Lagna and the houses and drops Gulika and Prana Pada, when the search fails', () => {
    // The search fails on many days at this latitude, not on all: look for one over a year.
    const failed = Array.from({ length: 180 }, (_, k) => computeChart(fakeSky, { ...input, jdUt: 2451545 + k * 2.03 }, { fidelity: 'pl9' }))
      .filter((c) => c.missing.length > 0);
    expect(failed.length).toBeGreaterThan(0);
    for (const c of failed) {
      expect(c.missing).toEqual([{ what: 'gulika', reason: 'sunriseNotFound' }, { what: 'pranaPada', reason: 'sunriseNotFound' }, { what: 'mandi', reason: 'sunriseNotFound' },
        { what: 'specialLagnas', reason: 'sunriseNotFound' }]);
      expect(c.points.gulika).toBeUndefined();
      expect(c.points.pranaPada).toBeUndefined();
      expect(c.points.mandi).toBeUndefined();
      expect(c.points.lagna).toBeDefined();
      expect(c.houses).toBeDefined();
    }
  });
  it('in the corrected mode has every point', () => {
    const c = computeChart(fakeSky, input, { fidelity: 'corrected' });
    expect(c.missing).toEqual([]);
    expect(Object.keys(c.points).sort()).toEqual([...ALL_POINTS].sort());
  });
});

describe('an ordinary chart', () => {
  it('has nothing missing', () => {
    const p = computePositions(fakeSky, { jdUt: 2451545.4, latitude: 20, longitudeEast: 30 });
    expect(p.missing).toEqual([]);
    expect(Object.keys(p.points).sort()).toEqual([...ALL_POINTS].sort());
  });
});
