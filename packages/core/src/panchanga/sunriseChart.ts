import type { Ephemeris } from '@reverse/ephemeris';
import { computeChart, type Chart } from '../chart';
import type { CoreOptions } from '../options';
import type { ChartInput } from '../positions';
import { computeBirthPanchanga } from './compute';

/**
 * PL9's "Sunrise chart": the chart at the sunrise that begins the birth's day (the panchanga's), at the birth place;
 * from the printouts, to the minute in the 135 reference charts. Null where that day has no sunrise. See
 * docs/spec/time/panchanga.md.
 */
export function computeSunriseChart(eph: Ephemeris, natal: ChartInput, coreOptions?: Partial<CoreOptions>): { jdUt: number; chart: Chart } | null {
  const sunrise = computeBirthPanchanga(eph, natal, coreOptions).sunrise;
  if (sunrise === null) return null;
  return { jdUt: sunrise, chart: computeChart(eph, { ...natal, jdUt: sunrise }, coreOptions) };
}
