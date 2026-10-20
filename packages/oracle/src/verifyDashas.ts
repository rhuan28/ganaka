import type { DashaPeriod, DashaSystem } from '@reverse/core';
import { decodeDasha, type DashaFixture, type ShownDasha } from './dashaTables';

/**
 * A start shown to the day may fall this far outside the day shown, in days: about 2% of PL9's dates sit an hour
 * or so across midnight from where the rule puts them, unexplained. See the plan of stage 3A, "Limite medido".
 */
export const DAY_EDGE_SLACK = 0.06;
/** A start shown to the minute: the core's instant lies within the minute shown, which PL9 truncates. */
const MINUTE = 1 / 1440;
/**
 * Or up to a minute either side of it, if every start of the chart is shifted alike: at the level of the sookshmas a
 * minute is about 0.005" of the Moon, below what the core and PL9 agree to. The starts of a chart to the minute
 * have to fit inside one minute once shifted by a single amount.
 */
const MINUTE_SHIFT = 1 / 1440;
/** Rounding of the sums of periods, in days (about 4 seconds). */
const ROUNDING = 5e-5;

export interface DashaFailure { system: DashaSystem; path: string; shown: string; computedJd: number; offDays: number }
export interface SystemTally { periods: number; failures: number; atLimit: number }
export interface DashaVerdict { chartId: string; checked: number; failures: DashaFailure[]; bySystem: Partial<Record<DashaSystem, SystemTally>> }

/** The Julian day (UT) of a start as shown, on a clock `utcOffsetHours` ahead of UT. */
export function shownJd(start: string, utcOffsetHours = 0): number {
  const m = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?$/.exec(start);
  if (!m) throw new Error(`"${start}" is not a shown start`);
  const [y, mo, d, hh = '0', mm = '0'] = m.slice(1).map((x) => x ?? '0') as string[];
  const a = Math.floor((14 - Number(mo)) / 12), yy = Number(y) + 4800 - a, mon = Number(mo) + 12 * a - 3;
  const jdn = Number(d) + Math.floor((153 * mon + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return jdn - 0.5 + (Number(hh) + Number(mm) / 60 - utcOffsetHours) / 24;
}

/** How far an instant lies outside the interval a shown start stands for, in days; 0 inside it. */
export function outside(jd: number, shown: ShownDasha, utcOffsetHours = 0): number {
  const from = shownJd(shown.start, utcOffsetHours);
  const to = from + (shown.precision === 'day' ? 1 : MINUTE);
  return jd < from - ROUNDING ? from - jd : jd >= to + ROUNDING ? jd - to : 0;
}

/** Every period down the path, in every cycle given. */
function findAll(periods: DashaPeriod[], path: readonly string[]): DashaPeriod[] {
  const [lord, ...rest] = path;
  return periods.filter((p) => p.lord === lord).flatMap((p) => (rest.length ? findAll(p.sub ?? [], rest) : [p]));
}

/**
 * Checks PL9's printed starts against the periods `periodsOf` gives for each system, which must cover every cycle
 * the starts fall in: a start is matched with the period of its path that begins nearest to it.
 */
export function verifyDashas(fixture: DashaFixture, periodsOf: (system: DashaSystem) => DashaPeriod[], utcOffsetHours = 0): DashaVerdict {
  const verdict: DashaVerdict = { chartId: fixture.id, checked: 0, failures: [], bySystem: {} };
  const computed = new Map<DashaSystem, DashaPeriod[]>();
  const shifts = new Map<DashaSystem, { min: number; max: number; path: string }>();
  for (const shown of fixture.pl9.dashas.map(decodeDasha)) {
    let periods = computed.get(shown.system);
    if (!periods) {
      periods = periodsOf(shown.system);
      computed.set(shown.system, periods);
    }
    const tally = (verdict.bySystem[shown.system] ??= { periods: 0, failures: 0, atLimit: 0 });
    tally.periods++;
    verdict.checked++;
    const at = shownJd(shown.start, utcOffsetHours);
    const candidates = findAll(periods, shown.path);
    const jd = candidates.length ? candidates.reduce((best, p) => (Math.abs(p.start - at) < Math.abs(best - at) ? p.start : best), candidates[0]!.start) : NaN;
    const off = candidates.length ? outside(jd, shown, utcOffsetHours) : Infinity;
    const accepted = off === 0 || off < (shown.precision === 'day' ? DAY_EDGE_SLACK : MINUTE_SHIFT);
    if (accepted && shown.precision === 'minute') {
      // Where the shift of the minutes is measured: the ones refused on their own stay out of it.
      const diff = jd - at;
      const s = shifts.get(shown.system) ?? { min: Infinity, max: -Infinity, path: shown.path.join('-') };
      shifts.set(shown.system, { min: Math.min(s.min, diff), max: Math.max(s.max, diff), path: s.path });
    }
    if (off === 0) continue;
    if (accepted) {
      tally.atLimit++;
      continue;
    }
    tally.failures++;
    verdict.failures.push({ system: shown.system, path: shown.path.join('-'), shown: shown.start, computedJd: jd, offDays: off });
  }
  for (const [system, s] of shifts) {
    if (s.max - s.min < MINUTE + ROUNDING) continue;
    verdict.bySystem[system]!.failures++;
    verdict.failures.push({ system, path: `${s.path} (spread)`, shown: '', computedJd: NaN, offDays: s.max - s.min - MINUTE });
  }
  return verdict;
}

/** How many whole cycles from birth reach the latest start of a fixture, with one to spare. */
export function cyclesToCover(fixture: DashaFixture, system: DashaSystem, jdUt: number, cycleDays: number): number {
  const latest = Math.max(jdUt, ...fixture.pl9.dashas.map(decodeDasha).filter((d) => d.system === system).map((d) => shownJd(d.start)));
  return Math.min(20, Math.ceil((latest - jdUt) / cycleDays) + 2);
}
