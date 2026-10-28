import type { Fidelity } from '../fidelity';
import { nakshatra28 } from '../dashas/engine';
import type { Planet9 } from '../jaimini';
import { dignity9 } from '../strengths/dignity';
import { DEFAULT_NATURES, naturalNatures, type NatureTable } from '../yogas/natures';
import { norm360 } from '../zodiac';

/**
 * PL9's transit chakras beyond the places (docs/spec/time/transits.md): the Kota Chakra's score, the Sanghatta
 * Chakra's vedhas and the Sarvatobhadra Chakra's, read in PL9 and checked against its printed pages.
 */

const NINE: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const NAKSHATRA = 40 / 3;
const MALEFIC = new Set<Planet9>(['sun', 'mars', 'saturn', 'rahu', 'ketu']);

export interface TransitBody { longitude: number; speed: number }

/** The signs (1 Aries … 12 Pisces) each planet rules; the nodes none. Higher sign first, as PL9 takes them. */
const RULES: Record<Planet9, number[]> = { sun: [5], moon: [4], mars: [8, 1], mercury: [6, 3], jupiter: [12, 9], venus: [7, 2], saturn: [11, 10], rahu: [], ketu: [] };
const BASE: Partial<Record<Planet9, number>> = { sun: -0.75, mars: -1, mercury: 0.75, jupiter: 1, venus: 1, saturn: -1, rahu: -1, ketu: -0.75 };
/** The navamsha sign (1 to 12) of each planet's debilitation, Rahu Scorpio and Ketu Taurus. */
const DEBILITATED_IN_NAVAMSHA: Record<Planet9, number> = { sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1, rahu: 8, ketu: 2 };
const ORB: Partial<Record<Planet9, [number, number]>> = { mars: [17, 17], mercury: [14, 12], jupiter: [11, 11], venus: [10, 8], saturn: [15, 15] };
/** The places counted once as within the Stambha and the Madhya, and once more as on the inward roads. */
const WITHIN = new Set([3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26]);
const INWARD = new Set([1, 2, 3, 8, 9, 10, 15, 16, 17, 22, 23, 24]);

/** Truncates x × 10 toward zero, exactly (PL9 multiplies in extended precision before cutting), and divides by 10. */
function truncTenths(x: number): number {
  if (x === 0 || !Number.isFinite(x)) return 0;
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, Math.abs(x));
  const bits = buf.getBigUint64(0);
  const exp = Number((bits >> 52n) & 0x7ffn);
  const mantissa = (bits & ((1n << 52n) - 1n)) | (exp === 0 ? 0n : 1n << 52n);
  const shift = BigInt((exp === 0 ? 1 : exp) - 1075);
  const tenths = shift >= 0n ? (mantissa * 10n) << shift : (mantissa * 10n) >> -shift;
  return (Math.sign(x) * Number(tenths)) / 10 || 0;
}

/**
 * The Kota Chakra's score (read in PL9): for each planet in transit a value built up step by step — its base (the
 * Moon's from the tithi), a quarter more of the same sign when retrograde, ±0.15 by the transit sign's parity, ±0.3 for
 * each house it rules from the natal Lagna (2, 6, 7, 8, 12 less, 1, 5, 9 more), less for debilitation in the sign
 * (0.5) and in the navamsha (0.25), the Baladi "dead" (−0.12) and "adolescent" (+0.25), less by the depth of its
 * combustion, ±0.25 when hemmed by malefics or benefics, more for exaltation in the sign (0.5) and the navamsha (0.25) —
 * then the values of the planets on the inner places are summed, the places of both the inner squares and the inward
 * roads twice. PL9 finds the place from the transit's nakshatra among 27 less the natal Moon's among 28, so a planet
 * past Uttara Ashadha counts one place before where it is drawn; the pl9 mode keeps that, the corrected one uses the
 * drawn place.
 */
