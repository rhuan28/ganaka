// The variants of pages already checked (stage 2J) against PL9's VAR2, TEM2 and CMP2 printouts, as read by
// the bench reader: every North Indian chart drawn (the sign of each point), the return headers, and the
// tables, lists and data blocks the pages print. See docs/spec/time/varshaphala.md ("The variants") and
// docs/spec/time/transits.md.
//
// The clock: the pages that follow the clock print no instant (but the Prashna and the "New Event" data block). The VM's
// clock is the host's (UTC-3), which PL9 takes as Jaipur's (UTC+5:30); the PDF's creation time (UTC) falls while the
// pages are drawn, so a value tied to the clock is accepted at any instant from 5 minutes before the creation time to 3
// after, in steps of 10 seconds (the Lagna moves a degree in four minutes: a sign it enters in that window is a border).
// usage: check-variants <var2.json> <tem2.json> <cmp2.json>
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { SIDEREAL_YEAR, computeAshtakavarga, computeChart, computeDashas, computeTransits, dailyReturn, dashaRows, dashasAt, eventDashas, monthlyReturn, solarReturn, tithiPravesh, vargaTable, worksheetDashaLists, type AnnualPeriod, type Chart, type ChartInput, type VargaName } from '@reverse/core';
import { loadFixtures } from '../conformance';
import { NAKSHATRA_NAMES, verifyEvents, verifyTransitSnapshot, verifyVargas, type TransitSnapshot } from '../transitTables';
import type { VarshaClockShown } from '../transitTables';
import { computeVarshaClockInputs, VARSHA_CLOCK_ALWAYS_PENDING, verifyVarshaClock, verifyVarshaLists } from '../varshaClockTables';

type Drawn = { title: string; points: Record<string, number | null>; wide?: string[] };
type Page = { title: string; drawn?: Drawn[]; headers?: string[]; lists?: { label: string; rows: { chain: string; weekday: string; date: string }[] }[] } & Record<string, unknown>;
type Read = Record<string, { created: string; pages: Record<string, Page>; errors: string[] }>;

const [var2Path, tem2Path, cmp2Path] = process.argv.slice(2);
if (!var2Path || !tem2Path || !cmp2Path) { console.error('usage: check-variants <var2.json> <tem2.json> <cmp2.json>'); process.exit(2); }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const JAIPUR = { latitude: 26 + 55 / 60, longitudeEast: 75 + 49 / 60 + 40 / 3600, utcOffsetHours: 5.5 };
const o = { fidelity: 'pl9' } as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NAME = { lagna: 'lagna', sun: 'sun', moon: 'moon', mars: 'mars', mercury: 'mercury', jupiter: 'jupiter', venus: 'venus', saturn: 'saturn', rahu: 'rahu', ketu: 'ketu', mandi: 'mandi', bhrigu: 'bhrigu' } as const;

const eph = await createSwissEphemeris();
const fixtures = new Map(loadFixtures('fixtures').map((f) => [`REF ${f.id.slice(4)}`, f.input]));
// The VAR2 and TEM2 charts were printed from the copies rounded to the second (refset/xml-tempo). The reference charts
// are saved in UT (time zone 0): their clock is UT.
const tempo = new Map((JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number }[])
  .map((r) => [`REF ${r.id.slice(4)}`, r]));
const tempoBirth = (id: string): ChartInput | undefined => {
  const t = tempo.get(id);
  return t && { jdUt: t.jdUt, latitude: t.latitude, longitudeEast: t.longitudeEast, utcOffsetHours: 0 };
};

const checks = new Map<string, number>(), failures = new Map<string, string[]>(), borders = new Map<string, string[]>();
const check = (col: string, what: string, ok: boolean | 'border', detail: string) => {
  if (ok === false && detail.startsWith('reader:')) ok = 'border';
  checks.set(col, (checks.get(col) ?? 0) + 1);
  if (ok === true) return;
  const into = ok === 'border' ? borders : failures;
  const l = into.get(col) ?? []; l.push(`${what}: ${detail}`); into.set(col, l);
};

const charts = new Map<string, Chart>();
const chartAt = (jdUt: number, place: { latitude: number; longitudeEast: number }) => {
  const key = `${jdUt.toFixed(7)} ${place.latitude} ${place.longitudeEast}`;
  if (!charts.has(key)) charts.set(key, computeChart(eph, { jdUt, latitude: place.latitude, longitudeEast: place.longitudeEast }, o));
  return charts.get(key)!;
};
/** "D:20261027134254" (UTC) to the Julian day of the clock PL9 read, as UT: the host's clock taken for Jaipur's. */
const clockOf = (created: string) => {
  const m = /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/.exec(created);
  if (!m) throw new Error(`creation time "${created}"`);
  return Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!) / 86400000 + 2440587.5 - (3 + 5.5) / 24;
};
const WINDOW = Array.from({ length: 49 }, (_, k) => (k * 10 - 300) / 86400);

/** The varga a drawn chart's title names, D1 when it names none. */
const vargaOf = (title: string): VargaName => (/^D(\d+)\b/.exec(title)?.[0] ?? 'D1') as VargaName;
/** The points of a drawing against a chart: the sign of each point placed. */
const signsDiffer = (d: Drawn, c: Chart, varga: VargaName) => Object.entries(d.points).filter(([p, s]) => s !== null && p in NAME && c.vargas[varga]?.[p as 'sun'] !== s)
  .map(([p, s]) => `${p} PL9 ${s} core ${c.vargas[varga]?.[p as 'sun']}`);
