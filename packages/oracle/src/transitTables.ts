import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { clockTime, kpLords, type PanchPakshi } from '@reverse/core';
// The transit lines read from the TEMPO printouts by read-tempo.py (stage 5A): two snapshots per chart,
// "now" (the transit worksheets, at the instant printed on them) and "muhurta" (the Muhurta worksheet, at the
// reference instant).

export const TRANSIT_POINTS = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
export const TRANSIT_PLANETS = TRANSIT_POINTS.slice(1, 8);
export const SNAPSHOTS = ['now', 'muhurta'] as const;
export const GOCHARA_FIELDS = ['tarabala', 'chandrabala', 'tithi', 'karana', 'yoga', 'vimshottari', 'narayana', 'yogini', 'ashtottari'] as const;
const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
export const NAKSHATRA_NAMES = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashi', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'P.Phalg.', 'U.Phalg.', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'P.Shad.', 'U.Shad.',
  'Shravana', 'Dhanish.', 'Shatabh.', 'P.Bhadra.', 'U.Bhadra.', 'Revati'];

export type TransitPointName = (typeof TRANSIT_POINTS)[number];
export type Snapshot = (typeof SNAPSHOTS)[number];
export type GocharaField = (typeof GOCHARA_FIELDS)[number];

export interface TransitSnapshot {
  at?: string; // local time of the place, "yyyy-mm-dd hh:mm:ss"
  place?: { latitude: string; longitude: string; timezone: string };
  pos: Partial<Record<TransitPointName, { dms: string; sign: string; nakshatra: string; retrograde: boolean }>>;
  sb: Partial<Record<TransitPointName, number>>;
  kaksha: Partial<Record<TransitPointName, { sign: string; bindu: 0 | 1; lord: TransitPointName; ash: number; sarva: number }>>;
  gochara: Partial<Record<GocharaField, string>>;
  /** Worksheet 106: the KP lords of each point, "now" only. */
  kp?: Partial<Record<TransitPointName, { pada: number; star: string; sub: string; subSub: string }>>;
  /**
   * Worksheet 120, "muhurta" only: the events "Today" and "Muhurta" (both at the reference date) and the four dashas at
   * each, as the Gochara data writes them ("Ra-Ve-Su-Me-Ve", "Aq-Vi-Sc-Sa-Vi").
   */
  events?: { date: [string, string]; chains: Partial<Record<'vimshottari' | 'yogini' | 'chara' | 'ashtottari', [string, string]>> };
  /** Worksheet 103: the tables of the transit's D9 and D10, "now" only. */
  vargas?: Partial<Record<'D9' | 'D10', Partial<Record<TransitPointName, VargaRowShown>>>>;
  /** Worksheets 64-66 and 74, "now" only: the Varshaphala of the year the print job's clock is in. */
  varsha?: VarshaClockShown;
  /** Worksheet 114, "now" only: each transit planet's place in the Kota Chakra, and the score printed (not compared). */
  kota?: { places: Partial<Record<TransitPointName, number>>; score?: number };
  /** The Panch Pakshi (worksheet 39): the header, and the five yamas of the day and of the night with their parts. */
  pakshi?: PakshiShown;
  /** The transit table of worksheet 106: SB# (the strong Shadbala components; none for the nodes) and VB. */
  sbvb?: Partial<Record<string, { strong: number | null; vb: number | null }>>;
  /** Worksheet 104, "now" only: the month and each event line as printed, day by day. */
  monthCalendar?: { month: string; events: { day: number; time: string; text: string }[] };
  /** Worksheet 8: the sunrise chart's points and its Vimshottari rows, "now" only (the rows start at its clock). */
  sunrise?: SunriseShown;
  /** Worksheet 107: each stay of a planet in a sign in the year of the instant, "mm-dd" ("end": past the year). */
  ingress?: { planet: TransitPointName; sign: string; from: string; to: string; retrograde: boolean }[];
  /**
   * Worksheet 113: the kaksha labels of a month, each at its height on the page turned into days (1.0 = the top of
   * day 1), with the lord and the bindus printed under it (null when none is).
   */
  calendar?: { month: string; marks: { planet: TransitPointName; day: number; lord: TransitPointName; ash: number | null }[] };
}

export interface VargaRowShown { dms: string; sign: string; dignity: string; bindus: number | null; av3: string; av5: string; functional: string; houses: string }

