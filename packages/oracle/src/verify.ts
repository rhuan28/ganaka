import { POINTS, nakshatraOf, padaOf, signOf, type Positions } from '@reverse/core';
import { arcsecDiff } from './angles';
import type { Fixture } from './fixtures';

const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;

export interface ChartVerdict {
  chartId: string;
  longitudeFailures: { point: string; arcsec: number }[];
  categoricalFailures: { point: string; what: 'sign' | 'nakshatra' | 'pada'; expected: number; actual: number }[];
  borderCases: { point: string; what: string; distanceArcsec: number }[];
  maxAbsArcsec: Record<string, number>;
}

/** Distance from a longitude to the nearest multiple of `span`, in arcseconds. */
export function distanceToBoundaryArcsec(longitude: number, span: number): number {
  const g = ((longitude % span) + span) % span;
  return Math.min(g, span - g) * 3600;
}

export function verifyChart(fx: Fixture, computed: Positions, toleranceArcsec: number): ChartVerdict {
  const verdict: ChartVerdict = { chartId: fx.id, longitudeFailures: [], categoricalFailures: [], borderCases: [], maxAbsArcsec: {} };
  for (const p of POINTS) {
    const ref = fx.pl9.longitudes[p];
    if (ref === undefined) throw new Error(`${fx.id}: fixture has no value for "${p}"`);
    const got = computed.points[p];
    if (!got) {
      // The fixture has a value and the chart does not: a failure, never a silent skip.
      verdict.maxAbsArcsec[p] = Number.NaN;
      verdict.longitudeFailures.push({ point: p, arcsec: Number.NaN });
      continue;
    }
    const d = arcsecDiff(got.longitude, ref);
    verdict.maxAbsArcsec[p] = Math.abs(d);
    if (!(Math.abs(d) <= toleranceArcsec)) verdict.longitudeFailures.push({ point: p, arcsec: d });

    const checks: { what: 'sign' | 'nakshatra' | 'pada'; expected: number; actual: number; span: number }[] = [
      { what: 'sign', expected: signOf(ref), actual: got.sign, span: 30 },
      { what: 'nakshatra', expected: nakshatraOf(ref), actual: got.nakshatra, span: NAKSHATRA_SPAN },
      { what: 'pada', expected: padaOf(ref), actual: got.pada, span: PADA_SPAN },
    ];
    for (const c of checks) {
      if (c.expected === c.actual) continue;
      const dist = distanceToBoundaryArcsec(ref, c.span);
      // A border case is a boundary falling between two longitudes that agree within the tolerance.
      if (dist < toleranceArcsec && Math.abs(d) <= toleranceArcsec) verdict.borderCases.push({ point: p, what: c.what, distanceArcsec: dist });
      else verdict.categoricalFailures.push({ point: p, what: c.what, expected: c.expected, actual: c.actual });
    }
  }
  return verdict;
}

/** Why a set does not pass the gate, or null when it passes. */
export function setProblem(s: { charts: number; minCharts: number; longitudeFailures: number; categoricalFailures: number }): string | null {
  if (s.charts < s.minCharts) return `${s.charts} mapas, exigidos ${s.minCharts}`;
  if (s.longitudeFailures || s.categoricalFailures) return 'reprovado';
  return null;
}
