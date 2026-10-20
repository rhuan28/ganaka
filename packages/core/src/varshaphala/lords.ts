import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { SIGN_LORDS } from '../specialLagnas';
import type { Planet7 } from '../strengths/dignity';
import { norm360 } from '../zodiac';
import type { Varshaphala } from './annual';
import { panchavargeeyaBala } from './strengths';
import { ithasala, tajikaAspect, tajikaChart, type TajikaChart } from './tajika';

export interface Panchadhikaris { munthaPati: Planet7; natalLagnaPati: Planet7; annualLagnaPati: Planet7; trirashiPati: Planet7; dinaRatriPati: Planet7 }

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
/** The Trirashi Pati of each sign of the annual Lagna from Aries, by day and by night (read in PL9). */
const TRIRASHI: readonly [Planet7, Planet7][] = [
  ['sun', 'jupiter'], ['venus', 'moon'], ['saturn', 'mercury'], ['venus', 'mars'], ['jupiter', 'sun'], ['moon', 'venus'],
  ['mercury', 'saturn'], ['mars', 'venus'], ['saturn', 'saturn'], ['mars', 'mars'], ['jupiter', 'jupiter'], ['moon', 'moon'],
];

/**
 * The five office bearers (read in PL9): the lords of the Muntha, of the natal and of the annual Lagna, the Trirashi
 * Pati and the Dina-Ratri Pati (the lord of the Sun's sign by day, of the Moon's by night). Null without day or night.
 */
export function panchadhikaris(c: TajikaChart, natalLagnaSign: number, munthaSign: number): Panchadhikaris | null {
  if (c.isDay === null) return null;
  const lagna = signOf(c.lagna);
  return {
    munthaPati: SIGN_LORDS[munthaSign]!, natalLagnaPati: SIGN_LORDS[natalLagnaSign]!, annualLagnaPati: SIGN_LORDS[lagna]!,
    trirashiPati: TRIRASHI[lagna]![c.isDay ? 0 : 1], dinaRatriPati: SIGN_LORDS[signOf(c.isDay ? c.longitude.sun : c.longitude.moon)]!,
  };
}

const SEVEN: readonly Planet7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * PL9's choice of the year lord (read in PL9): of the office bearers other than the Moon whose signs aspect the annual
 * Lagna, the strongest (Panchavargeeya; the first in the order Sun to Saturn on a tie), if its strength is 5 or more,
 * else the Muntha Pati; when none aspects, the Muntha Pati. When the Moon is an office bearer and the only one to
 * aspect the Lagna, PL9 narrates the planets in Ithasala with it but keeps the Muntha Pati (140 of 140 such returns
 * in the printouts).
 */
export function yearLord(
  lords: Panchadhikaris, strength: Record<Planet7, number>, aspectsLagna: (p: Planet7) => boolean,
  moon?: { inIthasala: readonly Planet7[]; signLord: Planet7 },
): Planet7 {
  const offices: Planet7[] = Object.values(lords);
  let best: Planet7 | null = null;
  for (const p of SEVEN) {
    if (p === 'moon' || !offices.includes(p) || !aspectsLagna(p)) continue;
    if (best === null || strength[best] < strength[p]) best = p;
  }
  if (best !== null) return strength[best] >= 5 ? best : lords.munthaPati;
  // Correction 24: the branch PL9's text describes and its code never reaches. The Moon an office bearer, the only one
  // to aspect the Lagna, and stronger than every other: the strongest planet in Ithasala with it, else its sign's lord.
  if (moon && offices.includes('moon') && aspectsLagna('moon') && offices.every((p) => p === 'moon' || strength[p] < strength.moon)) {
    let chosen: Planet7 | null = null;
    for (const p of SEVEN) if (moon.inIthasala.includes(p) && (chosen === null || strength[chosen] < strength[p])) chosen = p;
    return chosen ?? moon.signLord;
  }
  return lords.munthaPati;
}

export interface VarshaphalaLords { panchadhikaris: Panchadhikaris; yearLord: Planet7 }

/** The office bearers and the year lord of an annual chart; null without a Lagna or day and night. */
export function varshaphalaLords(eph: Ephemeris, natal: ChartInput, v: Varshaphala, coreOptions?: Partial<CoreOptions>): VarshaphalaLords | null {
  const c = tajikaChart(v);
  const natalLagna = computePositions(eph, natal, coreOptions).points.lagna?.longitude;
  if (natalLagna === undefined || v.muntha === null) return null;
  const lords = panchadhikaris(c, signOf(natalLagna), v.muntha);
  if (!lords) return null;
  const pancha = panchavargeeyaBala(c);
  const strength = Object.fromEntries(SEVEN.map((p) => [p, pancha[p].total])) as Record<Planet7, number>;
  const lagnaSign = signOf(c.lagna);
  const moon = v.fidelity === 'corrected'
    ? { inIthasala: SEVEN.filter((p) => ithasala(c, 'moon', p)), signLord: SIGN_LORDS[signOf(c.longitude.moon)]! }
    : undefined;
  const lord = yearLord(lords, strength, (p) => tajikaAspect(signOf(c.longitude[p]), lagnaSign), moon);
  return { panchadhikaris: lords, yearLord: lord };
}
