import type { Ephemeris } from '@reverse/ephemeris';
import { InvalidInputError } from './errors';
import type { Fidelity } from './fidelity';
import { norm360 } from './zodiac';

const RAD = Math.PI / 180;
const J2000 = 2451545;

export class LagnaUndefinedError extends Error {
  readonly latitude: number;
  constructor(latitude: number) {
    super(`the Lagna is not defined at latitude ${latitude}`);
    this.name = 'LagnaUndefinedError';
    this.latitude = latitude;
  }
}

const sin = (degrees: number) => Math.sin(degrees * RAD);
const centuries = (jdUt: number) => (jdUt - J2000) / 36525;

/** Mean longitude of the Moon's ascending node, degrees. */
function meanNode(t: number): number {
  return 125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000;
}

/** Mean obliquity of the ecliptic, degrees (IAU 1980 expression). */
export function pl9MeanObliquity(jdUt: number): number {
  const t = centuries(jdUt);
  return 23.4392911111 + (-46.815 * t - 0.00059 * t * t + 0.001813 * t * t * t) / 3600;
}

/** Nutation in longitude, degrees, with four terms: the one PL9 puts in the sidereal time. See docs/spec/lagna.md. */
function nutationFourTerms(t: number): number {
  const node = meanNode(t);
  const sun = 280.4665 + 36000.7698 * t;
  const moon = 218.3165 + 481267.8813 * t;
  return (-17.2 * sin(node) - 1.322 * sin(2 * sun) - 0.23 * sin(2 * moon) + 0.21 * sin(2 * node)) / 3600;
}

/**
 * Nutation in longitude, degrees, with thirteen terms: the one PL9 takes out of the ascendant and the midheaven.
 * In the 'pl9' mode two coefficients differ from the published series, as docs/spec/lagna.md records;
 * the 'corrected' mode uses the published ones.
 */
export function pl9NutationThirteenTerms(jdUt: number, fidelity: Fidelity = 'pl9'): number {
  const pl9 = fidelity === 'pl9';
  const t = centuries(jdUt);
  const t2 = t * t;
  const t3 = t2 * t;
  const sunAnomaly = 357.52772 + 35999.05034 * t - 0.0001603 * t2 - t3 / 300000;
  const moonAnomaly = 134.96298 + 477198.867398 * t + 0.0086972 * t2 + t3 / 56250;
  const node = meanNode(t);
  const elongation2 = 2 * (297.85036 + 445267.11148 * t - 0.0019142 * t2 + t3 / 189474);
  // The published T² coefficient of the argument of latitude is -0.0036825; PL9 uses the Moon anomaly's.
  const latitude2 = 2 * (93.27191 + 483202.017538 * t + (pl9 ? 0.0086972 : -0.0036825) * t2 + t3 / 327270);
  const node2 = 2 * node;
  // Units of 0.0001 arcsecond.
  const sum = sin(node) * (-171996 - 174.2 * t)
    + sin(latitude2 - elongation2 + node2) * (-13187 - 1.6 * t)
    // The published coefficient of T is 0.2; PL9 uses 0.02.
    + sin(latitude2 + node2) * (-2274 - (pl9 ? 0.02 : 0.2) * t)
    + sin(node2) * (2062 + 0.2 * t)
    + sin(sunAnomaly) * (1426 - 3.4 * t)
    + sin(moonAnomaly) * (712 + 0.1 * t)
    + sin(sunAnomaly + latitude2 - elongation2 + node2) * (-517 + 1.2 * t)
    + sin(latitude2 + node) * (-386 - 0.4 * t)
    + sin(moonAnomaly + latitude2 + node2) * -301
    + sin(-sunAnomaly + latitude2 - elongation2 + node2) * (217 - 0.5 * t)
    + sin(moonAnomaly - elongation2) * -158
    + sin(latitude2 - elongation2 + node) * (129 + 0.1 * t)
    + sin(-moonAnomaly + latitude2 + node2) * 123;
  return sum / 36000000;
}

/** Local apparent sidereal time as PL9 computes it, degrees in [0, 360). */
export function pl9LocalSiderealTime(jdUt: number, longitudeEast: number): number {
  const t = centuries(jdUt);
  const mean = 280.46061837 + 360.98564736629 * (jdUt - J2000) + 0.000387933 * t * t - (t * t * t) / 38710000;
  return norm360(mean + nutationFourTerms(t) * Math.cos(pl9MeanObliquity(jdUt) * RAD) + longitudeEast);
}

/**
 * Sidereal longitude of the ascendant as PL9 gives it. See docs/spec/lagna.md.
 * `eph` is not used: PL9 computes the Lagna from closed formulas, not from the ephemeris.
 */
export function lagnaLongitude(
  _eph: Ephemeris,
  jdUt: number,
  latitude: number,
  longitudeEast: number,
  ayanamshaDegrees: number,
  fidelity: Fidelity = 'pl9',
): number {
  if (![jdUt, longitudeEast, ayanamshaDegrees].every(Number.isFinite)) throw new InvalidInputError('jdUt, longitudeEast and ayanamshaDegrees must be finite numbers');
  const eps = pl9MeanObliquity(jdUt);
  if (!Number.isFinite(latitude) || Math.abs(latitude) >= 90 - eps) throw new LagnaUndefinedError(latitude);
  const theta = pl9LocalSiderealTime(jdUt, longitudeEast) * RAD;
  const e = eps * RAD;
  const tropical = Math.atan2(Math.cos(theta), -(Math.sin(theta) * Math.cos(e) + Math.tan(latitude * RAD) * Math.sin(e))) / RAD;
  return norm360(tropical - pl9NutationThirteenTerms(jdUt, fidelity) - ayanamshaDegrees);
}
