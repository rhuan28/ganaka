import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from '../ayanamsha';
import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { dayFrame, SunriseUndefinedError } from '../sunrise';
import { bodyAstronomy, PLANET_INFO_BODIES, type BodyAstronomy, type PlanetInfoBody } from './astronomy';
import { combustion, deeptadi, DEFAULT_ANKA, shayanadi, type DeeptadiState, type Shayanadi } from './avasthas';
import { finalDispositor, hemmed, NATURAL_RELATIONS_9 } from './relations';
import { argala, dominance, goodVargas, houseEffect, pushkaraNavamsa, housesRuled, mrityuBhaga, navamsaFromRashi, rays, SHADVARGA, shadvargaSignLords, shadvargaElements, type SignQuality } from './columns';

/** PL9's planet data tables, by body (docs/spec/planet-info.md). */

export { MEAN_SPEED, PLANET_INFO_BODIES, declinationOf, krantiOf, speedPercentOf, type BodyAstronomy, type PlanetInfoBody } from './astronomy';
export { NATURAL_RELATIONS_9, finalDispositor, hemmed } from './relations';
export { DASHAVARGA, SHADVARGA, argala, houseEffect, pushkaraNavamsa, dominance, goodVargas, housesRuled, mrityuBhaga, navamsaFromRashi, rays, shadvargaSignLords, shadvargaElements, type SignQuality } from './columns';
export { COMBUSTION_ORB, DEEPTADI, DEFAULT_ANKA, SHAYANADI, combustion, deeptadi, shayanadi, type Combustion, type DeeptadiState, type Shayanadi, type ShayanadiState } from './avasthas';

export interface PlanetInfoOptions {
  /** PL9's "Anka value" of the chart, 1 to 5; DEFAULT_ANKA when absent. */
  anka?: number;
}

export interface PointInfo extends BodyAstronomy {
  /** Sun to Ketu only, as the fields below. */
  combust?: boolean;
  combustPercent?: number | null;
  deeptadi?: DeeptadiState;
  shayanadi?: Shayanadi;
  /** The planets just before and after it in the zodiac, among the nine. */
  hemmed?: { previous: Planet9; next: Planet9 };
  finalDispositor?: Planet9;
  /** V+: in how many of the Shadvarga the planet is in its own or its exaltation sign. */
  ownOrExaltedShadvarga?: number;
  /** RN: the navamsa's sign counted from the rashi's, 1 to 12. */
  navamsaFromRashi?: number;
  /** In a Pushkara navamsa (PL9 marks RN with a "P"). */
  pushkaraNavamsa?: boolean;
  /** Arg: PL9's argala count. */
  argala?: number;
  /** HsEff: the house effect, percent; needs the Lagna. */
  houseEffect?: number;
  /** MB: the distance from the degree of Mrityu Bhaga and its severity, when inside the orb; null otherwise. */
  mrityuBhaga?: { distance: number; severity: number } | null;
  /** SVdisp: the lords of its signs in two or more of the Shadvarga, the most first. */
  shadvargaDispositors?: { lord: Planet9; count: number }[];
  /** SVelem: the three most frequent elements or modes of its signs over the Shadvarga. */
  shadvargaElements?: { quality: SignQuality; count: number }[];
  /** Domin.: PL9's weighted score of how much the planet stands out; needs the Lagna. */
  dominance?: number;
  /** HsLrd: the houses it rules, Sun to Saturn; needs the Lagna. */
  housesRuled?: number[];
  /** Rays, Sun to Saturn. */
  rays?: number;
}

