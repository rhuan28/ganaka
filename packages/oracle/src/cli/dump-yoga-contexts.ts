import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeYogaContext } from '@reverse/core';
import { loadFixtures } from '../conformance';
import { loadYogaFixtures } from '../yogaTables';

// Writes the yoga context (in the pl9 mode) of each chart of fixtures-yogas to one JSON file, keyed "REF NNNN", for a
// client that evaluates yogas against the bench (the app's interpreter).
const [out] = process.argv.slice(2);
if (!out) { console.error('usage: dump-yoga-contexts <output.json>'); process.exit(2); }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [f.id, f.input]));
const all: Record<string, unknown> = {};
for (const fx of loadYogaFixtures(join(root, 'fixtures-yogas'))) {
  all[`REF ${fx.id.slice(4)}`] = computeYogaContext(eph, births.get(fx.id)!, { fidelity: 'pl9' });
}
writeFileSync(out, JSON.stringify(all));
console.log(`${Object.keys(all).length} contexts written to ${out}`);
eph.close();
