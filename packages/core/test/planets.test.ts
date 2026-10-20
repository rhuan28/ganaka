import { describe, expect, it } from 'vitest';
import type { Body, Ephemeris } from '@reverse/ephemeris';
import { PLANETS, ayanamshaPl9, pl9Instant, planetLongitude, pl9DeltaTSeconds } from '../src/index';

/** Longitude grows 1 degree per day from 100 at JD 2451545; the library's Delta T is fixed at 60 s. */
const fake = {
  meanEquinoxLongitude: (jd: number, _b: Body) => ({ longitude: (((100 + (jd - 2451545)) % 360) + 360) % 360, latitude: 0, distance: 1, longitudeSpeed: -0.25 }),
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
} as unknown as Ephemeris;

describe('pl9Instant', () => {
  it('shifts the instant by the difference between the two Delta T', () => {
    const jd = 2451545;
    expect((pl9Instant(fake, jd) - jd) * 86400).toBeCloseTo(pl9DeltaTSeconds(jd) - 60, 4);
  });
});

describe('ayanamshaPl9', () => {
  it('is the library Lahiri minus 0.1382 arcsecond', () => {
    expect((24 - ayanamshaPl9(fake, 2451545, 'lahiri')) * 3600).toBeCloseTo(0.1382, 6);
  });
});

describe('planetLongitude', () => {
  it('evaluates the ephemeris at the shifted instant and subtracts the ayanamsha', () => {
    const jd = 2451545;
    const shiftDays = pl9Instant(fake, jd) - jd;
    const p = planetLongitude(fake, jd, 'sun', 24);
    expect(p.longitude).toBeCloseTo(100 + shiftDays - 24, 9);
  });
  it('reports speed and marks negative speed as retrograde', () => {
    const p = planetLongitude(fake, 2451545, 'mars', 24);
    expect(p.longitudeSpeed).toBe(-0.25);
    expect(p.retrograde).toBe(true);
  });
  it('keeps the result in [0, 360)', () => {
    expect(planetLongitude(fake, 2451545, 'sun', 110).longitude).toBeGreaterThanOrEqual(350);
    expect(planetLongitude(fake, 2451545, 'sun', 110).longitude).toBeLessThan(360);
  });
  it('lists the ten bodies in PL9 order', () => {
    expect(PLANETS).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'uranus', 'neptune', 'pluto']);
  });
});
