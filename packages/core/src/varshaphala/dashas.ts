import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { norm360 } from '../zodiac';
import type { Varshaphala } from './annual';

export type AnnualDashaSystem = 'mudda' | 'muddaKalidasa' | 'muddaWithoutBalance' | 'patyayini';

export interface AnnualPeriod {
  lord: Planet9 | 'lagna';
  startJdUt: number;
  endJdUt: number;
  sub: AnnualPeriod[];
}

/** The year the annual dashas spread over, days (from the printouts: the cycle closes 365.2422 days on). */
export const DASHA_YEAR = 365.2422;
const NAKSHATRA = 40 / 3;
const ORDER: readonly Planet9[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const YEARS: Record<string, number> = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };

/**
 * The Mudda dasha: the Vimshottari order over the year, from the lord of the natal nakshatra counted on by the
 * completed years (or, 'muddaKalidasa', of the annual Moon's nakshatra). With a balance, the first period began
 * before the return by the part of it the Moon had run of its nakshatra (at birth, or in the annual chart); PL9 prints
 * its sub-periods from the one running at the return (from the printouts). Periods follow until the year is covered,
 * the last one starting at its end included.
 */
function mudda(start: number, firstLord: Planet9, run: number): AnnualPeriod[] {
  const out: AnnualPeriod[] = [];
  let i = ORDER.indexOf(firstLord);
  let t = start - (run * DASHA_YEAR * YEARS[firstLord]!) / 120;
  const end = start + DASHA_YEAR + 1e-6;
  for (; t <= end; i++) {
    const lord = ORDER[i % 9]!;
    const full = (DASHA_YEAR * YEARS[lord]!) / 120;
    const sub: AnnualPeriod[] = [];
    let s = t;
    for (let j = 0; j < 9; j++) {
      const l = ORDER[(i + j) % 9]!;
      const length = (full * YEARS[l]!) / 120;
      sub.push({ lord: l, startJdUt: s, endJdUt: s + length, sub: [] });
      s += length;
    }
    out.push({ lord, startJdUt: t, endJdUt: t + full, sub });
    t += full;
  }
  return out;
}

/**
 * Patyayini: the seven planets and the Lagna in the order of their degrees in the sign, each period the lead of its
 * degree over the one before (the first, its own degree) as a share of the greatest, of the year; the sub-periods the
 * same shares of each period, from its own lord in the same order (from the printouts).
 */
function patyayini(v: Varshaphala): AnnualPeriod[] {
  const p = v.chart.points as Record<string, { longitude: number } | undefined>;
  // The Lagna is one of its lords: without it there is no Patyayini.
  if (!p.lagna) return [];
  const lords = (['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const).filter((k) => p[k]);
  const deg = (k: string) => norm360(p[k]!.longitude) % 30;
  const sorted = [...lords].sort((a, b) => deg(a) - deg(b));
  const max = deg(sorted.at(-1)!);
  const share = sorted.map((k, i) => (deg(k) - (i === 0 ? 0 : deg(sorted[i - 1]!))) / max);
  const out: AnnualPeriod[] = [];
  let t = v.jdUt;
  sorted.forEach((lord, i) => {
    const length = share[i]! * DASHA_YEAR;
    const sub: AnnualPeriod[] = [];
    let s = t;
    for (let j = 0; j < sorted.length; j++) {
      const k = (i + j) % sorted.length;
      sub.push({ lord: sorted[k]!, startJdUt: s, endJdUt: s + length * share[k]!, sub: [] });
      s += length * share[k]!;
    }
    out.push({ lord, startJdUt: t, endJdUt: t + length, sub });
    t += length;
  });
  return out;
}

/** The shortest part of a Patyayini period PL9 prints, days (from the printouts: 4.85 minutes left out, 5.12 shown). */
const SHORTEST_PRINTED = 5 / 1440;

/**
 * The Patyayini as PL9 prints it: the parts of the periods one after another, cycle after cycle, without those shorter
 * than five minutes, eight to a period; each period by the lord of the period its first row belongs to, from the start
 * of that row to the end of its last. When the first part of the year is so left out, the whole first period is. So a
 * short part moves the later rows one period back. See docs/spec/tempo/varshaphala.md and docs/spec/correcoes.md, 27.
 */
function patyayiniAsPrinted(periods: AnnualPeriod[]): AnnualPeriod[] {
  if (!periods.length) return periods;
  const span = periods.at(-1)!.endJdUt - periods[0]!.startJdUt;
  const size = periods[0]!.sub.length;
  // Each cycle keeps at least one row (the greatest share is at least an eighth, so its own part lasts days): as many
  // cycles as rows printed always fill the table.
  let rows = Array.from({ length: periods.length * size }, (_, c) => c).flatMap((cycle) => periods.flatMap((p, main) => p.sub.map((s) => ({
    lord: p.lord, first: cycle === 0 && main === 0, sub: { ...s, startJdUt: s.startJdUt + cycle * span, endJdUt: s.endJdUt + cycle * span },
  }))));
  if (rows[0]!.sub.endJdUt - rows[0]!.sub.startJdUt < SHORTEST_PRINTED) rows = rows.filter((r) => !r.first);
  rows = rows.filter((r) => r.sub.endJdUt - r.sub.startJdUt >= SHORTEST_PRINTED);
  return periods.map((_, i) => {
    const chunk = rows.slice(i * size, (i + 1) * size);
    return { lord: chunk[0]!.lord, startJdUt: chunk[0]!.sub.startJdUt, endJdUt: chunk.at(-1)!.sub.endJdUt, sub: chunk.map((r) => r.sub) };
  });
}

/**
 * The annual dashas of a Varshaphala in one of PL9's four systems. In the pl9 mode the Patyayini is as PL9 prints it
 * (`patyayiniAsPrinted`); the corrected mode gives each period its own parts.
 */
export function annualDashas(eph: Ephemeris, v: Varshaphala, natal: ChartInput, system: AnnualDashaSystem, coreOptions?: Partial<CoreOptions>): AnnualPeriod[] {
  if (system === 'patyayini') return resolveOptions(coreOptions).fidelity === 'pl9' ? patyayiniAsPrinted(patyayini(v)) : patyayini(v);
  const moonAt = (input: ChartInput) => computePositions(eph, input, coreOptions).points.moon.longitude;
  if (system === 'muddaKalidasa') {
    const moon = v.chart.points.moon.longitude;
    const nak = Math.floor(moon / NAKSHATRA);
    return mudda(v.jdUt, ORDER[nak % 9]!, (moon % NAKSHATRA) / NAKSHATRA);
  }
  const moon = moonAt(natal);
  const nak = Math.floor(moon / NAKSHATRA);
  const run = system === 'mudda' ? (moon % NAKSHATRA) / NAKSHATRA : 0;
  return mudda(v.jdUt, ORDER[(nak + v.years) % 9]!, run);
}
