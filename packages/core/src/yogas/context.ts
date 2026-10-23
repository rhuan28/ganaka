import type { Ephemeris } from '@reverse/ephemeris';
import { computeChart } from '../chart';
import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { computeBirthPanchanga } from '../panchanga/compute';
import type { ChartInput } from '../positions';
import { computePlanetInfo } from '../planetInfo';
import { aspectValue } from '../strengths/aspects';
import { dignity9, type Planet7 } from '../strengths/dignity';
import { vimshopaka } from '../strengths/vimshopaka';
import { CLASSICAL_VARGAS } from '../vargas';
import { nakshatraOf, norm360 } from '../zodiac';
import { dayBirth } from './chart';
import { computeYogaChart } from './index';
import { functionalNatures, naturalNatures, type Nature } from './natures';
import { NINE, signOf } from './primitives';

/**
 * The facts of a chart that the yogas read, gathered for a client that evaluates yogas of its own: no rule of any
 * yoga is in it (docs/spec/yogas.md, docs/spec/api.md).
 */

export type YogaContextVargaName = (typeof CLASSICAL_VARGAS)[number];

export interface YogaContextVarga {
  /** The Lagna's sign in this varga, 0 (Aries) to 11; null without a Lagna. */
  lagnaSign: number | null;
  /** Each planet's sign, its longitude in the varga (sign × 30° + degrees in it) and its nine-level dignity there. */
  planets: Record<Planet9, { sign: number; longitude: number; dignity: number }>;
  /** The graded aspect, 0 to 60 virupas, that `from` casts on `on`, by the longitudes of this varga: aspects[on][from]. */
  aspects: Record<Planet9, Record<Planet9, number>>;
}

export interface YogaContext {
  fidelity: Fidelity;
  lagna: { longitude: number; sign: number } | null;
  /**
   * Per planet: sidereal longitude, speed (degrees a day), sign 0 to 11, nakshatra 0 (Ashwini) to 26, dignity, combust;
   * the varga dignity (own or exaltation signs over the Dashavarga), the Shayanadi state (1 to 12; null without the
   * Lagna or the sunrise) and the Shadvarga Vimshopaka (up to 20), as docs/spec/planet-info.md gives them.
   */
  planets: Record<Planet9, {
    longitude: number; speed: number; sign: number; nakshatra: number; dignity: number; combust: boolean;
    vargaDignity: number; shayanadi: number | null; vimshopakaShadvarga: number;
  }>;
  /** The sixteen classical vargas, the D1 included. */
  vargas: Record<YogaContextVargaName, YogaContextVarga>;
  /** Natural, and functional for the ascendant (null without a Lagna). */
  natures: { natural: Record<Planet9, Nature>; functional: Record<Planet9, Nature> | null };
  /** The Shadbala over its required minimum, Sun to Saturn; null without a Lagna. */
  shadbalaRatio: Record<Planet7, number> | null;
  /** The chara karakas by rank, with seven and with eight (Rahu counted backwards). */
  karakas: { seven: Planet9[]; eight: Planet9[] };
  /** Signs, 0 to 11, of the special points present: the upagrahas, Gulika, Mandi, Prana Pada, the special lagnas, the
   * Arudha Lagna, the Upapada, the Indu Lagna and the Karakamsha. */
  pointSigns: Partial<Record<string, number>>;
  /** By day: the Sun 180° or more ahead of the Lagna. Null without a Lagna. */
  dayBirth: boolean | null;
  /** The Vedic weekday, 0 (Sunday) to 6; null where the sunrise is not defined. */
  vara: number | null;
}

export function computeYogaContext(eph: Ephemeris, input: ChartInput, coreOptions?: Partial<CoreOptions>): YogaContext {
  const o = resolveOptions(coreOptions);
  const chart = computeChart(eph, input, o);
  const ych = computeYogaChart(eph, input, {}, o);
  const lon = ych.longitudes;
  const lagna = chart.points.lagna;
  const info = computePlanetInfo(eph, input, {}, o);
  const vim = vimshopaka(lon, o.fidelity);
  const vargas = {} as Record<YogaContextVargaName, YogaContextVarga>;
  for (const v of CLASSICAL_VARGAS) {
    const parts = Number(v.slice(1));
    const signs = chart.vargas[v];
    const inVarga = Object.fromEntries(NINE.map((p) => [p, v === 'D1' ? lon[p] : signs[p]! * 30 + (((lon[p] * parts) % 30) + 30) % 30])) as Record<Planet9, number>;
    vargas[v] = {
      lagnaSign: signs.lagna ?? null,
      planets: Object.fromEntries(NINE.map((p) => [p, { sign: signs[p]!, longitude: inVarga[p], dignity: dignity9(p, inVarga) }])) as YogaContextVarga['planets'],
      aspects: Object.fromEntries(NINE.map((on) => [on, Object.fromEntries(NINE.map((from) =>
        [from, on === from ? 0 : aspectValue(from, norm360(inVarga[on] - inVarga[from]))]))])) as YogaContextVarga['aspects'],
    };
  }
  const points = chart.points as Partial<Record<string, { longitude: number }>>;
  const pointSigns: Partial<Record<string, number>> = {};
  for (const p of ['dhuma', 'vyatipata', 'parivesha', 'indrachapa', 'upaketu', 'gulika', 'mandi', 'pranaPada']) {
    if (points[p]) pointSigns[p] = signOf(points[p]!.longitude);
  }
  const j = chart.jaimini;
  if (j.specialLagnas) {
    pointSigns.bhavaLagna = signOf(j.specialLagnas.bhava);
    pointSigns.horaLagna = signOf(j.specialLagnas.hora);
    pointSigns.ghatikaLagna = signOf(j.specialLagnas.ghatika);
    pointSigns.jaiminiHoraLagna = signOf(j.specialLagnas.jaiminiHora);
  }
  if (j.arudhaLagna !== undefined) pointSigns.arudhaLagna = j.arudhaLagna;
  if (j.upapada !== undefined) pointSigns.upapada = j.upapada;
  if (j.induLagna !== undefined) pointSigns.induLagna = j.induLagna;
  pointSigns.karakamsha = j.karakamsha;
  let vara: number | null = null;
  try { vara = computeBirthPanchanga(eph, input, o).vara; } catch { vara = null; }
  return {
    fidelity: o.fidelity,
    lagna: lagna ? { longitude: lagna.longitude, sign: signOf(lagna.longitude) } : null,
    planets: Object.fromEntries(NINE.map((p) => [p, {
      longitude: lon[p], speed: chart.points[p].longitudeSpeed ?? 0, sign: ych.signs[p], nakshatra: nakshatraOf(lon[p]),
      dignity: ych.dignity[p], combust: ych.combust[p],
      vargaDignity: ych.vargaDignity[p], shayanadi: info.points[p].shayanadi?.number ?? null, vimshopakaShadvarga: vim.planets[p].scores.shadvarga,
    }])) as YogaContext['planets'],
    vargas,
    natures: { natural: naturalNatures(lon), functional: lagna ? functionalNatures({ ...lon, lagna: lagna.longitude }) : null },
    shadbalaRatio: ych.shadbalaRatio,
    karakas: { seven: j.karakas.seven.map((k) => k.planet as Planet9), eight: j.karakas.eight.map((k) => k.planet as Planet9) },
    pointSigns,
    dayBirth: dayBirth(ych),
    vara,
  };
}
