import type { Planet9 } from '../jaimini';

/**
 * Each planet's place in the three body schemes of PL9's Health sheet (read in PL9). The engine gives indices into the
 * tradition's lists; the app names the parts.
 * - `sookshma`: the Kalapurusha's thirty-six drekkana parts, 3 × (house − 1) + the planet's decanate in its sign, the
 *   house counted by sign from the Lagna's; in the 1st or 7th house in the Lagna's own decanate, also the side of that
 *   part it falls on (left below the Lagna's degree), printed "Left side of …".
 * - `sthoola`: the twelve Kalapurusha parts by the planet's sign (0 = Aries) and by its house (1 to 12).
 * - `nakshatra`: the 28 rows with Abhijit inserted as the 22nd, 1-based: the planet's nakshatra, one more from
 *   Shravana on (PL9's code holds an Abhijit span, but its sheet never shows that row).
 */
export interface HealthSchemes {
  sookshma: { index: number; side?: 'left' | 'right' };
  sthoola: { sign: number; house: number };
  nakshatra: number;
}

export function healthSchemes(longitudes: Record<Planet9, number>, lagna: number): Record<Planet9, HealthSchemes> {
  const lagnaSign = Math.floor(lagna / 30);
  const lagnaDecanate = Math.floor((lagna % 30) / 10);
  return Object.fromEntries(
    (Object.keys(longitudes) as Planet9[]).map((p) => {
      const lon = longitudes[p]!;
      const sign = Math.floor(lon / 30);
      const house = ((sign - lagnaSign + 12) % 12) + 1;
      const decanate = Math.floor((lon % 30) / 10);
      const index = 3 * (house - 1) + decanate;
      const sookshma = (house === 1 || house === 7) && decanate === lagnaDecanate ? { index, side: (lon % 30 < lagna % 30 ? 'left' : 'right') as 'left' | 'right' } : { index };
      const n = Math.floor(lon / (40 / 3)) + 1;
      const nakshatra = n >= 22 ? n + 1 : n;
      return [p, { sookshma, sthoola: { sign, house }, nakshatra }];
    }),
  ) as Record<Planet9, HealthSchemes>;
}
