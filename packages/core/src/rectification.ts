import type { Ephemeris } from '@reverse/ephemeris';
import { computeDashas, type DashaSystem } from './dashas/compute';
import { NAKSHATRA_DASHA_SYSTEMS } from './dashas/systems';
import { dashaYearDays, type DashaPeriod } from './dashas/engine';
import { InvalidInputError } from './errors';
import { resolveOptions, type CoreOptions } from './options';
import { computePositions, type ChartInput } from './positions';
import { CLASSICAL_VARGAS, vargaSign } from './vargas';
import { norm360 } from './zodiac';

/**
 * PL9's Rectification Tool and the Lagna's own steps (docs/spec/rectification.md): the birth moved step by step with
 * the Lagna's sign and the dasha running at each event; the instants the time tool jumps to with its "Ascendant" and
 * "Navamsha" buttons; and the time a varga's Lagna stays in its sign (PL9's varga headers).
 */

/** The steps of PL9's zoom levels, seconds: hourly, 15 minutes, 5 minutes, 1 minute, 15 seconds, 1 second. */
export const RECTIFICATION_STEPS = [3600, 900, 300, 60, 15, 1] as const;
/** The dasha levels PL9's "automatic" shows at each zoom level. */
const AUTOMATIC_LEVELS = [3, 3, 4, 4, 5, 5];
/** PL9's year for the dasha's shift (read in PL9). */
const YEAR = 365.2421875;
const NAKSHATRA = 40 / 3;
/** The systems whose periods are not the table's years (none so far): their scale. */
const NAKSHATRA_SCALE: Partial<Record<string, number>> = {};

export interface RectificationOptions {
  /** The zoom level, 0 (hourly) to 5 (one second). */
  zoom?: number;
  /** Rows before and after the birth's: PL9's tool 8 and 10, its printout 23 and 25. */
  before?: number;
  after?: number;
  /** The instants of the events, Julian days UT. */
  events?: number[];
  system?: DashaSystem;
  /** 1 to 5; PL9's "automatic" by default (3, 3, 4, 4, 5, 5 by zoom). */
  levels?: number;
}
export interface RectificationRow {
  /** Steps from the birth, and the moved instant. */
  offset: number;
  jdUt: number;
  /** The Lagna's sign at the moved instant, 1 (Aries) to 12; the Navamsha's from the 5-minute step down. */
  lagnaSign: number | null;
  navamshaSign: number | null;
  /** At each event, the lords of the periods running, mahadasha first. */
  dashas: string[][];
}
export interface Rectification { step: number; levels: number; rows: RectificationRow[] }

/** The lords of the periods running at an instant, down the levels; before the table, its first period at each. */
function chainAt(periods: readonly DashaPeriod[], jdUt: number): string[] {
  if (periods.length && jdUt < periods[0]!.start) jdUt = periods[0]!.start;
  const out: string[] = [];
  let level: readonly DashaPeriod[] | undefined = periods;
  while (level?.length) {
    const p: DashaPeriod | undefined = level.find((x) => x.start <= jdUt && jdUt < x.end);
    if (!p) break;
    out.push(p.lord);
    level = p.sub;
  }
  return out;
}

/**
 * The Rectification Tool's table (read in PL9). Each row moves the birth by its steps and takes the Lagna's sign
 * there; the dasha is not computed again for the moved birth: PL9 reads the birth's own table at the event moved by
 * the steps times the dasha years the Moon covers in a day (the years of the birth mahadasha × 365.2421875 × the
 * Moon's speed / 13°20'), keeping the birth's lord even where the Moon would change nakshatra.
 */
export function computeRectification(eph: Ephemeris, input: ChartInput, options: RectificationOptions = {}, coreOptions?: Partial<CoreOptions>): Rectification {
  const core = resolveOptions(coreOptions);
  const zoom = Math.min(5, Math.max(0, Math.trunc(options.zoom ?? 0)));
  const step = RECTIFICATION_STEPS[zoom]!;
  const levels = options.levels ?? AUTOMATIC_LEVELS[zoom]!;
  if (!(Number.isInteger(levels) && levels >= 1 && levels <= 5)) throw new InvalidInputError('levels must be a whole number from 1 to 5');
  const before = options.before ?? 8, after = options.after ?? 10;
  if (![before, after].every((n) => Number.isInteger(n) && n >= 0 && n <= 100)) throw new InvalidInputError('before and after must be whole numbers from 0 to 100');
  const events = options.events ?? [];
  if (!events.every(Number.isFinite) || events.length > 100) throw new InvalidInputError('events must be at most 100 Julian days');
  const system = options.system ?? 'vimshottari';
  if (!(NAKSHATRA_DASHA_SYSTEMS as readonly string[]).includes(system)) throw new InvalidInputError(`the Rectification Tool reads a nakshatra dasha, not ${system}`);
  if (events.some((e) => Math.abs(e - input.jdUt) > 400 * 365.25)) throw new InvalidInputError('events must lie within 400 years of the birth');
  const moonSpeed = computePositions(eph, input, core).points.moon.longitudeSpeed;
  if (moonSpeed === undefined) throw new InvalidInputError('the Moon has no speed at this instant');
  // The years of the mahadasha running at birth (the lord of the birth Moon's nakshatra), and the days of the dasha
  // passed per day the birth moves.
  const one = computeDashas(eph, input, { system, levels: 1, cycles: 1 }, core);
  const first = one.periods.find((p) => p.start <= input.jdUt && input.jdUt < p.end) ?? one.periods[0]!;
  const years = (first.end - first.start) / dashaYearDays(one.options.yearDays, core.fidelity) / (NAKSHATRA_SCALE[system] ?? 1);
  const factor = (years * YEAR * moonSpeed) / NAKSHATRA;
  // As many cycles as reach the latest event moved by the farthest row (an old chart's "today" lies past 120 years).
  const span = one.periods.at(-1)!.end - one.periods[0]!.start;
  const reach = Math.max(input.jdUt, ...events) + (Math.max(before, after) * step / 86400) * Math.abs(factor) - one.periods[0]!.start;
  const cycles = Math.min(20, Math.max(1, Math.ceil(reach / span) + 1));
  const periods = computeDashas(eph, input, { system, levels: levels as 1 | 2 | 3 | 4 | 5, cycles }, core).periods;
  const rows: RectificationRow[] = [];
  for (let k = -before; k <= after; k++) {
    const jdUt = input.jdUt + (k * step) / 86400;
    const lagna = computePositions(eph, { ...input, jdUt }, core).points.lagna?.longitude;
    rows.push({
      offset: k, jdUt,
      lagnaSign: lagna === undefined ? null : Math.floor(norm360(lagna) / 30) + 1,
      navamshaSign: lagna === undefined || step > 300 ? null : vargaSign(lagna, 'D9', core.fidelity) + 1,
      dashas: events.map((e) => chainAt(periods, e + ((k * step) / 86400) * factor)),
    });
  }
  return { step, levels, rows };
}

