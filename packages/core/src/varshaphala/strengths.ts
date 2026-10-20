import { dignity9, type Planet7 } from '../strengths/dignity';
import { SIGN_LORDS } from '../specialLagnas';
import { norm360 } from '../zodiac';
import { tajikaRelation, type TajikaChart } from './tajika';

const SEVEN: readonly Planet7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const degreeOf = (longitude: number) => norm360(longitude) % 30;

/** The Tajika terms (hudda) of each sign from Aries: [extent in degrees, lord], five to a sign (read in PL9). */
const HUDDA: readonly (readonly [number, Planet7][])[] = [
  [[6, 'jupiter'], [6, 'venus'], [8, 'mercury'], [5, 'mars'], [5, 'saturn']],
  [[8, 'venus'], [6, 'mercury'], [8, 'jupiter'], [5, 'saturn'], [3, 'mars']],
  [[6, 'mercury'], [6, 'venus'], [5, 'jupiter'], [7, 'mars'], [6, 'saturn']],
  [[7, 'mars'], [6, 'venus'], [6, 'mercury'], [7, 'jupiter'], [4, 'saturn']],
  [[6, 'jupiter'], [5, 'venus'], [7, 'saturn'], [6, 'mercury'], [6, 'mars']],
  [[7, 'mercury'], [10, 'venus'], [4, 'jupiter'], [7, 'mars'], [2, 'saturn']],
  [[6, 'saturn'], [8, 'mercury'], [7, 'jupiter'], [7, 'venus'], [2, 'mars']],
  [[7, 'mars'], [4, 'venus'], [8, 'mercury'], [5, 'jupiter'], [6, 'saturn']],
  [[12, 'jupiter'], [5, 'venus'], [4, 'mercury'], [5, 'mars'], [4, 'saturn']],
  [[7, 'mercury'], [7, 'jupiter'], [8, 'venus'], [4, 'saturn'], [4, 'mars']],
  [[7, 'venus'], [6, 'mercury'], [7, 'jupiter'], [5, 'mars'], [5, 'saturn']],
  [[12, 'venus'], [4, 'jupiter'], [3, 'mercury'], [9, 'mars'], [2, 'saturn']],
];
/** The points of debility the Uchcha bala counts from (read in PL9). */
const DEBILITY: Record<Planet7, number> = { sun: 190, moon: 213, mars: 118, mercury: 345, jupiter: 275, venus: 177, saturn: 20 };

/** The lord of the term a degree of a sign falls in: a degree on the end of a term belongs to that term (read in PL9). */
function huddaLord(sign: number, degree: number): Planet7 {
  const terms = HUDDA[sign]!;
  let k = 0, end = 0;
  while (true) {
    if (degree <= end) { if (k === 0) k = 1; break; }
    k++;
    end += terms[k - 1]![0];
    if (end >= 30) break;
  }
  return terms[k - 1]![1];
}

/** The lord of the drekkana: the planets in the order of the weekdays, five on for each drekkana (read in PL9). */
function drekkanaLord(sign: number, degree: number): Planet7 {
  return SEVEN[(Math.floor(degree / 10) * 5 + 2 + sign) % 7]!;
}

export interface PanchavargeeyaBala { graha: number; uchcha: number; hudda: number; drekkana: number; navamsha: number; total: number }
export interface HarshaBala { first: number; second: number; third: number; fourth: number; total: number }

/**
 * The five Tajika strengths of each planet and their quarter sum (read in PL9). Each but the Uchcha weighs the lord
 * of the division the planet is in: the planet itself, or a friend, neutral or enemy by the Tajika relation of their
 * signs. Graha 30/22.5/15/7.5, Hudda 15/11.25/7.5/3.75, Drekkana 10/7.5/5/2.5, Navamsha 5/3.75/2.5/1.25; the Uchcha
 * is the planet's distance from its point of debility over 9.
 */
export function panchavargeeyaBala(c: TajikaChart): Record<Planet7, PanchavargeeyaBala> {
  const weigh = (planet: Planet7, lord: Planet7, table: readonly [number, number, number, number]) => {
    if (lord === planet) return table[0];
    const r = tajikaRelation(signOf(c.longitude[planet]), signOf(c.longitude[lord]));
    return r === 1 ? table[1] : r === 0 ? table[2] : table[3];
  };
  const out = {} as Record<Planet7, PanchavargeeyaBala>;
  for (const p of SEVEN) {
    const lon = norm360(c.longitude[p]), sign = signOf(lon), degree = degreeOf(lon);
    const graha = weigh(p, SIGN_LORDS[sign]!, [30, 22.5, 15, 7.5]);
    let d = Math.abs(lon - DEBILITY[p]);
    if (d > 180) d = 360 - d;
    const uchcha = d / 9;
    const hudda = weigh(p, huddaLord(sign, degree), [15, 11.25, 7.5, 3.75]);
    const drekkana = weigh(p, drekkanaLord(sign, degree), [10, 7.5, 5, 2.5]);
    const navamsha = weigh(p, SIGN_LORDS[Math.floor(lon / (10 / 3)) % 12]!, [5, 3.75, 2.5, 1.25]);
    out[p] = { graha, uchcha, hudda, drekkana, navamsha, total: (graha + uchcha + hudda + drekkana + navamsha) * 0.25 };
  }
  return out;
}

/** The houses that give each planet the first Harsha strength, and the female planets (read in PL9). */
const HARSHA_HOUSE: Record<Planet7, number> = { sun: 9, moon: 3, mars: 6, mercury: 1, jupiter: 11, venus: 5, saturn: 12 };
const FEMALE: readonly Planet7[] = ['moon', 'mercury', 'venus', 'saturn'];

/**
 * The four Harsha strengths, 5 each (read in PL9): the planet in its own Harsha house; exalted, in moolatrikona or in
 * its own sign; a female planet in the 1st to 3rd or 7th to 9th house, or a male one in the others; a female planet in
 * a night chart, or a male one in a day chart. Null without a Lagna (no houses, no day or night).
 */
export function harshaBala(c: TajikaChart): Record<Planet7, HarshaBala> | null {
  if (c.isDay === null) return null;
  const out = {} as Record<Planet7, HarshaBala>;
  for (const p of SEVEN) {
    const house = c.house[p];
    const female = FEMALE.includes(p);
    const first = house === HARSHA_HOUSE[p] ? 5 : 0;
    const second = dignity9(p, c.longitude) < 4 ? 5 : 0;
    const third = house !== undefined && [1, 2, 3, 7, 8, 9].includes(house) === female ? 5 : 0;
    const fourth = c.isDay === null ? 0 : c.isDay !== female ? 5 : 0;
    out[p] = { first, second, third, fourth, total: first + second + third + fourth };
  }
  return out;
}
