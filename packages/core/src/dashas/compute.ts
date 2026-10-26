import type { Ephemeris } from '@reverse/ephemeris';
import { InvalidOptionError } from '../errors';
import type { Fidelity } from '../fidelity';
import { LagnaUndefinedError } from '../lagna';
import { NotImplementedOptionError, resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { VARGAS, type VargaName } from '../vargas';
import { dashaYearDays, nakshatraDashas, type ArcFraction, type DashaPeriod, type DashaYearOption } from './engine';
import { PLANETS_9, type Planet9 } from '../jaimini';
import { kalachakraDashas, type KalachakraOptions } from './kalachakra';
import { RASHI_DASHA_SYSTEMS, rashiDashas, type RashiDashaChoices, type RashiDashaSystem } from './rashi';
import { NAKSHATRA_DASHA_SYSTEMS, type NakshatraDashaSystem } from './systems';

export const DASHA_SYSTEM_NAMES = [...NAKSHATRA_DASHA_SYSTEMS, 'kalachakra', ...RASHI_DASHA_SYSTEMS] as const;
export type DashaSystem = (typeof DASHA_SYSTEM_NAMES)[number];

export const DASHA_BASES = ['moon', 'sun', 'lagna', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
export type DashaBase = (typeof DASHA_BASES)[number];
export const DASHA_YEAR_OPTIONS: readonly DashaYearOption[] = ['365.25', '360', '327.85', '365.2422'];

export interface DashaOptions {
  system: DashaSystem;
  /** 1 = mahadashas only … 5 = down to prana. */
  levels: 1 | 2 | 3 | 4 | 5;
  /** PL9's "Dasha year". */
  yearDays: DashaYearOption;
  /** PL9's balance "By degree" or "By time". */
  balance: 'degree' | 'time';
  /** The point whose nakshatra starts the dashas. */
  base: DashaBase;
  /** The varga the base point is taken from. */
  varga: VargaName;
  /** Whole cycles of mahadashas, 1 to 20; by default as many as cover 120 years after birth. */
  cycles?: number;
  /** PL9's two options of the Kalachakra; by default 12 antardashas, going on to the following pada. */
  kalachakra?: Pick<KalachakraOptions, 'antardashas' | 'sequence'>;
  /** PL9's options of the rashi dashas; by default those of the installation measured. See docs/spec/dashas/rashi.md. */
  rashi?: Partial<RashiDashaChoices>;
}

const RASHI_CHOICE_VALUES: Record<keyof RashiDashaChoices, readonly unknown[]> = {
  charaMethod: ['knRao', 'parashara'], charaAntarFromLord: [false, true], padanadhamsaMethod: ['knRao', 'iranganti'], antardashaStart: ['sign', 'lord'],
  rahuExaltation: ['taurus', 'gemini'], mercuryExaltation: ['degree', 'anywhere'],
};

export const DEFAULT_DASHA_OPTIONS: DashaOptions = Object.freeze({
  system: 'vimshottari', levels: 3, yearDays: '365.25', balance: 'degree', base: 'moon', varga: 'D1',
}) as DashaOptions;

export interface Dashas {
  system: DashaSystem;
  /** The Kalachakra's Deha and Jeeva (signs, 0 = Aries), and whether its sequence is savya. */
  kalachakra?: { savya: boolean; deha: number; jeeva: number };
  fidelity: Fidelity;
  options: DashaOptions;
  /** One whole cycle, from the mahadasha running at birth. */
  periods: DashaPeriod[];
}

const DASHA_OPTION_NAMES = new Set([...Object.keys(DEFAULT_DASHA_OPTIONS), 'cycles', 'kalachakra', 'rashi']);

function resolveDashaOptions(partial: Partial<DashaOptions>): DashaOptions {
  for (const k of Object.keys(partial)) if (!DASHA_OPTION_NAMES.has(k)) throw new InvalidOptionError(k, 'unknown option');
  const given = Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined));
  const o: DashaOptions = { ...DEFAULT_DASHA_OPTIONS, ...given };
  // The rashi dashas were measured to two levels: that is their default.
  if (partial.levels === undefined && (RASHI_DASHA_SYSTEMS as readonly string[]).includes(o.system)) o.levels = 2;
  if (!DASHA_SYSTEM_NAMES.includes(o.system)) throw new InvalidOptionError('system', `unknown dasha system "${String(o.system)}"`);
  if (![1, 2, 3, 4, 5].includes(o.levels)) throw new InvalidOptionError('levels', 'must be 1 to 5');
  if (!DASHA_YEAR_OPTIONS.includes(o.yearDays)) throw new InvalidOptionError('yearDays', `unknown dasha year "${String(o.yearDays)}"`);
  if (!DASHA_BASES.includes(o.base)) throw new InvalidOptionError('base', `unknown base "${String(o.base)}"`);
  if (o.balance !== 'degree' && o.balance !== 'time') throw new InvalidOptionError('balance', `unknown balance "${String(o.balance)}"`);
  if (o.kalachakra) {
    if (o.kalachakra.antardashas !== 12 && o.kalachakra.antardashas !== 9) throw new InvalidOptionError('kalachakra.antardashas', 'must be 12 or 9');
    if (o.kalachakra.sequence !== 'continue' && o.kalachakra.sequence !== 'samePada') throw new InvalidOptionError('kalachakra.sequence', 'must be continue or samePada');
  }
  for (const [k, v] of Object.entries(o.rashi ?? {})) {
    const allowed = RASHI_CHOICE_VALUES[k as keyof RashiDashaChoices];
    if (!allowed) throw new InvalidOptionError(`rashi.${k}`, 'unknown option');
    if (v !== undefined && !allowed.includes(v)) throw new InvalidOptionError(`rashi.${k}`, `must be ${allowed.join(' or ')}`);
  }
  // The Kalachakra and the rashi dashas were measured only from the Moon (or the Lagna), in the birth chart, by degree.
  if (o.system === 'kalachakra' || (RASHI_DASHA_SYSTEMS as readonly string[]).includes(o.system)) {
    if (o.base !== 'moon') throw new NotImplementedOptionError('base', `${o.base} with this system`);
    if (o.varga !== 'D1') throw new NotImplementedOptionError('varga', `${o.varga} with this system`);
    if (o.balance !== 'degree') throw new NotImplementedOptionError('balance', `${o.balance} with this system`);
  }
  if ((RASHI_DASHA_SYSTEMS as readonly string[]).includes(o.system) && o.levels > 2) throw new NotImplementedOptionError('levels', `${o.levels} with a rashi dasha`);
  if (o.cycles !== undefined && !(Number.isInteger(o.cycles) && o.cycles >= 1 && o.cycles <= 20)) throw new InvalidOptionError('cycles', 'must be a whole number from 1 to 20');
  if (!VARGAS.includes(o.varga)) throw new InvalidOptionError('varga', `unknown varga "${String(o.varga)}"`);
  // Not yet measured against PL9: see the plan of stage 3A, Task 4.
  // The nodes move backwards and the planets from Mars to Saturn turn retrograde: what PL9 does with them by time
  // was not measured, and the search of the crossings assumes a point moving forwards.
  if (o.balance === 'time' && !['moon', 'sun', 'lagna'].includes(o.base)) throw new NotImplementedOptionError('balance', `time with base ${o.base}`);
  if (o.varga !== 'D1' && o.varga !== 'D9') throw new NotImplementedOptionError('varga', o.varga);
  return o;
}

