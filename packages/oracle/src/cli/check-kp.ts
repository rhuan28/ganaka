// The KP chart of the reference charts against PL9's KP pages (worksheets 133, 134, 135 and 13) and its KP report, as
// read from PL9's printouts: the Placidus cusps with their lords, the significators, the houses each planet signifies,
// the ruling planets and Fortuna, the horary chart by number and the report's cusps in the KP ayanamsha.
// usage: check-kp <read.json>
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { julianDayUt } from '@reverse/ephemeris/time';
import { computeKpChart, type KpChart } from '@reverse/core';
import { loadFixtures } from '../conformance';

const [readPath] = process.argv.slice(2);
if (!readPath) { console.error('usage: check-kp <read.json>'); process.exit(2); }
type Sig = { cusp: string; lords: string[]; tenantsOccupants: string[]; occupants: string[]; tenantsOwner: string[]; owner: string[] };
type Read = Record<string, {
  grahas?: Record<string, { lords: string[] | null; vstrong: number[]; strong: number[]; normal: number[]; weak: number[] }>;
  significators?: Record<string, Sig>;
  ruling?: Record<string, string>;
  prashna?: { number: number; date: string; time: string; zone: string; latitude: string; longitude: string; significators: Record<string, Sig> };
  bhavaCusps?: Record<string, { cusp: string; lords: string }>;
  reportCusps?: string[];
}>;
const read = JSON.parse(readFileSync(readPath, 'utf8')) as Read;
const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const SHORT: Record<string, string> = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
const NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };
const pad = (n: number) => String(n).padStart(2, '0');
/** "16:30:55 Can": the degree in the sign, rounded to the second. */
const dms = (lon: number) => {
  const s = Math.round(((lon % 30) + 30) % 30 * 3600);
  const sign = SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30 + (s >= 108000 ? 1 : 0)) % 12]!;
  const t = s % 108000;
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)} ${sign}`;
};
/** "16:30 Ca": the Bhavas page cuts the degree in the sign, rounded to the second, to the minute and writes the sign in two letters. */
const minutes = (lon: number) => {
  // Rounded to the second first, as the worksheets print it.
  const l = Math.round(((lon % 360) + 360) % 360 * 3600) / 3600 % 360, m = Math.floor((l % 30) * 60 + 1e-9);
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)} ${['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'][Math.floor(l / 30)]}`;
};
const angle = (s: string) => { const m = /^(\d+)([NSEW])(\d+)'(\d+)$/.exec(s)!; const v = Number(m[1]) + Number(m[3]) / 60 + Number(m[4]) / 3600; return m[2] === 'S' || m[2] === 'W' ? -v : v; };

const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, mine: string, shown: string | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (mine !== (shown ?? '')) { const l = failures.get(col) ?? []; l.push(`${what}: engine "${mine}" PL9 "${shown ?? ''}"`); failures.set(col, l); }
};
const list = (ps: readonly string[]) => ps.map((p) => SHORT[p] ?? p).join(',');
const significators = (tag: string, id: string, kp: KpChart, shown: Record<string, Sig> | undefined) => {
  for (const h of kp.houses) {
    const s = shown?.[String(h.house)], what = `${id} house ${h.house}`;
    check(`${tag} cusp`, what, dms(h.cusp), s?.cusp);
    check(`${tag} cusp lords`, what, list([h.lords.star, h.lords.sub, h.lords.subSub]), s?.lords.join(','));
    check(`${tag} occupants`, what, `${list(h.tenantsOfOccupants)} | ${list(h.occupants)}`, s && `${s.tenantsOccupants.join(',')} | ${s.occupants.join(',')}`);
    check(`${tag} owner`, what, `${list(h.tenantsOfOwner)} | ${list([h.owner])}`, s && `${s.tenantsOwner.join(',')} | ${s.owner.join(',')}`);
  }
};

let n = 0;
for (const [id, cells] of Object.entries(read)) {
  const input = births.get(id);
  if (!input) { console.log(id, 'no birth in fixtures'); continue; }
  n++;
  const kp = computeKpChart(eph, input, {}, { fidelity: 'pl9' });
  significators('worksheet', id, kp, cells.significators);
  for (const [p, x] of Object.entries(kp.planets)) {
    const g = cells.grahas?.[SHORT[p]!];
    check('planet lords', `${id} ${p}`, list([x.lords.star, x.lords.sub, x.lords.subSub]), g?.lords?.join(','));
    const s = x.signifies;
    check('planet houses', `${id} ${p}`, [s.veryStrong, s.strong, s.normal, s.weak].map((l) => l.join(' ')).join(' | '), g && [g.vstrong, g.strong, g.normal, g.weak].map((l) => l.join(' ')).join(' | '));
  }
  if (cells.ruling) {
    const r = kp.ruling, R = cells.ruling;
    check('ruling planets', id, [r.day, r.lagna, r.lagnaStar, r.lagnaSub, r.moonSign, r.moonStar, r.moonSub].map((p) => (p ? NAME[p] : '')).join(','),
      [R.day, R.lagna, R.lagnaNak, R.lagnaSub, R.moonSign, R.moonNak, R.moonSub].join(','));
    const f = dms(r.fortuna).split(' ');
    check('fortuna', id, `${f[1]} ${f[0]}`, R.fortuna);
  }
  if (cells.bhavaCusps) for (const h of kp.houses) {
    const b = cells.bhavaCusps[String(h.house)];
    check('bhavas cusp', `${id} house ${h.house}`, `${minutes(h.cusp)} ${list([h.lords.star, h.lords.sub]).replace(',', '/')}`, b && `${b.cusp} ${b.lords}`);
  }
  if (cells.reportCusps) {
    const r = computeKpChart(eph, input, {}, { fidelity: 'pl9', ayanamsha: 'krishnamurti' });
    r.cusps.forEach((c, i) => check('report cusp (KP ayanamsha)', `${id} house ${i + 1}`, dms(c), cells.reportCusps![i]));
  }
  const P = cells.prashna;
  if (P) {
    const [d, mo, y] = P.date.split('-').map(Number) as [number, number, number];
    const [hh, mi, ss] = P.time.split(':').map(Number) as [number, number, number];
    const [zh, zm, zs] = P.zone.replace('-', '').split(':').map(Number) as [number, number, number];
    // PL9 writes the zone west-positive: -5:30 is five and a half hours east of Greenwich.
    const zone = (P.zone.startsWith('-') ? 1 : -1) * (zh + zm / 60 + (zs ?? 0) / 3600);
    const at = { jdUt: julianDayUt(y, mo, d, hh + mi / 60 + ss / 3600 - zone), latitude: angle(P.latitude), longitudeEast: angle(P.longitude), utcOffsetHours: zone };
    significators('prashna', id, computeKpChart(eph, at, { horary: P.number }, { fidelity: 'pl9' }), P.significators);
  }
}
eph.close();
console.log(`${n} charts`);
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${c} checks, ${f.length} failures${f.length ? '\n  ' + f.slice(0, 6).join('\n  ') : ''}`);
}
