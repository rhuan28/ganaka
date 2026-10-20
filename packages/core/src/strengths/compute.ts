import type { Ephemeris } from '@reverse/ephemeris';
import { InvalidOptionError } from '../errors';
import type { Fidelity } from '../fidelity';
import { LagnaUndefinedError } from '../lagna';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { ayanamshaFrame } from '../ayanamsha';
import { houseCusps, midheavenLongitude } from '../houses';
import { ephemerisInstant } from '../planets';
import { norm360 } from '../zodiac';
import { SEVEN } from './dignity';
import { cheshta, inCheshtaSeries, type CheshtaPlanet } from './shadbala/cheshta';
import { shadbalaDay } from './shadbala/day';
import { bhavaBala, type BhavaBala } from './bhavaBala';
import { NINE, vimshopaka, type Vimshopaka } from './vimshopaka';
import { shadbala, withDefaults, type Shadbala, type ShadbalaInputs, type ShadbalaOptions } from './shadbala/index';
import { AV_PLANETS, DEFAULT_ASHTAKAVARGA_OPTIONS, ashtakavarga, type Ashtakavarga, type AshtakavargaOptions, type AvSigns } from './ashtakavarga';

const AV_OPTION_VALUES: Record<keyof AshtakavargaOptions, readonly unknown[]> = {
  method: ['varahamihira', 'parashara'], ekadhipatya: ['parashara', 'other'], virgoMultiplier: [6, 5],
};

/** The Ashtakavarga of a chart, with the options it was computed with. See docs/spec/forcas/ashtakavarga.md. */
export function computeAshtakavarga(eph: Ephemeris, input: ChartInput, options: Partial<AshtakavargaOptions> = {}, coreOptions?: Partial<CoreOptions>): Ashtakavarga & { options: AshtakavargaOptions; fidelity: Fidelity } {
  for (const [k, v] of Object.entries(options)) {
    if (!Object.hasOwn(AV_OPTION_VALUES, k)) throw new InvalidOptionError(k, 'unknown option');
    const allowed = AV_OPTION_VALUES[k as keyof AshtakavargaOptions];
    if (v !== undefined && !allowed.includes(v)) throw new InvalidOptionError(k, `must be ${allowed.join(' or ')}`);
  }
  const o: AshtakavargaOptions = { ...DEFAULT_ASHTAKAVARGA_OPTIONS, ...Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined)) };
  const fidelity = resolveOptions(coreOptions).fidelity;
  const positions = computePositions(eph, input, coreOptions);
  const lagna = positions.points.lagna;
  if (!lagna) throw new LagnaUndefinedError(input.latitude);
  const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
  const signs = { ...Object.fromEntries(AV_PLANETS.map((p) => [p, signOf(positions.points[p].longitude)])), lagna: signOf(lagna.longitude) } as AvSigns;
  return { ...ashtakavarga(signs, o, fidelity), options: o, fidelity };
}

