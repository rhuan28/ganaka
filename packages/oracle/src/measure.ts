import type { Body, Ephemeris } from '@reverse/ephemeris';
import { arcsecDiff, norm360 } from './angles';
import type { Fixture } from './fixtures';

export const MEASURED: readonly { field: string; body: Body }[] = [
  { field: 'sun', body: 'sun' }, { field: 'moon', body: 'moon' }, { field: 'mars', body: 'mars' },
  { field: 'mercury', body: 'mercury' }, { field: 'jupiter', body: 'jupiter' }, { field: 'venus', body: 'venus' },
  { field: 'saturn', body: 'saturn' }, { field: 'rahu', body: 'trueNode' },
];
const SLOW = ['sun', 'mars', 'jupiter', 'saturn'];

export function median(values: number[]): number {
  if (values.length === 0) throw new Error('median of an empty list');
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export interface ChartMeasure {
  chartId: string;
  year: number;
  /** Median of PL9 - Swiss over the slow bodies, arcseconds. */
  offset: number;
  /** PL9 - Swiss - offset, arcseconds, per field. */
  residual: Record<string, number>;
}

export function measureChart(eph: Ephemeris, fx: Fixture): ChartMeasure {
  const jd = fx.input.jdUt;
  const raw: Record<string, number> = {};
  for (const { field, body } of MEASURED) {
    const swiss = norm360(eph.lahiriSiderealReference(jd, body));
    raw[field] = arcsecDiff(fx.pl9.longitudes[field]!, swiss);
  }
  const offset = median(SLOW.map((f) => raw[f]!));
  const residual: Record<string, number> = {};
  for (const { field } of MEASURED) residual[field] = raw[field]! - offset;
  return { chartId: fx.id, year: Math.floor(2000 + (jd - 2451544.5) / 365.2425), offset, residual };
}

export function byDecade(rows: { chartId: string; year: number; offset: number; residual: Record<string, number> }[]) {
  const groups = new Map<number, typeof rows>();
  for (const r of rows) {
    const d = Math.floor(r.year / 10) * 10;
    groups.set(d, [...(groups.get(d) ?? []), r]);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([decade, list]) => {
    const maxAbsResidual: Record<string, number> = {};
    for (const r of list) {
      for (const [field, v] of Object.entries(r.residual)) {
        maxAbsResidual[field] = Math.max(maxAbsResidual[field] ?? 0, Math.abs(v));
      }
    }
    return { decade, charts: list.length, medianOffset: median(list.map((r) => r.offset)), maxAbsResidual };
  });
}

const FIT_BODIES: Body[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export interface ChartFit {
  chartId: string;
  year: number;
  /** Angular shift common to the seven bodies, arcseconds. */
  offset: number;
  /** Time shift, seconds: PL9 matches the reference evaluated this much later. */
  dtSeconds: number;
  /** Largest absolute difference the two parameters leave unexplained, arcseconds. */
  maxResidual: number;
}

/**
 * Least-squares fit of (PL9 - reference) for Sun to Saturn to `offset + speed * dt`.
 * A difference in Delta T shows up as a common dt; a difference in ayanamsha as a common offset.
 */
export function fitChart(eph: Ephemeris, fx: Fixture): ChartFit {
  const jd = fx.input.jdUt;
  const y = FIT_BODIES.map((b) => arcsecDiff(fx.pl9.longitudes[b]!, norm360(eph.lahiriSiderealReference(jd, b))));
  const v = FIT_BODIES.map((b) => (eph.tropical(jd, b).longitudeSpeed * 3600) / 86400); // arcseconds per second
  const n = y.length;
  const sv = v.reduce((s, x) => s + x, 0);
  const sy = y.reduce((s, x) => s + x, 0);
  const svv = v.reduce((s, x) => s + x * x, 0);
  const svy = v.reduce((s, x, i) => s + x * y[i]!, 0);
  const dtSeconds = (n * svy - sv * sy) / (n * svv - sv * sv);
  const offset = (sy - dtSeconds * sv) / n;
  const maxResidual = Math.max(...y.map((yi, i) => Math.abs(yi - offset - dtSeconds * v[i]!)));
  return { chartId: fx.id, year: Math.floor(2000 + (jd - 2451544.5) / 365.2425), offset, dtSeconds, maxResidual };
}

const PLANET_FIELDS = MEASURED.map((m) => m.field).filter((f) => f !== 'rahu');

/** Largest absolute residual from Sun to Saturn. Throws rather than let a gate pass on nothing or on NaN. */
export function worstPlanetaryResidual(rows: ChartMeasure[]): number {
  if (rows.length === 0) throw new Error('no charts were measured');
  let worst = 0;
  for (const r of rows) {
    for (const f of PLANET_FIELDS) {
      const v = r.residual[f];
      if (v === undefined) continue;
      if (!Number.isFinite(v)) throw new Error(`${r.chartId}: residual of ${f} is not finite`);
      worst = Math.max(worst, Math.abs(v));
    }
  }
  return worst;
}

export const HANDWRITTEN_MARKER = '## Reading';

/** Puts a regenerated report in front of the hand-written section of the existing one, if any. */
export function mergeReport(generated: string, existing: string | null): string {
  const at = existing === null ? -1 : existing.indexOf(HANDWRITTEN_MARKER);
  if (existing === null || at < 0) return generated;
  return `${generated.trimEnd()}

${existing.slice(at)}`;
}