export interface VarshaClockShown {
  years: number;
  /** The return as printed, "yyyy-mm-dd hh:mm:ss" (the birth's clock). */
  returnAt: string;
  planets: Partial<Record<TransitPointName, { dms: string; rc: string; sign: string; nakshatra: string; kp: string; dignity: string; sb: string; ints: number[]; avastha: string }>>;
  kakshas: Partial<Record<TransitPointName, { sign: string; bindu: number; lord: string; ash: number; sarva: number }>>;
  pancha: Partial<Record<TransitPointName, number[]>>;
  offices: Record<string, { planet: string; strength: number }>;
  yearLord?: string;
  muntha?: string;
  sahams: { natal: Record<string, { sign: string; dms: string; lord: string }>; annual: Record<string, { sign: string; dms: string; lord: string }> };
  /** The dasha lists of worksheets 64, 65, 75, 81 and 89, by name: each row's lords ("sun-lagna-sun"), weekday and date. */
  lists?: Record<string, { chain: string; weekday: string; date: string }[]>;
  /** The monthly (75) and daily (81) returns as their headers print them. */
  returns?: Partial<Record<'monthly' | 'daily', { years: number; months: number; days: number; at: string }>>;
}

export interface SunriseShown {
  pos: Partial<Record<TransitPointName, { dm: string; nakshatra: string }>>;
  dasha: { chain: string; weekday: string; date: string }[];
}

export interface TransitShown {
  chart: string;
  snaps: Partial<Record<Snapshot, TransitSnapshot>>;
}

const DMS = /^\d\d:\d\d:\d\d$/;
const has = <T extends string>(list: readonly T[], v: string | undefined): v is T => list.includes(v as T);

