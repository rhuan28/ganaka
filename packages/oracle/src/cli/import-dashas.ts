import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RASHI_DASHA_SYSTEMS } from '@reverse/core';
import { cellOptions, encodeDasha, parseDashas, type DashaFixture } from '../dashaTables';

const [rawDir, extractedOn, ...rest] = process.argv.slice(2);
// Options PL9 printed with, as name=value: the fixtures go to fixtures-dashas-options/<name>-<value>.
const options = Object.fromEntries(rest.map((o) => o.split('=')));
// The two options of the Kalachakra are kept together, as computeDashas takes them.
if ('antardashas' in options || 'sequence' in options) {
  options.kalachakra = { antardashas: Number(options.antardashas ?? 12), sequence: options.sequence ?? 'continue' };
  delete options.antardashas;
  delete options.sequence;
}
// The options of the rashi dashas likewise.
const RASHI_KEYS = ['charaMethod', 'charaAntarFromLord', 'padanadhamsaMethod', 'antardashaStart', 'rahuExaltation', 'mercuryExaltation'];
if (RASHI_KEYS.some((k) => k in options)) {
  options.rashi = Object.fromEntries(RASHI_KEYS.filter((k) => k in options).map((k) => [k, k === 'charaAntarFromLord' ? options[k] === 'true' : options[k]]));
  for (const k of RASHI_KEYS) delete options[k];
}
if (!rawDir || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '') || rest.some((o) => !/^(yearDays|balance|base|varga|antardashas|sequence|charaMethod|charaAntarFromLord|padanadhamsaMethod|antardashaStart|rahuExaltation|mercuryExaltation)=\S+$/.test(o))) {
  console.error('usage: import-dashas <directory of raw dasha files> <extraction date YYYY-MM-DD> [yearDays|balance|base|varga|antardashas|sequence|charaMethod|charaAntarFromLord|padanadhamsaMethod|antardashaStart|rahuExaltation|mercuryExaltation=<value> ...]');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = rest.length ? join(root, 'fixtures-dashas-options', rest.join('_').replace(/=/g, '-')) : join(root, 'fixtures-dashas');
let written = 0;
const provenance = (method: string) => ({ program: "Parashara's Light 9.0", ayanamsha: 'Lahiri', method, extractedOn: extractedOn! });
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const { chart, dashas, kalachakra } = parseDashas(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(chart);
  if (!m) throw new Error(`${file}: chart name "${chart}" is not of the form REF NNNN`);
  // A file named after one chart must hold that chart: a PDF left over from an interrupted print would not.
  if (!file.startsWith(chart)) throw new Error(`${file}: holds ${chart}`);
  const id = `ref-${m[1]}`;
  // The dasha cells of a worksheet, each set to its own option, go to the set of that option.
  const cells = new Map<string, typeof dashas>();
  for (const d of dashas) cells.set(d.cell ?? '', [...(cells.get(d.cell ?? '') ?? []), d]);
  for (const [cell, shown] of cells) {
    const opts = cell ? cellOptions(cell) : options;
    // The Kalachakra goes to its own sets.
    const kc = shown.every((d) => d.system === 'kalachakra');
    const optionDir = cell ? Object.entries(opts).map(([k, v]) => `${k}-${v}`).join('_') : rest.join('_').replace(/=/g, '-');
    const rashi = shown.every((d) => (RASHI_DASHA_SYSTEMS as readonly string[]).includes(d.system));
    const dir = kc
      ? join(root, rest.length ? join('fixtures-kalachakra-options', optionDir) : 'fixtures-kalachakra')
      : rashi ? join(root, rest.length ? join('fixtures-rashi-options', optionDir) : 'fixtures-rashi')
      : cell || rest.length ? join(root, 'fixtures-dashas-options', optionDir) : outDir;
    mkdirSync(dir, { recursive: true });
    const fx: DashaFixture = {
      id, pl9: { dashas: shown.map(({ cell: _, ...d }) => encodeDasha(d)), ...(kalachakra ? { kalachakra } : {}) }, ...(cell || rest.length ? { options: opts } : {}),
      provenance: provenance(cell ? `dasha cell of a worksheet, PDF read by read-dashas.py` : 'DAS print model, PDF read by read-dashas.py'),
    };
    writeFileSync(join(dir, `${id}.json`), JSON.stringify(fx, null, 1) + '\n');
    written++;
  }
}
console.log(`${written} dasha fixtures written`);
