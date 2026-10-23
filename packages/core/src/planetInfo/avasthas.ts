import type { Planet9 } from '../jaimini';
import { dignity9 } from '../strengths/dignity';
import { norm360 } from '../zodiac';

/** Combustion and the Deeptadi and Shayanadi avasthas of PL9's planet tables (docs/spec/planet-info.md). */

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

/** The orb from the Sun under which a planet is combust, degrees: direct and retrograde. */
export const COMBUSTION_ORB: Partial<Record<Planet9, [number, number]>> = {
  moon: [12, 12], mars: [17, 17], mercury: [14, 12], jupiter: [11, 11], venus: [10, 8], saturn: [15, 15],
};
/** PL9 works out how deep the combustion is for Mars to Saturn only; a combust Moon shows 0. */
const DEPTH_FOR: Planet9[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export interface Combustion {
  combust: boolean;
  /** 100 × (1 − distance / orb), rounded half up, for a combust planet; null otherwise. */
  combustPercent: number | null;
}

const arc = (a: number, b: number) => { const d = norm360(a - b); return Math.min(d, 360 - d); };

export function combustion(planet: Planet9, longitudes: Record<Planet9, number>, retrograde: boolean): Combustion {
  const orbs = COMBUSTION_ORB[planet];
  if (!orbs) return { combust: false, combustPercent: null };
  const orb = orbs[retrograde ? 1 : 0];
  const d = arc(longitudes[planet], longitudes.sun);
  if (!(d < orb)) return { combust: false, combustPercent: null };
  return { combust: true, combustPercent: DEPTH_FOR.includes(planet) ? Math.floor(100 * (1 - d / orb) + 0.5) : 0 };
}

export const DEEPTADI = ['deepta', 'swastha', 'mudita', 'shanta', 'deena', 'dukhita', 'vikala', 'khala', 'kopa'] as const;
export type DeeptadiState = (typeof DEEPTADI)[number];

/**
 * Deeptadi by the dignity alone, as PL9 reads it: exalted deepta; moolatrikona or own sign swastha; great friend
 * mudita; friend shanta; neutral deena; enemy dukhita; great enemy or debilitated khala. PL9 never gives vikala or kopa.
 */
export function deeptadi(planet: Planet9, longitudes: Record<Planet9, number>): DeeptadiState {
  const d = dignity9(planet, longitudes);
  return (['deepta', 'swastha', 'swastha', 'mudita', 'shanta', 'deena', 'dukhita', 'khala', 'khala'] as const)[d - 1]!;
}

export const SHAYANADI = ['shayana', 'upavesha', 'netrapani', 'prakasha', 'gamana', 'agamana', 'sabha', 'agama', 'bhojana', 'nrityaLipsa', 'kautuka', 'nidra'] as const;
export type ShayanadiState = (typeof SHAYANADI)[number];
/** The Anka a chart without one is read with. */
export const DEFAULT_ANKA = 1;
/** The planet's own number added in the sub-state, Sun to Ketu. */
const SUB_CONSTANT: Record<Planet9, number> = { sun: 5, moon: 2, mars: 2, mercury: 3, jupiter: 5, venus: 3, saturn: 3, rahu: 4, ketu: 4 };

export interface Shayanadi {
  /** 1 (shayana) to 12 (nidra), PL9's numbering. */
  number: number;
  state: ShayanadiState;
  /** The sub-state as PL9 shows it, 0, 1 or 2. */
  sub: number;
}

const wrap12 = (n: number) => ((((n - 1) % 12) + 12) % 12) + 1;

/**
 * Shayanadi: the planet's nakshatra (1 to 27) × its number (Sun 1 to Ketu 9) × its navamsa within the sign (1 to 9),
 * plus the Moon's nakshatra, the Lagna's sign (1 to 12), the whole ghatis since sunrise and one, wrapped to 1..12. The
 * sub-state is ((state² + Anka) wrapped to 1..12 + the planet's constant) mod 3.
 */
export function shayanadi(planet: Planet9, longitudes: Record<Planet9, number>, lagnaSign: number, ghatisSinceSunrise: number, anka: number): Shayanadi {
  const lon = norm360(longitudes[planet]);
  const nakshatra = Math.floor(lon / (360 / 27)) + 1;
  const navamsa = Math.trunc((lon % 30) / (30 / 9)) + 1;
  const moonNakshatra = Math.floor(norm360(longitudes.moon) / (360 / 27)) + 1;
  const n = wrap12(Math.trunc(ghatisSinceSunrise) + 1 + nakshatra * (NINE.indexOf(planet) + 1) * navamsa + moonNakshatra + lagnaSign);
  return { number: n, state: SHAYANADI[n - 1]!, sub: (wrap12(n * n + anka) + SUB_CONSTANT[planet]) % 3 };
}
