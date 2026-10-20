import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame, ayanamshaPl9 } from './ayanamsha';
import { gulikaLongitude } from './gulika';
import { mandiLongitude } from './mandi';
import { pranaPadaLongitude } from './pranaPada';
import { LagnaUndefinedError, lagnaLongitude } from './lagna';
import { SunriseUndefinedError, dayFrame } from './sunrise';
import { nodeLongitudes } from './node';
import type { Fidelity } from './fidelity';
import { resolveOptions, type CoreOptions } from './options';
import { PLANETS, planetLongitude } from './planets';
import { bhriguPoint, upagrahas } from './upagrahas';
import { nakshatraOf, padaOf, signOf } from './zodiac';
import { VERIFIED_MAX_ABS_LATITUDE, VERIFIED_RANGE } from './range';
import { InvalidInputError } from './errors';

export type PointName =
  | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu'
  | 'uranus' | 'neptune' | 'pluto' | 'dhuma' | 'vyatipata' | 'parivesha' | 'indrachapa' | 'upaketu' | 'gulika' | 'pranaPada' | 'lagna'
  | 'mandi' | 'bhrigu';

/** The twenty points PL9 exports. */
export const POINTS: readonly PointName[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
  'uranus', 'neptune', 'pluto', 'dhuma', 'vyatipata', 'parivesha', 'indrachapa', 'upaketu', 'gulika', 'pranaPada', 'lagna',
];
/** Points PL9 shows and does not export. */
export const SPECIAL_POINTS: readonly PointName[] = ['mandi', 'bhrigu'];
export const ALL_POINTS: readonly PointName[] = [...POINTS, ...SPECIAL_POINTS];

export interface PointPosition {
  /** Sidereal longitude, degrees in [0, 360). */
  longitude: number;
  /** 0 = Aries ... 11 = Pisces. */
  sign: number;
  /** 0 = Ashwini ... 26 = Revati. */
  nakshatra: number;
  /** 1 to 4. */
  pada: number;
  /** Degrees per day, as the ephemeris gives it. Present for planets and nodes. Its value was not checked against PL9. */
  longitudeSpeed?: number;
  /** longitudeSpeed < 0 for the planets, as PL9 marks them; always false for the nodes, which PL9 never marks. */
  retrograde?: boolean;
}

export interface ChartInput {
  /** Julian day, universal time. */
  jdUt: number;
  /** Degrees, north positive. */
  latitude: number;
  /** Degrees, east positive. */
  longitudeEast: number;
  /**
   * The clock the chart is written in, minus UT, in hours (5.5 for India). Default 0.
   * It changes one thing only: the weekday that Gulika and Mandi are counted from. See docs/spec/gulika.md.
   */
  utcOffsetHours?: number;
}

/** Points that exist at every latitude. */
export type SteadyPoint = Exclude<PointName, 'lagna' | 'gulika' | 'pranaPada' | 'mandi'>;
/** Why something is absent from a result. */
export type MissingReason = 'beyondPolarCircle' | 'sunriseNotFound';
export interface Missing {
  what: 'lagna' | 'gulika' | 'pranaPada' | 'mandi' | 'houses' | 'arudhas' | 'specialLagnas';
  reason: MissingReason;
}

export interface Positions {
  /**
   * True when the instant and the latitude are inside the ranges in which the 'pl9' mode was checked against PL9,
   * and nothing is missing. It says where the chart lies, not that these numbers equal PL9's: in the 'corrected'
   * mode they differ from PL9 on purpose, by what docs/spec/corrections.md lists.
   */
  verified: boolean;
  /** The mode the numbers were computed in. */
  fidelity: Fidelity;
  ayanamshaDegrees: number;
  /** The Lagna, Gulika, Prana Pada and Mandi are absent where they are not defined; see `missing`. */
  points: Record<SteadyPoint, PointPosition> & Partial<Record<'lagna' | 'gulika' | 'pranaPada' | 'mandi', PointPosition>>;
  /** What is absent and why. Empty for an ordinary chart. */
  missing: Missing[];
}

