import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { julianDayUt } from '@reverse/ephemeris/time';
import {
  InvalidInputError, InvalidOptionError, ayanamshaPl9, computePositions, lagnaLongitude,
  nakshatraOf, norm360, padaOf, resolveOptions, signOf,
} from '../src/index';
import type { Ephemeris } from '@reverse/ephemeris';
import { fakeSky } from './fakeSky';

const fake = {
  meanEquinoxLongitude: () => ({ longitude: 100, latitude: 0, distance: 1, longitudeSpeed: 1 }),
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
  obliquityAndNutation: () => ({ trueObliquity: 23.4, meanObliquity: 23.4, nutationLongitude: 0, nutationObliquity: 0 }),
} as unknown as Ephemeris;
const jd = julianDayUt(2000, 1, 1, 12);

describe('zodiac divisions at exact boundaries', () => {
  it('gives quarter k at the float value of k * 360/108, with sign, nakshatra and pada consistent', () => {
    for (let k = 0; k < 108; k++) {
      const lon = (k * 360) / 108;
      expect([k, nakshatraOf(lon), padaOf(lon), signOf(lon)]).toEqual([k, Math.floor(k / 4), (k % 4) + 1, Math.floor(k / 9)]);
    }
  });
  it('agrees for the nakshatra boundaries written as k * (360/27)', () => {
    for (let k = 0; k < 27; k++) expect([nakshatraOf(k * (360 / 27)), padaOf(k * (360 / 27))]).toEqual([k, 1]);
  });
  it('never leaves 1..4 just below a boundary', () => {
    for (let k = 1; k <= 108; k++) {
      const lon = (k * 360) / 108 - 1e-12;
      expect(padaOf(lon)).toBe(((k - 1) % 4) + 1);
      expect(nakshatraOf(lon)).toBe(Math.floor((k - 1) / 4));
    }
  });
  it('returns positive zero', () => {
    expect(Object.is(norm360(-0), 0)).toBe(true);
    expect(Object.is(norm360(-360), 0)).toBe(true);
    expect(Object.is(signOf(-0), 0)).toBe(true);
  });
});

describe('option validation', () => {
  it('rejects an unknown ayanamsha with a typed error, including inherited property names', () => {
    for (const name of ['toString', 'constructor', 'nope', 'Lahiri']) {
      expect(() => resolveOptions({ ayanamsha: name as never })).toThrow(InvalidOptionError);
      expect(() => computePositions(fake, { jdUt: jd, latitude: 10, longitudeEast: 20 }, { ayanamsha: name as never })).toThrow(InvalidOptionError);
      expect(() => ayanamshaPl9(fake, jd, name as never)).toThrow(InvalidOptionError);
    }
  });
  it('rejects a non-finite offset with a typed error', () => {
    expect(() => resolveOptions({ ayanamshaOffsetDegrees: Number.NaN })).toThrow(InvalidOptionError);
    expect(() => ayanamshaPl9(fake, jd, 'lahiri', Number.NaN)).toThrow(InvalidOptionError);
  });
  it('treats an explicit undefined as "use the default"', () => {
    expect(resolveOptions({ node: undefined, ayanamsha: undefined }).ayanamsha).toBe('lahiri');
  });
});

describe('verified flag and latitude', () => {
  it('is false above the highest latitude checked against PL9', () => {
    // Near an equinox, where the sunrise search settles at any latitude below the polar circle.
    const equinox = julianDayUt(2000, 3, 20, 12);
    expect(computePositions(fakeSky, { jdUt: equinox, latitude: 65, longitudeEast: 0 }).verified).toBe(true);
    expect(computePositions(fakeSky, { jdUt: equinox, latitude: 65.2, longitudeEast: 0 }).verified).toBe(false);
    expect(computePositions(fakeSky, { jdUt: equinox, latitude: -65.2, longitudeEast: 0 }).verified).toBe(false);
  });
});

describe('lagnaLongitude called directly', () => {
  it('throws a typed error instead of returning NaN', () => {
    expect(() => lagnaLongitude(fake, Number.NaN, 10, 20, 24)).toThrow(InvalidInputError);
    expect(() => lagnaLongitude(fake, Number.POSITIVE_INFINITY, 10, 20, 24)).toThrow(InvalidInputError);
    expect(() => lagnaLongitude(fake, jd, 10, Number.NaN, 24)).toThrow(InvalidInputError);
    expect(() => lagnaLongitude(fake, jd, 10, 20, Number.NaN)).toThrow(InvalidInputError);
  });
});

describe('core does not load the ephemeris implementation', () => {
  it('imports only types from the package root', () => {
    const src = join(dirname(fileURLToPath(import.meta.url)), '../src');
    const files = readdirSync(src, { recursive: true, withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.ts'));
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) {
      const text = readFileSync(join(f.parentPath, f.name), 'utf8');
      expect(text, f.name).not.toMatch(/^import (?!type )[^;]*from '@reverse\/ephemeris';/m);
    }
  });
});
