import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from '../ayanamsha';
import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { functionalNatures, naturalNatures, resolveNatures, type Nature } from '../yogas/natures';
import { computePositions, type ChartInput } from '../positions';
import { dayFrame, SunriseUndefinedError } from '../sunrise';
import { bodyAstronomy, PLANET_INFO_BODIES, type BodyAstronomy, type PlanetInfoBody } from './astronomy';
import { combustion, deeptadi, DEFAULT_ANKA, shayanadi, type DeeptadiState, type Shayanadi } from './avasthas';
import { compoundRelations, finalDispositor, hemmed, NATURAL_RELATIONS_9, temporalRelations } from './relations';
import { shashtiamsha, vargaDegree, vargaDeity } from './deities';
import { CLASSICAL_VARGAS, vargaSign, type ClassicalVargaName } from '../vargas';
import { norm360 } from '../zodiac';
import { BY_PADA_NAAMAKSHAR } from '../panchanga/tables';
import { healthSchemes, type HealthSchemes } from './health';
import { karakaForSelf, lajjitadi, natalBaladi, natalJagradadi, OVERVIEW_PLANETS, percentExalted, percentFull, type BaladiState, type JagradadiState, type Lajjitadi } from './overview';
import { argala, navamshaAge, navamshaNumber, dominance, goodVargas, houseEffect, pushkaraNavamsa, housesRuled, mrityuBhaga, navamsaFromRashi, rays, DASHAVARGA, SHADVARGA, shadvargaSignLords, shadvargaElements, type SignQuality } from './columns';

/** PL9's planet data tables, by body (docs/spec/planet-info.md). */

export { MEAN_SPEED, PLANET_INFO_BODIES, declinationOf, krantiOf, speedPercentOf, type BodyAstronomy, type PlanetInfoBody } from './astronomy';
export { NATURAL_RELATIONS_9, compoundRelations, finalDispositor, hemmed, temporalRelations } from './relations';
export { SHASHTIAMSHA_DEITIES, shashtiamsha, vargaDegree, vargaDeity } from './deities';
export { LAJJITADI, karakaForSelf, lajjitadi, natalBaladi, natalJagradadi, percentExalted, percentFull, type BaladiState, type JagradadiState, type Lajjitadi } from './overview';
export { DASHAVARGA, SHADVARGA, navamshaAge, navamshaNumber, argala, houseEffect, pushkaraNavamsa, dominance, goodVargas, housesRuled, mrityuBhaga, navamsaFromRashi, rays, shadvargaSignLords, shadvargaElements, type SignQuality } from './columns';
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
  /** The navamsha's number from the Lagna's, 1 to 108, and PL9's "age" (the number less one, round); need the Lagna. */
  navamshaNumber?: number;
  navamshaAge?: number;
  /** The Shashtiamsha's number, 1 to 60, and nature; its name is the D60 deity. */
  shashtiamsha?: { number: number; nature: 'benefic' | 'malefic' };
  /** PL9's Grahas Overview, Sun to Saturn: the distance from the fall and from the Sun as whole percents of 180°. */
  percentExalted?: number;
  percentFull?: number;
  /** Vaisheshika count: the Dashavarga signs in which it is exalted, in moolatrikona or in its own sign. Sun to Saturn. */
  vaisheshika?: number;
  /** Whether it signifies the self (PL9's "Lagnesh count"): the Sun, the Moon or the Atmakaraka. Sun to Saturn. */
  karakaForSelf?: boolean;
  /** The natal Jagradadi and Baladi, and the Lajjitadi states (none, one or more, in PL9's order). Sun to Ketu. */
  jagradadi?: JagradadiState;
  baladi?: BaladiState;
  lajjitadi?: Lajjitadi[];
}

/** The points of the deities and the degrees in the vargas: the Lagna (when defined), the nine, Mandi and Bhrigu Bindu. */
export type VargaPoint = 'lagna' | Planet9 | 'mandi' | 'bhrigu';

