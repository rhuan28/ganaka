// The yoga comparison alone, for working on a family: each yoga that PL9 and the engine see differently, with the
// chart's signs, dignities and the Sun's and Moon's Shadbala ratios; then how often PL9 prints each checked number.
// usage: check-yogas [raw yoga file natures.json]: with both, the yogas of the raw file (read-yogas.py, printed with
// PL9's natures set as natures.json, the core's `natures` option) instead of fixtures-yogas, computed with them.
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeYogas, computeYogaChart } from '@reverse/core';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFixtures } from '../conformance';
import { ENGINE_YOGAS, loadYogaFixtures, parseYogas, verifyYogas, YOGA_NUMBERS, type YogaFixture } from '../yogaTables';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [f.id, f.input]));
const checked = Object.values(YOGA_NUMBERS);
const [rawFile, naturesFile] = process.argv.slice(2);
const natures = naturesFile ? JSON.parse(readFileSync(naturesFile, 'utf8')) : {};
const fixtures: YogaFixture[] = rawFile
  ? [...parseYogas(readFileSync(rawFile, 'utf8'))].map(([chart, shown]) => ({
    id: `ref-${chart.slice(4)}`, pl9: { present: shown.filter((y) => y.number >= ENGINE_YOGAS.first && y.number <= ENGINE_YOGAS.last) },
    provenance: { program: '', method: '', charts: '', extractedOn: '' },
  }))
  : loadYogaFixtures(join(root, 'fixtures-yogas'));
const byNumber = new Map<string, number>(); let charts = 0;
for (const fx of fixtures) {
  const input = births.get(fx.id); if (!input) { console.log(fx.id, 'no birth'); continue; }
  const r = computeYogas(eph, input, {}, { fidelity: 'pl9', natures }); charts++;
  const found = new Set(r.yogas.filter((y) => y.present).map((y) => YOGA_NUMBERS[y.id]!));
  const decided = checked.filter((n) => !r.missing.some((m) => YOGA_NUMBERS[m.id] === n));
  for (const f of verifyYogas(fx.pl9.present, found, decided)) {
    const ch = computeYogaChart(eph, input, {}, { fidelity: 'pl9', natures });
    console.log(fx.id, f, JSON.stringify({ lagna: ch.lagnaSign, signs: ch.signs, dig: ch.dignity, sun: ch.shadbalaRatio?.sun, moon: ch.shadbalaRatio?.moon }));
    byNumber.set(f.split(':')[0]!, (byNumber.get(f.split(':')[0]!) ?? 0) + 1);
  }
}
console.log('charts', charts, 'failures by number', Object.fromEntries(byNumber));
const pl9 = new Map<number, number>(); for (const fx of fixtures) for (const y of fx.pl9.present) if (checked.includes(y.number)) pl9.set(y.number, (pl9.get(y.number) ?? 0) + 1);
console.log('PL9 presences', Object.fromEntries([...pl9].sort((a, b) => a[0] - b[0])));
eph.close();
