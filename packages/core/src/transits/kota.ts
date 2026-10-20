import type { Fidelity } from '../fidelity';
import { nakshatra28 } from '../dashas/engine';
import type { Planet9 } from '../jaimini';

/**
 * PL9's Kota Chakra ("Kota Chakra" worksheet): the 28 nakshatras, Abhijit among them, numbered from the natal Moon's
 * (`first`, its index from Ashwini 0), and each transit planet's place, 1 to 28, in that count (from the printouts:
 * the 270 printed places). PL9 also prints a score; its rule was not found, see docs/spec/tempo/transitos.md.
 */
export function kotaChakra(natalMoon: number, transit: Partial<Record<Planet9, number>>, fidelity: Fidelity): { first: number; places: Partial<Record<Planet9, number>> } {
  const first = nakshatra28(natalMoon, fidelity).index;
  const places = Object.fromEntries(Object.entries(transit).map(([p, l]) => [p, ((nakshatra28(l!, fidelity).index - first + 28) % 28) + 1]));
  return { first, places };
}
