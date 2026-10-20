import type { ChartSpec } from './pl9xml';

/** Charts spread evenly in date, used to check the ayanamshas other than Lahiri. */
export function ayanamshaSubset(specs: ChartSpec[], count = 30): ChartSpec[] {
  const pool = specs.filter((s) => s.kind === 'random' || s.kind === 'recent' || s.kind === 'early')
    .sort((a, b) => a.jdUt - b.jdUt);
  if (pool.length < count) throw new Error(`only ${pool.length} charts available, ${count} requested`);
  const out: ChartSpec[] = [];
  for (let i = 0; i < count; i++) out.push(pool[Math.round((i * (pool.length - 1)) / (count - 1))]!);
  return out;
}
