import type { Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import { norm360 } from '../zodiac';

/** The relations of PL9's planet tables (docs/spec/planet-info.md): Hemmed, the final dispositor, the 9×9 relations. */

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const signOf = (lon: number) => Math.floor(norm360(lon) / 30);

/** The planets just before and just after this one in the zodiac, among the nine, at any distance. */
export function hemmed(planet: Planet9, longitudes: Record<Planet9, number>): { previous: Planet9; next: Planet9 } {
  const ahead = (p: Planet9) => norm360(longitudes[p] - longitudes[planet]);
  const others = NINE.filter((p) => p !== planet);
  const next = others.reduce((a, b) => (ahead(b) < ahead(a) ? b : a));
  const previous = others.reduce((a, b) => (ahead(b) > ahead(a) ? b : a));
  return { previous, next };
}

/**
 * The final dispositor: the sign lords followed from the planet until one comes back; the first to come back. A planet
 * in its own sign is its own; a chain that closes in a cycle gives the planet where the cycle closes.
 */
export function finalDispositor(planet: Planet9, longitudes: Record<Planet9, number>): Planet9 {
  const seen = new Set<Planet9>([planet]);
  let p: Planet9 = planet;
  for (;;) {
    const lord = SIGN_LORDS[signOf(longitudes[p])]! as Planet9;
    if (seen.has(lord)) return lord;
    seen.add(lord);
    p = lord;
  }
}

/** PL9's natural relations of the nine, row to column: 1 friend, 0 neutral, -1 enemy. */
const N = 0, F = 1, E = -1;
const TABLE: number[][] = [
  [N, F, F, N, F, E, E, E, E],
  [F, N, N, F, N, N, N, E, E],
  [F, F, N, E, F, N, N, E, F],
  [F, E, N, N, N, F, N, N, N],
  [F, F, F, E, N, E, N, N, N],
  [E, E, N, F, N, N, F, F, F],
  [E, E, E, F, N, F, N, F, E],
  [E, E, E, N, F, F, F, N, E],
  [E, E, F, N, N, F, E, E, N],
];
export const NATURAL_RELATIONS_9 = Object.fromEntries(
  NINE.map((a, i) => [a, Object.fromEntries(NINE.map((b, j) => [b, TABLE[i]![j]!]))]),
) as Record<Planet9, Record<Planet9, -1 | 0 | 1>>;

/**
 * The temporal (Tatkalika) relations of the nine by their signs, row to column: 1 when the column's planet is in the 2nd,
 * 3rd, 4th, 10th, 11th or 12th sign from the row's, -1 otherwise (the same sign too); 0 on the diagonal.
 */
export function temporalRelations(longitudes: Record<Planet9, number>): Record<Planet9, Record<Planet9, -1 | 0 | 1>> {
  const apart = (a: Planet9, b: Planet9) => (signOf(longitudes[b]) - signOf(longitudes[a]) + 12) % 12;
  return Object.fromEntries(NINE.map((a) => [a, Object.fromEntries(NINE.map((b) => [b, a === b ? 0 : [1, 2, 3, 9, 10, 11].includes(apart(a, b)) ? 1 : -1]))])) as Record<Planet9, Record<Planet9, -1 | 0 | 1>>;
}

/** The compound (Panchadha) relations: the natural plus the temporal, 2 great friend to -2 great enemy; 0 on the diagonal. */
export function compoundRelations(longitudes: Record<Planet9, number>): Record<Planet9, Record<Planet9, -2 | -1 | 0 | 1 | 2>> {
  const t = temporalRelations(longitudes);
  return Object.fromEntries(NINE.map((a) => [a, Object.fromEntries(NINE.map((b) => [b, a === b ? 0 : NATURAL_RELATIONS_9[a][b] + t[a][b]]))])) as Record<Planet9, Record<Planet9, -2 | -1 | 0 | 1 | 2>>;
}
