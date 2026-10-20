import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { NotImplementedOptionError } from '../options';
import { divisionIndex, norm360 } from '../zodiac';
import type { DashaPeriod } from './engine';
import { strongerSign } from './strength';

export const SIGN_NAMES = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;
export type SignLord = (typeof SIGN_NAMES)[number];

/** Years of each sign's mahadasha, Aries first. */
export const KALACHAKRA_YEARS: readonly number[] = [7, 16, 9, 21, 5, 9, 16, 7, 10, 4, 4, 10];

const PADA = 10 / 3;
const seq = (names: string) => names.split(' ').map((n) => SIGN_NAMES.findIndex((s) => s.startsWith(n)));
/** The savya sequences of the two groups, pada 1 to 4. */
const SAVYA_A = ['ari tau gem can leo vir lib sco sag', 'cap aqu pis sco lib vir can leo gem', 'tau ari pis aqu cap sag ari tau gem', 'can leo vir lib sco sag cap aqu pis'].map(seq);
const SAVYA_B = ['sco lib vir can leo gem tau ari pis', 'aqu cap sag ari tau gem can leo vir', 'lib sco sag cap aqu pis sco lib vir', 'can leo gem tau ari pis aqu cap sag'].map(seq);
/** The apasavya ones: each the reverse of a savya one, pada 1 of the fourth, pada 4 of the first. */
const APASAVYA_A = [3, 2, 1, 0].map((i) => [...SAVYA_A[i]!].reverse());
const APASAVYA_B = [3, 2, 1, 0].map((i) => [...SAVYA_B[i]!].reverse());
/** Each of the 27 nakshatras, Ashwini first: its sequences and whether they are savya. */
const NAKSHATRA_GROUP: { padas: number[][]; savya: boolean }[] = Array.from({ length: 27 }, (_, k) => {
  if ([1, 7, 13, 19, 25].includes(k)) return { padas: SAVYA_B, savya: true };
  if ([3, 9, 15, 21].includes(k)) return { padas: APASAVYA_B, savya: false };
  if ([4, 10, 16, 22, 5, 11, 17, 23].includes(k)) return { padas: APASAVYA_A, savya: false };
  return { padas: SAVYA_A, savya: true };
});

/**
 * The nine signs of the pada of a longitude, and its Deha and Jeeva: the first and the last sign of a savya sequence,
 * the last and the first of an apasavya one. Signs are 0 (Aries) to 11. See docs/spec/dashas/kalachakra.md.
 */
export function kalachakraPadaSequence(longitude: number): { sequence: number[]; savya: boolean; deha: number; jeeva: number; fraction: number; pada: number } {
  const lon = norm360(longitude);
  // A boundary belongs to the pada that begins there, whatever the rounding: as the chart's own padas.
  const p = divisionIndex(lon, 108);
  const group = NAKSHATRA_GROUP[Math.floor(p / 4)]!;
  const sequence = group.padas[p % 4]!;
  const [first, last] = [sequence[0]!, sequence[8]!];
  return { sequence, savya: group.savya, deha: group.savya ? first : last, jeeva: group.savya ? last : first, fraction: Math.min(Math.max(0, (lon - (p * 360) / 108) / PADA), 1 - 1e-15), pada: p };
}

/** The sequence of the pada `p`, 0 (Ashwini 1) to 107 (Revati 4). */
const padaSequence = (p: number) => NAKSHATRA_GROUP[Math.floor((((p % 108) + 108) % 108) / 4)]!.padas[(((p % 108) + 108) % 108) % 4]!;

/**
 * The stronger of a sign and its 7th, which starts the Kalachakra's sub-periods: PL9's own comparison of two signs
 * (`strongerSign`), the sign of the Aries-to-Virgo half first, so both signs of an axis get the same answer.
 */
export function strongerOfAxis(sign: number, longitudes: Record<Planet9, number>): number {
  const low = sign % 6;
  return strongerSign(low, low + 6, longitudes);
}

export interface KalachakraOptions {
  yearDays: number;
  levels: 1 | 2 | 3 | 4 | 5;
  /** How many runs of twelve mahadashas. */
  cycles: number;
  /** PL9's "Kalachakra": 9 or 12 antardashas. */
  antardashas: 12 | 9;
  /** PL9's "Continue mahadashas in following pada" or "Cycle through mahadasha within the same pada". */
  sequence: 'continue' | 'samePada';
}

export interface Kalachakra {
  periods: DashaPeriod[];
  savya: boolean;
  deha: number;
  jeeva: number;
}

