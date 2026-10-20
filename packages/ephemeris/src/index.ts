import SwissEph from 'swisseph-wasm';
import { julianDayUt } from './time';

export { julianDayUt };

export type Body =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto' | 'meanNode' | 'trueNode';

export interface TropicalPosition {
  /** Apparent geocentric ecliptic longitude of date, degrees. */
  longitude: number;
  latitude: number;
  /** Astronomical units. */
  distance: number;
  /** Degrees per day. */
  longitudeSpeed: number;
}

/** Sidereal modes of the library that may correspond to PL9 options. */
export type SiderealMode =
  | 'lahiri' | 'faganBradley' | 'raman' | 'krishnamurti' | 'yukteshwar' | 'bhasin' | 'trueCitra' | 'krishnamurtiVp291';

export interface RiseSetOptions {
  event: 'rise' | 'set';
  disc: 'centre' | 'upperLimb';
  /** Standard atmosphere when true; geometric horizon when false. */
  refraction: boolean;
}
export type HouseSystemReference = 'placidus' | 'equal' | 'porphyry' | 'sripati' | 'wholeSign';

export interface Ephemeris {
  tropical(jdUt: number, body: Body): TropicalPosition;
  /** Like tropical(), referred to the mean equinox of date (no nutation). */
  meanEquinoxLongitude(jdUt: number, body: Body): TropicalPosition;
  deltaTSeconds(jdUt: number): number;
  /** Degrees. */
  obliquityAndNutation(jdUt: number): { trueObliquity: number; meanObliquity: number; nutationLongitude: number; nutationObliquity: number };
  /** Apparent sidereal time at Greenwich, hours in [0, 24). */
  siderealTimeHours(jdUt: number): number;
  /** Tropical ascendant, degrees. */
  ascendantTropical(jdUt: number, latitude: number, longitudeEast: number): number;
  /**
   * Longitude in the library's own sidereal mode. Reference only.
   * Not the same as tropical minus ayanamsha: the sidereal mode leaves nutation out.
   */
  siderealReference(jdUt: number, body: Body, mode: SiderealMode): number;
  /** Mean ayanamsha of the library for a mode (without nutation). Reference only. */
  ayanamshaReference(jdUt: number, mode: SiderealMode): number;
  /** siderealReference with Lahiri. */
  lahiriSiderealReference(jdUt: number, body: Body): number;
  /** ayanamshaReference with Lahiri. */
  lahiriAyanamshaReference(jdUt: number): number;
  /** First sunrise or sunset after jdUt, as the library computes it. Null when there is none. Reference only. */
  sunRiseSetReference(jdUt: number, latitude: number, longitudeEast: number, options: RiseSetOptions): number | null;
  /** Apparent right ascension and declination of the Sun, degrees. */
  sunEquatorial(jdUt: number): { rightAscension: number; declination: number };
  /** Tropical house cusps of the library; cusps[0] is house 1. Reference only. */
  housesReference(jdUt: number, latitude: number, longitudeEast: number, system: HouseSystemReference): { cusps: number[]; ascendant: number; midheaven: number };
  close(): void;
}

/** The bundled data files run from 1800 to 2400; a margin is kept at both ends. */
export const DATA_RANGE = {
  minJdUt: julianDayUt(1800, 1, 10),
  maxJdUt: julianDayUt(2399, 12, 20),
};

export class EphemerisRangeError extends Error {
  readonly jdUt: number;
  constructor(jdUt: number) {
    super(`Julian day ${jdUt} is outside the ephemeris data range ${DATA_RANGE.minJdUt}..${DATA_RANGE.maxJdUt}`);
    this.name = 'EphemerisRangeError';
    this.jdUt = jdUt;
  }
}

const BODY_ID: Record<Body, number> = {
  sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6,
  uranus: 7, neptune: 8, pluto: 9, meanNode: 10, trueNode: 11,
};
const SIDEREAL_MODE_ID: Record<SiderealMode, number> = {
  faganBradley: 0, lahiri: 1, raman: 3, krishnamurti: 5, yukteshwar: 7, bhasin: 8, trueCitra: 27, krishnamurtiVp291: 45,
};
const SEFLG_SWIEPH = 2;
const SEFLG_NONUT = 64;
const SEFLG_SPEED = 256;
const SEFLG_SIDEREAL = 65536;
const SE_ECL_NUT = -1;
const SEFLG_EQUATORIAL = 2048;
const SE_CALC_RISE = 1;
const SE_CALC_SET = 2;
const SE_BIT_DISC_CENTER = 256;
const SE_BIT_NO_REFRACTION = 512;
const HOUSE_LETTER: Record<HouseSystemReference, string> = { placidus: 'P', equal: 'A', porphyry: 'O', sripati: 'S', wholeSign: 'W' };

