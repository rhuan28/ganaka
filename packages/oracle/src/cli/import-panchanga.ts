import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIRTH_FIELDS, parsePanchanga, type PanchangaFixture } from '../panchangaTables';

// Imports the raw panchanga files (read-panchanga.py) into fixtures-panchanga/. The birth pages and the
// Tithi Pravesh are the same at both reference dates, so one set is kept.
const [rawDir, extractedOn] = process.argv.slice(2);
if (!rawDir || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '')) {
  console.error('usage: import-panchanga <directory of raw panchanga files> <extraction date YYYY-MM-DD>');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = join(root, 'fixtures-panchanga');
mkdirSync(dir, { recursive: true });
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const shown = parsePanchanga(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(shown.chart);
  if (!m || !file.startsWith(shown.chart)) throw new Error(`${file}: holds "${shown.chart}"`);
  const missing = BIRTH_FIELDS.filter((k) => shown.birth[k] === undefined);
  if (missing.length || !shown.tithiPravesh.natal || !shown.tithiPravesh.local) throw new Error(`${file}: incomplete (${missing.join(', ') || 'Tithi Pravesh'})`);
  const fx: PanchangaFixture = {
    id: `ref-${m[1]}`, pl9: { birth: shown.birth, tithiPravesh: shown.tithiPravesh },
    provenance: {
      program: "Parashara's Light 9.0", method: 'TEMPO print model, PDF read by read-panchanga.py',
      charts: 'refset/xml-tempo (birth rounded to the second, place manual)', extractedOn: extractedOn!,
    },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} panchanga fixtures written to ${dir}`);
