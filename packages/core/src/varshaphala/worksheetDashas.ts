import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { computeDashas } from '../dashas/compute';
import { annualDashas, type AnnualPeriod } from './dashas';
import { computeVarshaphalaReport } from './report';
import { tithiPravesh } from '../panchanga/tithiPravesh';
import { ageAt, dailyReturn, monthlyReturn } from './solarReturn';

// The dasha lists of PL9's Varshaphala worksheets: deeper levels of the annual dashas, the Mudda of a return chart's
// Moon over a month or a day, and the fifteen rows they print. See docs/spec/time/varshaphala.md.

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
 * The rows PL9's worksheets print of a dasha (from the printouts and PL9's code): each row is the deepest period
 * running at a target instant, the first target `fromJdUt` (or the first period, when the instant comes before), each
 * next one the row's end plus `gap` days (five minutes on the lists below the year: a part shorter than that is skipped
 * when it falls inside the gap, whatever its length, and a shorter one after it can still be printed). `count` rows.
 */
export function dashaRows(periods: readonly AnnualPeriod[], fromJdUt: number, count = 15, gap = 0): DashaRow[] {
  const leaves: (DashaRow & { endJdUt: number })[] = [];
  const walk = (ps: readonly AnnualPeriod[], chain: AnnualPeriod['lord'][]) => {
    for (const p of ps) {
      if (p.sub.length) walk(p.sub, [...chain, p.lord]);
      else leaves.push({ chain: [...chain, p.lord], startJdUt: p.startJdUt, endJdUt: p.endJdUt });
    }
  };
  walk(periods, []);
  const out: DashaRow[] = [];
  let i = fromJdUt < (leaves[0]?.startJdUt ?? 0) ? 0 : leaves.findIndex((l, k) => l.startJdUt <= fromJdUt && (leaves[k + 1]?.startJdUt ?? Infinity) > fromJdUt);
  while (i >= 0 && i < leaves.length && out.length < count) {
    const l = leaves[i]!;
    out.push({ chain: l.chain, startJdUt: l.startJdUt });
    // The next row: the last period begun by the target (the one right after, past a hole).
    const target = l.endJdUt + gap;
    let j = i + 1;
    while (j + 1 < leaves.length && leaves[j + 1]!.startJdUt <= target) j++;
    i = j;
  }
  return out;
}

const GAP_PRINTED = 5 / 1440;
const DASHA_YEAR = 365.2422;

export type WorksheetList = 'patyayini' | 'mudda' | 'kalidasa' | 'kalidasa4' | 'muddaNone' | 'natal' | 'natal4' | 'monthly' | 'monthly4' | 'daily' | 'daily4' | 'tithiPravesh';
export interface WorksheetDashaLists {
  /** Sixteen rows per list: the fifteen printed and one more, for a list PL9 starts one row later. */
  rows: Record<WorksheetList, DashaRow[]>;
  /** The instant each list starts at (Julian day UT). */
  starts: Record<WorksheetList, number>;
  /** The monthly and daily returns of the age (Julian days UT). */
  returns: { monthly: number; daily: number };
  /** The periods each list walks and its gap (days): the rows from another start are `dashaRows(periods, start, 16, gap)`. */
  periods: Record<WorksheetList, AnnualPeriod[]>;
  gaps: Record<WorksheetList, number>;
}

/**
 * The dasha lists of the Varshaphala worksheets (64 to 89) for a print at `at`. From the printouts: the lists start at
 * the period running at the print's clock read as UT (its local time taken for UT, as the other pages of the clock), or
 * at the return when that comes later; the daily list at its return, the natal Vimshottari at the clock or at its
 * first period. The annual dashas go a level or two deeper (`deepenAnnual`); the Patyayini over its true periods (the
 * 'corrected' ones: the worksheet does not shift them as the report does), cycle after cycle. The monthly and daily
 * returns list the Mudda of their Moon over a year's twelfth and 360th (`moonMudda`), at three or four levels and one or
 * four (the one-level daily list starts at its return, the four-level one at the clock while that falls in the day's
 * cycle, else at the return); the Tithi Pravesh chart that of its Moon over a year, at four. Below the year the rows follow the five-minute
 * walk of `dashaRows`. The age is the one at the clock (`ageAt`) unless given, as when checking a printed one.
 *
 * With `local` (the "(L)" pages, cast at the place of the "Today" event), PL9 reads the clock and the returns in that
 * place's clock: the clock (its local time) gives the true UT, and a return (kept in the birth's clock) is read as if
 * in the place's, `local.utcOffsetHours` earlier for a birth in UT; the natal lists are the birth's as on the other
 * pages. The printouts only hold births in UT, so how the birth's own zone enters is not seen (here: the difference of
 * the two). The starts so read are looked up in the periods as they are, in UT, as PL9 does (from the printouts: the
 * rows of a daily (L) list begin 5h30 before its return). The (L) pages date their rows in the place's clock (not done
 * here: the rows are in UT). `at.utcOffsetHours` is taken to be the place's (Jaipur's on the printouts).
 */