function assertInRange(jdUt: number): void {
  if (!Number.isFinite(jdUt) || jdUt < DATA_RANGE.minJdUt || jdUt > DATA_RANGE.maxJdUt) {
    throw new EphemerisRangeError(jdUt);
  }
}

export async function createSwissEphemeris(): Promise<Ephemeris> {
  const swe = new SwissEph();
  await swe.initSwissEph();

  const position = (jdUt: number, body: Body, flags: number): TropicalPosition => {
    assertInRange(jdUt);
    const r = swe.calc_ut(jdUt, BODY_ID[body], SEFLG_SWIEPH | SEFLG_SPEED | flags);
    return { longitude: r[0]!, latitude: r[1]!, distance: r[2]!, longitudeSpeed: r[3]! };
  };
  const siderealReference = (jdUt: number, body: Body, mode: SiderealMode): number => {
    assertInRange(jdUt);
    swe.set_sid_mode(SIDEREAL_MODE_ID[mode], 0, 0);
    return swe.calc_ut(jdUt, BODY_ID[body], SEFLG_SWIEPH | SEFLG_SIDEREAL)[0]!;
  };
  const ayanamshaReference = (jdUt: number, mode: SiderealMode): number => {
    assertInRange(jdUt);
    swe.set_sid_mode(SIDEREAL_MODE_ID[mode], 0, 0);
    return swe.get_ayanamsa_ut(jdUt);
  };

  return {
    tropical: (jdUt, body) => position(jdUt, body, 0),
    meanEquinoxLongitude: (jdUt, body) => position(jdUt, body, SEFLG_NONUT),
    deltaTSeconds(jdUt) {
      assertInRange(jdUt);
      return swe.deltat(jdUt) * 86400;
    },
    obliquityAndNutation(jdUt) {
      assertInRange(jdUt);
      const r = swe.calc_ut(jdUt, SE_ECL_NUT, 0);
      return { trueObliquity: r[0]!, meanObliquity: r[1]!, nutationLongitude: r[2]!, nutationObliquity: r[3]! };
    },
    siderealTimeHours(jdUt) {
      assertInRange(jdUt);
      return swe.sidtime(jdUt);
    },
    ascendantTropical(jdUt, latitude, longitudeEast) {
      assertInRange(jdUt);
      const h = swe.houses(jdUt, latitude, longitudeEast, 'P') as unknown as { ascmc: ArrayLike<number> };
      return h.ascmc[0]!;
    },
    siderealReference,
    ayanamshaReference,
    lahiriSiderealReference: (jdUt, body) => siderealReference(jdUt, body, 'lahiri'),
    lahiriAyanamshaReference: (jdUt) => ayanamshaReference(jdUt, 'lahiri'),
    sunRiseSetReference(jdUt, latitude, longitudeEast, o) {
      assertInRange(jdUt);
      const rsmi = (o.event === 'rise' ? SE_CALC_RISE : SE_CALC_SET)
        | (o.disc === 'centre' ? SE_BIT_DISC_CENTER : 0)
        | (o.refraction ? 0 : SE_BIT_NO_REFRACTION);
      const t = swe.rise_trans(jdUt, BODY_ID.sun, '', SEFLG_SWIEPH, rsmi, [longitudeEast, latitude, 0], 1013.25, 15);
      return t && Number.isFinite(t[0]) && t[0]! > 0 ? t[0]! : null;
    },
    sunEquatorial(jdUt) {
      assertInRange(jdUt);
      const r = swe.calc_ut(jdUt, BODY_ID.sun, SEFLG_SWIEPH | SEFLG_EQUATORIAL);
      return { rightAscension: r[0]!, declination: r[1]! };
    },
    housesReference(jdUt, latitude, longitudeEast, system) {
      assertInRange(jdUt);
      const h = swe.houses(jdUt, latitude, longitudeEast, HOUSE_LETTER[system]) as unknown as { cusps: ArrayLike<number>; ascmc: ArrayLike<number> };
      return { cusps: Array.from({ length: 12 }, (_, k) => h.cusps[k + 1]!), ascendant: h.ascmc[0]!, midheaven: h.ascmc[1]! };
    },
    close() {
      swe.close();
    },
  };
}
