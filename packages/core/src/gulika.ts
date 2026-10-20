import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from './ayanamsha';
import { lagnaLongitude } from './lagna';
import { dayFrame, type DayFrame } from './sunrise';

/** 0 = Sunday ... 6 = Saturday, for the calendar date that holds an instant given as a Julian day. */
function weekdayOf(jd: number): number {
  return (((Math.floor(jd + 1.5) % 7) + 7) % 7);
}

/**
 * The eighth of the day, or of the night, at whose end Gulika is taken: the part ruled by Saturn.
 * By day the parts follow the weekday order starting from the lord of the day;
 * by night they start from the lord of the fifth weekday. See docs/spec/gulika.md.
 */
function saturnPart(weekday: number, isDay: boolean): number {
  if (isDay) return 7 - weekday;
  return (10 - weekday) % 7 || 7;
}

/** The day or the night that holds the instant, and the weekday it is counted on. */
export function dayPortion(f: DayFrame, jdUt: number, utcOffsetHours: number): { weekday: number; start: number; length: number } {
  // By night the weekday is that of the date twelve hours earlier.
  const clock = jdUt + utcOffsetHours / 24;
  return f.isDay
    ? { weekday: weekdayOf(clock), start: f.sunrise, length: f.sunset - f.sunrise }
    : { weekday: weekdayOf(clock - 0.5), start: f.sunset, length: f.nextSunrise - f.sunset };
}

/**
 * Sidereal longitude of Gulika as PL9 gives it, by the "Gulik method" given: the end of Saturn's portion, PL9's
 * default, or its beginning. See docs/spec/gulika.md.
 * `utcOffsetHours` is the clock the chart is written in, minus UT; it decides the weekday.
 * `day` is the day frame of the instant, when the caller already has it.
 */
export function gulikaLongitude(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, utcOffsetHours = 0, day?: DayFrame, method: 'end' | 'beginning' = 'end'): number {
  const f = day ?? dayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const { weekday, start, length } = dayPortion(f, jdUt, utcOffsetHours);
  const part = saturnPart(weekday, f.isDay) - (method === 'beginning' ? 1 : 0);
  const instant = start + (length * part) / 8;
  return lagnaLongitude(eph, instant, latitude, longitudeEast, frame.lagnaAyanamsha(instant), frame.fidelity);
}