function point(longitude: number, motion?: { longitudeSpeed: number; retrograde: boolean }): PointPosition {
  const base = { longitude, sign: signOf(longitude), nakshatra: nakshatraOf(longitude), pada: padaOf(longitude) };
  return motion ? { ...base, longitudeSpeed: motion.longitudeSpeed, retrograde: motion.retrograde } : base;
}

export function computePositions(eph: Ephemeris, input: ChartInput, options?: Partial<CoreOptions>): Positions {
  const o = resolveOptions(options);
  const { jdUt, latitude, longitudeEast, utcOffsetHours = 0 } = input;
  if (!Number.isFinite(jdUt)) throw new InvalidInputError('jdUt must be a finite number');
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) throw new InvalidInputError('latitude must be between -90 and 90');
  if (!Number.isFinite(longitudeEast) || Math.abs(longitudeEast) > 180) throw new InvalidInputError('longitudeEast must be between -180 and 180');

  if (!Number.isFinite(utcOffsetHours) || Math.abs(utcOffsetHours) > 24) throw new InvalidInputError('utcOffsetHours must be between -24 and 24');

  const ay = ayanamshaPl9(eph, jdUt, o.ayanamsha, o.ayanamshaOffsetDegrees, o.fidelity);
  const points = {} as Positions['points'];
  for (const p of PLANETS) {
    const v = planetLongitude(eph, jdUt, p, ay, o.fidelity);
    points[p] = point(v.longitude, v);
  }
  const nodes = nodeLongitudes(eph, jdUt, ay, o.fidelity);
  points.rahu = point(nodes.rahu.longitude, nodes.rahu);
  points.ketu = point(nodes.ketu.longitude, nodes.ketu);
  const u = upagrahas(points.sun.longitude);
  points.dhuma = point(u.dhuma);
  points.vyatipata = point(u.vyatipata);
  points.parivesha = point(u.parivesha);
  points.indrachapa = point(u.indrachapa);
  points.upaketu = point(u.upaketu);
  points.bhrigu = point(bhriguPoint(points.moon.longitude, points.rahu.longitude));
  // The Lagna, and the points that are a Lagna at another instant, take their own angle: see ayanamshaFrame.
  const frame = ayanamshaFrame(eph, o.ayanamsha, o.ayanamshaOffsetDegrees, o.fidelity);
  // A point that is not defined at the place is left out and listed, with the reason: the rest of the chart stands.
  const missing: Missing[] = [];
  const absent = (reason: MissingReason, ...what: Missing['what'][]) => what.forEach((w) => missing.push({ what: w, reason }));
  try {
    points.lagna = point(lagnaLongitude(eph, jdUt, latitude, longitudeEast, frame.lagnaAyanamsha(jdUt), o.fidelity));
  } catch (e) {
    if (!(e instanceof LagnaUndefinedError)) throw e;
    absent('beyondPolarCircle', 'lagna', 'gulika', 'pranaPada', 'mandi');
  }
  if (points.lagna) {
    try {
      const day = dayFrame(eph, jdUt, latitude, longitudeEast, frame);
      const gulika = point(gulikaLongitude(eph, jdUt, latitude, longitudeEast, frame, utcOffsetHours, day, o.gulika));
      const pranaPada = point(pranaPadaLongitude(eph, jdUt, latitude, longitudeEast, frame, day));
      const mandi = point(mandiLongitude(eph, jdUt, latitude, longitudeEast, frame, utcOffsetHours, day));
      points.gulika = gulika;
      points.pranaPada = pranaPada;
      points.mandi = mandi;
    } catch (e) {
      if (!(e instanceof SunriseUndefinedError || e instanceof LagnaUndefinedError)) throw e;
      absent('sunriseNotFound', 'gulika', 'pranaPada', 'mandi');
    }
  }

  const inRange = jdUt >= VERIFIED_RANGE.minJdUt && jdUt <= VERIFIED_RANGE.maxJdUt && Math.abs(latitude) <= VERIFIED_MAX_ABS_LATITUDE;
  return { verified: inRange && missing.length === 0, fidelity: o.fidelity, ayanamshaDegrees: ay, points, missing };
}
