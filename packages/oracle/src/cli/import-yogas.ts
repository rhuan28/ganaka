import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINE_YOGAS, parseYogas, type YogaFixture } from '../yogaTables';

// Imports the raw yoga file (read-yogas.py) into fixtures-yogas/, one fixture per chart, keeping the numbers the engine
// covers. The rest of the raw file stays in the private bench.
const [rawFile, extractedOn] = process.argv.slice(2);
if (!rawFile || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '')) {
  console.error('usage: import-yogas <raw yoga file> <extraction date YYYY-MM-DD>');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = join(root, 'fixtures-yogas');
mkdirSync(dir, { recursive: true });
let written = 0;
for (const [chart, shown] of parseYogas(readFileSync(rawFile, 'utf8'))) {
  const m = /^REF (\d{4})$/.exec(chart);
  if (!m) throw new Error(`not a reference chart: ${chart}`);
  const fx: YogaFixture = {
    id: `ref-${m[1]}`,
    pl9: { present: shown.filter((y) => y.number >= ENGINE_YOGAS.first && y.number <= ENGINE_YOGAS.last).sort((a, b) => a.number - b.number) },
    provenance: {
      program: "Parashara's Light 9.0", method: 'YOG print model (1001 Yogas: applicable yogas), PDF read by read-yogas.py',
      charts: 'refset/xml', extractedOn: extractedOn!,
    },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} yoga fixtures written to ${dir}`);
