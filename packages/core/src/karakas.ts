import type { Planet7 } from './specialLagnas';
import { norm360 } from './zodiac';

export type KarakaPlanet = Planet7 | 'rahu';
export type KarakaName = 'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PuK' | 'GK' | 'DK';

const NAMES_8: readonly KarakaName[] = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PuK', 'GK', 'DK'];
/** With seven karakas there is no PuK: MK stands for it. */
const NAMES_7: readonly KarakaName[] = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'GK', 'DK'];
const ORDER: readonly KarakaPlanet[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'];

/**
 * Chara karakas: the planets in decreasing order of their degrees within the sign. With eight, Rahu counts
 * backwards, thirty degrees less its degrees. A tie keeps the order Sun ... Saturn, Rahu. See docs/spec/karakas.md.
 */
export function charaKarakas(longitudes: Record<KarakaPlanet, number>, count: 7 | 8): { name: KarakaName; planet: KarakaPlanet }[] {
  const degrees = (p: KarakaPlanet) => {
    const d = norm360(longitudes[p]) % 30;
    return p === 'rahu' ? 30 - d : d;
  };
  const planets = ORDER.slice(0, count);
  // Array.prototype.sort is stable: equal degrees keep the order of the planets.
  const ranked = [...planets].sort((a, b) => degrees(b) - degrees(a));
  const names = count === 8 ? NAMES_8 : NAMES_7;
  return ranked.map((planet, k) => ({ name: names[k]!, planet }));
}
