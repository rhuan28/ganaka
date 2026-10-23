import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import type { Positions } from '../positions';
import { norm360 } from '../zodiac';

/**
 * The astronomy of PL9's planet tables (docs/spec/planet-info.md): the true declination, PL9's Kranti, the speed and
 * the speed against a mean one.
 */

export const PLANET_INFO_BODIES = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'uranus', 'neptune', 'pluto'] as const;
export type PlanetInfoBody = (typeof PLANET_INFO_BODIES)[number];
const OUTER = ['uranus', 'neptune', 'pluto'] as const;

/** PL9's mean daily motions, degrees a day, that the speed is set against. */
export const MEAN_SPEED: Record<Planet9, number> = {
  sun: 0.985556, moon: 13.176667, mars: 0.616667, mercury: 0.985556, jupiter: 0.081111, venus: 0.985556, saturn: 0.033611,
  rahu: 0.052993, ketu: 0.052993,
};

/** The largest declination PL9's Kranti uses, degrees. */
const KRANTI_MAXIMUM = 23.45;

export interface BodyAstronomy {
  tropicalLongitude: number;
  eclipticLatitude: number;
  /** The true declination, degrees: from the ecliptic longitude and latitude and the true obliquity of the date. */
  declination: number;
  /** PL9's Kranti, degrees: 23.45 times the sine of the tropical longitude, the latitude left out. */
  kranti: number;
  /** Degrees a day, negative when retrograde. */
  speed: number;
  /** 100 times the mean motion over the actual one, truncated; null for the outer planets and for a speed of zero. */
  speedPercent: number | null;
  /** A negative speed, marked for the planets and never for the nodes, as PL9 marks them. */
  retrograde: boolean;
}

const RAD = Math.PI / 180;

export function declinationOf(longitude: number, latitude: number, obliquity: number): number {
  return Math.asin(Math.sin(latitude * RAD) * Math.cos(obliquity * RAD) + Math.cos(latitude * RAD) * Math.sin(obliquity * RAD) * Math.sin(longitude * RAD)) / RAD;
}

export const krantiOf = (tropicalLongitude: number): number => KRANTI_MAXIMUM * Math.sin(tropicalLongitude * RAD);

export function speedPercentOf(body: Planet9, speed: number): number | null {
  return speed === 0 ? null : Math.trunc((100 * MEAN_SPEED[body]) / speed);
}

export function bodyAstronomy(eph: Ephemeris, jdUt: number, positions: Positions, node: 'true' | 'mean'): Record<PlanetInfoBody, BodyAstronomy> {
  // PL9 takes these from the ephemeris at the birth instant itself, not at the instant its positions use.
  const { trueObliquity } = eph.obliquityAndNutation(jdUt);
  const out = {} as Record<PlanetInfoBody, BodyAstronomy>;
  for (const body of PLANET_INFO_BODIES) {
    const point = positions.points[body];
    const speed = point.longitudeSpeed ?? 0;
    const isNode = body === 'rahu' || body === 'ketu';
    // The nodes have no latitude; PL9 takes Rahu from the ephemeris as it is (the true or the mean node, by the
    // chart's option), not its own corrected node, and Ketu opposite.
    const tropical = eph.tropical(jdUt, isNode ? (node === 'mean' ? 'meanNode' : 'trueNode') : body);
    const latitude = isNode ? 0 : tropical.latitude;
    const tropicalLongitude = body === 'ketu' ? norm360(tropical.longitude + 180) : tropical.longitude;
    const outer = (OUTER as readonly string[]).includes(body);
    out[body] = {
      tropicalLongitude,
      eclipticLatitude: latitude,
      declination: declinationOf(tropicalLongitude, latitude, trueObliquity),
      kranti: krantiOf(tropicalLongitude),
      speed,
      speedPercent: outer ? null : speedPercentOf(body as Planet9, speed),
      retrograde: !isNode && speed < 0,
    };
  }
  return out;
}
