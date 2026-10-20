import type { Fidelity } from '../fidelity';
import { norm360 } from '../zodiac';
import { DASHA_SYSTEMS, type DashaLord, type NakshatraDashaSystem } from './systems';

export interface DashaPeriod {
  lord: DashaLord;
  /** Julian days, UT. */
  start: number;
  end: number;
  /** 1 = mahadasha … 5 = prana. */
  level: number;
  sub?: DashaPeriod[];
}

export type DashaYearOption = '365.25' | '360' | '327.85' | '365.2422';

/**
 * Days in a dasha year. PL9's option "365.25" uses 365.2422 kept in single precision, 365.2421875; the corrected mode
 * takes the option at its word. See docs/spec/dashas/nakshatra.md and docs/spec/correcoes.md.
 */
export function dashaYearDays(option: DashaYearOption, fidelity: Fidelity): number {
  if (option === '360') return 360;
  if (option === '327.85') return 327.85;
  if (option === '365.2422') return 365.2422;
  return fidelity === 'pl9' ? 365.2421875 : 365.25;
}

const N = 40 / 3;
const ABHIJIT_START = 276 + 40 / 60;
const ABHIJIT_END = 280 + 53 / 60 + 20 / 3600;
/** Measured on PL9's printed dates: between 280.065° and 280.067°. */
const SHRAVANA_FROM_PL9 = 280 + 4 / 60;

/**
 * The 28 nakshatras of the groups: Abhijit (21) from 276°40' to 280°53'20", Uttara Ashadha (20) shortened to it.
 * Shravana (22) is measured from 280°04' in the pl9 mode, as PL9's dates show, though Abhijit holds its beginning;
 * corrected, from the end of Abhijit.
 */
export function nakshatra28(longitude: number, fidelity: Fidelity): { index: number; from: number; to: number } {
  const lon = norm360(longitude);
  if (lon >= ABHIJIT_START && lon < ABHIJIT_END) return { index: 21, from: ABHIJIT_START, to: ABHIJIT_END };
  const k = Math.floor(lon / N);
  if (k === 20) return { index: 20, from: 20 * N, to: ABHIJIT_START };
  if (k === 21) return { index: 22, from: fidelity === 'pl9' ? SHRAVANA_FROM_PL9 : ABHIJIT_END, to: 22 * N };
  return { index: k < 21 ? k : k + 1, from: k * N, to: (k + 1) * N };
}

/**
 * The part of the arc [from, to) of a nakshatra already gone. By degree, the default, it is the longitude's; PL9's
 * balance "By time" gives it from the instants the point crosses the two ends. PL9 applies it to the systems that
 * count nakshatras only, and keeps the two of groups by degree; the corrected mode applies it to all.
 */
export type ArcFraction = (longitude: number, from: number, to: number) => number;
const byDegree: ArcFraction = (longitude, from, to) => (norm360(longitude) - from) / (to - from);

/** The lord running at a longitude of the Moon (or of the base point), and the part of its period already gone. */
export function startingPoint(
  system: NakshatraDashaSystem,
  longitude: number,
  fidelity: Fidelity,
  fraction: ArcFraction = byDegree,
): { lord: DashaLord; elapsed: number } {
  const def = DASHA_SYSTEMS[system];
  const lon = norm360(longitude);
  if (def.start.kind === 'count') {
    const k = Math.min(26, Math.floor(lon / N));
    const counted = (((def.start.direction * (k - def.start.from)) % 27) + 27) % 27;
    return { lord: def.lords[counted % def.lords.length]!, elapsed: fraction(lon, k * N, (k + 1) * N) };
  }
  const { index, from, to } = nakshatra28(lon, fidelity);
  const g = def.start.groups.findIndex((members) => members.includes(index));
  const members = def.start.groups[g]!;
  // PL9 gives Shravana the first place of Saturn's group in Ashtottari, where it is the fourth.
  const position = system === 'ashtottari' && index === 22 && fidelity === 'pl9' ? 0 : members.indexOf(index);
  // PL9 keeps the balance by degree in the groups, even with "By time" chosen: measured on its printed dates.
  // Corrected, the option applies here too. See docs/spec/correcoes.md.
  const part = fidelity === 'pl9' ? byDegree : fraction;
  return { lord: def.lords[g]!, elapsed: (position + part(lon, from, to)) / members.length };
}

function subdivide(system: NakshatraDashaSystem, period: DashaPeriod, levels: number): void {
  if (period.level >= levels) return;
  const def = DASHA_SYSTEMS[system];
  const total = def.years.reduce((s, y) => s + y, 0);
  const first = def.lords.indexOf(period.lord);
  const length = period.end - period.start;
  const sub: DashaPeriod[] = [];
  let t = period.start;
  for (let i = 0; i < def.lords.length; i++) {
    const j = (first + i) % def.lords.length;
    const end = i === def.lords.length - 1 ? period.end : t + (length * def.years[j]!) / total;
    const child: DashaPeriod = { lord: def.lords[j]!, start: t, end, level: period.level + 1 };
    subdivide(system, child, levels);
    sub.push(child);
    t = end;
  }
  period.sub = sub;
}

/**
 * Whole cycles of mahadashas (`cycles`, one by default), from the one running at birth, each divided down to `levels`
 * (1 to 5). The first began before birth by the part already gone; the next cycles repeat the sequence whole. See docs/spec/dashas/nakshatra.md.
 */
export function nakshatraDashas(
  system: NakshatraDashaSystem,
  longitude: number,
  jdUt: number,
  opts: { yearDays: number; levels: 1 | 2 | 3 | 4 | 5; fraction?: ArcFraction; cycles?: number },
  fidelity: Fidelity,
): DashaPeriod[] {
  const def = DASHA_SYSTEMS[system];
  const { lord, elapsed } = startingPoint(system, longitude, fidelity, opts.fraction);
  const first = def.lords.indexOf(lord);
  const days = (j: number) => def.years[j]! * def.scale * opts.yearDays;
  let t = jdUt - elapsed * days(first);
  const out: DashaPeriod[] = [];
  for (let i = 0; i < def.lords.length * (opts.cycles ?? 1); i++) {
    const j = (first + i) % def.lords.length;
    const period: DashaPeriod = { lord: def.lords[j]!, start: t, end: t + days(j), level: 1 };
    subdivide(system, period, opts.levels);
    out.push(period);
    t = period.end;
  }
  return out;
}
