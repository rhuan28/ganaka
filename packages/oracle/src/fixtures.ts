import type { Pl9Export } from './birthdat';
import { pl9Name, type ChartSpec } from './pl9xml';

export interface Provenance {
  program: string;
  ayanamsha: string;
  method: string;
  extractedOn: string;
}

export interface Fixture {
  id: string;
  kind: string;
  input: { jdUt: number; latitude: number; longitudeEast: number };
  pl9: { longitudes: Record<string, number> };
  provenance: Provenance;
}

const JD_TOLERANCE = 1e-6;
const DEGREE_TOLERANCE = 1e-5;

export function toFixture(spec: ChartSpec, exp: Pl9Export, provenance: Provenance): Fixture {
  const fail = (what: string, wanted: number, got: number) => {
    throw new Error(`${spec.id}: exported ${what} ${got} does not match the requested ${wanted}`);
  };
  if (Math.abs(exp.julianDay - spec.jdUt) > JD_TOLERANCE) fail('Julian day', spec.jdUt, exp.julianDay);
  if (Math.abs(-exp.longitudeWest - spec.longitudeEast) > DEGREE_TOLERANCE) fail('longitude (east)', spec.longitudeEast, -exp.longitudeWest);
  if (Math.abs(exp.latitude - spec.latitude) > DEGREE_TOLERANCE) fail('latitude', spec.latitude, exp.latitude);
  return {
    id: spec.id,
    kind: spec.kind,
    input: { jdUt: spec.jdUt, latitude: spec.latitude, longitudeEast: spec.longitudeEast },
    pl9: { longitudes: { ...exp.longitudes } },
    provenance,
  };
}

export function buildFixtures(
  specs: ChartSpec[],
  exports: Pl9Export[],
  provenance: Provenance,
): { fixtures: Fixture[]; missing: string[] } {
  const byName = new Map<string, Pl9Export>();
  for (const e of exports) byName.set(e.name, e); // the last export of a chart wins
  const fixtures: Fixture[] = [];
  const missing: string[] = [];
  for (const spec of specs) {
    const e = byName.get(pl9Name(spec));
    if (e) fixtures.push(toFixture(spec, e, provenance));
    else missing.push(spec.id);
  }
  return { fixtures, missing };
}