/** A drawing at the clock: some instant of the window gives all its signs; one that needs the window's edge is a border. */
const atClock = (d: Drawn, clock: number, place: { latitude: number; longitudeEast: number }, varga: VargaName): true | 'border' | string => {
  const good = WINDOW.filter((w) => signsDiffer(d, chartAt(clock + w, place), varga).length === 0);
  if (good.length === WINDOW.length || good.length && good.some((w) => Math.abs(w * 86400) <= 60)) return true;
  if (good.length) return 'border';
  return signsDiffer(d, chartAt(clock, place), varga).join(', ');
};

/** The return a header names: "Progression (Jaipur 31/5m/0d) 30 Oct 2026  06:49:39", "Tithi Pravesh (Jaipur 31) ...". */
function returnOf(natal: ChartInput, title: string, clock: number) {
  const m = /^(Progression|Tithi Pravesh) \((Jaipur )?(\d+)(?:\/(\d+)m)?(?:\/(\d+)d)?\)\s*(.*)$/.exec(title);
  if (!m) return null;
  const years = +m[3]!, months = m[4] === undefined ? null : +m[4], days = m[5] === undefined ? null : +m[5];
  const place = m[2] ? JAIPUR : { latitude: natal.latitude, longitudeEast: natal.longitudeEast, utcOffsetHours: natal.utcOffsetHours ?? 0 };
  const jdUt = m[1] === 'Tithi Pravesh' ? tithiPravesh(eph, natal, clock, o)
    : days !== null ? dailyReturn(eph, natal, years, months!, days, 'true', o)
    : months !== null ? monthlyReturn(eph, natal, years, months, 'true', o)
    : solarReturn(eph, natal, years, 'true', o);
  return { kind: m[1]!, years, months, days, place, jdUt, printed: m[6]!.trim() };
}
/** A Julian day in a clock, as the headers print it: "30 Oct 2026  06:49:39". */
const printedAt = (jdUt: number, offsetHours: number) => {
  const t = new Date(Math.round((jdUt - 2440587.5 + offsetHours / 24) * 86400) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}  ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())}`;
};
const secondsOf = (printed: string) => {
  const m = /^(\d{1,2}) (\w{3}) (\d{4}) +(\d\d):(\d\d):(\d\d)$/.exec(printed);
  return m ? Date.UTC(+m[3]!, MONTHS.indexOf(m[2]!), +m[1]!, +m[4]!, +m[5]!, +m[6]!) / 1000 : NaN;
};

/** A drawing's differences: a point placed with a loose block (marked `wide` by the reader) is the reader's border. */
const judged = (d: Drawn, diff: string[]): [boolean | 'border', string] => {
  const reader = diff.filter((x) => d.wide?.includes(x.split(' ')[0]!));
  const engine = diff.filter((x) => !reader.includes(x));
  return engine.length ? [false, engine.join(', ')] : reader.length ? ['border', `reader: ${reader.join(', ')}`] : [true, ''];
};

function checkDrawn(file: string, id: string, n: string, page: Page, natal: ChartInput, clock: number, partner?: ChartInput) {
  const what = `${file} ${id} ${n}`;
  const natalChart = chartAt(natal.jdUt, natal);
  let last: { jdUt: number; place: { latitude: number; longitudeEast: number } } | null = null;
  const event1 = 2451545 - 5.5 / 24; // "Today" set to 1 Jan 2000 12:00, Jaipur
  (page.drawn ?? []).forEach((raw, k) => {
    // A frame without a title takes the labels drawn just above it for one ("BP", "Man"): they are not a title.
    const d = { ...raw, title: raw.title.split(/\s+/).filter((w) => !['Man', 'BP', 'Mun'].includes(w)).join(' ') };
    const varga = vargaOf(d.title);
    const r = returnOf(natal, d.title, clock);
    if (r) {
      last = { jdUt: r.jdUt, place: r.place };
      const diff = signsDiffer(d, chartAt(r.jdUt, r.place), varga);
      // The Muntha drawn: the natal Lagna (at the birth place) moved 30 degrees a mean sidereal year to the return.
      const muntha = d.points.muntha;
      if (muntha !== undefined && muntha !== null && r.kind === 'Progression') {
        const lon = natalChart.points.lagna!.longitude + (30 * (r.jdUt - natal.jdUt)) / SIDEREAL_YEAR;
        if (Math.floor((((lon % 360) + 360) % 360) / 30) !== muntha) diff.push(`muntha PL9 ${muntha} core ${Math.floor((((lon % 360) + 360) % 360) / 30)}`);
      }
      check('drawn returns', `${what} "${d.title}"`, ...judged(d, diff));
      // The header: the instant in the place's clock, to the second where it is printed whole (the monthly and daily
      // returns to 25 seconds, as on worksheets 75 and 81), else its beginning.
      const shown = printedAt(r.jdUt, r.place.utcOffsetHours);
      const whole = /\d\d:\d\d:\d\d$/.test(r.printed);
      const slack = r.months !== null || r.kind === 'Tithi Pravesh' ? 25 : 1.5;
      if (whole) check('return headers', `${what} "${d.title}"`, Math.abs(secondsOf(r.printed) - secondsOf(shown)) <= slack, `core ${shown}`);
      else {
        // A cut header against the core's instant within a second (the seconds' rounding can turn the minute).
        const cut = r.printed.replace(/\s+/g, ' ');
        const ok = [-1, 0, 1].some((s) => printedAt(r.jdUt + s / 86400, r.place.utcOffsetHours).replace(/\s+/g, ' ').startsWith(cut));
        check('return headers', `${what} "${d.title}"`, ok, `core ${shown}`);
      }
      return;
    }
    // A varga of the chart drawn before it on the page ("D9 (Progres...)", "D9 (Tithi P...)").
    if (/^D\d+ \((Progres|Tithi)/.test(d.title) && last) {
      const l = last as { jdUt: number; place: { latitude: number; longitudeEast: number } };
      const diff = signsDiffer(d, chartAt(l.jdUt, l.place), varga);
      check('drawn returns', `${what} "${d.title}"`, ...judged(d, diff));
      return;
    }
    if (['131', '132'].includes(n) && /Today/.test(d.title)) {
      const pr = page.prashnaAt as number | undefined;
      if (pr === undefined) { check('drawn prashna', `${what} "${d.title}"`, false, 'no instant'); return; }
      const diff = signsDiffer(d, chartAt(pr, JAIPUR), varga);
      check('drawn prashna', `${what} "${d.title}"`, ...judged(d, diff));
      return;
    }
    if (d.title === 'Birth Chart' || /^[\d ]+$/.test(d.title) || /^D\d+ \w+\s+\((spouse|strength)\)$/.test(d.title)) {
      // On the composite page the second D9 is the partner's.
      const second = n === '94' && partner && (page.drawn ?? []).slice(0, k).some((e) => e.title === raw.title);
      const diff = signsDiffer(d, second ? chartAt(partner!.jdUt, partner!) : natalChart, varga);
      check('drawn natal', `${what} "${d.title}"`, ...judged(d, diff));
      return;
    }
    if (/^Today/.test(d.title) && ['119', '121'].includes(n)) {
      const diff = signsDiffer(d, chartAt(event1, JAIPUR), varga);
      check('drawn event', `${what} "${d.title}"`, ...judged(d, diff));
      return;
    }
    if (/^(New Event|Gochara)/.test(d.title)) {
      const r2 = atClock(d, clock, JAIPUR, varga);
      check('drawn clock', `${what} "${d.title}"`, r2 === true || r2 === 'border' ? r2 : false, String(r2));
      return;
    }
    if (d.title === '' && ['94', '96'].includes(n) && partner) {
      // The two composite wheels: the native's chart inside the first, the partner's inside the second.
      const c = k === 0 ? natalChart : chartAt(partner.jdUt, partner);
      const diff = signsDiffer(d, c, 'D1');
      check('drawn partner', `${what} wheel ${k + 1}`, ...judged(d, diff));
      return;
    }
    if (d.title === '' && n === '103') {
      // The inner wheels: the natal D9 and D10.
      const diff = signsDiffer(d, natalChart, k === 0 ? 'D9' : 'D10');
      check('drawn natal', `${what} wheel ${k + 1}`, ...judged(d, diff));
      return;
    }
    if (d.title === '' && n === '91') {
      const years = Number((page.headers?.[0] ?? '').match(/\((\d+)\)/)?.[1]);
      const diff = signsDiffer(d, chartAt(solarReturn(eph, natal, years, 'true', o), natal), 'D1');
      check('drawn returns', `${what} annual chart`, ...judged(d, diff));
      return;
    }
    check('drawn unknown', `${what} "${d.title}"`, false, 'title not recognised');
  });
}

// ---- The tables and data blocks ----
const SIGN3 = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const PLANETS7 = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
const KP = /^([1-4]),(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke)\/(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke)\/(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke)$/;
const TWO: Record<string, string> = { Su: 'sun', Mo: 'moon', Ma: 'mars', Me: 'mercury', Ju: 'jupiter', Ve: 'venus', Sa: 'saturn', Ra: 'rahu', Ke: 'ketu' };
const EVENT1 = 2451545 - 5.5 / 24;
/** The charts whose Shadbala falls outside PL9's Cheshta series (docs/reports/conformance.md, "Shadbala"). */
const CHESHTA_OUTSIDE = new Set(['REF 0002', 'REF 0019', 'REF 0243', 'REF 0250']); // "Today" and "Muhurta" set to 1 Jan 2000 12:00, Jaipur

/** A row of a transit planet table ("09:34:05 Lib Swati Roo 1,Ra/Ju/Ve Debil. 1.09 2"): what its words are, by kind. */
function tableRow(words: string[]) {
  const t = [...words];
  const dms = t.shift()!;
  const rc = ['R', 'Rc', 'c', 'cR'].includes(t[0]!) ? t.shift()! : '-';
  const sign = SIGN3.includes(t[0]!) ? t.shift()! : undefined;
  const nakshatra = NAKSHATRA_NAMES.includes(t[0]!) ? t.shift()! : undefined;
  const kpAt = t.findIndex((x) => KP.test(x));
  const kp = kpAt >= 0 ? KP.exec(t[kpAt]!)! : null;
  const rest = kpAt >= 0 ? t.slice(kpAt + 1) : t;
  const sb = rest.find((x) => /^\d+\.\d\d$/.test(x));
  const strong = sb !== undefined ? rest[rest.indexOf(sb) + 1] : undefined;
  return {
    dms, rc, sign, nakshatra, kp: kp && { pada: +kp[1]!, star: TWO[kp[2]!]!, sub: TWO[kp[3]!]!, subSub: TWO[kp[4]!]! },
    sb: sb === undefined ? undefined : +sb, strong: strong !== undefined && /^\d$/.test(strong) ? +strong : undefined,
  };
}
function snapshotOf(table: Record<string, string[]>): TransitSnapshot {
  const snap: TransitSnapshot = { pos: {}, sb: {}, kaksha: {}, gochara: {}, kp: {} };
  for (const [p, words] of Object.entries(table)) {
    const r = tableRow(words);
    if (r.sign && r.nakshatra) snap.pos[p as 'sun'] = { dms: r.dms, sign: r.sign, nakshatra: r.nakshatra, retrograde: r.rc.includes('R') };
    if (r.kp) snap.kp![p as 'sun'] = r.kp;
    if (r.sb !== undefined) snap.sb[p as 'sun'] = r.sb;
  }
  return snap;
}
/** SB# of a table against the core's strong components. */
const strongDiffer = (table: Record<string, string[]>, strong: Partial<Record<string, number>> | null) => Object.entries(table)
  .map(([p, w]) => [p, tableRow(w).strong] as const).filter(([p, s]) => s !== undefined && strong?.[p] !== s)
  .map(([p, s]) => `SB# ${p}: PL9 ${s}, core ${strong?.[p]}`);
