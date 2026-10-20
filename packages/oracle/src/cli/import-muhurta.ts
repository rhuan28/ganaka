import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUHURTA_PARTS, parseMuhurta, type MuhurtaFixture, type MuhurtaSet } from '../muhurtaTables';

// Imports the raw Muhurta files (read-muhurta.py) into fixtures-muhurta/<2000|2030>/ (the "Muhurta" event at
// the reference date, the default thermometer), or, for a thermometer activity printout, fixtures-muhurta-options/<name>/.
const [rawDir, set, extractedOn] = process.argv.slice(2);
if (!rawDir || !/^(2000|2030|activity-[a-z]+)$/.test(set ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '')) {
  console.error('usage: import-muhurta <directory of raw Muhurta files> <2000|2030|activity-<name>> <extraction date YYYY-MM-DD>');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const option = set!.startsWith('activity-');
const dir = option ? join(root, 'fixtures-muhurta-options', set!.slice('activity-'.length)) : join(root, 'fixtures-muhurta', set!);
mkdirSync(dir, { recursive: true });
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => /^ref-\d{4}\.txt$/.test(f)).sort()) {
  const shown = parseMuhurta(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(shown.chart);
  if (!m || file !== `ref-${m[1]}.txt`) throw new Error(`${file}: holds "${shown.chart}"`);
  // An activity printout holds the Muhurta page alone: no page 128 (the Bhava Bala and the Vimshopaka).
  const empty = MUHURTA_PARTS.filter((p) => Object.keys(shown.parts[p]).length === 0 && !(option && p === 'mubala'));
  if (empty.length) throw new Error(`${file}: no ${empty.join(', ')}`);
  const fx: MuhurtaFixture = {
    id: `ref-${m[1]}`, set: set as MuhurtaSet, pl9: shown.parts,
    provenance: {
      program: "Parashara's Light 9.0",
      method: option
        ? `a print model of the Muhurta worksheet alone, the "Muhurta" event at 2030-07-02 12:00 (Jaipur time and place), thermometer "${set!.slice(9)}", PDF read by read-muhurta.py --muhurta-only`
        : `TEMPO print model, the "Muhurta" event at the reference date ${set} (Jaipur time and place), PDF read by read-muhurta.py`,
      charts: 'refset/xml-tempo (birth rounded to the second, place manual)', extractedOn: extractedOn!,
    },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} Muhurta fixtures written to ${dir}`);
