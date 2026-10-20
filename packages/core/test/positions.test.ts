import { describe, expect, it } from 'vitest';
import type { Body, Ephemeris } from '@reverse/ephemeris';
import { julianDayUt } from '@reverse/ephemeris';
import { ALL_POINTS, InvalidInputError, ayanamshaFrame, NotImplementedOptionError, POINTS, bhriguPoint, computePositions, mandiLongitude, nakshatraOf, padaOf, signOf } from '../src/index';
import { fakeSky } from './fakeSky';

const LON: Record<string, number> = { sun: 100, moon: 200, mars: 50, mercury: 110, jupiter: 300, venus: 80, saturn: 10, uranus: 30, neptune: 345, pluto: 290, trueNode: 150, meanNode: 151 };
const pos = (b: Body) => ({ longitude: LON[b] ?? 0, latitude: 0, distance: 1, longitudeSpeed: b === 'saturn' ? -0.02 : 0.5 });
const fake = {
  tropical: (_jd: number, b: Body) => pos(b),
  meanEquinoxLongitude: (_jd: number, b: Body) => pos(b),
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
  siderealReference: (_jd: number, b: Body) => (LON[b] ?? 0) - 24,
  siderealTimeHours: () => 6,
  obliquityAndNutation: () => ({ trueObliquity: 23.44, meanObliquity: 23.44, nutationLongitude: 0, nutationObliquity: 0 }),
  ascendantTropical: () => 190,
} as unknown as Ephemeris;

const input = { jdUt: julianDayUt(2000, 7, 1, 12), latitude: 28.6, longitudeEast: 77.2 };

describe('computePositions', () => {
  const r = computePositions(fake, input);

  it('includes Gulika and Prana Pada, without speed', () => {
    expect(POINTS).toHaveLength(20);
    const c = computePositions(fakeSky, input);
    expect(c.points.gulika!.longitude).toBeGreaterThanOrEqual(0);
    expect(c.points.pranaPada!.longitude).toBeLessThan(360);
    expect(c.points.gulika!.longitudeSpeed).toBeUndefined();
  });
  it('beyond the polar circle returns the chart without the points that are not defined there', () => {
    expect(computePositions(fakeSky, { ...input, latitude: 67 }).missing.map((m) => m.what)).toEqual(['lagna', 'gulika', 'pranaPada', 'mandi']);
  });
  it('adds Mandi and the Bhrigu point to the points of the export', () => {
    expect(ALL_POINTS).toHaveLength(22);
    const r = computePositions(fakeSky, { jdUt: 2451545.3, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9' });
    expect(Object.keys(r.points).sort()).toEqual([...ALL_POINTS].sort());
    expect(r.points.bhrigu.longitude).toBeCloseTo(bhriguPoint(r.points.moon.longitude, r.points.rahu.longitude), 12);
    expect(r.points.mandi!.longitude).toBeCloseTo(mandiLongitude(fakeSky, 2451545.3, 20, 30, ayanamshaFrame(fakeSky, 'lahiri', 0, 'pl9')), 9);
  });
  it('moves Gulika, and nothing else, with the method', () => {
    const a = computePositions(fakeSky, { jdUt: 2451545.3, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9' });
    const b = computePositions(fakeSky, { jdUt: 2451545.3, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9', gulika: 'beginning' });
    expect(b.points.gulika!.longitude).not.toBeCloseTo(a.points.gulika!.longitude, 3);
    for (const p of ALL_POINTS) if (p !== 'gulika') expect(b.points[p]!.longitude, p).toBe(a.points[p]!.longitude);
  });
  it('never marks the nodes retrograde, as PL9 does not, and keeps their speed', () => {
    const nodes = computePositions(fakeSky, input);
    expect(nodes.points.rahu.retrograde).toBe(false);
    expect(nodes.points.ketu.retrograde).toBe(false);
    expect(nodes.points.rahu.longitudeSpeed).toBeLessThan(0);
  });
  it('returns every point, each with sign, nakshatra and pada consistent with its longitude', () => {
    expect(Object.keys(r.points).sort()).toEqual([...ALL_POINTS].sort());
    for (const p of ALL_POINTS) {
      const v = r.points[p]!;
      expect(v.longitude).toBeGreaterThanOrEqual(0);
      expect(v.longitude).toBeLessThan(360);
      expect(v.sign).toBe(signOf(v.longitude));
      expect(v.nakshatra).toBe(nakshatraOf(v.longitude));
      expect(v.pada).toBe(padaOf(v.longitude));
    }
  });
  it('gives speed and direction for planets and nodes, and omits them for derived points', () => {
    expect(r.points.saturn.retrograde).toBe(true);
    expect(r.points.sun.retrograde).toBe(false);
    expect(r.points.rahu.longitudeSpeed).toBeDefined();
    expect(r.points.dhuma.longitudeSpeed).toBeUndefined();
    expect(r.points.lagna!.retrograde).toBeUndefined();
  });
  it('reports the ayanamsha it used', () => {
    expect(r.ayanamshaDegrees).toBeGreaterThan(23.9);
    expect(r.ayanamshaDegrees).toBeLessThan(24.1);
  });
  it('marks results inside 1801-2048 as verified and others as not', () => {
    expect(r.verified).toBe(true);
    expect(computePositions(fake, { ...input, jdUt: julianDayUt(1800, 6, 1) }).verified).toBe(false);
    expect(computePositions(fake, { ...input, jdUt: julianDayUt(2100, 6, 1) }).verified).toBe(false);
  });
  it('shifts every longitude when the ayanamsha option changes', () => {
    const other = computePositions(fake, input, { ayanamshaOffsetDegrees: 2 });
    expect(Math.abs(((other.points.sun.longitude - r.points.sun.longitude + 540) % 360) - 180)).toBeCloseTo(2, 6);
  });
  it('refuses options that are declared but not implemented', () => {
    expect(() => computePositions(fake, input, { node: 'mean' })).toThrow(NotImplementedOptionError);
  });
  it('uses the clock offset of the chart for Gulika and Mandi only', () => {
    const jd = 2451545 + 10 / 24;
    const a = computePositions(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 150 });
    const b = computePositions(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 150, utcOffsetHours: 10 });
    expect(b.points.gulika!.longitude).not.toBeCloseTo(a.points.gulika!.longitude, 3);
    expect(b.points.mandi!.longitude).not.toBeCloseTo(a.points.mandi!.longitude, 3);
    expect({ ...b.points, gulika: 0, mandi: 0 }).toEqual({ ...a.points, gulika: 0, mandi: 0 });
    expect(() => computePositions(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 150, utcOffsetHours: Number.NaN })).toThrow(InvalidInputError);
    expect(() => computePositions(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 150, utcOffsetHours: 30 })).toThrow(InvalidInputError);
  });
  it('refuses malformed input with a typed error', () => {
    expect(() => computePositions(fake, { ...input, jdUt: Number.NaN })).toThrow(InvalidInputError);
    expect(() => computePositions(fake, { ...input, latitude: 91 })).toThrow(InvalidInputError);
    expect(() => computePositions(fake, { ...input, longitudeEast: 181 })).toThrow(InvalidInputError);
  });
});