export function parseTransits(text: string): TransitShown {
  const out: TransitShown = { chart: '', snaps: {} };
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const fail = (): never => { throw new Error(`line ${i + 1}: "${line}" is not a transit line`); };
    if (f[0] === 'chart') { out.chart = f[1] ?? fail(); return; }
    if (!has(SNAPSHOTS, f[1])) fail();
    const snap = (out.snaps[f[1] as Snapshot] ??= { pos: {}, sb: {}, kaksha: {}, gochara: {} });
    switch (f[0]) {
      case 'at':
        if (!/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(f[2] ?? '')) fail();
        snap.at = f[2]!;
        return;
      case 'place':
        if (f.length !== 5) fail();
        snap.place = { latitude: f[2]!, longitude: f[3]!, timezone: f[4]! };
        return;
      case 'trpos':
        if (!has(TRANSIT_POINTS, f[2]) || !DMS.test(f[3] ?? '') || !SIGNS.includes(f[4]!) || !NAKSHATRA_NAMES.includes(f[5]!) || !['R', '-'].includes(f[6]!)) fail();
        snap.pos[f[2] as TransitPointName] = { dms: f[3]!, sign: f[4]!, nakshatra: f[5]!, retrograde: f[6] === 'R' };
        return;
      case 'trsb':
        if (!has(TRANSIT_PLANETS, f[2]) || !/^\d+\.\d\d$/.test(f[3] ?? '')) fail();
        snap.sb[f[2] as TransitPointName] = Number(f[3]);
        return;
      case 'trkaksha': {
        const [ash, sarva] = [Number(f[6]), Number(f[7])];
        if (!has(TRANSIT_PLANETS, f[2]) || !SIGNS.includes(f[3]!) || !['0', '1'].includes(f[4]!) || !has(TRANSIT_POINTS, f[5])
          || !(Number.isInteger(ash) && ash >= 0 && ash <= 8) || !(Number.isInteger(sarva) && sarva >= 0 && sarva <= 56)) fail();
        snap.kaksha[f[2] as TransitPointName] = { sign: f[3]!, bindu: Number(f[4]) as 0 | 1, lord: f[5] as TransitPointName, ash, sarva };
        return;
      }
      case 'trgochara':
        if (!has(GOCHARA_FIELDS, f[2])) fail();
        snap.gochara[f[2] as GocharaField] = f.slice(3).join('\t');
        return;
      case 'trkp': {
        const lords = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
        if (f[1] !== 'now' || !has(TRANSIT_POINTS, f[2]) || !/^[1-4]$/.test(f[3] ?? '') || ![f[4], f[5], f[6]].every((l) => lords.includes(l!))) fail();
        (snap.kp ??= {})[f[2] as TransitPointName] = { pada: Number(f[3]), star: f[4]!, sub: f[5]!, subSub: f[6]! };
        return;
      }
      case 'event': {
        if (f[1] !== 'muhurta' || f.length !== 5) fail();
        const e = (snap.events ??= { date: ['', ''], chains: {} });
        if (f[2] === 'date') e.date = [f[3]!, f[4]!];
        else if (['vimshottari', 'yogini', 'chara', 'ashtottari'].includes(f[2]!)) e.chains[f[2] as 'chara'] = [f[3]!, f[4]!];
        else fail();
        return;
      }
      case 'trvarga': {
        if (f[1] !== 'now' || !['D9', 'D10'].includes(f[2]!) || !has(TRANSIT_POINTS, f[3]) || f.length !== 12 || !DMS.test(f[4] ?? '') || !SIGNS.includes(f[5]!)
          || !/^(\d|-)$/.test(f[7] ?? '') || !/^\d+\/\d+\/\d+$/.test(f[11] ?? '')) fail();
        const v = ((snap.vargas ??= {})[f[2] as 'D9'] ??= {});
        v[f[3] as TransitPointName] = { dms: f[4]!, sign: f[5]!, dignity: f[6]!, bindus: f[7] === '-' ? null : Number(f[7]), av3: f[8]!, av5: f[9]!, functional: f[10]!, houses: f[11]! };
        return;
      }
      case 'wslist': case 'wsreturn': {
        if (f[1] !== 'now') fail();
        const v = (snap.varsha ??= { years: 0, returnAt: '', planets: {}, kakshas: {}, pancha: {}, offices: {}, sahams: { natal: {}, annual: {} } });
        if (f[0] === 'wslist') {
          if (f.length !== 7 || !/^\d+$/.test(f[3] ?? '') || !/^[a-z]+(-[a-z]+)*$/.test(f[4] ?? '') || !/^\d\d-\d\d-\d{4}$/.test(f[6] ?? '')) fail();
          const list = ((v.lists ??= {})[f[2]!] ??= []);
          if (Number(f[3]) !== list.length + 1) fail();
          list.push({ chain: f[4]!, weekday: f[5]!, date: f[6]! });
        } else {
          if (!['monthly', 'daily'].includes(f[2]!) || f.length !== 7 || !/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(f[6] ?? '')) fail();
          (v.returns ??= {})[f[2] as 'daily'] = { years: Number(f[3]), months: Number(f[4]), days: Number(f[5]), at: f[6]! };
        }
        return;
      }
      case 'wsyear': case 'wsplanet': case 'wskaksha': case 'wspancha': case 'wsoffice': case 'wsyearlord': case 'wsmuntha': case 'wssaham': {
        if (f[1] !== 'now') fail();
        const v = (snap.varsha ??= { years: 0, returnAt: '', planets: {}, kakshas: {}, pancha: {}, offices: {}, sahams: { natal: {}, annual: {} } });
        if (f[0] === 'wsyear') {
          if (!/^\d+$/.test(f[2] ?? '') || !/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(f[3] ?? '')) fail();
          v.years = Number(f[2]); v.returnAt = f[3]!;
        } else if (f[0] === 'wsplanet') {
          if (!has(TRANSIT_POINTS, f[2]) || f.length !== 12 || !DMS.test(f[3] ?? '') || !SIGNS.includes(f[5]!)) fail();
          v.planets[f[2] as TransitPointName] = { dms: f[3]!, rc: f[4]!, sign: f[5]!, nakshatra: f[6]!, kp: f[7]!, dignity: f[8]!, sb: f[9]!, ints: f[10] === '-' ? [] : f[10]!.split(',').map(Number), avastha: f[11]! };
        } else if (f[0] === 'wskaksha') {
          if (!has(TRANSIT_PLANETS, f[2]) || f.length !== 8) fail();
          v.kakshas[f[2] as TransitPointName] = { sign: f[3]!, bindu: Number(f[4]), lord: f[5]!, ash: Number(f[6]), sarva: Number(f[7]) };
        } else if (f[0] === 'wspancha') {
          if (!has(TRANSIT_PLANETS, f[2]) || f.length !== 9 || !f.slice(3).every((x) => /^\d+\.\d$/.test(x))) fail();
          v.pancha[f[2] as TransitPointName] = f.slice(3).map(Number);
        } else if (f[0] === 'wsoffice') {
          if (f.length !== 5 || !/^\d+\.\d\d$/.test(f[4] ?? '')) fail();
          v.offices[f[2]!] = { planet: f[3]!, strength: Number(f[4]) };
        } else if (f[0] === 'wsyearlord') v.yearLord = f[2]!;
        else if (f[0] === 'wsmuntha') v.muntha = f[2]!;
        else {
          if (!['natal', 'annual'].includes(f[2]!) || f.length !== 7 || !DMS.test(f[5] ?? '')) fail();
          v.sahams[f[2] as 'natal'][f[3]!] = { sign: f[4]!, dms: f[5]!, lord: f[6]! };
        }
        return;
      }
      case 'pakshi': case 'pakshiyama': case 'pakshipart': {
        if (f[1] !== 'now') fail();
        const k = (snap.pakshi ??= { weekday: '', half: '', bird: '', ruling: { day: '', night: '' }, dying: '', yamas: { day: [], night: [] } });
        const time = (x: string | undefined) => { if (!/^\d\d:\d\d:\d\d$/.test(x ?? '')) fail(); return x!; };
        if (f[0] === 'pakshi') {
          if (f.length !== 8) fail();
          Object.assign(k, { weekday: f[2]!, half: f[3]!, bird: f[4]!, ruling: { day: f[5]!, night: f[7]! }, dying: f[6]! });
          return;
        }
        if (f[2] !== 'day' && f[2] !== 'night') fail();
        const list = k.yamas[f[2] as 'day'];
        const y = Number(f[3]);
        if (f[0] === 'pakshiyama') {
          if (f.length !== 7 || y !== list.length + 1) fail();
          list.push({ start: time(f[4]), end: time(f[5]), activity: f[6]!, parts: [] });
        } else {
          const yama = list[y - 1];
          if (f.length !== 9 || !yama || Number(f[4]) !== yama.parts.length + 1) fail();
          yama!.parts.push({ bird: f[5]!, activity: f[6]!, relation: f[7]!, time: time(f[8]) });
        }
        return;
      }
      case 'trsbvb':
        if (f[1] !== 'now' || f.length !== 5 || !/^(\d+|-)$/.test(f[3] ?? '') || !/^(\d+|-)$/.test(f[4] ?? '')) fail();
        (snap.sbvb ??= {})[f[2]!] = { strong: f[3] === '-' ? null : Number(f[3]), vb: f[4] === '-' ? null : Number(f[4]) };
        return;
      case 'kota':
        if (f[1] !== 'now' || !has(TRANSIT_POINTS, f[2]) || !/^([1-9]|1\d|2[0-8])$/.test(f[3] ?? '')) fail();
        (snap.kota ??= { places: {} }).places[f[2] as TransitPointName] = Number(f[3]);
        return;
      case 'kotascore':
        if (f[1] !== 'now' || !/^-?\d+(\.\d+)?$/.test(f[2] ?? '')) fail();
        (snap.kota ??= { places: {} }).score = Number(f[2]);
        return;
      case 'calmonth':
        if (f[1] !== 'now' || !/^\d{4}-\d\d$/.test(f[2] ?? '')) fail();
        (snap.monthCalendar ??= { month: '', events: [] }).month = f[2]!;
        return;
      case 'calevent':
        if (f[1] !== 'now' || !/^\d{1,2}$/.test(f[2] ?? '') || !/^\d\d:\d\d$/.test(f[3] ?? '') || !f[4]) fail();
        (snap.monthCalendar ??= { month: '', events: [] }).events.push({ day: Number(f[2]), time: f[3]!, text: f[4]! });
        return;
      case 'srpos':
        if (f[1] !== 'now' || !has(TRANSIT_POINTS, f[2]) || !/^\d\d:\d\d$/.test(f[3] ?? '') || !/^\w+$/.test(f[4] ?? '')) fail();
        (snap.sunrise ??= { pos: {}, dasha: [] }).pos[f[2] as TransitPointName] = { dm: f[3]!, nakshatra: f[4]! };
        return;
      case 'srdasha': {
        const s = (snap.sunrise ??= { pos: {}, dasha: [] });
        if (f[1] !== 'now' || Number(f[2]) !== s.dasha.length + 1 || !/^[a-z]+-[a-z]+$/.test(f[3] ?? '') || !/^\w{3}$/.test(f[4] ?? '') || !/^\d\d-\d\d-\d{4}$/.test(f[5] ?? '')) fail();
        s.dasha.push({ chain: f[3]!, weekday: f[4]!, date: f[5]! });
        return;
      }
      case 'tringress': {
        const day = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (f[1] !== 'now' || !has(TRANSIT_POINTS, f[2]) || !SIGNS.includes(f[3]!) || !day.test(f[4] ?? '') || !(f[5] === 'end' || day.test(f[5] ?? '')) || !['R', '-'].includes(f[6]!)) fail();
        (snap.ingress ??= []).push({ planet: f[2] as TransitPointName, sign: f[3]!, from: f[4]!, to: f[5]!, retrograde: f[6] === 'R' });
        return;
      }
      case 'trcal': {
        if (f[1] !== 'now' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(f[2] ?? '') || !has(TRANSIT_PLANETS, f[3]) || !/^\d+\.\d{3}$/.test(f[4] ?? '')
          || !has(TRANSIT_POINTS, f[5]) || !/^(\d|-)$/.test(f[6] ?? '')) fail();
        snap.calendar ??= { month: f[2]!, marks: [] };
        if (snap.calendar.month !== f[2]) fail();
        snap.calendar.marks.push({ planet: f[3] as TransitPointName, day: Number(f[4]), lord: f[5] as TransitPointName, ash: f[6] === '-' ? null : Number(f[6]) });
        return;
      }
      default:
        fail();
    }
  });
  return out;
}

