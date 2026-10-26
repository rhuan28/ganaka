import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { norm360 } from '../zodiac';
import {
  ganaOf, ganaScore, maitri, mutualFriends, nadiOf, signGap, signLord, taraCount, varna, vashya, vashyaScore, yoniOf, yoniScore,
  type Nakshatra, type Sign,
} from './koota';

/**
 * The compatibility of two charts as PL9's "Compatibility - Kutas" and Mangala Dosha pages give it
 * (docs/spec/compatibility.md): the Ashtakoota (36), the Dashkoota (44), the distances in signs and nakshatras between
 * the two charts' points, and the Mangala Dosha of each chart.
 */

export interface Person { input: ChartInput; sex: 'male' | 'female' }
export interface CompatibilityOptions {
  /** The point the kootas read: the Moon (PL9's default) or the Lagna. */
  point?: 'moon' | 'lagna';
}
export interface KootaRow { name: string; max: number; score: number; dosha?: boolean }
export interface Compatibility {
  /** Which of the two is read as the bride: the partner if a woman, else the native if a woman, else the partner. */
  bride: 'native' | 'partner';
  ashtakoota: { rows: KootaRow[]; total: number; verdict: 'avoid' | 'medium' | 'good' | 'excellent' | null };
  dashkoota: { rows: KootaRow[]; total: number; cancelled: boolean; verdict: 'avoid' | 'medium' | 'good' | 'excellent' | null };
  /** Per point, Asc and Sun to Ketu: signs and nakshatras counted from the native's to the partner's and back. */
  distances: Partial<Record<'lagna' | Planet9, {
    signs: [number, number]; nakshatras: [number, number];
    /** The point's sign (1 to 12) and nakshatra (1 to 27) in each chart. */
    native: { sign: number; nakshatra: number }; partner: { sign: number; nakshatra: number };
  }>>;
  /** Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna and from the Moon, per chart; null without a Lagna. */
  mangala: { native: MangalaDosha; partner: MangalaDosha };
  missing: { field: string; reason: string }[];
}
export interface MangalaDosha { fromLagna: boolean | null; fromMoon: boolean; marsHouseFromLagna: number | null; marsHouseFromMoon: number }

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

interface At { sign: Sign; nakshatra: Nakshatra; degree: number }
const at = (lon: number): At => ({ sign: Math.floor(norm360(lon) / 30) + 1, nakshatra: Math.floor(norm360(lon) / (360 / 27)) + 1, degree: norm360(lon) % 30 });
const houseFrom = (from: number, to: number) => ((((to - from) % 12) + 12) % 12) + 1;

const band = (total: number, cuts: [number, number, number]) => {
  // PL9 compares whole numbers: a total with a half point falls between the bands and gets no verdict.
  if (!Number.isInteger(total)) return null;
  return total <= cuts[0] ? 'avoid' : total <= cuts[1] ? 'medium' : total <= cuts[2] ? 'good' : 'excellent';
};

export function ashtakoota(bride: At, groom: At): Compatibility['ashtakoota'] {
  const gana = ganaScore(ganaOf(bride.nakshatra), ganaOf(groom.nakshatra));
  const bhakoot = [0, 2, 3, 6, 9, 10].includes(signGap(bride.sign, groom.sign)) ? 7 : 0;
  const nadi = nadiOf(bride.nakshatra) === nadiOf(groom.nakshatra) ? 0 : 8;
  const rows: KootaRow[] = [
    { name: 'varna', max: 1, score: varna(bride.sign) <= varna(groom.sign) ? 1 : 0 },
    { name: 'vashya', max: 2, score: vashyaScore(vashya(bride.sign, bride.degree), vashya(groom.sign, groom.degree)) },
    { name: 'tara', max: 3, score: taraCount(bride.nakshatra, groom.nakshatra) <= 2 ? 3 : 1.5 },
    { name: 'yoni', max: 4, score: yoniScore(yoniOf(bride.nakshatra), yoniOf(groom.nakshatra)) },
    { name: 'grahamaitri', max: 5, score: maitri(bride.sign, groom.sign) },
    { name: 'gana', max: 6, score: gana, dosha: gana === 0 },
    { name: 'bhakoot', max: 7, score: bhakoot, dosha: bhakoot === 0 },
    { name: 'nadi', max: 8, score: nadi, dosha: nadi === 0 },
  ];
  const total = rows.reduce((s, r) => s + r.score, 0);
  return { rows, total, verdict: band(total, [16, 20, 30]) };
}

