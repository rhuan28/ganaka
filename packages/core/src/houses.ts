import type { Ephemeris } from '@reverse/ephemeris';
import { InvalidInputError } from './errors';
import type { Fidelity } from './fidelity';
import { pl9LocalSiderealTime, pl9MeanObliquity, pl9NutationThirteenTerms } from './lagna';
import { norm360 } from './zodiac';

const RAD = Math.PI / 180;

export const HOUSE_SYSTEMS = ['sripati', 'equal'] as const;
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];

export interface Houses {
  system: HouseSystem;
  /** Sidereal longitude of the middle of each house; index 0 is house 1. */
  middles: number[];
  /** Sidereal longitude where each house begins; index 0 is house 1. */
  starts: number[];
}

/**
 * Sidereal longitude of the midheaven as PL9 gives it: the same closed formulas as the Lagna.
 * `lagnaAyanamshaDegrees` is the angle taken out of the Lagna (see ayanamshaFrame). See docs/spec/lagna.md.
 */
export function midheavenLongitude(_eph: Ephemeris, jdUt: number, longitudeEast: number, lagnaAyanamshaDegrees: number, fidelity: Fidelity = 'pl9'): number {
  if (![jdUt, longitudeEast, lagnaAyanamshaDegrees].every(Number.isFinite)) throw new InvalidInputError('jdUt, longitudeEast and the ayanamsha must be finite numbers');
  const theta = pl9LocalSiderealTime(jdUt, longitudeEast) * RAD;
  const tropical = Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(pl9MeanObliquity(jdUt) * RAD)) / RAD;
  return norm360(tropical - pl9NutationThirteenTerms(jdUt, fidelity) - lagnaAyanamshaDegrees);
}

/** Arc from a to b going forward through the zodiac, in [0, 360). */
const forward = (a: number, b: number): number => norm360(b - a);

/** The houses of a chart from its Lagna and midheaven. See docs/spec/casas.md. */
export function houseCusps(lagna: number, midheaven: number, system: HouseSystem): Houses {
  if (!Number.isFinite(lagna) || !Number.isFinite(midheaven)) throw new InvalidInputError('lagna and midheaven must be finite numbers');
  const asc = norm360(lagna);
  const middles: number[] = new Array<number>(12);
  if (system === 'equal') {
    for (let k = 0; k < 12; k++) middles[k] = norm360(asc + 30 * k);
  } else if (system === 'sripati') {
    const mc = norm360(midheaven);
    const arc = forward(mc, asc);
    if (!(arc > 0 && arc < 180)) throw new InvalidInputError('the midheaven must be less than half a circle before the Lagna');
    const upper = arc / 3; // midheaven to Lagna: houses 10, 11, 12, 1
    const lower = forward(asc, norm360(mc + 180)) / 3; // Lagna to the lower meridian: houses 1, 2, 3, 4
    middles[0] = asc;
    middles[1] = norm360(asc + lower);
    middles[2] = norm360(asc + 2 * lower);
    middles[3] = norm360(mc + 180);
    middles[9] = mc;
    middles[10] = norm360(mc + upper);
    middles[11] = norm360(mc + 2 * upper);
    for (const k of [4, 5, 6, 7, 8]) middles[k] = norm360(middles[(k + 6) % 12]! + 180);
  } else {
    throw new InvalidInputError(`unknown house system "${String(system)}"`);
  }
  // A house begins half-way between the middle of the previous house and its own.
  const starts = middles.map((m, k) => {
    const previous = middles[(k + 11) % 12]!;
    return norm360(previous + forward(previous, m) / 2);
  });
  return { system, middles, starts };
}

/** House, 1 to 12, that holds a longitude. A house owns the point where it begins. */
export function houseOf(longitude: number, houses: Houses): number {
  if (!Number.isFinite(longitude)) throw new InvalidInputError('longitude must be a finite number');
  const lon = norm360(longitude);
  for (let k = 0; k < 12; k++) {
    const width = forward(houses.starts[k]!, houses.starts[(k + 1) % 12]!);
    if (forward(houses.starts[k]!, lon) < width) return k + 1;
  }
  // Only reachable through rounding at a boundary: give the point to the house that begins nearest to it.
  let best = 0;
  for (let k = 1; k < 12; k++) if (forward(houses.starts[k]!, lon) < forward(houses.starts[best]!, lon)) best = k;
  return best + 1;
}
