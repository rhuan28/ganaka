import { PLANETS_9, type Planet9 } from './jaimini';
import type { PointName } from './positions';
import { SIGN_LORDS, type Planet7 } from './specialLagnas';
import { aspectValue } from './strengths/aspects';
import { tarabala, type TARAS } from './transits/tarabala';
import type { VargaName } from './vargas';
import { norm360 } from './zodiac';

/**
 * The tables of PL9's natal pages that are built from the chart alone: the graded aspects between the planets, the
 * nakshatra matrix of taras, the lords of the houses and the dispositors in the Shad Varga. See
 * docs/spec/natal-tables.md.
 */

/** `value[on][from]`: the aspect, in virupas (0 to 60), the planet `from` casts on the planet `on`; rows and columns in `planets` order. */
export function aspectTable(longitudes: Record<Planet9, number>): { planets: Planet9[]; value: number[][] } {
  const planets = [...PLANETS_9];
  const value = planets.map((on) => planets.map((from) => (on === from ? 0 : aspectValue(from, norm360(longitudes[on] - longitudes[from])))));
  return { planets, value };
}

export interface HouseAspects {
  house: number;
  /** The lord of the house's sign. */
  lord: Planet7;
  /** By planet, Sun to Ketu: the aspect on the house, a whole percent of a full aspect (0 to 100). */
  onHouse: number[];
  /** By planet: the aspect on the house and on its lord, each counting half, a whole percent (0 to 100). */
  withLord: number[];
}

/**
 * PL9's "Aspects on Houses" pages: for each house, the graded aspect of each planet on the house's point (the
 * Lagna's longitude plus 30° for each house after the first) as trunc(v / 0.6), and on the house and its lord as
 * trunc(trunc(v / 1.2) + w / 1.2), with v the aspect on the point and w the aspect on the lord's longitude, in
 * virupas; PL9 cuts the house's half before adding the lord's. A planet that is the lord counts 0 on itself.
 */
export function houseAspects(longitudes: Record<'lagna' | Planet9, number>): HouseAspects[] {
  const first = Math.floor(norm360(longitudes.lagna) / 30);
  return Array.from({ length: 12 }, (_, i) => {
    const point = norm360(longitudes.lagna + 30 * i);
    const lord = SIGN_LORDS[(first + i) % 12]!;
    const on = (p: Planet9, target: number) => aspectValue(p, norm360(target - longitudes[p]));
    // A hair added before each cut, so that an exact multiple (31 × 0.6) is not cut one below by the division.
    const cut = (x: number) => Math.trunc(x + 1e-9);
    const onHouse = PLANETS_9.map((p) => cut(on(p, point) / 0.6));
    const withLord = PLANETS_9.map((p) => cut(cut(on(p, point) / 1.2) + (p === lord ? 0 : on(p, longitudes[lord])) / 1.2));
    return { house: i + 1, lord, onHouse, withLord };
  });
}

export const TARA_POINTS = ['lagna', ...PLANETS_9] as const;
export type TaraPoint = (typeof TARA_POINTS)[number];
export interface TaraCell { count: number; name: (typeof TARAS)[number]; good: boolean }

/** `cells[row][column]`: the tara of the row's nakshatra counted from the column's, as PL9's "Nakshatra spatial matrix". */
export function taraMatrix(longitudes: Record<TaraPoint, number>): { points: TaraPoint[]; cells: TaraCell[][] } {
  const points = [...TARA_POINTS];
  return { points, cells: points.map((row) => points.map((column) => tarabala(longitudes[column], longitudes[row]))) };
}

export interface Lordship { house: number; lord: Planet7; inHouse: number }

/** The lord of each house of a varga (from its Lagna's sign) and the house it occupies there. */
export function lordships(signs: Partial<Record<PointName, number>>): Lordship[] {
  const first = signs.lagna;
  if (first === undefined) return [];
  return Array.from({ length: 12 }, (_, i) => {
    const lord = SIGN_LORDS[(first + i) % 12]!;
    return { house: i + 1, lord, inHouse: ((signs[lord]! - first + 12) % 12) + 1 };
  });
}

/** The six vargas of the Shad Varga. */
export const SHAD_VARGA: readonly VargaName[] = ['D1', 'D2', 'D3', 'D9', 'D12', 'D30'];
export interface Dispositor { lord: Planet7; count: number }

/** For each planet, the lords of the signs it occupies in the Shad Varga, with how often: the most first, then in the planets' order. */
export function shadvargaDispositors(vargas: Record<VargaName, Partial<Record<PointName, number>>>): Partial<Record<Planet9, Dispositor[]>> {
  const out: Partial<Record<Planet9, Dispositor[]>> = {};
  for (const planet of PLANETS_9) {
    const counts = new Map<Planet7, number>();
    for (const v of SHAD_VARGA) {
      const sign = vargas[v]?.[planet];
      if (sign === undefined) continue;
      const lord = SIGN_LORDS[sign]!;
      counts.set(lord, (counts.get(lord) ?? 0) + 1);
    }
    if (counts.size === 0) continue;
    out[planet] = PLANETS_9.filter((p): p is Planet7 => counts.has(p as Planet7))
      .map((lord) => ({ lord, count: counts.get(lord)! }))
      .sort((a, b) => b.count - a.count);
  }
  return out;
}
