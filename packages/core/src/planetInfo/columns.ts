import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import { aspectValue } from '../strengths/aspects';
import { dignity9 } from '../strengths/dignity';
import { vargaSign, type VargaName } from '../vargas';
import { norm360 } from '../zodiac';
import { naturalNatures } from '../yogas/natures';
import { finalDispositor } from './relations';

/** The other columns of PL9's planet tables (docs/spec/planet-info.md). */

const SEVEN: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const signOf = (lon: number) => Math.floor(norm360(lon) / 30);
const lordOf = (sign: number) => SIGN_LORDS[sign]! as Planet9;

export const SHADVARGA: VargaName[] = ['D1', 'D2', 'D3', 'D9', 'D12', 'D30'];
export const DASHAVARGA: VargaName[] = ['D1', 'D2', 'D3', 'D7', 'D9', 'D10', 'D12', 'D16', 'D30', 'D60'];

const OWN: Record<Planet9, number[]> = { sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11], venus: [1, 6], saturn: [9, 10], rahu: [], ketu: [] };
/** Signs of exaltation, the whole sign counting; the nodes count only through these, Rahu in Taurus, Ketu in Scorpio. */
const EXALTATION_SIGN: Record<Planet9, number> = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6, rahu: 1, ketu: 7 };

/** In how many of the vargas the planet is in its own sign or its sign of exaltation. V+ is this over the Shadvarga. */
export function goodVargas(planet: Planet9, longitude: number, vargas: VargaName[], fidelity: Fidelity): number {
  return vargas.filter((v) => { const s = vargaSign(longitude, v, fidelity); return OWN[planet].includes(s) || EXALTATION_SIGN[planet] === s; }).length;
}

/** Pushkara navamsa: fire signs in their 7th and 9th navamsa signs; earth and air ones in the 2nd and 12th; water ones in the 4th and 6th. */
export function pushkaraNavamsa(longitude: number, fidelity: Fidelity): boolean {
  const navamsa = vargaSign(longitude, 'D9', fidelity) + 1;
  const element = (signOf(longitude) + 1) & 3; // 1 fire, 2 earth, 3 air, 0 water
  return element === 1 ? navamsa === 7 || navamsa === 9 : element === 0 ? navamsa === 4 || navamsa === 6 : navamsa === 2 || navamsa === 12;
}

/** RN: the navamsa's sign counted from the rashi's, 1 to 12. */
export function navamsaFromRashi(longitude: number, fidelity: Fidelity): number {
  return ((vargaSign(longitude, 'D9', fidelity) - signOf(longitude) + 12) % 12) + 1;
}

/** HsLrd: the houses from the Lagna whose signs the planet rules, Sun to Saturn. */
export function housesRuled(planet: Planet9, lagnaSign: number): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1).filter((h) => lordOf((lagnaSign + h - 1) % 12) === planet);
}

const DEBILITATION_POINT: Partial<Record<Planet9, number>> = { sun: 190, moon: 213, mars: 118, mercury: 345, jupiter: 275, venus: 177, saturn: 20 };
const MAXIMUM_RAYS: Partial<Record<Planet9, number>> = { sun: 10, moon: 9, mars: 5, mercury: 5, jupiter: 7, venus: 8, saturn: 5 };
/** The factor of each of the nine dignities, exalted first. */
const RAY_FACTOR = [3, 2, 1.5, 1.333, 1.2, 1, 0.5, 0.4, 1];

/** Rays: the distance from the point of debilitation over 180, times the planet's rays, times its dignity's factor. */
export function rays(planet: Planet9, longitudes: Record<Planet9, number>): number | null {
  const debilitation = DEBILITATION_POINT[planet];
  if (debilitation === undefined) return null;
  const d = norm360(longitudes[planet] - debilitation);
  return (Math.min(d, 360 - d) / 180) * MAXIMUM_RAYS[planet]! * RAY_FACTOR[dignity9(planet, longitudes) - 1]!;
}

