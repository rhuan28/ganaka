import type { Ephemeris } from '@reverse/ephemeris';
import type { Fidelity } from './fidelity';
import { ephemerisInstant } from './planets';
import { norm360 } from './zodiac';

/**
 * Amplitude, in arcseconds, of the term that takes the library's true node to PL9's.
 * Measured; see docs/spec/nodo.md.
 */
export const NODE_PLANE_TERM_ARCSEC = 0.4653;

/** General precession in longitude accumulated since J2000, degrees. */
function precessionSinceJ2000(jd: number): number {
  const t = (jd - 2451545) / 36525;
  return (5028.796195 * t + 1.1054348 * t * t) / 3600;
}

export interface NodePosition {
  longitude: number;
  longitudeSpeed: number;
  retrograde: boolean;
}

/** Rahu (true node) and Ketu as PL9 gives them. See docs/spec/nodo.md. */
export function nodeLongitudes(eph: Ephemeris, jdUt: number, ayanamshaDegrees: number, fidelity: Fidelity = 'pl9'): { rahu: NodePosition; ketu: NodePosition } {
  const t = ephemerisInstant(eph, jdUt, fidelity);
  const node = eph.meanEquinoxLongitude(t, 'trueNode');
  const referredToJ2000 = node.longitude - precessionSinceJ2000(t);
  const term = (NODE_PLANE_TERM_ARCSEC / 3600) * Math.sin((referredToJ2000 * Math.PI) / 180);
  const rahu = norm360(node.longitude + term - ayanamshaDegrees);
  // PL9 never marks the nodes retrograde; their speed is negative almost always.
  const motion = { longitudeSpeed: node.longitudeSpeed, retrograde: false };
  return { rahu: { longitude: rahu, ...motion }, ketu: { longitude: norm360(rahu + 180), ...motion } };
}