/**
 * The Kalachakra dasha from the Moon's longitude, as PL9 computes it with twelve antardashas, mahadashas going on
 * through the zodiac from the one running at birth; corrected, they go on through the padas' sequences, and nine
 * antardashas and "within the same pada" are offered. `longitudes` are the nine grahas', for the stronger sign of each
 * axis. See docs/spec/dashas/kalachakra.md.
 */
export function kalachakraDashas(
  moonLongitude: number,
  longitudes: Record<Planet9, number>,
  jdUt: number,
  opts: KalachakraOptions,
  fidelity: Fidelity,
): Kalachakra {
  // Nine antardashas come out inconsistent in PL9, and it does not keep "within the same pada": only corrected.
  if (fidelity === 'pl9' && opts.antardashas !== 12) throw new NotImplementedOptionError('kalachakra.antardashas', `${opts.antardashas} in the pl9 mode`);
  if (fidelity === 'pl9' && opts.sequence !== 'continue') throw new NotImplementedOptionError('kalachakra.sequence', `${opts.sequence} in the pl9 mode`);
  const { sequence, savya, deha, jeeva, fraction, pada } = kalachakraPadaSequence(moonLongitude);
  // The part of the pada gone, in years of its sequence, finds the mahadasha running at birth.
  let gone = fraction * sequence.reduce((s, x) => s + KALACHAKRA_YEARS[x]!, 0);
  let i = 0;
  // A remainder within a billionth of a year of the sign's end belongs to the next sign: the period running at birth
  // always ends after it.
  while (i < 8 && gone >= KALACHAKRA_YEARS[sequence[i]!]! - 1e-9) gone = Math.max(0, gone - KALACHAKRA_YEARS[sequence[i++]!]!);
  const start = new Map<number, number>();
  const stronger = (s: number) => {
    if (!start.has(s)) start.set(s, strongerOfAxis(s, longitudes));
    return start.get(s)!;
  };
  const divide = (period: DashaPeriod, sign: number) => {
    if (period.level >= opts.levels) return;
    if (opts.antardashas === 9) {
      // Corrected: the nine signs from the period's own through the zodiac, each in proportion to its years.
      const signs = Array.from({ length: 9 }, (_, j) => (sign + j) % 12);
      const total = signs.reduce((a, x) => a + KALACHAKRA_YEARS[x]!, 0);
      const sub: DashaPeriod[] = [];
      let t = period.start;
      signs.forEach((s, j) => {
        const end = j === 8 ? period.end : t + ((period.end - period.start) * KALACHAKRA_YEARS[s]!) / total;
        const child: DashaPeriod = { lord: SIGN_NAMES[s]!, start: t, end, level: period.level + 1 };
        divide(child, s);
        sub.push(child);
        t = end;
      });
      period.sub = sub;
      return;
    }
    const from = stronger(sign);
    const step = sign % 2 === 0 ? 1 : -1;
    const length = (period.end - period.start) / 12;
    const sub: DashaPeriod[] = [];
    for (let j = 0; j < 12; j++) {
      const s = (((from + step * j) % 12) + 12) % 12;
      const child: DashaPeriod = { lord: SIGN_NAMES[s]!, start: period.start + j * length, end: j === 11 ? period.end : period.start + (j + 1) * length, level: period.level + 1 };
      divide(child, s);
      sub.push(child);
    }
    period.sub = sub;
  };
  const periods: DashaPeriod[] = [];
  let t = jdUt - gone * opts.yearDays;
  // The mahadashas after the one running at birth: PL9 goes on through the zodiac; corrected, the rest of the pada's
  // sequence, then the sequences of the following padas, or the same pada's again ("within the same pada").
  const signs: number[] = [];
  if (fidelity === 'pl9') for (let m = 0; m < 12 * opts.cycles; m++) signs.push((sequence[i]! + m) % 12);
  else {
    for (let n = 0, j = i; signs.length < 12 * opts.cycles; j++) {
      if (j === 9) { j = 0; if (opts.sequence === 'continue') n++; }
      signs.push(padaSequence(pada + n)[j]!);
    }
  }
  for (const sign of signs) {
    const period: DashaPeriod = { lord: SIGN_NAMES[sign]!, start: t, end: t + KALACHAKRA_YEARS[sign]! * opts.yearDays, level: 1 };
    divide(period, sign);
    periods.push(period);
    t = period.end;
  }
  return { periods, savya, deha, jeeva };
}