export interface TransitFixture {
  id: string;
  date: '2000' | '2030'; // the reference date of the Muhurta snapshot
  pl9: TransitShown['snaps'];
  provenance: { program: string; method: string; charts: string; extractedOn: string };
}

const sec = (dms: string) => { const [d, m, s] = dms.split(':').map(Number); return d! * 3600 + m! * 60 + s!; };

/**
 * A snapshot against the core: the positions (PL9 truncates the seconds: the core's may be up to 1.5" above the
 * printed, 0.5" below, for the ephemeris), the retrograde marks of the planets, the kakshas exactly, the Shadbala to
 * half a hundredth, the Tarabala by its name, the Chandrabala exactly, and the dashas given.
 */
export function verifyTransitSnapshot(snap: TransitSnapshot, t: {
  points: Partial<Record<string, { longitude: number; retrograde?: boolean }>>;
  kakshas: Record<string, { sign: number; bindu: number; lord: string; ash: number; sarva: number }> | null;
  shadbalaRatio: Record<string, number> | null;
  tarabala: { name: string };
  chandrabala: { house: number; good: boolean };
}, dashas: Partial<Record<GocharaField, string | null>> = {}): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const [p, v] of Object.entries(snap.pos)) {
    values++;
    // A point the core cannot give (the Lagna beyond the polar circle) fails.
    if (!t.points[p]) { failures.push(`pos ${p}: PL9 ${v!.sign} ${v!.dms}, core none`); continue; }
    const lon = t.points[p]!.longitude;
    const sign = Math.floor(lon / 30);
    const d = (lon - sign * 30) * 3600 - sec(v!.dms);
    const retro = p === 'lagna' || p === 'rahu' || p === 'ketu' ? false : (t.points[p]!.retrograde ?? false);
    if (SIGNS[sign] !== v!.sign || d < -0.5 || d > 1.5) failures.push(`pos ${p}: PL9 ${v!.sign} ${v!.dms}, core ${SIGNS[sign]} ${((lon - sign * 30) * 3600).toFixed(2)}"`);
    else if (retro !== v!.retrograde) failures.push(`R ${p}: PL9 ${v!.retrograde ? 'R' : '-'}, core ${retro ? 'R' : '-'}`);
  }
  for (const [p, k] of Object.entries(snap.kaksha)) {
    values++;
    const c = t.kakshas?.[p];
    if (!c) { failures.push(`kaksha ${p}: PL9 ${k!.sign}, core none`); continue; }
    if (SIGNS[c.sign] !== k!.sign || c.bindu !== k!.bindu || c.lord !== k!.lord || c.ash !== k!.ash || c.sarva !== k!.sarva) {
      failures.push(`kaksha ${p}: PL9 ${k!.sign} ${k!.bindu} ${k!.lord} ${k!.ash} ${k!.sarva}, core ${SIGNS[c.sign]} ${c.bindu} ${c.lord} ${c.ash} ${c.sarva}`);
    }
  }
  for (const [p, v] of Object.entries(snap.sb)) {
    values++;
    const c = t.shadbalaRatio?.[p];
    if (c === undefined) { failures.push(`sb ${p}: PL9 ${v!.toFixed(2)}, core none`); continue; }
    if (!(Math.abs(c - v!) <= 0.005 + 1e-9)) failures.push(`sb ${p}: PL9 ${v!.toFixed(2)}, core ${c.toFixed(4)}`);
  }
  for (const [p, k] of Object.entries(snap.kp ?? {})) {
    values++;
    const lon = t.points[p]?.longitude;
    const c = lon === undefined ? undefined : kpLords(lon);
    if (!c || c.pada !== k!.pada || c.star !== k!.star || c.sub !== k!.sub || c.subSub !== k!.subSub) {
      failures.push(`kp ${p}: PL9 ${k!.pada},${k!.star}/${k!.sub}/${k!.subSub}, core ${c ? `${c.pada},${c.star}/${c.sub}/${c.subSub}` : 'none'}`);
    }
  }
  const g = snap.gochara;
  if (g.tarabala !== undefined) { values++; if (!g.tarabala.startsWith(`${t.tarabala.name}:`)) failures.push(`tarabala: PL9 ${g.tarabala}, core ${t.tarabala.name}`); }
  if (g.chandrabala !== undefined) {
    values++;
    const c = `${t.chandrabala.house} ${t.chandrabala.good ? 'Auspicious' : 'Inauspicious'}`;
    if (g.chandrabala !== c) failures.push(`chandrabala: PL9 ${g.chandrabala}, core ${c}`);
  }
  for (const [s, c] of Object.entries(dashas)) {
    const shown = g[s as GocharaField];
    if (shown === undefined) continue;
    values++;
    if (shown !== c) failures.push(`${s}: PL9 ${shown}, core ${c}`);
  }
  return { values, failures };
}

