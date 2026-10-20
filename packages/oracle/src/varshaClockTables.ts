import { ageAt, ashtakavarga, combustInTable, computeMuhurta, tajikaChart, type DashaRow, type WorksheetDashaLists, computeTransits, computeVarshaphalaReport, kpLords, type AvSigns, type ChartInput } from '@reverse/core';
import type { Ephemeris } from '@reverse/ephemeris';
import type { VarshaClockShown } from './transitTables';
import { lagnaSpeedAt } from './varshaphalaTables';

// The Varshaphala worksheets of the year the print job's clock is in (TEMPO model, worksheets 64-66 and 74; stage 5G).
// See docs/spec/tempo/varshaphala.md.

const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const SIGNS_FULL = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const DIGNITY = ['', 'Exalt.', 'Moolt.', 'Own', 'Grt.Fr.', 'Frnd.', 'Neutr.', 'Enemy', 'Grt.En.', 'Debil.'];
const TWO: Record<string, string> = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
const AVASTHA: Record<string, string> = { infant: 'Infant', youth: 'Youth', adolescent: 'Adolescent', old: 'Old', dead: 'Dead' };
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashi', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'P.Phalg.', 'U.Phalg.', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'P.Shad.', 'U.Shad.', 'Shravana', 'Dhanish.', 'Shatabh.', 'P.Bhadra.', 'U.Bhadra.', 'Revati'];

export interface VarshaClockComputed {
  returnJdUt: number;
  /** Degrees of the Lagna per day, for the tolerance of what follows it. */
  lagnaSpeed: number;
  points: Record<string, number>;
  rc: Record<string, string>;
  planets: Record<string, { dignity: number; sbRatio: number | null; sbStrong: number | null; vb: number; bindus: number | null; avastha: string }>;
  kakshas: Record<string, { sign: number; bindu: number; lord: string; ash: number; sarva: number }> | null;
  pancha: Record<string, { graha: number; uchcha: number; hudda: number; drekkana: number; navamsha: number; total: number }>;
  offices: Record<string, string>;
  officeStrength: Record<string, number>;
  yearLord: string | null;
  munthaLongitude: number;
  sahams: Record<'natal' | 'annual', Record<string, { longitude: number; lord: string; lagnaBound: boolean }>>;
}

/** The differences known for each chart's worksheets (both printouts show the same year), kept apart in the bench. */
/** The nodes' VB, pending as on the Muhurta page (docs/spec/tempo/muhurta.md). */
export const VARSHA_CLOCK_ALWAYS_PENDING = ['planet rahu vb', 'planet ketu vb'] as const;

/**
 * The differences known for each chart's worksheets (both printouts show the same year), kept apart in the bench: the
 * Sahams the Varshaphala reports already keep apart (docs/spec/tempo/varshaphala.md), here in the natal and annual sets.
 */
export const KNOWN_VARSHA_CLOCK_PENDING: Readonly<Record<string, readonly string[]>> = {
  'ref-0003': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord'],
  'ref-0020': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord'],
  'ref-0039': ['saham annual Mahatmya', 'saham annual Paradesa', 'saham annual Artha', 'saham annual Bandhana', 'saham annual Apamrityu', 'saham annual Labha'],
  'ref-0056': ['saham annual Mahatmya', 'saham annual Paradesa', 'saham annual Artha', 'saham annual Bandhana', 'saham annual Apamrityu', 'saham annual Labha'],
  'ref-0075': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord'],
  'ref-0090': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord', 'saham annual Karyasiddhi', 'saham annual Karyasiddhi lord'],
  'ref-0140': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord'],
  'ref-0143': ['saham annual Mahatmya', 'saham annual Paradesa', 'saham annual Artha', 'saham annual Bandhana', 'saham annual Apamrityu', 'saham annual Labha'],
  'ref-0246': ['saham natal Karyasiddhi', 'saham natal Karyasiddhi lord'],
  'ref-0254': ['saham annual Mahatmya', 'saham annual Paradesa', 'saham annual Artha', 'saham annual Bandhana', 'saham annual Apamrityu', 'saham annual Labha'],
  'ref-0264': ['saham annual Paradesa', 'saham annual Artha', 'saham annual Labha'],
  'ref-0352': ['saham annual Yasa', 'saham annual Paradesa', 'saham annual Artha', 'saham annual Labha'],
};

const LAGNA_FREE_SAHAMS = ['Gaurava', 'Sastra', 'Jadya', 'Karyasiddhi'];