export function kotaScore(natal: { moon: number; lagna: number }, transit: Record<Planet9, TransitBody>, fidelity: Fidelity = 'pl9', natureTable: NatureTable = DEFAULT_NATURES): { score: number; values: Record<Planet9, number>; places: Record<Planet9, number> } {
  const lon = Object.fromEntries(NINE.map((p) => [p, norm360(transit[p].longitude)])) as Record<Planet9, number>;
  const nature = naturalNatures(lon, natureTable);
  const tithi = Math.floor(norm360(lon.moon - lon.sun) / 12) + 1;
  const lagnaSign = Math.floor(norm360(natal.lagna) / 30);
  const moon28 = nakshatra28(natal.moon, fidelity).index;
  const order = [...NINE].sort((a, b) => lon[a] - lon[b]);
  const values = {} as Record<Planet9, number>, places = {} as Record<Planet9, number>;
  let total = 0;
  for (const p of NINE) {
    const l = lon[p], sign = Math.floor(l / 30) + 1, degree = l % 30;
    let x = p === 'moon' ? (tithi < 15 ? (tithi - 5) / 15 : (25 - tithi) / 15) : BASE[p]!;
    if (p !== 'rahu' && p !== 'ketu' && transit[p].speed < 0) x = x < 0 ? x - 0.25 : x + 0.25;
    x = sign % 2 === 1 ? x - 0.15 : x + 0.15;
    for (const ruled of RULES[p]) {
      const house = ((ruled - 1 - lagnaSign + 24) % 12) + 1;
      if ([2, 6, 7, 8, 12].includes(house)) x -= 0.3;
      if ([1, 5, 9].includes(house)) x += 0.3;
    }
    const dignity = dignity9(p, lon);
    const navamsha = (Math.floor((l * 9) / 30) % 12) + 1;
    if (dignity === 9) x -= 0.5;
    if (navamsha === DEBILITATED_IN_NAVAMSHA[p]) x -= 0.25;
    const band = Math.floor(degree / 6) + 1;
    const baladi = sign % 2 === 1 ? 6 - band : band;
    if (baladi === 1) x -= 0.12;
    const orb = ORB[p];
    if (orb) {
      const within = orb[transit[p].speed < 0 ? 1 : 0];
      const distance = Math.abs(norm360(l - lon.sun + 180) - 180);
      if (distance < within) x -= (100 - (distance * 100) / within) / 100;
    }
    const at = order.indexOf(p), before = order[(at + 8) % 9]!, after = order[(at + 1) % 9]!;
    const flanked = Math.floor(lon[before] / 30) === sign - 1 || Math.floor(lon[after] / 30) === sign - 1;
    const hemmed = !flanked ? 0 : nature[before] === 'malefic' && nature[after] === 'malefic' ? -1 : nature[before] === 'benefic' && nature[after] === 'benefic' ? 1 : 0;
    if (hemmed === -1) x -= 0.25;
    if (dignity === 1) x += 0.5;
    if (((navamsha + 5) % 12) + 1 === DEBILITATED_IN_NAVAMSHA[p]) x += 0.25;
    if (baladi === 3) x += 0.25;
    if (hemmed === 1) x += 0.25;
    const drawn = ((nakshatra28(l, fidelity).index - moon28 + 28) % 28) + 1;
    const place = fidelity === 'pl9' ? ((Math.floor(l / NAKSHATRA) + 1 - moon28 - 1 + 28 * 2) % 28) + 1 : drawn;
    if (WITHIN.has(place)) total += x;
    if (INWARD.has(place)) total += x;
    values[p] = x;
    places[p] = place;
  }
  return { score: truncTenths(total), values, places };
}

/** The 108 padas of 3°20' from 0° Aries. */
const pada = (l: number) => Math.floor(norm360(l) / (NAKSHATRA / 4));

/**
 * The Sanghatta Chakra's vedhas (from PL9's printed wheels): a transit planet pierces a natal one when their padas add
 * up to 35 modulo 36 and do not lie in the same third of the zodiac from Aries; green for a natural benefic, red for a
 * malefic.
 */
export function sanghattaVedhas(natal: Record<Planet9, number>, transit: Record<Planet9, number>, natureTable: NatureTable = DEFAULT_NATURES): { transit: Planet9; natal: Planet9; benefic: boolean }[] {
  const tLon = Object.fromEntries(NINE.map((p) => [p, norm360(transit[p])])) as Record<Planet9, number>;
  const nature = naturalNatures(tLon, natureTable);
  const out: { transit: Planet9; natal: Planet9; benefic: boolean }[] = [];
  for (const t of NINE) for (const n of NINE) {
    const a = pada(tLon[t]), b = pada(natal[n]);
    if ((a + b) % 36 === 35 && Math.floor(a / 36) !== Math.floor(b / 36)) out.push({ transit: t, natal: n, benefic: nature[t] === 'benefic' });
  }
  return out;
}