/**
 * The Events page against the core: the four dashas of both events, each the chain of the core at the events' instant
 * (from the printouts: the events' 06:00 taken as UT, not as Jaipur time).
 */
export function verifyEvents(shown: NonNullable<TransitSnapshot['events']>, core: Partial<Record<'vimshottari' | 'yogini' | 'chara' | 'ashtottari', string | null>>): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const [s, pair] of Object.entries(shown.chains)) {
    pair!.forEach((chain, i) => {
      values++;
      const c = core[s as 'chara'];
      if (chain !== c) failures.push(`event ${i ? 'muhurta' : 'today'} ${s}: PL9 ${chain}, core ${c}`);
    });
  }
  return { values, failures };
}

const DIGNITY_SHOWN = ['', 'Exalt.', 'Moolt.', 'Own', 'Grt.Fr.', 'Frnd.', 'Neutr.', 'Enemy', 'Grt.En.', 'Debil.'];
const JAGRADADI_SHOWN: Record<string, string> = { awake: 'Alr.', dreaming: 'Drm.', sleeping: 'Slp.' };
const BALADI_SHOWN: Record<string, string> = { infant: 'Infant', youth: 'Youth.', adolescent: 'Adoles.', old: 'Old', dead: 'Dead' };

/**
 * The transit's vargas against the core (`vargaTable`): the degree as truncated, within the ephemeris's 1.5" times the
 * varga's parts (plus `slack` seconds of the chart, times the parts); sign, dignity, bindus, the two avasthas,
 * functional nature (the nodes' too) and houses exactly.
 */
