import { InvalidInputError } from '../errors';
import type { Fidelity } from '../fidelity';
import { PLANETS_9, type Planet9 } from '../jaimini';
import { NotImplementedOptionError } from '../options';
import { SIGN_LORDS } from '../specialLagnas';
import { norm360 } from '../zodiac';
import type { DashaPeriod } from './engine';
import { SIGN_NAMES } from './kalachakra';
import { brahma, strongerByPoints } from './points';
import { dashaDignity, strengthLord, strongerSign, type DashaDignityOptions } from './strength';

export const RASHI_DASHA_SYSTEMS = [
  'chara', 'sthira', 'niryaanaShoola', 'drig', 'navamsha', 'narayana', 'lagnaKendradi', 'sreeLagnaKendradi', 'shoola', 'padanadhamsa',
] as const;
export type RashiDashaSystem = (typeof RASHI_DASHA_SYSTEMS)[number];

/** The chart a rashi dasha is computed from: the Lagna, the nine grahas and the Moon among them. */
export interface RashiChart {
  lagna: number;
  longitudes: Record<Planet9, number>;
}

/** PL9's options of the rashi dashas, in its Dashas preferences; the defaults are those of the installation measured. */
export interface RashiDashaChoices extends DashaDignityOptions {
  /** "Chara dasha method". */
  charaMethod: 'knRao' | 'parashara';
  /** "Antardashas start from dasha lord", which PL9 heeds only in the Chara of Parashara. */
  charaAntarFromLord: boolean;
  /** "Padanadhamsadasha Method": PL9 gives the same dates with either. */
  padanadhamsaMethod: 'knRao' | 'iranganti';
  /** "Start of Rashi Antardashas": the sign, or from its lord. */
  antardashaStart: 'sign' | 'lord';
}

export const DEFAULT_RASHI_CHOICES: RashiDashaChoices = Object.freeze({
  charaMethod: 'knRao', charaAntarFromLord: false, padanadhamsaMethod: 'knRao', antardashaStart: 'sign', rahuExaltation: 'taurus', mercuryExaltation: 'degree',
}) as RashiDashaChoices;

export interface RashiOptions extends Partial<RashiDashaChoices> {
  yearDays: number;
  /** Chara karakas counted, for the Chara of Parashara; 7 by default. */
  karakas?: 7 | 8;
  /** 1 = mahadashas, 2 = with antardashas: the levels measured. */
  levels: 1 | 2;
  /** Runs of the twelve signs. */
  cycles: number;
}

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const mod12 = (n: number) => ((n % 12) + 12) % 12;
/** Signs whose count runs forwards in the Chara dasha of K.N. Rao: Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius. */
const DIRECT = new Set([0, 1, 2, 6, 7, 8]);

/** Signs counted from `sign` to `to` in the direction `step`, the sign itself not counted: 0 when they are the same. */
const distance = (sign: number, to: number, step: 1 | -1) => mod12((to - sign) * step);

/**
 * Years of a sign in the Narayana, Lagna Kendradi, Drig and Sree Lagna Kendradi dashas: the signs from it to its lord
 * (the stronger of two for Scorpio and Aquarius), forwards in the signs of `DIRECT`, backwards in the others; 12 when
 * the lord is in it; one more when the lord is exalted, one less when debilitated; 13 counts as 12.
 */
export function rashiYears(sign: number, chart: RashiChart, dignity: Partial<DashaDignityOptions> = {}): number {
  const lord = strengthLord(sign, chart.longitudes);
  const n = distance(sign, signOf(chart.longitudes[lord]), DIRECT.has(sign) ? 1 : -1);
  const years = (n === 0 ? 12 : n) + dashaDignity(lord, chart.longitudes[lord], dignity);
  return years === 13 ? 12 : years;
}

/**
 * Years of a sign in the Chara dasha of K.N. Rao, as PL9 counts them: the signs to its lord, forwards in `DIRECT`,
 * backwards otherwise, 12 when the lord is in it; no exaltation. Scorpio and Aquarius: when one lord is in the sign,
 * the other; else the one with more planets in its sign; then the one further on in its sign.
 */
