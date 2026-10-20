import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { norm360 } from '../zodiac';
import type { Varshaphala } from './annual';

export const TRIPATAKI_POINTS = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
export type TripatakiPoint = (typeof TRIPATAKI_POINTS)[number];

export interface Tripataki {
  /** The sign, 1 = Aries, where the chakra shows each point. */
  cell: Record<TripatakiPoint, number>;
  /** For the Lagna and the seven planets, the planets that cause vedha on it, in the order Sun to Ketu. */
  vedha: Partial<Record<TripatakiPoint, TripatakiPoint[]>>;
}

/** The cells in vedha with a cell, both counted from the annual Lagna, 1 = the Lagna (read in PL9). */
const VEDHA: Record<number, readonly number[]> = {
  1: [1, 4, 7, 10], 4: [1, 4, 7, 10], 7: [1, 4, 7, 10], 10: [1, 4, 7, 10], 2: [2, 3, 6, 9], 3: [2, 3, 8, 11], 5: [5, 6, 9, 12],
  6: [6, 11, 3, 5], 8: [8, 12, 9, 3], 9: [9, 2, 5, 8], 11: [11, 12, 5, 6], 12: [12, 5, 8, 11],
};
const wrap12 = (n: number) => ((((n - 1) % 12) + 12) % 12) + 1;

/**
 * The Tripataki Chakra of a year of age (read in PL9): each point moves from its natal sign by the completed years,
 * modulo 9 for the Moon, 6 for Mars, 4 for the Sun, Mercury, Jupiter, Venus and Saturn, backwards modulo 6 for the
 * nodes; the Lagna stays. A planet causes vedha on a point when its cell, counted from the annual Lagna, is in the set
 * of that point's cell. `natalSigns` and `annualLagnaSign` are 0 = Aries.
 */
export function tripatakiChakra(natalSigns: Record<TripatakiPoint, number>, annualLagnaSign: number, years: number): Tripataki {
  const shift = (k: TripatakiPoint) =>
    k === 'lagna' ? 0 : k === 'moon' ? years % 9 : k === 'mars' ? years % 6 : k === 'rahu' || k === 'ketu' ? -(years % 6) : years % 4;
  const cell = Object.fromEntries(TRIPATAKI_POINTS.map((k) => [k, wrap12(natalSigns[k] + 1 + shift(k))])) as Record<TripatakiPoint, number>;
  const fromLagna = (k: TripatakiPoint) => wrap12(cell[k] - annualLagnaSign);
  const vedha: Partial<Record<TripatakiPoint, TripatakiPoint[]>> = {};
  for (const a of TRIPATAKI_POINTS.slice(0, 8)) {
    vedha[a] = TRIPATAKI_POINTS.filter((b) => b !== 'lagna' && b !== a && VEDHA[fromLagna(a)]!.includes(fromLagna(b)));
  }
  return { cell, vedha };
}

/** The Tripataki of a Varshaphala; null without the natal or the annual Lagna. */
export function tripataki(eph: Ephemeris, natal: ChartInput, v: Varshaphala, coreOptions?: Partial<CoreOptions>): Tripataki | null {
  const n = computePositions(eph, natal, coreOptions).points as Record<string, { longitude: number } | undefined>;
  const annualLagna = v.chart.points.lagna?.longitude;
  if (!n.lagna || annualLagna === undefined) return null;
  const sign = (x: number) => Math.floor(norm360(x) / 30);
  const signs = Object.fromEntries(TRIPATAKI_POINTS.map((k) => [k, sign(n[k]!.longitude)])) as Record<TripatakiPoint, number>;
  return tripatakiChakra(signs, sign(annualLagna), v.years);
}
