import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from './ayanamsha';
import { lagnaLongitude } from './lagna';
import { planetLongitude } from './planets';
import { dayFrame, type DayFrame } from './sunrise';
import { norm360 } from './zodiac';

/** The seven planets that rule signs. */
export type Planet7 = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

/** Lord of each sign, from Aries: Scorpio is Mars's and Aquarius Saturn's. */
export const SIGN_LORDS: readonly Planet7[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];

export interface SpecialLagnas {
  /** Sidereal longitudes, degrees in [0, 360). */
  bhava: number;
  hora: number;
  ghatika: number;
  jaiminiHora: number;
}

/**
 * Bhava, Hora and Ghatika Lagna, and the Jaimini Hora Lagna, as PL9 gives them. See docs/spec/special-lagnas.md.
 * `day` is the day frame of the instant, when the caller already has it.
 */
export function specialLagnas(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, day?: DayFrame): SpecialLagnas {
  const f = day ?? dayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const sun = planetLongitude(eph, f.sunrise, 'sun', frame.sunAyanamsha(f.sunrise), frame.fidelity).longitude;
  const elapsed = jdUt - f.sunrise;
  const hora = norm360(sun + 720 * elapsed);
  const lagna = lagnaLongitude(eph, jdUt, latitude, longitudeEast, frame.lagnaAyanamsha(jdUt), frame.fidelity);
  const oddLagna = Math.floor(lagna / 30) % 2 === 0;
  return {
    bhava: norm360(sun + 360 * elapsed),
    hora,
    ghatika: norm360(sun + 1800 * elapsed),
    jaiminiHora: oddLagna ? hora : norm360(lagna + 720 * elapsed),
  };
}

/** Kalas of each planet, for the Indu Lagna. */
const KALAS: Record<Planet7, number> = { sun: 30, moon: 16, mars: 6, mercury: 8, jupiter: 10, venus: 12, saturn: 1 };

/**
 * Sign, 0 to 11, of the Indu Lagna: the kalas of the lords of the ninth from the Lagna and from the Moon, added,
 * counted from the Moon. See docs/spec/special-lagnas.md.
 */
export function induLagna(lagnaSign: number, moonSign: number): number {
  const ninth = (sign: number) => SIGN_LORDS[(sign + 8) % 12]!;
  const count = (KALAS[ninth(lagnaSign)] + KALAS[ninth(moonSign)]) % 12 || 12;
  return (moonSign + count - 1) % 12;
}
