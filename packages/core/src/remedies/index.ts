import type { Ephemeris } from '@reverse/ephemeris';
import { DATA_RANGE, julianDayUt } from '@reverse/ephemeris/time';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { ashtakavarga, AV_PLANETS, type AvSigns } from '../strengths/ashtakavarga';
import { ayanamshaPl9 } from '../ayanamsha';
import { planetLongitude } from '../planets';
import type { Fidelity } from '../fidelity';
import { norm360 } from '../zodiac';
import { mangalaOf, type MangalaDosha } from '../compatibility';

/**
 * Saturn's transits counted from the natal Moon sign and the remedies PL9 computes for one chart
 * (docs/spec/remedies.md): the Sade Sati (Saturn in the 12th, 1st and 2nd from the Moon), the Laghu Kalyani Dhayya and
 * Kantaka Saturn (the 4th, 7th, 8th and 10th), three cycles each; the Mangala Dosha; the gems of the Lagna's, the 5th
 * and the 9th lords.
 */

export type GemPlanet = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

/** One stay of Saturn in a sign: from its entry to its next sign change, either way. */
export interface SaturnStay {
  startJdUt: number;
  endJdUt: number;
  /** The stay from birth on, in calendar years, months and days (30 days a month); null if it ended before birth. */
  span: { years: number; months: number; days: number } | null;
}
export interface SaturnHouse {
  /** The house from the Moon sign, 1 to 12, and the sign, 1 (Aries) to 12. */
  house: number;
  sign: number;
  /** The first entry of the cycle, and the re-entry after a retrogression (null if none within ten years). */
  stays: [SaturnStay | null, SaturnStay | null];
  /** Saturn's bindus in the sign and the Sarvashtakavarga's; null without a Lagna. */
  points: { saturn: number; sarva: number } | null;
}
export interface Remedies {
  /** The natal Moon's and Saturn's signs, 1 to 12. */
  moonSign: number;
  saturnSign: number;
  /** Three cycles of the 12th, 1st and 2nd houses from the Moon. */
  sadeSati: SaturnHouse[][];
  /** Three cycles of the 4th, 7th, 8th and 10th houses from the Moon. */
  kantaka: SaturnHouse[][];
  mangala: MangalaDosha;
  /** The gems: of the Lagna's lord (Life), the 5th's (Punya) and the 9th's (Bhagya); null without a Lagna. */
  gems: { life: GemPlanet; punya: GemPlanet; bhagya: GemPlanet } | null;
  missing: { field: string; reason: string }[];
}

