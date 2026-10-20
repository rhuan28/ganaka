import { describe, expect, it } from 'vitest';
import type { Body, Ephemeris } from '@reverse/ephemeris';
import type { Fixture } from '../src/fixtures';
import { byDecade, measureChart, median } from '../src/measure';

const notUsed = () => {
  throw new Error('not used in this test');
};
const unused = {
  meanEquinoxLongitude: notUsed, obliquityAndNutation: notUsed, siderealTimeHours: notUsed,
  ascendantTropical: notUsed, siderealReference: notUsed, ayanamshaReference: notUsed,
  sunRiseSetReference: notUsed, sunEquatorial: notUsed, housesReference: notUsed,
};

const TROPICAL: Record<string, number> = { sun: 100, moon: 200, mars: 50, mercury: 110, jupiter: 300, venus: 80, saturn: 10, trueNode: 150 };
const fake: Ephemeris = {
  ...unused,
  tropical: (_jd: number, body: Body) => ({ longitude: TROPICAL[body] ?? 0, latitude: 0, distance: 1, longitudeSpeed: 1 }),
  deltaTSeconds: () => 60,
  lahiriAyanamshaReference: () => 24,
  lahiriSiderealReference: (_jd: number, body: Body) => (TROPICAL[body] ?? 0) - 24,
  close: () => undefined,
};
const as = (arcsec: number) => arcsec / 3600;
const fixture = (jdUt: number, shift: Record<string, number>): Fixture => ({
  id: 'ref-0001', kind: 'random', input: { jdUt, latitude: 0, longitudeEast: 0 },
  pl9: { longitudes: {
    sun: 76 + as(shift.sun ?? 0), moon: 176 + as(shift.moon ?? 0), mars: 26 + as(shift.mars ?? 0), mercury: 86 + as(shift.mercury ?? 0),
    jupiter: 276 + as(shift.jupiter ?? 0), venus: 56 + as(shift.venus ?? 0), saturn: 346 + as(shift.saturn ?? 0), rahu: 126 + as(shift.rahu ?? 0),
  } },
  provenance: { program: '', ayanamsha: 'Lahiri', method: '', extractedOn: '' },
});

describe('median', () => {
  it('handles odd and even counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe('measureChart', () => {
  it('separates a shift common to the slow bodies from what is left per body', () => {
    const all = { sun: 0.14, moon: 0.34, mars: 0.14, mercury: 0.14, jupiter: 0.14, venus: 0.14, saturn: 0.14, rahu: 0.5 };
    const m = measureChart(fake, fixture(2451545, all));
    expect(m.year).toBe(2000);
    expect(m.offset).toBeCloseTo(0.14, 6);
    expect(m.residual.sun).toBeCloseTo(0, 6);
    expect(m.residual.moon).toBeCloseTo(0.2, 6);
    expect(m.residual.rahu).toBeCloseTo(0.36, 6);
  });
  it('is not thrown off by one slow body that disagrees', () => {
    const m = measureChart(fake, fixture(2451545, { sun: 0.14, mars: 0.14, jupiter: 0.14, saturn: 5 }));
    expect(m.offset).toBeCloseTo(0.14, 6);
    expect(m.residual.saturn).toBeCloseTo(4.86, 6);
  });
});

describe('byDecade', () => {
  it('groups charts by decade with the median offset and the largest absolute residual per field', () => {
    const rows = [
      { chartId: 'a', year: 1995, offset: 0.1, residual: { sun: 0.01, moon: -0.3 } },
      { chartId: 'b', year: 1999, offset: 0.3, residual: { sun: -0.02, moon: 0.1 } },
      { chartId: 'c', year: 2003, offset: 0.2, residual: { sun: 0.05, moon: 0.0 } },
    ];
    expect(byDecade(rows)).toEqual([
      { decade: 1990, charts: 2, medianOffset: 0.2, maxAbsResidual: { sun: 0.02, moon: 0.3 } },
      { decade: 2000, charts: 1, medianOffset: 0.2, maxAbsResidual: { sun: 0.05, moon: 0 } },
    ]);
  });
});

import { fitChart, mergeReport, worstPlanetaryResidual } from '../src/measure';

describe('median (empty input)', () => {
  it('refuses an empty list instead of returning NaN', () => {
    expect(() => median([])).toThrow(/empty/);
  });
});

describe('fitChart', () => {
  const SPEED: Record<string, number> = { sun: 1, moon: 13, mars: 0.5, mercury: 1.4, jupiter: 0.08, venus: 1.2, saturn: 0.03 };
  const moving: Ephemeris = {
    ...fake,
    tropical: (_jd: number, body: Body) => ({ longitude: TROPICAL[body] ?? 0, latitude: 0, distance: 1, longitudeSpeed: SPEED[body] ?? 0 }),
  };
  it('recovers a constant offset and a time shift common to the seven bodies', () => {
    const dt = 20; // seconds
    const shift: Record<string, number> = {};
    for (const [b, v] of Object.entries(SPEED)) shift[b] = 0.138 + (v * 3600 / 86400) * dt;
    const fit = fitChart(moving, fixture(2451545, shift));
    expect(fit.offset).toBeCloseTo(0.138, 6);
    expect(fit.dtSeconds).toBeCloseTo(20, 6);
    expect(fit.maxResidual).toBeLessThan(1e-6);
  });
  it('reports what the two-parameter model cannot explain', () => {
    const shift: Record<string, number> = { sun: 0.1, moon: 0.1, mars: 0.1, mercury: 0.1, jupiter: 0.1, venus: 0.1, saturn: 3.1 };
    expect(fitChart(moving, fixture(2451545, shift)).maxResidual).toBeGreaterThan(1);
  });
});

describe('worstPlanetaryResidual', () => {
  const row = (residual: Record<string, number>) => ({ chartId: 'a', year: 2000, offset: 0, residual });
  it('returns the largest absolute residual from Sun to Saturn, ignoring the node', () => {
    expect(worstPlanetaryResidual([row({ sun: 0.1, moon: -0.4, rahu: 9 }), row({ sun: 0.2, moon: 0.3, rahu: 0 })])).toBe(0.4);
  });
  it('refuses an empty set, so a gate cannot pass with nothing measured', () => {
    expect(() => worstPlanetaryResidual([])).toThrow(/no charts/);
  });
  it('refuses a residual that is not a number', () => {
    expect(() => worstPlanetaryResidual([row({ sun: Number.NaN })])).toThrow(/not finite/);
  });
});

describe('mergeReport', () => {
  it('keeps the hand-written section of the existing report', () => {
    expect(mergeReport('# T\n\ntable v2\n', '# T\n\ntable v1\n\n## Reading\n\nnotes\n')).toBe('# T\n\ntable v2\n\n## Reading\n\nnotes\n');
  });
  it('returns the generated text when there is no existing report or no hand-written section', () => {
    expect(mergeReport('gen\n', null)).toBe('gen\n');
    expect(mergeReport('gen\n', 'old table only\n')).toBe('gen\n');
  });
});