export interface PlanetInfo {
  fidelity: Fidelity;
  /** The Anka the Shayanadi was read with. */
  anka: number;
  points: Record<PlanetInfoBody, PointInfo>;
  /** The Lagna's Mrityu Bhaga, when the Lagna is defined and inside the orb. */
  lagnaMrityuBhaga: { distance: number; severity: number } | null;
  /** PL9's natural relations of the nine, Rahu and Ketu included: 1 friend, 0 neutral, -1 enemy. */
  naturalRelations: Record<Planet9, Record<Planet9, -1 | 0 | 1>>;
  /** What a chart cannot give (houses without a Lagna, the sunrise beyond the polar circle), by field. */
  missing: { field: string; reason: string }[];
}

export class AnkaRangeError extends Error {
  constructor(anka: number) {
    super(`anka must be an integer from 1 to 5, not ${anka}`);
    this.name = 'AnkaRangeError';
  }
}

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

export function computePlanetInfo(eph: Ephemeris, input: ChartInput, options: PlanetInfoOptions = {}, coreOptions?: Partial<CoreOptions>): PlanetInfo {
  const anka = options.anka ?? DEFAULT_ANKA;
  if (!Number.isInteger(anka) || anka < 1 || anka > 5) throw new AnkaRangeError(anka);
  const core = resolveOptions(coreOptions);
  const positions = computePositions(eph, input, core);
  const astronomy = bodyAstronomy(eph, input.jdUt, positions);
  const longitudes = Object.fromEntries(NINE.map((p) => [p, positions.points[p].longitude])) as Record<Planet9, number>;
  const missing: PlanetInfo['missing'] = [];

  const lagna = positions.points.lagna;
  let ghatis: number | null = null;
  if (lagna) try {
    const day = dayFrame(eph, input.jdUt, input.latitude, input.longitudeEast, ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity));
    ghatis = (input.jdUt - day.sunrise) * 60;
  } catch (e) {
    if (!(e instanceof SunriseUndefinedError)) throw e;
    ghatis = null;
  }
  if (!lagna) missing.push({ field: 'shayanadi', reason: 'needs the Lagna' });
  else if (ghatis === null) missing.push({ field: 'shayanadi', reason: 'needs the sunrise' });
  if (!lagna) missing.push({ field: 'dominance', reason: 'needs the Lagna' }, { field: 'housesRuled', reason: 'needs the Lagna' }, { field: 'houseEffect', reason: 'needs the Lagna' });
  const f = core.fidelity;

  const points = {} as Record<PlanetInfoBody, PointInfo>;
  for (const body of PLANET_INFO_BODIES) {
    const info: PointInfo = { ...astronomy[body] };
    if ((NINE as string[]).includes(body)) {
      const p = body as Planet9;
      Object.assign(info, combustion(p, longitudes, astronomy[body].retrograde), {
        deeptadi: deeptadi(p, longitudes), hemmed: hemmed(p, longitudes), finalDispositor: finalDispositor(p, longitudes),
      });
      if (lagna && ghatis !== null) info.shayanadi = shayanadi(p, longitudes, lagna.sign + 1, ghatis, anka);
      const lon = longitudes[p];
      Object.assign(info, {
        ownOrExaltedShadvarga: goodVargas(p, lon, SHADVARGA, f), navamsaFromRashi: navamsaFromRashi(lon, f), pushkaraNavamsa: pushkaraNavamsa(lon, f),
        argala: argala(p, longitudes), mrityuBhaga: mrityuBhaga(p, lon),
        shadvargaDispositors: shadvargaSignLords(lon, f), shadvargaElements: shadvargaElements(lon, f),
      });
      if (lagna) Object.assign(info, { dominance: dominance(p, longitudes, lagna.longitude), houseEffect: houseEffect(lon, lagna.longitude) });
      const r = rays(p, longitudes);
      if (r !== null) info.rays = r;
      if (lagna && r !== null) info.housesRuled = housesRuled(p, lagna.sign);
    }
    points[body] = info;
  }
  return { fidelity: core.fidelity, anka, points, lagnaMrityuBhaga: lagna ? mrityuBhaga('lagna', lagna.longitude) : null, naturalRelations: NATURAL_RELATIONS_9, missing };
}
