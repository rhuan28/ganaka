// The planet tables against PL9's printed "36. Declination" and "23. Interpreting Grahas" pages, as the private
// bench reads them: each cell the engine computes, written as PL9 writes it, against the printed one.
// usage: check-planet-info <read.json> [natures.json]
// With natures.json (the core's `natures` option, as PL9's options were set for the print), the engine computes with it.
// The read file stays in the private bench. The words PL9 prints for the avasthas and the elements are matched to
// the engine's states by agreement over all charts: a state shown under two words is a failure.
import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { computePlanetInfo, computeYogaContext, type NatureOptions, type PlanetInfo } from '@reverse/core';
import { loadFixtures } from '../conformance';

const path = process.argv[2];
if (!path) { console.error('usage: check-planet-info <read.json>'); process.exit(2); }
type Read = Record<string, { declination: Record<string, Record<string, string>>; grahas: Record<string, Record<string, string>> }>;
const read = JSON.parse(readFileSync(path, 'utf8')) as Read;
const natures = (process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : {}) as NatureOptions;

const pad = (n: number) => String(n).padStart(2, '0');
// PL9 writes the sign of the value, even where it rounds to zero ("-00:00").
const sec = (v: number) => { const t = Math.round(Math.abs(v) * 3600); return `${v < 0 ? '-' : ''}${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`; };
const min = (v: number) => { const t = Math.round(Math.abs(v) * 60); return `${v < 0 ? '-' : ''}${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };
const abbr = (p: string) => p[0]!.toUpperCase() + p[1];
const NINE = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
const ELEMENT: Record<string, string> = { water: 'Water', fire: 'Fire', earth: 'Earth', air: 'Air', dual: 'Dual', movable: 'Movable', fixed: 'Fixed' };

const eph = await createSwissEphemeris();
const births = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
const failures = new Map<string, string[]>();
const checks = new Map<string, number>();
const fail = (col: string, what: string) => { const l = failures.get(col) ?? []; l.push(what); failures.set(col, l); };
const check = (col: string, chart: string, body: string, mine: string, shown: string | undefined) => {
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if ((shown ?? '') !== mine) fail(col, `${chart} ${body}: engine "${mine}" PL9 "${shown ?? ''}"`);
};
// The words of the avasthas, learnt across the charts.
const words = { av9: new Map<string, Set<string>>(), av12: new Map<string, Set<string>>() };
const learn = (m: Map<string, Set<string>>, state: string | undefined, shown: string | undefined) => {
  if (!state || !shown) return;
  const s = m.get(state) ?? new Set(); s.add(shown); m.set(state, s);
};

let charts = 0;
for (const [chart, cells] of Object.entries(read)) {
  const input = births.get(chart);
  if (!input) { console.log(chart, 'no birth in fixtures'); continue; }
  const info: PlanetInfo = computePlanetInfo(eph, input, {}, { fidelity: 'pl9', natures });
  // The functional nature as /v1/planet-info answers it, the column PL9 prints as "Func."; the yoga context's must agree.
  const functional = info.natures.functional;
  if (JSON.stringify(functional) !== JSON.stringify(computeYogaContext(eph, input, { fidelity: 'pl9', natures }).natures.functional)) fail('natures', `${chart}: planet-info and yoga context differ`);
  charts++;
  for (const [body, c] of Object.entries(cells.declination)) {
    const p = info.points[body as keyof typeof info.points];
    check('Declination', chart, body, sec(p.declination), c.Declination);
    check('Kranti', chart, body, sec(p.kranti), c.Kranti);
    check('Speed (page 36)', chart, body, sec(p.speed), c.Speed);
  }
  for (const body of NINE) {
    const c = cells.grahas[body] ?? {};
    const p = info.points[body];
    check('Declin.', chart, body, min(p.declination), c['Declin.']);
    check('RC', chart, body, `${p.retrograde ? 'R' : ''}${p.combust ? 'c' : ''}`, c.RC);
    // PL9's narrow column cuts a long speed at the right: compare what it printed.
    const speed = `${min(p.speed)}(${p.speedPercent}%)`;
    check('Speed', chart, body, c.Speed && speed.startsWith(c.Speed) ? c.Speed : speed, c.Speed);
    check('V+', chart, body, String(p.ownOrExaltedShadvarga), c['V+']);
    if (p.dominance !== undefined) check('Domin.', chart, body, p.dominance.toFixed(2), c['Domin.']);
    check('Hemmed', chart, body, `${abbr(p.hemmed!.previous)},${abbr(p.hemmed!.next)}`, c.Hemmed);
    check('Fin.D.', chart, body, abbr(p.finalDispositor!), c['Fin.D.']);
    check('Arg', chart, body, String(p.argala), c.Arg);
    if (functional) check('Func.', chart, body, functional[body][0]!.toUpperCase() + functional[body].slice(1), c['Func.']);
    if (p.rays !== undefined) check('Rays', chart, body, p.rays.toFixed(1), c.Rays);
    check('SVdisp', chart, body, p.shadvargaDispositors!.map((d) => `${abbr(d.lord)}(${d.count})`).join(' '), c.SVdisp);
    check('SVelem', chart, body, p.shadvargaElements!.map((e) => `${ELEMENT[e.quality]} (${e.count})`).join(' '), c.SVelem);
    // PL9 cuts the minutes of the Mrityu Bhaga distance.
    if (p.navamshaAge !== undefined) check('age', chart, body, String(p.navamshaAge), c.age);
    check('MB', chart, body, p.mrityuBhaga ? `00:${pad(Math.floor(p.mrityuBhaga.distance * 60))}` : '', c.MB);
    learn(words.av9, p.deeptadi, c.Av9);
    learn(words.av12, p.shayanadi?.state, c.Av12);
    checks.set('Av9', (checks.get('Av9') ?? 0) + 1);
    checks.set('Av12', (checks.get('Av12') ?? 0) + (p.shayanadi ? 1 : 0));
  }
}
eph.close();
for (const [col, m] of [['Av9', words.av9], ['Av12', words.av12]] as const) {
  // Each state must show under one word, and no word may name two states.
  const seen = new Map<string, string>();
  for (const [state, ws] of m) {
    if (ws.size > 1) fail(col, `${state} shown as ${[...ws].join(' / ')}`);
    for (const w of ws) { if (seen.has(w) && seen.get(w) !== state) fail(col, `"${w}" shown for ${seen.get(w)} and ${state}`); seen.set(w, state); }
  }
  console.log(col, 'words:', Object.fromEntries([...m].map(([s, ws]) => [s, [...ws].join('/')])));
}
console.log(`${charts} charts`);
for (const [col, n] of checks) {
  const f = failures.get(col) ?? [];
  console.log(`${col}: ${n} checks, ${f.length} failures${f.length ? '\n  ' + f.slice(0, 6).join('\n  ') : ''}`);
}