export function charaYears(sign: number, chart: RashiChart): number {
  const s = (p: Planet9) => signOf(chart.longitudes[p]);
  const step = DIRECT.has(sign) ? 1 : -1;
  const count = (to: number) => distance(sign, to, step) || 12;
  const lord = SIGN_LORDS[sign]!;
  if (sign !== 7 && sign !== 10) return count(s(lord));
  const other: Planet9 = sign === 7 ? 'ketu' : 'rahu';
  if (s(lord) === sign && s(other) === sign) return 12;
  if (s(lord) === sign) return count(s(other));
  if (s(other) === sign) return count(s(lord));
  const planetsIn = (x: number) => PLANETS_9.filter((p) => s(p) === x).length;
  const a = planetsIn(s(lord));
  const b = planetsIn(s(other));
  const chosen = b > a ? other : a > b ? lord : chart.longitudes[lord] % 30 < chart.longitudes[other] % 30 ? other : lord;
  return count(s(chosen));
}

/**
 * Years of a sign in the Chara dasha of Parashara, as PL9 counts them: the signs to its lord, forwards in `DIRECT`,
 * backwards otherwise, 12 when the lord is in it; no dignity. Scorpio and Aquarius: 12 with both lords in the sign;
 * with one, the count to the other; else Mars or Saturn when its sign has more planets than the node's, else the
 * lord whose sign has the higher modality (dual over fixed over movable); with the same modality, the exalted one,
 * then the one with more years (Mars or Saturn when equal). One more year when the chosen lord is exalted, one less
 * when debilitated (PL9's dignity of the rashi dashas); with both lords in one sign, when either is.
 */
export function parasharaCharaYears(sign: number, chart: RashiChart, dignity: Partial<DashaDignityOptions> = {}): number {
  const s = (p: Planet9) => signOf(chart.longitudes[p]);
  const count = (to: number) => distance(sign, to, DIRECT.has(sign) ? 1 : -1);
  const lord = SIGN_LORDS[sign]!;
  if (sign !== 7 && sign !== 10) return count(s(lord)) || 12;
  const node: Planet9 = sign === 7 ? 'ketu' : 'rahu';
  if (s(lord) === sign && s(node) === sign) return 12;
  if (s(lord) === sign) return count(s(node));
  if (s(node) === sign) return count(s(lord));
  const planetsIn = (x: number) => PLANETS_9.filter((p) => s(p) === x).length;
  const modality = (x: number) => x % 3;
  const dig = (p: Planet9) => dashaDignity(p, chart.longitudes[p], dignity);
  // Together in another sign: the exaltation or the debility of either counts.
  if (s(lord) === s(node)) return count(s(lord)) + ([dig(lord), dig(node)].includes(1) ? 1 : 0) - ([dig(lord), dig(node)].includes(-1) ? 1 : 0);
  let chosen: Planet9;
  if (planetsIn(s(node)) < planetsIn(s(lord)) || modality(s(node)) < modality(s(lord))) chosen = lord;
  else if (modality(s(lord)) < modality(s(node))) chosen = node;
  else if (dig(lord) === 1) chosen = lord;
  else if (dig(node) === 1) chosen = node;
  else chosen = count(s(lord)) < count(s(node)) ? node : lord;
  return count(s(chosen)) + dig(chosen);
}

/** Years of a sign in the Navamsha dasha: the signs to its lord, always forwards, 12 when the lord is in it. */
const navamshaYears = (sign: number, chart: RashiChart) => distance(sign, signOf(chart.longitudes[SIGN_LORDS[sign]!]), 1) || 12;

/** The chart's longitudes in the Navamsha, nine times each. */
const navamshaChart = (chart: RashiChart): RashiChart => ({
  lagna: norm360(chart.lagna * 9),
  longitudes: Object.fromEntries(PLANETS_9.map((p) => [p, norm360(chart.longitudes[p] * 9)])) as Record<Planet9, number>,
});

/**
 * Years of a sign in the Padanadhamsa dasha, in the Navamsha: the signs from it to its lord counting both, forwards
 * from an odd sign and backwards from an even one; 12 when the lord is in it, 10 when it is in the 7th.
 */