const transitsAt = (natal: ChartInput, jdUt: number) => computeTransits(eph, natal, { jdUt, latitude: JAIPUR.latitude, longitudeEast: JAIPUR.longitudeEast }, o);
/**
 * The instants of a window at which a test passes (its failures empty): a scan of the window, then second by second
 * within 30 seconds of its best instant (the Lagna moves 15" a second), else over the whole window by quarter seconds (the
 * clock PL9 reads runs within the second); else the failures at the best instant. With
 * `edges`, a pass only within 30 seconds of the window's ends is a border.
 */
function firstGood(instants: number[], test: (jd: number) => string[], edges = true): { ok: true | 'border'; at: number } | { ok: false; failures: string[] } {
  const scored = instants.map((jd) => ({ jd, f: test(jd) }));
  const best = scored.reduce((a, b) => (b.f.length < a.f.length ? b : a));
  const fine = best.f.length === 0 ? [best] : Array.from({ length: 61 }, (_, s) => best.jd + (s - 30) / 86400).map((jd) => ({ jd, f: test(jd) }));
  // The Moon's D9 moves 5" a second: a table can match for 3 seconds away from the best scan instant; then the whole window.
  const all = (lo: number, hi: number) => Array.from({ length: Math.round((hi - lo) * 86400 * 4) + 1 }, (_, s) => lo + s / 4 / 86400);
  const good = fine.find((x) => x.f.length === 0) ?? all(instants[0]!, instants.at(-1)!).map((jd) => ({ jd, f: test(jd) })).find((x) => x.f.length === 0);
  if (good) {
    const edge = edges && Math.min(Math.abs(good.jd - instants[0]!), Math.abs(good.jd - instants.at(-1)!)) * 86400 < 30;
    return { ok: edge ? 'border' : true, at: good.jd };
  }
  return { ok: false, failures: fine.reduce((a, b) => (b.f.length < a.f.length ? b : a)).f };
}
/** "Tue 27 Oct 2026  10:43:1" (Jaipur's clock, cut to the tens of seconds, or whole): its first instant (UT) and span. */
const localAt = (text: string) => {
  const m = /^\w{3} (\d{1,2}) (\w{3}) (\d{4}) +(\d\d):(\d\d):(\d{1,2})$/.exec(text.trim());
  if (!m) return null;
  const tens = m[6]!.length === 1;
  const at = Date.UTC(+m[3]!, MONTHS.indexOf(m[2]!), +m[1]!, +m[4]!, +m[5]!, tens ? +m[6]! * 10 : +m[6]!) / 86400000 + 2440587.5 - 5.5 / 24;
  return { at, span: tens ? 10 : 1 };
};

