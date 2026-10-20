import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';

export type SolarReturnMode = 'true' | 'mean';

/** The mean sidereal year PL9 counts ages in, days. */
export const SIDEREAL_YEAR = 365.25636342592594;
const MEAN_MONTH = 30.4380302855;
const MEAN_DAY = 1.0146010095166667;

/** Whole mean sidereal years from the birth to a date: the year of age PL9 shows (read in PL9); 0 before the birth. */
export function completedYears(natalJdUt: number, dateJdUt: number): number {
  return Math.max(0, Math.floor((dateJdUt - natalJdUt) / SIDEREAL_YEAR));
}

/**
 * The years, months and days of age at a date, as the worksheets of the monthly and daily returns show them: the whole
 * mean sidereal years, then the whole twelfths and 360ths of such a year in the rest; 0 before the birth. From the
 * printouts (the 270 worksheets of the print's clock, the instant in UT).
 */
export function ageAt(natalJdUt: number, dateJdUt: number): { years: number; months: number; days: number } {
  const years = completedYears(natalJdUt, dateJdUt);
  const rest = Math.max(0, dateJdUt - natalJdUt - years * SIDEREAL_YEAR);
  const months = Math.min(11, Math.floor(rest / MEAN_MONTH));
  return { years, months, days: Math.min(29, Math.floor((rest - months * MEAN_MONTH) / MEAN_DAY)) };
}

/**
 * The instant the Sun returns to its natal longitude plus 30 degrees a month and a degree a day, as PL9 finds it
 * (read in PL9): from the birth plus 365.2422 days for each year (the fraction counting months as twelfths and days as
 * 360ths), computed in single precision, three steps of a day for each degree the Sun is off, with no test of how close
 * they came. In the 'mean' mode: the birth plus 365.25636 days a year, 30.43803 a month and 1.01460 a day. Year 0 is
 * the birth.
 */
function annualReturn(eph: Ephemeris, natal: ChartInput, years: number, months: number, days: number, mode: SolarReturnMode, coreOptions?: Partial<CoreOptions>): number {
  // Year 0 is the birth itself (from the printouts: the reports of age 0 show the birth to the second).
  if (years === 0 && months === 0 && days === 0) return natal.jdUt;
  if (mode === 'mean') return natal.jdUt + years * SIDEREAL_YEAR + months * MEAN_MONTH + days * MEAN_DAY;
  const sun = (jd: number) => computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, coreOptions).points.sun.longitude;
  const target = sun(natal.jdUt) + 30 * months + days;
  let t = Math.fround(365.2422) * Math.fround(years + months / 12 + days / 360) + Math.fround(natal.jdUt);
  for (let i = 0; i < 3; i++) {
    let s = sun(t);
    if (s > target + 180) s -= 360;
    if (s < target - 180) s += 360;
    t -= s - target;
  }
  return t;
}

export function solarReturn(eph: Ephemeris, natal: ChartInput, years: number, mode: SolarReturnMode = 'true', coreOptions?: Partial<CoreOptions>): number {
  return annualReturn(eph, natal, years, 0, 0, mode, coreOptions);
}

export function monthlyReturn(eph: Ephemeris, natal: ChartInput, years: number, months: number, mode: SolarReturnMode = 'true', coreOptions?: Partial<CoreOptions>): number {
  return annualReturn(eph, natal, years, months, 0, mode, coreOptions);
}

export function dailyReturn(eph: Ephemeris, natal: ChartInput, years: number, months: number, days: number, mode: SolarReturnMode = 'true', coreOptions?: Partial<CoreOptions>): number {
  return annualReturn(eph, natal, years, months, days, mode, coreOptions);
}
