import { norm360 } from '../zodiac';
import type { Planet7 } from './dignity';
import { aspectsOn, withDefaults, type Shadbala, type ShadbalaInputs, type ShadbalaOptions } from './shadbala/index';

/**
 * The Bhava Bala as PL9 computes it: for each house, the Shadbala of its lord, its Dig Bala, the aspects on it, the
 * planets in it and the strength of its sign by day or night. See docs/spec/strengths/bhava-bala.md.
 */

export interface BhavaRow {
  /** The sign of the house, Aries 0. */
  sign: number;
  /** The whole degree of the house within its sign, as the report gives it. */
  degree: number;
  lord: number; dig: number; drishti: number; occupants: number; dayNight: number;
  /** The five parts added, in virupas, and in rupas. */
  total: number; rupas: number;
}

export interface BhavaBala {
  /** House 1 first. */
  houses: BhavaRow[];
}

/** The lord of each sign, Aries first: Mars for Scorpio, Saturn for Aquarius. */
const LORD: Planet7[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
/** The planets in a house: Mercury and Jupiter add a rupa, the Sun, Mars and Saturn take one. */
const OCCUPANT: Partial<Record<Planet7, number>> = { sun: -60, mars: -60, saturn: -60, mercury: 60, jupiter: 60 };
/** Signs (1 Aries … 12 Pisces) strong by day and by night; Pisces only in the twilight. */
const DAY_SIGNS = [3, 5, 6, 7, 8, 11];
const NIGHT_SIGNS = [1, 2, 4, 9, 10];
/** The twilight after sunrise and after sunset, in days. */
const TWILIGHT = 0.05;

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const fold = (a: number) => { const d = norm360(a); return d > 180 ? 360 - d : d; };

/**
 * The house whose point is weakest for the kind of a sign, PL9's way: human signs (Gemini, Virgo, Libra, Aquarius, the
 * first half of Sagittarius) the 7th; watery (Pisces, the second half of Capricorn) the 10th; quadrupeds (Aries,
 * Taurus, Leo, the second half of Sagittarius, the first half of Capricorn) the 4th; insects (Cancer, Scorpio) the 1st.
 * At exactly 15 degrees of Sagittarius or Capricorn none applies (PL9 reads a value left unset); the core gives no Dig.
 */
function weakHouse(sign: number, degree: number): number | undefined {
  let house: number | undefined;
  if ([3, 6, 7, 11].includes(sign) || (sign === 9 && degree < 15)) house = 7;
  if (sign === 12 || (sign === 10 && degree > 15)) house = 10;
  if ([1, 2, 5].includes(sign) || (sign === 9 && degree > 15) || (sign === 10 && degree < 15)) house = 4;
  if (sign === 8 || sign === 4) house = 1;
  return house;
}

export function bhavaBala(x: ShadbalaInputs, sb: Shadbala, options: Partial<ShadbalaOptions> = {}): BhavaBala {
  const o = withDefaults(options);
  // Equal houses from the Lagna; the planets placed in them by sign.
  const point = (house: number) => norm360(x.lagna + 30 * (house - 1));
  const houseOf = (longitude: number) => ((signOf(longitude) - signOf(x.lagna) + 12) % 12) + 1;
  const twilight = x.jdUt - x.sunrise < TWILIGHT || (x.sunset < x.jdUt && x.jdUt - x.sunset < TWILIGHT);
  const houses: BhavaRow[] = [];
  for (let house = 1; house <= 12; house++) {
    const longitude = point(house);
    const sign = signOf(longitude) + 1;
    const degree = norm360(longitude) % 30;
    const lord = sb.planets[LORD[sign - 1]!].total;
    const weak = weakHouse(sign, degree);
    const dig = weak === undefined ? 0 : fold(longitude - point(weak)) / 3;
    const drishti = aspectsOn(longitude, x, o);
    let occupants = 0;
    for (const [p, v] of Object.entries(OCCUPANT) as [Planet7, number][]) if (houseOf(x.longitudes[p]) === house) occupants += v;
    const dayNight = (twilight ? sign === 12 : (x.night ? NIGHT_SIGNS : DAY_SIGNS).includes(sign)) ? 15 : 0;
    const total = lord + dig + drishti + occupants + dayNight;
    houses.push({ sign: sign - 1, degree: Math.floor(degree), lord, dig, drishti, occupants, dayNight, total, rupas: total / 60 });
  }
  return { houses };
}