export function verifyVargas(shown: NonNullable<TransitSnapshot['vargas']>, core: Partial<Record<'D9' | 'D10', Record<string, {
  degree: number; sign: number; dignity: number; bindus: number | null; jagradadi: string; baladi: string; functional: string | null; houses: number[];
}> | null>>, slack = 0): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const [varga, rows] of Object.entries(shown)) {
    const parts = Number(varga.slice(1));
    for (const [p, r] of Object.entries(rows!)) {
      const c = core[varga as 'D9']?.[p];
      const check = (what: string, ok: boolean, pl9: unknown, mine: unknown) => {
        values++;
        if (!ok) failures.push(`${varga} ${p} ${what}: PL9 ${pl9}, core ${mine}`);
      };
      const d = c ? c.degree * 3600 - sec(r!.dms) : NaN;
      check('degree', d >= -0.5 - slack * parts && d <= (1.5 + slack) * parts + 1, r!.dms, c?.degree);
      check('sign', !!c && SIGNS[c.sign] === r!.sign, r!.sign, c && SIGNS[c.sign]);
      check('dignity', !!c && DIGNITY_SHOWN[c.dignity] === r!.dignity, r!.dignity, c && DIGNITY_SHOWN[c.dignity]);
      check('bindus', !!c && c.bindus === r!.bindus, r!.bindus, c?.bindus);
      check('av3', !!c && JAGRADADI_SHOWN[c.jagradadi] === r!.av3, r!.av3, c?.jagradadi);
      check('av5', !!c && BALADI_SHOWN[c.baladi] === r!.av5, r!.av5, c?.baladi);
      check('functional', !!c && c.functional === r!.functional.toLowerCase(), r!.functional, c?.functional);
      check('houses', !!c && c.houses.join('/') === r!.houses, r!.houses, c?.houses.join('/'));
    }
  }
  return { values, failures };
}

/** The nakshatras as the sunrise chart abbreviates them (from the printouts). */
const NAK3 = ['Ash', 'Bha', 'Kri', 'Roh', 'Mrg', 'Ard', 'Pun', 'Pus', 'Asl', 'Mag', 'PPh', 'UPh', 'Has', 'Cht', 'Swa', 'Vis', 'Anu', 'Jye', 'Mul', 'PSh', 'USh', 'Shr', 'Dha', 'Sat', 'PBh', 'UBh', 'Rev'];
const WEEKDAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The sunrise chart against the core: each point's degree in the sign rounded to the second and shown to the minute, the Lagna within a
 * minute; its nakshatra by the first letters printed (the box may cut them or run its letter into them); the
 * Vimshottari rows from the core's period with the first row's lords and day, one after another, with their weekday
 * and date in the birth's clock (a start within 15 seconds of midnight on either day).
 */