const DHINAM_SAME_3 = [4, 6, 10, 13, 16, 22, 26, 27], DHINAM_SAME_0 = [2, 9, 15, 18, 19, 23, 24, 25];
const DHINAM_ZERO_PAIRS = ['2,23', '3,24', '9,3', '15,9', '19,13', '20,14', '23,17', '24,18', '5,12'];
const YONI_ENEMIES = ['ashwa-mahisha', 'gaja-mriga', 'mesha-vanara', 'sarpa-nakula', 'sarpa-mushaka', 'shwana-mriga', 'marjara-mushaka', 'gau-vyaghra'];
const RASHI_HALF = ['1,6', '3,8', '5,10', '7,12', '9,2', '11,4'];
/** PL9's Vashyam: the signs each sign holds in its sway. */
const VASHYAM: number[][] = [[10, 11], [], [6], [2, 8], [1, 2], [3, 8], [5], [1, 4], [4], [7, 12], [10], [6, 9]];
const RAJJU = [[1, 9, 10, 18, 19, 27], [2, 8, 11, 17, 20, 26], [3, 7, 12, 16, 21, 25], [4, 6, 13, 15, 22, 24], [5, 14, 23]];
const VEDHA = ['1-18', '2-17', '3-16', '4-15', '5-14', '5-23', '14-23', '6-22', '7-21', '8-20', '9-19', '10-27', '11-26', '12-25', '13-24'];
const MALE_NAKSHATRAS = [1, 3, 4, 7, 8, 13, 17, 25, 26, 27], NEUTER_NAKSHATRAS = [5, 19, 24];
const GOTHRA_ENDS = [4, 8, 12, 16, 20, 23, 27];

export function dashkoota(bride: At, groom: At): Compatibility['dashkoota'] {
  const b = bride.nakshatra, g = groom.nakshatra;
  // The kootas soften when the Moon signs' lords are one, the signs are opposite, or the lords are friends both ways.
  const cancelled = signLord(bride.sign) === signLord(groom.sign) || signGap(bride.sign, groom.sign) === 6 || mutualFriends(bride.sign, groom.sign);
  let dhinam: number;
  if (b === g) dhinam = DHINAM_SAME_3.includes(b) ? 3 : DHINAM_SAME_0.includes(b) ? 0 : 1.5;
  else if (DHINAM_ZERO_PAIRS.includes(`${b},${g}`)) dhinam = 0;
  else if (b === 8 && g === 14) dhinam = 3;
  else { const c = taraCount(b, g); dhinam = c === 1 ? 1.5 : [3, 5, 7].includes(c) ? 0 : 3; }
  let ganam = ganaScore(ganaOf(b), ganaOf(g));
  if (cancelled && ganam < 3) ganam = 3;
  const count27 = ((g - b + 27) % 27) + 1;
  const mahendram = [4, 7, 10, 13, 16, 19, 22, 25].includes(count27) ? 2 : 0;
  const streeDeergham = (g - b + 27) % 27 < 13 ? 0 : 2;
  const yb = yoniOf(b), yg = yoniOf(g);
  const yoni = yb === yg ? 4 : YONI_ENEMIES.includes(`${yb}-${yg}`) || YONI_ENEMIES.includes(`${yg}-${yb}`) ? 0 : 2;
  const d = signGap(bride.sign, groom.sign);
  let rashi = d === 0 || d >= 6 ? 7 : d === 1 ? (bride.sign % 2 === 1 ? 0 : 3.5) : 0;
  if (RASHI_HALF.includes(`${bride.sign},${groom.sign}`)) rashi = 3.5;
  if (cancelled && rashi < 3.5) rashi = 3.5;
  const vashyam = VASHYAM[bride.sign - 1]!.includes(groom.sign) || VASHYAM[groom.sign - 1]!.includes(bride.sign) ? 2 : 0;
  let rajju = RAJJU.findIndex((r) => r.includes(b)) === RAJJU.findIndex((r) => r.includes(g)) ? 0 : 8;
  if (cancelled) rajju = 4; // PL9 sets it to 4, even from 8
  let vedhai = VEDHA.includes(`${b}-${g}`) || VEDHA.includes(`${g}-${b}`) ? 0 : 2;
  if (cancelled) vedhai = 1; // PL9 sets it to 1, even from 2
  const sexOf = (n: number) => (MALE_NAKSHATRAS.includes(n) ? 'm' : NEUTER_NAKSHATRAS.includes(n) ? 'n' : 'f');
  const gender = sexOf(b) === 'f' && sexOf(g) === 'm' ? 1 : sexOf(b) === 'm' && sexOf(g) === 'f' ? 0 : 0.5;
  const gothra = (n: number) => GOTHRA_ENDS.findIndex((e) => n <= e);
  const rows: KootaRow[] = [
    { name: 'dhinam', max: 3, score: dhinam },
    { name: 'ganam', max: 6, score: ganam },
    { name: 'mahendram', max: 2, score: mahendram },
    { name: 'streeDeergham', max: 2, score: streeDeergham },
    { name: 'yoni', max: 4, score: yoni },
    { name: 'rashi', max: 7, score: rashi },
    { name: 'rashiadhipati', max: 5, score: maitri(bride.sign, groom.sign) },
    { name: 'vashyam', max: 2, score: vashyam },
    { name: 'rajju', max: 8, score: rajju },
    { name: 'vedhai', max: 2, score: vedhai },
    { name: 'gender', max: 1, score: gender },
    { name: 'gothram', max: 1, score: gothra(b) === gothra(g) ? 0 : 1 },
    { name: 'caste', max: 1, score: varna(bride.sign) <= varna(groom.sign) ? 1 : 0 },
  ];
  // PL9's total counts the caste with earth and air swapped, though its row does not: the total is not the rows' sum.
  const casteInTotal = varna(bride.sign, true) <= varna(groom.sign, true) ? 1 : 0;
  const total = rows.reduce((s, r) => s + r.score, 0) - rows.at(-1)!.score + casteInTotal;
  return { rows, total, cancelled, verdict: band(total, [19, 27, 37]) };
}

