import { describe, expect, it } from 'vitest';
import type { Pl9Export } from '../src/birthdat';
import { buildFixtures, toFixture } from '../src/fixtures';
import type { ChartSpec } from '../src/pl9xml';

const prov = { program: "Parashara's Light 9.0", ayanamsha: 'Lahiri', method: 'Research → Export Birth Chart', extractedOn: '2026-10-12' };
const spec: ChartSpec = { id: 'ref-0001', jdUt: 2457936.1234567, latitude: -33.9, longitudeEast: 151.2, kind: 'random', note: '' };
const exp = (over: Partial<Pl9Export> = {}): Pl9Export => ({
  name: 'REF 0001', julianDay: 2457936.1234567, longitudeWest: -151.2, latitude: -33.9, longitudes: { sun: 10, lagna: 20 }, ...over,
});

describe('toFixture', () => {
  it('joins the requested chart with what PL9 exported', () => {
    const fx = toFixture(spec, exp(), prov);
    expect(fx.id).toBe('ref-0001');
    expect(fx.input).toEqual({ jdUt: 2457936.1234567, latitude: -33.9, longitudeEast: 151.2 });
    expect(fx.pl9.longitudes).toEqual({ sun: 10, lagna: 20 });
    expect(fx.provenance).toEqual(prov);
  });
  it('refuses an export whose Julian day differs from the request', () => {
    expect(() => toFixture(spec, exp({ julianDay: 2457936.1244567 }), prov)).toThrow(/ref-0001.*Julian day/);
  });
  it('refuses an export whose longitude or latitude differs from the request', () => {
    expect(() => toFixture(spec, exp({ longitudeWest: 151.2 }), prov)).toThrow(/ref-0001.*longitude/);
    expect(() => toFixture(spec, exp({ latitude: 33.9 }), prov)).toThrow(/ref-0001.*latitude/);
  });
  it('tolerates the rounding of the seven-decimal chart file', () => {
    expect(() => toFixture(spec, exp({ julianDay: 2457936.12345674, longitudeWest: -151.2000003 }), prov)).not.toThrow();
  });
});

describe('buildFixtures', () => {
  const spec2: ChartSpec = { ...spec, id: 'ref-0002' };
  it('uses the last export of each chart and reports charts with no export', () => {
    const first = exp({ longitudes: { sun: 1 } });
    const last = exp({ longitudes: { sun: 2 } });
    const { fixtures, missing } = buildFixtures([spec, spec2], [first, last], prov);
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0]!.pl9.longitudes.sun).toBe(2);
    expect(missing).toEqual(['ref-0002']);
  });
  it('ignores exported charts that are not in the reference set', () => {
    const { fixtures } = buildFixtures([spec], [exp(), exp({ name: 'Chesta 2017' })], prov);
    expect(fixtures).toHaveLength(1);
  });
});
