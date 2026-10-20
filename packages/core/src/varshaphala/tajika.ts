import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import type { Planet7 } from '../strengths/dignity';
import { norm360 } from '../zodiac';
import type { Varshaphala } from './annual';

/** What the Tajika rules read of a chart: the longitudes, which planets are retrograde, the houses, day or night. */
export interface TajikaChart {
  longitude: Record<Planet9, number>;
  retrograde: Partial<Record<Planet9, boolean>>;
  /** Within the Sun's orb of combustion. */
  combust: Partial<Record<Planet9, boolean>>;
  lagna: number;
  /** House, 1 to 12, of each planet. */
  house: Partial<Record<Planet9, number>>;
  /** The Sun above the horizon; null where there is no Lagna. */
  isDay: boolean | null;
  /** Which rules apply where PL9 is wrong (docs/spec/correcoes.md); 'pl9' when not given. */
  fidelity?: Fidelity;
}

/**
 * The orbs of combustion, direct and retrograde (from the printouts: 270 of 270 charts for each planet). PL9 never
 * marks the Moon combust.
 */
const COMBUSTION: Partial<Record<Planet9, [number, number]>> = { mars: [17, 17], mercury: [14, 12], jupiter: [11, 11], venus: [10, 8], saturn: [15, 15] };

/** Whether a planet is within its orb of combustion from the Sun (the orb by its motion, retrograde or direct). */
export function combustOf(planet: Planet9, longitude: number, sunLongitude: number, speed: number): boolean {
  const orb = COMBUSTION[planet];
  if (!orb) return false;
  let d = Math.abs(norm360(longitude - sunLongitude));
  if (d > 180) d = 360 - d;
  return d < orb[speed < 0 ? 1 : 0];
}

/**
 * Combustion as the worksheet tables mark it ("Varshaphala III"): as `combustOf`, and the Moon within 12° of the Sun
 * (from the printouts: marked from 1.5° to 8.9°, not from 12.9°; the reports never mark it).
 */
export function combustInTable(planet: Planet9, longitude: number, sunLongitude: number, speed: number): boolean {
  if (planet !== 'moon') return combustOf(planet, longitude, sunLongitude, speed);
  let d = Math.abs(norm360(longitude - sunLongitude));
  if (d > 180) d = 360 - d;
  return d < 12;
}

/** The annual chart as the Tajika rules read it (houses counted by sign from the Lagna). */
export function tajikaChart(v: Varshaphala): TajikaChart {
  const p = v.chart.points as Record<string, { longitude: number; longitudeSpeed?: number } | undefined>;
  const names: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  const lagna = v.chart.points.lagna?.longitude ?? NaN;
  const sign = (x: number) => Math.floor(norm360(x) / 30);
  return {
    longitude: Object.fromEntries(names.map((n) => [n, p[n]!.longitude])) as Record<Planet9, number>,
    retrograde: Object.fromEntries(names.map((n) => [n, (p[n]!.longitudeSpeed ?? 0) < 0])),
    combust: Object.fromEntries(names.map((n) => [n, combustOf(n, p[n]!.longitude, p.sun!.longitude, p[n]!.longitudeSpeed ?? 0)])),
    lagna,
    house: Number.isNaN(lagna) ? {} : Object.fromEntries(names.map((n) => [n, ((sign(p[n]!.longitude) - sign(lagna) + 12) % 12) + 1])),
    isDay: v.isDayChart,
    fidelity: v.fidelity,
  };
}

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const degreeOf = (longitude: number) => norm360(longitude) % 30;
/** The house of sign a counted from sign b, 1 to 12. */
const houseFrom = (a: number, b: number) => ((a - b + 12) % 12) + 1;

/** Tajika aspect between two signs (0 = Aries): every sign but the 2nd, 6th, 8th and 12th from the other (read in PL9). */
export function tajikaAspect(a: number, b: number): boolean {
  return ![2, 6, 8, 12].includes(houseFrom(a, b));
}

/** Tajika relation of sign a to sign b: +1 friend (3, 5, 9, 11), -1 enemy (1, 4, 7, 10), 0 neutral (read in PL9). */
export function tajikaRelation(a: number, b: number): 1 | 0 | -1 {
  const h = houseFrom(a, b);
  return [3, 5, 9, 11].includes(h) ? 1 : [1, 4, 7, 10].includes(h) ? -1 : 0;
}

/** The order of speed, faster first, and the orbs (deeptamsa) of the seven planets (read in PL9). */
export const TAJIKA_SPEED: Record<Planet7, number> = { moon: 1, mercury: 2, venus: 3, sun: 4, mars: 5, jupiter: 6, saturn: 7 };
export const DEEPTAMSA: Record<Planet7, number> = { sun: 15, moon: 12, mars: 8, mercury: 7, jupiter: 9, venus: 7, saturn: 9 };

/**
 * Whether p, faster than q, applies to it: their signs in aspect, p not retrograde and behind q by its degree in the
 * sign, by less than half the sum of their orbs. With `nextSign`, q's degree counts 30 more (p about to change sign).
 * Read in PL9.
 */
export function applying(c: TajikaChart, p: Planet7, q: Planet7, nextSign = false): boolean {
  if (!(TAJIKA_SPEED[p] < TAJIKA_SPEED[q])) return false;
  const dp = degreeOf(c.longitude[p]), dq = degreeOf(c.longitude[q]);
  if (!nextSign && !(dp < dq)) return false;
  if (c.retrograde[p]) return false;
  return norm360(dq + (nextSign ? 30 : 0) - dp) < (DEEPTAMSA[p] + DEEPTAMSA[q]) * 0.5;
}

/** Ithasala of p with q: their signs in aspect and p applying to q (read in PL9). */
export function ithasala(c: TajikaChart, p: Planet7, q: Planet7): boolean {
  return tajikaAspect(signOf(c.longitude[p]), signOf(c.longitude[q])) && applying(c, p, q);
}
