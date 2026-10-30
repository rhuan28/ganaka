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


/** The Gulikaadi group: each of the seven weekday lords' upagraha, in the weekday order. */
export const GULIKAADI = [
  { name: 'kaalavela', lord: 'sun' },
  { name: 'paridhi', lord: 'moon' },
  { name: 'mrityu', lord: 'mars' },
  { name: 'ardhaprahara', lord: 'mercury' },
  { name: 'yamakantaka', lord: 'jupiter' },
  { name: 'kodanda', lord: 'venus' },
  { name: 'gulika', lord: 'saturn' },
] as const;

export interface GulikaadiRow {
  name: (typeof GULIKAADI)[number]['name'];
  lord: (typeof GULIKAADI)[number]['lord'];
  /** Which eighth of the day or the night, 1 to 7 (the eighth has no lord). */
  part: number;
  /** When the part begins and ends, Julian days UT. */
  start: number;
  end: number;
  /** The Lagna at its beginning (Parashara's method) and at its end (Kalidasa's), sidereal longitudes. */
  beginning: number;
  ending: number;
}

/**
 * The Gulikaadi group as PL9 prints it (read in PL9): the day, or the night, in eight equal parts, the first ruled by
 * the lord of the weekday by day and by the lord of the fifth weekday from it by night, the others following the weekday
 * order; each lord's upagraha is the Lagna at the beginning and at the end of its part. Gulika is Saturn's.
 */
export function gulikaadi(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, utcOffsetHours = 0, day?: DayFrame): { isDay: boolean; weekday: number; rows: GulikaadiRow[] } {
  const f = day ?? dayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const { weekday, start, length } = dayPortion(f, jdUt, utcOffsetHours);
  const first = f.isDay ? weekday : (weekday + 4) % 7;
  const lagnaAt = (t: number) => lagnaLongitude(eph, t, latitude, longitudeEast, frame.lagnaAyanamsha(t), frame.fidelity);
  const rows = GULIKAADI.map((u, lord) => {
    const part = ((lord - first + 7) % 7) + 1;
    const a = start + (length * (part - 1)) / 8;
    const b = start + (length * part) / 8;
    return { ...u, part, start: a, end: b, beginning: lagnaAt(a), ending: lagnaAt(b) };
  });
  return { isDay: f.isDay, weekday, rows };
}
