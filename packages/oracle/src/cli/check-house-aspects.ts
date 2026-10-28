// PL9's "Aspects on Houses" pages (26 to 29) against the engine's houseAspects, as the private bench reads their bars:
// each bar, the aspect on the house and on the house and its lord, Sun to Ketu.
// usage: check-house-aspects <read.json>
// The read file stays in the private bench. PL9 draws a bar to the whole percent, which the reader gets a hair under.
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computePositions, houseAspects, PLANETS_9 } from '@reverse/core';
import { loadFixtures } from '../conformance';

const path = process.argv[2];
if (!path) { console.error('usage: check-house-aspects <read.json>'); process.exit(2); }
const read = JSON.parse(readFileSync(path, 'utf8')) as Record<string, Record<string, number[]>>;
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = { 'on the house': 0, 'with the lord': 0 };
const failures: string[] = [];
let charts = 0;
for (const [chart, bars] of Object.entries(read)) {
  const input = births.get(chart);
  if (!input) { failures.push(`${chart}: no birth in fixtures`); continue; }
  const pos = computePositions(eph, input, { fidelity: 'pl9' }).points;
  if (!pos.lagna) { failures.push(`${chart}: no Lagna`); continue; }
  charts++;
  const longitudes = { lagna: pos.lagna.longitude, ...Object.fromEntries(PLANETS_9.map((p) => [p, pos[p].longitude])) } as Parameters<typeof houseAspects>[0];
  for (const h of houseAspects(longitudes)) {
    for (const [kind, key, mine] of [['on the house', `house ${h.house}`, h.onHouse], ['with the lord', `lord ${h.house}`, h.withLord]] as const) {
      const shown = bars[key];
      if (!shown) { failures.push(`${chart} ${key}: not read`); continue; }
      PLANETS_9.forEach((p, i) => {
        checks[kind]++;
        if (Math.round(shown[i]!) !== mine[i]) failures.push(`${chart} ${key} ${p}: PL9 ${shown[i]} engine ${mine[i]}`);
      });
    }
  }
}
eph.close();
console.log(`${charts} charts; ${Object.entries(checks).map(([k, n]) => `${k}: ${n} bars`).join(', ')}; ${failures.length} failures`);
for (const f of failures.slice(0, 20)) console.log('  ' + f);
if (failures.length) process.exitCode = 1;
