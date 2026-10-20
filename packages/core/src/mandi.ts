import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from './ayanamsha';
import { dayPortion } from './gulika';
import { lagnaLongitude } from './lagna';
import { dayFrame, type DayFrame } from './sunrise';

/** Thirtieths of the day, and of the night, at which Mandi rises, from Sunday to Saturday. See docs/spec/mandi.md. */
const DAY = [26, 22, 18, 14, 10, 6, 2] as const;
const NIGHT = [10, 6, 2, 26, 22, 18, 14] as const;
/** PL9's night: from Wednesday on, two thirtieths later than the table it follows. See docs/spec/correcoes.md. */
const NIGHT_PL9 = [10, 6, 2, 28, 24, 20, 16] as const;

/** Sidereal longitude of Mandi as PL9 gives it: the Lagna at the thirtieth of the day or night set by the weekday. */
export function mandiLongitude(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, utcOffsetHours = 0, day?: DayFrame): number {
  const f = day ?? dayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const { weekday, start, length } = dayPortion(f, jdUt, utcOffsetHours);
  const instant = start + (length * (f.isDay ? DAY : frame.fidelity === 'pl9' ? NIGHT_PL9 : NIGHT)[weekday]!) / 30;
  return lagnaLongitude(eph, instant, latitude, longitudeEast, frame.lagnaAyanamsha(instant), frame.fidelity);
}
