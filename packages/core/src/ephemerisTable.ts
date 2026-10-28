import type { Ephemeris } from '@reverse/ephemeris';
import { InvalidInputError } from './errors';
import { resolveOptions, type CoreOptions } from './options';
import { ALL_POINTS, computePositions, type ChartInput, type Missing, type PointName, type PointPosition } from './positions';

/**
 * PL9's "Export Ephemeris" (Research menu): the longitudes of the points from one instant to another at a fixed
 * step. The positions are those of a chart at each instant (computePositions), at one place, which only the Lagna and
 * the points counted from the sunrise depend on.
 */

/** The nine and the three outer planets, when no points are asked. */
export const EPHEMERIS_DEFAULT_POINTS: readonly PointName[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'uranus', 'neptune', 'pluto'];
/** The most rows one table gives: each row is a chart's positions. */
export const EPHEMERIS_MAX_ROWS = 2000;
/** The shortest step, in days (one minute). */
export const EPHEMERIS_MIN_STEP_DAYS = 1 / 1440;

export interface EphemerisRequest {
  /** The first instant and the place (the place matters only for the Lagna, Gulika, Prana Pada and Mandi). */
  from: ChartInput;
  /** The last instant, Julian day UT; the table stops at the last step not past it. */
  toJdUt: number;
  stepDays: number;
  points?: readonly PointName[];
}

export interface EphemerisRow {
  jdUt: number;
  /** A point not defined at this instant and place is left out; see `missing`. */
  points: Partial<Record<PointName, PointPosition>>;
  missing: Missing[];
}

export interface EphemerisTable {
  ayanamsha: string;
  points: PointName[];
  rows: EphemerisRow[];
}

export function ephemerisTable(eph: Ephemeris, req: EphemerisRequest, options?: Partial<CoreOptions>): EphemerisTable {
  const { from, toJdUt, stepDays } = req;
  const points = [...(req.points ?? EPHEMERIS_DEFAULT_POINTS)];
  if (points.length === 0) throw new InvalidInputError('points must not be empty');
  const unknown = points.filter((p) => !ALL_POINTS.includes(p));
  if (unknown.length) throw new InvalidInputError(`unknown points: ${unknown.join(', ')}`);
  if (!Number.isFinite(toJdUt) || toJdUt < from.jdUt) throw new InvalidInputError('the last instant must not be before the first');
  // A step written to a few decimals of a day (0.000694 for a minute) still counts as a minute.
  if (!Number.isFinite(stepDays) || stepDays < EPHEMERIS_MIN_STEP_DAYS * (1 - 1e-3)) throw new InvalidInputError('the step must be at least one minute');
  // A hair of tolerance, so that a range of whole steps keeps its last row despite the rounding of Julian days.
  const count = Math.floor((toJdUt - from.jdUt) / stepDays + 1e-9) + 1;
  if (count > EPHEMERIS_MAX_ROWS) throw new InvalidInputError(`the table would have ${count} rows; the most is ${EPHEMERIS_MAX_ROWS}`);
  const rows: EphemerisRow[] = [];
  for (let i = 0; i < count; i++) {
    const jdUt = from.jdUt + i * stepDays;
    const pos = computePositions(eph, { ...from, jdUt }, options);
    const shown = Object.fromEntries(points.filter((p) => p in pos.points).map((p) => [p, pos.points[p as keyof typeof pos.points]]));
    rows.push({ jdUt, points: shown, missing: pos.missing.filter((m) => (points as string[]).includes(m.what)) });
  }
  return { ayanamsha: resolveOptions(options).ayanamsha, points, rows };
}