function checkData(file: string, id: string, n: string, page: Page, natal: ChartInput, clock: number, partner?: ChartInput) {
  const what = `${file} ${id} ${n}`;
  const window = WINDOW.filter((_, k) => k % 3 === 0).map((w) => clock + w);
  // The transit tables of worksheets 106 and 108, at the clock; the Prashna's at its printed instant.
  const tables = page.pointTables as Record<string, string[]>[] | undefined;
  // Every point of each table read: the transit tables have the Lagna, the natal ones of the partner page do not.
  const expect = n === '96' ? 9 : 10;
  if (tables) (n === '96' ? tables.slice(0, 2) : tables.slice(0, 1)).forEach((t, k) => check('tables read', `${what} table ${k + 1}`, Object.keys(t).length === expect, Object.keys(t).join(' ')));
  if (tables?.length && (n === '106' || n === '108')) {
    const snap = snapshotOf(tables[0]!);
    const r = firstGood(window, (jd) => { const t = transitsAt(natal, jd); return [...verifyTransitSnapshot(snap, t).failures, ...strongDiffer(tables[0]!, t.shadbalaStrong)]; });
    check('transit tables', what, r.ok === false ? false : r.ok, r.ok === false ? r.failures.join('; ') : 'at the window edge');
  }
  if (tables?.length && n === '131') {
    const t = transitsAt(natal, page.prashnaAt as number);
    const f = [...verifyTransitSnapshot(snapshotOf(tables[0]!), t).failures, ...strongDiffer(tables[0]!, t.shadbalaStrong)];
    check('prashna table', what, f.length === 0, f.join('; '));
    const pr = page.prashna as { place: string; zone: string; latitude: string; longitude: string };
    check('prashna place', what, pr.place.startsWith('Jaipur') && pr.zone.startsWith('Timezone: -5:30') && pr.latitude === "Latitude: 26N55'00" && pr.longitude === "Longitude: 75E49'40", JSON.stringify(pr));
  }
  // The natal tables of the partner page (96): degree, nakshatra and SB% of both charts.
  if (tables?.length && n === '96' && partner) {
    tables.slice(0, 2).forEach((table, k) => {
      const who = k === 0 ? natal : partner;
      const t = computeTransits(eph, who, { jdUt: who.jdUt, latitude: who.latitude, longitudeEast: who.longitudeEast }, o);
      const f: string[] = [];
      for (const [p, words] of Object.entries(table)) {
        const lon = t.points[p as 'sun']?.longitude;
        const sec = words[0]!.split(':').map(Number).reduce((a, x) => a * 60 + x, 0);
        const d = lon === undefined ? NaN : (lon % 30) * 3600 - sec;
        if (!(d >= -0.5 && d <= 1.5)) f.push(`${p} ${words[0]} core ${lon}`);
        // This table spells Shatabhisha "Satabhi.", as worksheet 66.
        const nak = words[1] === 'Satabhi.' ? 'Shatabh.' : words[1];
        if (nak && lon !== undefined && NAKSHATRA_NAMES[Math.floor(lon / (40 / 3))] !== nak) f.push(`${p} ${words[1]}`);
        const sb = words[2] && /^\d+\.\d\d$/.test(words[2]) ? +words[2] : undefined;
        // The charts outside PL9's Cheshta series are left out, as in the Shadbala section of the conformance report.
        const outside = CHESHTA_OUTSIDE.has(k === 0 ? id.slice(0, 8) : id.slice(11, 19));
        if (sb !== undefined && !outside && !(Math.abs((t.shadbalaRatio?.[p as 'sun'] ?? NaN) - sb) <= 0.0051)) f.push(`${p} SB ${sb} core ${t.shadbalaRatio?.[p as 'sun']}`);
      }
      check('partner tables', `${what} chart ${k + 1}`, f.length === 0, f.join('; '));
    });
  }
  // Worksheet 103's D9 and D10 tables of the transit, at the clock.
  const vt = page.vargaTables as [string, string, string[]][] | undefined;
  if (vt?.length) {
    const shown: NonNullable<TransitSnapshot['vargas']> = {};
    for (const [varga, p, c] of vt) {
      (shown[varga as 'D9'] ??= {})[p as 'sun'] = { dms: c[0]!, sign: c[1]!, dignity: c[2]!, bindus: c[3] === '-' ? null : +c[3]!, av3: c[4]!, av5: c[5]!, functional: c[6]!, houses: c[7]! };
    }
    const at = (slack: number) => firstGood(window, (jd) => {
      const t = transitsAt(natal, jd);
      const lons = Object.fromEntries(Object.entries(t.points).map(([k, v]) => [k, v!.longitude]));
      return verifyVargas(shown, { D9: vargaTable(lons, 'D9', 'pl9'), D10: vargaTable(lons, 'D10', 'pl9') }, slack).failures;
    });
    // The Moon's D9 matches for 2 seconds and the slow points' bounds close in on it: one instant can miss by half a
    // second; a table that matches with 1" more of the chart is a border.
    const r = at(0);
    const loose = r.ok === false ? at(1) : null;
    if (loose && loose.ok !== false) check('varga tables', what, 'border', `with 1" of slack: ${r.ok === false ? r.failures.join('; ') : ''}`);
    else check('varga tables', what, r.ok === false ? false : r.ok, r.ok === false ? r.failures.join('; ') : 'at the window edge');
  }
  // Worksheet 112: the natal Ashtakavarga by house from the Lagna, and a Prastara from the sign its header starts at.
  const sc = page.sarvaChancha as { grid: number[]; sav: number[]; prastaraPlanet: string; prastaraFrom: number | null; contributors: string[]; prastara: number[][]; total: number[] } | undefined;
  if (sc) {
    const av = computeAshtakavarga(eph, natal, {}, o);
    const lagna = chartAt(natal.jdUt, natal).vargas.D1.lagna!;
    const byHouse = (xs: readonly number[], from: number) => Array.from({ length: 12 }, (_, h) => xs[(from + h) % 12]!);
    check('sarva chancha', `${what} sarva`, byHouse(av.sarva, lagna).join(' ') === sc.sav.join(' '), `PL9 ${sc.sav.join(' ')} core ${byHouse(av.sarva, lagna).join(' ')}`);
    PLANETS7.forEach((p, k) => {
      const shown = sc.grid.slice(k * 12, k * 12 + 12).join(' ');
      check('sarva chancha', `${what} ${p}`, byHouse(av.bhinna[p], lagna).join(' ') === shown, `PL9 ${shown} core ${byHouse(av.bhinna[p], lagna).join(' ')}`);
    });
    const owner = TWO[sc.prastaraPlanet.slice(0, 2)] as 'sun';
    const from = (sc.prastaraFrom ?? 1) - 1;
    sc.contributors.forEach((c, k) => {
      const core = byHouse(av.prastara[owner][c as 'sun'], from);
      const row = sc.prastara[k]!;
      check('sarva chancha', `${what} prastara ${owner} ${c}`, core.join(' ') === row.slice(0, 12).join(' ') && row[12] === core.reduce((a, b) => a + b, 0), `PL9 ${row.join(' ')} core ${core.join(' ')}`);
    });
    const tot = byHouse(av.bhinna[owner], from);
    check('sarva chancha', `${what} prastara total`, tot.join(' ') === sc.total.slice(0, 12).join(' ') && sc.total[12] === tot.reduce((a, b) => a + b, 0), `PL9 ${sc.total.join(' ')} core ${tot.join(' ')}`);
  }
  // The Events table (119): the dashas of both events at 1 Jan 2000 12:00.
  const ev = page.events as [string, string, string][] | null | undefined;
  if (ev && n === '119') {
    const date = ev.find((e) => e[0] === 'date');
    check('events', `${what} date`, date?.[1] === '1 Jan 2000' && date[2] === '1 Jan 2000', JSON.stringify(date));
    const shown = { date: [date?.[1] ?? '', date?.[2] ?? ''] as [string, string], chains: Object.fromEntries(ev.filter((e) => e[0] !== 'date').map((e) => [e[0], [e[1], e[2]] as [string, string]])) };
    const v = verifyEvents(shown, eventDashas(eph, natal, { jdUt: EVENT1, utcOffsetHours: 5.5 }, o));
    check('events', `${what} dashas`, v.failures.length === 0, v.failures.join('; '));
  }
  // The Gochara data, kakshas and Vimshopaka of an event: "Today" at 1 Jan 2000 12:00; "New Event" at the instant its
  // date line prints (to ten seconds).
  for (const prefix of ['Today', 'New Event'] as const) {
    const g = page[`${prefix} gochara`] as Record<string, string> | undefined;
    if (!g) continue;
    const kak = page[`${prefix} kakshas`] as Record<string, [string, string, string, string, string]> | null;
    const vim = page[`${prefix} vimshopaka`] as Record<string, string> | null;
    const snap: TransitSnapshot = {
      pos: {}, sb: {}, gochara: Object.fromEntries(Object.entries(g).filter(([k]) => k !== 'date')),
      kaksha: Object.fromEntries(Object.entries(kak ?? {}).map(([p, k]) => [p, { sign: k[0], bindu: +k[1] as 0 | 1, lord: k[2] as 'sun', ash: +k[3], sarva: +k[4] }])),
    };
    const when = prefix === 'Today' ? { at: EVENT1, span: 1 } : localAt(g.date ?? '');
    if (!when) { check('event data', `${what} ${prefix}`, false, `date "${g.date}"`); continue; }
    if (prefix === 'Today') check('event data', `${what} ${prefix} date`, g.date === 'Sat 1 Jan 2000  12:00:00', `"${g.date}"`);
    const instants = Array.from({ length: when.span }, (_, s) => when.at + s / 86400);
    const r = firstGood(instants, (jd) => {
      const t = transitsAt(natal, jd);
      const f = verifyTransitSnapshot(snap, t, dashasAt(eph, natal, jd, o)).failures;
      // The Vimshopaka rounded to a decimal (an exact half either way).
      for (const [p, v] of Object.entries(vim ?? {})) if (!(Math.abs(t.vimshopaka[p as 'sun'] - +v) <= 0.05 + 1e-9)) f.push(`vimshopaka ${p}: PL9 ${v}, core ${t.vimshopaka[p as 'sun']}`);
      return f;
    }, false);
    check('event data', `${what} ${prefix}`, r.ok === false ? false : r.ok, r.ok === false ? r.failures.join('; ') : 'at the edge');
  }
}

