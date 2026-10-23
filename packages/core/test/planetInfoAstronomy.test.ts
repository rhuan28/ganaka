import { describe, expect, it } from 'vitest';
import { computePlanetInfo, declinationOf, krantiOf, speedPercentOf } from '../src';
import { fakeSky } from './fakeSky';

describe('the astronomy of the planet tables', () => {
  it('gives the true declination from the longitude, the latitude and the obliquity', () => {
    // No latitude: asin(sin ε · sin λ). With latitude, the body sits north or south of that.
    expect(declinationOf(90, 0, 23.4376)).toBeCloseTo(23.4376, 6);
    expect(declinationOf(210, 0, 23.4376)).toBeCloseTo(-11.4712, 3);
    expect(declinationOf(90, 5, 23.4376)).toBeCloseTo(28.4376, 6);
    expect(declinationOf(0, 0, 23.4376)).toBe(0);
  });

  it("gives PL9's Kranti, 23.45 times the sine of the tropical longitude", () => {
    expect(krantiOf(90)).toBeCloseTo(23.45, 9);
    expect(krantiOf(270)).toBeCloseTo(-23.45, 9);
  });

  it('sets the speed against the mean motion, truncated, as REF 0010 shows it', () => {
    // PL9 prints 102%, 110%, 134%, -379% and -64% for the Sun, the Moon, Mars, retrograde Mercury and retrograde Jupiter.
    expect(speedPercentOf('sun', 0.96013)).toBe(102);
    expect(speedPercentOf('moon', 11.88504)).toBe(110);
    expect(speedPercentOf('mars', 0.45935)).toBe(134);
    expect(speedPercentOf('mercury', -0.25958)).toBe(-379);
    expect(speedPercentOf('jupiter', -0.12645)).toBe(-64);
    expect(speedPercentOf('saturn', 0)).toBeNull();
  });

  it('gives every body, Ketu opposite Rahu, and marks only the planets retrograde', () => {
    const info = computePlanetInfo(fakeSky, { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 }, {}, { fidelity: 'corrected' });
    expect(Object.keys(info.points)).toHaveLength(12);
    expect(info.points.ketu.declination).toBeCloseTo(-info.points.rahu.declination, 9);
    expect(info.points.ketu.kranti).toBeCloseTo(-info.points.rahu.kranti, 9);
    expect(info.points.rahu.retrograde).toBe(false);
    expect(info.points.uranus.speedPercent).toBeNull();
    for (const b of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const) {
      expect(info.points[b].retrograde).toBe(info.points[b].speed < 0);
    }
  });
});
