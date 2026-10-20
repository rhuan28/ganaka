import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBirthdat } from '../birthdat';
import { buildFixtures } from '../fixtures';
import type { ChartSpec } from '../pl9xml';
import { ayanamshaSubset } from '../subset';

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--ayanamsha');
const flagAt = args.indexOf('--ayanamsha');
const ayanamsha = flagAt >= 0 ? args[flagAt + 1] : undefined;
const onlySubset = args.includes('--only-subset');
const [file, extractedOn] = positional;
if (!file || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '') || (flagAt >= 0 && !/^[A-Za-z][\w-]*$/.test(ayanamsha ?? ''))) {
  console.error('usage: import-birthdat <PL9 export file> <extraction date YYYY-MM-DD> [--ayanamsha <name>] [--only-subset]');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
let specs = JSON.parse(readFileSync(join(root, 'refset.json'), 'utf8')) as ChartSpec[];
if (onlySubset) specs = ayanamshaSubset(specs);
const { fixtures, missing } = buildFixtures(specs, parseBirthdat(readFileSync(file, 'utf8')), {
  program: "Parashara's Light 9.0",
  ayanamsha: ayanamsha ?? 'Lahiri',
  method: 'Research → Export Birth Chart',
  extractedOn: extractedOn!,
});
const outDir = ayanamsha ? join(root, 'fixtures-ayanamsha', ayanamsha) : join(root, 'fixtures');
mkdirSync(outDir, { recursive: true });
for (const fx of fixtures) writeFileSync(join(outDir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
console.log(`${fixtures.length} fixtures written to ${outDir}; ${missing.length} charts without export`);
if (missing.length) {
  console.log(`missing: ${missing.join(' ')}`);
  process.exit(1);
}
