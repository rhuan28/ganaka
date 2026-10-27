// The Rectification Tool of the reference charts against PL9's printed worksheet "41. Rectification", as read from
// PL9's printouts: the rows of the birth moved hour by hour (23 before, 25 after), each with the Lagna's sign and the
// Vimshottari three levels deep at the print instant (the "Today" column; the other two events print the same).
// usage: check-rectification <read.json>
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeRectification } from '@reverse/core';
import { loadFixtures } from '../conformance';

const [readPath] = process.argv.slice(2);
if (!readPath) { console.error('usage: check-rectification <read.json>'); process.exit(2); }
type Read = Record<string, { printed: string; times: string[]; signs: string[]; events: Record<string, string[][]> }>;
const read = JSON.parse(readFileSync(readPath, 'utf8')) as Read;
const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];

const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, mine: string, shown: string | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (mine !== (shown ?? '')) { const l = failures.get(col) ?? []; l.push(`${what}: engine "${mine}" PL9 "${shown ?? ''}"`); failures.set(col, l); }
};

let n = 0;
for (const [id, cells] of Object.entries(read)) {
  const input = births.get(id);
  if (!input) { console.log(id, 'no birth in fixtures'); continue; }
  n++;
  // The PDF's creation time, read as universal time, is the print instant ("Today").
  const p = cells.printed.slice(2);
  const today = Date.UTC(+p.slice(0, 4), +p.slice(4, 6) - 1, +p.slice(6, 8), +p.slice(8, 10), +p.slice(10, 12), +p.slice(12, 14)) / 86400000 + 2440587.5;
  const r = computeRectification(eph, input, { before: 23, after: 25, events: [today] }, { fidelity: 'pl9' });
  check('rows', id, String(r.rows.length), String(cells.times.length));
  r.rows.forEach((row, i) => {
    check('lagna sign', `${id} row ${row.offset}`, row.lagnaSign ? SIGNS[row.lagnaSign - 1]! : '', cells.signs[i]);
    for (const event of ['Today', 'Muhurta', 'New Event']) check(`dasha (${event})`, `${id} row ${row.offset}`, row.dashas[0]!.join(','), cells.events[event]?.[i]?.join(','));
  });
}
eph.close();
console.log(`${n} charts`);
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${c} checks, ${f.length} failures${f.length ? '\n  ' + f.join('\n  ') : ''}`);
}
