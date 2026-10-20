import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ayanamshaFrame, dayFrame } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { chartXml, pl9Name } from '../pl9xml';
import { buildReferenceSet } from '../refset';

const xmlDir = process.argv[2];
if (!xmlDir) {
  console.error('usage: make-refset <output directory for the chart XML files>');
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));
const eph = await createSwissEphemeris();
const frame = ayanamshaFrame(eph, 'lahiri', 0, 'pl9');
// The sunrise that follows an instant, by PL9's own rule: the one after the sunrise that holds the instant.
const set = buildReferenceSet(eph, undefined, (jd, lat, lon) => dayFrame(eph, jd, lat, lon, frame).nextSunrise);
eph.close();

writeFileSync(resolve(here, '../../refset.json'), JSON.stringify(set, null, 1) + '\n');
mkdirSync(xmlDir, { recursive: true });
for (const spec of set) writeFileSync(join(xmlDir, `${pl9Name(spec)}.xml`), chartXml(spec));
console.log(`${set.length} charts: refset.json written, XML files in ${xmlDir}`);
