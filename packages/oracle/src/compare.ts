import { arcsecDiff } from './angles';

export interface FieldDiff {
  chartId: string;
  field: string;
  expected: number;
  actual: number;
  /** actual - expected along the shortest arc. */
  arcsec: number;
}

export function compareLongitudes(
  chartId: string,
  expected: Record<string, number>,
  actual: Record<string, number>,
): FieldDiff[] {
  return Object.entries(actual).map(([field, value]) => {
    const ref = expected[field];
    if (ref === undefined) throw new Error(`${chartId}: no reference value for computed field "${field}"`);
    return { chartId, field, expected: ref, actual: value, arcsec: arcsecDiff(value, ref) };
  });
}

export function summarize(diffs: FieldDiff[], toleranceArcsec: number) {
  const maxAbsByField: Record<string, number> = {};
  const failures: FieldDiff[] = [];
  for (const d of diffs) {
    const abs = Math.abs(d.arcsec);
    maxAbsByField[d.field] = Math.max(maxAbsByField[d.field] ?? 0, abs);
    if (!(abs <= toleranceArcsec)) failures.push(d); // NaN counts as a failure
  }
  return { total: diffs.length, failed: failures.length, maxAbsByField, failures };
}
