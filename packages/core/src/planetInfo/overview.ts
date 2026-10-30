import type { Planet9 } from '../jaimini';
import { charaKarakas, type KarakaPlanet } from '../karakas';
import { dignity9 } from '../strengths/dignity';
import { SIGN_LORDS } from '../specialLagnas';
import { naturalNatures, type NatureTable } from '../yogas/natures';
import { norm360 } from '../zodiac';
import { NATURAL_RELATIONS_9 } from './relations';

/**
 * The rows of PL9's "Grahas Overview" that no other table gives: how far a planet is from its fall and from the Sun,
 * whether it signifies the self, its natal JagradadiState and Baladi, and its Lajjitadi states (docs/spec/planet-info.md,
 * "Grahas Overview").
 */

const SEVEN = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
type Seven = (typeof SEVEN)[number];
/** The points of debilitation, in degrees from 0° Aries. */
const DEBILITATION: Record<Seven, number> = { sun: 190, moon: 213, mars: 118, mercury: 345, jupiter: 275, venus: 177, saturn: 20 };
/** The full sign aspects beyond the 7th, by the count of signs from the planet; the nodes' 5th and 9th as PL9's Lajjitadi reads them. */
const FULL: Partial<Record<Planet9, number[]>> = { mars: [4, 8], jupiter: [5, 9], saturn: [3, 10], rahu: [5, 9], ketu: [5, 9] };
const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

export type JagradadiState = 'jagrat' | 'swapna' | 'sushupti';
export type BaladiState = 'mrita' | 'vriddha' | 'yuva' | 'kumara' | 'bala';
export const LAJJITADI = ['lajjita', 'garvita', 'kshudhita', 'trushita', 'mudita', 'kshobhita'] as const;
export type Lajjitadi = (typeof LAJJITADI)[number];

/** The angular distance between two longitudes, 0 to 180. */
const apart = (a: number, b: number) => { const d = norm360(a - b); return d > 180 ? 360 - d : d; };
/** A distance as a whole percent of 180°, rounded half up as PL9 does. */
const percent = (d: number) => Math.trunc(d / 1.8 + 0.5 + 1e-9);

/** Percentage exalted: the distance from the point of debilitation. Sun to Saturn. */
export function percentExalted(planet: Seven, longitude: number): number {
  return percent(apart(longitude, DEBILITATION[planet]));
}

/** Percentage full: the distance from the Sun (always 0 for the Sun). Sun to Saturn. */
export function percentFull(longitude: number, sun: number): number {
  return percent(apart(longitude, sun));
}

/** PL9's "Lagnesh count", in fact whether the planet signifies the self: the Sun, the Moon or the Atmakaraka. */
export function karakaForSelf(planet: Planet9, longitudes: Record<Planet9, number>, karakas: 7 | 8): boolean {
  if (planet === 'sun' || planet === 'moon') return true;
  const ak = charaKarakas(longitudes as Record<KarakaPlanet, number>, karakas)[0]!.planet;
  return ak === planet;
}

/**
 * The natal JagradadiState from the D1 dignity: awake in exaltation, moolatrikona or its own sign; dreaming with a great
 * friend; asleep with a great enemy or in debility; between, dreaming unless the planet is the sign lord's natural
 * enemy. The nodes go by their rows of the natural relations too.
 */
export function natalJagradadi(planet: Planet9, longitudes: Record<Planet9, number>): JagradadiState {
  const d = dignity9(planet, longitudes);
  if (d <= 3) return 'jagrat';
  if (d === 4) return 'swapna';
  if (d >= 8) return 'sushupti';
  const lord = SIGN_LORDS[Math.floor(norm360(longitudes[planet]) / 30)]!;
  return NATURAL_RELATIONS_9[planet][lord] < 0 ? 'sushupti' : 'swapna';
}

/** The Baladi of the D1: the sign in bands of six degrees, counted backwards in the odd signs. */
export function natalBaladi(longitude: number): BaladiState {
  const l = norm360(longitude);
  let n = Math.trunc((l % 30) / 6) + 1;
  if (Math.floor(l / 30) % 2 === 0) n = 6 - n;
  return (['mrita', 'vriddha', 'yuva', 'kumara', 'bala'] as const)[n - 1]!;
}

/**
 * The Lajjitadi states of a planet, in PL9's order. "With" is the same sign; "aspected by" a full sign aspect (the
 * 7th, and Mars's, Jupiter's and Saturn's own); "associated" either, or in the other's sign. Benefic and malefic are
 * the natural natures. The 5th house is counted by sign from the Lagna; without it, no planet is Lajjita.
 */
export function lajjitadi(planet: Planet9, longitudes: Record<Planet9, number>, lagnaLongitude: number | undefined, table: NatureTable): Lajjitadi[] {
  const sign = (p: Planet9) => Math.floor(norm360(longitudes[p]) / 30);
  const own = sign(planet);
  const others = NINE.filter((p) => p !== planet);
  const nature = naturalNatures(longitudes, table);
  const malefics = others.filter((p) => nature[p] === 'malefic'), benefics = others.filter((p) => nature[p] === 'benefic');
  const withIt = (p: Planet9) => sign(p) === own;
  const aspects = (p: Planet9) => { const count = ((own - sign(p) + 12) % 12) + 1; return count === 7 || (FULL[p] ?? []).includes(count); };
  const inSignOf = (p: Planet9) => SIGN_LORDS[own] === p;
  const associated = (p: Planet9) => withIt(p) || aspects(p) || inSignOf(p);
  const d = dignity9(planet, longitudes);
  const out: Lajjitadi[] = [];
  const house = lagnaLongitude === undefined ? null : ((own - Math.floor(norm360(lagnaLongitude) / 30) + 12) % 12) + 1;
  if (house === 5 && (['sun', 'mars', 'saturn', 'rahu', 'ketu'] as Planet9[]).some((p) => p !== planet && associated(p))) out.push('lajjita');
  if (d === 1 || d === 2) out.push('garvita');
  if (d === 7 || d === 8 || (planet !== 'saturn' && withIt('saturn'))) out.push('kshudhita');
  if ((own === 3 || own === 11) && malefics.some(aspects) && !benefics.some(aspects)) out.push('trushita');
  if (d === 5 || benefics.some(withIt) || benefics.some(aspects) || (planet !== 'jupiter' && withIt('jupiter'))) out.push('mudita');
  if (planet !== 'sun' && withIt('sun') && (malefics.some(aspects) || (['mars', 'saturn', 'rahu', 'ketu'] as Planet9[]).some((p) => p !== planet && withIt(p)))) out.push('kshobhita');
  return out;
}

export { SEVEN as OVERVIEW_PLANETS };