function padanadhamsaYears(sign: number, d9: RashiChart): number {
  const n = distance(sign, signOf(d9.longitudes[SIGN_LORDS[sign]!]), sign % 2 === 0 ? 1 : -1);
  return n === 0 ? 12 : n === 6 ? 10 : n + 1;
}

/**
 * Direction of the Narayana and Kendradi dashas from their first sign: forwards from an odd sign, backwards from an
 * even one; forwards whenever Saturn is in it; Ketu in it turns the direction round.
 */
function rashiDirection(sign: number, chart: RashiChart): 1 | -1 {
  let step: 1 | -1 = sign % 2 === 0 ? 1 : -1;
  if (signOf(chart.longitudes.saturn) === sign) step = 1;
  if (signOf(chart.longitudes.ketu) === sign) step = step === 1 ? -1 : 1;
  return step;
}

/** The twelve signs from `start` by its modality: one after another (movable), every 6th (fixed), by trines (dual). */
function byModality(start: number, step: 1 | -1, dualGroupStep: number): number[] {
  if (start % 3 === 0) return Array.from({ length: 12 }, (_, i) => mod12(start + step * i));
  if (start % 3 === 1) return Array.from({ length: 12 }, (_, i) => mod12(start + step * 5 * i));
  const out: number[] = [];
  for (let g = 0; g < 4; g++) for (let k = 0; k < 3; k++) out.push(mod12(start + step * dualGroupStep * g - step * 4 * k));
  return out;
}

/** The kendras, then the panapharas, then the apoklimas from `start`. */
const kendradi = (start: number, step: 1 | -1) => [0, 1, 2].flatMap((g) => [0, 1, 2, 3].map((k) => mod12(start + step * (3 * k + g))));

/**
 * The Drig dasha's twelve signs: the 9th, the 10th and the 11th from the Lagna, each followed by the three signs it
 * aspects, in its direction (forwards in `DIRECT`). PL9 counts them from 1 to 12 and, when the count goes below 1,
 * cuts it to eight bits before bringing it back to 1..12: the sign comes out four further on.
 */
function drigOrder(lagnaSign: number, fidelity: Fidelity): number[] {
  const out: number[] = [];
  const norm1 = (x: number) => mod12(x - 1) + 1;
  for (let g = 0; g < 3; g++) {
    const sign1 = norm1(lagnaSign + 1 + 8 + g);
    out.push(sign1 - 1);
    const forward = DIRECT.has(sign1 - 1);
    for (let k = 1; k <= 3; k++) {
      const off = forward ? 3 * k : -3 * k;
      let x = sign1 % 3 === 1 ? sign1 + off + 1 : sign1 + off - (sign1 % 3 === 2 ? 1 : 0);
      // Corrected: the count brought back to 1..12 as it is. See docs/spec/corrections.md.
      if (x < 0 && fidelity === 'pl9') x &= 0xff;
      out.push(norm1(x) - 1);
    }
  }
  return out;
}

/** The Navamsha's sign of the Lagna when odd; else the odd sign of the same lord (Leo for Cancer). */
function navamshaStart(chart: RashiChart): number {
  const l9 = signOf(chart.lagna * 9);
  return l9 % 2 === 0 ? l9 : ({ 1: 6, 3: 4, 5: 2, 7: 0, 9: 10, 11: 8 } as Record<number, number>)[l9]!;
}

/** Arudha Lagna by Parashara: as far from the lord as the lord from the Lagna; in the 1st or the 7th, the 10th from there. */
function arudhaLagna(chart: RashiChart): number {
  const lagna = signOf(chart.lagna);
  const lordSign = signOf(chart.longitudes[SIGN_LORDS[lagna]!]);
  const al = mod12(lordSign + (lordSign - lagna));
  return al === lagna || al === mod12(lagna + 6) ? mod12(al + 9) : al;
}

interface Plan {
  order: number[];
  years: (sign: number) => number;
  /** The first sign of the sub-periods of `sign`, and their direction, or the twelve of them. */
  subs: (sign: number) => number[];
  /** Years of the first mahadasha gone at birth. */
  elapsed?: number;
  /** The order of each run, when the runs differ; and whether every second run takes 12 years less. */
  runs?: (run: number) => number[];
  complementary?: boolean;
}

