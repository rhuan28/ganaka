import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeTables, parseTables, type TableFixture } from '../tables';

const [rawDir, extractedOn, flag] = process.argv.slice(2);
if (!rawDir || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '') || (flag !== undefined && flag !== '--merge')) {
  console.error('usage: import-tables <directory of raw table files> <extraction date YYYY-MM-DD> [--merge]');
  console.error('  --merge adds what the raw files hold to the fixtures that exist, and refuses a disagreement');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Charts printed with options other than PL9's observed ones go to their own set.
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const { chart, method, ...pl9 } = parseTables(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(chart);
  if (!m) throw new Error(`${file}: chart name "${chart}" is not of the form REF NNNN`);
  const id = `ref-${m[1]}`;
  const outDir = join(root, Object.keys(pl9.options).length ? 'fixtures-tables-options' : 'fixtures-tables');
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, `${id}.json`);
  let fx: TableFixture = { id, pl9, provenance: { program: "Parashara's Light 9.0", ayanamsha: 'Lahiri', method, extractedOn: extractedOn! } };
  if (flag === '--merge' && existsSync(target)) {
    const old = JSON.parse(readFileSync(target, 'utf8')) as TableFixture;
    let merged: TableFixture['pl9'];
    try {
      merged = mergeTables(old.pl9, pl9);
    } catch (e) {
      throw new Error(`${file}: ${(e as Error).message}`);
    }
    const methods = old.provenance.method.includes(method) ? old.provenance.method : `${old.provenance.method}; ${method}`;
    fx = { id, pl9: merged, provenance: { ...old.provenance, method: methods, extractedOn: extractedOn! } };
  }
  writeFileSync(target, JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} table fixtures written`);
