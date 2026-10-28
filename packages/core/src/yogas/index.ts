import type { Ephemeris } from '@reverse/ephemeris';
import { computeShadbala } from '../strengths/compute';
import { SEVEN, type Planet7 } from '../strengths/dignity';
import { computePositions, type ChartInput } from '../positions';
import { resolveOptions, type CoreOptions } from '../options';
import { resolveNatures } from './natures';
import { yogaChartFrom, type YogaChart, type YogaChartOptions, type YogaResult } from './chart';
import { NINE } from './primitives';
import { mahapurusha } from './families/mahapurusha';
import { chandra } from './families/chandra';
import { surya } from './families/surya';
import { kartari } from './families/kartari';
import { raja } from './families/raja';
import { dhana } from './families/dhana';
import { viparita } from './families/viparita';
import { neechaBhanga } from './families/neechaBhanga';
import { nabhasa } from './families/nabhasa';
import { named } from './families/named';

export type YogaOptions = YogaChartOptions;
export type { Yoga, YogaChart, YogaResult, MissingYoga } from './chart';

/** The families written so far, in the order of docs/spec/yogas.md. */
const FAMILIES: ((ch: YogaChart) => YogaResult)[] = [mahapurusha, chandra, surya, kartari, raja, dhana, viparita, neechaBhanga, nabhasa, named];

/** The yoga chart of a birth: positions in the given mode, and the Shadbala when it can be computed. */
export function computeYogaChart(eph: Ephemeris, input: ChartInput, options: YogaOptions = {}, coreOptions?: Partial<CoreOptions>): YogaChart {
  const positions = computePositions(eph, input, coreOptions);
  const longitudes = { ...Object.fromEntries(NINE.map((p) => [p, positions.points[p].longitude])), ...(positions.points.lagna ? { lagna: positions.points.lagna.longitude } : {}) } as Parameters<typeof yogaChartFrom>[0];
  let ratio: Record<Planet7, number> | null = null;
  if (positions.points.lagna) {
    const sb = computeShadbala(eph, input, {}, coreOptions);
    ratio = Object.fromEntries(SEVEN.map((p) => [p, sb.planets[p].ratio])) as Record<Planet7, number>;
  }
  const speeds = Object.fromEntries(NINE.map((p) => [p, positions.points[p].longitudeSpeed ?? 0]));
  const o = resolveOptions(coreOptions);
  return yogaChartFrom(longitudes, ratio, { ...options, natures: resolveNatures(o.natures) }, o.fidelity, speeds, positions.points.gulika?.longitude ?? null);
}

/** The yogas of a birth chart that the engine knows (docs/spec/yogas.md), present or not, and those it cannot decide. */
export function computeYogas(eph: Ephemeris, input: ChartInput, options: YogaOptions = {}, coreOptions?: Partial<CoreOptions>): YogaResult {
  const ch = computeYogaChart(eph, input, options, coreOptions);
  const out: YogaResult = { yogas: [], missing: [] };
  for (const family of FAMILIES) {
    const r = family(ch);
    out.yogas.push(...r.yogas);
    out.missing.push(...r.missing);
  }
  return out;
}
