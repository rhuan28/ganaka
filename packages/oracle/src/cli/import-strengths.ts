import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStrengths, type StrengthFixture } from '../strengthTables';

const [rawDir, extractedOn, ...rest] = process.argv.slice(2);
// Options PL9 printed with, as name=value: the fixtures go to fixtures-ashtakavarga-options/<name>-<value>, or to
// fixtures-shadbala-options/<name>-<value> for the Shadbala's.
const VALUES: Record<string, string[]> = {
  method: ['varahamihira', 'parashara'], ekadhipatya: ['parashara', 'other'], virgoMultiplier: ['6', '5'],
  drekkana: ['parashara', 'horaRatnam'], digBala: ['cusps', 'kendras'], mercuryPaksha: ['withMalefics', 'benefic'],
  mercuryDrik: ['withMalefics', 'benefic'], jupiterMercuryDrik: ['full', 'quarter'],
};
const pairs = rest.map((o) => o.split('='));
if (!rawDir || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '') || pairs.some(([k, v]) => !VALUES[k!]?.includes(v!))) {
  console.error('usage: import-strengths <directory of raw strength files> <extraction date YYYY-MM-DD> [method=varahamihira|parashara] [ekadhipatya=parashara|other] [virgoMultiplier=6|5] [drekkana=parashara|horaRatnam] [digBala=cusps|kendras] [mercuryPaksha=withMalefics|benefic] [mercuryDrik=withMalefics|benefic] [jupiterMercuryDrik=full|quarter]');
  process.exit(2);
}
const options = Object.fromEntries(pairs.map(([k, v]) => [k, k === 'virgoMultiplier' ? Number(v) : v]));
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Each print model has its fixtures: FOR (Shadbala and Bhava Bala), VIM (Vimshopaka), AV (Ashtakavarga).
const KIND = { FOR: 'fixtures-shadbala', VIM: 'fixtures-vimshopaka', AV: 'fixtures-ashtakavarga' } as const;
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const { chart, av, sb, bb, vim } = parseStrengths(readFileSync(join(rawDir, file), 'utf8'));
  const model = vim.length ? 'VIM' : sb.length > 0 && av.length === 0 ? 'FOR' : 'AV';
  const dir = rest.length ? join(root, `${KIND[model]}-options`, rest.join('_').replace(/=/g, '-')) : join(root, KIND[model]);
  mkdirSync(dir, { recursive: true });
  const m = /^REF (\d{4})$/.exec(chart);
  if (!m) throw new Error(`${file}: chart name "${chart}" is not of the form REF NNNN`);
  // A file named after one chart must hold that chart: a PDF left over from an interrupted print would not.
  if (!file.startsWith(chart)) throw new Error(`${file}: holds ${chart}`);
  const fx: StrengthFixture = {
    id: `ref-${m[1]}`, pl9: model === 'VIM' ? { vim } : model === 'FOR' ? { sb, ...(bb.length ? { bb } : {}) } : { av }, ...(rest.length ? { options } : {}),
    provenance: { program: "Parashara's Light 9.0", ayanamsha: 'Lahiri', method: `${model} print model, PDF read by read-strengths.py`, extractedOn: extractedOn! },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} strength fixtures written`);
