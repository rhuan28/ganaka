import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { computeDashas } from '../dashas/compute';
import { annualDashas, type AnnualPeriod } from './dashas';
import { computeVarshaphalaReport } from './report';
import { ageAt, dailyReturn, monthlyReturn } from './solarReturn';

// The dasha lists of PL9's Varshaphala worksheets: deeper levels of the annual dashas, the Mudda of a return chart's
// Moon over a month or a day, and the fifteen rows they print. See docs/spec/tempo/varshaphala.md.

const ORDER: readonly Planet9[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const YEARS: Record<string, number> = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
const NAKSHATRA = 40 / 3;

/**
 * The annual dashas to `levels` levels: a Mudda period divides by the Vimshottari years from its own lord; a Patyayini
 * period by the shares of the second level (each lord's part of its period), from its own lord. The levels already
 * there are kept.
 */
export function deepenAnnual(periods: readonly AnnualPeriod[], levels: number, kind: 'mudda' | 'patyayini'): AnnualPeriod[] {
  const first = periods[0];
  const order: readonly AnnualPeriod['lord'][] = kind === 'mudda' ? ORDER : (first?.sub.map((s) => s.lord) ?? []);
  const share = new Map<string, number>(kind === 'mudda' ? ORDER.map((l) => [l, YEARS[l]! / 120])
    : (first?.sub ?? []).map((s) => [s.lord, (s.endJdUt - s.startJdUt) / (first!.endJdUt - first!.startJdUt)]));
  const go = (p: AnnualPeriod, depth: number): AnnualPeriod => {
    if (depth >= levels) return { ...p, sub: [] };
    let sub = p.sub;
    if (!sub.length) {
      const length = p.endJdUt - p.startJdUt;
      const from = order.indexOf(p.lord);
      let t = p.startJdUt;
      sub = order.map((_, j) => {
        const lord = order[(from + j) % order.length]!;
        const s = { lord, startJdUt: t, endJdUt: t + length * share.get(lord)!, sub: [] };
        t = s.endJdUt;
        return s;
      });
    }
    return { ...p, sub: sub.map((s) => go(s, depth + 1)) };
  };
  return periods.map((p) => go(p, 1));
}

/**
 * The Mudda of a chart's Moon over a cycle of `cycleDays`: the Vimshottari order from the lord of the Moon's
 * nakshatra, its first period begun before the chart by the part of the nakshatra the Moon has run, each period its
 * years over 120 of the cycle, two cycles, divided to `levels` (from the printouts: PL9's monthly return lists a year
 * over 12, its daily one a year over 360).
 */
export function moonMudda(eph: Ephemeris, chart: ChartInput, cycleDays: number, levels: number, coreOptions?: Partial<CoreOptions>): AnnualPeriod[] {
  const moon = computePositions(eph, chart, coreOptions).points.moon.longitude;
  const nak = Math.floor(moon / NAKSHATRA);
  const firstLord = ORDER[nak % 9]!;
  let t = chart.jdUt - ((moon % NAKSHATRA) / NAKSHATRA) * cycleDays * (YEARS[firstLord]! / 120);
  const top: AnnualPeriod[] = [];
  for (let i = 0; i < 18; i++) {
    const lord = ORDER[(ORDER.indexOf(firstLord) + i) % 9]!;
    const length = (cycleDays * YEARS[lord]!) / 120;
    top.push({ lord, startJdUt: t, endJdUt: t + length, sub: [] });
    t += length;
  }
  return deepenAnnual(top, levels, 'mudda');
}

export interface DashaRow { chain: AnnualPeriod['lord'][]; startJdUt: number }

/**
 * The rows PL9's worksheets print of a dasha: its deepest periods one after another, from the one running at
 * `fromJdUt` (or the first, when the instant comes before), `count` of them, leaving out those shorter than `shortest`
 * days (the Patyayini's five minutes) but the first, which PL9 prints however short.
 */
export function dashaRows(periods: readonly AnnualPeriod[], fromJdUt: number, count = 15, shortest = 0): DashaRow[] {
  const leaves: (DashaRow & { endJdUt: number })[] = [];
  const walk = (ps: readonly AnnualPeriod[], chain: AnnualPeriod['lord'][]) => {
    for (const p of ps) {
      if (p.sub.length) walk(p.sub, [...chain, p.lord]);
      else if (!leaves.length || p.endJdUt - p.startJdUt >= shortest) leaves.push({ chain: [...chain, p.lord], startJdUt: p.startJdUt, endJdUt: p.endJdUt });
    }
  };
  walk(periods, []);
  const at = fromJdUt < (leaves[0]?.startJdUt ?? 0) ? 0 : leaves.findIndex((l, i) => l.startJdUt <= fromJdUt && (leaves[i + 1]?.startJdUt ?? Infinity) > fromJdUt);
  return leaves.slice(Math.max(0, at), Math.max(0, at) + count).map(({ chain, startJdUt }) => ({ chain, startJdUt }));
}

const SHORTEST_PRINTED = 5 / 1440;
const DASHA_YEAR = 365.2422;

export type WorksheetList = 'patyayini' | 'mudda' | 'kalidasa' | 'kalidasa4' | 'muddaNone' | 'natal' | 'monthly' | 'daily';
export interface WorksheetDashaLists {
  /** Sixteen rows per list: the fifteen printed and one more, for a list PL9 starts one row later. */
  rows: Record<WorksheetList, DashaRow[]>;
  /** The instant each list starts at (Julian day UT). */
  starts: Record<WorksheetList, number>;
  /** The monthly and daily returns of the age (Julian days UT). */
  returns: { monthly: number; daily: number };
}

/**
 * The dasha lists of the Varshaphala worksheets 64, 65, 75, 81 and 89 for a print at `at`. From the printouts: the
 * lists start at the period running at the print's clock read as UT (its local time taken for UT, as the other pages
 * of the clock), or at the return when that comes later; the daily list at its return, the natal Vimshottari at the
 * clock or at its first period. The annual dashas go a level or two deeper (`deepenAnnual`), without their parts under
 * five minutes but the first; the Patyayini over its true periods (the 'corrected' ones: the worksheet does not shift
 * them as the report does), cycle after cycle. The monthly and daily returns list the Mudda of their Moon over a
 * year's twelfth and 360th (`moonMudda`). The age is the one at the clock (`ageAt`) unless given, as when checking a
 * printed one.
 */
export function worksheetDashaLists(
  eph: Ephemeris, natal: ChartInput, at: { jdUt: number; utcOffsetHours: number },
  age?: { years: number; monthly: { years: number; months: number }; daily: { years: number; months: number; days: number } },
  coreOptions?: Partial<CoreOptions>,
): WorksheetDashaLists {
  const now = ageAt(natal.jdUt, at.jdUt);
  const a = age ?? { years: now.years, monthly: now, daily: now };
  const r = computeVarshaphalaReport(eph, natal, a.years, coreOptions);
  const v = r.varshaphala;
  const clock = at.jdUt + at.utcOffsetHours / 24;
  const annual = Math.max(clock, v.jdUt);
  const natalTree: AnnualPeriod[] = computeDashas(eph, natal, { system: 'vimshottari', levels: 3, cycles: 3 }, coreOptions).periods.map(function conv(p): AnnualPeriod {
    return { lord: p.lord as AnnualPeriod['lord'], startJdUt: p.start, endJdUt: p.end, sub: (p.sub ?? []).map(conv) };
  });
  const year = deepenAnnual(annualDashas(eph, v, natal, 'patyayini', { ...coreOptions, fidelity: 'corrected' }), 3, 'patyayini');
  const span = year.length ? year.at(-1)!.endJdUt - year[0]!.startJdUt : 0;
  const shift = (p: AnnualPeriod, d: number): AnnualPeriod => ({ ...p, startJdUt: p.startJdUt + d, endJdUt: p.endJdUt + d, sub: p.sub.map((s) => shift(s, d)) });
  const monthly = monthlyReturn(eph, natal, a.monthly.years, a.monthly.months, 'true', coreOptions);
  const daily = dailyReturn(eph, natal, a.daily.years, a.daily.months, a.daily.days, 'true', coreOptions);
  const starts: Record<WorksheetList, number> = {
    patyayini: annual, mudda: annual, kalidasa: annual, kalidasa4: annual, muddaNone: annual, natal: clock, monthly: Math.max(clock, monthly), daily,
  };
  const rows: Record<WorksheetList, DashaRow[]> = {
    patyayini: dashaRows([0, 1, 2].flatMap((c) => year.map((p) => shift(p, c * span))), starts.patyayini, 16, SHORTEST_PRINTED),
    mudda: dashaRows(deepenAnnual(r.dashas.mudda, 3, 'mudda'), starts.mudda, 16, SHORTEST_PRINTED),
    kalidasa: dashaRows(deepenAnnual(r.dashas.muddaKalidasa, 3, 'mudda'), starts.kalidasa, 16, SHORTEST_PRINTED),
    kalidasa4: dashaRows(deepenAnnual(r.dashas.muddaKalidasa, 4, 'mudda'), starts.kalidasa4, 16, SHORTEST_PRINTED),
    muddaNone: dashaRows(deepenAnnual(r.dashas.muddaWithoutBalance, 3, 'mudda'), starts.muddaNone, 16, SHORTEST_PRINTED),
    natal: dashaRows(natalTree, starts.natal, 16),
    monthly: dashaRows(moonMudda(eph, { ...natal, jdUt: monthly }, DASHA_YEAR / 12, 3, coreOptions), starts.monthly, 16, SHORTEST_PRINTED),
    daily: dashaRows(moonMudda(eph, { ...natal, jdUt: daily }, DASHA_YEAR / 360, 1, coreOptions), starts.daily, 16),
  };
  return { rows, starts, returns: { monthly, daily } };
}
