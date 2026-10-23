// The yoga comparison alone, for working on a family: each yoga that PL9 and the engine see differently, with the
// chart's signs, dignities and the Sun's and Moon's Shadbala ratios; then how often PL9 prints each checked number.
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeYogas, computeYogaChart } from '@reverse/core';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFixtures } from '../conformance';
import { loadYogaFixtures, verifyYogas, YOGA_NUMBERS } from '../yogaTables';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [f.id, f.input]));
const checked = Object.values(YOGA_NUMBERS);
const byNumber = new Map<string, number>(); let charts = 0;
for (const fx of loadYogaFixtures(join(root, 'fixtures-yogas'))) {
  const input = births.get(fx.id); if (!input) { console.log(fx.id, 'no birth'); continue; }
  const r = computeYogas(eph, input, {}, { fidelity: 'pl9' }); charts++;
  const found = new Set(r.yogas.filter((y) => y.present).map((y) => YOGA_NUMBERS[y.id]!));
  const decided = checked.filter((n) => !r.missing.some((m) => YOGA_NUMBERS[m.id] === n));
  for (const f of verifyYogas(fx.pl9.present, found, decided)) {
    const ch = computeYogaChart(eph, input, {}, { fidelity: 'pl9' });
    console.log(fx.id, f, JSON.stringify({ lagna: ch.lagnaSign, signs: ch.signs, dig: ch.dignity, sun: ch.shadbalaRatio?.sun, moon: ch.shadbalaRatio?.moon }));
    byNumber.set(f.split(':')[0]!, (byNumber.get(f.split(':')[0]!) ?? 0) + 1);
  }
}
console.log('charts', charts, 'failures by number', Object.fromEntries(byNumber));
const pl9 = new Map<number, number>(); for (const fx of loadYogaFixtures(join(root, 'fixtures-yogas'))) for (const y of fx.pl9.present) if (checked.includes(y.number)) pl9.set(y.number, (pl9.get(y.number) ?? 0) + 1);
console.log('PL9 presences', Object.fromEntries([...pl9].sort((a, b) => a[0] - b[0])));
eph.close();