/** What the core gives for the worksheets of a year of age: the annual chart at the birth place, as the reports'. */
export function computeVarshaClockInputs(eph: Ephemeris, natal: ChartInput, years: number): VarshaClockComputed {
  const o = { fidelity: 'pl9' } as const;
  const r = computeVarshaphalaReport(eph, natal, years, o);
  const v = r.varshaphala;
  const at = { ...natal, jdUt: v.jdUt };
  const mu = computeMuhurta(eph, natal, at, { ...o, activity: 'travelling' });
  const tc = tajikaChart(v);
  const pts = v.chart.points as Record<string, { longitude: number } | undefined>;
  const lon = Object.fromEntries(Object.entries(pts).filter(([, p]) => p).map(([k, p]) => [k, p!.longitude]));
  // The annual chart's own Ashtakavarga, as the varga tables of the transits: Rahu the Lagna's chart, Ketu none.
  const av = lon.lagna === undefined ? null : ashtakavarga(Object.fromEntries(['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].map((k) => [k, Math.floor(lon[k]! / 30)])) as AvSigns, {}, 'pl9');
  const planets = Object.fromEntries(Object.entries(mu.planets).map(([p, q]) => [p, {
    dignity: q.dignity, sbRatio: q.shadbalaRatio, sbStrong: q.shadbalaStrong, vb: q.vimshopaka.shadvarga, avastha: q.avastha,
    bindus: !av || p === 'ketu' ? null : av.bhinna[(p === 'rahu' ? 'lagna' : p) as 'sun'][Math.floor(lon[p]! / 30)]!,
  }]));
  const t = computeTransits(eph, natal, { jdUt: v.jdUt, latitude: natal.latitude, longitudeEast: natal.longitudeEast }, o);
  const sahamsOf = (list: typeof r.sahams) => Object.fromEntries((list ?? []).map((s) => [s.name, { longitude: s.longitude, lord: s.lord, lagnaBound: !LAGNA_FREE_SAHAMS.includes(s.name) }]));
  return {
    returnJdUt: v.jdUt, lagnaSpeed: lagnaSpeedAt(eph, at), points: lon,
    // R/c: the Tajika chart's retrograde planets, and combustion as the worksheet tables mark it (the Moon among them).
    rc: Object.fromEntries(Object.keys(mu.planets).map((p) => [p, `${tc.retrograde[p as 'sun'] && p !== 'rahu' && p !== 'ketu' ? 'R' : ''}${combustInTable(p as 'sun', lon[p]!, lon.sun!, (pts[p] as { longitudeSpeed?: number } | undefined)?.longitudeSpeed ?? 0) ? 'c' : ''}` || '-'])),
    planets, kakshas: t.kakshas as never, pancha: r.panchavargeeya,
    offices: (r.lords?.panchadhikaris ?? {}) as Record<string, string>,
    officeStrength: Object.fromEntries(Object.entries(r.panchavargeeya).map(([p, b]) => [p, b.total])),
    yearLord: r.lords?.yearLord ?? null, munthaLongitude: v.munthaLongitude ?? NaN,
    sahams: { natal: sahamsOf(computeVarshaphalaReport(eph, natal, 0, o).sahams), annual: sahamsOf(r.sahams) },
  };
}

const sec = (dms: string) => dms.split(':').map(Number).reduce((t, x) => t * 60 + x, 0);

/**
 * The worksheets against the core. Degrees to the second as truncated (1.5" for the ephemeris; for the Lagna and what
 * follows it, its motion in 1.5 seconds of time); the return to 1.5 s; the Panchavargeeya to the decimal shown, the
 * office bearers' strengths to two; names exactly. The table of worksheet 66 cuts its counted columns (SB count, VB,
 * the bindus) and the avastha differently from chart to chart: they are compared only where the Sun's row holds all
 * of them. `known` lists the differences already known for this chart, by the name of what is compared.
 */
export function verifyVarshaClock(shown: VarshaClockShown, c: VarshaClockComputed, known: readonly string[]): { values: number; failures: string[]; pending: string[] } {
  const failures: string[] = [], pending: string[] = [];
  let values = 0;
  const check = (what: string, ok: boolean, pl9: unknown, core: unknown) => {
    values++;
    if (ok) return;
    (known.includes(what) ? pending : failures).push(`${what}: PL9 ${pl9}, core ${core}`);
  };
  const lagnaSlack = (c.lagnaSpeed * 1.5) / 86400 * 3600;
  const degreeOk = (lon: number, dms: string, slack: number) => { const d = (((lon % 30) + 30) % 30) * 3600 - sec(dms); return d >= -1.5 - slack && d <= 1.5 + slack; };
  const at = Date.parse(shown.returnAt.replace(' ', 'T') + 'Z') / 86400000 + 2440587.5;
  check('return', Math.abs(at - c.returnJdUt) * 86400 <= 1.5, shown.returnAt, c.returnJdUt);
  const full = shown.planets.sun?.ints.length === 3 && shown.planets.sun.avastha !== '-';
  for (const [p, s] of Object.entries(shown.planets)) {
    const lon = c.points[p];
    const slack = p === 'lagna' ? lagnaSlack : 0;
    check(`planet ${p} degree`, lon !== undefined && degreeOk(lon, s!.dms, slack), s!.dms, lon);
    check(`planet ${p} sign`, lon !== undefined && SIGNS[Math.floor(lon / 30)] === s!.sign, s!.sign, lon);
    check(`planet ${p} nakshatra`, lon !== undefined && NAKSHATRAS[Math.floor(lon / (40 / 3))] === s!.nakshatra, s!.nakshatra, lon);
    const kp = (l: number) => { const k = kpLords(l); return `${k.pada},${TWO[k.star]}/${TWO[k.sub]}/${TWO[k.subSub]}`; };
    // The Lagna's KP lords within its motion in 1.5 seconds of time either way.
    const kpSlack = p === 'lagna' ? (c.lagnaSpeed * 1.5) / 86400 : 0;
    check(`planet ${p} kp`, lon !== undefined && [0, -kpSlack, kpSlack].some((d) => kp(lon + d) === s!.kp), s!.kp, lon !== undefined && kp(lon));
    if (p === 'lagna') continue;
    const q = c.planets[p]!;
    check(`planet ${p} rc`, c.rc[p] === s!.rc, s!.rc, c.rc[p]);
    check(`planet ${p} dignity`, DIGNITY[q.dignity] === s!.dignity, s!.dignity, DIGNITY[q.dignity]);
    if (s!.sb !== '-') check(`planet ${p} sb`, q.sbRatio !== null && Math.abs(q.sbRatio - Number(s!.sb)) <= 0.0051, s!.sb, q.sbRatio);
    if (!full) continue;
    const ints = [...s!.ints];
    if (p !== 'rahu' && p !== 'ketu') check(`planet ${p} sbCount`, q.sbStrong === ints.shift(), s!.ints.join(','), q.sbStrong);
    check(`planet ${p} vb`, Math.round(q.vb) === ints.shift(), s!.ints.join(','), q.vb);
    if (p !== 'ketu') check(`planet ${p} bindus`, q.bindus === ints.shift(), s!.ints.join(','), q.bindus);
    check(`planet ${p} avastha`, AVASTHA[q.avastha]!.startsWith(s!.avastha.replace(/\.$/, '')), s!.avastha, q.avastha);
  }
  for (const [p, k] of Object.entries(shown.kakshas)) {
    const m = c.kakshas?.[p];
    check(`kaksha ${p}`, !!m && SIGNS[m.sign] === k!.sign && m.bindu === k!.bindu && m.lord === k!.lord && m.ash === k!.ash && m.sarva === k!.sarva,
      `${k!.sign} ${k!.bindu} ${k!.lord} ${k!.ash} ${k!.sarva}`, m && `${SIGNS[m.sign]} ${m.bindu} ${m.lord} ${m.ash} ${m.sarva}`);
  }
  const parts = ['graha', 'uchcha', 'hudda', 'drekkana', 'navamsha', 'total'] as const;
  for (const [p, vals] of Object.entries(shown.pancha)) {
    vals!.forEach((x, i) => check(`pancha ${p} ${parts[i]}`, Math.abs((c.pancha[p]?.[parts[i]!] ?? NaN) - x) <= 0.05 + 1e-9, x, c.pancha[p]?.[parts[i]!]));
  }
  for (const [office, o] of Object.entries(shown.offices)) {
    check(`office ${office}`, c.offices[office] === o.planet, o.planet, c.offices[office]);
    check(`office ${office} strength`, Math.abs((c.officeStrength[o.planet] ?? NaN) - o.strength) <= 0.005 + 1e-9, o.strength, c.officeStrength[o.planet]);
  }
  if (shown.yearLord !== undefined) check('year lord', c.yearLord === shown.yearLord, shown.yearLord, c.yearLord);
  if (shown.muntha !== undefined) {
    // Rounded to the second, shown to the minute.
    const s = Math.round((((c.munthaLongitude % 30) + 30) % 30) * 3600);
    const text = `${SIGNS[Math.floor(c.munthaLongitude / 30)]} ${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`;
    check('muntha', text === shown.muntha, shown.muntha, text);
  }
  for (const which of ['natal', 'annual'] as const) {
    for (const [name, s] of Object.entries(shown.sahams[which])) {
      const m = c.sahams[which][name];
      check(`saham ${which} ${name}`, !!m && SIGNS_FULL[Math.floor(m.longitude / 30)] === s.sign && degreeOk(m.longitude, s.dms, m.lagnaBound ? lagnaSlack : 0), `${s.sign} ${s.dms}`, m?.longitude);
      check(`saham ${which} ${name} lord`, m?.lord === s.lord, s.lord, m?.lord);
    }
  }
  return { values, failures, pending };
}

/**
 * The lists whose rows stay pending, by chart: the Patyayini's three levels where PL9 leaves out or relabels rows by no
 * rule found (in REF 0269 it prints two parts of 4.57 and 4.44 minutes and leaves out the one of 4.60 between them).
 */
export const KNOWN_VARSHA_LISTS_PENDING: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  ['0003', '0010', '0090', '0143', '0267', '0269', '0270', '0291'].map((id) => [`ref-${id}`, ['patyayini']]),
);

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Each printed list against the core's rows (a list printed again on a later page is named "natal@75"): the lords, and
 * the weekday and date of each start in the birth's clock (a start within 15 seconds of midnight on either day, 60 in
 * the Kalidasa's lists, whose starts the annual Moon fixes up to a minute early). A list that matches only one row off
 * at its start is a border case when the core's second row starts within a minute after the list's start (the pages
 * are drawn with the clock running); otherwise its rows fail. The rows of `pendingLists` that differ
 * are pending. The monthly and daily returns' headers within 25 seconds (PL9 gives them up to 20 seconds before the
 * core: cause not found).
 */
export function verifyVarshaLists(shown: VarshaClockShown, lists: Pick<WorksheetDashaLists, 'rows' | 'starts' | 'returns'>, pendingLists: readonly string[] = []): { values: number; failures: string[]; borders: string[]; pending: string[] } {
  const { rows, starts, returns } = lists as { rows: Partial<Record<string, DashaRow[]>>; starts: Partial<Record<string, number>>; returns: Partial<Record<string, number>> };
  const failures: string[] = [], borders: string[] = [], pending: string[] = [];
  let values = 0;
  const day = (jd: number) => new Date(Math.floor((jd - 2440587.5) * 86400) * 1000);
  const text = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
  const same = (row: { chain: string; weekday: string; date: string }, c: DashaRow | undefined, window: number) => !!c && c.chain.join('-') === row.chain
    && [0, -window, window].some((s) => { const d = day(c.startJdUt + s / 86400); return text(d) === row.date && WEEKDAY[d.getUTCDay()] === row.weekday; });
  for (const [name, list] of Object.entries(shown.lists ?? {})) {
    const base = name.split('@')[0]!;
    const core = rows[base] ?? [];
    const window = name.startsWith('kalidasa') ? 60 : 15;
    values += list.length;
    if (list.every((row, i) => same(row, core[i], window))) continue;
    const start = starts[base], next = core[1]?.startJdUt;
    const nearClock = start !== undefined && next !== undefined && next >= start && (next - start) * 86400 < 60;
    if (nearClock && list.every((row, i) => same(row, core[i + 1], window))) { borders.push(`${name}: the list starts one row off`); continue; }
    list.forEach((row, i) => { if (!same(row, core[i], window)) (pendingLists.includes(name) ? pending : failures).push(`${name} row ${i + 1}: PL9 ${row.chain} ${row.weekday} ${row.date}, core ${core[i] ? `${core[i]!.chain.join('-')} ${text(day(core[i]!.startJdUt))}` : 'none'}`); });
  }
  for (const [which, r] of Object.entries(shown.returns ?? {})) {
    values++;
    const at = Date.parse(r!.at.replace(' ', 'T') + 'Z') / 86400000 + 2440587.5;
    const c = returns[which as 'daily'];
    if (c === undefined || Math.abs(at - c) * 86400 > 25) failures.push(`${which} return: PL9 ${r!.at}, core ${c}`);
  }
  return { values, failures, borders, pending };
}

/**
 * The year of age of the worksheets (64) and the years, months and days of the monthly (75) and daily (81) returns
 * against the core's at the print's clock (`ageAt`, the instant in UT). A value that the core reaches within a minute
 * after the clock is a border case: the pages are drawn with the clock running.
 */
export function verifyVarshaAge(shown: VarshaClockShown, natalJdUt: number, clockJdUt: number): { values: number; failures: string[]; borders: string[] } {
  const failures: string[] = [], borders: string[] = [];
  let values = 0;
  const now = ageAt(natalJdUt, clockJdUt), later = ageAt(natalJdUt, clockJdUt + 1 / 1440);
  const check = (what: string, pl9: number, key: 'years' | 'months' | 'days') => {
    values++;
    if (pl9 === now[key]) return;
    if (pl9 === later[key]) borders.push(`${what}: PL9 ${pl9}, core ${now[key]} at the clock, ${later[key]} a minute later`);
    else failures.push(`${what}: PL9 ${pl9}, core ${now[key]}`);
  };
  check('year', shown.years, 'years');
  const m = shown.returns?.monthly, d = shown.returns?.daily;
  if (m) { check('monthly years', m.years, 'years'); check('monthly months', m.months, 'months'); }
  if (d) { check('daily years', d.years, 'years'); check('daily months', d.months, 'months'); check('daily days', d.days, 'days'); }
  return { values, failures, borders };
}