export function computeCompatibility(eph: Ephemeris, native: Person, partner: Person, options: CompatibilityOptions = {}, coreOptions?: Partial<CoreOptions>): Compatibility {
  const core = resolveOptions(coreOptions);
  const pos = [computePositions(eph, native.input, core), computePositions(eph, partner.input, core)] as const;
  const missing: Compatibility['missing'] = [];
  const point = options.point ?? 'moon';
  const of = (i: 0 | 1) => (point === 'lagna' ? pos[i].points.lagna?.longitude : pos[i].points.moon.longitude);
  // The bride, as PL9 reads the pair (the partner is its first chart): the partner if a woman, else the native if a
  // woman, else the partner.
  const brideIsNative = partner.sex !== 'female' && native.sex === 'female';
  const [bi, gi] = brideIsNative ? [0, 1] as const : [1, 0] as const;
  const bl = of(bi), gl = of(gi);
  const empty = { rows: [], total: 0, verdict: null };
  if (bl === undefined || gl === undefined) missing.push({ field: 'kootas', reason: 'needs the Lagna' });
  const distances: Compatibility['distances'] = {};
  for (const p of ['lagna', ...NINE] as const) {
    const a = pos[0].points[p]?.longitude, b = pos[1].points[p]?.longitude;
    if (a === undefined || b === undefined) continue;
    const x = at(a), y = at(b);
    distances[p] = {
      signs: [houseFrom(x.sign, y.sign), houseFrom(y.sign, x.sign)], nakshatras: [taraCount(x.nakshatra, y.nakshatra), taraCount(y.nakshatra, x.nakshatra)],
      native: { sign: x.sign, nakshatra: x.nakshatra }, partner: { sign: y.sign, nakshatra: y.nakshatra },
    };
  }
  const mangala = (i: 0 | 1): MangalaDosha => {
    const mars = Math.floor(pos[i].points.mars.longitude / 30), moon = Math.floor(pos[i].points.moon.longitude / 30);
    const lagna = pos[i].points.lagna;
    const fromLagna = lagna ? houseFrom(Math.floor(lagna.longitude / 30), mars) : null;
    const fromMoon = houseFrom(moon, mars);
    return { fromLagna: fromLagna === null ? null : DOSHA_HOUSES.includes(fromLagna), fromMoon: DOSHA_HOUSES.includes(fromMoon), marsHouseFromLagna: fromLagna, marsHouseFromMoon: fromMoon };
  };
  return {
    bride: brideIsNative ? 'native' : 'partner',
    ashtakoota: bl === undefined || gl === undefined ? empty : ashtakoota(at(bl), at(gl)),
    dashkoota: bl === undefined || gl === undefined ? { ...empty, cancelled: false } : dashkoota(at(bl), at(gl)),
    distances,
    mangala: { native: mangala(0), partner: mangala(1) },
    missing,
  };
}
