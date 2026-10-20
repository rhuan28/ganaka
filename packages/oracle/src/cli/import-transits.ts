import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOCHARA_FIELDS, parseTransits, SNAPSHOTS, TRANSIT_PLANETS, TRANSIT_POINTS, type TransitFixture } from '../transitTables';

// Imports the raw transit files of one reference date (read-tempo.py) into fixtures-transits/<date>/.
const [rawDir, date, extractedOn] = process.argv.slice(2);
if (!rawDir || (date !== '2000' && date !== '2030') || !/^\d{4}-\d{2}-\d{2}$/.test(extractedOn ?? '')) {
  console.error('usage: import-transits <directory of raw transit files> <2000|2030> <extraction date YYYY-MM-DD>');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = join(root, 'fixtures-transits', date);
mkdirSync(dir, { recursive: true });
let written = 0;
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.txt')).sort()) {
  const shown = parseTransits(readFileSync(join(rawDir, file), 'utf8'));
  const m = /^REF (\d{4})$/.exec(shown.chart);
  if (!m || !file.startsWith(shown.chart)) throw new Error(`${file}: holds "${shown.chart}"`);
  // Every snapshot complete: an incomplete file would silently check fewer values.
  for (const s of SNAPSHOTS) {
    const snap = shown.snaps[s];
    const missing = !snap?.at || TRANSIT_POINTS.some((p) => !snap.pos[p]) || TRANSIT_PLANETS.some((p) => snap.sb[p] === undefined || !snap.kaksha[p])
      || GOCHARA_FIELDS.some((g) => snap.gochara[g] === undefined);
    const nowMissing = s === 'now' && (TRANSIT_POINTS.some((p) => !snap?.kp?.[p] || !snap?.sunrise?.pos[p]) || snap?.sunrise?.dasha.length !== 15
      || (['D9', 'D10'] as const).some((v) => Object.keys(snap?.vargas?.[v] ?? {}).length !== 9));
    const varshaMissing = s === 'now' && (!snap?.varsha?.returnAt || Object.keys(snap.varsha.planets).length !== 10 || Object.keys(snap.varsha.sahams.annual).length !== 37
      || Object.keys(snap.varsha.lists ?? {}).length !== 12 || Object.values(snap.varsha.lists ?? {}).some((l) => l.length !== 15) || !snap.varsha.returns?.monthly || !snap.varsha.returns.daily);
    const calendarMissing = s === 'now' && (!snap?.monthCalendar?.events.length || Object.keys(snap.kota?.places ?? {}).length !== 9
      || Object.keys(snap.sbvb ?? {}).length !== 9 || !snap.pakshi?.bird || (['day', 'night'] as const).some((h) => snap.pakshi!.yamas[h].length !== 5 || snap.pakshi!.yamas[h].some((y) => y.parts.length !== 5)));
    const eventsMissing = s === 'muhurta' && Object.keys(snap?.events?.chains ?? {}).length !== 4;
    if (missing || nowMissing || eventsMissing || varshaMissing || calendarMissing) throw new Error(`${file}: the "${s}" snapshot is incomplete`);
  }
  const fx: TransitFixture = {
    id: `ref-${m[1]}`, date, pl9: shown.snaps,
    provenance: {
      program: "Parashara's Light 9.0", method: 'TEMPO print model, PDF read by read-tempo.py',
      charts: 'refset/xml-tempo (birth rounded to the second, place manual)', extractedOn: extractedOn!,
    },
  };
  writeFileSync(join(dir, `${fx.id}.json`), JSON.stringify(fx, null, 1) + '\n');
  written++;
}
console.log(`${written} transit fixtures written to ${dir}`);
