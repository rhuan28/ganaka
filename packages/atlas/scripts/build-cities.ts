import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTz } from '../src/tz';

// Builds data/ from three GeoNames files (https://download.geonames.org/export/dump/, CC BY 4.0): cities1000.txt
// (unzipped cities1000.zip), admin1CodesASCII.txt and countryInfo.txt.
//   pnpm tsx packages/atlas/scripts/build-cities.ts <folder with the three files>
// Each city keeps its name, ASCII name, at most 8 other names in Latin script (none the same as its own but for
// accents and case), country, first-level region, coordinates, IANA zone (canonical) and population.

const source = process.argv[2];
if (!source) {
  console.error('usage: tsx packages/atlas/scripts/build-cities.ts <folder with the GeoNames files>');
  process.exit(2);
}
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
mkdirSync(out, { recursive: true });
const tz = loadTz();
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const LATIN = /^[\p{Script=Latin}\p{N}\p{Zs}'’.,()\-]+$/u;
const clean = (s: string) => s.replace(/[\t\n|]/g, ' ').trim();

const countries: string[] = [];
for (const line of readFileSync(join(source, 'countryInfo.txt'), 'utf8').split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const f = line.split('\t');
  countries.push(`${f[0]}\t${clean(f[4]!)}`);
}
const admin1: string[] = [];
for (const line of readFileSync(join(source, 'admin1CodesASCII.txt'), 'utf8').split('\n')) {
  if (!line) continue;
  const f = line.split('\t');
  admin1.push(`${f[0]}\t${clean(f[1]!)}`);
}

const rows: string[] = [];
let skipped = 0;
for (const line of readFileSync(join(source, 'cities1000.txt'), 'utf8').split('\n')) {
  if (!line) continue;
  const f = line.split('\t');
  const zone = tz.canonical(f[17]!);
  if (!zone) { skipped++; continue; }
  const name = clean(f[1]!), ascii = clean(f[2]!);
  const seen = new Set([fold(name), fold(ascii)]);
  const alt: string[] = [];
  for (const a of (f[3] ?? '').split(',').map(clean)) {
    if (alt.length === 8) break;
    if (!a || !LATIN.test(a) || /^[A-Z0-9]{2,4}$/.test(a) || seen.has(fold(a))) continue;
    seen.add(fold(a));
    alt.push(a);
  }
  rows.push([f[0], name, ascii, alt.join('|'), f[8], f[10], Number(f[4]).toFixed(5), Number(f[5]).toFixed(5), zone, f[14] || '0'].join('\t'));
}
writeFileSync(join(out, 'countries.tsv'), countries.join('\n') + '\n');
writeFileSync(join(out, 'admin1.tsv'), admin1.join('\n') + '\n');
writeFileSync(join(out, 'cities.tsv'), rows.join('\n') + '\n');
console.log(`${rows.length} cities, ${skipped} without a known zone, ${countries.length} countries, ${admin1.length} regions`);
