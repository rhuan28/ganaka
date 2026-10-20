import type { Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import { norm360 } from '../zodiac';

/**
 * PL9's dignity of a planet in nine steps, which the strengths and the Chara of Parashara use. See
 * docs/spec/dashas/sign-strength.md, "Pontos".
 */

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);

export type Planet7 = Exclude<Planet9, 'rahu' | 'ketu'>;
export const SEVEN: readonly Planet7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Natural relationship, row to column, Sun to Saturn: 2 friend, 1 neutral, 0 enemy. */
export const NATURAL: Record<Planet7, number[]> = {
  sun: [1, 2, 2, 1, 2, 0, 0],
  moon: [2, 1, 1, 2, 1, 1, 1],
  mars: [2, 2, 1, 0, 2, 1, 1],
  mercury: [2, 0, 1, 1, 1, 2, 1],
  jupiter: [2, 2, 2, 0, 1, 0, 1],
  venus: [0, 0, 1, 2, 1, 1, 2],
  saturn: [0, 0, 0, 2, 1, 2, 1],
};

/** Sign of exaltation, of moolatrikona with its degrees, own signs and sign of debility (0 = Aries). */
const DIGNITY: Record<Planet9, { exalted: [number, number, number]; moolatrikona: [number, number, number]; own: number[]; debilitated: number }> = {
  sun: { exalted: [0, 0, 30], moolatrikona: [4, 0, 20], own: [4], debilitated: 6 },
  moon: { exalted: [1, 0, 30], moolatrikona: [1, 3, 30], own: [3], debilitated: 7 },
  mars: { exalted: [9, 0, 30], moolatrikona: [0, 0, 12], own: [0, 7], debilitated: 3 },
  mercury: { exalted: [5, 0, 15], moolatrikona: [5, 15, 20], own: [2, 5], debilitated: 11 },
  jupiter: { exalted: [3, 0, 30], moolatrikona: [8, 0, 10], own: [8, 11], debilitated: 9 },
  venus: { exalted: [11, 0, 30], moolatrikona: [6, 0, 15], own: [1, 6], debilitated: 5 },
  saturn: { exalted: [6, 0, 30], moolatrikona: [10, 0, 20], own: [9, 10], debilitated: 0 },
  rahu: { exalted: [1, 0, 30], moolatrikona: [2, 0, 30], own: [10, 5], debilitated: 7 },
  ketu: { exalted: [7, 0, 30], moolatrikona: [8, 0, 30], own: [7, 11], debilitated: 1 },
};

/**
 * Dignity of a planet in nine steps, as PL9 counts it: 1 exalted, 2 moolatrikona (each only strictly inside its
 * degrees), 3 own sign, 9 debilitated; else, from the Sun to Saturn, 7 less the natural relationship to the lord of
 * the sign (2, 1, 0) less the temporal one (+1 when the lord is 2, 3, 4, 10, 11 or 12 signs away, -1 otherwise):
 * 4 great friend to 8 great enemy. Rahu and Ketu, there, 6.
 */
export function dignity9(planet: Planet9, longitudes: Record<Planet9, number>): number {
  const lon = norm360(longitudes[planet]);
  const sign = signOf(lon);
  const degree = lon % 30;
  const d = DIGNITY[planet];
  const inside = ([s, from, to]: [number, number, number]) => sign === s && degree > from && degree < to;
  if (inside(d.exalted)) return 1;
  if (inside(d.moolatrikona)) return 2;
  if (d.own.includes(sign)) return 3;
  if (sign === d.debilitated) return 9;
  if (planet === 'rahu' || planet === 'ketu') return 6;
  const lord = SIGN_LORDS[sign]! as Planet7;
  const apart = Math.abs(signOf(longitudes[lord]) - sign);
  const temporal = apart !== 0 && [1, 2, 3].includes(apart & ~8) ? 1 : -1;
  return 7 - NATURAL[planet][SEVEN.indexOf(lord)]! - temporal;
}