/** The degree of Mrityu Bhaga in each sign, Aries first, as PL9 has them. */
const MRITYU_BHAGA: Record<Planet9 | 'lagna', number[]> = {
  lagna: [1, 9, 22, 22, 25, 2, 4, 23, 18, 20, 24, 10],
  sun: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
  moon: [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
  mars: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
  mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
  jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
  venus: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
  saturn: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
  rahu: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
  ketu: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
};
/** The orb of Mrityu Bhaga, degrees. */
const MB_ORB = (p: Planet9 | 'lagna') => (p === 'lagna' ? 1 : ['sun', 'moon', 'mercury', 'venus'].includes(p) ? 2 / 3 : 0.5);

/** MB: the distance from the degree of Mrityu Bhaga, with its severity (1 − distance / orb), when inside the orb. */
export function mrityuBhaga(point: Planet9 | 'lagna', longitude: number): { distance: number; severity: number } | null {
  const distance = Math.abs((norm360(longitude) % 30) - MRITYU_BHAGA[point][signOf(longitude)]!);
  const orb = MB_ORB(point);
  const severity = 1 - distance / orb;
  return severity > 0 ? { distance, severity } : null;
}

/** SVdisp: the planets that rule the planet's sign in two or more of the Shadvarga, the most first. */
export function shadvargaSignLords(longitude: number, fidelity: Fidelity): { lord: Planet9; count: number }[] {
  const counts = new Map<Planet9, number>();
  for (const v of SHADVARGA) { const l = lordOf(vargaSign(longitude, v, fidelity)); counts.set(l, (counts.get(l) ?? 0) + 1); }
  return [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || SEVEN.indexOf(a[0]) - SEVEN.indexOf(b[0])).map(([lord, count]) => ({ lord, count }));
}

const ELEMENTS = ['water', 'fire', 'earth', 'air'] as const; // by sign & 3: Aries 0 is fire, so index (sign + 1) & 3
const MODES = ['dual', 'movable', 'fixed'] as const;
export type SignQuality = (typeof ELEMENTS)[number] | (typeof MODES)[number];
/** The order PL9 breaks ties in. */
const QUALITY_ORDER: SignQuality[] = ['water', 'fire', 'earth', 'air', 'dual', 'movable', 'fixed'];

/** SVelem: the three most frequent elements or modes of the planet's signs over the Shadvarga, with their counts. */
export function shadvargaElements(longitude: number, fidelity: Fidelity): { quality: SignQuality; count: number }[] {
  const counts = new Map<SignQuality, number>();
  for (const v of SHADVARGA) {
    const n = vargaSign(longitude, v, fidelity) + 1; // 1 Aries to 12 Pisces
    for (const q of [ELEMENTS[n & 3]!, MODES[n % 3]!]) counts.set(q, (counts.get(q) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || QUALITY_ORDER.indexOf(a[0]) - QUALITY_ORDER.indexOf(b[0])).slice(0, 3).map(([quality, count]) => ({ quality, count }));
}

/**
 * Domin.: how much the planet stands out, PL9's weighted sum: in the 1st house, closer to the Lagna more; with the Moon,
 * the Sun, the Lagna lord and the lords of the Moon's and the Sun's signs, or being one of these lords; being the final
 * dispositor of the Lagna lord; and its graded aspects on the Lagna, the Lagna lord, the Moon, the Sun and those lords.
 * A node's aspects count four fifths, and none on a target whose sign holds the other node.
 */
export function dominance(planet: Planet9, longitudes: Record<Planet9, number>, lagna: number): number {
  const sign = (p: Planet9) => signOf(longitudes[p]);
  const lagnaLord = lordOf(signOf(lagna)), moonLord = lordOf(sign('moon')), sunLord = lordOf(sign('sun'));
  const together = (a: Planet9, b: Planet9) => a !== b && sign(a) === sign(b);
  let score = 0;
  if (sign(planet) === signOf(lagna)) { const d = norm360(longitudes[planet] - lagna); score += 1 - Math.min(d, 360 - d) / 30; }
  if (together(planet, 'moon')) score += 0.75;
  if (together(planet, 'sun')) score += 0.5;
  for (const [lord, own, joined] of [[lagnaLord, 1, 0.75], [moonLord, 0.75, 0.5], [sunLord, 0.5, 0.3]] as const) {
    if (planet === lord) score += own; else if (together(planet, lord)) score += joined;
  }
  if (planet === finalDispositor(lagnaLord, longitudes)) score += 0.25;
  const node = planet === 'rahu' || planet === 'ketu';
  const otherNode = planet === 'rahu' ? 'ketu' : 'rahu';
  const aspect = (target: number, weight: number) => {
    if (node && signOf(target) === sign(otherNode)) return 0;
    return (aspectValue(planet, norm360(target - longitudes[planet])) / 60) * weight;
  };
  const on = (p: Planet9, weight: number) => (p === planet ? 0 : aspect(longitudes[p], weight));
  let aspects = aspect(lagna, 1) + on(lagnaLord, 0.75) + on('moon', 0.75) + on('sun', 0.5) + on(moonLord, 0.5) + on(sunLord, 0.3);
  if (node) aspects /= 1.25;
  return score + aspects;
}


/**
 * Argala, PL9's count: for each pair of signs counted from the planet's (2nd against 12th, 4th against 10th, 5th
 * against 9th, 11th against 3rd; backwards for the nodes), the planets of each sign by quarter of the sign (7.5° each),
 * and the excess, never negative, of the argala sign's planets in a quarter over the obstructing sign's in the mirror
 * quarter, summed. Three more when the 3rd from the planet holds more than two natural malefics (the Moon waning and
 * Mercury with malefics among them, as the yogas take the natural natures).
 */
export function argala(planet: Planet9, longitudes: Record<Planet9, number>): number {
  const nine = Object.keys(longitudes) as Planet9[];
  const quarters = (sign: number) => {
    const q = [0, 0, 0, 0];
    for (const p of nine) if (signOf(longitudes[p]) === sign) q[Math.trunc((norm360(longitudes[p]) % 30) / 7.5)]!++;
    return q;
  };
  const back = planet === 'rahu' || planet === 'ketu';
  const from = (h: number) => (((signOf(longitudes[planet]) + (back ? -(h - 1) : h - 1)) % 12) + 12) % 12;
  let total = 0;
  for (const [a, b] of [[2, 12], [4, 10], [5, 9], [11, 3]] as const) {
    const qa = quarters(from(a)), qb = quarters(from(b));
    for (let k = 0; k < 4; k++) total += Math.max(0, qa[k]! - qb[3 - k]!);
  }
  const natures = naturalNatures(longitudes);
  if (nine.filter((p) => natures[p] === 'malefic' && signOf(longitudes[p]) === from(3)).length > 2) total += 3;
  return total;
}

/**
 * House effect, whole signs: full at the Lagna's degree within the sign and nothing at the sign's edges, as a percent:
 * 100 minus round(100 x the distance from the Lagna's degree over the room on that side).
 */
export function houseEffect(longitude: number, lagna: number): number {
  const d = norm360(longitude) % 30, a = norm360(lagna) % 30;
  const room = d < a ? a : 30 - a;
  return 100 - Math.round((100 * Math.abs(d - a)) / room);
}