/** The dashas of a chart. See docs/spec/dashas/nakshatra.md. */
export function computeDashas(eph: Ephemeris, input: ChartInput, options: Partial<DashaOptions> = {}, coreOptions?: Partial<CoreOptions>): Dashas {
  const o = resolveDashaOptions(options);
  const fidelity = resolveOptions(coreOptions).fidelity;
  const positions = computePositions(eph, input, coreOptions);
  if (o.system === 'kalachakra') {
    const longitudes = Object.fromEntries(PLANETS_9.map((p) => [p, positions.points[p].longitude])) as Record<Planet9, number>;
    const kc = { yearDays: dashaYearDays(o.yearDays, fidelity), levels: o.levels, antardashas: 12, sequence: 'continue', ...o.kalachakra } as const;
    const moon = positions.points.moon.longitude;
    let cycles = o.cycles;
    if (cycles === undefined) {
      // As many runs of twelve as reach 120 years after birth.
      const first = kalachakraDashas(moon, longitudes, input.jdUt, { ...kc, levels: 1, cycles: 1 }, fidelity).periods;
      cycles = Math.max(1, Math.ceil((input.jdUt + 120 * kc.yearDays - first[0]!.start) / (first.at(-1)!.end - first[0]!.start)));
    }
    const k = kalachakraDashas(moon, longitudes, input.jdUt, { ...kc, cycles }, fidelity);
    return { system: o.system, fidelity, options: o, periods: k.periods, kalachakra: { savya: k.savya, deha: k.deha, jeeva: k.jeeva } };
  }
  if ((RASHI_DASHA_SYSTEMS as readonly string[]).includes(o.system)) {
    const lagna = positions.points.lagna;
    if (!lagna) throw new LagnaUndefinedError(input.latitude);
    const chart = { lagna: lagna.longitude, longitudes: Object.fromEntries(PLANETS_9.map((p) => [p, positions.points[p].longitude])) as Record<Planet9, number> };
    const yearDays = dashaYearDays(o.yearDays, fidelity);
    const rashi = o.system as RashiDashaSystem;
    const choices = { ...o.rashi, karakas: resolveOptions(coreOptions).karakas === 'eight' ? 8 : 7 } as const;
    let cycles = o.cycles;
    if (cycles === undefined) {
      // As many runs of twelve as reach 120 years after birth.
      const first = rashiDashas(rashi, chart, input.jdUt, { ...choices, yearDays, levels: 1, cycles: 1 }, fidelity);
      cycles = Math.max(1, Math.ceil((120 * yearDays) / (first.at(-1)!.end - first[0]!.start)));
    }
    return { system: o.system, fidelity, options: o, periods: rashiDashas(rashi, chart, input.jdUt, { ...choices, yearDays, levels: o.levels as 1 | 2, cycles }, fidelity) };
  }
  const system = o.system as NakshatraDashaSystem;
  const point = positions.points[o.base];
  if (!point) throw new LagnaUndefinedError(input.latitude);
  const inVarga = (longitude: number) => (o.varga === 'D9' ? vargaLongitude(longitude, 9) : longitude);
  const longitudeAt = (jd: number) => {
    const p = computePositions(eph, { ...input, jdUt: jd }, coreOptions).points[o.base];
    if (!p) throw new LagnaUndefinedError(input.latitude);
    return inVarga(p.longitude);
  };
  const fraction = o.balance === 'time' ? byTime(longitudeAt, input.jdUt) : undefined;
  const yearDays = dashaYearDays(o.yearDays, fidelity);
  const opts = { yearDays, levels: o.levels, fraction };
  let cycles = o.cycles;
  if (cycles === undefined) {
    // As many cycles as reach 120 years after birth.
    const first = nakshatraDashas(system, inVarga(point.longitude), input.jdUt, { ...opts, levels: 1 }, fidelity);
    const length = first.at(-1)!.end - first[0]!.start;
    cycles = Math.max(1, Math.ceil((input.jdUt + 120 * yearDays - first[0]!.start) / length));
  }
  const periods = nakshatraDashas(system, inVarga(point.longitude), input.jdUt, { ...opts, cycles }, fidelity);
  return { system: o.system, fidelity, options: o, periods };
}

