import type { Ephemeris } from '@reverse/ephemeris';
import type { ChartInput } from '../positions';
import type { Planet7 } from '../strengths/dignity';
import { computeVarshaphala, type Varshaphala, type VarshaphalaOptions } from './annual';
import { annualDashas, type AnnualDashaSystem, type AnnualPeriod } from './dashas';
import { varshaphalaLords, type VarshaphalaLords } from './lords';
import { sahams, type Saham } from './sahams';
import { monthlyReturn } from './solarReturn';
import { harshaBala, panchavargeeyaBala, type HarshaBala, type PanchavargeeyaBala } from './strengths';
import { tajikaChart } from './tajika';
import { tripataki, type Tripataki } from './tripataki';
import { tajikaYogas, type TajikaYoga } from './yogas';

export interface VarshaphalaMonth {
  months: number;
  jdUt: number;
  munthaLongitude: number | null;
  /** The month lord: the year lord's rule on the monthly chart (from the printouts, 1932 of 1932). */
  monthLord: Planet7 | null;
}

export interface VarshaphalaReport {
  varshaphala: Varshaphala;
  lords: VarshaphalaLords | null;
  harsha: Record<Planet7, HarshaBala> | null;
  panchavargeeya: Record<Planet7, PanchavargeeyaBala>;
  yogas: TajikaYoga[];
  sahams: Saham[] | null;
  dashas: Record<AnnualDashaSystem, AnnualPeriod[]>;
  months: VarshaphalaMonth[];
  tripataki: Tripataki | null;
  /** What could not be had: the annual chart's missing points, and what needs them. */
  missing: { what: string; reason: string }[];
}

/** What PL9's Varshaphala reports show for a year of age (docs/spec/time/varshaphala.md). */
export function computeVarshaphalaReport(eph: Ephemeris, natal: ChartInput, years: number, options: VarshaphalaOptions = {}): VarshaphalaReport {
  const { solarReturn: mode = 'true', place, returnJdUt, ...coreOptions } = options;
  const v = computeVarshaphala(eph, natal, years, options);
  const c = tajikaChart(v);
  const systems: AnnualDashaSystem[] = ['mudda', 'muddaKalidasa', 'muddaWithoutBalance', 'patyayini'];
  const months = Array.from({ length: 12 }, (_, k) => {
    const jdUt = k === 0 && returnJdUt !== undefined ? returnJdUt : monthlyReturn(eph, natal, years, k, mode, coreOptions);
    const m = computeVarshaphala(eph, natal, years, { ...coreOptions, solarReturn: mode, place, returnJdUt: jdUt });
    return { months: k, jdUt, munthaLongitude: m.munthaLongitude, monthLord: varshaphalaLords(eph, natal, m, coreOptions)?.yearLord ?? null };
  });
  const lords = varshaphalaLords(eph, natal, v, coreOptions);
  const harsha = harshaBala(c);
  const sahamList = sahams(v);
  const dashas = Object.fromEntries(systems.map((s) => [s, annualDashas(eph, v, natal, s, coreOptions)])) as Record<AnnualDashaSystem, AnnualPeriod[]>;
  const missing = [...v.missing];
  const reason = v.chart.points.lagna ? 'natal Lagna not defined' : 'annual Lagna not defined';
  if (!harsha) missing.push({ what: 'harsha', reason });
  if (!lords) missing.push({ what: 'year lord', reason });
  if (!sahamList) missing.push({ what: 'sahams', reason });
  if (!dashas.patyayini.length) missing.push({ what: 'patyayini', reason });
  const chakra = tripataki(eph, natal, v, coreOptions);
  if (!chakra) missing.push({ what: 'tripataki', reason });
  return { varshaphala: v, lords, harsha, panchavargeeya: panchavargeeyaBala(c), yogas: tajikaYogas(c), sahams: sahamList, dashas, months, tripataki: chakra, missing };
}
