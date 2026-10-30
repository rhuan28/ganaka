import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from '../ayanamsha';
import { lagnaLongitude } from '../lagna';
import { resolveOptions, type CoreOptions } from '../options';
import { planetLongitude } from '../planets';
import { computePositions, type ChartInput } from '../positions';
import { signOf } from '../zodiac';
import { newMoon } from './calendar';

/** Where in the day a birth falls, as PL9's astronomical details say it. */
export type DayPart = 'sunriseToMidday' | 'middayToSunset' | 'sunsetToMidnight' | 'midnightToSunrise';

export interface TamilDate {
  /** 0 = Prabhava … 59, the sixty-year cycle. */
  year: number;
  /** 0 = Chithirai (the Sun in Aries) … 11 = Panguni. */
  month: number;
  /** The civil weekday of the clock date, 0 = Sunday. */
  weekday: number;
  /** The day of the solar month, 1-based. */
  date: number;
}

export interface BirthAstronomy {
  /** Whole days from midnight starting 24 August 1805 on the chart's clock, a day less for a night birth before noon. */
  ahargana: number;
  /** Days from 1 January 1900 00:00 UT, with PL9's fixed addition. */
  daysSince1900: number | null;
  /** The middle of the birth's day (sunrise to sunset) and the midnight after it, Julian days UT. */
  midday: number;
  midnight: number;
  /** When the Moon entered its sidereal sign before the birth and leaves it after. */
  moonSignEntry: number;
  moonSignExit: number;
  lastNewMoon: number;
  nextNewMoon: number;
  /** When the Lagna meets the Moon's longitude (rise) and its opposite (set), from the birth's sunrise. */
  moonrise: number;
  moonset: number;
  /** The planetary hour from the sunrise, 1-based (not capped at 24), and its lord. */
  hora: number;
  horaLord: 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';
  dayPart: DayPart;
  /** The Sun's tropical sign, 0 = Aries. */
  westernSign: number;
  tamil: TamilDate;
}

const SEVEN = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
const norm = (x: number) => ((x % 360) + 360) % 360;
const wrap = (x: number) => {
  const n = norm(x);
  return n > 180 ? n - 360 : n;
};
/** PL9's fixed additions (read in PL9): the 1900 count's, and midnight's distance from midday. */
const SINCE_1900_ADD = 0.2111111111111111;
const MIDDAY_TO_MIDNIGHT = 0.5013689628737269;
/** The Tamil reference: India's clock, and the hour of the day after which a sankranti starts the month the next day. */
const IST = 5.5;
const TAMIL_CUTOFF_HOURS = 13;

/**
 * The astronomical details PL9 prints for a birth (read in PL9): the day counts, the Moon's sign ingresses, the new
 * Moons, the Moon's rise and set, the planetary hour and the part of the day. The Tamil date is ours: PL9 reads it from a
 * table; here the solar month starts on the Indian civil day of the Sun's sidereal ingress, the next day when the
 * ingress is after 13:00. `sunrise` and `sunset` are the panchanga's for the birth.
 */