const YEAR = 365.25;
const CYCLE = 29 * YEAR;
const SADE_SATI = [12, 1, 2], KANTAKA = [4, 7, 8, 10];
/** The span of PL9's list of Saturn's sign changes. */
const PL9_LIST = [julianDayUt(1805, 10, 29), julianDayUt(2105, 11, 30)] as const;
const LORD: GemPlanet[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
const houseFrom = (from: number, to: number) => ((((to - from) % 12) + 12) % 12) + 1;

/** How far from birth PL9 starts the first cycle's search, in days, by natal Saturn's house from the Moon. */
export function searchOffset(table: 'sadeSati' | 'kantaka', saturnHouse: number): number {
  if (table === 'sadeSati') return [12, 1, 2].includes(saturnHouse) ? -15 * YEAR : saturnHouse === 3 ? 5 * YEAR : 0;
  if (saturnHouse === 11) return 2.5 * YEAR;
  return [12, 1, 2, 3].includes(saturnHouse) ? 0 : (1 - saturnHouse) * 2.5 * YEAR;
}

/** The calendar date of a Julian day, universal time. */
function civil(jd: number): [number, number, number] {
  const d = new Date(Math.round((jd - 2440587.5) * 86400000));
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}

/** The calendar difference between two dates, borrowing 30 days for a month and 12 months for a year (PL9's). */
export function calendarSpan(fromJdUt: number, toJdUt: number): { years: number; months: number; days: number } {
  const [y1, m1, d1] = civil(fromJdUt), [y2, m2, d2] = civil(toJdUt);
  let days = d2 - d1, months = m2 - m1, years = y2 - y1;
  if (days < 0) { days += 30; months--; }
  if (months < 0) { months += 12; years--; }
  return { years, months, days };
}

/**
 * Saturn's entries into the signs of Lahiri's zodiac between two instants: its longitude once a day, each sign change
 * between two days found by halving to within a second. `sign` is the sign entered, 0 = Aries. Saturn alone, so the
 * search over a century takes a fraction of a second (signIngresses computes every point of the chart at each step).
 */
export function saturnIngresses(eph: Ephemeris, fromJdUt: number, toJdUt: number, fidelity: Fidelity = 'pl9'): { sign: number; jdUt: number; retrograde: boolean }[] {
  const lon = (jd: number) => planetLongitude(eph, jd, 'saturn', ayanamshaPl9(eph, jd, 'lahiri', 0, fidelity), fidelity).longitude;
  const sign = (jd: number) => Math.floor(lon(jd) / 30);
  const out: { sign: number; jdUt: number; retrograde: boolean }[] = [];
  let t = fromJdUt, s = sign(t);
  for (; t < toJdUt; t += 1) {
    const s2 = sign(t + 1);
    if (s2 === s) continue;
    let a = t, b = t + 1;
    while (b - a > 1 / 86400) { const m = (a + b) / 2; if (sign(m) === s) a = m; else b = m; }
    out.push({ sign: s2, jdUt: b, retrograde: (s2 - s + 12) % 12 === 11 });
    s = s2;
  }
  return out;
}

export function computeRemedies(eph: Ephemeris, input: ChartInput, coreOptions?: Partial<CoreOptions>): Remedies {
  const core = resolveOptions(coreOptions);
  const pos = computePositions(eph, input, core);
  const signOf = (lon: number) => Math.floor(norm360(lon) / 30);
  const moon = signOf(pos.points.moon.longitude), saturn = signOf(pos.points.saturn.longitude);
  const lagna = pos.points.lagna ? signOf(pos.points.lagna.longitude) : null;
  const missing: Remedies['missing'] = [];
  if (lagna === null) missing.push({ field: 'points', reason: 'needs the Lagna' }, { field: 'gems', reason: 'needs the Lagna' });
  const av = lagna === null ? null : ashtakavarga({ ...Object.fromEntries(AV_PLANETS.map((p) => [p, signOf(pos.points[p].longitude)])), lagna } as AvSigns, {}, core.fidelity);

  // Saturn's sign changes in Lahiri's zodiac whatever the chart's (PL9 reads them from a fixed Lahiri list), from
  // well before birth to past the third cycle.
  const birth = input.jdUt;
  // The search stays inside the ephemeris's years (a chart of the early 1800s loses the stays before 1800); PL9's list
  // covers only 29 October 1805 to 29 November 2105.
  const pl9 = core.fidelity === 'pl9';
  const from = Math.max(birth - 23 * YEAR, DATA_RANGE.minJdUt + 2, pl9 ? PL9_LIST[0] : -Infinity);
  // Past birth + 107 years no stay of the third cycle nor its re-entry can begin.
  const to = Math.min(birth + 3 * CYCLE + 20 * YEAR, pl9 ? PL9_LIST[1] : Infinity, DATA_RANGE.maxJdUt - 2);
  const listEnds = pl9 && to === PL9_LIST[1];
  const ingresses = from < to ? saturnIngresses(eph, from, to, core.fidelity) : [];
  const saturnHouse = houseFrom(moon, saturn);

  const stay = (i: number): SaturnStay => {
    const startJdUt = ingresses[i]!.jdUt, endJdUt = ingresses[i + 1]!.jdUt;
    return { startJdUt, endJdUt, span: endJdUt < birth ? null : calendarSpan(Math.max(startJdUt, birth), endJdUt) };
  };
  const cycles = (houses: number[]) => [1, 2, 3].map((cycle) => {
    const from = birth + searchOffset(houses === SADE_SATI ? 'sadeSati' : 'kantaka', saturnHouse) + (cycle - 1) * CYCLE;
    return houses.map((house): SaturnHouse => {
      const sign = (moon + house - 1) % 12;
      // The first entry into the sign after the start, its stay ending at the next sign change; then the next entry
      // after that stay, unless it comes more than ten years later.
      const first = ingresses.findIndex((g, i) => g.jdUt > from && g.sign === sign && i + 1 < ingresses.length);
      const second = first < 0 ? -1 : ingresses.findIndex((g, i) => i > first + 1 && g.sign === sign && i + 1 < ingresses.length);
      // When PL9's list ends before a re-entry, it repeats the first stay (its search keeps the last one found).
      const reentry = second >= 0 ? (ingresses[second]!.jdUt <= ingresses[first]!.jdUt + 10 * YEAR ? stay(second) : null) : listEnds && first >= 0 ? stay(first) : null;
      return {
        house, sign: sign + 1,
        stays: [first < 0 ? null : stay(first), reentry],
        points: av ? { saturn: av.bhinna.saturn[sign]!, sarva: av.sarva[sign]! } : null,
      };
    });
  });

  return {
    moonSign: moon + 1, saturnSign: saturn + 1,
    sadeSati: cycles(SADE_SATI),
    kantaka: cycles(KANTAKA),
    mangala: mangalaOf(pos),
    gems: lagna === null ? null : { life: LORD[lagna]!, punya: LORD[(lagna + 4) % 12]!, bhagya: LORD[(lagna + 8) % 12]! },
    missing,
  };
}