/**
 * The kendradi order as PL9 steps it from one period to the next: three signs on, four after every fourth; run
 * after run, so that each run starts four signs on from the last sign of the one before.
 */
const kendradiRun = (start: number, step: 1 | -1) => (run: number) =>
  Array.from({ length: 12 }, (_, i) => mod12(start + step * (39 * run + 3 * i + Math.floor(i / 4))));

/**
 * Sree Lagna as PL9 computes it for the dasha: the Moon's arc in its nakshatra, the nakshatra's span taken as
 * 13.3333 degrees, times 27, added to the Lagna.
 */
export function sreeLagna(chart: RashiChart): number {
  const moon = norm360(chart.longitudes.moon);
  return norm360((moon - Math.floor(moon / (40 / 3)) * 13.3333) * 27 + chart.lagna);
}

const fromStronger = (chart: RashiChart, start: RashiDashaChoices['antardashaStart']) => (sign: number) => {
  let first = strongerSign(sign % 6, (sign % 6) + 6, chart.longitudes);
  let step = sign % 2 === 0 ? 1 : -1;
  if (start === 'lord') {
    // From the sign of the lord of the stronger, in that sign's direction.
    first = signOf(chart.longitudes[SIGN_LORDS[first]!]);
    step = first % 2 === 0 ? 1 : -1;
  }
  return Array.from({ length: 12 }, (_, j) => mod12(first + step * j));
};

/** The order of the Narayana: from the stronger of the Lagna and the 7th, by its modality, in its direction. */
function narayanaOrder(chart: RashiChart): number[] {
  const lagna = signOf(chart.lagna);
  const first = strongerSign(lagna, mod12(lagna + 6), chart.longitudes);
  const step = rashiDirection(first, chart);
  // With Saturn in the first sign, one sign after another whatever its modality.
  return signOf(chart.longitudes.saturn) === first ? Array.from({ length: 12 }, (_, i) => mod12(first + step * i)) : byModality(first, step, 3);
}

/**
 * The Chara dasha of Parashara. Mahadashas from the stronger by points of the Lagna and the 7th, one sign after
 * another, in the direction the Lagna's 9th gives. Antardashas from the stronger by points of the sign (or, with
 * `fromLord`, of its lord's sign) and its 7th, forwards from an odd sign and backwards from an even one: one sign
 * after another from a movable sign, every 6th from a fixed one, and from a dual one three signs on, seven after
 * every fourth.
 */
function parasharaChara(chart: RashiChart, karakas: 7 | 8, fromLord: boolean): Pick<Plan, 'order' | 'subs'> {
  const lagna = signOf(chart.lagna);
  const stronger = (s: number) => strongerByPoints(s, mod12(s + 6), chart.longitudes, karakas);
  const first = stronger(lagna);
  const step = DIRECT.has(mod12(lagna + 8)) ? 1 : -1;
  return {
    order: Array.from({ length: 12 }, (_, i) => mod12(first + step * i)),
    subs: (sign) => {
      const start = stronger(fromLord ? signOf(chart.longitudes[SIGN_LORDS[sign]!]) : sign);
      const dir = start % 2 === 0 ? 1 : -1;
      const out = [start];
      for (let j = 1; j < 12; j++) out.push(mod12(out[j - 1]! + dir * (start % 3 === 0 ? 1 : start % 3 === 1 ? 5 : j % 4 === 0 ? 7 : 3)));
      return out;
    },
  };
}

