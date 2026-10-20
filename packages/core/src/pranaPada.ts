import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from './ayanamsha';
import { planetLongitude } from './planets';
import { dayFrame, type DayFrame } from './sunrise';
import { norm360, signOf } from './zodiac';

/** One sign every six minutes. */
const DEGREES_PER_DAY = 7200;
/** Added to the Sun when it is in a movable, a fixed or a dual sign. */
const START_BY_SIGN_KIND = [0, 240, 120];

/** Sidereal longitude of Prana Pada as PL9 gives it. See docs/spec/prana-pada.md. */
export function pranaPadaLongitude(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, day?: DayFrame): number {
  const { sunrise } = day ?? dayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const sun = planetLongitude(eph, jdUt, 'sun', frame.sunAyanamsha(jdUt), frame.fidelity).longitude;
  return norm360(sun + START_BY_SIGN_KIND[signOf(sun) % 3]! + (jdUt - sunrise) * DEGREES_PER_DAY);
}
