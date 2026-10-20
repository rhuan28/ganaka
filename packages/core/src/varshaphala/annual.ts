import type { Ephemeris } from '@reverse/ephemeris';
import { computeChart, type Chart } from '../chart';
import type { Fidelity } from '../fidelity';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { SIDEREAL_YEAR, solarReturn, type SolarReturnMode } from './solarReturn';

export interface VarshaphalaOptions extends Partial<CoreOptions> {
  solarReturn?: SolarReturnMode;
  /** Where the annual chart is cast; the birth place by default (PL9's Varshaphala; its "(L)" pages use the event's). */
  place?: { latitude: number; longitudeEast: number };
  /** The return instant to use instead of searching it (Julian day UT), as when checking a printed one. */
  returnJdUt?: number;
}

export interface Varshaphala {
  years: number;
  /** The return, Julian day UT. */
  jdUt: number;
  place: { latitude: number; longitudeEast: number };
  /** The annual chart. */
  chart: Chart;
  /** The Muntha's sign, 0 = Aries; null where the natal Lagna is not defined. */
  muntha: number | null;
  /** The natal Lagna moved 30 degrees for each mean sidereal year from the birth to the return (from the printouts). */
  munthaLongitude: number | null;
  /** The Sun above the horizon at the return (PL9: the Sun more than 180 degrees past the Lagna); null without a Lagna. */
  isDayChart: boolean | null;
  missing: { what: string; reason: string }[];
  fidelity: Fidelity;
}

/** The annual chart of a year of age and what PL9 reads from it first (docs/spec/time/varshaphala.md). */
export function computeVarshaphala(eph: Ephemeris, natal: ChartInput, years: number, options: VarshaphalaOptions = {}): Varshaphala {
  const { solarReturn: mode = 'true', place: at, returnJdUt, ...coreOptions } = options;
  const core = resolveOptions(coreOptions);
  const jdUt = returnJdUt ?? solarReturn(eph, natal, years, mode, coreOptions);
  const place = at ?? { latitude: natal.latitude, longitudeEast: natal.longitudeEast };
  const chart = computeChart(eph, { ...natal, jdUt, ...place }, coreOptions);
  const natalLagna = computePositions(eph, natal, coreOptions).points.lagna?.longitude;
  const missing: { what: string; reason: string }[] = chart.missing.map((m) => ({ what: m.what, reason: m.reason }));
  const munthaLongitude = natalLagna === undefined ? null : (((natalLagna + (30 * (jdUt - natal.jdUt)) / SIDEREAL_YEAR) % 360) + 360) % 360;
  if (munthaLongitude === null) missing.push({ what: 'muntha', reason: 'natal Lagna not defined' });
  const lagna = chart.points.lagna?.longitude;
  const isDayChart = lagna === undefined ? null : (((chart.points.sun.longitude - lagna) % 360) + 360) % 360 > 180;
  return { years, jdUt, place, chart, muntha: munthaLongitude === null ? null : Math.floor(munthaLongitude / 30), munthaLongitude, isDayChart, missing, fidelity: core.fidelity };
}