/** The mean daily motion PL9 compares a planet's speed with, degrees (Mercury and Venus take the Sun's). */
const MEAN: Record<Planet9, number> = {
  sun: 0.9855555555555555, moon: 13.176666666666666, mars: 0.6166666666666667, mercury: 0.9855555555555555, jupiter: 0.0811111111111111,
  venus: 0.9855555555555555, saturn: 0.03361111111111111, rahu: 0.05299261047487267, ketu: 0.05299261047487267,
};
export type SbcCell = [row: number, column: number];
/** Where a nakshatra among 28 (1 Ashwini … 28 Revati, Abhijit 22) sits on the 9×9 grid's border, and on which side. */
function border(n: number): { cell: SbcCell; side: 1 | 2 | 3 | 4 } {
  if (n < 3) return { cell: [4 - n, 1], side: 4 };
  if (n < 10) return { cell: [1, n - 1], side: 1 };
  if (n <= 16) return { cell: [n - 8, 9], side: 2 };
  if (n < 24) return { cell: [9, 25 - n], side: 3 };
  return { cell: [32 - n, 1], side: 4 };
}
/** The step of a diagonal by the side and the motion: 1 the planet's left (slow), 3 its right (fast or retrograde). */
const STEP: Record<string, [number, number]> = { '1,1': [1, 1], '1,3': [1, -1], '2,1': [1, -1], '2,3': [-1, -1], '3,1': [-1, -1], '3,3': [-1, 1], '4,1': [-1, 1], '4,3': [1, 1] };
/** The padas next to a corner: the last of Bharani, Ashlesha, Vishakha, Shravana, the first of Krittika, Magha, Anuradha, Dhanishta. */
const CORNER: Record<string, SbcCell> = { '2,4': [1, 1], '3,1': [1, 1], '9,4': [1, 9], '10,1': [1, 9], '16,4': [9, 9], '17,1': [9, 9], '23,4': [9, 1], '24,1': [9, 1] };

export interface SbcVedha {
  planet: Planet9;
  benefic: boolean;
  /** 1 slow (or the luminaries), 2 at its mean pace, 3 fast or retrograde (the nodes always). */
  motion: 1 | 2 | 3;
  /** The planet's cell on the border, the lines it draws, and the cells it pierces. */
  from: SbcCell;
  lines: [SbcCell, SbcCell][];
  cells: SbcCell[];
}

/**
 * The Sarvatobhadra Chakra's vedhas (read in PL9): each transit planet from its nakshatra's cell on the 9×9 border —
 * straight across to the opposite cell at its mean pace, along a diagonal to its left when slow (and the Sun and Moon)
 * or to its right when fast or retrograde (and the nodes) until it leaves the grid; a planet in the pada next to a
 * corner also pierces the corner's vowel and its diagonal to the centre. Rows and columns 1 to 9 from the top left.
 */
export function sarvatobhadraVedhas(transit: Record<Planet9, TransitBody>, fidelity: Fidelity = 'pl9'): SbcVedha[] {
  return NINE.map((p) => {
    const l = norm360(transit[p].longitude), n = nakshatra28(l, fidelity).index + 1;
    const { cell: [r0, c0], side } = border(n);
    // A stationary planet (speed 0) counts as slow.
    const ratio = transit[p].speed === 0 ? Infinity : MEAN[p] / transit[p].speed;
    const motion: 1 | 2 | 3 = p === 'sun' || p === 'moon' ? 1 : p === 'rahu' || p === 'ketu' ? 3 : ratio < 0.5 ? 3 : ratio <= 1.5 ? 2 : 1;
    const lines: [SbcCell, SbcCell][] = [], cells: SbcCell[] = [];
    if (motion === 2) {
      const to: SbcCell = side === 1 ? [9, c0] : side === 3 ? [1, c0] : side === 2 ? [r0, 1] : [r0, 9];
      lines.push([[r0, c0], to]);
      cells.push(to);
    } else {
      const [dr, dc] = STEP[`${side},${motion}`]!;
      let r = r0, c = c0;
      while (r + dr >= 1 && r + dr <= 9 && c + dc >= 1 && c + dc <= 9) { r += dr; c += dc; cells.push([r, c]); }
      lines.push([[r0, c0], [r, c]]);
    }
    const quarter = Math.floor((l % NAKSHATRA) / (NAKSHATRA / 4)) + 1;
    const corner = CORNER[`${n},${quarter}`];
    if (corner) {
      lines.push([[r0, c0], corner], [corner, [5, 5]]);
      cells.push(corner);
      const dr = corner[0] === 1 ? 1 : -1, dc = corner[1] === 1 ? 1 : -1;
      for (let r = corner[0], c = corner[1]; r !== 5 || c !== 5;) { r += dr; c += dc; cells.push([r, c]); }
    }
    return { planet: p, benefic: !MALEFIC.has(p), motion, from: [r0, c0], lines, cells };
  });
}
