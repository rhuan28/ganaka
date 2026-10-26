// The Sade Sati, the Laghu Kalyani Dhayya and Kantaka Saturn, the Mangala Dosha and the gems' lords of the reference
// charts against PL9's Remedies reports, as read from PL9's printouts: each stay's dates (universal time, day first)
// and span, Saturn's and the Sarva's points, the houses of Mars and the three lords, written as PL9 writes them.
// usage: check-remedies <read.json>
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computeRemedies, type SaturnHouse } from '@reverse/core';
import { loadFixtures } from '../conformance';

const [readPath] = process.argv.slice(2);
if (!readPath) { console.error('usage: check-remedies <read.json>'); process.exit(2); }
type Row = { sign: string; start: string | null; end: string | null; span: string | null; points?: [number, number] };
type Read = Record<string, { sadeSati?: Row[][]; kantaka?: Row[][]; mars?: [number, number]; gems?: Record<string, string> }>;
const read = JSON.parse(readFileSync(readPath, 'utf8')) as Read;
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const LORDS: Record<string, string> = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn' };

const eph = await createSwissEphemeris();
const fixtures = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, mine: string, shown: string | null | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (mine !== (shown ?? '')) { const l = failures.get(col) ?? []; l.push(`${what}: engine "${mine}" PL9 "${shown ?? ''}"`); failures.set(col, l); }
};
const day = (jd: number) => { const d = new Date(Math.round((jd - 2440587.5) * 86400000)); return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`; };

let n = 0;
for (const [id, cells] of Object.entries(read)) {
  const input = fixtures.get(id);
  if (!input) { console.log(id, 'no birth in fixtures'); continue; }
  const r = computeRemedies(eph, input, { fidelity: 'pl9' });
  n++;
  const table = (name: string, mine: SaturnHouse[][], shown: Row[][] | undefined) => mine.forEach((cycle, c) => {
    const rows = cycle.flatMap((h) => h.stays.map((s, k) => ({ h, s, k })));
    rows.forEach(({ h, s, k }, i) => {
      const p = shown?.[c]?.[i], what = `${id} cycle ${c + 1} ${SIGNS[h.sign - 1]} ${k + 1}`;
      check(`${name} sign`, what, SIGNS[h.sign - 1]!, p?.sign);
      const date = (jd: number | undefined) => (jd === undefined || jd < input.jdUt ? '' : day(jd));
      check(`${name} dates`, what, `${date(s?.startJdUt)} ${date(s?.endJdUt)}`, `${p?.start ?? ''} ${p?.end ?? ''}`);
      check(`${name} span`, what, s?.span ? `${s.span.years}-${s.span.months}-${s.span.days}` : '', p?.span);
      if (k === 0) check(`${name} points`, what, h.points ? `${h.points.saturn},${h.points.sarva}` : '', p?.points?.join(','));
    });
  });
  table('sade sati', r.sadeSati, cells.sadeSati);
  table('kantaka', r.kantaka, cells.kantaka);
  check('Mars from the Lagna and the Moon', id, `${r.mangala.marsHouseFromLagna},${r.mangala.marsHouseFromMoon}`, cells.mars?.join(','));
  if (r.gems) for (const [k, g] of [['lagnaLord', r.gems.life], ['fifthLord', r.gems.punya], ['ninthLord', r.gems.bhagya]] as const) check('gem lords', `${id} ${k}`, LORDS[g]!, cells.gems?.[k]);
}
eph.close();
console.log(`${n} charts`);
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${c} checks, ${f.length} failures${f.length ? '\n  ' + f.join('\n  ') : ''}`);
}
