import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVarshaphala, VARSHAPHALA_PARTS, type VarshaphalaDate, type VarshaphalaFixture } from '../varshaphalaTables';

// Imports the raw Varshaphala files (read-varshaphala.py) into fixtures-varshaphala/<2000|2030>/, or, for the
// "Mean solar return" printouts, fixtures-varshaphala-options/mean/. The 72 returns of "Varshaphala Charts #1-#6" depend
// on no date (the same at both reference dates in the 135 charts), so the 2000 set leaves them to the 2030 one.
const [rawDir, date, extractedOn] = process.argv.slice(2);
if (!rawDir || !['2000', '2030', 'mean'].includes(date ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '')) {
  console.error('usage: import-varshaphala <directory of raw Varshaphala files> <2000|2030|mean> <extraction date YYYY-MM-DD>');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = date === 'mean' ? join(root, 'fixtures-varshaphala-options', 'mean') : join(root, 'fixtures-varshaphala', date!);
mkdirSync(dir, { recursive: true });
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const shown = parseVarshaphala(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(shown.chart);
  if (!m || !file.startsWith(shown.chart)) throw new Error(`${file}: holds "${shown.chart}"`);
  if (date === '2000') shown.parts.vsreturn = {};
  const empty = VARSHAPHALA_PARTS.filter((p) => Object.keys(shown.parts[p]).length === 0 && !(p === 'vsreturn' && date === '2000'));
  if (empty.length) throw new Error(`${file}: no ${empty.join(', ')}`);
  const fx: VarshaphalaFixture = {
    id: `ref-${m[1]}`, date: date as VarshaphalaDate, pl9: shown.parts,
    provenance: {
      program: "Parashara's Light 9.0",
      method: `TEMPO print model${date === 'mean' ? ', "Mean solar return", age at 2030-06-15' : `, age at the reference date ${date}${date === '2000' ? ' (the 72 returns: see the 2030 set)' : ''}`}, PDF read by read-varshaphala.py`,
      charts: 'refset/xml-tempo (birth rounded to the second, place manual)', extractedOn: extractedOn!,
    },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} Varshaphala fixtures written to ${dir}`);