// ---- The Varshaphala variants: the annual chart tables, strengths and lords, and the dasha lists ----
/** The lists each page prints, by the names of the core's (`worksheetDashaLists`), in the order printed. */
const PAGE_LISTS: Record<string, string[]> = {
  '67': ['kalidasa', 'natal'], '68': ['kalidasa4'], '73': ['tithiPravesh', 'natal4'], '76': ['monthly4'], '78': ['monthly', 'natal'],
  '79': ['monthly4'], '82': ['daily4'], '84': ['daily', 'natal'], '85': ['daily4'],
};
/** The "(L)" pages: cast in Jaipur, their clock and returns read in Jaipur's clock, their rows dated in it. */
const LOCAL_PAGES = new Set(['67', '68', '69', '73', '78', '79', '80', '84', '85', '86']);
const utText = (jdUt: number) => new Date(Math.round((jdUt - 2440587.5) * 86400) * 1000).toISOString().slice(0, 19).replace('T', ' ');
const emptyShown = (years: number): VarshaClockShown => ({ years, returnAt: '', planets: {}, kakshas: {}, pancha: {}, offices: {}, sahams: { natal: {}, annual: {} } });

function checkVarsha(id: string, n: string, page: Page, natal: ChartInput, clock: number) {
  const what = `VAR2 ${id} ${n}`;
  // The return from the page's header, or from its first chart's title where the header is cut (84).
  const header = page.headers?.[0] ?? page.drawn?.find((d) => returnOf(natal, d.title, clock))?.title;
  const r = header ? returnOf(natal, header, clock) : null;
  if (!r) {
    // A page with lists or tables and no return read from its header would be passed over.
    if (PAGE_LISTS[n] || page.table || page.pancha) check('varsha headers read', `VAR2 ${id} ${n}`, false, `header "${header ?? ''}"`);
    return;
  }
  const kind = r.kind === 'Tithi Pravesh' ? 'tithi pravesh' : r.days !== null ? 'daily' : r.months !== null ? 'monthly' : 'yearly';
  const table = page.table as Record<string, string[]> | undefined;
  const pancha = page.pancha as Record<string, string[]> | undefined;
  if (r.kind === 'Progression' && (table || pancha)) {
    // The page's chart: its table, kakshas and Panchavargeeya (the return itself is checked with the header).
    const shown: VarshaClockShown = { ...emptyShown(r.years), returnAt: utText(r.jdUt) };
    for (const [p, t] of Object.entries(table ?? {})) {
      shown.planets[p as 'sun'] = { dms: t[0]!, rc: t[1]!, sign: t[2]!, nakshatra: t[3]!, kp: t[4]!, dignity: t[5]!, sb: t[6]!, ints: t[7] === '-' ? [] : t[7]!.split(',').map(Number), avastha: t[8]! };
    }
    for (const [p, k] of Object.entries((page.kakshas as Record<string, string[]> | undefined) ?? {})) {
      shown.kakshas[p as 'sun'] = { sign: k[0]!, bindu: +k[1]!, lord: k[2]!, ash: +k[3]!, sarva: +k[4]! };
    }
    for (const [p, v] of Object.entries(pancha ?? {})) shown.pancha[p as 'sun'] = v.map(Number);
    const v = verifyVarshaClock(shown, computeVarshaClockInputs(eph, natal, r.years, { returnJdUt: r.jdUt, place: r.place }), [...VARSHA_CLOCK_ALWAYS_PENDING]);
    check(`varsha ${kind} tables`, what, v.failures.length === 0, v.failures.join('; '));
  }
  if (r.kind === 'Progression' && page.offices) {
    // The "Year lord" panel is not the page's: PL9 prints the birth-place Varshaphala of the year its print job last
    // set (from the printouts): year 1, the native's own, on 68; on the monthly and daily pages, after the 8 years
    // overview of 70, the last of its years.
    const shown = emptyShown(r.years);
    for (const [office, planet, strength] of page.offices as [string, string, string][]) shown.offices[office] = { planet, strength: +strength };
    shown.yearLord = page.yearLord as string;
    shown.muntha = page.muntha as string;
    // The last year of 70 is the age plus 8, from year 0 (a birth after the clock steps from a negative age).
    const year = n === '68' ? 1 : Math.max(0, Math.floor((clock - natal.jdUt) / SIDEREAL_YEAR) + 8);
    const c = computeVarshaClockInputs(eph, natal, year);
    const v = verifyVarshaClock({ ...shown, returnAt: utText(c.returnJdUt) }, c, []);
    check('varsha lords panel', `${what} (year ${year})`, v.failures.length === 0, v.failures.join('; '));
  }
  const names = PAGE_LISTS[n];
  const lists = page.lists ?? [];
  if (names) check('varsha lists read', what, lists.length === names.length, `${lists.length} lists`);
  if (names && lists.length) {
    const shown: VarshaClockShown = { ...emptyShown(r.years), lists: {} };
    names.forEach((name, k) => { if (lists[k]) shown.lists![name] = lists[k]!.rows; });
    const age = { years: r.years, monthly: { years: r.years, months: r.months ?? 0 }, daily: { years: r.years, months: r.months ?? 0, days: r.days ?? 0 } };
    const local = LOCAL_PAGES.has(n) ? { utcOffsetHours: 5.5 } : undefined;
    // The lists at the clock; the clock printed nowhere, a list that differs is tried with the starts the clock gives
    // moved 5 seconds at a time over the window (a four-level daily part lasts half a minute).
    const base = worksheetDashaLists(eph, natal, { jdUt: clock, utcOffsetHours: 5.5 }, age, o, local);
    const pageClock = clock + 5.5 / 24 - (local ? 5.5 / 24 : 0);
    const test = (shift: number) => {
      const w = { ...base, rows: { ...base.rows }, starts: { ...base.starts } };
      for (const name of names) {
        const k = name as keyof typeof w.rows;
        const start = Math.abs(base.starts[k] - pageClock) < 1e-9 || (name.startsWith('natal') && Math.abs(base.starts[k] - (clock + 5.5 / 24)) < 1e-9) ? base.starts[k] + shift : base.starts[k];
        w.rows[k] = dashaRows(base.periods[k], start, 16, base.gaps[k]);
        w.starts[k] = start;
        // The (L) rows dated in Jaipur's clock; the natal lists in the birth's.
        if (local && !name.startsWith('natal')) {
          w.rows[k] = w.rows[k].map((row) => ({ ...row, startJdUt: row.startJdUt + 5.5 / 24 }));
          w.starts[k] = start + 5.5 / 24;
        }
      }
      return verifyVarshaLists(shown, w).failures;
    };
    const at = test(0);
    const shifts = Array.from({ length: 97 }, (_, k) => (k * 5 - 300) / 86400);
    const good = at.length === 0 ? 0 : shifts.find((x) => test(x).length === 0);
    check(`varsha ${kind} lists`, what, good !== undefined, at.slice(0, 3).join('; '));
  }
}

