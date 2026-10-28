// The cancellations of the Mangala Dosha against PL9's report for pairs of reference charts, as the private bench
// lists them: the reasons in PL9's order, each with its chart.
// usage: check-mangala-cancellation <truth.json>
// The truth file stays in the private bench: { "REF NNNN x REF MMMM[-f].pdf": [{ rule, chart }] }, "-f" when the
// partner is a woman; its rule names are the bench's.
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeCompatibility, type MangalaCancellationId } from '@reverse/core';
import { loadFixtures } from '../conformance';

const path = process.argv[2];
if (!path) { console.error('usage: check-mangala-cancellation <truth.json>'); process.exit(2); }
const truth = JSON.parse(readFileSync(path, 'utf8')) as Record<string, { rule: string; chart: string }[] | string>;
const BENCH: Record<string, MangalaCancellationId> = {
  'no-dosha': 'noDosha', 'dosha-both': 'doshaBoth', 'mars-saturn': 'marsSaturn', 'malefic-count': 'maleficCount',
  'bhakoota-gana': 'bhakootGana', 'mars-weak': 'marsWeakened', 'bride-jupiter': 'brideJupiter', 'movable-sign': 'movableSign',
  'h4-h7-signs': 'fourthSeventhSigns', 'mars-moon-jup-merc': 'marsWithMoonJupiterMercury', 'exalted-own-d1-d9': 'exaltedOrOwn',
  'h12-signs': 'twelfthSigns', 'leo-cancer-sign': 'leoCancerSigns', 'mars-jupiter': 'marsJupiter', 'h4-signs': 'fourthSigns',
  'h8-signs': 'eighthSigns', dispositor: 'dispositor', 'mars-mercury': 'marsMercury', 'mars-moon': 'marsMoon',
  'moon-kendra': 'moonKendra', 'five-placements-a': 'fivePlacements', 'five-placements-b': 'fivePlacementsVariant',
  'strong-jup-ven': 'strongBenefics',
};
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
let pairs = 0, reasons = 0;
const failures: string[] = [];
for (const [file, shown] of Object.entries(truth)) {
  if (!Array.isArray(shown)) continue;
  const m = /^(REF \d{4}) x (REF \d{4})(-f)?\.pdf$/.exec(file);
  if (!m) { failures.push(`${file}: not a pair`); continue; }
  const [a, b] = [births.get(m[1]!), births.get(m[2]!)];
  if (!a || !b) { failures.push(`${file}: no birth`); continue; }
  const r = computeCompatibility(eph, { input: a, sex: 'male' }, { input: b, sex: m[3] ? 'female' : 'male' }, {}, { fidelity: 'pl9' });
  pairs++;
  const want = shown.map((s) => `${BENCH[s.rule] ?? `?${s.rule}`}:${s.chart === 'both' ? 'pair' : s.chart}`);
  const got = (r.mangalaCancellations ?? []).map((c) => `${c.id}:${c.chart}`);
  reasons += want.length;
  if (want.join(' ') !== got.join(' ')) failures.push(`${file}\n    PL9    ${want.join(' ')}\n    engine ${got.join(' ')}`);
}
eph.close();
console.log(`${pairs} pairs, ${reasons} reasons; ${failures.length} pairs differ`);
for (const f of failures) console.log('  ' + f);
if (failures.length) process.exitCode = 1;