function plan(system: RashiDashaSystem, chart: RashiChart, choices: RashiDashaChoices, karakas: 7 | 8, fidelity: Fidelity): Plan {
  const lagna = signOf(chart.lagna);
  const strongerOfLagna = strongerSign(lagna, mod12(lagna + 6), chart.longitudes);
  const years = (s: number) => rashiYears(s, chart, choices);
  const subs = fromStronger(chart, choices.antardashaStart);
  switch (system) {
    case 'chara': {
      if (choices.charaMethod === 'parashara') return { ...parasharaChara(chart, karakas, choices.charaAntarFromLord), years: (s) => parasharaCharaYears(s, chart, choices) };
      const step = (s: number) => (DIRECT.has(mod12(s + 8)) ? 1 : -1);
      return {
        order: Array.from({ length: 12 }, (_, i) => mod12(lagna + step(lagna) * i)),
        years: (s) => charaYears(s, chart),
        // From the next sign, in the direction the sign's 9th gives, the sign itself last.
        subs: (s) => Array.from({ length: 12 }, (_, j) => mod12(s + step(s) * (j + 1))),
      };
    }
    case 'narayana':
      return { order: narayanaOrder(chart), years, subs };
    case 'lagnaKendradi':
      return { order: kendradi(strongerOfLagna, rashiDirection(strongerOfLagna, chart)), years, subs };
    case 'sthira': {
      // From the sign of Brahma, through the zodiac: 7, 8 and 9 years by modality.
      const first = signOf(chart.longitudes[brahma(lagna, chart.longitudes, karakas)]);
      return { order: Array.from({ length: 12 }, (_, i) => mod12(first + i)), years: (s) => [7, 8, 9][s % 3]!, subs };
    }
    case 'sreeLagnaKendradi': {
      // From the sign of Sree Lagna, the part of its years gone as Sree Lagna's degrees in it; the kendras first.
      const sl = sreeLagna(chart);
      const first = signOf(sl);
      return {
        order: kendradi(first, rashiDirection(first, chart)), years, elapsed: ((sl % 30) / 30) * years(first),
        // The antardashas: the kendras first from the sign itself, in its own direction.
        subs: (sign) => kendradi(sign, rashiDirection(sign, chart)),
        runs: kendradiRun(first, rashiDirection(first, chart)), complementary: true,
      };
    }
    case 'shoola':
      return {
        order: Array.from({ length: 12 }, (_, i) => mod12(strongerOfLagna + i)),
        years: () => 9,
        subs: (s) => Array.from({ length: 12 }, (_, j) => mod12(s + (s % 2 === 0 ? 1 : -1) * j)),
      };
    case 'drig':
      return { order: drigOrder(lagna, fidelity), years, subs };
    case 'niryaanaShoola': {
      const first = strongerSign(mod12(lagna + 1), mod12(lagna + 7), chart.longitudes);
      const step = first % 2 === 0 ? 1 : -1;
      return { order: Array.from({ length: 12 }, (_, i) => mod12(first + step * i)), years: (s) => [7, 8, 9][s % 3]!, subs };
    }
    case 'navamsha': {
      const first = navamshaStart(chart);
      return { order: Array.from({ length: 12 }, (_, i) => mod12(first + i)), years: (s) => navamshaYears(s, chart), subs };
    }
    case 'padanadhamsa': {
      const d9 = navamshaChart(chart);
      const first = signOf(d9.longitudes[SIGN_LORDS[arudhaLagna(chart)]!]);
      const step = first % 2 === 0 ? 1 : -1;
      const sequence = (from: number) => {
        // The order of the first sign's modality, from each sign.
        if (first % 3 === 0) return Array.from({ length: 12 }, (_, i) => mod12(from + step * i));
        if (first % 3 === 1) return Array.from({ length: 12 }, (_, i) => mod12(from + step * 5 * i));
        return [0, 1, 2, 3].flatMap((g) => [0, 1, 2].map((k) => mod12(from + step * g + step * 4 * k)));
      };
      return { order: sequence(first), years: (s) => padanadhamsaYears(s, d9), subs: sequence };
    }
    default:
      throw new NotImplementedOptionError('system', system);
  }
}

const definedOnly = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

/**
 * The rashi dashas of PL9 that were measured: each run of twelve mahadashas from the first sign, each divided into
 * twelve equal antardashas. They begin at birth, without a balance. A sign of 0 years is passed over. See
 * docs/spec/dashas/rashi.md.
 */