const wrap180 = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;

/** The search of a crossing for the balance by time found none: the point does not move steadily forwards there. */
export class CrossingNotFoundError extends Error {
  constructor(target: number) {
    super(`no crossing of ${target}° found for the balance by time`);
    this.name = 'CrossingNotFoundError';
  }
}

/**
 * The instant near `jd` at which a point moving forwards, whose longitude `longitudeAt` gives, stands at `target`:
 * the last one before `jd` (direction -1) or the first one after it (+1). `span` is the arc in degrees the search
 * expects to cover, to size its steps. The longitude is followed unwrapped, step by step, and a step that would move
 * it by more than a quarter of the zodiac is halved: the Lagna near the polar circle can sweep half of it in minutes.
 */
export function crossingTime(longitudeAt: (jd: number) => number, jd: number, target: number, direction: 1 | -1, span: number): number {
  const start = longitudeAt(jd);
  // The target, unwrapped: the first one behind the start going back, the first one ahead going forwards.
  const goal = direction < 0 ? start - (((start - target) % 360) + 360) % 360 : start + (((target - start) % 360) + 360) % 360;
  const speed = Math.abs(wrap180(longitudeAt(jd + 0.01) - start)) / 0.01;
  let step = Math.min(span / Math.max(speed, 1e-6) / 4, 10);
  const passed = (u: number) => (direction < 0 ? u <= goal : u >= goal);
  let t = jd;
  let u = start;
  for (let i = 0; !passed(u) || t === jd; i++) {
    if (i > 2000 || step < 1e-9) throw new CrossingNotFoundError(target);
    const next = t + direction * step;
    const move = wrap180(longitudeAt(next) - (((u % 360) + 360) % 360));
    if (Math.abs(move) > 90) { step /= 2; continue; }
    if (passed(u + move)) {
      // Bisect inside this step, where the longitude moves by less than a quarter of the zodiac.
      let inside = t, outside = next;
      for (let k = 0; k < 60; k++) {
        const mid = (inside + outside) / 2;
        if (passed(u + wrap180(longitudeAt(mid) - (((u % 360) + 360) % 360)))) outside = mid;
        else inside = mid;
      }
      return (inside + outside) / 2;
    }
    t = next;
    u += move;
  }
  return t;
}

