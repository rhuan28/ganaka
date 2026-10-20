import { describe, expect, it } from 'vitest';
import { compareLongitudes, summarize } from '../src/compare';

describe('compareLongitudes', () => {
  it('reports actual minus expected in arcseconds for the fields computed', () => {
    const d = compareLongitudes('ref-0001', { sun: 10, moon: 20, lagna: 30 }, { sun: 10.0001, moon: 20 });
    expect(d).toHaveLength(2);
    expect(d[0]).toMatchObject({ chartId: 'ref-0001', field: 'sun', expected: 10, actual: 10.0001 });
    expect(d[0]!.arcsec).toBeCloseTo(0.36, 6);
    expect(d[1]!.arcsec).toBe(0);
  });
  it('measures across the 0/360 wrap', () => {
    const [d] = compareLongitudes('c', { sun: 359.9999 }, { sun: 0.0001 });
    expect(d!.arcsec).toBeCloseTo(0.72, 6);
  });
  it('fails loudly when a computed field has no reference value', () => {
    expect(() => compareLongitudes('c', { sun: 1 }, { chiron: 1 })).toThrow(/chiron/);
  });
});

describe('summarize', () => {
  const diffs = [
    { chartId: 'a', field: 'sun', expected: 0, actual: 0, arcsec: 0.2 },
    { chartId: 'a', field: 'moon', expected: 0, actual: 0, arcsec: -0.7 },
    { chartId: 'b', field: 'sun', expected: 0, actual: 0, arcsec: -0.4 },
  ];
  it('counts failures beyond the tolerance and keeps the largest absolute value per field', () => {
    const s = summarize(diffs, 0.5);
    expect(s.total).toBe(3);
    expect(s.failed).toBe(1);
    expect(s.failures.map((f) => f.field)).toEqual(['moon']);
    expect(s.maxAbsByField).toEqual({ sun: 0.4, moon: 0.7 });
  });
  it('treats a difference exactly at the tolerance as a pass', () => {
    expect(summarize([{ chartId: 'a', field: 'sun', expected: 0, actual: 0, arcsec: 0.5 }], 0.5).failed).toBe(0);
  });
});

describe('summarize (values that are not numbers)', () => {
  it('counts a NaN difference as a failure', () => {
    const s = summarize([{ chartId: 'a', field: 'sun', expected: 0, actual: Number.NaN, arcsec: Number.NaN }], 0.5);
    expect(s.failed).toBe(1);
  });
});