export function rashiDashas(system: RashiDashaSystem, chart: RashiChart, jdUt: number, opts: RashiOptions, fidelity: Fidelity): DashaPeriod[] {
  // Partly read in the executable; its later runs and sub-periods do not yet match PL9's cells.
  if (system === 'sreeLagnaKendradi') throw new NotImplementedOptionError('system', `${system} (not measured yet)`);
  const p = plan(system, chart, { ...DEFAULT_RASHI_CHOICES, ...definedOnly(opts) }, opts.karakas ?? 7, fidelity);
  // Corrected: the second run of these gives each sign 12 years less those of the first, as the classical rule has it.
  const complementary = p.complementary || (fidelity === 'corrected' && (system === 'narayana' || system === 'lagnaKendradi' || system === 'drig'));
  const periods: DashaPeriod[] = [];
  let t = jdUt - (p.elapsed ?? 0) * opts.yearDays;
  for (let c = 0; c < opts.cycles; c++) {
    for (const sign of p.runs ? p.runs(c) : p.order) {
      const years = complementary && c % 2 === 1 ? 12 - p.years(sign) : p.years(sign);
      if (years <= 0) continue;
      const period: DashaPeriod = { lord: SIGN_NAMES[sign]!, start: t, end: t + years * opts.yearDays, level: 1 };
      if (opts.levels >= 2) {
        const length = (period.end - period.start) / 12;
        period.sub = p.subs(sign).map((s, j) => ({
          lord: SIGN_NAMES[s]!, start: period.start + j * length, end: j === 11 ? period.end : period.start + (j + 1) * length, level: 2,
        }));
      }
      periods.push(period);
      t = period.end;
    }
  }
  return periods;
}

/**
 * The signs of a rashi dasha running at an instant, five levels, as PL9 prints them ("Gochara data", the Events page),
 * read in the executable: the mahadashas in the system's order, and each period divided in twelve, in the order of
 * `subs` for the sign above, as many times as needed. The Chara keeps its years run after run. The Narayana gives every
 * second run 12 years less than the first; in the pl9 mode its parts below the mahadasha are timed by the
 * mahadasha's years of the first run for the first twelve of a level, of the second run for the next twelve, and so on
 * (PL9 counts the run by the parts of the level it is in): in a second run they do not fill the mahadasha, or run
 * past it. The corrected mode divides each period in twelve equal parts. An instant before birth takes the first sign
 * at every level. See docs/spec/time/transits.md.
 */
export function rashiChainAt(system: 'narayana' | 'chara', chart: RashiChart, birthJdUt: number, jdUt: number, yearDays: number, fidelity: Fidelity): number[] {
  if (!Number.isFinite(jdUt) || !Number.isFinite(birthJdUt)) throw new InvalidInputError('the instant and the birth must be numbers');
  const p = plan(system, chart, DEFAULT_RASHI_CHOICES, 7, fidelity);
  const yearsIn = (sign: number, step: number) => (system === 'chara' || Math.floor(step / 12) % 2 === 0 ? p.years(sign) : 12 - p.years(sign));
  // Each level steps from the start of the period above until the next part would end past the instant: at a boundary,
  // the period that starts there, as dashaChain.
  const walk = (length: (step: number) => number, t: number) => {
    for (let step = 0; ; step++) {
      const l = length(step);
      if (t + l > jdUt) return { step, start: t };
      t += l;
    }
  };
  const first = walk((step) => yearsIn(p.order[step % 12]!, step) * yearDays, birthJdUt);
  const lord = p.order[first.step % 12]!;
  const mahadasha = yearsIn(lord, first.step) * yearDays;
  const chain = [lord];
  let t = first.start;
  for (let level = 2; level <= 5; level++) {
    const order = p.subs(chain.at(-1)!);
    const part = (step: number) => (fidelity === 'pl9' ? yearsIn(lord, step) * yearDays : mahadasha) / 12 ** (level - 1);
    const at = walk(part, t);
    chain.push(order[at.step % 12]!);
    t = at.start;
  }
  return chain;
}

/** The Narayana at an instant (`rashiChainAt`). */
export function narayanaChainAt(chart: RashiChart, birthJdUt: number, jdUt: number, yearDays: number, fidelity: Fidelity): number[] {
  return rashiChainAt('narayana', chart, birthJdUt, jdUt, yearDays, fidelity);
}