/** The partner pages' Vimshottari lists (94, 96): four levels of each chart, from the clock. */
function checkPartnerLists(id: string, n: string, page: Page, natal: ChartInput, partner: ChartInput, clock: number) {
  const lists = page.lists ?? [];
  [natal, partner].forEach((who, k) => {
    check('partner lists read', `CMP2 ${id} ${n} chart ${k + 1}`, !!lists[k], 'not read');
    const list = lists[k];
    if (!list) return;
    const tree = computeDashas(eph, who, { system: 'vimshottari', levels: 4, cycles: 3 }, o).periods.map(function conv(p): AnnualPeriod {
      return { lord: p.lord as AnnualPeriod['lord'], startJdUt: p.start, endJdUt: p.end, sub: (p.sub ?? []).map(conv) };
    });
    const shown: VarshaClockShown = { years: 0, returnAt: '', planets: {}, kakshas: {}, pancha: {}, offices: {}, sahams: { natal: {}, annual: {} }, lists: { natal4: list.rows } };
    // As the natal lists of the Varshaphala worksheets: from the clock read as UT.
    const test = (jd: number) => { const start = jd + 5.5 / 24; return verifyVarshaLists(shown, { rows: { natal4: dashaRows(tree, start, 16) } as never, starts: { natal4: start } as never, returns: {} as never }).failures; };
    const res = test(clock).length === 0 ? { ok: true as const } : firstGood(WINDOW.filter((_, j) => j % 3 === 0).map((w) => clock + w), test);
    check('partner lists', `CMP2 ${id} ${n} chart ${k + 1}`, res.ok === false ? false : res.ok, 'failures' in res ? res.failures.slice(0, 3).join('; ') : 'at the window edge');
  });
}