export function worksheetDashaLists(
  eph: Ephemeris, natal: ChartInput, at: { jdUt: number; utcOffsetHours: number },
  age?: { years: number; monthly: { years: number; months: number }; daily: { years: number; months: number; days: number } },
  coreOptions?: Partial<CoreOptions>,
  local?: { utcOffsetHours: number },
): WorksheetDashaLists {
  const now = ageAt(natal.jdUt, at.jdUt);
  const a = age ?? { years: now.years, monthly: now, daily: now };
  const r = computeVarshaphalaReport(eph, natal, a.years, coreOptions);
  const v = r.varshaphala;
  const clock = at.jdUt + at.utcOffsetHours / 24;
  // The clock and the returns as the page reads them.
  const pageClock = local ? clock - local.utcOffsetHours / 24 : clock;
  const read = (jdUt: number) => (local ? jdUt + ((natal.utcOffsetHours ?? 0) - local.utcOffsetHours) / 24 : jdUt);
  const annual = Math.max(pageClock, read(v.jdUt));
  const natalTree = (levels: 3 | 4): AnnualPeriod[] => computeDashas(eph, natal, { system: 'vimshottari', levels, cycles: 3 }, coreOptions).periods.map(function conv(p): AnnualPeriod {
    return { lord: p.lord as AnnualPeriod['lord'], startJdUt: p.start, endJdUt: p.end, sub: (p.sub ?? []).map(conv) };
  });
  const year = deepenAnnual(annualDashas(eph, v, natal, 'patyayini', { ...coreOptions, fidelity: 'corrected' }), 3, 'patyayini');
  const span = year.length ? year.at(-1)!.endJdUt - year[0]!.startJdUt : 0;
  const shift = (p: AnnualPeriod, d: number): AnnualPeriod => ({ ...p, startJdUt: p.startJdUt + d, endJdUt: p.endJdUt + d, sub: p.sub.map((s) => shift(s, d)) });
  const monthly = monthlyReturn(eph, natal, a.monthly.years, a.monthly.months, 'true', coreOptions);
  const daily = dailyReturn(eph, natal, a.daily.years, a.daily.months, a.daily.days, 'true', coreOptions);
  const pravesh = tithiPravesh(eph, natal, at.jdUt, coreOptions);
  const monthlyStart = Math.max(pageClock, read(monthly));
  // The four-level daily list starts at the clock while it falls within the day's cycle of the Mudda (one cycle, from
  // its return), else at the return (from the printouts).
  const daily4 = moonMudda(eph, { ...natal, jdUt: daily }, DASHA_YEAR / 360, 4, coreOptions);
  const cycleEnd = daily4[Math.min(8, daily4.length - 1)]!.endJdUt;
  const dailyStart = pageClock >= read(daily) && pageClock < read(cycleEnd) ? pageClock : read(daily);
  const starts: Record<WorksheetList, number> = {
    patyayini: annual, mudda: annual, kalidasa: annual, kalidasa4: annual, muddaNone: annual, natal: clock, natal4: clock,
    monthly: monthlyStart, monthly4: monthlyStart, daily: read(daily), daily4: dailyStart, tithiPravesh: Math.max(pageClock, read(pravesh)),
  };
  const mudda = (jdUt: number, cycle: number, levels: number) => moonMudda(eph, { ...natal, jdUt }, cycle, levels, coreOptions);
  const periods: Record<WorksheetList, AnnualPeriod[]> = {
    patyayini: [0, 1, 2].flatMap((c) => year.map((p) => shift(p, c * span))),
    mudda: deepenAnnual(r.dashas.mudda, 3, 'mudda'),
    kalidasa: deepenAnnual(r.dashas.muddaKalidasa, 3, 'mudda'),
    kalidasa4: deepenAnnual(r.dashas.muddaKalidasa, 4, 'mudda'),
    muddaNone: deepenAnnual(r.dashas.muddaWithoutBalance, 3, 'mudda'),
    natal: natalTree(3),
    natal4: natalTree(4),
    monthly: mudda(monthly, DASHA_YEAR / 12, 3),
    monthly4: mudda(monthly, DASHA_YEAR / 12, 4),
    daily: mudda(daily, DASHA_YEAR / 360, 1),
    daily4,
    tithiPravesh: mudda(pravesh, DASHA_YEAR, 4),
  };
  // Five minutes below the year, but the natal and daily lists at three and one levels, whose periods run longer.
  const gaps = Object.fromEntries(Object.keys(periods).map((k) => [k, k === 'natal' || k === 'daily' ? 0 : GAP_PRINTED])) as Record<WorksheetList, number>;
  const rows = Object.fromEntries(Object.entries(periods).map(([k, ps]) => [k, dashaRows(ps, starts[k as WorksheetList], 16, gaps[k as WorksheetList])])) as Record<WorksheetList, DashaRow[]>;
  return { rows, starts, returns: { monthly, daily }, periods, gaps };
}