export interface PlanetInfo {
  fidelity: Fidelity;
  /** The Anka the Shayanadi was read with. */
  anka: number;
  points: Record<PlanetInfoBody, PointInfo>;
  /** The Lagna's Mrityu Bhaga, when the Lagna is defined and inside the orb. */
  lagnaMrityuBhaga: { distance: number; severity: number } | null;
  /** The deity of each point in each of the sixteen classical vargas (PL9's "Planetary deities"). */
  deities: Partial<Record<VargaPoint, Record<ClassicalVargaName, string>>>;
  /** The degree of each point within each varga of equal parts (the Trimshamsha left out). */
  vargaDegrees: Partial<Record<VargaPoint, Partial<Record<ClassicalVargaName, number>>>>;
  /**
   * The 108 navamshas in the order of the zodiac (from 0° Aries): each one's sign, 0 to 11, and its number from the
   * Lagna's (null without the Lagna); and which navamsha, 0 to 107, each point is in (PL9's "Navamsha ages").
   */
  navamshas: { sign: number; number: number | null }[];
  navamshaOf: Partial<Record<VargaPoint, number>>;
  /** The syllable of each point's nakshatra pada (PL9's "Nama"); null for the few padas the table gives none. */
  nama: Partial<Record<VargaPoint, string | null>>;
  /**
   * The nine's natures by the chart's options (`natures`): natural, and functional by the Lagna (PL9's "Func."
   * column), null without the Lagna. The same the yogas read.
   */
  natures: { natural: Record<Planet9, Nature>; functional: Record<Planet9, Nature> | null };
  /**
   * Engine 0.20.0 on: the functional natures in each varga but the Rashi, by its own Lagna, its signs and its degrees
   * (PL9's chart of a varga colours them so); null without a Lagna.
   */
  vargaNatures: Partial<Record<ClassicalVargaName, Record<Planet9, Nature> | null>>;
  /** PL9's natural relations of the nine, Rahu and Ketu included: 1 friend, 0 neutral, -1 enemy. */
  naturalRelations: Record<Planet9, Record<Planet9, -1 | 0 | 1>>;
  /** The temporal relations by the birth chart's signs: 1 friend, -1 enemy (PL9's "Tatkalika"). */
  temporalRelations: Record<Planet9, Record<Planet9, -1 | 0 | 1>>;
  /** The compound relations, natural plus temporal: 2 great friend to -2 great enemy (PL9's "Panchadha"). */
  compoundRelations: Record<Planet9, Record<Planet9, -2 | -1 | 0 | 1 | 2>>;
  /** Engine 0.21.0 on: each planet's place in the Health sheet's three body schemes; null without a Lagna. */
  health: Record<Planet9, HealthSchemes> | null;
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
  const core = resolveOptions(coreOptions), natureTable = resolveNatures(core.natures);
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
  if (!lagna) missing.push({ field: 'dominance', reason: 'needs the Lagna' }, { field: 'housesRuled', reason: 'needs the Lagna' }, { field: 'houseEffect', reason: 'needs the Lagna' }, { field: 'navamshaNumber', reason: 'needs the Lagna' });
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
      info.shashtiamsha = shashtiamsha(lon);
      Object.assign(info, {
        ownOrExaltedShadvarga: goodVargas(p, lon, SHADVARGA, f), navamsaFromRashi: navamsaFromRashi(lon, f), pushkaraNavamsa: pushkaraNavamsa(lon, f),
        argala: argala(p, longitudes, natureTable), mrityuBhaga: mrityuBhaga(p, lon),
        shadvargaDispositors: shadvargaSignLords(lon, f), shadvargaElements: shadvargaElements(lon, f),
      });
      if (lagna) Object.assign(info, {
        dominance: dominance(p, longitudes, lagna.longitude), houseEffect: houseEffect(lon, lagna.longitude),
        navamshaNumber: navamshaNumber(lon, lagna.longitude), navamshaAge: navamshaAge(lon, lagna.longitude),
      });
      Object.assign(info, { jagradadi: natalJagradadi(p, longitudes), baladi: natalBaladi(lon), lajjitadi: lajjitadi(p, longitudes, lagna?.longitude, natureTable) });
      if ((OVERVIEW_PLANETS as readonly string[]).includes(p)) {
        const q = p as (typeof OVERVIEW_PLANETS)[number];
        Object.assign(info, {
          percentExalted: percentExalted(q, lon), percentFull: percentFull(lon, longitudes.sun), vaisheshika: goodVargas(p, lon, DASHAVARGA, f),
          karakaForSelf: karakaForSelf(p, longitudes, core.karakas === 'eight' ? 8 : 7),
        });
      }
      const r = rays(p, longitudes);
      if (r !== null) info.rays = r;
      if (lagna && r !== null) info.housesRuled = housesRuled(p, lagna.sign);
    }
    points[body] = info;
  }
  const deities: PlanetInfo['deities'] = {};
  const vargaDegrees: PlanetInfo['vargaDegrees'] = {};
  const at: Partial<Record<VargaPoint, number>> = { ...longitudes };
  for (const extra of ['lagna', 'mandi', 'bhrigu'] as const) { const pt = positions.points[extra]; if (pt) at[extra] = pt.longitude; }
  for (const [point, lon] of Object.entries(at) as [VargaPoint, number][]) {
    deities[point] = Object.fromEntries(CLASSICAL_VARGAS.map((v) => [v, vargaDeity(lon, v)])) as Record<ClassicalVargaName, string>;
    vargaDegrees[point] = Object.fromEntries(CLASSICAL_VARGAS.flatMap((v) => { const d = vargaDegree(lon, v); return d === null ? [] : [[v, d]]; }));
  }
  const g0 = lagna ? Math.floor(norm360(lagna.longitude) / (360 / 108)) : null;
  const navamshas = Array.from({ length: 108 }, (_, g) => ({ sign: g % 12, number: g0 === null ? null : ((g - g0 + 108) % 108) + 1 }));
  const navamshaOf = Object.fromEntries(Object.entries(at).map(([pt, lon]) => [pt, Math.floor(norm360(lon) / (360 / 108))])) as PlanetInfo['navamshaOf'];
  const nama = Object.fromEntries(Object.entries(navamshaOf).map(([pt, pada]) => [pt, BY_PADA_NAAMAKSHAR[pada!] ?? null])) as PlanetInfo['nama'];
  const withLagna = lagna ? { ...longitudes, lagna: lagna.longitude } : longitudes;
  const natures = { natural: naturalNatures(longitudes, natureTable), functional: functionalNatures(withLagna, natureTable) };
  // A varga's longitudes: its sign and the degree within it (the D30, which has none, at its sign's middle).
  const inVarga = (lon: number, v: ClassicalVargaName) => vargaSign(lon, v, f) * 30 + (vargaDegree(lon, v) ?? 15);
  const vargaNatures: PlanetInfo['vargaNatures'] = Object.fromEntries(CLASSICAL_VARGAS.filter((v) => v !== 'D1').map((v) => [v, functionalNatures(
    Object.fromEntries(Object.entries(withLagna).map(([k, lon]) => [k, inVarga(lon as number, v)])) as typeof withLagna, natureTable)]));
  return { fidelity: core.fidelity, anka, points, health: lagna ? healthSchemes(longitudes, lagna.longitude) : null, deities, vargaDegrees, navamshas, navamshaOf, nama, natures, vargaNatures, lagnaMrityuBhaga: lagna ? mrityuBhaga('lagna', lagna.longitude) : null, naturalRelations: NATURAL_RELATIONS_9, temporalRelations: temporalRelations(longitudes), compoundRelations: compoundRelations(longitudes), missing };
}
