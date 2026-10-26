// The compatibility of pairs of reference charts against PL9's printed "95. Compatibility - Kutas" page and its Mangala
// Dosha report, as read from PL9's printouts: the scores of each koota, the totals, the sign distances and the
// houses of Mars, written as PL9 writes them.
// usage: check-compatibility <read.json> <pairs.json>
// pairs.json says which pairs had a female partner ({ male: [[native, partner], …], female: […] }).
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeCompatibility } from '@reverse/core';
import { loadFixtures } from '../conformance';

const [readPath, pairsPath] = process.argv.slice(2);
if (!readPath || !pairsPath) { console.error('usage: check-compatibility <read.json> <pairs.json>'); process.exit(2); }
type Read = Record<string, { ashtakoota?: number[]; dashkoota?: number[]; signDistances?: string[]; mars?: Record<'native' | 'partner', [number, number]> }>;
const read = JSON.parse(readFileSync(readPath, 'utf8')) as Read;
const pairs = JSON.parse(readFileSync(pairsPath, 'utf8')) as { male: [number, number][]; female: [number, number][] };
const femalePartner = new Set(pairs.female.map(([n, p]) => `${n},${p}`));
const ref = (n: string) => Number(n.slice(4));

const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [Number(f.id.slice(4)), f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, mine: string, shown: string | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (mine !== (shown ?? '')) { const l = failures.get(col) ?? []; l.push(`${what}: engine "${mine}" PL9 "${shown ?? ''}"`); failures.set(col, l); }
};
const POINTS = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;

let n = 0;
for (const [pair, cells] of Object.entries(read)) {
  const [a, b] = pair.split(' x ').map(ref) as [number, number];
  const ia = births.get(a), ib = births.get(b);
  if (!ia || !ib) { console.log(pair, 'no birth in fixtures'); continue; }
  const sex = femalePartner.has(`${a},${b}`) ? 'female' as const : 'male' as const;
  const r = computeCompatibility(eph, { input: ia, sex: 'male' }, { input: ib, sex }, {}, { fidelity: 'pl9' });
  n++;
  const rows = (k: 'ashtakoota' | 'dashkoota') => [...r[k].rows.map((x) => x.score), r[k].total];
  for (const k of ['ashtakoota', 'dashkoota'] as const) {
    const shown = cells[k] ?? [];
    const mine = rows(k);
    mine.forEach((v, i) => check(`${k} ${i === mine.length - 1 ? 'total' : r[k].rows[i]!.name}`, pair, v.toFixed(1), shown[i]?.toFixed(1)));
  }
  POINTS.forEach((p, i) => { const d = r.distances[p]; if (d) check('sign distance', `${pair} ${p}`, d.signs.join('-'), cells.signDistances?.[i]); });
  for (const who of ['native', 'partner'] as const) {
    const m = r.mangala[who];
    check('Mars from the Lagna and the Moon', `${pair} ${who}`, `${m.marsHouseFromLagna},${m.marsHouseFromMoon}`, cells.mars?.[who]?.join(','));
  }
}
eph.close();
console.log(`${n} pairs`);
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${c} checks, ${f.length} failures${f.length ? '\n  ' + f.slice(0, 6).join('\n  ') : ''}`);
}
