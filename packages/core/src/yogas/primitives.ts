import type { Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import type { Planet7 } from '../strengths/dignity';
import { norm360 } from '../zodiac';

/** The vocabulary the yogas are built from (docs/spec/yogas.md, "The vocabulary"). Signs are 0 (Aries) to 11. */

export const NINE: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

export const HOUSE_GROUPS = {
  kendra: [1, 4, 7, 10], trikona: [5, 9], panaphara: [2, 5, 8, 11], apoklima: [3, 6, 9, 12], dusthana: [6, 8, 12], upachaya: [3, 6, 10, 11],
} as const;
export type HouseGroup = keyof typeof HOUSE_GROUPS;

export const signOf = (longitude: number): number => Math.floor(norm360(longitude) / 30);

/** The house of a sign counted from a reference sign: the reference is the 1st. */
export const houseFrom = (reference: number, sign: number): number => ((sign - reference + 12) % 12) + 1;

/** The sign of a house counted from a reference sign. */
export const signOfHouse = (reference: number, house: number): number => (reference + house - 1) % 12;

export const inGroup = (house: number, group: HouseGroup): boolean => (HOUSE_GROUPS[group] as readonly number[]).includes(house);

/** The lord of a sign, by the traditional rulers. */
export const lordOf = (sign: number): Planet7 => SIGN_LORDS[sign]!;

/** The lord of a house counted from a reference sign. */
export const houseLord = (reference: number, house: number): Planet7 => lordOf(signOfHouse(reference, house));

/** The houses (counted from the aspecting planet's sign) each planet aspects in full: the 7th for all, and the specials. */
const FULL_ASPECTS: Record<Planet9, readonly number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7], mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10], rahu: [5, 7, 9], ketu: [5, 7, 9],
};

/** Whether a planet in `fromSign` casts a full sign aspect on `onSign`. */
export const aspectsFully = (planet: Planet9, fromSign: number, onSign: number): boolean => FULL_ASPECTS[planet].includes(houseFrom(fromSign, onSign));

/** Two different planets in the same sign. */
export const conjunct = (signs: Record<Planet9, number>, a: Planet9, b: Planet9): boolean => a !== b && signs[a] === signs[b];

/** Each of two planets in a sign of the other. */
export const exchange = (signs: Record<Planet9, number>, a: Planet9, b: Planet9): boolean =>
  a !== b && lordOf(signs[a]) === b && lordOf(signs[b]) === a;

/** "In own sign" for a yoga: own sign or moolatrikona, by the nine-level dignity (3 or 2). */
export const ownSign = (dignity: number): boolean => dignity === 2 || dignity === 3;
export const exalted = (dignity: number): boolean => dignity === 1;
export const debilitated = (dignity: number): boolean => dignity === 9;
