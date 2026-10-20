import type { Ephemeris } from '@reverse/ephemeris';
import { pl9DeltaTSeconds } from './deltaT';
import type { Fidelity } from './fidelity';
import { norm360 } from './zodiac';

export type PlanetName = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export const PLANETS: readonly PlanetName[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'uranus', 'neptune', 'pluto'];

/**
 * The Julian day at which the Swiss Ephemeris reproduces PL9 for a given UT instant.
 * PL9 uses another Delta T, so the same UT maps to another dynamical time. See docs/spec/delta-t.md.
 */
export function pl9Instant(eph: Ephemeris, jdUt: number): number {
  return jdUt + (pl9DeltaTSeconds(jdUt) - eph.deltaTSeconds(jdUt)) / 86400;
}

/** The Julian day the ephemeris is evaluated at for a UT instant: PL9's in the 'pl9' mode, the instant itself otherwise. */
export function ephemerisInstant(eph: Ephemeris, jdUt: number, fidelity: Fidelity = 'pl9'): number {
  return fidelity === 'pl9' ? pl9Instant(eph, jdUt) : jdUt;
}

export function planetLongitude(
  eph: Ephemeris,
  jdUt: number,
  planet: PlanetName,
  ayanamshaDegrees: number,
  fidelity: Fidelity = 'pl9',
): { longitude: number; longitudeSpeed: number; retrograde: boolean } {
  const p = eph.meanEquinoxLongitude(ephemerisInstant(eph, jdUt, fidelity), planet);
  return { longitude: norm360(p.longitude - ayanamshaDegrees), longitudeSpeed: p.longitudeSpeed, retrograde: p.longitudeSpeed < 0 };
}
