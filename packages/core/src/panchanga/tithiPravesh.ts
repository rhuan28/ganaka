import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { norm360 } from '../zodiac';

const signed = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);

/**
 * PL9's Tithi Pravesh for the year of age that holds a date: the whole mean sidereal years (365.25636 days) from the
 * birth to the date; from the birth plus that many years of 365.2422 days, the Sun taken to the start of its natal
 * sign, then three straight-line steps forwards to the Moon's natal angle from the Sun (read in PL9). A date before the
 * birth counts as age 0, which can give a moment before the birth (from the printouts).
 */
export function tithiPravesh(eph: Ephemeris, natal: ChartInput, dateJdUt: number, coreOptions?: Partial<CoreOptions>): number {
  // A date before the birth counts as age 0 (from the printouts).
  const years = Math.max(0, Math.floor((dateJdUt - natal.jdUt) / 365.25636));
  const at = (jd: number) => computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  const birth = at(natal.jdUt);
  const angle = norm360(birth.moon.longitude - birth.sun.longitude);
  const signStart = Math.floor(birth.sun.longitude / 30) * 30;
  let t = natal.jdUt + years * 365.2422;
  for (let i = 0; i < 3; i++) {
    const p = at(t);
    t += signed(signStart - p.sun.longitude) / p.sun.longitudeSpeed!;
  }
  for (let i = 0; i < 3; i++) {
    const p = at(t);
    const d = norm360(angle - norm360(p.moon.longitude - p.sun.longitude));
    // The first step goes forwards to the next return; the later ones correct either way.
    t += (i === 0 ? d : signed(d)) / (p.moon.longitudeSpeed! - p.sun.longitudeSpeed!);
  }
  return t;
}