export function verifySunrise(shown: SunriseShown, c: {
  points: Partial<Record<string, { longitude: number }>>;
  periods: { chain: string; start: number }[];
  utcOffsetHours: number;
  /** The instant the list starts at: its first row is the period running then (the first, before it), or the next one when that starts within a minute after. */
  startJdUt?: number;
}): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const [p, v] of Object.entries(shown.pos)) {
    values++;
    const lon = c.points[p]?.longitude;
    const minutes = lon === undefined ? NaN : Math.floor(Math.round(((lon % 30) + 30) % 30 * 3600) / 60);
    const [d, m] = v!.dm.split(':').map(Number);
    const nak = lon === undefined ? '' : NAK3[Math.floor(lon / (40 / 3))]!;
    const nakOk = nak.startsWith(v!.nakshatra) || (v!.nakshatra.length === 4 && v!.nakshatra.slice(0, 3) === nak && /[A-L]/.test(v!.nakshatra[3]!));
    if (!(Math.abs(minutes - (d! * 60 + m!)) <= (p === 'lagna' ? 1 : 0)) || !nakOk) failures.push(`sunrise ${p}: PL9 ${v!.dm} ${v!.nakshatra}, core ${lon === undefined ? 'none' : `${Math.floor(minutes / 60)}:${minutes % 60} ${nak}`}`);
  }
  const day = (jd: number) => new Date(Math.floor((jd - 2440587.5 + c.utcOffsetHours / 24) * 86400) * 1000);
  const text = (jd: number) => { const t = day(jd); return `${String(t.getUTCDate()).padStart(2, '0')}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${t.getUTCFullYear()}`; };
  // A start within 15 seconds of midnight may be printed on either day (REF 0278: 9.5 s before), as on the Muhurta page.
  const shift = (jd: number, date: string) => [0, -15, 15].map((sec) => jd + sec / 86400).find((t) => text(t) === date);
  const from = shown.dasha.length ? c.periods.findIndex((p) => p.chain === shown.dasha[0]!.chain && shift(p.start, shown.dasha[0]!.date) !== undefined) : -1;
  if (c.startJdUt !== undefined && shown.dasha.length) {
    values++;
    // Before the first period (a birth after the clock), the list starts at it.
    const running = c.startJdUt < (c.periods[0]?.start ?? -Infinity) ? 0 : c.periods.findIndex((p, i) => p.start <= c.startJdUt! && (c.periods[i + 1]?.start ?? Infinity) > c.startJdUt!);
    const next = c.periods[running + 1];
    const ok = from === running || (from === running + 1 && next !== undefined && (next.start - c.startJdUt) * 86400 < 60);
    if (!ok) failures.push(`sunrise dasha start: PL9 from ${shown.dasha[0]!.chain}, core from ${c.periods[running]?.chain ?? 'none'}`);
  }
  shown.dasha.forEach((row, i) => {
    values++;
    const p = from < 0 ? undefined : c.periods[from + i];
    const at = p && shift(p.start, row.date);
    if (!p || p.chain !== row.chain || at === undefined || WEEKDAY3[day(at).getUTCDay()] !== row.weekday) {
      failures.push(`sunrise dasha ${i + 1}: PL9 ${row.chain} ${row.weekday} ${row.date}, core ${p ? `${p.chain} ${text(p.start)}` : 'none'}`);
    }
  });
  return { values, failures };
}

/** The Gregorian "mm-dd" of a Julian day, UT. */
function monthDay(jdUt: number): string {
  const d = new Date((jdUt - 2440587.5) * 86400000);
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Each printed stay that starts in the year (not on 1 January) against the core's entry into its sign that year, by its UT day. */
export function verifyIngress(stays: NonNullable<TransitSnapshot['ingress']>, ingresses: { planet: string; sign: number; jdUt: number }[]): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const s of stays) {
    if (s.from === '01-01') continue;
    values++;
    const days = ingresses.filter((e) => e.planet === s.planet && SIGNS[e.sign] === s.sign).map((e) => monthDay(e.jdUt));
    if (!days.includes(s.from)) failures.push(`ingress ${s.planet} ${s.sign}: PL9 ${s.from}, core ${days.join(' ') || 'none'}`);
  }
  return { values, failures };
}

/**
 * The kaksha calendar of a month: each printed label in a computed stretch of the same lord, in order (the label lies
 * in its bar; PL9 leaves short bars unlabelled), and the number under it equal to the stretch's shown bindus.
 */
export function verifyCalendar(marks: NonNullable<TransitSnapshot['calendar']>['marks'], stretches: { planet: string; jdUt: number; lord: string; shownAsh: number }[], monthStartJdUt: number, monthEndJdUt: number): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  const planets = [...new Set(marks.map((m) => m.planet))];
  for (const p of planets) {
    const mine = stretches.filter((s) => s.planet === p);
    let j = 0;
    for (const m of marks.filter((x) => x.planet === p)) {
      values++;
      let k = -1;
      for (let i = j; i < mine.length; i++) {
        const s0 = mine[i]!.jdUt - monthStartJdUt + 1, s1 = (mine[i + 1]?.jdUt ?? monthEndJdUt) - monthStartJdUt + 1;
        if (m.day >= s0 - 0.3 && m.day <= s1 + 0.3 && mine[i]!.lord === m.lord) { k = i; break; }
      }
      if (k < 0) { failures.push(`calendar ${p}: no ${m.lord} stretch at day ${m.day}`); continue; }
      if (m.ash !== null && mine[k]!.shownAsh !== m.ash) failures.push(`calendar ${p} ${m.lord} at day ${m.day}: PL9 ${m.ash}, core ${mine[k]!.shownAsh}`);
      j = k + 1;
    }
  }
  return { values, failures };
}