/** PL9's balance "By time": the part of the time the point takes over the arc of its nakshatra, gone at `jd`. */
export function byTime(longitudeAt: (jd: number) => number, jd: number): ArcFraction {
  return (_longitude, from, to) => {
    const enter = crossingTime(longitudeAt, jd, from, -1, to - from);
    const leave = crossingTime(longitudeAt, jd, to, 1, to - from);
    return (jd - enter) / (leave - enter);
  };
}

/**
 * The longitude of a point in a varga whose parts follow each other round the zodiac, as the Navamsha's do: the
 * longitude multiplied by the number of parts. PL9 starts the dashas of the D9 from it; measured on its worksheets.
 */
export function vargaLongitude(longitude: number, parts: number): number {
  return (((longitude * parts) % 360) + 360) % 360;
}

export interface CalendarInstant { year: number; month: number; day: number; hour: number; minute: number }

/**
 * The calendar date and time of a Julian day, the minute truncated as PL9 shows it: Gregorian from 15 October 1582,
 * Julian before. Add the chart's clock offset to the Julian day first to read it on that clock.
 */
export function calendarOf(jd: number): CalendarInstant {
  // A billionth of a day keeps an exact minute from showing as the one before.
  const shifted = jd + 0.5 + 1e-9;
  const z = Math.floor(shifted);
  const minutes = Math.floor((shifted - z) * 1440);
  const alpha = Math.floor((z - 1867216.25) / 36524.25);
  const a = z < 2299161 ? z : z + 1 + alpha - Math.floor(alpha / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day, hour: Math.floor(minutes / 60), minute: minutes % 60 };
}
