import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { arcsecDiff } from '../src/angles';
import { EXPORT_POINTS } from '../src/birthdat';
import type { Fixture } from '../src/fixtures';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures');
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Fixture);

describe('reference fixtures', () => {
  it('cover at least 370 of the 380 reference charts', () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(370);
  });
  it('carry the twenty exported longitudes, each in [0, 360)', () => {
    for (const fx of fixtures) {
      expect(Object.keys(fx.pl9.longitudes)).toEqual([...EXPORT_POINTS]);
      for (const v of Object.values(fx.pl9.longitudes)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(360);
      }
    }
  });
  it('have Ketu opposite Rahu', () => {
    for (const fx of fixtures) {
      expect(Math.abs(arcsecDiff(fx.pl9.longitudes.ketu!, fx.pl9.longitudes.rahu! + 180))).toBeLessThan(0.001);
    }
  });
  it('have Dhuma at the Sun plus 133 degrees 20 minutes', () => {
    for (const fx of fixtures) {
      expect(Math.abs(arcsecDiff(fx.pl9.longitudes.dhuma!, fx.pl9.longitudes.sun! + 133 + 20 / 60))).toBeLessThan(0.001);
    }
  });
});

import type { ChartSpec } from '../src/pl9xml';

const specs = JSON.parse(readFileSync(resolve(dir, '../refset.json'), 'utf8')) as ChartSpec[];
const byId = new Map(fixtures.map((f) => [f.id, f]));

describe('reference fixtures against the reference set', () => {
  it('cover every chart of the reference set with the requested input', () => {
    expect(fixtures).toHaveLength(specs.length);
    for (const s of specs) {
      expect(byId.get(s.id)?.input).toEqual({ jdUt: s.jdUt, latitude: s.latitude, longitudeEast: s.longitudeEast });
    }
  });
  it('have each sign-edge pair in different signs according to PL9 itself', () => {
    const edges = specs.filter((s) => s.kind === 'sign-edge');
    for (let i = 0; i < edges.length; i += 2) {
      const body = edges[i]!.note.split(' ')[0]!;
      const signs = [edges[i]!, edges[i + 1]!].map((s) => Math.floor(byId.get(s.id)!.pl9.longitudes[body]! / 30));
      expect(signs[0], `${edges[i]!.id} ${body}`).not.toBe(signs[1]);
    }
  });
  it('have each nakshatra-edge pair in different nakshatras according to PL9 itself', () => {
    const edges = specs.filter((s) => s.kind === 'nakshatra-edge');
    for (let i = 0; i < edges.length; i += 2) {
      const n = [edges[i]!, edges[i + 1]!].map((s) => Math.floor(byId.get(s.id)!.pl9.longitudes.moon! / (360 / 27)));
      expect(n[0], edges[i]!.id).not.toBe(n[1]);
    }
  });
});

import { createSwissEphemeris } from '@reverse/ephemeris';
import { fitChart } from '../src/measure';

describe('PL9 against the Swiss Ephemeris, over the whole reference set', () => {
  it('is explained, for Sun to Saturn, by one constant offset and a time shift per chart', async () => {
    const eph = await createSwissEphemeris();
    const fits = fixtures.map((fx) => fitChart(eph, fx));
    eph.close();
    for (const f of fits) {
      expect(f.maxResidual, f.chartId).toBeLessThan(0.001);
      expect(f.offset, f.chartId).toBeGreaterThan(0.137);
      expect(f.offset, f.chartId).toBeLessThan(0.139);
    }
    const quiet = fits.filter((f) => f.year >= 1960 && f.year < 2010);
    for (const f of quiet) expect(Math.abs(f.dtSeconds), f.chartId).toBeLessThan(0.05);
  });
});