export function birthAstronomy(eph: Ephemeris, natal: ChartInput, sunrise: number, sunset: number, vara: number, coreOptions?: Partial<CoreOptions>): BirthAstronomy {
  const core = resolveOptions(coreOptions);
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const birth = computePositions(eph, natal, coreOptions);
  // The searches read only the Sun or the Moon: one body at a time, not the whole chart, keeps the route fast.
  const moonAt = (jd: number) => planetLongitude(eph, jd, 'moon', frame.sunAyanamsha(jd), core.fidelity).longitude;
  const sunAt = (jd: number) => planetLongitude(eph, jd, 'sun', frame.sunAyanamsha(jd), core.fidelity).longitude;
  const lagna = (jd: number) => lagnaLongitude(eph, jd, natal.latitude, natal.longitudeEast, frame.lagnaAyanamsha(jd), core.fidelity);

  // Night by PL9's test: the Sun below the horizon by the Lagna.
  const lagnaNow = birth.points.lagna?.longitude ?? lagna(natal.jdUt);
  const night = norm(birth.points.sun.longitude - lagnaNow) > 0 && norm(birth.points.sun.longitude - lagnaNow) < 180;
  const clock = natal.jdUt + (natal.utcOffsetHours ?? 0) / 24;
  let ahargana = Math.floor(clock - 2380557.5) - (night && clock - Math.floor(clock) >= 0.5 ? 1 : 0);
  while (ahargana < 0) ahargana += 75600;

  const midday = (sunrise + sunset) / 2;
  const midnight = midday + MIDDAY_TO_MIDNIGHT;

  // The Moon's sign ingresses: the crossings of the 30° marks before and after the birth.
  const cross = (target: number, a: number, b: number) => {
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      if (wrap(moonAt(m) - target) < 0) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  const k = Math.floor(birth.points.moon.longitude / 30);
  const moonSignEntry = cross(k * 30, natal.jdUt - 3, natal.jdUt);
  const moonSignExit = cross(norm((k + 1) * 30), natal.jdUt, natal.jdUt + 3);

  // The Moon's rise and set: five fixed steps of the Lagna's pace, from a guess off the birth's sunrise (read in PL9).
  const pace = (f: (jd: number) => number, jd: number) => wrap(f(jd + 1e-4) - f(jd - 1e-4)) / 2e-4;
  const opposite = (jd: number) => norm(lagna(jd) + 180);
  let moonrise = sunrise + norm(birth.points.moon.longitude - birth.points.sun.longitude) / 360;
  let moonset = moonrise >= sunset ? moonrise - 0.5 : moonrise + 0.5;
  for (let i = 0; i < 5; i++) {
    moonrise += wrap(moonAt(moonrise) - lagna(moonrise)) / pace(lagna, moonrise);
    moonset += wrap(moonAt(moonset) - opposite(moonset)) / pace(opposite, moonset);
  }

  // The new Moon before the birth as PL9 finds it (read in PL9): a guess from the elongation and a mean lunation, then
  // six fixed steps of the signed elongation over 360 of 29.5 days, without a test of convergence.
  const elongation = (jd: number) => wrap(moonAt(jd) - sunAt(jd));
  let lastNewMoon = natal.jdUt - (norm(birth.points.moon.longitude - birth.points.sun.longitude) / 360) * 29.530588;
  for (let i = 0; i < 6; i++) lastNewMoon -= (elongation(lastNewMoon) / 360) * 29.5;

  const hora = Math.floor(24 * (natal.jdUt - sunrise)) + 1;
  const d = vara + 1;
  const horaLord = SEVEN[((((d + 5 * hora - 5) % 7) + 7) % 7 || 7) - 1]!;
  const dayPart: DayPart = night ? (natal.jdUt < midnight ? 'sunsetToMidnight' : 'midnightToSunrise') : natal.jdUt > midday ? 'middayToSunset' : 'sunriseToMidday';

  return {
    ahargana,
    daysSince1900: natal.jdUt > 2415020.5 ? natal.jdUt - 2415020.5 + SINCE_1900_ADD : null,
    midday,
    midnight,
    moonSignEntry,
    moonSignExit,
    lastNewMoon,
    nextNewMoon: newMoon(eph, lastNewMoon + 1, 1, coreOptions),
    moonrise,
    moonset,
    hora,
    horaLord,
    dayPart,
    westernSign: signOf(norm(birth.points.sun.longitude + birth.ayanamshaDegrees)),
    tamil: tamilDate(clock, sunAt),
  };
}

/** Julian day of midnight starting a civil day, from a Julian day on that day's clock. */
const civilDay = (jd: number) => Math.floor(jd + 0.5) - 0.5;

/**
 * The Tamil solar date of a civil day (`clock`, a Julian day on the chart's clock): the month is the Sun's sidereal sign
 * at its last ingress, which starts the month on the Indian civil day it happens, or the next one when it happens after
 * 13:00 there; the year of the sixty starts at Chithirai, Prabhava in 1987.
 */
export function tamilDate(clock: number, sunAt: (jdUt: number) => number): TamilDate {
  const day = civilDay(clock);
  const ingress = (sign: number, before: number) => {
    let a = before - 33, b = before;
    for (let i = 0; i < 50; i++) {
      const m = (a + b) / 2;
      if (wrap(sunAt(m) - sign * 30) < 0) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  /** The civil day an ingress starts its month on, as a midnight Julian day on the chart's civil reckoning. */
  const startDay = (jd: number) => {
    const ist = jd + IST / 24;
    const istDay = civilDay(ist);
    return istDay + ((ist - istDay) * 24 >= TAMIL_CUTOFF_HOURS ? 1 : 0);
  };
  // The Sun's sign at the end of the day, then back one sign if its ingress starts the month only after this day.
  let sign = signOf(sunAt(day + 1 - IST / 24));
  let start = startDay(ingress(sign, day + 1 - IST / 24));
  if (start > day) {
    sign = (sign + 11) % 12;
    start = startDay(ingress(sign, start - 1));
  }
  const civil = new Date((day + 0.5 - 2440587.5) * 86_400_000);
  const civilYear = civil.getUTCFullYear();
  // Thai to Panguni (Capricorn to Pisces) fall from January: they belong to the year that began the April before.
  const year = ((((sign >= 9 ? civilYear - 1 : civilYear) - 1987) % 60) + 60) % 60;
  return { year, month: sign, weekday: civil.getUTCDay(), date: Math.round(day - start) + 1 };
}
