import type { Ephemeris } from '@reverse/ephemeris';
import { resolveOptions, type CoreOptions } from '../options';
import type { Fidelity } from '../fidelity';
import { computePositions, type ChartInput, type PointPosition } from '../positions';
import { PLANETS_9, type Planet9 } from '../jaimini';
import { signOf } from '../zodiac';
import { AV_PLANETS, type AshtakavargaOptions, type AvPlanet, type AvSigns } from '../strengths/ashtakavarga';
import { computeShadbala } from '../strengths/compute';
import type { ShadbalaOptions } from '../strengths/shadbala/types';
import { vimshopaka } from '../strengths/vimshopaka';
import { kotaScore, sanghattaVedhas, sarvatobhadraVedhas, type SbcVedha, type TransitBody } from './chakras';
import { kotaChakra } from './kota';
import { transitKakshas, type KakshaRow } from './kaksha';
import { chandrabala, tarabala } from './tarabala';

/** The second instant: universal time and the place of the transit (by default PL9's is its installation's place). */
export interface TransitInstant {
  jdUt: number;
  latitude: number;
  longitudeEast: number;
}

export interface Transits {
  at: TransitInstant;
  /** The transit Lagna (at the place of the transit) and the nine planets. */
  points: Record<Planet9, PointPosition> & { lagna?: PointPosition };
  /** Null without the natal Lagna (the natal Ashtakavarga needs it). */
  kakshas: Record<AvPlanet, KakshaRow> | null;
  /** The Shadbala of the transit chart, total over the minimum, as PL9 prints it for the transits. */
  shadbalaRatio: Record<AvPlanet, number> | null;
  /** How many of the transit chart's Shadbala components are strong (the worksheets' SB#), as the Muhurta's. */
  shadbalaStrong: Record<AvPlanet, number> | null;
  /** The Shadvarga Vimshopaka of the transit planets (the worksheets' VB). */
  vimshopaka: Record<Planet9, number>;
  tarabala: ReturnType<typeof tarabala>;
  chandrabala: ReturnType<typeof chandrabala>;
  /**
   * The transit chakras (docs/spec/time/transits.md): the Kota Chakra's places and score (the score null without the
   * natal Lagna), the Sanghatta's vedhas and the Sarvatobhadra's.
   */
  chakras: {
    kota: { first: number; places: Partial<Record<Planet9, number>>; score: number | null };
    sanghatta: ReturnType<typeof sanghattaVedhas>;
    sarvatobhadra: SbcVedha[];
  };
  /** What could not be had: the transit Lagna and the Shadbala beyond the polar circle, the kakshas without the natal Lagna. */
  missing: { what: 'lagna' | 'shadbala' | 'kakshas'; reason: string }[];
  fidelity: Fidelity;
}

export interface TransitOptions {
  ashtakavarga: Partial<AshtakavargaOptions>;
  shadbala: Partial<ShadbalaOptions>;
}

/**
 * The transits over a natal chart at an instant and place: the transit chart, the kakshas read in the natal
 * Ashtakavarga, Tarabala and Chandrabala from the natal Moon, and the Shadbala of the transit chart.
 * See docs/spec/time/transits.md.
 */
export function computeTransits(eph: Ephemeris, natal: ChartInput, at: TransitInstant, coreOptions?: Partial<CoreOptions>, options: Partial<TransitOptions> = {}): Transits {
  const fidelity = resolveOptions(coreOptions).fidelity;
  const birth = computePositions(eph, natal, coreOptions);
  const now = computePositions(eph, at, coreOptions);
  const natalLagna = birth.points.lagna;
  const missing: Transits['missing'] = [];
  const transitLagna = now.points.lagna;
  if (!transitLagna) missing.push({ what: 'lagna', reason: 'transit Lagna not defined' }, { what: 'shadbala', reason: 'transit Lagna not defined' });
  if (!natalLagna) missing.push({ what: 'kakshas', reason: 'natal Lagna not defined' });
  const transit = Object.fromEntries(AV_PLANETS.map((p) => [p, now.points[p].longitude])) as Record<AvPlanet, number>;
  const sb = transitLagna ? computeShadbala(eph, at, options.shadbala ?? {}, coreOptions) : null;
  const natalSigns = natalLagna
    ? { ...Object.fromEntries(AV_PLANETS.map((p) => [p, signOf(birth.points[p].longitude)])), lagna: signOf(natalLagna.longitude) } as AvSigns
    : null;
  return {
    at,
    points: { ...(transitLagna ? { lagna: transitLagna } : {}), ...Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p]])) } as Transits['points'],
    kakshas: natalSigns ? transitKakshas(natalSigns, transit, options.ashtakavarga ?? {}, fidelity) : null,
    shadbalaRatio: sb ? Object.fromEntries(AV_PLANETS.map((p) => [p, sb.planets[p].ratio])) as Record<AvPlanet, number> : null,
    shadbalaStrong: sb ? Object.fromEntries(AV_PLANETS.map((p) => [p, sb.planets[p].strong])) as Record<AvPlanet, number> : null,
    vimshopaka: Object.fromEntries(Object.entries(vimshopaka(Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p].longitude])) as Record<Planet9, number>, fidelity, 'time').planets).map(([p, x]) => [p, x.scores.shadvarga])) as Record<Planet9, number>,
    tarabala: tarabala(birth.points.moon.longitude, now.points.moon.longitude),
    chandrabala: chandrabala(birth.points.moon.longitude, now.points.moon.longitude),
    chakras: (() => {
      const bodies = Object.fromEntries(PLANETS_9.map((p) => [p, { longitude: now.points[p].longitude, speed: now.points[p].longitudeSpeed ?? 0 }])) as Record<Planet9, TransitBody>;
      const kota = kotaChakra(birth.points.moon.longitude, Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p].longitude])), fidelity);
      return {
        kota: { ...kota, score: natalLagna ? kotaScore({ moon: birth.points.moon.longitude, lagna: natalLagna.longitude }, bodies, fidelity).score : null },
        sanghatta: sanghattaVedhas(Object.fromEntries(PLANETS_9.map((p) => [p, birth.points[p].longitude])) as Record<Planet9, number>, Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p].longitude])) as Record<Planet9, number>),
        sarvatobhadra: sarvatobhadraVedhas(bodies, fidelity),
      };
    })(),
    missing,
    fidelity,
  };
}