const SB_OPTION_VALUES: Record<keyof ShadbalaOptions, readonly unknown[]> = {
  drekkana: ['parashara', 'horaRatnam'], digBala: ['cusps', 'kendras'], mercuryPaksha: ['withMalefics', 'benefic'],
  mercuryDrik: ['withMalefics', 'benefic'], jupiterMercuryDrik: ['full', 'quarter'],
};
const MOVERS: CheshtaPlanet[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** The options of the Shadbala checked, with the defaults filled in. */
function shadbalaOptions(options: Partial<ShadbalaOptions>): ShadbalaOptions {
  for (const [k, v] of Object.entries(options)) {
    if (!Object.hasOwn(SB_OPTION_VALUES, k)) throw new InvalidOptionError(k, 'unknown option');
    const allowed = SB_OPTION_VALUES[k as keyof ShadbalaOptions];
    if (v !== undefined && !allowed.includes(v)) throw new InvalidOptionError(k, `must be ${allowed.join(' or ')}`);
  }
  return withDefaults(options);
}

/**
 * The Shadbala of a chart, with the options it was computed with. `cheshtaOutsideSeries` names the planets whose
 * birth falls outside PL9's series of cycles: their Cheshta, and the totals and ranks that take it, are not PL9's.
 * See docs/spec/forcas/shadbala.md.
 */
export function computeShadbala(eph: Ephemeris, input: ChartInput, options: Partial<ShadbalaOptions> = {}, coreOptions?: Partial<CoreOptions>): Shadbala & { options: ShadbalaOptions; fidelity: Fidelity; cheshtaOutsideSeries: CheshtaPlanet[] } {
  const o = shadbalaOptions(options);
  const core = resolveOptions(coreOptions);
  const cheshtaOutsideSeries = MOVERS.filter((p) => !inCheshtaSeries(p, input.jdUt, core.fidelity));
  return { ...shadbala(shadbalaInputs(eph, input, core), o), options: o, fidelity: core.fidelity, cheshtaOutsideSeries };
}

/** The Bhava Bala of a chart, with the options of the Shadbala it was computed with. See docs/spec/forcas/bhava-bala.md. */
export function computeBhavaBala(eph: Ephemeris, input: ChartInput, options: Partial<ShadbalaOptions> = {}, coreOptions?: Partial<CoreOptions>): BhavaBala & { options: ShadbalaOptions; fidelity: Fidelity; cheshtaOutsideSeries: CheshtaPlanet[] } {
  const o = shadbalaOptions(options);
  const core = resolveOptions(coreOptions);
  const x = shadbalaInputs(eph, input, core);
  // The lords take the Shadbala, and so its Cheshta: the planets outside PL9's series are named as there.
  const cheshtaOutsideSeries = MOVERS.filter((p) => !inCheshtaSeries(p, input.jdUt, core.fidelity));
  return { ...bhavaBala(x, shadbala(x, o), o), options: o, fidelity: core.fidelity, cheshtaOutsideSeries };
}

/** What the Shadbala of a chart is computed from: its positions, PL9's day, the declinations and the Cheshta. */
export function shadbalaInputs(eph: Ephemeris, input: ChartInput, coreOptions?: Partial<CoreOptions>): ShadbalaInputs {
  const core = resolveOptions(coreOptions);
  const positions = computePositions(eph, input, core);
  const lagna = positions.points.lagna;
  if (!lagna) throw new LagnaUndefinedError(input.latitude);
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const midheaven = midheavenLongitude(eph, input.jdUt, input.longitudeEast, frame.lagnaAyanamsha(input.jdUt), core.fidelity);
  const day = shadbalaDay(eph, input.jdUt, input.latitude, input.longitudeEast, frame, positions.points.sun.longitude);
  const tropical = (p: (typeof SEVEN)[number]) => eph.tropical(ephemerisInstant(eph, input.jdUt, core.fidelity), p).longitude;
  // PL9's declination: the greatest, 23.45 degrees, times the sine of the tropical longitude (the latitude left out).
  const declinations = Object.fromEntries(SEVEN.map((p) => [p, 23.45 * Math.sin((tropical(p) * Math.PI) / 180)])) as Record<(typeof SEVEN)[number], number>;
  const grahas = [...SEVEN, 'rahu', 'ketu'] as const;
  const longitudes = Object.fromEntries(grahas.map((p) => [p, positions.points[p].longitude])) as Record<(typeof grahas)[number], number>;
  return {
    jdUt: input.jdUt, longitudeEast: input.longitudeEast, lagna: lagna.longitude, longitudes, fidelity: core.fidelity,
    cusps: houseCusps(lagna.longitude, midheaven, 'sripati').middles, declinations,
    latitudes: Object.fromEntries(MOVERS.map((p) => [p, eph.tropical(ephemerisInstant(eph, input.jdUt, core.fidelity), p).latitude])),
    sunrise: day.sunrise, sunset: day.sunset, night: day.night, sunTropical: tropical('sun'),
    cheshta: Object.fromEntries(MOVERS.map((p) => [p, cheshta(eph, p, input.jdUt, (jd) => frame.sunAyanamsha(jd), core.fidelity)])),
  };
}

/** The Vimshopaka of a chart: the four groups of points and the dignities in the 16 vargas. See docs/spec/forcas/vimshopaka.md. */
export function computeVimshopaka(eph: Ephemeris, input: ChartInput, coreOptions?: Partial<CoreOptions>): Vimshopaka & { fidelity: Fidelity } {
  const core = resolveOptions(coreOptions);
  const positions = computePositions(eph, input, core);
  const longitudes = Object.fromEntries(NINE.map((p) => [p, positions.points[p].longitude])) as Record<(typeof NINE)[number], number>;
  return { ...vimshopaka(longitudes, core.fidelity), fidelity: core.fidelity };
}
