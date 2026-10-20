import { signOf } from '../zodiac';
import { ashtakavarga, AV_PLANETS, type AshtakavargaOptions, type AvContributor, type AvPlanet, type AvSigns } from '../strengths/ashtakavarga';
import type { Fidelity } from '../fidelity';

/** The lords of the eight kakshas of every sign, in order. */
export const KAKSHA_LORDS: readonly AvContributor[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon', 'lagna'];

/**
 * The kaksha (1 to 8) that holds a longitude: the whole number of 3°45' parts of the degree in the sign, so a
 * longitude at exactly the end of a part is in the next one. Read in PL9.
 */
export function kaksha(longitude: number): { kaksha: number; lord: AvContributor } {
  const inSign = longitude - signOf(longitude) * 30;
  const k = Math.min(7, Math.max(0, Math.floor(inSign / 3.75)));
  return { kaksha: k + 1, lord: KAKSHA_LORDS[k]! };
}

export interface KakshaRow {
  /** The transit sign, 0 = Aries. */
  sign: number;
  kaksha: number;
  lord: AvContributor;
  /** Whether the kaksha lord gives a bindu to the transit sign in the natal chart of the transiting planet. */
  bindu: 0 | 1;
  /** The bindus of the planet's natal chart in the transit sign (PL9's "Ash."). */
  ash: number;
  /** The natal Sarvashtakavarga of the transit sign (PL9's "Sarv."). */
  sarva: number;
}

/**
 * The kaksha of each transiting planet over a natal chart, given by the natal signs of its Ashtakavarga: all read in
 * the natal charts, before any reduction. Read in PL9.
 */
export function transitKakshas(natalSigns: AvSigns, transit: Record<AvPlanet, number>, options: Partial<AshtakavargaOptions> = {}, fidelity: Fidelity = 'pl9'): Record<AvPlanet, KakshaRow> {
  const av = ashtakavarga(natalSigns, options, fidelity);
  return Object.fromEntries(AV_PLANETS.map((p) => {
    const sign = signOf(transit[p]);
    const k = kaksha(transit[p]);
    const row: KakshaRow = { sign, ...k, bindu: av.prastara[p][k.lord][sign] as 0 | 1, ash: av.bhinna[p][sign]!, sarva: av.sarva[sign]! };
    return [p, row];
  })) as Record<AvPlanet, KakshaRow>;
}
