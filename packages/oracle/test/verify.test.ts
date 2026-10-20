import { describe, expect, it } from 'vitest';
import { POINTS, nakshatraOf, padaOf, signOf, type Positions } from '@reverse/core';
import type { Fixture } from '../src/fixtures';
import { distanceToBoundaryArcsec, verifyChart } from '../src/verify';

const as = (v: number) => v / 3600;
const mk = (lon: Record<string, number>): Positions => ({
  verified: true, fidelity: 'pl9', missing: [], ayanamshaDegrees: 24,
  points: Object.fromEntries(POINTS.map((p) => {
    const l = lon[p] ?? 100;
    return [p, { longitude: l, sign: signOf(l), nakshatra: nakshatraOf(l), pada: padaOf(l) }];
  })) as Positions['points'],
});
const fx = (lon: Record<string, number>): Fixture => ({
  id: 'ref-0001', kind: 'random', input: { jdUt: 2451545, latitude: 0, longitudeEast: 0 },
  pl9: { longitudes: Object.fromEntries(POINTS.map((p) => [p, lon[p] ?? 100])) },
  provenance: { program: '', ayanamsha: 'Lahiri', method: '', extractedOn: '' },
});

describe('distanceToBoundaryArcsec', () => {
  it('measures to the nearest multiple of the span, on either side', () => {
    expect(distanceToBoundaryArcsec(30 + as(0.2), 30)).toBeCloseTo(0.2, 6);
    expect(distanceToBoundaryArcsec(30 - as(0.3), 30)).toBeCloseTo(0.3, 6);
    expect(distanceToBoundaryArcsec(as(0.1), 30)).toBeCloseTo(0.1, 6);
    expect(distanceToBoundaryArcsec(15, 30)).toBe(15 * 3600);
  });
});

describe('verifyChart', () => {
  it('passes a chart that agrees', () => {
    const v = verifyChart(fx({}), mk({}), 0.5);
    expect(v.longitudeFailures).toEqual([]);
    expect(v.categoricalFailures).toEqual([]);
    expect(v.borderCases).toEqual([]);
  });
  it('reports a longitude beyond the tolerance', () => {
    const v = verifyChart(fx({ moon: 200 }), mk({ moon: 200 + as(0.8) }), 0.5);
    expect(v.longitudeFailures).toHaveLength(1);
    expect(v.longitudeFailures[0]!.point).toBe('moon');
    expect(v.longitudeFailures[0]!.arcsec).toBeCloseTo(0.8, 6);
    expect(v.maxAbsArcsec.moon).toBeCloseTo(0.8, 6);
  });
  it('lists a sign disagreement next to a boundary as a border case, not a failure', () => {
    const v = verifyChart(fx({ sun: 30 - as(0.2) }), mk({ sun: 30 + as(0.1) }), 0.5);
    expect(v.categoricalFailures).toEqual([]);
    expect(v.borderCases.some((b) => b.point === 'sun' && b.what === 'sign')).toBe(true);
  });
  it('fails a sign disagreement away from any boundary', () => {
    const wrong = mk({});
    wrong.points.sun.sign = 7;
    const v = verifyChart(fx({}), wrong, 0.5);
    expect(v.categoricalFailures).toEqual([{ point: 'sun', what: 'sign', expected: 3, actual: 7 }]);
  });
  it('fails on a longitude that is not a number', () => {
    const bad = mk({});
    bad.points.mars.longitude = Number.NaN;
    expect(verifyChart(fx({}), bad, 0.5).longitudeFailures.some((f) => f.point === 'mars')).toBe(true);
  });
  it('throws when the fixture has no value for a computed point', () => {
    const f = fx({});
    delete f.pl9.longitudes.lagna;
    expect(() => verifyChart(f, mk({}), 0.5)).toThrow(/lagna/);
  });
});

describe('review fixes', () => {
  it('counts a point the fixture has and the chart lacks as a failure', () => {
    const computed = mk({});
    delete (computed.points as Record<string, unknown>).gulika;
    const v = verifyChart(fx({}), computed, 0.5);
    expect(v.longitudeFailures.map((f) => f.point)).toEqual(['gulika']);
  });
  it('does not call a mismatch a border case when the longitudes are far apart', () => {
    const v = verifyChart(fx({ moon: 30 + as(0.1) }), mk({ moon: 130 }), 0.5);
    expect(v.borderCases).toEqual([]);
    expect(v.categoricalFailures.map((f) => f.what)).toContain('sign');
  });
  it('fails a set smaller than its required size', async () => {
    const { setProblem } = await import('../src/verify');
    expect(setProblem({ charts: 1, minCharts: 30, longitudeFailures: 0, categoricalFailures: 0 })).toMatch(/1 .*30/);
    expect(setProblem({ charts: 30, minCharts: 30, longitudeFailures: 0, categoricalFailures: 0 })).toBeNull();
    expect(setProblem({ charts: 30, minCharts: 30, longitudeFailures: 1, categoricalFailures: 0 })).not.toBeNull();
  });
});
