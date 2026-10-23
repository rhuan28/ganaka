import type { Ephemeris } from '@reverse/ephemeris';
import type { Planet9 } from '../jaimini';
import { ephemerisInstant } from '../planets';
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

export function bodyAstronomy(eph: Ephemeris, jdUt: number, positions: Positions): Record<PlanetInfoBody, BodyAstronomy> {
  // At the instant PL9's positions use (docs/spec/planet-info.md).
  const instant = ephemerisInstant(eph, jdUt, positions.fidelity);
  const { trueObliquity, nutationLongitude } = eph.obliquityAndNutation(instant);
  const out = {} as Record<PlanetInfoBody, BodyAstronomy>;
  for (const body of PLANET_INFO_BODIES) {
    const isNode = body === 'rahu' || body === 'ketu';
    // The nodes have no latitude; their longitude is PL9's own node (positions.ts) put back on the true equinox:
    // the ayanamsha and the nutation in longitude added. Ketu is opposite.
    const point = positions.points[body];
    const tropical = isNode ? null : eph.tropical(instant, body);
    // The nodes' speed is the ephemeris' true node's, as PL9's tables print it.
    const speed = (tropical ?? eph.tropical(instant, 'trueNode')).longitudeSpeed;
    const latitude = tropical ? tropical.latitude : 0;
    const tropicalLongitude = tropical ? tropical.longitude : norm360(point.longitude + positions.ayanamshaDegrees + nutationLongitude);
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
