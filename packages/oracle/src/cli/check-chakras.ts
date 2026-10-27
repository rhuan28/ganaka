// The transit chakras of the reference charts against PL9's printed pages 114 (Kota), 115 (Sanghatta) and 116
// (Sarvatobhadra), as read from the TEMPO printouts: the Kota score, the Sanghatta's vedha chords and the
// Sarvatobhadra's framed cells. The transits are at the instant the Kota page prints, in Jaipur (PL9's default place,
// its clock 5h30 ahead of UT).
// usage: check-chakras <read.json>...
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { julianDayUt } from '@reverse/ephemeris/time';
import { computeTransits } from '@reverse/core';
import { loadFixtures } from '../conformance';

const paths = process.argv.slice(2);
if (paths.length === 0) { console.error('usage: check-chakras <read.json>...'); process.exit(2); }
type Read = Record<string, { score?: number; at?: string; sanghatta?: [string, number, number][]; sarvatobhadra?: [string, number, number][] }>;
const JAIPUR = { latitude: 26 + 55 / 60, longitudeEast: 75 + 49 / 60 + 40 / 3600 };

const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, ok: boolean, detail: string) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (!ok) { const l = failures.get(col) ?? []; l.push(`${what}: ${detail}`); failures.set(col, l); }
};
const near = (a: number, b: number) => Math.abs((((a - b) % 108) + 162) % 108 - 54) < 0.35;

let n = 0;
for (const path of paths) for (const [id, cells] of Object.entries(JSON.parse(readFileSync(path, 'utf8')) as Read)) {
  const natal = births.get(id);
  if (!natal || !cells.at) continue;
  n++;
  const [date, time] = cells.at.split(' ') as [string, string];
  const [y, mo, d] = date.split('-').map(Number) as [number, number, number];
  const [hh, mi, ss] = time.split(':').map(Number) as [number, number, number];
  const at = { jdUt: julianDayUt(y, mo, d, hh + mi / 60 + ss / 3600 - 5.5), ...JAIPUR };
  const t = computeTransits(eph, natal, at, { fidelity: 'pl9' });
  const what = `${path.slice(-9, -5)} ${id}`;
  check('kota score', what, t.chakras.kota.score === cells.score, `engine ${t.chakras.kota.score} PL9 ${cells.score}`);
  // Each vedha a chord between the transit planet's pada and the natal planet's, drawn once per distinct chord.
  const birth = computeTransits(eph, natal, { jdUt: natal.jdUt, latitude: natal.latitude, longitudeEast: natal.longitudeEast }, { fidelity: 'pl9' }).points;
  const mine = t.chakras.sanghatta.map((v) => [v.benefic ? 'G' : 'R', t.points[v.transit].longitude / (10 / 3), birth[v.natal].longitude / (10 / 3)] as const);
  const shown = cells.sanghatta ?? [];
  const has = (list: readonly (readonly [string, number, number])[], x: readonly [string, number, number]) =>
    list.some((y) => y[0] === x[0] && ((near(x[1], y[1]) && near(x[2], y[2])) || (near(x[1], y[2]) && near(x[2], y[1]))));
  check('sanghatta chords', what, mine.every((x) => has(shown, x)) && shown.every((x) => has(mine, x)), `engine ${mine.map((x) => x.join(' ')).join(', ')} PL9 ${shown.map((x) => x.join(' ')).join(', ')}`);
  const frames = new Set<string>();
  for (const v of t.chakras.sarvatobhadra) for (const [r, c] of v.cells) frames.add(`${v.benefic ? 'G' : 'R'} ${r},${c}`);
  const printed = new Set((cells.sarvatobhadra ?? []).map(([c, r, col]) => `${c} ${r},${col}`));
  check('sarvatobhadra frames', what, [...frames].sort().join('|') === [...printed].sort().join('|'), `engine ${frames.size} PL9 ${printed.size}`);
}
eph.close();
console.log(`${n} printouts`);
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${c} checks, ${f.length} failures${f.length ? '\n  ' + f.slice(0, 10).join('\n  ') : ''}`);
}
