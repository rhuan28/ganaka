import type { Planet9 } from '../../jaimini';
import { norm360 } from '../../zodiac';
import type { Planet7 } from '../dignity';
import type { ShadbalaInputs, ShadbalaOptions } from './types';

/** Kala Bala, the strength of time, and its parts. See docs/spec/strengths/shadbala.md. */

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const distance = (a: number, b: number) => { const d = norm360(a - b); return d > 180 ? 360 - d : d; };
const f = Math.fround;

/** The lords of the days of the week, Sunday first. */
const WEEKDAY: Planet7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
/** A weekday number brought to 1..7 (Sunday 1), PL9's way. */
const day7 = (n: number) => ((((n - 1) % 7) + 7) % 7) + 1;
/** The day PL9 counts its days from, in its local time, a Julian day. */
const EPOCH = 2380557.5;

/** Whether Mercury counts as a malefic: in the sign of the Sun, Mars, Saturn, Rahu or Ketu. */
export const mercuryWithMalefics = (longitudes: Record<Planet9, number>) =>
  (['sun', 'mars', 'saturn', 'rahu', 'ketu'] as Planet9[]).some((q) => signOf(longitudes[q]) === signOf(longitudes.mercury));

/** Apparent midnight: the middle of the day from sunrise to sunset, and half a day of the Sun's (1 + 1/365.25) after. */
const midnight = (sunrise: number, sunset: number) => (sunrise + sunset) / 2 + (1 + 1 / 365.25) / 2;

export function nathonnatha(p: Planet7, x: ShadbalaInputs): number {
  if (p === 'mercury') return 60;
  let d = (x.jdUt - midnight(x.sunrise, x.sunset)) * 360;
  if (d < 0) d += 360;
  const night = Math.abs(d - 180) / 3;
  return p === 'sun' || p === 'jupiter' || p === 'venus' ? 60 - night : night;
}

/** Paksha: the Moon's distance from the Sun, a third, for the benefics; the rest of 60 for the malefics. */
export function paksha(p: Planet7, longitudes: Record<Planet9, number>, mercury: ShadbalaOptions['mercuryPaksha']): number {
  const waxing = distance(longitudes.moon, longitudes.sun) / 3;
  const malefic = p === 'sun' || p === 'mars' || p === 'saturn' || (p === 'mercury' && mercury === 'withMalefics' && mercuryWithMalefics(longitudes));
  return malefic ? 60 - waxing : waxing;
}

/** Tribhaga: 60 for the lord of the third of the day (Mercury, Sun, Saturn) or of the night (Moon, Venus, Mars), and for Jupiter. */
export function tribhaga(p: Planet7, x: ShadbalaInputs): number {
  if (p === 'jupiter') return 60;
  const [from, length, lords] = x.night
    ? [x.sunset, x.sunrise + 1 - x.sunset, ['moon', 'venus', 'mars']]
    : [x.sunrise, x.sunset - x.sunrise, ['mercury', 'sun', 'saturn']];
  let gone = x.jdUt - from;
  if (gone < 0) gone += 1;
  return lords[Math.min(2, Math.floor((gone / length) * 3))] === p ? 60 : 0;
}

/**
 * The lords of the year, the month, the day and the hour, by PL9's count of days: whole days in its local time
 * from its epoch, one less when born at night before local noon; the year of 360 days, the month
 * of 30, each advancing the weekday by 3 and by 2; the hours of 60 minutes from sunrise.
 */
export function lords(x: ShadbalaInputs): { year: Planet7; month: Planet7; day: Planet7; hour: Planet7 } {
  const local = x.jdUt + x.longitudeEast / 360;
  const morning = local + 0.5 - Math.floor(local + 0.5) < 0.5;
  let days = Math.floor(local - EPOCH);
  if (x.night && morning) days -= 1;
  if (days < 0) days += 75600;
  const day = day7(days % 7);
  const hours = Math.trunc(f(24 * f(x.jdUt - x.sunrise)));
  return {
    year: WEEKDAY[day7(Math.floor(days / 360) * 3 + 1) - 1]!,
    month: WEEKDAY[day7(Math.floor(days / 30) * 2 + 1) - 1]!,
    day: WEEKDAY[day - 1]!,
    hour: WEEKDAY[day7(day + hours * 5) - 1]!,
  };
}

/** Ayana: the declination, from -23.45 to 23.45 degrees, onto 0 to 60; reversed for the Moon and Saturn, either way for Mercury. */
export function ayana(p: Planet7, declination: number): number {
  const d = p === 'mercury' ? Math.abs(declination) : p === 'moon' || p === 'saturn' ? -declination : declination;
  return ((d + 23.45) / 46.9) * 60;
}