for (const [file, path] of [['VAR2', var2Path], ['TEM2', tem2Path], ['CMP2', cmp2Path]] as const) {
  const read = JSON.parse(readFileSync(path, 'utf8')) as Read;
  // A page that most of the model's PDFs carry and one leaves out (not read, or skipped by the reader) fails here.
  const seen = new Map<string, number>();
  for (const r of Object.values(read)) for (const n of Object.keys(r.pages)) seen.set(n, (seen.get(n) ?? 0) + 1);
  const expected = [...seen].filter(([, c]) => c >= 0.9 * Object.keys(read).length).map(([n]) => n);
  for (const [name, r] of Object.entries(read)) {
    const missing = expected.filter((n) => !r.pages[n]);
    check('pages present', `${file} ${name}`, missing.length === 0, `missing ${missing.join(', ')}`);
    const pair = /^(REF \d{4}) x (REF \d{4})(-f)?$/.exec(name);
    const id = pair ? pair[1]! : name;
    const natal = file === 'CMP2' ? fixtures.get(id) : tempoBirth(id);
    const partner = pair ? fixtures.get(pair[2]!) : undefined;
    if (!natal) { check('charts', name, false, 'no birth'); continue; }
    for (const e of r.errors) check('pages read', `${file} ${name}`, false, e);
    const clock = clockOf(r.created);
    for (const [n, page] of Object.entries(r.pages)) {
      if (n === '131' && page.prashna) {
        const p = page.prashna as { date: string; time: string };
        const [dd, mm, yy] = p.date.split(' ')[1]!.split('-').map(Number) as [number, number, number];
        const [h, mi, s] = p.time.split(':').map(Number) as [number, number, number];
        page.prashnaAt = Date.UTC(yy, mm - 1, dd, h, mi, s) / 86400000 + 2440587.5 - 5.5 / 24;
        read[name]!.pages['132'] && (read[name]!.pages['132']!.prashnaAt = page.prashnaAt);
      }
      checkDrawn(file, name, n, page, natal, clock, partner);
      checkData(file, name, n, page, natal, clock, partner);
      if (file === 'VAR2') checkVarsha(name, n, page, natal, clock);
      if (file === 'CMP2' && partner && ['94', '96'].includes(n)) checkPartnerLists(name, n, page, natal, partner, clock);
    }
  }
}
eph.close();
for (const [col, c] of [...checks].sort()) {
  const f = failures.get(col) ?? [], b = borders.get(col) ?? [];
  if (f.length) process.exitCode = 1;
  console.log(`${col}: ${c} checks, ${f.length} failures, ${b.length} borders${f.length ? '\n  ' + f.slice(0, 12).join('\n  ') : ''}${b.length ? '\n  border: ' + b.slice(0, 12).join('\n  border: ') : ''}`);
}
