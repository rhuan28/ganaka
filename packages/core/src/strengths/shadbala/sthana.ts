import type { Planet9 } from '../../jaimini';
import { SIGN_LORDS } from '../../specialLagnas';
import { vargaSign, type VargaName } from '../../vargas';
import { norm360 } from '../../zodiac';
import { NATURAL, SEVEN, type Planet7 } from '../dignity';
import type { Fidelity } from '../../fidelity';
import type { ShadbalaOptions } from './types';

/** Sthana Bala, the strength of place, and its five parts. See docs/spec/forcas/shadbala.md. */

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const distance = (a: number, b: number) => { const d = norm360(a - b); return d > 180 ? 360 - d : d; };

/** Points of debility, whole degrees. */
export const DEBILITY: Record<Planet7, number> = { sun: 190, moon: 213, mars: 118, mercury: 345, jupiter: 275, venus: 177, saturn: 20 };

/** Uchcha Bala: the distance from the point of debility, a third. */
export const uchcha = (p: Planet7, longitudes: Record<Planet9, number>) => distance(longitudes[p], DEBILITY[p]) / 3;

/** Moolatrikona in the birth chart: sign, and the degrees inside which it holds (strictly). */
const MOOLATRIKONA: Record<Planet7, [number, number, number]> = {
  sun: [4, 0, 20], moon: [1, 3, 30], mars: [0, 0, 12], mercury: [5, 15, 20], jupiter: [8, 0, 10], venus: [6, 0, 15], saturn: [10, 0, 20],
};
const SAPTAVARGAS: VargaName[] = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'];
/** Points by compound relationship, from great friend (index 2) to great enemy (index -2). */
const COMPOUND: Record<number, number> = { 2: 22.5, 1: 15, 0: 7.5, [-1]: 3.75, [-2]: 1.875 };

/** Temporal relationship: +1 when the other is 2, 3, 4, 10, 11 or 12 signs away, -1 otherwise and in the same sign. */
export function temporal(sign: number, other: number): number {
  const apart = Math.abs(other - sign);
  return apart !== 0 && [1, 2, 3, 9, 10, 11].includes(apart) ? 1 : -1;
}

/** The points of a planet in one varga of the seven. */
function vargaPoints(p: Planet7, varga: VargaName, longitudes: Record<Planet9, number>, fidelity: Fidelity): number {
  const lon = longitudes[p];
  const sign = vargaSign(lon, varga, fidelity);
  const lord = SIGN_LORDS[sign]! as Planet7;
  const degree = norm360(lon) % 30;
  const [mtSign, from, to] = MOOLATRIKONA[p];
  if (lord === p) {
    // Own sign: moolatrikona in the birth chart only.
    if (varga === 'D1' && sign === mtSign && degree > from) return degree < to ? 45 : 30;
    return 30;
  }
  // The Moon in Taurus in the birth chart: moolatrikona past 3 degrees; in its first three, PL9 gives nothing
  // (corrected: the relationship with Venus, below). See docs/spec/correcoes.md, 19.
  if (varga === 'D1' && p === 'moon' && sign === 1 && (degree > 3 || fidelity === 'pl9')) return degree > 3 ? 45 : 0;
  const natural = NATURAL[p][SEVEN.indexOf(lord)]! - 1;
  return COMPOUND[natural + temporal(signOf(lon), signOf(longitudes[lord]))]!;
}

export const saptavargaja = (p: Planet7, longitudes: Record<Planet9, number>, fidelity: Fidelity = 'pl9') =>
  SAPTAVARGAS.reduce((s, v) => s + vargaPoints(p, v, longitudes, fidelity), 0);

/** Ojhayugma: 15 in a sign of its kind (even for the Moon and Venus, odd for the others), in the birth chart and in the Navamsha. */
export function ojhayugma(p: Planet7, longitudes: Record<Planet9, number>, fidelity: Fidelity = 'pl9'): number {
  const even = (s: number) => s % 2 === 1;
  const female = p === 'moon' || p === 'venus';
  return [signOf(longitudes[p]), vargaSign(longitudes[p], 'D9', fidelity)].reduce((n, s) => n + (even(s) === female ? 15 : 0), 0);
}

/** Kendradi: 60 in a kendra from the Lagna's sign, 30 in a panaphara, 15 in an apoklima. */
export const kendradi = (p: Planet7, longitudes: Record<Planet9, number>, lagna: number) =>
  [60, 30, 15][(((signOf(longitudes[p]) - signOf(lagna)) % 12) + 12) % 12 % 3]!;

/** Drekkana: 15 in the decanate of its kind — male (Sun, Mars, Jupiter) the first; the others by the method. */
export function drekkana(p: Planet7, longitudes: Record<Planet9, number>, method: ShadbalaOptions['drekkana']): number {
  const third = Math.floor((norm360(longitudes[p]) % 30) / 10) + 1;
  const kind = p === 'sun' || p === 'mars' || p === 'jupiter' ? 1
    : p === 'mercury' || p === 'saturn' ? (method === 'parashara' ? 2 : 3)
      : (method === 'parashara' ? 3 : 2);
  return third === kind ? 15 : 0;
}
