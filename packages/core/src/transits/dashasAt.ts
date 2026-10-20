import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import type { ChartInput } from '../positions';
import { computeDashas } from '../dashas/compute';
import { dashaYearDays, type DashaPeriod } from '../dashas/engine';
import { rashiChainAt } from '../dashas/rashi';
import { PLANETS_9, type Planet9 } from '../jaimini';
import { resolveOptions } from '../options';
import { computePositions } from '../positions';

/** The two-letter names PL9 prints for the lords of the planet dashas, the Yoginis by their planets. */
const SHORT: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
  mangala: 'Mo', pingala: 'Su', dhanya: 'Ju', bhramari: 'Ma', bhadrika: 'Me', ulka: 'Sa', siddha: 'Ve', sankata: 'Ra',
};

/**
 * The five lords running at an instant, PL9's "Ra-Me-Ve-Ve-Ra". An instant before birth takes the first period of
 * each level, as PL9 does: the first lord five times over.
 */
export function dashaChain(periods: readonly DashaPeriod[], jdUt: number): string {
  const out: string[] = [];
  let list: readonly DashaPeriod[] | undefined = periods;
  while (list?.length) {
    const p: DashaPeriod = jdUt < list[0]!.start ? list[0]! : (list.find((x) => x.start <= jdUt && jdUt < x.end) ?? list.at(-1)!);
    out.push(SHORT[String(p.lord)] ?? String(p.lord));
    list = p.sub;
  }
  return out.join('-');
}

/** Whole cycles of each system to reach 300 years after birth, the oldest reference chart's age at a transit. */
const CYCLES = { vimshottari: 3, ashtottari: 3, yogini: 9 } as const;

const SIGN_SHORT = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];

/**
 * The dashas PL9 prints at a transit instant ("Gochara data"), five levels each: Vimshottari, Yogini and Ashtottari,
 * and the Narayana by sign (`rashiChainAt`), null where the birth has no Lagna; and the Chara the Events page prints,
 * the same way. See docs/spec/tempo/transitos.md.
 */
export function dashasAt(eph: Ephemeris, natal: ChartInput, jdUt: number, coreOptions?: Partial<CoreOptions>): { vimshottari: string; yogini: string; ashtottari: string; narayana: string | null; chara: string | null } {
  const at = (system: keyof typeof CYCLES) =>
    dashaChain(computeDashas(eph, natal, { system, levels: 5, cycles: CYCLES[system] }, coreOptions).periods, jdUt);
  const fidelity = resolveOptions(coreOptions).fidelity;
  const points = computePositions(eph, natal, coreOptions).points;
  const chart = points.lagna && { lagna: points.lagna.longitude, longitudes: Object.fromEntries(PLANETS_9.map((p) => [p, points[p].longitude])) as Record<Planet9, number> };
  const rashi = (system: 'narayana' | 'chara') => chart ? rashiChainAt(system, chart, natal.jdUt, jdUt, dashaYearDays('365.25', fidelity), fidelity).map((s) => SIGN_SHORT[s]).join('-') : null;
  return { vimshottari: at('vimshottari'), yogini: at('yogini'), ashtottari: at('ashtottari'), narayana: rashi('narayana'), chara: rashi('chara') };
}