/**
 * The Lagna's rate as PL9 takes it: five minutes of time over the arc the Lagna covers in them, days per degree. `of`
 * gives the longitude to time (the Lagna's, or its place in a varga).
 */
function rate(of: (jd: number) => number, jdUt: number, seconds: number): number {
  const arc = norm360(of(jdUt + seconds / 86400) - of(jdUt));
  return seconds / 86400 / (arc > 180 ? arc - 360 : arc);
}

/**
 * Where PL9's time tool jumps with its "Ascendant" and "Navamsha" buttons (read in PL9), by one straight line at the
 * Lagna's rate, no search: Ascendant forward to 5° into the next sign, back to 25° into the previous one; Navamsha to a
 * quarter degree of the Lagna past the end (or before the start) of its navamsha.
 */
export function lagnaStep(eph: Ephemeris, input: ChartInput, kind: 'ascendant' | 'navamsha', direction: 1 | -1, coreOptions?: Partial<CoreOptions>): number {
  const core = resolveOptions(coreOptions);
  const lagnaAt = (jd: number) => {
    const l = computePositions(eph, { ...input, jdUt: jd }, core).points.lagna;
    if (!l) throw new InvalidInputError('there is no Lagna at this latitude');
    return l.longitude;
  };
  const r = rate(lagnaAt, input.jdUt, 300);
  if (kind === 'ascendant') {
    const g = norm360(lagnaAt(input.jdUt)) % 30;
    return input.jdUt + (direction === 1 ? 35 - g : -(5 + g)) * r;
  }
  const w = vargaWindow(eph, input, 'D9', core);
  return direction === 1 ? w.end + 0.25 * r : w.start - 0.25 * r;
}

/**
 * The classical vargas whose sign is the part the longitude falls in, counted on through the zodiac (longitude × N):
 * for them the time in the part is the time in the sign. The others (the Hora, the Drekkana, the Trimshamsha …) give
 * their parts signs by rules of their own and have no window here (PL9's header for them was not checked).
 */
export const WINDOW_VARGAS: readonly string[] = CLASSICAL_VARGAS.filter((v) => {
  const n = Number(v.slice(1));
  for (let l = 0.005; l < 360; l += 0.01) if (vargaSign(l, v) !== Math.floor(norm360(l * n) / 30)) return false;
  return true;
});

/**
 * The time a varga's Lagna stays in its sign around the birth, as PL9's varga headers show it (read in PL9): by a
 * straight line at the rate of the Lagna's place in the varga, measured 30 seconds later (in the first half of the sign)
 * or earlier. The D1 has none: both ends are the birth.
 */
export function vargaWindow(eph: Ephemeris, input: ChartInput, varga: string, coreOptions?: Partial<CoreOptions>): { start: number; end: number } {
  const core = resolveOptions(coreOptions);
  const parts = Number(varga.slice(1));
  if (!/^D\d+$/.test(varga) || !(parts >= 1)) throw new InvalidInputError(`unknown varga "${varga}"`);
  if (!(WINDOW_VARGAS as readonly string[]).includes(varga)) throw new InvalidInputError(`${varga}'s signs do not follow its parts: no window`);
  if (parts === 1) return { start: input.jdUt, end: input.jdUt };
  const inVarga = (jd: number) => {
    const l = computePositions(eph, { ...input, jdUt: jd }, core).points.lagna;
    if (!l) throw new InvalidInputError('there is no Lagna at this latitude');
    return norm360(l.longitude * parts);
  };
  const g = inVarga(input.jdUt) % 30;
  const r = rate(inVarga, input.jdUt, g <= 15 ? 30 : -30);
  const start = input.jdUt - g * r;
  return { start, end: start + 30 * r };
}
