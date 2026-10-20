import { describe, expect, it } from 'vitest';
import type { Body, Ephemeris } from '@reverse/ephemeris';
import { nodeLongitudes } from '../src/index';

const base = { longitude: 150, latitude: 0, distance: 1, longitudeSpeed: -0.05 };
const fake = {
  tropical: (_jd: number, _b: Body) => base,
  meanEquinoxLongitude: (_jd: number, _b: Body) => base,
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
} as unknown as Ephemeris;

describe('nodeLongitudes', () => {
  it('puts Ketu exactly opposite Rahu', () => {
    const n = nodeLongitudes(fake, 2451545, 24);
    expect((n.ketu.longitude - n.rahu.longitude + 360) % 360).toBeCloseTo(180, 12);
  });
  it('keeps both in [0, 360)', () => {
    const n = nodeLongitudes(fake, 2451545, 200);
    for (const v of [n.rahu.longitude, n.ketu.longitude]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });
  it('gives both the same speed and the same direction flag', () => {
    const n = nodeLongitudes(fake, 2451545, 24);
    expect(n.ketu.longitudeSpeed).toBe(n.rahu.longitudeSpeed);
    expect(n.ketu.retrograde).toBe(n.rahu.retrograde);
  });
});

describe('nodeLongitudes: the plane term', () => {
  const at = (lon: number) => ({
    ...fake,
    meanEquinoxLongitude: () => ({ longitude: lon, latitude: 0, distance: 1, longitudeSpeed: -0.05 }),
  }) as unknown as Ephemeris;
  // At J2000 the precession since J2000 is zero, and the fake Delta T shift is a fraction of a second.
  it('adds 0.4653 arcsecond when the node is at 90 degrees from the J2000 equinox, and nothing at 0', () => {
    expect((nodeLongitudes(at(90), 2451545, 0).rahu.longitude - 90) * 3600).toBeCloseTo(0.4653, 3);
    expect(nodeLongitudes(at(0), 2451545, 0).rahu.longitude * 3600).toBeCloseTo(0, 3);
    expect((nodeLongitudes(at(270), 2451545, 0).rahu.longitude - 270) * 3600).toBeCloseTo(-0.4653, 3);
  });
});
