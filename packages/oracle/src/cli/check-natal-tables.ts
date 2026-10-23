// The varga deities and the degrees within the varga against PL9's printed "38. Planetary deities" and "16. Special"
// pages, as the private bench reads them, and the Shashtiamsha's nature against the planet table's.
// usage: check-natal-tables <tab read.json> [<planet info read.json>]
// Names are compared without case, spaces or punctuation.
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computePlanetInfo, type VargaPoint } from '@reverse/core';
import { loadFixtures } from '../conformance';

const [tabPath, infoPath] = process.argv.slice(2);
if (!tabPath) { console.error('usage: check-natal-tables <tab read.json> [<planet info read.json>]'); process.exit(2); }
type Tab = Record<string, { deities?: Record<string, Record<string, string>>; special?: { title: string; degrees: Record<string, string> } }>;
const tab = JSON.parse(readFileSync(tabPath, 'utf8')) as Tab;
const info = infoPath ? JSON.parse(readFileSync(infoPath, 'utf8')) as Record<string, { grahas: Record<string, Record<string, string>> }> : {};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const pad = (n: number) => String(n).padStart(2, '0');
// PL9's charts round the degree within the varga to the second, then write it with the minutes cut.
const dm = (d: number) => { const m = Math.floor(Math.round(d * 3600) / 60); return `${pad(Math.floor(m / 60) % 30)}:${pad(m % 60)}`; };
const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const checks = new Map<string, number>(), failures = new Map<string, string[]>();
const check = (col: string, what: string, mine: string, shown: string | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (mine !== (shown ?? '')) { const l = failures.get(col) ?? []; l.push(`${what}: engine "${mine}" PL9 "${shown ?? ''}"`); failures.set(col, l); }
};

let charts = 0;
for (const [chart, cells] of Object.entries(tab)) {
  const input = births.get(chart);
  if (!input) { console.log(chart, 'no birth in fixtures'); continue; }
  const r = computePlanetInfo(eph, input, {}, { fidelity: 'pl9' });
  charts++;
  for (const [point, vs] of Object.entries(cells.deities ?? {})) {
    for (const [varga, shown] of Object.entries(vs)) {
      const mine = r.deities[point as VargaPoint]?.[varga as 'D1'];
      check(`deity ${varga}`, `${chart} ${point}`, norm(mine ?? ''), norm(shown));
    }
  }
  const sp = cells.special;
  if (sp) {
    const varga = /^(D\d+)/.exec(sp.title)?.[1] as 'D2' | undefined;
    for (const [point, shown] of Object.entries(sp.degrees)) {
      const d = varga ? r.vargaDegrees[point as VargaPoint]?.[varga] : undefined;
      check(`degree ${varga}`, `${chart} ${point}`, d === undefined ? '' : dm(d), shown);
    }
  }
  for (const [body, c] of Object.entries(info[chart]?.grahas ?? {})) {
    const s = r.points[body as 'sun'].shashtiamsha;
    const nature = /\((B|M)\)/.exec(c.Shastiamsha ?? '')?.[1];
    if (s && nature) check('Shashtiamsha nature', `${chart} ${body}`, s.nature === 'benefic' ? 'B' : 'M', nature);
  }
}
eph.close();
console.log(`${charts} charts`);
for (const [col, n] of [...checks].sort()) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${n} checks, ${f.length} failures${f.length ? '\n  ' + f.slice(0, 6).join('\n  ') : ''}`);
}