export function loadTransitFixtures(dir: string): TransitFixture[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as TransitFixture);
}

/** The Kota Chakra's places against the core's (`kotaChakra`); the score is not compared (its rule was not found). */
export function verifyKota(shown: NonNullable<TransitSnapshot['kota']>, core: Partial<Record<string, number>>): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  for (const [p, n] of Object.entries(shown.places)) {
    values++;
    if (core[p] !== n) failures.push(`kota ${p}: PL9 ${n}, core ${core[p]}`);
  }
  return { values, failures };
}

export interface PakshiShown {
  weekday: string;
  half: string;
  bird: string;
  ruling: { day: string; night: string };
  dying: string;
  yamas: Record<'day' | 'night', { start: string; end: string; activity: string; parts: { bird: string; activity: string; relation: string; time: string }[] }[]>;
}

/**
 * The Panch Pakshi against the core's (`panchPakshi`): the header (weekday, fortnight, the native's bird, the ruling
 * birds by day and by night, the dying bird), and each yama's start, end and activity with its parts' birds,
 * activities, relations and starts; the times in the place's clock within two seconds.
 */
export function verifyPakshi(shown: PakshiShown, core: PanchPakshi, utcOffsetHours: number): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  const check = (what: string, pl9: string, mine: string) => { values++; if (pl9 !== mine) failures.push(`pakshi ${what}: PL9 ${pl9}, core ${mine}`); };
  const seconds = (t: string) => { const [h, m, s] = t.split(':').map(Number) as [number, number, number]; return h * 3600 + m * 60 + s; };
  const time = (what: string, pl9: string, jd: number) => {
    values++;
    const mine = Math.round(((jd + 0.5 + utcOffsetHours / 24) % 1) * 86400);
    const d = Math.abs(seconds(pl9) - mine) % 86400;
    if (Math.min(d, 86400 - d) > 2) failures.push(`pakshi ${what}: PL9 ${pl9}, core ${clockTime(jd, utcOffsetHours)}`);
  };
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (shown.weekday) {
    check('weekday', shown.weekday, WEEKDAYS[core.weekday]!);
    check('half', shown.half, core.bright ? 'Bright' : 'Dark');
    check('bird', shown.bird, core.bird);
    check('ruling day', shown.ruling.day, core.ruling.day);
    check('ruling night', shown.ruling.night, core.ruling.night);
    check('dying', shown.dying, core.dying);
  }
  for (const half of ['day', 'night'] as const) {
    shown.yamas[half].forEach((y, i) => {
      const c = core[half][i];
      if (!c) { values++; failures.push(`pakshi ${half} ${i + 1}: core none`); return; }
      time(`${half} ${i + 1} start`, y.start, c.startJdUt);
      time(`${half} ${i + 1} end`, y.end, c.endJdUt);
      check(`${half} ${i + 1} activity`, y.activity, c.activity);
      y.parts.forEach((p, j) => {
        const q = c.parts[j]!;
        check(`${half} ${i + 1}.${j + 1} bird`, p.bird, q.bird);
        check(`${half} ${i + 1}.${j + 1} activity`, p.activity, q.activity);
        check(`${half} ${i + 1}.${j + 1} relation`, p.relation, q.relation);
        time(`${half} ${i + 1}.${j + 1} start`, p.time, q.startJdUt);
      });
    });
  }
  return { values, failures };
}

/**
 * SB# and VB of the transit table (worksheet 106) against the core's (`computeTransits`), where the chart's table has
 * them (some are cut before VB, some before both): SB# exactly, VB to the unit shown (half up). The nodes' VB, which the core's Shadvarga does not give to the unit (as on the Muhurta page), is
 * pending where it differs.
 */
export function verifySbVb(shown: NonNullable<TransitSnapshot['sbvb']>, strong: Partial<Record<string, number>> | null, vb: Partial<Record<string, number>>): { values: number; failures: string[]; pending: string[] } {
  const failures: string[] = [], pending: string[] = [];
  let values = 0;
  for (const [p, row] of Object.entries(shown)) {
    if (row!.strong !== null) {
      values++;
      if (strong?.[p] !== row!.strong) failures.push(`sb# ${p}: PL9 ${row!.strong}, core ${strong?.[p]}`);
    }
    if (row!.vb === null) continue;
    values++;
    const c = vb[p];
    if (c === undefined || Math.abs(c - row!.vb) > 0.5001) failures.push(`vb ${p}: PL9 ${row!.vb}, core ${c?.toFixed(2)}`);
  }
  return { values, failures, pending };
}
