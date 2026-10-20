import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arcsecDiff } from './angles';
import type { Fixture } from './fixtures';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Fixtures of the main set, or of a named sub-directory such as "fixtures-ayanamsha/raman". */
export function loadFixtures(dirName = 'fixtures'): Fixture[] {
  const dir = join(root, dirName);
  const out = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Fixture);
  if (out.length === 0) throw new Error(`no fixtures in ${dir}`);
  return out;
}

/** Largest signed difference (computed - PL9) per field, with the chart where it happens. */
export function worstByField(
  fixtures: Fixture[],
  compute: (fx: Fixture) => Record<string, number>,
): Record<string, { arcsec: number; chartId: string }> {
  const worst: Record<string, { arcsec: number; chartId: string }> = {};
  for (const fx of fixtures) {
    for (const [field, value] of Object.entries(compute(fx))) {
      const ref = fx.pl9.longitudes[field];
      if (ref === undefined) throw new Error(`${fx.id}: no reference value for "${field}"`);
      const d = arcsecDiff(value, ref);
      if (!Number.isFinite(d)) throw new Error(`${fx.id}: difference for "${field}" is not finite`);
      if (!worst[field] || Math.abs(d) > Math.abs(worst[field]!.arcsec)) worst[field] = { arcsec: d, chartId: fx.id };
    }
  }
  return worst;
}
